/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "~/server/db";
import { formatError } from "./types/errors";
import { createRateLimit, RateLimits } from "./middleware/rateLimit";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { userId, sessionId } = await auth();
  
  // Get user info if authenticated
  let user = null;
  if (userId) {
    try {
      user = await db.user.findUnique({
        where: { 
          clerkId: userId,
          deletedAt: null,
        },
        select: {
          id: true,
          clerkId: true,
          email: true,
          role: true,
        },
      });
      
      // If user doesn't exist, create a placeholder user
      // This handles cases where webhook hasn't fired yet
      if (!user) {
        const clerkUser = await currentUser();
        if (clerkUser) {
          // Create a basic user record
          user = await db.user.create({
            data: {
              clerkId: userId,
              email: clerkUser.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              profileImage: clerkUser.imageUrl,
              role: "INTERVIEWER",
            },
            select: {
              id: true,
              clerkId: true,
              email: true,
              role: true,
            },
          });
          console.log("Created placeholder user:", user.id);
        }
      }
    } catch (error) {
      // Log error but don't fail context creation
      console.error("Failed to fetch/create user in tRPC context:", error);
      
      // Development fallback: Create a mock user if database is unavailable
      if (process.env.NODE_ENV === "development" && userId) {
        try {
          const clerkUser = await currentUser();
          if (clerkUser) {
            user = {
              id: `mock-${userId}`,
              clerkId: userId,
              email: clerkUser.emailAddresses[0]?.emailAddress || `${userId}@dev.local`,
              role: "INTERVIEWER" as const,
            };
            console.log("Using mock user for development:", user.id);
          }
        } catch (mockError) {
          console.error("Failed to create mock user:", mockError);
        }
      }
    }
  }
  
  return {
    db,
    userId,
    sessionId,
    user,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: formatError,
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Rate limiting middleware for API calls
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const rateLimiter = createRateLimit(RateLimits.moderate);
  await rateLimiter({ ctx, next: async () => undefined });
  return next();
});

/**
 * Strict rate limiting for sensitive operations
 */
const strictRateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const rateLimiter = createRateLimit(RateLimits.strict);
  await rateLimiter({ ctx, next: async () => undefined });
  return next();
});

/**
 * AI operations rate limiting
 */
const aiRateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const rateLimiter = createRateLimit(RateLimits.ai);
  await rateLimiter({ ctx, next: async () => undefined });
  return next();
});

/**
 * CSV operations rate limiting (more lenient for bulk operations)
 */
const csvRateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const rateLimiter = createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // Allow 10 CSV operations per minute
  });
  await rateLimiter({ ctx, next: async () => undefined });
  return next();
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(rateLimitMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.userId` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(rateLimitMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.userId || !ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    
    return next({
      ctx: {
        ...ctx,
        userId: ctx.userId,
        user: ctx.user,
      },
    });
  });

/**
 * Admin-only procedure
 *
 * Only accessible to users with ADMIN role. Includes stricter rate limiting.
 */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(strictRateLimitMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.userId || !ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    
    if (ctx.user.role !== "ADMIN") {
      throw new TRPCError({ 
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }
    
    return next({
      ctx: {
        ...ctx,
        userId: ctx.userId,
        user: ctx.user,
      },
    });
  });

/**
 * AI procedure for AI-powered operations
 *
 * Includes special rate limiting for AI operations which are typically more expensive.
 */
export const aiProcedure = t.procedure
  .use(timingMiddleware)
  .use(aiRateLimitMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.userId || !ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    
    return next({
      ctx: {
        ...ctx,
        userId: ctx.userId,
        user: ctx.user,
      },
    });
  });

/**
 * CSV admin procedure for CSV operations
 *
 * Admin-only with appropriate rate limiting for bulk CSV operations.
 */
export const csvAdminProcedure = t.procedure
  .use(timingMiddleware)
  .use(csvRateLimitMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.userId || !ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    
    if (ctx.user.role !== "ADMIN") {
      throw new TRPCError({ 
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }
    
    return next({
      ctx: {
        ...ctx,
        userId: ctx.userId,
        user: ctx.user,
      },
    });
  });
