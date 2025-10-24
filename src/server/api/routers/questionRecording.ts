import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import {
  createQuestionRecordingSchema,
  updateQuestionRecordingStatusSchema,
  getQuestionRecordingsByInterviewSchema,
  getQuestionRecordingByIdSchema,
  initiateQuestionUploadSchema,
  completeQuestionUploadSchema,
  retryUploadSchema,
  deleteQuestionRecordingSchema,
  listQuestionRecordingsSchema,
  type QuestionRecordingOutput,
  type UploadUrlOutput,
} from "../schemas/questionRecording";
import { processQuestionRecording } from "~/server/ai/services/video-assessment.service";

// Initialize Supabase client for storage operations
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
};

const STORAGE_BUCKET = "interview-question-videos";

export const questionRecordingRouter = createTRPCRouter({
  /**
   * Create a new question recording entry
   */
  create: protectedProcedure
    .input(createQuestionRecordingSchema)
    .mutation(async ({ ctx, input }) => {
      const { interviewId, questionId, questionText, questionOrder, recordingStartedAt } = input;

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

      // Create question recording entry
      const questionRecording = await ctx.db.interviewQuestionRecording.create({
        data: {
          interviewId,
          questionId,
          questionText,
          questionOrder,
          recordingType: "SCREEN_AND_AUDIO",
          filePath: "", // Will be set during upload
          fileSize: BigInt(0), // Will be set during upload
          uploadStatus: "UPLOADING",
          recordingStartedAt,
        },
      });

      return questionRecording;
    }),

  /**
   * Update question recording status
   */
  updateStatus: protectedProcedure
    .input(updateQuestionRecordingStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify recording exists and user has permission
      const existing = await ctx.db.interviewQuestionRecording.findFirst({
        where: {
          id,
          interview: {
            userId: ctx.user.id,
            deletedAt: null,
          },
        },
      });

      if (!existing) {
        throw createError.notFound("Question recording", id);
      }

      const updatedRecording = await ctx.db.interviewQuestionRecording.update({
        where: { id },
        data: updateData,
      });

      return updatedRecording;
    }),

  /**
   * Get all question recordings for an interview
   */
  getByInterviewId: protectedProcedure
    .input(getQuestionRecordingsByInterviewSchema)
    .query(async ({ ctx, input }) => {
      const { interviewId, includeTranscription } = input;

      // Verify interview exists and user has permission
      const interview = await ctx.db.interview.findFirst({
        where: {
          id: interviewId,
          OR: [
            { userId: ctx.user.id },
            ...(ctx.user.role === "ADMIN" ? [{}] : []),
          ],
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", interviewId);
      }

      const recordings = await ctx.db.interviewQuestionRecording.findMany({
        where: { interviewId },
        orderBy: { questionOrder: "asc" },
      });

      // Generate signed URLs for completed recordings
      const supabase = getSupabaseClient();
      const recordingsWithUrls: QuestionRecordingOutput[] = await Promise.all(
        recordings.map(async (recording) => {
          let videoUrl: string | undefined;
          let thumbnailUrl: string | undefined;

          if (recording.uploadStatus === "COMPLETED" && recording.filePath) {
            try {
              const { data: urlData } = await supabase.storage
                .from(STORAGE_BUCKET)
                .createSignedUrl(recording.filePath, 3600); // 1 hour expiry

              if (urlData?.signedUrl) {
                videoUrl = urlData.signedUrl;
              }
            } catch (error) {
              console.error(`Failed to generate signed URL for recording ${recording.id}:`, error);
            }
          }

          return {
            ...recording,
            videoUrl,
            thumbnailUrl,
          } as QuestionRecordingOutput;
        })
      );

      return recordingsWithUrls;
    }),

  /**
   * Get specific question recording by ID
   */
  getById: protectedProcedure
    .input(getQuestionRecordingByIdSchema)
    .query(async ({ ctx, input }) => {
      const { id, includeVideoUrl } = input;

      const recording = await ctx.db.interviewQuestionRecording.findFirst({
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

      if (!recording) {
        throw createError.notFound("Question recording", id);
      }

      let videoUrl: string | undefined;

      if (includeVideoUrl && recording.uploadStatus === "COMPLETED" && recording.filePath) {
        try {
          const supabase = getSupabaseClient();
          const { data: urlData } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(recording.filePath, 3600);

          if (urlData?.signedUrl) {
            videoUrl = urlData.signedUrl;
          }
        } catch (error) {
          console.error(`Failed to generate signed URL for recording ${id}:`, error);
        }
      }

      return {
        ...recording,
        videoUrl,
      } as QuestionRecordingOutput;
    }),

  /**
   * Initiate upload for question recording
   */
  initiateUpload: protectedProcedure
    .input(initiateQuestionUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId, fileSize, duration, mimeType } = input;

      // Verify recording exists and user has permission
      const recording = await ctx.db.interviewQuestionRecording.findFirst({
        where: {
          id: recordingId,
          interview: {
            userId: ctx.user.id,
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Question recording", recordingId);
      }

      // Generate file path
      const timestamp = Date.now();
      const filePath = `${ctx.user.id}/${recording.interviewId}/question_${recording.questionOrder}_${timestamp}.webm`;

      // Update recording with file path and upload started timestamp
      await ctx.db.interviewQuestionRecording.update({
        where: { id: recordingId },
        data: {
          filePath,
          fileSize,
          duration: duration ?? null,
          uploadStartedAt: new Date(),
          uploadStatus: "UPLOADING",
        },
      });

      // Generate upload URL (Supabase signed upload URL)
      const supabase = getSupabaseClient();
      const { data: urlData, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(filePath);

      if (error || !urlData) {
        throw createError.internal(`Failed to generate upload URL: ${error?.message}`);
      }

      const uploadInfo: UploadUrlOutput = {
        uploadUrl: urlData.signedUrl,
        filePath,
        bucketName: STORAGE_BUCKET,
        expiresIn: 3600, // 1 hour
      };

      return uploadInfo;
    }),

  /**
   * Complete upload for question recording
   */
  completeUpload: protectedProcedure
    .input(completeQuestionUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId, filePath, fileSize, duration } = input;

      // Verify recording exists and user has permission
      const recording = await ctx.db.interviewQuestionRecording.findFirst({
        where: {
          id: recordingId,
          interview: {
            userId: ctx.user.id,
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Question recording", recordingId);
      }

      // Update recording status to completed
      const updatedRecording = await ctx.db.interviewQuestionRecording.update({
        where: { id: recordingId },
        data: {
          uploadStatus: "COMPLETED",
          uploadCompletedAt: new Date(),
          filePath,
          fileSize,
          duration,
          uploadError: null,
        },
      });

      // Trigger video assessment asynchronously (don't await - background processing)
      processQuestionRecording({ recordingId })
        .catch((error) => {
          console.error(`[Upload Hook] Failed to trigger assessment for ${recordingId}:`, error);
        });

      return {
        success: true,
        recording: updatedRecording,
      };
    }),

  /**
   * Retry failed upload
   */
  retryUpload: protectedProcedure
    .input(retryUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordingId } = input;

      // Verify recording exists and user has permission
      const recording = await ctx.db.interviewQuestionRecording.findFirst({
        where: {
          id: recordingId,
          interview: {
            userId: ctx.user.id,
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Question recording", recordingId);
      }

      // Increment retry count and reset upload status
      const updatedRecording = await ctx.db.interviewQuestionRecording.update({
        where: { id: recordingId },
        data: {
          uploadStatus: "UPLOADING",
          uploadRetryCount: recording.uploadRetryCount + 1,
          uploadError: null,
        },
      });

      return updatedRecording;
    }),

  /**
   * Delete question recording
   */
  delete: protectedProcedure
    .input(deleteQuestionRecordingSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Verify recording exists and user has permission
      const recording = await ctx.db.interviewQuestionRecording.findFirst({
        where: {
          id,
          interview: {
            userId: ctx.user.id,
            deletedAt: null,
          },
        },
      });

      if (!recording) {
        throw createError.notFound("Question recording", id);
      }

      // Delete from storage if file exists
      if (recording.filePath && recording.uploadStatus === "COMPLETED") {
        try {
          const supabase = getSupabaseClient();
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([recording.filePath]);
        } catch (error) {
          console.error(`Failed to delete video file for recording ${id}:`, error);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      await ctx.db.interviewQuestionRecording.delete({
        where: { id },
      });

      return { success: true };
    }),

  /**
   * List question recordings with filtering
   */
  list: protectedProcedure
    .input(listQuestionRecordingsSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, interviewId, uploadStatus, questionOrder } = input;

      // Build filters
      const userFilter = ctx.user.role === "ADMIN"
        ? {}
        : { interview: { userId: ctx.user.id } };

      const filters: any = {
        ...userFilter,
        interview: { deletedAt: null },
      };

      if (interviewId) filters.interviewId = interviewId;
      if (uploadStatus) filters.uploadStatus = uploadStatus;
      if (questionOrder !== undefined) filters.questionOrder = questionOrder;

      const recordings = await ctx.db.interviewQuestionRecording.findMany({
        where: filters,
        orderBy: [
          { interviewId: "desc" },
          { questionOrder: "asc" },
        ],
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      const hasNextPage = recordings.length === limit;
      const nextCursor = hasNextPage ? recordings[recordings.length - 1]?.id : undefined;

      return {
        items: recordings,
        hasNextPage,
        nextCursor,
      };
    }),
});
