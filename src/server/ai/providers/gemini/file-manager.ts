import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { env } from "~/env";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

/**
 * Singleton instance of Gemini File Manager for uploading media files
 */
export const geminiFileManager = new GoogleAIFileManager(env.GOOGLE_GENERATIVE_AI_API_KEY);

/**
 * Supported video formats for Gemini File API
 */
export const SUPPORTED_VIDEO_FORMATS = [
  "video/webm",
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/avi",
  "video/flv",
  "video/mpg",
  "video/wmv",
  "video/3gpp",
] as const;

/**
 * File processing configuration
 */
export const FILE_PROCESSING_CONFIG = {
  maxPollAttempts: 30,
  pollIntervalMs: 2000,
  maxFileSizeBytes: 2 * 1024 * 1024 * 1024, // 2GB
} as const;

/**
 * Upload a video file to Gemini File API and wait for processing to complete
 *
 * @param videoBuffer - The video file as a Buffer
 * @param mimeType - The MIME type of the video (default: video/webm)
 * @param displayName - Optional display name for the file
 * @returns Object containing the file URI and MIME type
 * @throws Error if upload fails or processing times out
 */
export async function uploadVideoToGemini(
  videoBuffer: Buffer,
  mimeType: string = "video/webm",
  displayName?: string
): Promise<{ fileUri: string; mimeType: string; fileName: string }> {
  try {
    // Validate file size
    if (videoBuffer.length > FILE_PROCESSING_CONFIG.maxFileSizeBytes) {
      throw new Error(
        `Video file size (${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (2GB)`
      );
    }

    // Validate MIME type
    if (!SUPPORTED_VIDEO_FORMATS.includes(mimeType as any)) {
      throw new Error(
        `Unsupported video format: ${mimeType}. Supported formats: ${SUPPORTED_VIDEO_FORMATS.join(", ")}`
      );
    }

    console.log(`[Gemini File API] Uploading video (${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB)...`);

    // Write buffer to a temporary file (GoogleAIFileManager requires a file path in Node.js)
    const tempFileName = `gemini_upload_${Date.now()}_${Math.random().toString(36).substring(7)}.webm`;
    const tempFilePath = join(tmpdir(), tempFileName);

    try {
      await writeFile(tempFilePath, videoBuffer);

      // Upload the video file
      const uploadResult = await geminiFileManager.uploadFile(tempFilePath, {
        mimeType,
        displayName: displayName || `video_${Date.now()}`,
      });

      console.log(
        `[Gemini File API] Upload successful. File name: ${uploadResult.file.name}, State: ${uploadResult.file.state}`
      );

      // Wait for file processing to complete
      const processedFile = await waitForFileProcessing(uploadResult.file.name);

      return {
        fileUri: processedFile.uri,
        mimeType: processedFile.mimeType,
        fileName: processedFile.name,
      };
    } finally {
      // Clean up temporary file
      try {
        await unlink(tempFilePath);
        console.log(`[Gemini File API] Cleaned up temp file: ${tempFileName}`);
      } catch (cleanupError) {
        console.warn(`[Gemini File API] Failed to clean up temp file: ${tempFileName}`, cleanupError);
      }
    }
  } catch (error) {
    console.error("[Gemini File API] Upload failed:", error);
    throw new Error(
      `Failed to upload video to Gemini File API: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Poll Gemini File API to wait for file processing to complete
 *
 * @param fileName - The file name returned from the upload
 * @returns The processed file metadata
 * @throws Error if processing fails or times out
 */
async function waitForFileProcessing(fileName: string) {
  let attempts = 0;

  while (attempts < FILE_PROCESSING_CONFIG.maxPollAttempts) {
    const file = await geminiFileManager.getFile(fileName);

    console.log(
      `[Gemini File API] Processing status (attempt ${attempts + 1}/${FILE_PROCESSING_CONFIG.maxPollAttempts}): ${file.state}`
    );

    if (file.state === FileState.ACTIVE) {
      console.log(`[Gemini File API] File processing complete: ${file.name}`);
      return file;
    }

    if (file.state === FileState.FAILED) {
      throw new Error(
        `Gemini file processing failed for ${fileName}. The video may be corrupted or in an unsupported format.`
      );
    }

    // Still processing, wait before next poll
    await new Promise((resolve) =>
      setTimeout(resolve, FILE_PROCESSING_CONFIG.pollIntervalMs)
    );
    attempts++;
  }

  throw new Error(
    `Gemini file processing timed out after ${FILE_PROCESSING_CONFIG.maxPollAttempts * FILE_PROCESSING_CONFIG.pollIntervalMs / 1000} seconds`
  );
}

/**
 * Delete a file from Gemini File API
 *
 * @param fileName - The file name to delete
 * @returns True if successful
 */
export async function deleteGeminiFile(fileName: string): Promise<boolean> {
  try {
    await geminiFileManager.deleteFile(fileName);
    console.log(`[Gemini File API] Deleted file: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`[Gemini File API] Failed to delete file ${fileName}:`, error);
    return false;
  }
}

/**
 * Get file metadata from Gemini File API
 *
 * @param fileName - The file name to retrieve
 * @returns File metadata
 */
export async function getGeminiFile(fileName: string) {
  try {
    return await geminiFileManager.getFile(fileName);
  } catch (error) {
    console.error(`[Gemini File API] Failed to get file ${fileName}:`, error);
    throw new Error(
      `Failed to retrieve file metadata: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
