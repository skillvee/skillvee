import {
  createRateLimit,
  RateLimits,
  createIPRateLimit,
  createEndpointRateLimit,
  clearRateLimit,
  getActiveRateLimits,
} from "../rateLimit";

// Mock console.log to avoid noise in tests
jest.spyOn(console, 'log').mockImplementation(() => {});

describe("rate limit middleware", () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    const activeLimits = getActiveRateLimits();
    activeLimits.forEach(({ key }) => clearRateLimit(key));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createRateLimit", () => {
    it("should allow requests within rate limit", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 5,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // Should allow first request
      const result = await rateLimit({ ctx, next: mockNext });
      expect(result).toBe("success");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should block requests exceeding rate limit", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 2,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // First two requests should succeed
      await rateLimit({ ctx, next: mockNext });
      await rateLimit({ ctx, next: mockNext });

      // Third request should be blocked
      await expect(rateLimit({ ctx, next: mockNext })).rejects.toThrow();
      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    it("should use custom key generator", async () => {
      const customKeyGenerator = jest.fn().mockReturnValue("custom-key");
      
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 5,
        keyGenerator: customKeyGenerator,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      await rateLimit({ ctx, next: mockNext });

      expect(customKeyGenerator).toHaveBeenCalledWith(ctx);
    });

    it("should handle different users separately", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 1,
      });

      const ctx1 = {
        userId: "user-1",
        headers: new Headers(),
      };

      const ctx2 = {
        userId: "user-2", 
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // Both users should be able to make one request
      await rateLimit({ ctx: ctx1, next: mockNext });
      await rateLimit({ ctx: ctx2, next: mockNext });

      expect(mockNext).toHaveBeenCalledTimes(2);

      // Both users should be blocked on second request
      await expect(rateLimit({ ctx: ctx1, next: mockNext })).rejects.toThrow();
      await expect(rateLimit({ ctx: ctx2, next: mockNext })).rejects.toThrow();
    });

    it("should handle anonymous users", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 2,
      });

      const ctx = {
        userId: null,
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // Should work for anonymous users
      await rateLimit({ ctx, next: mockNext });
      await rateLimit({ ctx, next: mockNext });

      await expect(rateLimit({ ctx, next: mockNext })).rejects.toThrow();
    });

    it("should handle IP addresses from headers", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 1,
      });

      const headers1 = new Headers();
      headers1.set("x-forwarded-for", "192.168.1.1");

      const headers2 = new Headers();
      headers2.set("x-forwarded-for", "192.168.1.2");

      const ctx1 = { userId: null, headers: headers1 };
      const ctx2 = { userId: null, headers: headers2 };

      const mockNext = jest.fn().mockResolvedValue("success");

      // Different IPs should be tracked separately
      await rateLimit({ ctx: ctx1, next: mockNext });
      await rateLimit({ ctx: ctx2, next: mockNext });

      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    it("should handle Headers object and plain object differently", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 1,
      });

      const headersObject = {
        "x-forwarded-for": "192.168.1.1"
      };

      const ctx = { userId: null, headers: headersObject };
      const mockNext = jest.fn().mockResolvedValue("success");

      await rateLimit({ ctx, next: mockNext });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call onLimitReached when limit is exceeded", async () => {
      const onLimitReached = jest.fn();
      
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 1,
        onLimitReached,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // First request should succeed
      await rateLimit({ ctx, next: mockNext });

      // Second request should trigger onLimitReached
      await expect(rateLimit({ ctx, next: mockNext })).rejects.toThrow();
      expect(onLimitReached).toHaveBeenCalledWith(ctx, expect.any(Object));
    });

    it("should handle skipSuccessfulRequests option", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 1,
        skipSuccessfulRequests: true,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // Should allow multiple successful requests when skipping them
      await rateLimit({ ctx, next: mockNext });
      await rateLimit({ ctx, next: mockNext });

      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    it("should handle skipFailedRequests option", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 1,
        skipFailedRequests: true,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      let shouldFail = true;
      const mockNext = jest.fn().mockImplementation(() => {
        if (shouldFail) {
          shouldFail = false;
          throw new Error("Request failed");
        }
        return "success";
      });

      // First request fails but shouldn't count
      await expect(rateLimit({ ctx, next: mockNext })).rejects.toThrow("Request failed");
      
      // Second request should succeed since failed request was skipped
      await rateLimit({ ctx, next: mockNext });

      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });

  describe("predefined rate limits", () => {
    it("should have correct configuration for strict rate limit", () => {
      expect(RateLimits.strict.windowMs).toBe(60 * 1000);
      expect(RateLimits.strict.maxRequests).toBe(5);
    });

    it("should have correct configuration for moderate rate limit", () => {
      expect(RateLimits.moderate.windowMs).toBe(60 * 1000);
      expect(RateLimits.moderate.maxRequests).toBe(30);
    });

    it("should have correct configuration for AI rate limit", () => {
      expect(RateLimits.ai.windowMs).toBe(60 * 1000);
      expect(RateLimits.ai.maxRequests).toBe(20);
    });
  });

  describe("createIPRateLimit", () => {
    it("should create rate limiter based on IP address", async () => {
      const rateLimit = createIPRateLimit({
        windowMs: 60000,
        maxRequests: 1,
      });

      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.1");

      const ctx = {
        userId: "different-users",
        headers: headers,
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      await rateLimit({ ctx, next: mockNext });
      
      // Same IP should be blocked even with different user
      const ctx2 = { ...ctx, userId: "another-user" };
      await expect(rateLimit({ ctx: ctx2, next: mockNext })).rejects.toThrow();
    });
  });

  describe("createEndpointRateLimit", () => {
    it("should create rate limiter for specific endpoint", async () => {
      const rateLimit = createEndpointRateLimit("api.upload", {
        windowMs: 60000,
        maxRequests: 1,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      await rateLimit({ ctx, next: mockNext });
      await expect(rateLimit({ ctx, next: mockNext })).rejects.toThrow();
    });
  });

  describe("utility functions", () => {
    it("should track active rate limits", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 5,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      await rateLimit({ ctx, next: mockNext });

      const activeLimits = getActiveRateLimits();
      expect(activeLimits.length).toBeGreaterThan(0);
      expect(activeLimits[0]).toHaveProperty('key');
      expect(activeLimits[0]).toHaveProperty('data');
    });

    it("should clear rate limits", async () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 1,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // Use up the rate limit
      await rateLimit({ ctx, next: mockNext });
      await expect(rateLimit({ ctx, next: mockNext })).rejects.toThrow();

      // Clear the rate limit
      const activeLimits = getActiveRateLimits();
      if (activeLimits.length > 0) {
        clearRateLimit(activeLimits[0]!.key);
      }

      // Should work again after clearing
      await rateLimit({ ctx, next: mockNext });
      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });

  describe("sliding window behavior", () => {
    it("should allow requests after window expires", async () => {
      const rateLimit = createRateLimit({
        windowMs: 100, // Very short window for testing
        maxRequests: 1,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // First request should succeed
      await rateLimit({ ctx, next: mockNext });

      // Second request should fail
      await expect(rateLimit({ ctx, next: mockNext })).rejects.toThrow();

      // Wait for window to expire
      await new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            // Should succeed after window expires
            await rateLimit({ ctx, next: mockNext });
            expect(mockNext).toHaveBeenCalledTimes(2);
            resolve();
          } catch (error) {
            throw error;
          }
        }, 150);
      });
    }, 1000);

    it("should properly track requests in sliding window", async () => {
      const rateLimit = createRateLimit({
        windowMs: 1000, // 1 second window
        maxRequests: 3,
      });

      const ctx = {
        userId: "test-user",
        headers: new Headers(),
      };

      const mockNext = jest.fn().mockResolvedValue("success");

      // Make 3 requests quickly
      await rateLimit({ ctx, next: mockNext });
      await rateLimit({ ctx, next: mockNext });
      await rateLimit({ ctx, next: mockNext });

      // 4th request should fail
      await expect(rateLimit({ ctx, next: mockNext })).rejects.toThrow();
      expect(mockNext).toHaveBeenCalledTimes(3);
    });
  });
});