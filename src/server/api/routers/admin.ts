import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { geminiLogStore } from "../utils/log-store";
import { geminiDbLogger } from "../utils/gemini-db-logger";

export const adminRouter = createTRPCRouter({
  /**
   * Get Gemini generation logs from database
   */
  getGeminiLogs: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }))
    .query(async ({ input }) => {
      const { logs, total } = await geminiDbLogger.getAllLogs(input.limit, input.offset);
      const stats = await geminiDbLogger.getStats();

      // Transform database logs to match the expected format for the UI
      const transformedLogs = logs.map(log => ({
        id: log.id,
        type: log.success ? 'RESPONSE' : 'ERROR',
        timestamp: log.timestamp,
        jobTitle: log.jobTitle,
        company: log.company,
        skills: log.skills,
        prompt: log.prompt,
        promptLength: log.promptLength,
        response: log.response,
        responseTime: log.responseTime,
        error: log.errorMessage,
        metadata: log.metadata,
        userId: log.userId,
        sessionId: log.sessionId,
      }));

      return {
        logs: transformedLogs,
        stats: {
          total: stats.total,
          requests: stats.total - stats.failed,
          responses: stats.successful,
          errors: stats.failed,
          averageResponseTime: stats.averageResponseTime,
          ...stats,
        },
        totalCount: total,
      };
    }),

  /**
   * Get a specific log by ID from database
   */
  getGeminiLogById: adminProcedure
    .input(z.object({
      logId: z.string(),
    }))
    .query(async ({ input }) => {
      const log = await geminiDbLogger.getLogById(input.logId);
      if (!log) {
        throw new Error(`Log not found: ${input.logId}`);
      }
      
      // Transform to match expected format
      return {
        id: log.id,
        type: log.success ? 'RESPONSE' : 'ERROR',
        timestamp: log.timestamp,
        jobTitle: log.jobTitle,
        company: log.company,
        skills: log.skills,
        prompt: log.prompt,
        promptLength: log.promptLength,
        response: log.response,
        responseTime: log.responseTime,
        error: log.errorMessage,
        metadata: log.metadata,
        userId: log.userId,
        sessionId: log.sessionId,
        user: log.user,
        practiceSession: log.practiceSession,
      };
    }),

  /**
   * Clear old logs (older than 30 days) from database
   */
  clearGeminiLogs: adminProcedure
    .mutation(async () => {
      const clearedCount = await geminiDbLogger.cleanupOldLogs();
      // Also clear in-memory logs
      geminiLogStore.clearLogs();
      return { success: true, message: `Cleared ${clearedCount} old logs (>30 days)` };
    }),

  /**
   * Get log statistics from database
   */
  getGeminiLogStats: adminProcedure
    .query(async () => {
      const stats = await geminiDbLogger.getStats();
      return {
        total: stats.total,
        requests: stats.total - stats.failed,
        responses: stats.successful,
        errors: stats.failed,
        averageResponseTime: stats.averageResponseTime,
        byEndpoint: stats.byEndpoint,
      };
    }),
});