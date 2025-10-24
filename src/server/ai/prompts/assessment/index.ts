// src/server/ai/prompts/assessment/index.ts

/**
 * Assessment Prompts Module
 *
 * This module provides prompts for video-based interview assessment using Gemini AI.
 *
 * ## Usage Flow:
 *
 * 1. **Per-Question Analysis** (5 parallel calls for 5-question interview)
 *    - Model: Gemini 2.0 Flash (multimodal)
 *    - Input: Video URL + question context + skill definitions
 *    - Output: Question-level feedback + skill scores (1-3 scale)
 *    - Use: `createVideoAssessmentPrompt()`
 *
 * 2. **Assessment Aggregation** (1 call)
 *    - Model: Gemini 2.5 Pro (text-only)
 *    - Input: All question assessments + metadata
 *    - Output: Overall score (1-5) + summaries + aggregated feedback
 *    - Use: `createAggregationPrompt()`
 *
 * ## Example:
 *
 * ```typescript
 * import {
 *   createVideoAssessmentPrompt,
 *   createAggregationPrompt,
 *   type QuestionVideoAssessmentContext,
 *   type QuestionAssessment
 * } from '~/server/ai/prompts/assessment';
 *
 * // Step 1: Analyze each question video (parallel)
 * const questionAssessments: QuestionAssessment[] = await Promise.all(
 *   questionRecordings.map(async (recording) => {
 *     const prompt = createVideoAssessmentPrompt({
 *       videoUrl: recording.videoUrl,
 *       caseTitle: interviewCase.caseTitle,
 *       caseContext: interviewCase.caseContext,
 *       questionId: recording.questionId,
 *       questionText: recording.questionText,
 *       questionOrder: recording.questionOrder,
 *       totalQuestions: 5,
 *       skillsToEvaluate: recording.caseQuestion.skillsToEvaluate,
 *       followUpQuestions: recording.caseQuestion.followUpQuestions,
 *       skillDefinitions: relevantSkills
 *     });
 *
 *     const response = await callGemini2Flash(prompt, recording.videoUrl);
 *     return JSON.parse(response);
 *   })
 * );
 *
 * // Step 2: Aggregate into final assessment
 * const aggregationPrompt = createAggregationPrompt({
 *   questionAssessments,
 *   interview: {
 *     interviewId: interview.id,
 *     startedAt: interview.startedAt,
 *     completedAt: interview.completedAt,
 *     durationSeconds: interview.duration
 *   },
 *   case: {
 *     caseId: interviewCase.id,
 *     caseTitle: interviewCase.caseTitle,
 *     caseContext: interviewCase.caseContext
 *   },
 *   allSkills: uniqueSkills,
 *   questionDurations: cumulativeDurations
 * });
 *
 * const finalResponse = await callGemini25Pro(aggregationPrompt);
 * const finalAssessment = JSON.parse(finalResponse);
 * ```
 */

// Export all types
export type {
  SkillLevelBehavior,
  SkillDefinition,
  QuestionVideoAssessmentContext,
  FeedbackItem,
  SkillScore,
  QuestionAssessment,
  AssessmentAggregationContext,
  AggregatedFeedbackItem,
  AggregatedSkillScore,
  FinalAssessment,
} from './types';

// Export prompt creators
export { createVideoAssessmentPrompt } from './video-assessment';
export { createAggregationPrompt } from './assessment-aggregation';
