import { createError } from "../types/errors";

/**
 * Rate limiting middleware for tRPC procedures
 */

interface TRPCContext {
  userId?: string | null;
  headers?: Headers | Record<string, string>;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (ctx: TRPCContext) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  onLimitReached?: (ctx: TRPCContext, limit: RateLimitInfo) => void; // Callback when limit is reached
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  total: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number; requests: number[] }>();

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Default key generator based on user ID and IP
 */
function defaultKeyGenerator(ctx: TRPCContext): string {
  const userId = ctx.userId ?? "anonymous";
  const headers = ctx.headers;
  const ip = headers instanceof Headers 
    ? (headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "unknown")
    : (headers?.["x-forwarded-for"] ?? headers?.["x-real-ip"] ?? "unknown");
  return `${userId}:${ip}`;
}

/**
 * Create rate limit middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    onLimitReached,
  } = config;

  return async function rateLimitMiddleware(opts: { ctx: TRPCContext; next: () => Promise<unknown> }): Promise<unknown> {
    const { ctx, next } = opts;
    const key = keyGenerator(ctx);
    const now = Date.now();
    const resetTime = now + windowMs;

    // Get or create rate limit data
    let rateLimitData = rateLimitStore.get(key);
    if (!rateLimitData || rateLimitData.resetTime < now) {
      rateLimitData = {
        count: 0,
        resetTime,
        requests: [],
      };
      rateLimitStore.set(key, rateLimitData);
    }

    // Clean old requests from the sliding window
    rateLimitData.requests = rateLimitData.requests.filter(
      (requestTime) => requestTime > now - windowMs
    );

    // Check if limit is exceeded
    if (rateLimitData.requests.length >= maxRequests) {
      const limitInfo: RateLimitInfo = {
        limit: maxRequests,
        remaining: 0,
        reset: new Date(rateLimitData.resetTime),
        total: rateLimitData.requests.length,
      };

      if (onLimitReached) {
        onLimitReached(ctx, limitInfo);
      }

      throw createError.rateLimit(maxRequests, `${windowMs / 1000}s`);
    }

    // Add current request to the window
    rateLimitData.requests.push(now);

    try {
      const result = await next();
      
      // If configured to skip successful requests, remove this request
      if (skipSuccessfulRequests) {
        rateLimitData.requests.pop();
      }
      
      return result;
    } catch (error) {
      // If configured to skip failed requests, remove this request
      if (skipFailedRequests) {
        rateLimitData.requests.pop();
      }
      
      throw error;
    }
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Very strict - for sensitive operations
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },

  // Moderate - for API calls
  moderate: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },

  // Lenient - for regular operations
  lenient: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },

  // File uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },

  // AI operations (expensive)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },

  // Authentication
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },

  // Search operations
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
  },
} as const;

/**
 * Create user-specific rate limiters
 */
export function createUserRateLimit(userId: string, config: RateLimitConfig) {
  return createRateLimit({
    ...config,
    keyGenerator: () => `user:${userId}`,
  });
}

/**
 * Create IP-based rate limiters
 */
export function createIPRateLimit(config: RateLimitConfig) {
  return createRateLimit({
    ...config,
    keyGenerator: (ctx: TRPCContext) => {
      const headers = ctx.headers;
      const ip = headers instanceof Headers 
        ? (headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "unknown")
        : (headers?.["x-forwarded-for"] ?? headers?.["x-real-ip"] ?? "unknown");
      return `ip:${ip}`;
    },
  });
}

/**
 * Create endpoint-specific rate limiters
 */
export function createEndpointRateLimit(endpoint: string, config: RateLimitConfig) {
  return createRateLimit({
    ...config,
    keyGenerator: (ctx: TRPCContext) => {
      const userId = ctx.userId ?? "anonymous";
      return `endpoint:${endpoint}:${userId}`;
    },
  });
}

/**
 * Adaptive rate limiting based on user role
 */
export function createAdaptiveRateLimit(config: {
  admin: RateLimitConfig;
  user: RateLimitConfig;
  anonymous: RateLimitConfig;
}) {
  return async function adaptiveRateLimitMiddleware(opts: { ctx: TRPCContext; next: () => Promise<unknown> }) {
    const { ctx } = opts;
    
    let rateLimitConfig: RateLimitConfig;
    
    if (!ctx.userId) {
      rateLimitConfig = config.anonymous;
    } else {
      // Get user role (you'll need to fetch this from your database)
      const userRole = await getUserRole(ctx.userId);
      rateLimitConfig = userRole === "ADMIN" ? config.admin : config.user;
    }

    const rateLimitMiddleware = createRateLimit(rateLimitConfig);
    return rateLimitMiddleware(opts);
  };
}

/**
 * Burst rate limiting - allows burst of requests but enforces sustained rate
 */
export function createBurstRateLimit(config: {
  burstLimit: number; // Number of requests allowed in burst
  sustainedLimit: number; // Sustained requests per window
  windowMs: number;
  burstWindowMs: number;
}) {
  const { burstLimit, sustainedLimit, windowMs, burstWindowMs } = config;

  return async function burstRateLimitMiddleware(opts: { ctx: TRPCContext; next: () => Promise<unknown> }) {
    // Check burst limit
    const burstMiddleware = createRateLimit({
      windowMs: burstWindowMs,
      maxRequests: burstLimit,
      keyGenerator: (ctx) => `burst:${defaultKeyGenerator(ctx)}`,
    });

    // Check sustained limit
    const sustainedMiddleware = createRateLimit({
      windowMs,
      maxRequests: sustainedLimit,
      keyGenerator: (ctx) => `sustained:${defaultKeyGenerator(ctx)}`,
    });

    // Apply both limits
    await burstMiddleware(opts);
    return sustainedMiddleware(opts);
  };
}

/**
 * Get user role (implement this based on your database structure)
 */
async function getUserRole(_userId: string): Promise<"ADMIN" | "INTERVIEWER"> {
  // This should fetch from your database
  // For now, return a default role
  return "INTERVIEWER";
}

/**
 * Rate limit status for responses
 */
export function getRateLimitStatus(key: string): RateLimitInfo | null {
  const rateLimitData = rateLimitStore.get(key);
  if (!rateLimitData) return null;

  const now = Date.now();
  const windowMs = rateLimitData.resetTime - now;
  const validRequests = rateLimitData.requests.filter(
    (requestTime) => requestTime > now - windowMs
  );

  return {
    limit: 100, // This should come from your config
    remaining: Math.max(0, 100 - validRequests.length),
    reset: new Date(rateLimitData.resetTime),
    total: validRequests.length,
  };
}

/**
 * Clear rate limit for a specific key (useful for testing or admin operations)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get all active rate limits (useful for monitoring)
 */
export function getActiveRateLimits(): Array<{ 
  key: string; 
  data: { count: number; resetTime: Date; requestCount: number } 
}> {
  return Array.from(rateLimitStore.entries()).map(([key, data]) => ({
    key,
    data: {
      count: data.count,
      resetTime: new Date(data.resetTime),
      requestCount: data.requests.length,
    },
  }));
}