import { z } from "zod";
import {
  idSchema,
  paginationSchema,
  durationSchema,
  recordingTypeSchema,
  uploadStatusSchema,
  transcriptionStatusSchema,
  metadataSchema,
} from "./common";

/**
 * Media recording validation schemas
 */

// Create media recording input
export const createMediaRecordingSchema = z.object({
  interviewId: idSchema,
  recordingType: recordingTypeSchema,
  fileName: z.string().min(1).max(255),
  fileSize: z.bigint().positive(),
  mimeType: z.string().min(1),
  duration: durationSchema.optional(),
});

// Update media recording input
export const updateMediaRecordingSchema = z.object({
  id: idSchema,
  filePath: z.string().optional(),
  fileSize: z.bigint().positive().optional(),
  duration: durationSchema.optional(),
  uploadStatus: uploadStatusSchema.optional(),
  transcriptionStatus: transcriptionStatusSchema.optional(),
  transcriptionText: z.string().optional(),
});

// Get media recording by ID
export const getMediaRecordingSchema = z.object({
  id: idSchema,
  includeTranscription: z.boolean().default(false),
});

// List media recordings
export const listMediaRecordingsSchema = z.object({
  ...paginationSchema.shape,
  interviewId: idSchema.optional(),
  recordingType: recordingTypeSchema.optional(),
  uploadStatus: uploadStatusSchema.optional(),
  transcriptionStatus: transcriptionStatusSchema.optional(),
});

// Upload management schemas
export const initiateUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.bigint().positive().max(BigInt(1024 * 1024 * 1024)), // 1GB max
  mimeType: z.string().regex(/^(video|audio)\//, "Must be video or audio file"),
  interviewId: idSchema,
  recordingType: recordingTypeSchema,
});

export const completeUploadSchema = z.object({
  recordingId: idSchema,
  uploadId: z.string(),
  etag: z.string(),
  finalFileSize: z.bigint().positive(),
});

export const abortUploadSchema = z.object({
  recordingId: idSchema,
  uploadId: z.string(),
  reason: z.string().max(500).optional(),
});

// Multipart upload schemas
export const getUploadUrlSchema = z.object({
  recordingId: idSchema,
  partNumber: z.number().int().min(1).max(10000),
  uploadId: z.string(),
});

export const listUploadPartsSchema = z.object({
  recordingId: idSchema,
  uploadId: z.string(),
});

// Processing schemas
export const processVideoSchema = z.object({
  recordingId: idSchema,
  processingOptions: z.object({
    generateThumbnail: z.boolean().default(true),
    extractAudio: z.boolean().default(true),
    compressVideo: z.boolean().default(true),
    quality: z.enum(["low", "medium", "high"]).default("medium"),
    resolution: z.enum(["480p", "720p", "1080p"]).optional(),
  }).optional(),
});

export const processAudioSchema = z.object({
  recordingId: idSchema,
  processingOptions: z.object({
    normalizeAudio: z.boolean().default(true),
    removeNoise: z.boolean().default(true),
    enhanceVoice: z.boolean().default(true),
    format: z.enum(["mp3", "wav", "m4a"]).default("mp3"),
    bitrate: z.number().int().min(64).max(320).default(128), // kbps
  }).optional(),
});

// Transcription schemas
export const requestTranscriptionSchema = z.object({
  recordingId: idSchema,
  options: z.object({
    language: z.string().default("en"),
    speakerDiarization: z.boolean().default(true),
    timestampGranularity: z.enum(["word", "segment"]).default("segment"),
    profanityFilter: z.boolean().default(false),
    smartFormatting: z.boolean().default(true),
    punctuation: z.boolean().default(true),
  }).optional(),
});

export const updateTranscriptionSchema = z.object({
  recordingId: idSchema,
  transcriptionText: z.string(),
  segments: z.array(z.object({
    text: z.string(),
    start: z.number().min(0), // seconds
    end: z.number().min(0), // seconds
    speaker: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  })).optional(),
});

// Download and streaming schemas
export const getDownloadUrlSchema = z.object({
  recordingId: idSchema,
  expiresIn: z.number().int().min(300).max(86400).default(3600), // seconds
  quality: z.enum(["original", "compressed"]).default("original"),
});

export const getStreamingUrlSchema = z.object({
  recordingId: idSchema,
  quality: z.enum(["low", "medium", "high"]).default("medium"),
  format: z.enum(["hls", "dash", "mp4"]).default("mp4"),
});

// Analytics schemas
export const getMediaAnalyticsSchema = z.object({
  recordingId: idSchema.optional(),
  interviewId: idSchema.optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
});

export const recordingSearchSchema = z.object({
  query: z.string().min(1).max(255),
  interviewId: idSchema.optional(),
  recordingType: recordingTypeSchema.optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  ...paginationSchema.shape,
});

// Output schemas
export const mediaRecordingOutputSchema = z.object({
  id: idSchema,
  interviewId: idSchema,
  recordingType: recordingTypeSchema,
  filePath: z.string(),
  fileSize: z.bigint(),
  duration: z.number().nullable(),
  uploadStatus: uploadStatusSchema,
  transcriptionStatus: transcriptionStatusSchema,
  transcriptionText: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  ...metadataSchema.shape,
  downloadUrl: z.string().optional(),
  streamingUrl: z.string().optional(),
  metadata: z.object({
    resolution: z.string().optional(),
    bitrate: z.number().optional(),
    codec: z.string().optional(),
    frameRate: z.number().optional(),
    aspectRatio: z.string().optional(),
  }).optional(),
});

export const uploadInfoOutputSchema = z.object({
  uploadId: z.string(),
  uploadUrls: z.array(z.object({
    partNumber: z.number(),
    uploadUrl: z.string(),
  })),
  maxPartSize: z.number(),
  expiresIn: z.number(), // seconds
});

export const transcriptionOutputSchema = z.object({
  recordingId: idSchema,
  text: z.string(),
  confidence: z.number().min(0).max(1),
  language: z.string(),
  duration: z.number(),
  wordCount: z.number(),
  segments: z.array(z.object({
    id: z.string(),
    text: z.string(),
    start: z.number(),
    end: z.number(),
    speaker: z.string().nullable(),
    confidence: z.number().min(0).max(1).nullable(),
    words: z.array(z.object({
      word: z.string(),
      start: z.number(),
      end: z.number(),
      confidence: z.number().min(0).max(1),
    })).optional(),
  })),
  speakers: z.array(z.object({
    id: z.string(),
    label: z.string(),
    duration: z.number(),
    wordCount: z.number(),
  })).optional(),
  processingTime: z.number(), // seconds
  model: z.string(),
});

export const mediaAnalyticsOutputSchema = z.object({
  totalRecordings: z.number(),
  totalDuration: z.number(), // seconds
  totalFileSize: z.bigint(),
  averageFileSize: z.number(),
  averageDuration: z.number(),
  recordingsByType: z.record(z.number()),
  uploadStatusDistribution: z.record(z.number()),
  transcriptionStatusDistribution: z.record(z.number()),
  dailyStats: z.array(z.object({
    date: z.string(),
    count: z.number(),
    totalDuration: z.number(),
    totalSize: z.bigint(),
  })),
  topInterviews: z.array(z.object({
    interviewId: idSchema,
    recordingCount: z.number(),
    totalDuration: z.number(),
    jobTitle: z.string(),
  })),
});

export const mediaListOutputSchema = z.object({
  items: z.array(mediaRecordingOutputSchema),
  hasNextPage: z.boolean(),
  nextCursor: z.string().optional(),
  totalCount: z.number().optional(),
  totalSize: z.bigint().optional(),
  totalDuration: z.number().optional(),
});

/**
 * Type exports for use in routers
 */
export type CreateMediaRecordingInput = z.infer<typeof createMediaRecordingSchema>;
export type UpdateMediaRecordingInput = z.infer<typeof updateMediaRecordingSchema>;
export type ListMediaRecordingsInput = z.infer<typeof listMediaRecordingsSchema>;
export type MediaRecordingOutput = z.infer<typeof mediaRecordingOutputSchema>;
export type MediaListOutput = z.infer<typeof mediaListOutputSchema>;
export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>;
export type UploadInfoOutput = z.infer<typeof uploadInfoOutputSchema>;
export type TranscriptionOutput = z.infer<typeof transcriptionOutputSchema>;
export type MediaAnalyticsOutput = z.infer<typeof mediaAnalyticsOutputSchema>;