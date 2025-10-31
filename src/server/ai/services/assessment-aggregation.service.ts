// src/server/ai/services/assessment-aggregation.service.ts

import { geminiClient, GEMINI_MODELS, withRetry } from "../providers/gemini";
import { createAggregationPrompt } from "../prompts/assessment/assessment-aggregation";
import type {
  AssessmentAggregationContext,
  QuestionAssessment,
  FinalAssessment,
} from "../prompts/assessment/types";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

/**
 * Parameters for aggregating interview assessment
 */
interface AggregateAssessmentParams {
  interviewId: string;
  userId: string;
}

/**
 * Result of aggregation operation
 */
interface AggregationResult {
  success: boolean;
  assessmentId?: string;
  error?: string;
}

/**
 * Main orchestrator: Aggregate all question assessments into final interview assessment
 *
 * Workflow:
 * 1. Fetch all completed question assessments
 * 2. Fetch interview case and skill context
 * 3. Build aggregation context with cumulative timing
 * 4. Call Gemini AI for synthesis
 * 5. Store final assessment in database
 *
 * @param params - Interview ID and user ID
 * @returns Assessment ID on success, error message on failure
 */
export async function aggregateInterviewAssessment(
  params: AggregateAssessmentParams
): Promise<AggregationResult> {
  const { interviewId, userId } = params;

  console.log(`[AssessmentAggregation] Starting aggregation for interview ${interviewId}`);

  try {
    // Step 1: Verify all question assessments are complete
    const recordings = await db.interviewQuestionRecording.findMany({
      where: {
        interviewId,
      },
      select: {
        id: true,
        questionId: true,
        questionOrder: true,
        questionText: true,
        duration: true,
        assessmentStatus: true,
        assessmentData: true,
      },
      orderBy: { questionOrder: "asc" },
    });

    if (recordings.length === 0) {
      throw new Error("No question recordings found for this interview");
    }

    const allCompleted = recordings.every((r) => r.assessmentStatus === "COMPLETED");
    if (!allCompleted) {
      const completedCount = recordings.filter((r) => r.assessmentStatus === "COMPLETED").length;
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `Not all questions assessed: ${completedCount}/${recordings.length} completed`,
      });
    }

    // Check if assessment already exists
    const existingAssessment = await db.interviewAssessment.findFirst({
      where: { interviewId },
    });

    if (existingAssessment) {
      console.log(`[AssessmentAggregation] Assessment already exists: ${existingAssessment.id}`);
      return {
        success: true,
        assessmentId: existingAssessment.id,
      };
    }

    // Step 2: Fetch interview and case context
    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      include: {
        practiceSession: {
          include: {
            interviewCases: {
              include: {
                caseQuestions: {
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!interview) {
      throw new Error(`Interview ${interviewId} not found`);
    }

    if (!interview.practiceSession?.interviewCases[0]) {
      throw new Error(`No interview case found for interview ${interviewId}`);
    }

    const interviewCase = interview.practiceSession.interviewCases[0];

    // Step 3: Fetch all unique skills from recordings
    const uniqueSkillIds = new Set<string>();
    recordings.forEach((recording) => {
      const assessment = recording.assessmentData as unknown as QuestionAssessment;
      if (assessment?.skillScores) {
        assessment.skillScores.forEach((score) => {
          uniqueSkillIds.add(score.skillId);
        });
      }
    });

    const skills = await db.skill.findMany({
      where: {
        id: { in: Array.from(uniqueSkillIds) },
      },
      include: {
        domain: true,
      },
      orderBy: [{ domain: { order: "asc" } }, { name: "asc" }],
    });

    // Step 4: Build cumulative timing map
    let cumulativeSeconds = 0;
    const questionDurations = recordings.map((r) => {
      const startSeconds = cumulativeSeconds;
      const durationSeconds = r.duration || 0;
      const endSeconds = cumulativeSeconds + durationSeconds;
      cumulativeSeconds = endSeconds;

      return {
        questionId: r.questionId,
        startSeconds,
        endSeconds,
      };
    });

    // Step 5: Calculate interview duration
    const interviewDurationSeconds =
      interview.completedAt && interview.startedAt
        ? Math.floor((interview.completedAt.getTime() - interview.startedAt.getTime()) / 1000)
        : cumulativeSeconds;

    // Step 6: Build aggregation context
    const context: AssessmentAggregationContext = {
      questionAssessments: recordings
        .map((r) => r.assessmentData as unknown as QuestionAssessment)
        .filter(Boolean),
      interview: {
        interviewId: interview.id,
        startedAt: interview.startedAt || new Date(),
        completedAt: interview.completedAt || new Date(),
        durationSeconds: interviewDurationSeconds,
      },
      case: {
        caseId: interviewCase.id,
        caseTitle: interviewCase.caseTitle,
        caseContext: interviewCase.caseContext,
      },
      allSkills: skills.map((skill, index) => ({
        skillId: skill.id,
        skillName: skill.name,
        domainName: skill.domain.name,
        domainOrder: skill.domain.order,
      })),
      questionDurations,
    };

    // Step 7: Call Gemini AI for final synthesis
    console.log(`[AssessmentAggregation] Calling Gemini AI for synthesis...`);
    const finalAssessment = await synthesizeAssessment(context);

    // Step 8: Store in database
    console.log(`[AssessmentAggregation] Storing final assessment in database...`);
    const assessment = await storeAssessment({
      userId,
      interviewId,
      caseId: interviewCase.id,
      interview,
      interviewDurationSeconds,
      finalAssessment,
      skills,
    });

    console.log(`[AssessmentAggregation] Successfully created assessment ${assessment.id}`);

    return {
      success: true,
      assessmentId: assessment.id,
    };
  } catch (error) {
    console.error(`[AssessmentAggregation] Error aggregating assessment:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Call Gemini AI to synthesize final assessment from question assessments
 *
 * @param context - Aggregation context with all question assessments
 * @returns Final assessment with overall score, summaries, and aggregated items
 */
async function synthesizeAssessment(
  context: AssessmentAggregationContext
): Promise<FinalAssessment> {
  const startTime = performance.now();

  try {
    // Create aggregation prompt
    const prompt = createAggregationPrompt(context);

    console.log(`[AssessmentAggregation] Prompt length: ${prompt.length} chars`);
    console.log(`[AssessmentAggregation] Using model: ${GEMINI_MODELS.PRO}`);

    // Generate final assessment with Gemini
    const response = await withRetry(async () => {
      const model = geminiClient.getGenerativeModel({
        model: GEMINI_MODELS.PRO, // Use Gemini 2.5 Pro for complex reasoning
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 6000,
        },
      });

      return await model.generateContent(prompt);
    }, "AssessmentAggregation");

    const responseText = response.response.text();
    const finalAssessment = JSON.parse(responseText) as FinalAssessment;

    // Validate response
    if (
      !finalAssessment.overallScore ||
      !finalAssessment.performanceLabel ||
      !finalAssessment.feedbackItems ||
      !finalAssessment.skillScores
    ) {
      throw new Error("Invalid aggregation response: missing required fields");
    }

    const totalTime = performance.now() - startTime;
    console.log(`[AssessmentAggregation] Synthesis completed in ${(totalTime / 1000).toFixed(2)}s`);

    return finalAssessment;
  } catch (error) {
    console.error(`[AssessmentAggregation] Synthesis failed:`, error);
    throw error;
  }
}

/**
 * Helper to parse MM:SS timestamp to seconds
 */
function parseTimestamp(timestampDisplay: string): number {
  const parts = timestampDisplay.split(":");
  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0] || "0", 10);
  const seconds = parseInt(parts[1] || "0", 10);

  return minutes * 60 + seconds;
}

/**
 * Store final assessment in database
 *
 * Creates InterviewAssessment, AssessmentFeedback, and AssessmentSkillScore records
 */
async function storeAssessment(params: {
  userId: string;
  interviewId: string;
  caseId: string;
  interview: any;
  interviewDurationSeconds: number;
  finalAssessment: FinalAssessment;
  skills: Array<{ id: string; name: string; domain: { id: string; name: string; order: number } }>;
}) {
  const { userId, interviewId, caseId, interview, interviewDurationSeconds, finalAssessment, skills } = params;

  // Create skill ID to skill mapping for validation
  const skillMap = new Map(skills.map((s) => [s.id, s]));

  // Prepare feedback items
  const feedbackItemsData = finalAssessment.feedbackItems.map((item) => ({
    feedbackType: item.feedbackType,
    timestampDisplay: item.timestampDisplay,
    timestampSeconds: parseTimestamp(item.timestampDisplay),
    behaviorTitle: item.behaviorTitle,
    whatYouDid: item.whatYouDid,
    whyItWorked: item.whyItWorked || null,
    whatWasMissing: item.whatWasMissing || null,
    actionableNextStep: item.actionableNextStep || null,
    impactStatement: item.whyItWorked || item.whatWasMissing || "No impact statement", // Derive from context
    displayOrder: item.displayOrder,
  }));

  // Prepare skill scores (validate all skills exist)
  const skillScoresData = finalAssessment.skillScores
    .filter((score) => {
      const skillExists = skillMap.has(score.skillId);
      if (!skillExists) {
        console.warn(`[AssessmentAggregation] Skill ${score.skillId} not found in database, skipping`);
      }
      return skillExists;
    })
    .map((score) => ({
      skillId: score.skillId,
      skillScore: score.skillScore,
      categoryOrder: score.categoryOrder,
      skillOrder: score.skillOrder,
    }));

  // Create assessment with nested relations
  const assessment = await db.interviewAssessment.create({
    data: {
      userId,
      interviewId,
      caseId,
      overallScore: finalAssessment.overallScore,
      performanceLabel: finalAssessment.performanceLabel,
      whatYouDidBest: finalAssessment.whatYouDidBest,
      topOpportunitiesForGrowth: finalAssessment.topOpportunitiesForGrowth,
      startedAt: interview.startedAt || new Date(),
      completedAt: interview.completedAt || new Date(),
      interviewDurationSeconds,
      feedbackItems: {
        create: feedbackItemsData,
      },
      skillScores: {
        create: skillScoresData,
      },
    },
    include: {
      feedbackItems: true,
      skillScores: true,
    },
  });

  console.log(
    `[AssessmentAggregation] Created assessment with ${feedbackItemsData.length} feedback items and ${skillScoresData.length} skill scores`
  );

  return assessment;
}
