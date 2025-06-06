import { useState, useCallback } from "react";
import { api } from "~/trpc/react";
import type { RecordingType as PrismaRecordingType } from "@prisma/client";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  status: "idle" | "uploading" | "completed" | "failed";
  progress: UploadProgress;
  error: string | null;
  recordingId: string | null;
}

export interface UseMediaUploadOptions {
  interviewId: string;
  onUploadComplete?: (recordingId: string) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadError?: (error: string) => void;
}

export interface UseMediaUploadReturn {
  uploadState: UploadState;
  uploadRecording: (blob: Blob, recordingType: PrismaRecordingType, fileName?: string) => Promise<boolean>;
  cancelUpload: () => void;
  clearUpload: () => void;
}

/**
 * Hook for uploading media recordings via tRPC API
 */
export function useMediaUpload({
  interviewId,
  onUploadComplete,
  onUploadProgress,
  onUploadError,
}: UseMediaUploadOptions): UseMediaUploadReturn {
  
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: { loaded: 0, total: 0, percentage: 0 },
    error: null,
    recordingId: null,
  });

  // tRPC mutations
  const initiateUploadMutation = api.media.initiateUpload.useMutation();
  const completeUploadMutation = api.media.completeUpload.useMutation();
  const abortUploadMutation = api.media.abortUpload.useMutation();

  const updateProgress = useCallback((loaded: number, total: number) => {
    const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
    const progress = { loaded, total, percentage };
    
    setUploadState(prev => ({ ...prev, progress }));
    onUploadProgress?.(progress);
  }, [onUploadProgress]);

  const setError = useCallback((error: string) => {
    setUploadState(prev => ({ 
      ...prev, 
      status: "failed", 
      error 
    }));
    onUploadError?.(error);
  }, [onUploadError]);

  /**
   * Convert recording type to match Prisma enum
   */
  const mapRecordingType = useCallback((type: string): PrismaRecordingType => {
    switch (type) {
      case "screen":
        return "SCREEN";
      case "audio":
        return "AUDIO";
      case "screen_and_audio":
        return "SCREEN_AND_AUDIO";
      default:
        return "SCREEN_AND_AUDIO";
    }
  }, []);

  /**
   * Get MIME type from blob
   */
  const getMimeType = useCallback((blob: Blob): string => {
    if (blob.type) {
      return blob.type;
    }
    
    // Fallback MIME type detection based on common recording formats
    return "video/webm";
  }, []);

  /**
   * Get file extension from MIME type
   */
  const getFileExtension = useCallback((mimeType: string): string => {
    const extensions: Record<string, string> = {
      "video/webm": "webm",
      "video/mp4": "mp4",
      "audio/webm": "webm",
      "audio/mp4": "m4a",
      "audio/wav": "wav",
      "audio/ogg": "ogg",
    };
    
    return extensions[mimeType] || "webm";
  }, []);

  /**
   * Upload file via chunked upload
   */
  const uploadFileChunked = useCallback(async (
    blob: Blob, 
    uploadUrls: Array<{ partNumber: number; uploadUrl: string }>,
    recordingId: string
  ): Promise<string> => {
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    const chunks: Blob[] = [];
    
    // Split blob into chunks
    for (let start = 0; start < blob.size; start += chunkSize) {
      const end = Math.min(start + chunkSize, blob.size);
      chunks.push(blob.slice(start, end));
    }

    let uploadedBytes = 0;
    const etags: string[] = [];

    // Upload chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) {
        throw new Error(`Invalid chunk at index ${i}`);
      }
      
      const uploadUrl = uploadUrls[i]?.uploadUrl;
      
      if (!uploadUrl) {
        throw new Error(`No upload URL for chunk ${i + 1}`);
      }

      try {
        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: chunk,
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed for chunk ${i + 1}: ${response.statusText}`);
        }

        // Extract ETag from response headers
        const etag = response.headers.get("etag") || `"chunk-${i + 1}"`;
        etags.push(etag);

        uploadedBytes += chunk.size;
        updateProgress(uploadedBytes, blob.size);

      } catch (err) {
        throw new Error(`Failed to upload chunk ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Return the ETag of the final chunk (simplified)
    return etags[etags.length - 1] || '"upload-complete"';
  }, [updateProgress]);

  /**
   * Upload recording to server
   */
  const uploadRecording = useCallback(async (
    blob: Blob, 
    recordingType: PrismaRecordingType,
    fileName?: string
  ): Promise<boolean> => {
    if (uploadState.status === "uploading") {
      return false;
    }

    const mimeType = getMimeType(blob);
    const extension = getFileExtension(mimeType);
    const finalFileName = fileName || `recording-${Date.now()}.${extension}`;

    setUploadState({
      status: "uploading",
      progress: { loaded: 0, total: blob.size, percentage: 0 },
      error: null,
      recordingId: null,
    });

    try {
      // Step 1: Initiate upload
      const uploadInfo = await initiateUploadMutation.mutateAsync({
        fileName: finalFileName,
        fileSize: BigInt(blob.size),
        mimeType,
        interviewId,
        recordingType,
      });

      // Step 2: Upload file (simulate chunked upload)
      updateProgress(0, blob.size);

      // For now, simulate upload progress since we're using mock endpoints
      // In production, this would use the actual uploadUrls from uploadInfo
      const uploadPromise = new Promise<string>((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            updateProgress(blob.size, blob.size);
            resolve('"mock-etag"');
          } else {
            updateProgress(Math.floor((progress / 100) * blob.size), blob.size);
          }
        }, 200);

        // Simulate upload failure occasionally for testing
        setTimeout(() => {
          if (Math.random() < 0.05) { // 5% failure rate
            clearInterval(interval);
            reject(new Error("Simulated upload failure"));
          }
        }, 1000);
      });

      const etag = await uploadPromise;

      // Step 3: Complete upload
      const result = await completeUploadMutation.mutateAsync({
        recordingId: uploadInfo.uploadId, // In mock, uploadId is used as recordingId
        uploadId: uploadInfo.uploadId,
        etag,
        finalFileSize: BigInt(blob.size),
      });

      setUploadState(prev => ({
        ...prev,
        status: "completed",
        recordingId: uploadInfo.uploadId,
      }));

      onUploadComplete?.(uploadInfo.uploadId);
      return true;

    } catch (err) {
      let errorMessage = "Upload failed";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Try to abort the upload if we have a recording ID
      if (uploadState.recordingId) {
        try {
          await abortUploadMutation.mutateAsync({
            recordingId: uploadState.recordingId,
            uploadId: "unknown",
            reason: errorMessage,
          });
        } catch (abortErr) {
          console.warn("Failed to abort upload:", abortErr);
        }
      }

      setError(errorMessage);
      return false;
    }
  }, [
    uploadState.status,
    uploadState.recordingId,
    interviewId,
    getMimeType,
    getFileExtension,
    initiateUploadMutation,
    completeUploadMutation,
    abortUploadMutation,
    updateProgress,
    onUploadComplete,
    setError,
  ]);

  /**
   * Cancel ongoing upload
   */
  const cancelUpload = useCallback(async () => {
    if (uploadState.status !== "uploading" || !uploadState.recordingId) {
      return;
    }

    try {
      await abortUploadMutation.mutateAsync({
        recordingId: uploadState.recordingId,
        uploadId: "unknown",
        reason: "Upload cancelled by user",
      });
    } catch (err) {
      console.warn("Failed to cancel upload:", err);
    }

    setUploadState(prev => ({
      ...prev,
      status: "idle",
      error: "Upload cancelled",
    }));
  }, [uploadState.status, uploadState.recordingId, abortUploadMutation]);

  /**
   * Clear upload state
   */
  const clearUpload = useCallback(() => {
    setUploadState({
      status: "idle",
      progress: { loaded: 0, total: 0, percentage: 0 },
      error: null,
      recordingId: null,
    });
  }, []);

  return {
    uploadState,
    uploadRecording,
    cancelUpload,
    clearUpload,
  };
}