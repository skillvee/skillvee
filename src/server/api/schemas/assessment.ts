import { z } from "zod";
import {
  idSchema,
  paginationSchema,
  searchSchema,
  dateRangeSchema,
  scoreSchema,
  richTextSchema,
  metadataSchema,
} from "./common";

/**
 * Assessment validation schemas
 */

// Create assessment input
export const createAssessmentSchema = z.object({
  interviewId: idSchema,
  overallScore: scoreSchema,
  technicalScore: scoreSchema,
  communicationScore: scoreSchema,
  problemSolvingScore: scoreSchema,
  strengthsAnalysis: richTextSchema,
  improvementAreas: richTextSchema,
  detailedFeedback: richTextSchema,
  recommendedNextSteps: richTextSchema,
});

// Update assessment input
export const updateAssessmentSchema = z.object({
  id: idSchema,
  overallScore: scoreSchema.optional(),
  technicalScore: scoreSchema.optional(),
  communicationScore: scoreSchema.optional(),
  problemSolvingScore: scoreSchema.optional(),
  strengthsAnalysis: richTextSchema.optional(),
  improvementAreas: richTextSchema.optional(),
  detailedFeedback: richTextSchema.optional(),
  recommendedNextSteps: richTextSchema.optional(),
});

// Get assessment by ID
export const getAssessmentSchema = z.object({
  id: idSchema,
  includeComparativeData: z.boolean().default(false),
  includeInterviewDetails: z.boolean().default(false),
});

// Get assessment by interview ID
export const getAssessmentByInterviewSchema = z.object({
  interviewId: idSchema,
  includeComparativeData: z.boolean().default(false),
});

// List assessments with filtering
export const listAssessmentsSchema = z.object({
  ...paginationSchema.shape,
  ...searchSchema.shape,
  ...dateRangeSchema.shape,
  userId: idSchema.optional(),
  minOverallScore: scoreSchema.optional(),
  maxOverallScore: scoreSchema.optional(),
  jobDescriptionId: idSchema.optional(),
  includeComparativeData: z.boolean().default(false),
});

// Assessment analytics schemas
export const getAssessmentAnalyticsSchema = z.object({
  userId: idSchema.optional(),
  jobDescriptionId: idSchema.optional(),
  ...dateRangeSchema.shape,
  groupBy: z.enum(["day", "week", "month", "quarter"]).default("month"),
});

export const getCompetencyAnalysisSchema = z.object({
  userId: idSchema.optional(),
  ...dateRangeSchema.shape,
  competencyType: z.enum(["technical", "communication", "problemSolving"]).optional(),
});

export const getBenchmarkingDataSchema = z.object({
  assessmentId: idSchema,
  compareWith: z.enum(["role_average", "industry_average", "all_candidates"]).default("role_average"),
  jobTitle: z.string().optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]).optional(),
});

// Assessment comparison schemas
export const compareAssessmentsSchema = z.object({
  assessmentIds: z.array(idSchema).min(2).max(10),
  comparisonType: z.enum(["detailed", "summary", "strengths_weaknesses"]).default("summary"),
});

export const getProgressTrackingSchema = z.object({
  userId: idSchema,
  ...dateRangeSchema.shape,
  metricType: z.enum(["scores", "competencies", "improvement_areas"]).optional(),
});

// Assessment export schemas
export const exportAssessmentSchema = z.object({
  id: idSchema,
  format: z.enum(["pdf", "json", "csv"]).default("pdf"),
  includeCharts: z.boolean().default(true),
  includeComparativeData: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
});

export const bulkExportAssessmentsSchema = z.object({
  assessmentIds: z.array(idSchema).min(1).max(50),
  format: z.enum(["pdf", "zip", "csv"]).default("zip"),
  includeCharts: z.boolean().default(true),
  includeComparativeData: z.boolean().default(false),
});

// Assessment feedback schemas
export const submitFeedbackSchema = z.object({
  assessmentId: idSchema,
  rating: z.number().int().min(1).max(5),
  feedback: richTextSchema.optional(),
  categories: z.object({
    accuracy: z.number().int().min(1).max(5),
    helpfulness: z.number().int().min(1).max(5),
    clarity: z.number().int().min(1).max(5),
    actionability: z.number().int().min(1).max(5),
  }).optional(),
});

export const getAssessmentFeedbackSchema = z.object({
  assessmentId: idSchema,
  ...paginationSchema.shape,
});

// Assessment template schemas
export const createAssessmentTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: richTextSchema.optional(),
  criteria: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    weight: z.number().min(0).max(1),
    scoreRange: z.object({
      min: z.number().int().min(1),
      max: z.number().int().max(10),
    }),
  })).min(1).max(20),
  jobTypes: z.array(z.string()).optional(),
  experienceLevels: z.array(z.enum(["entry", "mid", "senior", "lead"])).optional(),
});

export const getAssessmentTemplatesSchema = z.object({
  jobType: z.string().optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]).optional(),
  ...paginationSchema.shape,
});

// Output schemas
export const assessmentOutputSchema = z.object({
  id: idSchema,
  interviewId: idSchema,
  overallScore: scoreSchema,
  technicalScore: scoreSchema,
  communicationScore: scoreSchema,
  problemSolvingScore: scoreSchema,
  strengthsAnalysis: z.string(),
  improvementAreas: z.string(),
  detailedFeedback: z.string(),
  recommendedNextSteps: z.string(),
  ...metadataSchema.shape,
  interview: z.object({
    id: idSchema,
    userId: idSchema,
    status: z.string(),
    duration: z.number().nullable(),
    jobDescription: z.object({
      id: idSchema,
      title: z.string(),
      company: z.string().nullable(),
      focusAreas: z.array(z.string()),
    }),
    user: z.object({
      id: idSchema,
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      email: z.string(),
    }),
  }).optional(),
  comparativeData: z.object({
    roleAverage: z.object({
      overallScore: z.number(),
      technicalScore: z.number(),
      communicationScore: z.number(),
      problemSolvingScore: z.number(),
    }),
    industryAverage: z.object({
      overallScore: z.number(),
      technicalScore: z.number(),
      communicationScore: z.number(),
      problemSolvingScore: z.number(),
    }),
    percentile: z.object({
      overall: z.number(),
      technical: z.number(),
      communication: z.number(),
      problemSolving: z.number(),
    }),
    candidateCount: z.number(),
  }).optional(),
  feedback: z.array(z.object({
    id: idSchema,
    rating: z.number(),
    feedback: z.string(),
    categories: z.object({
      accuracy: z.number(),
      helpfulness: z.number(),
      clarity: z.number(),
      actionability: z.number(),
    }).nullable(),
    createdAt: z.date(),
  })).optional(),
});

export const assessmentListOutputSchema = z.object({
  items: z.array(assessmentOutputSchema),
  hasNextPage: z.boolean(),
  nextCursor: z.string().optional(),
  totalCount: z.number().optional(),
  averageScores: z.object({
    overall: z.number(),
    technical: z.number(),
    communication: z.number(),
    problemSolving: z.number(),
  }).optional(),
});

export const assessmentAnalyticsOutputSchema = z.object({
  totalAssessments: z.number(),
  averageScores: z.object({
    overall: z.number(),
    technical: z.number(),
    communication: z.number(),
    problemSolving: z.number(),
  }),
  scoreDistribution: z.object({
    overall: z.array(z.object({ score: z.number(), count: z.number() })),
    technical: z.array(z.object({ score: z.number(), count: z.number() })),
    communication: z.array(z.object({ score: z.number(), count: z.number() })),
    problemSolving: z.array(z.object({ score: z.number(), count: z.number() })),
  }),
  trendsData: z.array(z.object({
    period: z.string(),
    averageScores: z.object({
      overall: z.number(),
      technical: z.number(),
      communication: z.number(),
      problemSolving: z.number(),
    }),
    assessmentCount: z.number(),
  })),
  topPerformers: z.array(z.object({
    userId: idSchema,
    userName: z.string(),
    overallScore: z.number(),
    assessmentCount: z.number(),
  })),
  improvementAreas: z.array(z.object({
    area: z.string(),
    frequency: z.number(),
    averageImpact: z.number(),
  })),
});

export const competencyAnalysisOutputSchema = z.object({
  userId: idSchema,
  competencyScores: z.object({
    technical: z.object({
      current: z.number(),
      trend: z.number(), // positive = improving, negative = declining
      assessmentCount: z.number(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    }),
    communication: z.object({
      current: z.number(),
      trend: z.number(),
      assessmentCount: z.number(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    }),
    problemSolving: z.object({
      current: z.number(),
      trend: z.number(),
      assessmentCount: z.number(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    }),
  }),
  overallProgress: z.object({
    improvementRate: z.number(), // percentage
    consistencyScore: z.number(), // 0-1 scale
    recommendedFocus: z.string(),
  }),
  timelineData: z.array(z.object({
    date: z.string(),
    technical: z.number(),
    communication: z.number(),
    problemSolving: z.number(),
  })),
});

export const assessmentComparisonOutputSchema = z.object({
  assessments: z.array(assessmentOutputSchema),
  comparison: z.object({
    scoreComparison: z.object({
      overall: z.array(z.number()),
      technical: z.array(z.number()),
      communication: z.array(z.number()),
      problemSolving: z.array(z.number()),
    }),
    strengthsComparison: z.object({
      common: z.array(z.string()),
      unique: z.array(z.array(z.string())),
    }),
    improvementComparison: z.object({
      common: z.array(z.string()),
      unique: z.array(z.array(z.string())),
    }),
    summary: z.string(),
    recommendations: z.array(z.string()),
  }),
});

/**
 * Type exports for use in routers
 */
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type ListAssessmentsInput = z.infer<typeof listAssessmentsSchema>;
export type AssessmentOutput = z.infer<typeof assessmentOutputSchema>;
export type AssessmentListOutput = z.infer<typeof assessmentListOutputSchema>;
export type AssessmentAnalyticsOutput = z.infer<typeof assessmentAnalyticsOutputSchema>;
export type CompetencyAnalysisOutput = z.infer<typeof competencyAnalysisOutputSchema>;
export type AssessmentComparisonOutput = z.infer<typeof assessmentComparisonOutputSchema>;