import { z } from "zod";
import {
  idSchema,
  paginationSchema,
  durationSchema,
  recordingTypeSchema,
  uploadStatusSchema,
  transcriptionStatusSchema,
} from "./common";

/**
 * Question recording validation schemas
 */

// Create question recording input
export const createQuestionRecordingSchema = z.object({
  interviewId: idSchema,
  questionId: z.string(),
  questionText: z.string(),
  questionOrder: z.number().int().min(0),
  recordingStartedAt: z.date(),
});

// Update question recording status
export const updateQuestionRecordingStatusSchema = z.object({
  id: idSchema,
  uploadStatus: uploadStatusSchema.optional(),
  uploadStartedAt: z.date().optional(),
  uploadCompletedAt: z.date().optional(),
  uploadRetryCount: z.number().int().min(0).optional(),
  uploadError: z.string().optional(),
  recordingEndedAt: z.date().optional(),
  filePath: z.string().optional(),
  fileSize: z.bigint().positive().optional(),
  duration: durationSchema.optional(),
  transcriptionStatus: transcriptionStatusSchema.optional(),
  transcriptionText: z.string().optional(),
});

// Get question recordings by interview ID
export const getQuestionRecordingsByInterviewSchema = z.object({
  interviewId: idSchema,
  includeTranscription: z.boolean().default(false),
});

// Get specific question recording
export const getQuestionRecordingByIdSchema = z.object({
  id: idSchema,
  includeVideoUrl: z.boolean().default(true),
});

// Initiate upload for question recording
export const initiateQuestionUploadSchema = z.object({
  recordingId: idSchema,
  fileSize: z.bigint().positive(),
  duration: durationSchema.optional(),
  mimeType: z.string().default("video/webm"),
});

// Complete upload for question recording
export const completeQuestionUploadSchema = z.object({
  recordingId: idSchema,
  filePath: z.string(),
  fileSize: z.bigint().positive(),
  duration: durationSchema,
});

// Retry failed upload
export const retryUploadSchema = z.object({
  recordingId: idSchema,
});

// Delete question recording
export const deleteQuestionRecordingSchema = z.object({
  id: idSchema,
});

// List question recordings with filtering
export const listQuestionRecordingsSchema = z.object({
  ...paginationSchema.shape,
  interviewId: idSchema.optional(),
  uploadStatus: uploadStatusSchema.optional(),
  questionOrder: z.number().int().min(0).optional(),
});

// Output schemas
export const questionRecordingOutputSchema = z.object({
  id: idSchema,
  interviewId: idSchema,
  questionId: z.string(),
  questionText: z.string(),
  questionOrder: z.number(),
  recordingType: recordingTypeSchema,
  filePath: z.string(),
  fileSize: z.bigint(),
  duration: z.number().nullable(),
  uploadStatus: uploadStatusSchema,
  uploadStartedAt: z.date().nullable(),
  uploadCompletedAt: z.date().nullable(),
  uploadRetryCount: z.number(),
  uploadError: z.string().nullable(),
  transcriptionStatus: transcriptionStatusSchema,
  transcriptionText: z.string().nullable(),
  recordingStartedAt: z.date(),
  recordingEndedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export const uploadUrlOutputSchema = z.object({
  uploadUrl: z.string(),
  filePath: z.string(),
  bucketName: z.string(),
  expiresIn: z.number(),
});

/**
 * Type exports for use in routers
 */
export type CreateQuestionRecordingInput = z.infer<typeof createQuestionRecordingSchema>;
export type UpdateQuestionRecordingStatusInput = z.infer<typeof updateQuestionRecordingStatusSchema>;
export type GetQuestionRecordingsByInterviewInput = z.infer<typeof getQuestionRecordingsByInterviewSchema>;
export type GetQuestionRecordingByIdInput = z.infer<typeof getQuestionRecordingByIdSchema>;
export type InitiateQuestionUploadInput = z.infer<typeof initiateQuestionUploadSchema>;
export type CompleteQuestionUploadInput = z.infer<typeof completeQuestionUploadSchema>;
export type QuestionRecordingOutput = z.infer<typeof questionRecordingOutputSchema>;
export type UploadUrlOutput = z.infer<typeof uploadUrlOutputSchema>;
