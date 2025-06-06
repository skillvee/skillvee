import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { 
  createTRPCRouter, 
  aiProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import {
  generateCaseSchema,
  generateAssessmentSchema,
  startAIConversationSchema,
  transcribeAudioSchema,
  analyzeResponseSchema,
  getAISuggestionsSchema,
  validateAnswerSchema,
  updateAIConfigSchema,
  type GeneratedCaseOutput,
  type AssessmentOutput,
  type TranscriptionOutput,
  type AISuggestionsOutput,
  type AnswerValidationOutput,
} from "../schemas/ai";

export const aiRouter = createTRPCRouter({
  /**
   * Generate AI interview case based on job description
   */
  generateCase: aiProcedure
    .input(generateCaseSchema)
    .mutation(async ({ ctx, input }) => {
      const { 
        jobDescriptionId, 
        focusAreas, 
        difficulty, 
        questionCount, 
        timeLimit,
        includeQuestionTypes,
        customInstructions 
      } = input;

      // Verify job description exists
      const jobDescription = await ctx.db.jobDescription.findFirst({
        where: {
          id: jobDescriptionId,
          deletedAt: null,
          OR: [
            { userId: ctx.user.id },
            { isTemplate: true },
            ...(ctx.user.role === "ADMIN" ? [{}] : []),
          ],
        },
      });

      if (!jobDescription) {
        throw createError.notFound("Job description", jobDescriptionId);
      }

      // Simulate AI case generation (replace with actual AI service integration)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response for now
      const mockCase: GeneratedCaseOutput = {
        caseId: `case_${Date.now()}`,
        title: `${jobDescription.title} Interview Case`,
        description: `Comprehensive interview case for ${jobDescription.title} position focusing on ${focusAreas?.join(", ") || jobDescription.focusAreas.join(", ")}`,
        timeLimit,
        difficulty,
        questions: Array.from({ length: questionCount }, (_, i) => ({
          id: `q_${i + 1}`,
          questionText: `Sample ${difficulty.toLowerCase()} question ${i + 1} about ${jobDescription.focusAreas[i % jobDescription.focusAreas.length]}`,
          questionType: includeQuestionTypes?.[i % (includeQuestionTypes?.length || 1)] || "TECHNICAL",
          difficulty,
          expectedAnswer: "Sample expected answer covering key concepts and implementation details.",
          evaluationCriteria: [
            "Technical accuracy",
            "Problem-solving approach",
            "Communication clarity",
            "Best practices awareness"
          ],
          timeAllocation: Math.ceil(timeLimit / questionCount),
          followUpQuestions: [
            "Can you explain your reasoning?",
            "How would you handle edge cases?",
            "What are the trade-offs of your approach?"
          ],
        })),
        focusAreas: focusAreas || jobDescription.focusAreas,
        preparationTips: [
          "Review fundamental concepts",
          "Practice coding problems",
          "Prepare examples from your experience",
          "Think about scalability and optimization"
        ],
        metadata: {
          generationTime: new Date(),
          model: "gemini-2.5-pro",
          confidence: 0.85,
        },
      };

      return mockCase;
    }),

  /**
   * Generate AI assessment for completed interview
   */
  generateAssessment: aiProcedure
    .input(generateAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { interviewId, includeTranscription, assessmentCriteria, weightings } = input;

      // Verify interview exists and is completed
      const interview = await ctx.db.interview.findFirst({
        where: {
          id: interviewId,
          status: "COMPLETED",
          deletedAt: null,
          OR: [
            { userId: ctx.user.id },
            ...(ctx.user.role === "ADMIN" ? [{}] : []),
          ],
        },
        include: {
          questions: true,
          mediaRecordings: includeTranscription ? {
            where: {
              transcriptionStatus: "COMPLETED",
            },
          } : false,
          jobDescription: {
            select: {
              title: true,
              focusAreas: true,
            },
          },
        },
      });

      if (!interview) {
        throw createError.notFound("Completed interview", interviewId);
      }

      // Check if assessment already exists
      const existingAssessment = await ctx.db.assessment.findUnique({
        where: { interviewId },
      });

      if (existingAssessment) {
        throw createError.conflict("Assessment already exists for this interview");
      }

      // Simulate AI assessment generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate scores based on weightings
      const baseScore = 7; // Mock base score
      const variance = 2;
      
      const technicalScore = Math.max(1, Math.min(10, 
        Math.round(baseScore + (Math.random() - 0.5) * variance)
      ));
      const communicationScore = Math.max(1, Math.min(10,
        Math.round(baseScore + (Math.random() - 0.5) * variance)
      ));
      const problemSolvingScore = Math.max(1, Math.min(10,
        Math.round(baseScore + (Math.random() - 0.5) * variance)
      ));
      
      const overallScore = Math.round(
        technicalScore * weightings.technical +
        communicationScore * weightings.communication +
        problemSolvingScore * weightings.problemSolving
      );

      // Create assessment in database
      const assessment = await ctx.db.assessment.create({
        data: {
          interviewId,
          overallScore,
          technicalScore,
          communicationScore,
          problemSolvingScore,
          strengthsAnalysis: "Strong technical foundation with good problem-solving skills.",
          improvementAreas: "Could improve communication clarity and provide more specific examples.",
          detailedFeedback: "The candidate demonstrated solid understanding of core concepts...",
          recommendedNextSteps: "Focus on system design and advanced algorithms.",
        },
      });

      // Return detailed assessment output
      const result: AssessmentOutput = {
        id: assessment.id,
        interviewId,
        overallScore,
        technicalScore,
        communicationScore,
        problemSolvingScore,
        strengths: [
          "Strong analytical thinking",
          "Good problem decomposition",
          "Relevant experience examples"
        ],
        improvementAreas: [
          "Communication clarity",
          "Code optimization",
          "Edge case handling"
        ],
        detailedFeedback: assessment.detailedFeedback,
        questionAnalysis: interview.questions.map((q, i) => ({
          questionId: q.id,
          question: q.questionText,
          candidateAnswer: q.userAnswer || "No answer provided",
          score: Math.max(1, Math.min(10, baseScore + (Math.random() - 0.5) * 2)),
          feedback: "Good understanding demonstrated with room for improvement in implementation details.",
          strengths: ["Clear explanation", "Correct approach"],
          improvements: ["Add error handling", "Consider performance"],
        })),
        recommendedNextSteps: [
          "Practice system design problems",
          "Review data structures and algorithms",
          "Work on communication skills"
        ],
        comparativeAnalysis: {
          industryAverage: 6.8,
          roleExpectation: 7.5,
          percentile: 72,
        },
        metadata: {
          assessmentTime: new Date(),
          model: "gemini-2.5-pro",
          confidence: 0.87,
          processingDuration: 15.2,
        },
      };

      return result;
    }),

  /**
   * Start AI conversation session for real-time interview
   */
  startConversation: aiProcedure
    .input(startAIConversationSchema)
    .mutation(async ({ ctx, input }) => {
      const { interviewId, sessionConfig, context } = input;

      // Verify interview exists and is in progress
      const interview = await ctx.db.interview.findFirst({
        where: {
          id: interviewId,
          userId: ctx.user.id,
          status: "IN_PROGRESS",
          deletedAt: null,
        },
        include: {
          jobDescription: true,
          questions: true,
        },
      });

      if (!interview) {
        throw createError.notFound("Active interview", interviewId);
      }

      // Mock session ID (in real implementation, this would come from Gemini Live API)
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update interview with session ID
      await ctx.db.interview.update({
        where: { id: interviewId },
        data: { geminiSessionId: sessionId },
      });

      return {
        sessionId,
        status: "active",
        config: sessionConfig || {
          voice: "alloy",
          speed: 1.0,
          temperature: 0.7,
          maxTokens: 2048,
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      };
    }),

  /**
   * Transcribe audio recording
   */
  transcribeAudio: aiProcedure
    .input(transcribeAudioSchema)
    .mutation(async ({ ctx, input }) => {
      const { audioFileUrl, language, speakerDiarization, timestampGranularity } = input;

      // Simulate transcription processing
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Mock transcription result
      const result: TranscriptionOutput = {
        id: `transcript_${Date.now()}`,
        text: "This is a sample transcription of the interview audio. The candidate discussed their experience with machine learning and data analysis.",
        segments: [
          {
            id: "seg_1",
            text: "Hello, let's start with your experience in data science.",
            start: 0,
            end: 3.5,
            speaker: "interviewer",
            confidence: 0.95,
          },
          {
            id: "seg_2", 
            text: "I have 5 years of experience working with Python and machine learning frameworks.",
            start: 4.0,
            end: 8.2,
            speaker: "candidate",
            confidence: 0.92,
          },
        ],
        language,
        confidence: 0.91,
        duration: 1800, // 30 minutes
        wordCount: 2450,
        metadata: {
          transcriptionTime: new Date(),
          model: "whisper-v3",
          processingDuration: 45.2,
        },
      };

      return result;
    }),

  /**
   * Analyze candidate response to a question
   */
  analyzeResponse: aiProcedure
    .input(analyzeResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const { questionId, responseText, expectedAnswer, analysisType } = input;

      // Verify question exists
      const question = await ctx.db.question.findFirst({
        where: {
          id: questionId,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!question) {
        throw createError.notFound("Question", questionId);
      }

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: AnswerValidationOutput = {
        questionId,
        score: 7,
        isCorrect: true,
        feedback: "Good understanding of the concept with practical examples. Could be more specific about implementation details.",
        strengths: [
          "Clear explanation of approach",
          "Relevant real-world examples",
          "Good problem breakdown"
        ],
        improvements: [
          "Add error handling considerations",
          "Discuss performance implications", 
          "Mention alternative approaches"
        ],
        suggestedFollowUp: "Can you walk me through how you would handle edge cases in this scenario?",
        keywords: ["python", "machine learning", "data preprocessing", "feature engineering"],
        completeness: 0.8,
        clarity: 0.75,
        technicalAccuracy: 0.85,
        metadata: {
          evaluationTime: new Date(),
          model: "gemini-2.5-pro",
          confidence: 0.82,
        },
      };

      return result;
    }),

  /**
   * Get AI suggestions for interview improvement
   */
  getSuggestions: protectedProcedure
    .input(getAISuggestionsSchema)
    .query(async ({ ctx, input }) => {
      const { interviewId, suggestionType, context } = input;

      // Verify interview exists
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

      // Mock AI suggestions
      const suggestions: AISuggestionsOutput = {
        suggestionType,
        suggestions: [
          {
            id: "sug_1",
            title: "Improve Question Clarity", 
            description: "Consider rephrasing technical questions to be more specific about expected outcomes.",
            priority: "medium",
            actionable: true,
            estimatedImpact: "Better candidate understanding and more focused responses",
          },
          {
            id: "sug_2",
            title: "Add Follow-up Questions",
            description: "Include probing questions to assess deeper understanding of concepts.",
            priority: "high", 
            actionable: true,
            estimatedImpact: "More comprehensive evaluation of candidate knowledge",
          },
        ],
        context,
        metadata: {
          generationTime: new Date(),
          model: "gemini-2.5-pro",
          confidence: 0.88,
        },
      };

      return suggestions;
    }),

  /**
   * Validate answer against expected criteria
   */
  validateAnswer: aiProcedure
    .input(validateAnswerSchema)
    .mutation(async ({ ctx, input }) => {
      const { questionId, candidateAnswer, evaluationCriteria, provideFeedback } = input;

      // Verify question exists
      const question = await ctx.db.question.findFirst({
        where: {
          id: questionId,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!question) {
        throw createError.notFound("Question", questionId);
      }

      // Update question with candidate answer
      await ctx.db.question.update({
        where: { id: questionId },
        data: { 
          userAnswer: candidateAnswer,
          timeAnswered: new Date(),
        },
      });

      if (!provideFeedback) {
        return { 
          questionId, 
          score: 0, 
          isCorrect: false, 
          feedback: "", 
          strengths: [], 
          improvements: [],
          keywords: [],
          completeness: 0,
          clarity: 0,
          technicalAccuracy: 0,
          metadata: {
            evaluationTime: new Date(),
            model: "gemini-2.5-pro",
            confidence: 0,
          },
        };
      }

      // Simulate AI validation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result: AnswerValidationOutput = {
        questionId,
        score: 8,
        isCorrect: true,
        feedback: "Excellent answer covering all key points with practical insights.",
        strengths: [
          "Comprehensive coverage of the topic",
          "Good use of technical terminology",
          "Practical examples provided"
        ],
        improvements: [
          "Could mention specific tools or frameworks",
          "Add discussion of potential challenges"
        ],
        suggestedFollowUp: "How would you scale this solution for larger datasets?",
        keywords: ["algorithm", "optimization", "scalability", "performance"],
        completeness: 0.9,
        clarity: 0.85,
        technicalAccuracy: 0.88,
        metadata: {
          evaluationTime: new Date(),
          model: "gemini-2.5-pro", 
          confidence: 0.91,
        },
      };

      return result;
    }),

  /**
   * Update AI service configuration (admin only)
   */
  updateConfig: protectedProcedure
    .input(updateAIConfigSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "ADMIN") {
        throw createError.forbidden("update AI configuration");
      }

      // In a real implementation, this would update service configuration
      // For now, just return success
      return {
        success: true,
        config: input.config,
        updatedAt: new Date(),
      };
    }),
});