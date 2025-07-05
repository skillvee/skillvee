import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

/**
 * Custom error codes for SkillVee application
 */
export const SKILLVEE_ERROR_CODES = {
  // Business logic errors
  INTERVIEW_NOT_FOUND: "INTERVIEW_NOT_FOUND",
  INTERVIEW_ALREADY_STARTED: "INTERVIEW_ALREADY_STARTED",
  INTERVIEW_ALREADY_COMPLETED: "INTERVIEW_ALREADY_COMPLETED",
  JOB_DESCRIPTION_NOT_FOUND: "JOB_DESCRIPTION_NOT_FOUND",
  ASSESSMENT_NOT_READY: "ASSESSMENT_NOT_READY",
  MEDIA_UPLOAD_FAILED: "MEDIA_UPLOAD_FAILED",
  AI_SERVICE_UNAVAILABLE: "AI_SERVICE_UNAVAILABLE",
  
  // Permission errors
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  ADMIN_ACCESS_REQUIRED: "ADMIN_ACCESS_REQUIRED",
  RESOURCE_ACCESS_DENIED: "RESOURCE_ACCESS_DENIED",
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // Validation errors
  INVALID_INPUT_DATA: "INVALID_INPUT_DATA",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
} as const;

export type SkillVeeErrorCode = typeof SKILLVEE_ERROR_CODES[keyof typeof SKILLVEE_ERROR_CODES];

/**
 * Enhanced error class with additional context
 */
export class SkillVeeError extends TRPCError {
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor({
    code,
    message,
    context,
    requestId,
    cause,
  }: {
    code: SkillVeeErrorCode | TRPCError["code"];
    message: string;
    context?: Record<string, unknown>;
    requestId?: string;
    cause?: unknown;
  }) {
    // Map custom codes to tRPC codes
    const trpcCode = mapToTRPCCode(code);
    
    super({
      code: trpcCode,
      message,
      cause,
    });

    this.context = context;
    this.timestamp = new Date();
    this.requestId = requestId;
  }
}

/**
 * Map custom error codes to tRPC error codes
 */
function mapToTRPCCode(code: SkillVeeErrorCode | TRPCError["code"]): TRPCError["code"] {
  const errorCodeMap: Record<SkillVeeErrorCode, TRPCError["code"]> = {
    [SKILLVEE_ERROR_CODES.INTERVIEW_NOT_FOUND]: "NOT_FOUND",
    [SKILLVEE_ERROR_CODES.INTERVIEW_ALREADY_STARTED]: "CONFLICT",
    [SKILLVEE_ERROR_CODES.INTERVIEW_ALREADY_COMPLETED]: "CONFLICT",
    [SKILLVEE_ERROR_CODES.JOB_DESCRIPTION_NOT_FOUND]: "NOT_FOUND",
    [SKILLVEE_ERROR_CODES.ASSESSMENT_NOT_READY]: "PRECONDITION_FAILED",
    [SKILLVEE_ERROR_CODES.MEDIA_UPLOAD_FAILED]: "INTERNAL_SERVER_ERROR",
    [SKILLVEE_ERROR_CODES.AI_SERVICE_UNAVAILABLE]: "SERVICE_UNAVAILABLE",
    [SKILLVEE_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: "FORBIDDEN",
    [SKILLVEE_ERROR_CODES.ADMIN_ACCESS_REQUIRED]: "FORBIDDEN",
    [SKILLVEE_ERROR_CODES.RESOURCE_ACCESS_DENIED]: "FORBIDDEN",
    [SKILLVEE_ERROR_CODES.RATE_LIMIT_EXCEEDED]: "TOO_MANY_REQUESTS",
    [SKILLVEE_ERROR_CODES.INVALID_INPUT_DATA]: "BAD_REQUEST",
    [SKILLVEE_ERROR_CODES.MISSING_REQUIRED_FIELD]: "BAD_REQUEST",
  };

  return errorCodeMap[code as SkillVeeErrorCode] || (code as TRPCError["code"]);
}

/**
 * Helper functions for creating common errors
 */
export const createError = {
  notFound: (resource: string, id?: string) =>
    new SkillVeeError({
      code: "NOT_FOUND",
      message: `${resource} not found${id ? ` with id: ${id}` : ""}`,
      context: { resource, id },
    }),

  forbidden: (action: string, resource?: string) =>
    new SkillVeeError({
      code: SKILLVEE_ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      message: `Not authorized to ${action}${resource ? ` ${resource}` : ""}`,
      context: { action, resource },
    }),

  validation: (field: string, issue: string) =>
    new SkillVeeError({
      code: SKILLVEE_ERROR_CODES.INVALID_INPUT_DATA,
      message: `Validation error on field '${field}': ${issue}`,
      context: { field, issue },
    }),

  conflict: (message: string, context?: Record<string, unknown>) =>
    new SkillVeeError({
      code: "CONFLICT",
      message,
      context,
    }),

  rateLimit: (limit: number, window: string) =>
    new SkillVeeError({
      code: SKILLVEE_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: `Rate limit exceeded: ${limit} requests per ${window}`,
      context: { limit, window },
    }),

  internal: (message: string, context?: Record<string, unknown>) =>
    new SkillVeeError({
      code: "INTERNAL_SERVER_ERROR",
      message,
      context,
    }),

  aiService: (service: string, details?: string) =>
    new SkillVeeError({
      code: SKILLVEE_ERROR_CODES.AI_SERVICE_UNAVAILABLE,
      message: `AI service '${service}' is currently unavailable${details ? `: ${details}` : ""}`,
      context: { service, details },
    }),
};

/**
 * Enhanced error formatter for tRPC
 */
export function formatError(opts: {
  shape: { data: { zodError?: unknown; code: string } };
  error: TRPCError;
}) {
  const { shape, error } = opts;
  
  return {
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      skillveeError: error instanceof SkillVeeError ? {
        context: error.context,
        timestamp: error.timestamp,
        requestId: error.requestId,
      } : null,
    },
  };
}