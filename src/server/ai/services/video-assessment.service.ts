import { geminiClient, GEMINI_MODELS, withRetry } from "../providers/gemini";
import { uploadVideoToGemini } from "../providers/gemini/file-manager";
import { createVideoAssessmentPrompt } from "../prompts/assessment/video-assessment";
import type {
  QuestionVideoAssessmentContext,
  QuestionAssessment,
} from "../prompts/assessment/types";
import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Supabase client for downloading videos from storage
 */
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Parameters for processing a single question recording
 */
interface ProcessQuestionRecordingParams {
  recordingId: string;
}

/**
 * Parameters for assessing a question video
 */
interface AssessQuestionVideoParams {
  recordingId: string;
  questionId: string;
  interviewId: string;
  userId: string;
}

/**
 * Result of video assessment operation
 */
interface AssessmentResult {
  success: boolean;
  data?: QuestionAssessment;
  error?: string;
}

/**
 * Main orchestrator: Process a question recording from start to finish
 * 1. Download video from Supabase
 * 2. Upload to Gemini File API
 * 3. Generate AI assessment
 * 4. Store results in database
 *
 * @param recordingId - The ID of the InterviewQuestionRecording to process
 */
export async function processQuestionRecording(
  params: ProcessQuestionRecordingParams
): Promise<void> {
  const { recordingId } = params;

  console.log(`[VideoAssessment] Starting processing for recording ${recordingId}`);

  try {
    // Fetch recording details
    const recording = await db.interviewQuestionRecording.findUnique({
      where: { id: recordingId },
      include: {
        interview: {
          include: {
            questions: {
              where: { id: { equals: undefined } }, // Will be filtered below
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!recording) {
      throw new Error(`Recording ${recordingId} not found`);
    }

    // Update status to IN_PROGRESS
    await db.interviewQuestionRecording.update({
      where: { id: recordingId },
      data: {
        assessmentStatus: "IN_PROGRESS",
        assessmentStartedAt: new Date(),
      },
    });

    // Step 1: Upload video to Gemini File API (if not already uploaded)
    let geminiFileUri = recording.geminiFileUri;

    if (!geminiFileUri) {
      console.log(`[VideoAssessment] Uploading video to Gemini File API...`);
      const uploadResult = await uploadVideoToGeminiFile({
        recordingId,
        supabaseFilePath: recording.filePath,
      });
      geminiFileUri = uploadResult.fileUri;

      // Save Gemini File URI to database
      await db.interviewQuestionRecording.update({
        where: { id: recordingId },
        data: {
          geminiFileUri: uploadResult.fileUri,
          geminiFileUploadedAt: new Date(),
        },
      });
    }

    // Step 2: Generate AI assessment
    console.log(`[VideoAssessment] Generating AI assessment...`);
    const assessmentResult = await assessQuestionVideo({
      recordingId,
      questionId: recording.questionId,
      interviewId: recording.interviewId,
      userId: recording.interview.userId,
    });

    if (!assessmentResult.success || !assessmentResult.data) {
      throw new Error(assessmentResult.error || "Assessment failed");
    }

    // Step 3: Store assessment results
    await db.interviewQuestionRecording.update({
      where: { id: recordingId },
      data: {
        assessmentStatus: "COMPLETED",
        assessmentCompletedAt: new Date(),
        assessmentData: assessmentResult.data as any,
        assessmentError: null,
      },
    });

    console.log(`[VideoAssessment] Successfully completed processing for recording ${recordingId}`);
  } catch (error) {
    console.error(`[VideoAssessment] Error processing recording ${recordingId}:`, error);

    // Update status to FAILED with error message
    await db.interviewQuestionRecording.update({
      where: { id: recordingId },
      data: {
        assessmentStatus: "FAILED",
        assessmentError: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

/**
 * Upload a video from Supabase storage to Gemini File API
 *
 * @param params - Recording ID and Supabase file path
 * @returns Gemini file URI and metadata
 */
async function uploadVideoToGeminiFile(params: {
  recordingId: string;
  supabaseFilePath: string;
}): Promise<{ fileUri: string; mimeType: string; fileName: string }> {
  const { recordingId, supabaseFilePath } = params;

  try {
    // Download video from Supabase storage
    console.log(`[VideoAssessment] Downloading video from Supabase: ${supabaseFilePath}`);
    const { data: videoBlob, error: downloadError } = await supabase.storage
      .from("interview-question-videos")
      .download(supabaseFilePath);

    if (downloadError || !videoBlob) {
      throw new Error(`Failed to download video from Supabase: ${downloadError?.message || "No data"}`);
    }

    // Convert Blob to Buffer
    const arrayBuffer = await videoBlob.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    console.log(
      `[VideoAssessment] Downloaded video: ${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB`
    );

    // Upload to Gemini File API
    const uploadResult = await uploadVideoToGemini(
      videoBuffer,
      "video/webm",
      `recording_${recordingId}`
    );

    console.log(`[VideoAssessment] Uploaded to Gemini: ${uploadResult.fileUri}`);

    return uploadResult;
  } catch (error) {
    console.error(`[VideoAssessment] Failed to upload video to Gemini:`, error);
    throw new Error(
      `Video upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Assess a single question video using Gemini AI
 *
 * @param params - Assessment parameters including recording, question, and interview IDs
 * @returns Assessment result with feedback items and skill scores
 */
async function assessQuestionVideo(
  params: AssessQuestionVideoParams
): Promise<AssessmentResult> {
  const { recordingId, questionId, interviewId, userId } = params;

  const startTime = performance.now();
  console.log(`[VideoAssessment] Starting AI assessment for recording ${recordingId}`);

  try {
    // Fetch all necessary data for assessment context
    const recording = await db.interviewQuestionRecording.findUnique({
      where: { id: recordingId },
      include: {
        interview: {
          include: {
            questions: {
              where: { id: questionId },
              include: {
                // We'll need to add case and skill data here
              },
            },
          },
        },
      },
    });

    if (!recording || !recording.geminiFileUri) {
      throw new Error(`Recording ${recordingId} not found or video not uploaded to Gemini`);
    }

    // Build assessment context
    // TODO: Fetch case context, skills to evaluate, and skill definitions from database
    const context: QuestionVideoAssessmentContext = {
      videoUrl: recording.geminiFileUri,
      caseTitle: "Sample Case", // TODO: Get from interview case
      caseContext: "Sample context", // TODO: Get from interview case
      questionId: recording.questionId,
      questionText: recording.questionText,
      questionContext: undefined, // TODO: Get from question
      questionOrder: recording.questionOrder,
      totalQuestions: 3, // TODO: Get actual count
      skillsToEvaluate: [], // TODO: Get from question
      followUpQuestions: [], // TODO: Get from question
      skillDefinitions: [], // TODO: Get from database
    };

    // Create assessment prompt
    const prompt = createVideoAssessmentPrompt(context);

    console.log(`[VideoAssessment] Prompt length: ${prompt.length} chars`);
    console.log(`[VideoAssessment] Using model: ${GEMINI_MODELS.PRO}`);

    const apiStartTime = performance.now();

    // Generate assessment with Gemini
    const response = await withRetry(async () => {
      const model = geminiClient.getGenerativeModel({
        model: GEMINI_MODELS.PRO, // Use Gemini 2.5 Pro for video assessment
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 4000,
        },
      });

      // Send video file reference + text prompt
      return await model.generateContent([
        {
          fileData: {
            fileUri: recording.geminiFileUri!,
            mimeType: "video/webm",
          },
        },
        { text: prompt },
      ]);
    }, "VideoAssessment");

    const apiEndTime = performance.now();
    console.log(`[VideoAssessment] API response in ${(apiEndTime - apiStartTime).toFixed(2)}ms`);

    // Parse response
    const responseText = response.response.text();
    const assessmentData = JSON.parse(responseText) as QuestionAssessment;

    // Validate response
    if (!assessmentData.questionId || !assessmentData.feedbackItems || !assessmentData.skillScores) {
      throw new Error("Invalid assessment response: missing required fields");
    }

    const totalTime = performance.now() - startTime;
    console.log(`[VideoAssessment] Assessment completed in ${(totalTime / 1000).toFixed(2)}s`);

    return {
      success: true,
      data: assessmentData,
    };
  } catch (error) {
    console.error(`[VideoAssessment] Assessment failed:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
