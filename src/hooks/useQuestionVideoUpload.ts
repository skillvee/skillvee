import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { api } from "~/trpc/react";

const STORAGE_BUCKET = "interview-question-videos";
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000; // 1 second

interface UploadParams {
  recordingId: string;
  blob: Blob;
  duration: number;
}

interface UploadProgress {
  recordingId: string;
  status: "idle" | "uploading" | "completed" | "failed";
  progress: number;
  error?: string;
  attempt: number;
}

export function useQuestionVideoUpload() {
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  // tRPC mutations
  const initiateUploadMutation = api.questionRecording.initiateUpload.useMutation();
  const completeUploadMutation = api.questionRecording.completeUpload.useMutation();
  const updateStatusMutation = api.questionRecording.updateStatus.useMutation();

  // Get Supabase client
  const getSupabaseClient = useCallback(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not configured");
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  // Upload with retry logic
  const uploadVideo = useCallback(async ({
    recordingId,
    blob,
    duration,
  }: UploadParams): Promise<{ success: boolean; error?: string }> => {
    let attempt = 0;

    // Initialize progress tracking
    setUploadProgress(prev => ({
      ...prev,
      [recordingId]: {
        recordingId,
        status: "uploading",
        progress: 0,
        attempt: 0,
      },
    }));

    while (attempt < MAX_RETRIES) {
      try {
        attempt++;

        // Update progress with attempt number
        setUploadProgress(prev => ({
          ...prev,
          [recordingId]: {
            ...prev[recordingId]!,
            attempt,
          },
        }));

        // Step 1: Initiate upload to get signed URL
        console.log(`[Upload] Attempt ${attempt}/${MAX_RETRIES} - Initiating upload for recording ${recordingId}`);

        const uploadInfo = await initiateUploadMutation.mutateAsync({
          recordingId,
          fileSize: BigInt(blob.size),
          duration,
          mimeType: blob.type || "video/webm",
        });

        setUploadProgress(prev => ({
          ...prev,
          [recordingId]: {
            ...prev[recordingId]!,
            progress: 25,
          },
        }));

        // Step 2: Upload to Supabase Storage using signed URL
        console.log(`[Upload] Uploading to Supabase storage: ${uploadInfo.filePath}`);

        const supabase = getSupabaseClient();

        // Use the signed upload URL
        const uploadResponse = await fetch(uploadInfo.uploadUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": blob.type || "video/webm",
            "x-upsert": "false",
          },
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        console.log(`[Upload] Upload to storage successful`);

        setUploadProgress(prev => ({
          ...prev,
          [recordingId]: {
            ...prev[recordingId]!,
            progress: 75,
          },
        }));

        // Step 3: Mark upload as completed
        console.log(`[Upload] Marking upload as completed`);

        await completeUploadMutation.mutateAsync({
          recordingId,
          filePath: uploadInfo.filePath,
          fileSize: BigInt(blob.size),
          duration,
        });

        // Success!
        setUploadProgress(prev => ({
          ...prev,
          [recordingId]: {
            ...prev[recordingId]!,
            status: "completed",
            progress: 100,
          },
        }));

        console.log(`[Upload] ✅ Upload completed successfully for recording ${recordingId}`);

        return { success: true };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Upload] ❌ Attempt ${attempt}/${MAX_RETRIES} failed:`, errorMessage);

        // Update progress with error
        setUploadProgress(prev => ({
          ...prev,
          [recordingId]: {
            ...prev[recordingId]!,
            status: attempt >= MAX_RETRIES ? "failed" : "uploading",
            error: errorMessage,
          },
        }));

        // If this is the last attempt, mark as failed in database
        if (attempt >= MAX_RETRIES) {
          try {
            await updateStatusMutation.mutateAsync({
              id: recordingId,
              uploadStatus: "FAILED",
              uploadError: errorMessage,
              uploadRetryCount: attempt,
            });
          } catch (updateError) {
            console.error("[Upload] Failed to update recording status:", updateError);
          }

          return {
            success: false,
            error: `Upload failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
          };
        }

        // Wait before retry (exponential backoff)
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`[Upload] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // This should never happen, but TypeScript needs it
    return {
      success: false,
      error: "Upload failed unexpectedly",
    };
  }, [
    initiateUploadMutation,
    completeUploadMutation,
    updateStatusMutation,
    getSupabaseClient,
  ]);

  // Get progress for a specific recording
  const getProgress = useCallback((recordingId: string): UploadProgress | null => {
    return uploadProgress[recordingId] ?? null;
  }, [uploadProgress]);

  // Clear progress for a recording
  const clearProgress = useCallback((recordingId: string) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[recordingId];
      return newProgress;
    });
  }, []);

  return {
    uploadVideo,
    getProgress,
    clearProgress,
    uploadProgress,
  };
}
