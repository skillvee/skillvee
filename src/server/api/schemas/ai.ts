import { z } from "zod";
import {
  idSchema,
  textContentSchema,
  richTextSchema,
  questionTypeSchema,
  difficultySchema,
  scoreSchema,
  skillsSchema,
  focusAreasSchema,
} from "./common";

/**
 * AI service validation schemas
 */

// Case generation schemas
export const generateCaseSchema = z.object({
  jobDescriptionId: idSchema,
  focusAreas: focusAreasSchema.optional(),
  difficulty: difficultySchema.default("MEDIUM"),
  questionCount: z.number().int().min(3).max(10).default(5),
  timeLimit: z.number().int().min(15).max(120).default(45), // minutes
  includeQuestionTypes: z.array(questionTypeSchema).optional(),
  customInstructions: textContentSchema.optional(),
});

export const regenerateQuestionSchema = z.object({
  questionId: idSchema,
  newDifficulty: difficultySchema.optional(),
  newQuestionType: questionTypeSchema.optional(),
  customInstructions: textContentSchema.optional(),
});

// Assessment generation schemas
export const generateAssessmentSchema = z.object({
  interviewId: idSchema,
  includeTranscription: z.boolean().default(true),
  assessmentCriteria: z.array(z.string()).optional(),
  weightings: z.object({
    technical: z.number().min(0).max(1).default(0.4),
    communication: z.number().min(0).max(1).default(0.3),
    problemSolving: z.number().min(0).max(1).default(0.3),
  }).refine(
    (data) => data.technical + data.communication + data.problemSolving === 1,
    "Weightings must sum to 1.0"
  ),
});

// Real-time AI conversation schemas
export const startAIConversationSchema = z.object({
  interviewId: idSchema,
  sessionConfig: z.object({
    voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).default("alloy"),
    speed: z.number().min(0.25).max(4.0).default(1.0),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().int().min(100).max(4096).default(2048),
  }).optional(),
  context: z.object({
    candidateName: z.string().optional(),
    position: z.string().optional(),
    company: z.string().optional(),
    previousAnswers: z.array(z.object({
      question: z.string(),
      answer: z.string(),
      timestamp: z.date(),
    })).optional(),
  }).optional(),
});

export const updateConversationContextSchema = z.object({
  sessionId: z.string(),
  updates: z.object({
    currentQuestionIndex: z.number().int().min(0).optional(),
    candidateEngagement: z.enum(["low", "medium", "high"]).optional(),
    technicalDepth: z.enum(["surface", "intermediate", "deep"]).optional(),
    followUpNeeded: z.boolean().optional(),
    notes: textContentSchema.optional(),
  }),
});

// Transcription and analysis schemas
export const transcribeAudioSchema = z.object({
  audioFileUrl: z.string().url(),
  language: z.string().default("en"),
  speakerDiarization: z.boolean().default(true),
  timestampGranularity: z.enum(["word", "segment"]).default("segment"),
});

export const analyzeResponseSchema = z.object({
  questionId: idSchema,
  responseText: textContentSchema,
  expectedAnswer: textContentSchema.optional(),
  analysisType: z.enum(["technical", "behavioral", "comprehensive"]).default("comprehensive"),
});

// AI feedback and suggestions schemas
export const getAISuggestionsSchema = z.object({
  interviewId: idSchema,
  suggestionType: z.enum([
    "question_improvement",
    "follow_up_questions", 
    "interview_flow",
    "candidate_guidance"
  ]),
  context: z.record(z.unknown()).optional(),
});

export const validateAnswerSchema = z.object({
  questionId: idSchema,
  candidateAnswer: textContentSchema,
  evaluationCriteria: z.array(z.string()).optional(),
  provideFeedback: z.boolean().default(true),
});

// AI service configuration schemas
export const updateAIConfigSchema = z.object({
  serviceType: z.enum(["gemini", "openai", "claude"]),
  config: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
  }),
});

// AI output schemas
export const generatedCaseOutputSchema = z.object({
  caseId: z.string(),
  title: z.string(),
  description: z.string(),
  timeLimit: z.number(),
  difficulty: difficultySchema,
  questions: z.array(z.object({
    id: z.string(),
    questionText: z.string(),
    questionType: questionTypeSchema,
    difficulty: difficultySchema,
    expectedAnswer: z.string().optional(),
    evaluationCriteria: z.array(z.string()),
    timeAllocation: z.number().optional(), // minutes
    followUpQuestions: z.array(z.string()).optional(),
  })),
  focusAreas: z.array(z.string()),
  preparationTips: z.array(z.string()).optional(),
  metadata: z.object({
    generationTime: z.date(),
    model: z.string(),
    confidence: z.number().min(0).max(1),
  }),
});

export const assessmentOutputSchema = z.object({
  id: idSchema,
  interviewId: idSchema,
  overallScore: scoreSchema,
  technicalScore: scoreSchema,
  communicationScore: scoreSchema,
  problemSolvingScore: scoreSchema,
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  detailedFeedback: z.string(),
  questionAnalysis: z.array(z.object({
    questionId: idSchema,
    question: z.string(),
    candidateAnswer: z.string(),
    score: scoreSchema,
    feedback: z.string(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
  })),
  recommendedNextSteps: z.array(z.string()),
  comparativeAnalysis: z.object({
    industryAverage: z.number(),
    roleExpectation: z.number(),
    percentile: z.number(),
  }).optional(),
  metadata: z.object({
    assessmentTime: z.date(),
    model: z.string(),
    confidence: z.number().min(0).max(1),
    processingDuration: z.number(), // seconds
  }),
});

export const transcriptionOutputSchema = z.object({
  id: z.string(),
  text: z.string(),
  segments: z.array(z.object({
    id: z.string(),
    text: z.string(),
    start: z.number(), // seconds
    end: z.number(), // seconds
    speaker: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  })),
  language: z.string(),
  confidence: z.number().min(0).max(1),
  duration: z.number(), // seconds
  wordCount: z.number(),
  metadata: z.object({
    transcriptionTime: z.date(),
    model: z.string(),
    processingDuration: z.number(), // seconds
  }),
});

export const aiSuggestionsOutputSchema = z.object({
  suggestionType: z.string(),
  suggestions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    actionable: z.boolean(),
    estimatedImpact: z.string().optional(),
  })),
  context: z.record(z.unknown()).optional(),
  metadata: z.object({
    generationTime: z.date(),
    model: z.string(),
    confidence: z.number().min(0).max(1),
  }),
});

export const answerValidationOutputSchema = z.object({
  questionId: idSchema,
  score: scoreSchema,
  isCorrect: z.boolean(),
  feedback: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  suggestedFollowUp: z.string().optional(),
  keywords: z.array(z.string()),
  completeness: z.number().min(0).max(1),
  clarity: z.number().min(0).max(1),
  technicalAccuracy: z.number().min(0).max(1),
  metadata: z.object({
    evaluationTime: z.date(),
    model: z.string(),
    confidence: z.number().min(0).max(1),
  }),
});

/**
 * Type exports for use in routers
 */
export type GenerateCaseInput = z.infer<typeof generateCaseSchema>;
export type GenerateAssessmentInput = z.infer<typeof generateAssessmentSchema>;
export type StartAIConversationInput = z.infer<typeof startAIConversationSchema>;
export type TranscribeAudioInput = z.infer<typeof transcribeAudioSchema>;
export type AnalyzeResponseInput = z.infer<typeof analyzeResponseSchema>;
export type GeneratedCaseOutput = z.infer<typeof generatedCaseOutputSchema>;
export type AssessmentOutput = z.infer<typeof assessmentOutputSchema>;
export type TranscriptionOutput = z.infer<typeof transcriptionOutputSchema>;
export type AISuggestionsOutput = z.infer<typeof aiSuggestionsOutputSchema>;
export type AnswerValidationOutput = z.infer<typeof answerValidationOutputSchema>;