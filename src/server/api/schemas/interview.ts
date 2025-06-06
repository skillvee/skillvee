import { z } from "zod";
import {
  idSchema,
  paginationSchema,
  searchSchema,
  dateRangeSchema,
  textContentSchema,
  durationSchema,
  interviewStatusSchema,
  questionTypeSchema,
  difficultySchema,
  metadataSchema,
} from "./common";

/**
 * Interview validation schemas
 */

// Create interview input
export const createInterviewSchema = z.object({
  jobDescriptionId: idSchema,
  scheduledAt: z.date().optional(),
  notes: textContentSchema.optional(),
});

// Update interview input
export const updateInterviewSchema = z.object({
  id: idSchema,
  status: interviewStatusSchema.optional(),
  scheduledAt: z.date().optional(),
  notes: textContentSchema.optional(),
  geminiSessionId: z.string().optional(),
});

// Start interview
export const startInterviewSchema = z.object({
  id: idSchema,
  geminiSessionId: z.string().optional(),
});

// Complete interview
export const completeInterviewSchema = z.object({
  id: idSchema,
  duration: durationSchema.optional(),
  finalNotes: textContentSchema.optional(),
});

// Cancel interview
export const cancelInterviewSchema = z.object({
  id: idSchema,
  reason: z.string().min(1).max(500).optional(),
});

// Get interview by ID
export const getInterviewSchema = z.object({
  id: idSchema,
  includeQuestions: z.boolean().default(false),
  includeAssessment: z.boolean().default(false),
  includeMediaRecordings: z.boolean().default(false),
  includeNotes: z.boolean().default(false),
});

// List interviews with filtering
export const listInterviewsSchema = z.object({
  ...paginationSchema.shape,
  ...searchSchema.shape,
  ...dateRangeSchema.shape,
  status: interviewStatusSchema.optional(),
  jobDescriptionId: idSchema.optional(),
  userId: idSchema.optional(),
  includeDeleted: z.boolean().default(false),
});

// Get interview statistics
export const getInterviewStatsSchema = z.object({
  userId: idSchema.optional(),
  ...dateRangeSchema.shape,
});

// Question management schemas
export const createQuestionSchema = z.object({
  interviewId: idSchema,
  questionText: textContentSchema,
  questionType: questionTypeSchema,
  difficulty: difficultySchema,
  expectedAnswer: textContentSchema.optional(),
  orderIndex: z.number().int().min(0),
});

export const updateQuestionSchema = z.object({
  id: idSchema,
  questionText: textContentSchema.optional(),
  questionType: questionTypeSchema.optional(),
  difficulty: difficultySchema.optional(),
  expectedAnswer: textContentSchema.optional(),
  userAnswer: textContentSchema.optional(),
  timeAsked: z.date().optional(),
  timeAnswered: z.date().optional(),
});

export const bulkCreateQuestionsSchema = z.object({
  interviewId: idSchema,
  questions: z.array(z.object({
    questionText: textContentSchema,
    questionType: questionTypeSchema,
    difficulty: difficultySchema,
    expectedAnswer: textContentSchema.optional(),
    orderIndex: z.number().int().min(0),
  })).min(1).max(20),
});

// Interview notes schemas
export const createInterviewNoteSchema = z.object({
  interviewId: idSchema,
  content: textContentSchema,
  timestamp: z.date(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export const updateInterviewNoteSchema = z.object({
  id: idSchema,
  content: textContentSchema.optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export const listInterviewNotesSchema = z.object({
  interviewId: idSchema,
  ...paginationSchema.shape,
});

// Interview session management
export const extendSessionSchema = z.object({
  interviewId: idSchema,
  additionalMinutes: z.number().int().min(5).max(60),
});

export const saveSessionStateSchema = z.object({
  interviewId: idSchema,
  sessionState: z.record(z.unknown()),
  currentQuestionIndex: z.number().int().min(0).optional(),
});

// Interview output schemas
export const questionOutputSchema = z.object({
  id: idSchema,
  interviewId: idSchema,
  questionText: z.string(),
  questionType: questionTypeSchema,
  difficulty: difficultySchema,
  expectedAnswer: z.string().nullable(),
  userAnswer: z.string().nullable(),
  orderIndex: z.number(),
  timeAsked: z.date().nullable(),
  timeAnswered: z.date().nullable(),
  ...metadataSchema.shape,
});

export const interviewNoteOutputSchema = z.object({
  id: idSchema,
  interviewId: idSchema,
  userId: idSchema,
  content: z.string(),
  timestamp: z.date(),
  positionX: z.number().nullable(),
  positionY: z.number().nullable(),
  ...metadataSchema.shape,
  user: z.object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }).optional(),
});

export const interviewOutputSchema = z.object({
  id: idSchema,
  userId: idSchema,
  jobDescriptionId: idSchema,
  status: interviewStatusSchema,
  scheduledAt: z.date().nullable(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  duration: z.number().nullable(),
  geminiSessionId: z.string().nullable(),
  notes: z.string().nullable(),
  ...metadataSchema.shape,
  jobDescription: z.object({
    id: idSchema,
    title: z.string(),
    company: z.string().nullable(),
  }).optional(),
  questions: z.array(questionOutputSchema).optional(),
  assessment: z.object({
    id: idSchema,
    overallScore: z.number(),
    technicalScore: z.number(),
    communicationScore: z.number(),
    problemSolvingScore: z.number(),
  }).optional(),
  mediaRecordings: z.array(z.object({
    id: idSchema,
    recordingType: z.string(),
    filePath: z.string(),
    duration: z.number().nullable(),
    uploadStatus: z.string(),
  })).optional(),
  interviewNotes: z.array(interviewNoteOutputSchema).optional(),
  _count: z.object({
    questions: z.number(),
    interviewNotes: z.number(),
    mediaRecordings: z.number(),
  }).optional(),
});

export const interviewListOutputSchema = z.object({
  items: z.array(interviewOutputSchema),
  hasNextPage: z.boolean(),
  nextCursor: z.string().optional(),
  totalCount: z.number().optional(),
});

export const interviewStatsOutputSchema = z.object({
  totalInterviews: z.number(),
  completedInterviews: z.number(),
  averageDuration: z.number().nullable(),
  averageScore: z.number().nullable(),
  statusDistribution: z.record(z.number()),
  recentInterviews: z.array(interviewOutputSchema),
  trendsData: z.object({
    monthlyInterviews: z.array(z.object({
      month: z.string(),
      count: z.number(),
      averageScore: z.number().nullable(),
    })),
    topFocusAreas: z.array(z.object({
      area: z.string(),
      count: z.number(),
    })),
  }).optional(),
});

/**
 * Type exports for use in routers
 */
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type ListInterviewsInput = z.infer<typeof listInterviewsSchema>;
export type InterviewOutput = z.infer<typeof interviewOutputSchema>;
export type InterviewListOutput = z.infer<typeof interviewListOutputSchema>;
export type InterviewStatsOutput = z.infer<typeof interviewStatsOutputSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type QuestionOutput = z.infer<typeof questionOutputSchema>;
export type CreateInterviewNoteInput = z.infer<typeof createInterviewNoteSchema>;
export type InterviewNoteOutput = z.infer<typeof interviewNoteOutputSchema>;