/**
 * In-memory log storage for Gemini case generation
 * Stores logs in a circular buffer to prevent memory overflow
 */

export interface GeminiLog {
  id: string;
  timestamp: Date;
  type: 'REQUEST' | 'RESPONSE' | 'ERROR';
  userId?: string;
  sessionId?: string;
  jobTitle?: string;
  company?: string;
  skills?: string[];
  prompt?: string;
  promptLength?: number;
  response?: any;
  responseTime?: number;
  error?: string;
  metadata?: Record<string, any>;
}

class LogStore {
  private logs: GeminiLog[] = [];
  private readonly maxLogs = 100; // Keep last 100 logs

  addLog(log: Omit<GeminiLog, 'id' | 'timestamp'>): void {
    const newLog: GeminiLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.logs.unshift(newLog); // Add to beginning

    // Remove old logs if exceeding limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(limit?: number): GeminiLog[] {
    return limit ? this.logs.slice(0, limit) : this.logs;
  }

  getLogById(id: string): GeminiLog | undefined {
    return this.logs.find(log => log.id === id);
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogStats(): {
    total: number;
    requests: number;
    responses: number;
    errors: number;
    averageResponseTime: number;
  } {
    const stats = {
      total: this.logs.length,
      requests: 0,
      responses: 0,
      errors: 0,
      totalResponseTime: 0,
      responseCount: 0,
    };

    this.logs.forEach(log => {
      if (log.type === 'REQUEST') stats.requests++;
      if (log.type === 'RESPONSE') {
        stats.responses++;
        if (log.responseTime) {
          stats.totalResponseTime += log.responseTime;
          stats.responseCount++;
        }
      }
      if (log.type === 'ERROR') stats.errors++;
    });

    return {
      total: stats.total,
      requests: stats.requests,
      responses: stats.responses,
      errors: stats.errors,
      averageResponseTime: stats.responseCount > 0
        ? Math.round(stats.totalResponseTime / stats.responseCount)
        : 0,
    };
  }
}

// Singleton instance
export const geminiLogStore = new LogStore();