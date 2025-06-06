import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import type { TRPCError } from "@trpc/server";
import { createError } from "../types/errors";

/**
 * Advanced validation middleware for tRPC procedures
 */

/**
 * Sanitize input data to prevent XSS and injection attacks
 */
export function sanitizeInput<T extends Record<string, unknown>>(input: T): T {
  if (typeof input !== "object" || input === null) {
    return input;
  }

  const sanitized = { ...input };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      // Basic XSS prevention - comprehensive sanitization
      const cleanValue = value
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Remove iframe tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        // Remove javascript: protocol - match the entire thing including parentheses
        .replace(/javascript:.*$/gi, "")
        // Remove event handlers - match attribute pattern with spaces around =
        .replace(/\s+on\w+=.*$/gi, "")
        .trim();

      (sanitized as Record<string, unknown>)[key] = cleanValue;
    } else if (Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === "string" ? sanitizeInput({ item }).item : sanitizeInput(item as Record<string, unknown>)
      );
    } else if (typeof value === "object" && value !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value as Record<string, unknown>);
    }
  }

  return sanitized;
}

/**
 * Validate input size to prevent DoS attacks
 */
export function validateInputSize<T>(
  input: T,
  maxSizeKB = 1024 // 1MB default
): T {
  const inputString = JSON.stringify(input);
  const sizeKB = Buffer.byteLength(inputString, "utf8") / 1024;

  if (sizeKB > maxSizeKB) {
    throw createError.validation(
      "input_size",
      `Input size (${sizeKB.toFixed(2)}KB) exceeds maximum allowed (${maxSizeKB}KB)`
    );
  }

  return input;
}

/**
 * Validate required fields are present and not empty
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  input: T,
  requiredFields: (keyof T)[]
): T {
  for (const field of requiredFields) {
    const value = input[field];
    
    if (value === undefined || value === null) {
      throw createError.validation(
        String(field),
        "This field is required"
      );
    }
    
    if (typeof value === "string" && value.trim().length === 0) {
      throw createError.validation(
        String(field),
        "This field cannot be empty"
      );
    }
    
    if (Array.isArray(value) && value.length === 0) {
      throw createError.validation(
        String(field),
        "This field must contain at least one item"
      );
    }
  }

  return input;
}

/**
 * Validate string lengths
 */
export function validateStringLengths<T extends Record<string, unknown>>(
  input: T,
  lengthConstraints: Record<keyof T, { min?: number; max?: number }>
): T {
  for (const [field, constraints] of Object.entries(lengthConstraints)) {
    const value = input[field];
    
    if (typeof value === "string") {
      const { min, max } = constraints;
      
      if (min !== undefined && value.length < min) {
        throw createError.validation(
          field,
          `Must be at least ${min} characters long`
        );
      }
      
      if (max !== undefined && value.length > max) {
        throw createError.validation(
          field,
          `Must be no more than ${max} characters long`
        );
      }
    }
  }

  return input;
}

/**
 * Validate file uploads
 */
export function validateFileUpload(
  file: {
    name: string;
    size: number;
    type: string;
  },
  constraints: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): void {
  const {
    maxSizeMB = 100,
    allowedTypes = ["image/*", "video/*", "audio/*", "application/pdf"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mp3", ".wav", ".pdf"],
  } = constraints;

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    throw createError.validation(
      "file_size",
      `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed (${maxSizeMB}MB)`
    );
  }

  // Check file type
  const isTypeAllowed = allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.replace("/*", "/"));
    }
    return file.type === type;
  });

  if (!isTypeAllowed) {
    throw createError.validation(
      "file_type",
      `File type '${file.type}' is not allowed`
    );
  }

  // Check file extension
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    throw createError.validation(
      "file_extension",
      `File extension '${fileExtension}' is not allowed`
    );
  }
}

/**
 * Validate email format and domain
 */
export function validateEmail(
  email: string,
  options: {
    allowDisposable?: boolean;
    requireDomain?: string[];
    blockedDomains?: string[];
  } = {}
): void {
  const { requireDomain, blockedDomains = [] } = options;

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError.validation("email", "Invalid email format");
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    throw createError.validation("email", "Invalid email domain");
  }

  // Check blocked domains
  if (blockedDomains.includes(domain)) {
    throw createError.validation("email", "Email domain is not allowed");
  }

  // Check required domains
  if (requireDomain && !requireDomain.includes(domain)) {
    throw createError.validation("email", "Email must be from an allowed domain");
  }
}

/**
 * Validate URL format and security
 */
export function validateUrl(
  url: string,
  options: {
    allowedProtocols?: string[];
    blockedDomains?: string[];
    requireHttps?: boolean;
  } = {}
): void {
  const {
    allowedProtocols = ["http:", "https:"],
    blockedDomains = [],
    requireHttps = false,
  } = options;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw createError.validation("url", "Invalid URL format");
  }

  // Check protocol
  if (!allowedProtocols.includes(parsedUrl.protocol)) {
    throw createError.validation("url", "URL protocol is not allowed");
  }

  if (requireHttps && parsedUrl.protocol !== "https:") {
    throw createError.validation("url", "HTTPS is required");
  }

  // Check blocked domains
  if (blockedDomains.includes(parsedUrl.hostname.toLowerCase())) {
    throw createError.validation("url", "URL domain is not allowed");
  }
}

/**
 * Validate date ranges
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date,
  options: {
    maxRangeDays?: number;
    allowFuture?: boolean;
    allowPast?: boolean;
  } = {}
): void {
  const { maxRangeDays, allowFuture = true, allowPast = true } = options;

  const now = new Date();

  // Check if dates are in allowed time periods
  if (!allowFuture && (startDate > now || endDate > now)) {
    throw createError.validation("date_range", "Future dates are not allowed");
  }

  if (!allowPast && (startDate < now || endDate < now)) {
    throw createError.validation("date_range", "Past dates are not allowed");
  }

  // Check if start date is before end date
  if (startDate >= endDate) {
    throw createError.validation("date_range", "Start date must be before end date");
  }

  // Check maximum range
  if (maxRangeDays) {
    const rangeDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (rangeDays > maxRangeDays) {
      throw createError.validation(
        "date_range",
        `Date range cannot exceed ${maxRangeDays} days`
      );
    }
  }
}

/**
 * Validate business rules
 */
export function validateBusinessRules<T extends Record<string, unknown>>(
  input: T,
  rules: Array<{
    condition: (input: T) => boolean;
    message: string;
    field?: string;
  }>
): T {
  for (const rule of rules) {
    if (!rule.condition(input)) {
      throw createError.validation(
        rule.field ?? "business_rule",
        rule.message
      );
    }
  }

  return input;
}

/**
 * Enhanced Zod error formatting
 */
export function formatZodError(error: ZodError): TRPCError {
  const firstIssue = error.issues[0];
  if (!firstIssue) {
    return createError.validation("validation", "Validation failed");
  }

  const field = firstIssue.path.join(".");
  const message = firstIssue.message;

  return createError.validation(field, message);
}

/**
 * Create a validation middleware that combines multiple validators
 */
export function createValidationMiddleware<T extends Record<string, unknown>>(
  validators: Array<(input: T) => T | void>
) {
  return (input: T): T => {
    let validatedInput = input;

    for (const validator of validators) {
      const result = validator(validatedInput);
      if (result !== undefined) {
        validatedInput = result;
      }
    }

    return validatedInput;
  };
}

/**
 * Schema-based validation with custom error handling
 */
export function validateWithSchema<T>(
  schema: ZodSchema<T>,
  input: unknown,
  options: {
    customErrors?: Record<string, string>;
    stripUnknown?: boolean;
  } = {}
): T {
  const { customErrors = {} } = options;

  try {
    // Note: strip option is not available in current Zod version
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      if (firstIssue) {
        const field = firstIssue.path.join(".");
        const customMessage = customErrors[field];
        
        if (customMessage) {
          throw createError.validation(field, customMessage);
        }
      }
      
      throw formatZodError(error);
    }
    
    throw error;
  }
}