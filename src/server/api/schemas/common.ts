import { z } from "zod";

/**
 * Common validation schemas used across multiple routers
 */

// Basic ID validation
export const idSchema = z.string().cuid();

// Pagination schemas
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const cursorPaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  direction: z.enum(["forward", "backward"]).default("forward"),
});

// Date range filtering
export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
});

// Search and filtering
export const searchSchema = z.object({
  query: z.string().min(1).max(255).optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

// File upload validation
export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(500 * 1024 * 1024), // 500MB max
  mimeType: z.string().min(1),
});

// Email validation
export const emailSchema = z.string().email().max(255);

// URL validation
export const urlSchema = z.string().url().max(2048);

// Text content validation with sanitization
export const textContentSchema = z.string()
  .min(1)
  .max(10000)
  .transform((str) => str.trim())
  .refine((str) => str.length > 0, "Content cannot be empty");

// Rich text content (for descriptions, feedback, etc.)
export const richTextSchema = z.string()
  .min(1)
  .max(50000)
  .transform((str) => str.trim())
  .refine((str) => str.length > 0, "Content cannot be empty");

// Tags/array validation
export const tagsSchema = z.array(z.string().min(1).max(50)).max(20);

// Score validation (1-10 scale)
export const scoreSchema = z.number().int().min(1).max(10);

// Duration in minutes
export const durationSchema = z.number().int().positive().max(480); // 8 hours max

// Enum schemas based on Prisma models
export const userRoleSchema = z.enum(["ADMIN", "INTERVIEWER"]);

export const interviewStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS", 
  "COMPLETED",
  "CANCELLED"
]);

export const questionTypeSchema = z.enum([
  "TECHNICAL",
  "BEHAVIORAL",
  "CASE_STUDY",
  "PROBLEM_SOLVING",
  "SYSTEM_DESIGN"
]);

export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const experienceLevelSchema = z.enum(["JUNIOR", "MEDIUM", "SENIOR"]);

export const recordingTypeSchema = z.enum([
  "SCREEN",
  "AUDIO",
  "SCREEN_AND_AUDIO"
]);

export const uploadStatusSchema = z.enum([
  "UPLOADING",
  "COMPLETED", 
  "FAILED"
]);

export const transcriptionStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED"
]);

// Response schemas for consistent API responses
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

// Metadata schemas
export const metadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

// Audit trail schema
export const auditSchema = z.object({
  action: z.enum(["CREATE", "UPDATE", "DELETE", "VIEW"]),
  userId: idSchema,
  resourceType: z.string(),
  resourceId: idSchema,
  changes: z.record(z.unknown()).optional(),
  timestamp: z.date(),
});

/**
 * Utility functions for validation
 */

// Sanitize HTML content (basic)
export const sanitizeHtml = (content: string): string => {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Validate and sanitize text input
export const sanitizedTextSchema = z.string()
  .transform((str) => str.trim())
  .transform(sanitizeHtml)
  .refine((str) => str.length > 0, "Content cannot be empty after sanitization");

// Company name validation
export const companyNameSchema = z.string()
  .min(1)
  .max(100)
  .transform((str) => str.trim())
  .refine((str) => /^[a-zA-Z0-9\s\-\.\&]+$/.test(str), "Invalid company name format");

// Job title validation  
export const jobTitleSchema = z.string()
  .min(1)
  .max(150)
  .transform((str) => str.trim())
  .refine((str) => str.length > 0, "Job title cannot be empty");

// Skills/requirements validation
export const skillsSchema = z.array(
  z.string()
    .min(1)
    .max(255)
    .transform((str) => str.trim())
).min(1).max(100);

// Focus areas validation
export const focusAreasSchema = z.array(
  z.string()
    .min(1)
    .max(100)
    .transform((str) => str.trim())
).max(20);