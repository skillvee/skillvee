import { z } from "zod";

import { 
  createTRPCRouter, 
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import {
  // createPaginationArgs,
  processPaginationResults,
  createSearchConditions,
  createDateRangeFilter,
  createSortCondition,
  combineFilters,
  // createInclusionFilter,
} from "../utils/pagination";

import {
  createAssessmentSchema,
  updateAssessmentSchema,
  getAssessmentSchema,
  getAssessmentByInterviewSchema,
  listAssessmentsSchema,
  getAssessmentAnalyticsSchema,
  getCompetencyAnalysisSchema,
  // getBenchmarkingDataSchema,
  compareAssessmentsSchema,
  // getProgressTrackingSchema,
  exportAssessmentSchema,
  // bulkExportAssessmentsSchema,
  submitFeedbackSchema,
  // getAssessmentFeedbackSchema,
  // createAssessmentTemplateSchema,
  getAssessmentTemplatesSchema,
  type AssessmentOutput,
  type AssessmentListOutput,
  type AssessmentAnalyticsOutput,
  type CompetencyAnalysisOutput,
  type AssessmentComparisonOutput,
} from "../schemas/assessment";

export const assessmentRouter = createTRPCRouter({
  /**
   * Create a new assessment
   */
  create: protectedProcedure
    .input(createAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        interviewId,
        overallScore,
        technicalScore,
        communicationScore,
        problemSolvingScore,
        strengthsAnalysis,
        improvementAreas,
        detailedFeedback,
        recommendedNextSteps,
      } = input;

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
      });

      if (!interview) {
        throw createError.notFound("Completed interview", interviewId);
      }

      // Check if assessment already exists
      const existing = await ctx.db.assessment.findUnique({
        where: { interviewId },
      });

      if (existing) {
        throw createError.conflict("Assessment already exists for this interview");
      }

      const assessment = await ctx.db.assessment.create({
        data: {
          interviewId,
          overallScore,
          technicalScore,
          communicationScore,
          problemSolvingScore,
          strengthsAnalysis,
          improvementAreas,
          detailedFeedback,
          recommendedNextSteps,
        },
        include: {
          interview: {
            include: {
              jobDescription: {
                select: {
                  id: true,
                  title: true,
                  company: true,
                  focusAreas: true,
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return assessment;
    }),

  /**
   * Get assessment by ID
   */
  getById: protectedProcedure
    .input(getAssessmentSchema)
    .query(async ({ ctx, input }) => {
      const { id, includeComparativeData, includeInterviewDetails } = input;

      const assessment = await ctx.db.assessment.findFirst({
        where: {
          id,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
        include: {
          interview: includeInterviewDetails ? {
            include: {
              jobDescription: {
                select: {
                  id: true,
                  title: true,
                  company: true,
                  focusAreas: true,
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          } : {
            select: {
              id: true,
              userId: true,
              status: true,
              duration: true,
              jobDescription: {
                select: {
                  id: true,
                  title: true,
                  company: true,
                  focusAreas: true,
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!assessment) {
        throw createError.notFound("Assessment", id);
      }

      let comparativeData = undefined;
      if (includeComparativeData) {
        // Get comparative data (mock implementation)
        comparativeData = {
          roleAverage: {
            overallScore: 7.2,
            technicalScore: 7.5,
            communicationScore: 6.8,
            problemSolvingScore: 7.1,
          },
          industryAverage: {
            overallScore: 6.9,
            technicalScore: 7.2,
            communicationScore: 6.5,
            problemSolvingScore: 6.8,
          },
          percentile: {
            overall: Math.floor((assessment.overallScore / 10) * 100),
            technical: Math.floor((assessment.technicalScore / 10) * 100),
            communication: Math.floor((assessment.communicationScore / 10) * 100),
            problemSolving: Math.floor((assessment.problemSolvingScore / 10) * 100),
          },
          candidateCount: 247,
        };
      }

      return {
        ...assessment,
        comparativeData,
      } as AssessmentOutput;
    }),

  /**
   * Get assessment by interview ID
   */
  getByInterview: protectedProcedure
    .input(getAssessmentByInterviewSchema)
    .query(async ({ ctx, input }) => {
      const { interviewId, includeComparativeData } = input;

      const assessment = await ctx.db.assessment.findFirst({
        where: {
          interviewId,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
        include: {
          interview: {
            include: {
              jobDescription: {
                select: {
                  id: true,
                  title: true,
                  company: true,
                  focusAreas: true,
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!assessment) {
        throw createError.notFound("Assessment for interview", interviewId);
      }

      let comparativeData = undefined;
      if (includeComparativeData) {
        comparativeData = {
          roleAverage: {
            overallScore: 7.2,
            technicalScore: 7.5,
            communicationScore: 6.8,
            problemSolvingScore: 7.1,
          },
          industryAverage: {
            overallScore: 6.9,
            technicalScore: 7.2,
            communicationScore: 6.5,
            problemSolvingScore: 6.8,
          },
          percentile: {
            overall: Math.floor((assessment.overallScore / 10) * 100),
            technical: Math.floor((assessment.technicalScore / 10) * 100),
            communication: Math.floor((assessment.communicationScore / 10) * 100),
            problemSolving: Math.floor((assessment.problemSolvingScore / 10) * 100),
          },
          candidateCount: 247,
        };
      }

      return {
        ...assessment,
        comparativeData,
      } as AssessmentOutput;
    }),

  /**
   * Update assessment
   */
  update: protectedProcedure
    .input(updateAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if assessment exists and user has permission
      const existing = await ctx.db.assessment.findFirst({
        where: {
          id,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
      });

      if (!existing) {
        throw createError.notFound("Assessment", id);
      }

      const updatedAssessment = await ctx.db.assessment.update({
        where: { id },
        data: updateData,
        include: {
          interview: {
            include: {
              jobDescription: {
                select: {
                  id: true,
                  title: true,
                  company: true,
                  focusAreas: true,
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return updatedAssessment;
    }),

  /**
   * List assessments with filtering and pagination
   */
  list: protectedProcedure
    .input(listAssessmentsSchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        query,
        sortBy,
        sortDirection,
        from,
        to,
        userId,
        minOverallScore,
        maxOverallScore,
        jobDescriptionId,
        includeComparativeData,
      } = input;

      // Build filters
      const searchFilter = createSearchConditions(query, ["strengthsAnalysis", "detailedFeedback"]);
      const dateFilter = createDateRangeFilter(from, to, "createdAt");
      
      // Permission filter - users can only see their own assessments unless admin
      const permissionFilter = ctx.user.role === "ADMIN" 
        ? (userId ? { interview: { userId } } : {})
        : { interview: { userId: ctx.user.id } };

      const filters = combineFilters(
        { interview: { deletedAt: null } },
        permissionFilter,
        searchFilter,
        dateFilter,
        minOverallScore ? { overallScore: { gte: minOverallScore } } : undefined,
        maxOverallScore ? { overallScore: { lte: maxOverallScore } } : undefined,
        jobDescriptionId ? { interview: { jobDescriptionId } } : undefined
      );

      // Build sort condition
      const orderBy = createSortCondition(sortBy, sortDirection, { createdAt: "desc" });

      // Execute query with simplified pagination
      const assessments = await ctx.db.assessment.findMany({
        where: filters,
        include: {
          interview: {
            select: {
              id: true,
              userId: true,
              status: true,
              duration: true,
              jobDescription: {
                select: {
                  id: true,
                  title: true,
                  company: true,
                  focusAreas: true,
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      // Process pagination results
      const paginationResult = processPaginationResults(assessments, { limit, cursor });

      // Calculate average scores
      const averageScores = await ctx.db.assessment.aggregate({
        where: filters,
        _avg: {
          overallScore: true,
          technicalScore: true,
          communicationScore: true,
          problemSolvingScore: true,
        },
      });

      return {
        ...paginationResult,
        totalCount: await ctx.db.assessment.count({ where: filters }),
        averageScores: {
          overall: averageScores._avg.overallScore || 0,
          technical: averageScores._avg.technicalScore || 0,
          communication: averageScores._avg.communicationScore || 0,
          problemSolving: averageScores._avg.problemSolvingScore || 0,
        },
      } as AssessmentListOutput;
    }),

  /**
   * Get assessment analytics
   */
  getAnalytics: protectedProcedure
    .input(getAssessmentAnalyticsSchema)
    .query(async ({ ctx, input }) => {
      const { userId, jobDescriptionId, from, to, groupBy } = input;

      // Determine user filter based on role and input
      const userFilter = ctx.user.role === "ADMIN" 
        ? (userId ? { interview: { userId } } : {})
        : { interview: { userId: ctx.user.id } };

      const dateFilter = createDateRangeFilter(from, to, "createdAt");
      const baseFilter = combineFilters(
        { interview: { deletedAt: null } },
        userFilter,
        dateFilter,
        jobDescriptionId ? { interview: { jobDescriptionId } } : undefined
      );

      const [
        totalAssessments,
        averageScores,
        scoreDistribution,
        trendsData,
        topPerformers,
        improvementAreas,
      ] = await Promise.all([
        // Total assessments
        ctx.db.assessment.count({ where: baseFilter }),

        // Average scores
        ctx.db.assessment.aggregate({
          where: baseFilter,
          _avg: {
            overallScore: true,
            technicalScore: true,
            communicationScore: true,
            problemSolvingScore: true,
          },
        }),

        // Score distribution (simplified)
        Promise.all([
          ctx.db.assessment.groupBy({
            by: ["overallScore"],
            where: baseFilter,
            _count: { overallScore: true },
          }),
          ctx.db.assessment.groupBy({
            by: ["technicalScore"],
            where: baseFilter,
            _count: { technicalScore: true },
          }),
          ctx.db.assessment.groupBy({
            by: ["communicationScore"],
            where: baseFilter,
            _count: { communicationScore: true },
          }),
          ctx.db.assessment.groupBy({
            by: ["problemSolvingScore"],
            where: baseFilter,
            _count: { problemSolvingScore: true },
          }),
        ]),

        // Trends data (mock for now)
        Promise.resolve([]),

        // Top performers
        ctx.db.assessment.findMany({
          where: baseFilter,
          orderBy: { overallScore: "desc" },
          take: 10,
          include: {
            interview: {
              select: {
                userId: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        }),

        // Improvement areas analysis (mock)
        Promise.resolve([]),
      ]);

      const result: AssessmentAnalyticsOutput = {
        totalAssessments,
        averageScores: {
          overall: averageScores._avg.overallScore || 0,
          technical: averageScores._avg.technicalScore || 0,
          communication: averageScores._avg.communicationScore || 0,
          problemSolving: averageScores._avg.problemSolvingScore || 0,
        },
        scoreDistribution: {
          overall: scoreDistribution[0].map(({ overallScore, _count }) => ({
            score: overallScore,
            count: _count.overallScore,
          })),
          technical: scoreDistribution[1].map(({ technicalScore, _count }) => ({
            score: technicalScore,
            count: _count.technicalScore,
          })),
          communication: scoreDistribution[2].map(({ communicationScore, _count }) => ({
            score: communicationScore,
            count: _count.communicationScore,
          })),
          problemSolving: scoreDistribution[3].map(({ problemSolvingScore, _count }) => ({
            score: problemSolvingScore,
            count: _count.problemSolvingScore,
          })),
        },
        trendsData: [], // Mock data
        topPerformers: topPerformers.map(assessment => ({
          userId: assessment.interview.userId,
          userName: `${assessment.interview.user.firstName} ${assessment.interview.user.lastName}`.trim(),
          overallScore: assessment.overallScore,
          assessmentCount: 1, // Simplified
        })),
        improvementAreas: [], // Mock data
      };

      return result;
    }),

  /**
   * Get competency analysis for a user
   */
  getCompetencyAnalysis: protectedProcedure
    .input(getCompetencyAnalysisSchema)
    .query(async ({ ctx, input }) => {
      const { userId, from, to, competencyType } = input;

      // Determine target user
      const targetUserId = ctx.user.role === "ADMIN" ? (userId || ctx.user.id) : ctx.user.id;

      const dateFilter = createDateRangeFilter(from, to, "createdAt");
      const baseFilter = combineFilters(
        { interview: { userId: targetUserId, deletedAt: null } },
        dateFilter
      );

      // Get user's assessments
      const assessments = await ctx.db.assessment.findMany({
        where: baseFilter,
        orderBy: { createdAt: "asc" },
        select: {
          technicalScore: true,
          communicationScore: true,
          problemSolvingScore: true,
          createdAt: true,
          strengthsAnalysis: true,
          improvementAreas: true,
        },
      });

      if (assessments.length === 0) {
        throw createError.notFound("Assessments for user");
      }

      // Calculate competency scores and trends
      const latest = assessments[assessments.length - 1];
      const earliest = assessments[0];

      if (!latest || !earliest) {
        throw createError.notFound("Assessments for user");
      }

      const result: CompetencyAnalysisOutput = {
        userId: targetUserId,
        competencyScores: {
          technical: {
            current: latest.technicalScore,
            trend: latest.technicalScore - earliest.technicalScore,
            assessmentCount: assessments.length,
            strengths: ["Algorithm design", "Code quality"],
            weaknesses: ["System design", "Scalability"],
          },
          communication: {
            current: latest.communicationScore,
            trend: latest.communicationScore - earliest.communicationScore,
            assessmentCount: assessments.length,
            strengths: ["Clear explanations", "Active listening"],
            weaknesses: ["Technical presentation", "Confidence"],
          },
          problemSolving: {
            current: latest.problemSolvingScore,
            trend: latest.problemSolvingScore - earliest.problemSolvingScore,
            assessmentCount: assessments.length,
            strengths: ["Analytical thinking", "Creative solutions"],
            weaknesses: ["Edge case handling", "Optimization"],
          },
        },
        overallProgress: {
          improvementRate: assessments.length > 1 ? 
            ((latest.technicalScore + latest.communicationScore + latest.problemSolvingScore) -
             (earliest.technicalScore + earliest.communicationScore + earliest.problemSolvingScore)) / 
            (assessments.length - 1) : 0,
          consistencyScore: 0.8, // Mock value
          recommendedFocus: "Focus on system design and scalability concepts",
        },
        timelineData: assessments.map(assessment => ({
          date: assessment.createdAt.toISOString().split('T')[0] ?? '',
          technical: assessment.technicalScore,
          communication: assessment.communicationScore,
          problemSolving: assessment.problemSolvingScore,
        })),
      };

      return result;
    }),

  /**
   * Compare multiple assessments
   */
  compareAssessments: protectedProcedure
    .input(compareAssessmentsSchema)
    .query(async ({ ctx, input }) => {
      const { assessmentIds, comparisonType } = input;

      // Get assessments with permission check
      const assessments = await ctx.db.assessment.findMany({
        where: {
          id: { in: assessmentIds },
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
        include: {
          interview: {
            include: {
              jobDescription: {
                select: {
                  id: true,
                  title: true,
                  company: true,
                  focusAreas: true,
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (assessments.length < 2) {
        throw createError.validation("assessments", "At least 2 assessments required for comparison");
      }

      // Process comparison data
      const comparison = {
        scoreComparison: {
          overall: assessments.map(a => a.overallScore),
          technical: assessments.map(a => a.technicalScore),
          communication: assessments.map(a => a.communicationScore),
          problemSolving: assessments.map(a => a.problemSolvingScore),
        },
        strengthsComparison: {
          common: ["Analytical thinking"], // Mock common strengths
          unique: assessments.map(() => ["Specific strength 1", "Specific strength 2"]),
        },
        improvementComparison: {
          common: ["Communication clarity"], // Mock common improvements
          unique: assessments.map(() => ["Specific improvement 1", "Specific improvement 2"]),
        },
        summary: "Assessment comparison shows varying strengths across technical and communication skills.",
        recommendations: [
          "Focus on consistent communication improvement",
          "Leverage strong analytical skills",
          "Address common improvement areas",
        ],
      };

      const result: AssessmentComparisonOutput = {
        assessments: assessments as AssessmentOutput[],
        comparison,
      };

      return result;
    }),

  /**
   * Export assessment data
   */
  exportAssessment: protectedProcedure
    .input(exportAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, format, includeCharts, includeComparativeData, includeRecommendations } = input;

      // Verify assessment exists and user has permission
      const assessment = await ctx.db.assessment.findFirst({
        where: {
          id,
          interview: {
            OR: [
              { userId: ctx.user.id },
              ...(ctx.user.role === "ADMIN" ? [{}] : []),
            ],
            deletedAt: null,
          },
        },
        include: {
          interview: {
            include: {
              jobDescription: true,
              user: true,
            },
          },
        },
      });

      if (!assessment) {
        throw createError.notFound("Assessment", id);
      }

      // Generate export URL (mock)
      const exportUrl = `/api/export/assessment/${id}?format=${format}&charts=${includeCharts}&comparative=${includeComparativeData}&recommendations=${includeRecommendations}`;

      return {
        success: true,
        exportUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        format,
      };
    }),

  /**
   * Submit feedback on assessment
   */
  submitFeedback: protectedProcedure
    .input(submitFeedbackSchema)
    .mutation(async ({ ctx, input }) => {
      const { assessmentId, rating, feedback, categories } = input;

      // Verify assessment exists and user has permission
      const assessment = await ctx.db.assessment.findFirst({
        where: {
          id: assessmentId,
          interview: {
            userId: ctx.user.id,
            deletedAt: null,
          },
        },
      });

      if (!assessment) {
        throw createError.notFound("Assessment", assessmentId);
      }

      // For this implementation, we'll just return success
      // In a real app, you'd store this in a feedback table
      return {
        success: true,
        feedbackId: `feedback_${Date.now()}`,
        submittedAt: new Date(),
      };
    }),

  /**
   * Get assessment templates (admin only)
   */
  getTemplates: adminProcedure
    .input(getAssessmentTemplatesSchema)
    .query(async ({ ctx, input }) => {
      // Mock assessment templates
      return [
        {
          id: "template_1",
          name: "Data Science Assessment",
          description: "Comprehensive assessment for data science roles",
          criteria: [
            {
              name: "Technical Skills",
              description: "Programming and technical implementation",
              weight: 0.4,
              scoreRange: { min: 1, max: 10 },
            },
            {
              name: "Communication",
              description: "Ability to explain complex concepts",
              weight: 0.3,
              scoreRange: { min: 1, max: 10 },
            },
            {
              name: "Problem Solving",
              description: "Analytical and creative thinking",
              weight: 0.3,
              scoreRange: { min: 1, max: 10 },
            },
          ],
          jobTypes: ["Data Scientist", "ML Engineer"],
          experienceLevels: ["mid", "senior"],
        },
      ];
    }),
});