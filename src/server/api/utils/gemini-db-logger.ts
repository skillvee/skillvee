import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

interface GeminiLogRequest {
  userId?: string;
  sessionId?: string;
  endpoint: string;
  prompt: string;
  jobTitle?: string;
  company?: string;
  skills?: string[];
  modelUsed: string;
  metadata?: Record<string, any>;
}

interface GeminiLogResponse {
  logId: string;
  response?: any;
  responseTime?: number;
  success: boolean;
  errorMessage?: string;
}

export class GeminiDbLogger {
  private static instance: GeminiDbLogger;

  private constructor() {}

  static getInstance(): GeminiDbLogger {
    if (!GeminiDbLogger.instance) {
      GeminiDbLogger.instance = new GeminiDbLogger();
    }
    return GeminiDbLogger.instance;
  }

  /**
   * Log a Gemini API request and prepare for response
   */
  async logRequest(data: GeminiLogRequest): Promise<string> {
    try {
      const log = await db.geminiApiLog.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          endpoint: data.endpoint,
          prompt: data.prompt,
          promptLength: data.prompt.length,
          jobTitle: data.jobTitle,
          company: data.company,
          skills: data.skills || [],
          modelUsed: data.modelUsed,
          success: false, // Will be updated when response is received
          metadata: data.metadata as Prisma.JsonValue,
        },
      });

      return log.id;
    } catch (error) {
      console.error("[GeminiDbLogger] Failed to log request:", error);
      // Return a placeholder ID so the process can continue
      return "error-logging-request";
    }
  }

  /**
   * Update log with response data
   */
  async logResponse(data: GeminiLogResponse): Promise<void> {
    // Skip if we couldn't create the initial log
    if (data.logId === "error-logging-request") {
      return;
    }

    try {
      await db.geminiApiLog.update({
        where: { id: data.logId },
        data: {
          response: data.response as Prisma.JsonValue,
          responseTime: data.responseTime,
          success: data.success,
          errorMessage: data.errorMessage,
        },
      });
    } catch (error) {
      console.error("[GeminiDbLogger] Failed to log response:", error);
    }
  }

  /**
   * Get logs for a specific user
   */
  async getUserLogs(userId: string, limit = 50) {
    try {
      return await db.geminiApiLog.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: limit,
      });
    } catch (error) {
      console.error("[GeminiDbLogger] Failed to get user logs:", error);
      return [];
    }
  }

  /**
   * Get logs for a specific session
   */
  async getSessionLogs(sessionId: string) {
    try {
      return await db.geminiApiLog.findMany({
        where: { sessionId },
        orderBy: { timestamp: "asc" },
      });
    } catch (error) {
      console.error("[GeminiDbLogger] Failed to get session logs:", error);
      return [];
    }
  }

  /**
   * Get all logs with pagination
   */
  async getAllLogs(limit = 100, offset = 0) {
    try {
      const [logs, total] = await Promise.all([
        db.geminiApiLog.findMany({
          orderBy: { timestamp: "desc" },
          take: limit,
          skip: offset,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            practiceSession: {
              select: {
                id: true,
                sessionType: true,
                jobTitle: true,
                company: true,
              },
            },
          },
        }),
        db.geminiApiLog.count(),
      ]);

      return { logs, total };
    } catch (error) {
      console.error("[GeminiDbLogger] Failed to get all logs:", error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get log by ID
   */
  async getLogById(logId: string) {
    try {
      return await db.geminiApiLog.findUnique({
        where: { id: logId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          practiceSession: {
            select: {
              id: true,
              sessionType: true,
              jobTitle: true,
              company: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("[GeminiDbLogger] Failed to get log by ID:", error);
      return null;
    }
  }

  /**
   * Get log statistics
   */
  async getStats() {
    try {
      const [total, successCount, errorCount, avgResponseTime] = await Promise.all([
        db.geminiApiLog.count(),
        db.geminiApiLog.count({ where: { success: true } }),
        db.geminiApiLog.count({ where: { success: false } }),
        db.geminiApiLog.aggregate({
          _avg: { responseTime: true },
          where: { responseTime: { not: null } },
        }),
      ]);

      const endpointStats = await db.geminiApiLog.groupBy({
        by: ["endpoint"],
        _count: true,
        _avg: {
          responseTime: true,
        },
      });

      return {
        total,
        successful: successCount,
        failed: errorCount,
        averageResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
        byEndpoint: endpointStats.map(stat => ({
          endpoint: stat.endpoint,
          count: stat._count,
          averageResponseTime: Math.round(stat._avg.responseTime || 0),
        })),
      };
    } catch (error) {
      console.error("[GeminiDbLogger] Failed to get stats:", error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        byEndpoint: [],
      };
    }
  }

  /**
   * Clean up old logs (older than 30 days)
   */
  async cleanupOldLogs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await db.geminiApiLog.deleteMany({
        where: {
          timestamp: { lt: thirtyDaysAgo },
        },
      });

      console.log(`[GeminiDbLogger] Cleaned up ${result.count} old logs`);
      return result.count;
    } catch (error) {
      console.error("[GeminiDbLogger] Failed to cleanup old logs:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const geminiDbLogger = GeminiDbLogger.getInstance();