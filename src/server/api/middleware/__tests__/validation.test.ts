import { 
  sanitizeInput, 
  validateInputSize, 
  validateRequiredFields,
  validateStringLengths,
  validateFileUpload,
  validateEmail,
  validateUrl,
  validateDateRange,
  validateBusinessRules,
  formatZodError,
  validateWithSchema
} from "../validation";
import { ZodError, z } from "zod";
import { TRPCError } from "@trpc/server";

describe("validation middleware", () => {
  describe("sanitizeInput", () => {
    it("should remove script tags", () => {
      const input = {
        name: "John<script>alert('xss')</script>Doe",
        description: "Safe content"
      };

      const result = sanitizeInput(input);

      expect(result.name).toBe("JohnDoe");
      expect(result.description).toBe("Safe content");
    });

    it("should remove iframe tags", () => {
      const input = {
        content: "Hello<iframe src='evil.com'></iframe>World"
      };

      const result = sanitizeInput(input);

      expect(result.content).toBe("HelloWorld");
    });

    it("should remove javascript: urls", () => {
      const input = {
        link: "javascript:alert('xss')"
      };

      const result = sanitizeInput(input);

      expect(result.link).toBe("");
    });

    it("should remove event handlers", () => {
      const input = {
        text: "Click me onclick=alert('xss')"
      };

      const result = sanitizeInput(input);

      expect(result.text).toBe("Click me");
    });

    it("should sanitize nested objects", () => {
      const input = {
        user: {
          name: "John<script>alert('xss')</script>",
          profile: {
            bio: "Hello<iframe></iframe>World"
          }
        }
      };

      const result = sanitizeInput(input);

      expect(result.user.name).toBe("John");
      expect(result.user.profile.bio).toBe("HelloWorld");
    });

    it("should sanitize arrays", () => {
      const input = {
        tags: ["safe", "bad<script>alert('xss')</script>", "good"]
      };

      const result = sanitizeInput(input);

      expect(result.tags).toEqual(["safe", "bad", "good"]);
    });

    it("should handle non-object inputs", () => {
      expect(sanitizeInput("string" as any)).toBe("string");
      expect(sanitizeInput(null as any)).toBe(null);
      expect(sanitizeInput(123 as any)).toBe(123);
    });
  });

  describe("validateInputSize", () => {
    it("should pass for small inputs", () => {
      const input = { name: "John", age: 25 };
      
      expect(() => validateInputSize(input, 1)).not.toThrow();
    });

    it("should throw for large inputs", () => {
      const largeInput = {
        data: "x".repeat(2000000) // ~2MB string
      };

      expect(() => validateInputSize(largeInput, 1)).toThrow(TRPCError);
    });

    it("should use default size limit of 1MB", () => {
      const input = { name: "John" };
      
      expect(() => validateInputSize(input)).not.toThrow();
    });
  });

  describe("validateRequiredFields", () => {
    it("should pass when all required fields are present", () => {
      const input = {
        name: "John",
        email: "john@example.com",
        age: 25
      };

      expect(() => validateRequiredFields(input, ["name", "email"])).not.toThrow();
    });

    it("should throw when required field is missing", () => {
      const input = {
        name: "John"
      };

      expect(() => validateRequiredFields(input, ["name", "email"] as (keyof typeof input)[])).toThrow(TRPCError);
    });

    it("should throw when required field is null", () => {
      const input = {
        name: "John",
        email: null
      };

      expect(() => validateRequiredFields(input, ["name", "email"] as (keyof typeof input)[])).toThrow(TRPCError);
    });

    it("should throw when required string field is empty", () => {
      const input = {
        name: "John",
        email: "   "
      };

      expect(() => validateRequiredFields(input, ["name", "email"] as (keyof typeof input)[])).toThrow(TRPCError);
    });

    it("should throw when required array field is empty", () => {
      const input = {
        name: "John",
        tags: []
      };

      expect(() => validateRequiredFields(input, ["name", "tags"])).toThrow(TRPCError);
    });
  });

  describe("validateStringLengths", () => {
    it("should pass when strings are within limits", () => {
      const input = {
        name: "John",
        bio: "Software developer"
      };

      const constraints = {
        name: { min: 2, max: 50 },
        bio: { min: 5, max: 100 }
      };

      expect(() => validateStringLengths(input, constraints)).not.toThrow();
    });

    it("should throw when string is too short", () => {
      const input = {
        name: "J"
      };

      const constraints = {
        name: { min: 2, max: 50 }
      };

      expect(() => validateStringLengths(input, constraints)).toThrow(TRPCError);
    });

    it("should throw when string is too long", () => {
      const input = {
        name: "John".repeat(20) // 80 characters
      };

      const constraints = {
        name: { min: 2, max: 50 }
      };

      expect(() => validateStringLengths(input, constraints)).toThrow(TRPCError);
    });

    it("should ignore non-string fields", () => {
      const input = {
        name: "John",
        age: 25
      };

      const constraints = {
        name: { min: 2, max: 50 },
        age: { min: 1, max: 3 } // This should be ignored
      };

      expect(() => validateStringLengths(input, constraints)).not.toThrow();
    });
  });

  describe("validateFileUpload", () => {
    it("should pass for valid file upload", () => {
      const file = {
        name: "document.pdf",
        size: 1024 * 1024, // 1MB
        type: "application/pdf"
      };

      expect(() => validateFileUpload(file)).not.toThrow();
    });

    it("should throw for file too large", () => {
      const file = {
        name: "large.pdf",
        size: 200 * 1024 * 1024, // 200MB
        type: "application/pdf"
      };

      expect(() => validateFileUpload(file, { maxSizeMB: 100 })).toThrow(TRPCError);
    });

    it("should throw for disallowed file type", () => {
      const file = {
        name: "script.exe",
        size: 1024,
        type: "application/x-executable"
      };

      expect(() => validateFileUpload(file)).toThrow(TRPCError);
    });

    it("should throw for disallowed file extension", () => {
      const file = {
        name: "malware.exe",
        size: 1024,
        type: "image/jpeg" // Spoofed type
      };

      expect(() => validateFileUpload(file)).toThrow(TRPCError);
    });

    it("should allow wildcard types", () => {
      const file = {
        name: "photo.jpg",
        size: 1024,
        type: "image/jpeg"
      };

      const constraints = {
        allowedTypes: ["image/*"]
      };

      expect(() => validateFileUpload(file, constraints)).not.toThrow();
    });
  });

  describe("validateEmail", () => {
    it("should pass for valid email", () => {
      expect(() => validateEmail("user@example.com")).not.toThrow();
    });

    it("should throw for invalid email format", () => {
      expect(() => validateEmail("invalid-email")).toThrow(TRPCError);
      expect(() => validateEmail("user@")).toThrow(TRPCError);
      expect(() => validateEmail("@example.com")).toThrow(TRPCError);
    });

    it("should throw for blocked domains", () => {
      const options = {
        blockedDomains: ["spam.com", "disposable.email"]
      };

      expect(() => validateEmail("user@spam.com", options)).toThrow(TRPCError);
    });

    it("should throw if not from required domain", () => {
      const options = {
        requireDomain: ["company.com"]
      };

      expect(() => validateEmail("user@gmail.com", options)).toThrow(TRPCError);
      expect(() => validateEmail("user@company.com", options)).not.toThrow();
    });
  });

  describe("validateUrl", () => {
    it("should pass for valid HTTPS URL", () => {
      expect(() => validateUrl("https://example.com")).not.toThrow();
    });

    it("should pass for HTTP URL when allowed", () => {
      expect(() => validateUrl("http://example.com")).not.toThrow();
    });

    it("should throw for invalid URL format", () => {
      expect(() => validateUrl("not-a-url")).toThrow(TRPCError);
    });

    it("should throw for disallowed protocol", () => {
      const options = {
        allowedProtocols: ["https:"]
      };

      expect(() => validateUrl("http://example.com", options)).toThrow(TRPCError);
      expect(() => validateUrl("ftp://example.com", options)).toThrow(TRPCError);
    });

    it("should throw for blocked domains", () => {
      const options = {
        blockedDomains: ["malicious.com"]
      };

      expect(() => validateUrl("https://malicious.com", options)).toThrow(TRPCError);
    });

    it("should require HTTPS when specified", () => {
      const options = {
        requireHttps: true
      };

      expect(() => validateUrl("http://example.com", options)).toThrow(TRPCError);
      expect(() => validateUrl("https://example.com", options)).not.toThrow();
    });
  });

  describe("validateDateRange", () => {
    it("should pass for valid date range", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");

      expect(() => validateDateRange(start, end)).not.toThrow();
    });

    it("should throw when start date is after end date", () => {
      const start = new Date("2024-01-31");
      const end = new Date("2024-01-01");

      expect(() => validateDateRange(start, end)).toThrow(TRPCError);
    });

    it("should throw when start date equals end date", () => {
      const date = new Date("2024-01-01");

      expect(() => validateDateRange(date, date)).toThrow(TRPCError);
    });

    it("should throw for future dates when not allowed", () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const today = new Date();

      const options = { allowFuture: false };

      expect(() => validateDateRange(today, futureDate, options)).toThrow(TRPCError);
    });

    it("should throw for past dates when not allowed", () => {
      const yesterday = new Date(Date.now() - 86400000);
      const today = new Date();

      const options = { allowPast: false };

      expect(() => validateDateRange(yesterday, today, options)).toThrow(TRPCError);
    });

    it("should throw for range exceeding maximum days", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-12-31"); // ~365 days

      const options = { maxRangeDays: 30 };

      expect(() => validateDateRange(start, end, options)).toThrow(TRPCError);
    });
  });

  describe("validateBusinessRules", () => {
    it("should pass when all business rules are satisfied", () => {
      const input = {
        age: 25,
        hasLicense: true
      };

      const rules = [
        {
          condition: (data: typeof input) => data.age >= 18,
          message: "Must be 18 or older"
        },
        {
          condition: (data: typeof input) => data.hasLicense,
          message: "Must have a license"
        }
      ];

      expect(() => validateBusinessRules(input, rules)).not.toThrow();
    });

    it("should throw when business rule fails", () => {
      const input = {
        age: 16,
        hasLicense: true
      };

      const rules = [
        {
          condition: (data: typeof input) => data.age >= 18,
          message: "Must be 18 or older",
          field: "age"
        }
      ];

      expect(() => validateBusinessRules(input, rules)).toThrow(TRPCError);
    });
  });

  describe("formatZodError", () => {
    it("should format Zod validation error", () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email()
      });

      try {
        schema.parse({ name: "J", email: "invalid" });
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedError = formatZodError(error);
          expect(formattedError).toBeInstanceOf(TRPCError);
        }
      }
    });

    it("should handle empty Zod issues", () => {
      const zodError = new ZodError([]);
      const result = formatZodError(zodError);
      
      expect(result).toBeInstanceOf(TRPCError);
      expect(result.message).toContain("Validation failed");
    });
  });

  describe("validateWithSchema", () => {
    it("should validate and return parsed data", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      const input = { name: "John", age: 25 };
      const result = validateWithSchema(schema, input);

      expect(result).toEqual(input);
    });

    it("should throw formatted error for invalid data", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      const input = { name: "John", age: "invalid" };

      expect(() => validateWithSchema(schema, input)).toThrow(TRPCError);
    });

    it("should use custom error messages", () => {
      const schema = z.object({
        email: z.string().email()
      });

      const input = { email: "invalid" };
      const options = {
        customErrors: {
          email: "Please provide a valid email address"
        }
      };

      expect(() => validateWithSchema(schema, input, options)).toThrow(TRPCError);
    });

    it("should handle non-Zod errors", () => {
      const schema = {
        parse: () => {
          throw new Error("Custom error");
        }
      } as any;

      expect(() => validateWithSchema(schema, {})).toThrow("Custom error");
    });
  });
});