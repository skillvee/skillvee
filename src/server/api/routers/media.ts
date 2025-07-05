import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { 
  createTRPCRouter, 
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import {
  createPaginationArgs,
  processPaginationResults,
  combineFilters,
  createInclusionFilter,
} from "../utils/pagination";

import {
  createMediaRecordingSchema,
  updateMediaRecordingSchema,
  getMediaRecordingSchema,
  listMediaRecordingsSchema,
  initiateUploadSchema,
  completeUploadSchema,
  abortUploadSchema,
  processVideoSchema,
  processAudioSchema,
  requestTranscriptionSchema,
  updateTranscriptionSchema,
  getDownloadUrlSchema,
  getStreamingUrlSchema,
  getMediaAnalyticsSchema,
  recordingSearchSchema,
  type MediaRecordingOutput,
  type MediaListOutput,
  type UploadInfoOutput,
  type TranscriptionOutput,
  type MediaAnalyticsOutput,
} from "../schemas/media";

export const mediaRouter = createTRPCRouter({
  /**
   * Create a new media recording entry
   */
  create: protectedProcedure
    .input(createMediaRecordingSchema)
    .mutation(async ({ ctx, input }) => {
      const { interviewId, recordingType, fileName, fileSize, mimeType, duration } = input;

      // Verify interview exists and user has permission
      const interview = await ctx.db.interview.findFirst({
        where: {
          id: interviewId,
          userId: ctx.user.id,
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", interviewId);
      }

      const mediaRecording = await ctx.db.mediaRecording.create({
        data: {
          interviewId,
          recordingType,
          filePath: `/uploads/${interviewId}/${fileName}`, // Mock file path
          fileSize,
          duration,
          uploadStatus: "UPLOADING",
          transcriptionStatus: "PENDING",
        },
      });

      return mediaRecording;
    }),

  /**
   * Get media recording by ID
   */
  getById: protectedProcedure
    .input(getMediaRecordingSchema)
    .query(async ({ ctx, input }) => {
      const { id, includeTranscription } = input;

      const mediaRecording = await ctx.db.mediaRecording.findFirst({
        where: {
          id,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!mediaRecording) {
        throw createError.notFound("Media recording", id);
      }

      // Generate download URL if recording is completed
      const downloadUrl = mediaRecording.uploadStatus === "COMPLETED" 
        ? `/api/media/download/${id}?token=mock_token`
        : undefined;

      const streamingUrl = mediaRecording.uploadStatus === "COMPLETED" 
        ? `/api/media/stream/${id}?token=mock_token`
        : undefined;

      return {
        ...mediaRecording,
        downloadUrl,
        streamingUrl,
        metadata: {
          resolution: "1920x1080",
          bitrate: 2500,
          codec: "h264",
          frameRate: 30,
          aspectRatio: "16:9",
        },
      } as MediaRecordingOutput;
    }),

  /**
   * Update media recording
   */
  update: protectedProcedure
    .input(updateMediaRecordingSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify media recording exists and user has permission
      const existing = await ctx.db.mediaRecording.findFirst({
        where: {
          id,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!existing) {
        throw createError.notFound("Media recording", id);
      }

      const updatedRecording = await ctx.db.mediaRecording.update({
        where: { id },
        data: updateData,
      });

      return updatedRecording;
    }),

  /**
   * List media recordings with filtering
   */
  list: protectedProcedure
    .input(listMediaRecordingsSchema)
    .query(async ({ ctx, input }) => {
      const { 
        limit, 
        cursor, 
        interviewId, 
        recordingType, 
        uploadStatus, 
        transcriptionStatus 
      } = input;

      // Build filters
      const userFilter = ctx.user.role === "ADMIN" 
        ? {} 
        : { interview: { userId: ctx.user.id } };

      const filters = combineFilters(
        userFilter,
        { interview: { deletedAt: null } },
        interviewId ? { interviewId } : undefined,
        recordingType ? { recordingType } : undefined,
        uploadStatus ? { uploadStatus } : undefined,
        transcriptionStatus ? { transcriptionStatus } : undefined
      );

      const recordings = await ctx.db.mediaRecording.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      const paginationResult = processPaginationResults(recordings, { limit, cursor });

      // Calculate totals
      const [totalCount, totalSize, totalDuration] = await Promise.all([
        ctx.db.mediaRecording.count({ where: filters }),
        ctx.db.mediaRecording.aggregate({
          where: filters,
          _sum: { fileSize: true },
        }),
        ctx.db.mediaRecording.aggregate({
          where: { ...filters, duration: { not: null } },
          _sum: { duration: true },
        }),
      ]);

      // Add required fields for MediaListOutput
      const recordingsWithMetadata = paginationResult.items.map(recording => ({
        ...recording,
        thumbnailUrl: null,
        downloadUrl: undefined,
        streamingUrl: undefined,
        metadata: undefined,
      }));

      return {
        ...paginationResult,
        items: recordingsWithMetadata,
        totalCount,
        totalSize: totalSize._sum.fileSize || BigInt(0),
        totalDuration: totalDuration._sum.duration || 0,
      } as MediaListOutput;
    }),

  /**
   * Initiate file upload
   */
  initiateUpload: protectedProcedure
    .input(initiateUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { fileName, fileSize, mimeType, interviewId, recordingType } = input;

      // Verify interview exists
      const interview = await ctx.db.interview.findFirst({
        where: {
          id: interviewId,
          userId: ctx.user.id,
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", interviewId);
      }

      // Create media recording entry
      const mediaRecording = await ctx.db.mediaRecording.create({
        data: {
          interviewId,
          recordingType,
          filePath: `/uploads/${interviewId}/${fileName}`,
          fileSize,
          uploadStatus: "UPLOADING",
          transcriptionStatus: "PENDING",
        },
      });

      // Generate mock upload URLs (in production, use AWS S3 or similar)
      const uploadInfo: UploadInfoOutput = {
        uploadId: `upload_${Date.now()}`,
        uploadUrls: [
          {
            partNumber: 1,
            uploadUrl: `/api/upload/${mediaRecording.id}/part1?token=mock_token`,
          },
        ],
        maxPartSize: 50 * 1024 * 1024, // 50MB
        expiresIn: 3600, // 1 hour
      };

      return uploadInfo;
    }),

  /**
   * Complete file upload
   */
  completeUpload: protectedProcedure
    .input(completeUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId, uploadId, etag, finalFileSize } = input;

      // Verify recording exists and user has permission
      const recording = await ctx.db.mediaRecording.findFirst({
        where: {
          id: recordingId,
          interview: {
            userId: ctx.user.id,
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Media recording", recordingId);
      }

      // Update recording status
      const updatedRecording = await ctx.db.mediaRecording.update({
        where: { id: recordingId },
        data: {
          uploadStatus: "COMPLETED",
          fileSize: finalFileSize,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        recording: updatedRecording,
      };
    }),

  /**
   * Abort file upload
   */
  abortUpload: protectedProcedure
    .input(abortUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId, uploadId, reason } = input;

      // Update recording status to failed
      await ctx.db.mediaRecording.update({
        where: { id: recordingId },
        data: {
          uploadStatus: "FAILED",
          updatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Process video recording
   */
  processVideo: protectedProcedure
    .input(processVideoSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId, processingOptions } = input;

      // Verify recording exists
      const recording = await ctx.db.mediaRecording.findFirst({
        where: {
          id: recordingId,
          uploadStatus: "COMPLETED",
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Completed media recording", recordingId);
      }

      // Simulate video processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        processingJobId: `job_${Date.now()}`,
        estimatedDuration: 300, // 5 minutes
        options: processingOptions,
      };
    }),

  /**
   * Process audio recording
   */
  processAudio: protectedProcedure
    .input(processAudioSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId, processingOptions } = input;

      // Verify recording exists
      const recording = await ctx.db.mediaRecording.findFirst({
        where: {
          id: recordingId,
          uploadStatus: "COMPLETED",
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Completed media recording", recordingId);
      }

      // Simulate audio processing
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        success: true,
        processingJobId: `job_${Date.now()}`,
        estimatedDuration: 120, // 2 minutes
        options: processingOptions,
      };
    }),

  /**
   * Request transcription
   */
  requestTranscription: protectedProcedure
    .input(requestTranscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId, options } = input;

      // Verify recording exists and is completed
      const recording = await ctx.db.mediaRecording.findFirst({
        where: {
          id: recordingId,
          uploadStatus: "COMPLETED",
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Completed media recording", recordingId);
      }

      // Update transcription status
      await ctx.db.mediaRecording.update({
        where: { id: recordingId },
        data: {
          transcriptionStatus: "IN_PROGRESS",
          updatedAt: new Date(),
        },
      });

      // Simulate transcription processing
      setTimeout(async () => {
        await ctx.db.mediaRecording.update({
          where: { id: recordingId },
          data: {
            transcriptionStatus: "COMPLETED",
            transcriptionText: "Sample transcription text from the interview recording...",
            updatedAt: new Date(),
          },
        });
      }, 5000);

      return {
        success: true,
        transcriptionJobId: `transcription_${Date.now()}`,
        estimatedDuration: 300, // 5 minutes
        options,
      };
    }),

  /**
   * Update transcription
   */
  updateTranscription: protectedProcedure
    .input(updateTranscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId, transcriptionText } = input;

      // Verify recording exists and user has permission
      const recording = await ctx.db.mediaRecording.findFirst({
        where: {
          id: recordingId,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Media recording", recordingId);
      }

      const updatedRecording = await ctx.db.mediaRecording.update({
        where: { id: recordingId },
        data: {
          transcriptionText,
          transcriptionStatus: "COMPLETED",
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        recording: updatedRecording,
      };
    }),

  /**
   * Get download URL
   */
  getDownloadUrl: protectedProcedure
    .input(getDownloadUrlSchema)
    .query(async ({ ctx, input }) => {
      const { recordingId, expiresIn, quality } = input;

      // Verify recording exists and user has permission
      const recording = await ctx.db.mediaRecording.findFirst({
        where: {
          id: recordingId,
          uploadStatus: "COMPLETED",
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Media recording", recordingId);
      }

      const downloadUrl = `/api/media/download/${recordingId}?quality=${quality}&token=mock_token&expires=${Date.now() + expiresIn * 1000}`;

      return {
        downloadUrl,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        quality,
        fileSize: recording.fileSize,
      };
    }),

  /**
   * Get streaming URL
   */
  getStreamingUrl: protectedProcedure
    .input(getStreamingUrlSchema)
    .query(async ({ ctx, input }) => {
      const { recordingId, quality, format } = input;

      // Verify recording exists and user has permission
      const recording = await ctx.db.mediaRecording.findFirst({
        where: {
          id: recordingId,
          uploadStatus: "COMPLETED",
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Media recording", recordingId);
      }

      const streamingUrl = `/api/media/stream/${recordingId}?quality=${quality}&format=${format}&token=mock_token`;

      return {
        streamingUrl,
        quality,
        format,
        duration: recording.duration,
      };
    }),

  /**
   * Get media analytics
   */
  getAnalytics: protectedProcedure
    .input(getMediaAnalyticsSchema)
    .query(async ({ ctx, input }) => {
      const { recordingId, interviewId, dateRange } = input;

      // Build filters based on permissions
      const userFilter = ctx.user.role === "ADMIN" 
        ? {} 
        : { interview: { userId: ctx.user.id } };

      const filters = combineFilters(
        userFilter,
        { interview: { deletedAt: null } },
        recordingId ? { id: recordingId } : undefined,
        interviewId ? { interviewId } : undefined,
        dateRange ? {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        } : undefined
      );

      const [
        totalRecordings,
        totalSize,
        avgFileSize,
        avgDuration,
        recordingsByType,
        uploadStatusDist,
        transcriptionStatusDist,
        // dailyStats,
        // topInterviews,
      ] = await Promise.all([
        ctx.db.mediaRecording.count({ where: filters }),
        ctx.db.mediaRecording.aggregate({
          where: filters,
          _sum: { fileSize: true },
        }),
        ctx.db.mediaRecording.aggregate({
          where: filters,
          _avg: { fileSize: true },
        }),
        ctx.db.mediaRecording.aggregate({
          where: { ...filters, duration: { not: null } },
          _avg: { duration: true },
        }),
        ctx.db.mediaRecording.groupBy({
          by: ["recordingType"],
          where: filters,
          _count: { recordingType: true },
        }),
        ctx.db.mediaRecording.groupBy({
          by: ["uploadStatus"],
          where: filters,
          _count: { uploadStatus: true },
        }),
        ctx.db.mediaRecording.groupBy({
          by: ["transcriptionStatus"],
          where: filters,
          _count: { transcriptionStatus: true },
        }),
        // Mock daily stats
        Promise.resolve([]),
        // Mock top interviews
        Promise.resolve([]),
      ]);

      const result: MediaAnalyticsOutput = {
        totalRecordings,
        totalDuration: avgDuration._avg.duration ? avgDuration._avg.duration * totalRecordings : 0,
        totalFileSize: totalSize._sum.fileSize || BigInt(0),
        averageFileSize: Number(avgFileSize._avg.fileSize) || 0,
        averageDuration: avgDuration._avg.duration || 0,
        recordingsByType: recordingsByType.reduce((acc, { recordingType, _count }) => ({
          ...acc,
          [recordingType]: _count.recordingType,
        }), {}),
        uploadStatusDistribution: uploadStatusDist.reduce((acc, { uploadStatus, _count }) => ({
          ...acc,
          [uploadStatus]: _count.uploadStatus,
        }), {}),
        transcriptionStatusDistribution: transcriptionStatusDist.reduce((acc, { transcriptionStatus, _count }) => ({
          ...acc,
          [transcriptionStatus]: _count.transcriptionStatus,
        }), {}),
        dailyStats: [],
        topInterviews: [],
      };

      return result;
    }),

  /**
   * Search recordings
   */
  search: protectedProcedure
    .input(recordingSearchSchema)
    .query(async ({ ctx, input }) => {
      const { query, interviewId, recordingType, dateRange, limit, cursor } = input;

      // Build search filters
      const userFilter = ctx.user.role === "ADMIN" 
        ? {} 
        : { interview: { userId: ctx.user.id } };

      const filters = combineFilters(
        userFilter,
        { interview: { deletedAt: null } },
        query ? {
          OR: [
            { transcriptionText: { contains: query, mode: "insensitive" } },
            { filePath: { contains: query, mode: "insensitive" } },
          ],
        } : undefined,
        interviewId ? { interviewId } : undefined,
        recordingType ? { recordingType } : undefined,
        dateRange ? {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        } : undefined
      );

      const recordings = await ctx.db.mediaRecording.findMany({
        where: filters,
        include: {
          interview: {
            select: {
              id: true,
              jobDescription: {
                select: {
                  title: true,
                  company: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      return processPaginationResults(recordings, { limit, cursor });
    }),
});