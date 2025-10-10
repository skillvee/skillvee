import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { 
  createTRPCRouter, 
  protectedProcedure, 
  adminProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import {
  createPaginationArgs,
  processPaginationResults,
  createSearchConditions,
  createDateRangeFilter,
  createSortCondition,
  combineFilters,
  createInclusionFilter,
  createPermissionFilter,
} from "../utils/pagination";

import {
  createInterviewSchema,
  updateInterviewSchema,
  getInterviewSchema,
  startInterviewSchema,
  completeInterviewSchema,
  cancelInterviewSchema,
  listInterviewsSchema,
  getInterviewStatsSchema,
  createQuestionSchema,
  updateQuestionSchema,
  bulkCreateQuestionsSchema,
  createInterviewNoteSchema,
  updateInterviewNoteSchema,
  listInterviewNotesSchema,
  extendSessionSchema,
  saveSessionStateSchema,
  type InterviewOutput,
  type InterviewListOutput,
  type InterviewStatsOutput,
  type QuestionOutput,
  type InterviewNoteOutput,
} from "../schemas/interview";

export const interviewRouter = createTRPCRouter({
  /**
   * Create a new interview
   */
  create: protectedProcedure
    .input(createInterviewSchema)
    .mutation(async ({ ctx, input }) => {
      const { jobDescriptionId, scheduledAt, notes } = input;

      // Verify job description exists and user has access
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

      const interview = await ctx.db.interview.create({
        data: {
          userId: ctx.user.id,
          jobDescriptionId,
          status: scheduledAt ? "SCHEDULED" : "IN_PROGRESS",
          scheduledAt,
          startedAt: scheduledAt ? null : new Date(),
          notes,
        },
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
              focusAreas: true,
            },
          },
          _count: {
            select: {
              questions: true,
              interviewNotes: true,
              mediaRecordings: true,
            },
          },
        },
      });

      return interview;
    }),

  /**
   * Get interview by ID
   */
  getById: protectedProcedure
    .input(getInterviewSchema)
    .query(async ({ ctx, input }) => {
      const { 
        id, 
        includeQuestions, 
        includeAssessment, 
        includeMediaRecordings, 
        includeNotes 
      } = input;

      const interview = await ctx.db.interview.findFirst({
        where: {
          id,
          deletedAt: null,
          OR: [
            { userId: ctx.user.id },
            ...(ctx.user.role === "ADMIN" ? [{}] : []),
          ],
        },
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
              focusAreas: true,
            },
          },
          questions: includeQuestions ? {
            orderBy: { orderIndex: "asc" },
          } : false,
          assessment: includeAssessment ? true : false,
          mediaRecordings: includeMediaRecordings ? {
            select: {
              id: true,
              recordingType: true,
              filePath: true,
              duration: true,
              uploadStatus: true,
              transcriptionStatus: true,
            },
          } : false,
          interviewNotes: includeNotes ? {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { timestamp: "asc" },
          } : false,
          _count: {
            select: {
              questions: true,
              interviewNotes: true,
              mediaRecordings: true,
            },
          },
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", id);
      }

      return interview as InterviewOutput;
    }),

  /**
   * Update interview
   */
  update: protectedProcedure
    .input(updateInterviewSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if interview exists and user has permission
      const existing = await ctx.db.interview.findFirst({
        where: {
          id,
          deletedAt: null,
          OR: [
            { userId: ctx.user.id },
            ...(ctx.user.role === "ADMIN" ? [{}] : []),
          ],
        },
      });

      if (!existing) {
        throw createError.notFound("Interview", id);
      }

      // Validate status transitions
      if (updateData.status) {
        const validTransitions: Record<string, string[]> = {
          SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
          IN_PROGRESS: ["COMPLETED", "CANCELLED"],
          COMPLETED: [], // Cannot change from completed
          CANCELLED: [], // Cannot change from cancelled
        };

        const allowedStatuses = validTransitions[existing.status] || [];
        if (!allowedStatuses.includes(updateData.status)) {
          throw createError.conflict(
            `Cannot change interview status from ${existing.status} to ${updateData.status}`
          );
        }
      }

      const updatedInterview = await ctx.db.interview.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
          _count: {
            select: {
              questions: true,
              interviewNotes: true,
              mediaRecordings: true,
            },
          },
        },
      });

      return updatedInterview;
    }),

  /**
   * Start an interview
   */
  start: protectedProcedure
    .input(startInterviewSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, geminiSessionId } = input;

      const interview = await ctx.db.interview.findFirst({
        where: {
          id,
          userId: ctx.user.id,
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", id);
      }

      if (interview.status !== "SCHEDULED") {
        throw createError.conflict("Interview must be scheduled to start");
      }

      const updatedInterview = await ctx.db.interview.update({
        where: { id },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
          geminiSessionId,
          updatedAt: new Date(),
        },
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
              focusAreas: true,
            },
          },
        },
      });

      return updatedInterview;
    }),

  /**
   * Complete an interview
   */
  complete: protectedProcedure
    .input(completeInterviewSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, duration, finalNotes } = input;

      const interview = await ctx.db.interview.findFirst({
        where: {
          id,
          userId: ctx.user.id,
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", id);
      }

      if (interview.status !== "IN_PROGRESS") {
        throw createError.conflict("Interview must be in progress to complete");
      }

      // Calculate duration if not provided
      let calculatedDuration = duration;
      if (!calculatedDuration && interview.startedAt) {
        calculatedDuration = Math.round((Date.now() - interview.startedAt.getTime()) / (1000 * 60));
      }

      const updatedInterview = await ctx.db.interview.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          duration: calculatedDuration,
          notes: finalNotes || interview.notes,
          updatedAt: new Date(),
        },
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
          _count: {
            select: {
              questions: true,
              interviewNotes: true,
              mediaRecordings: true,
            },
          },
        },
      });

      return updatedInterview;
    }),

  /**
   * Cancel an interview
   */
  cancel: protectedProcedure
    .input(cancelInterviewSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, reason } = input;

      const interview = await ctx.db.interview.findFirst({
        where: {
          id,
          userId: ctx.user.id,
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", id);
      }

      if (interview.status === "COMPLETED") {
        throw createError.conflict("Cannot cancel a completed interview");
      }

      if (interview.status === "CANCELLED") {
        throw createError.conflict("Interview is already cancelled");
      }

      const updatedInterview = await ctx.db.interview.update({
        where: { id },
        data: {
          status: "CANCELLED",
          notes: reason ? `${interview.notes || ""}\n\nCancellation reason: ${reason}`.trim() : interview.notes,
          updatedAt: new Date(),
        },
      });

      return updatedInterview;
    }),

  /**
   * List interviews with filtering and pagination
   */
  list: protectedProcedure
    .input(listInterviewsSchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        query,
        sortBy,
        sortDirection,
        from,
        to,
        status,
        jobDescriptionId,
        userId,
        includeDeleted,
      } = input;

      // Build filters
      const searchFilter = createSearchConditions(query, ["notes"]);
      const dateFilter = createDateRangeFilter(from, to, "createdAt");
      const inclusionFilter = createInclusionFilter(includeDeleted);
      
      // Permission filter - users can only see their own interviews unless admin
      const permissionFilter = ctx.user.role === "ADMIN" 
        ? (userId ? { userId } : {})
        : { userId: ctx.user.id };

      const filters = combineFilters(
        inclusionFilter,
        permissionFilter,
        searchFilter,
        dateFilter,
        status ? { status } : undefined,
        jobDescriptionId ? { jobDescriptionId } : undefined
      );

      // Build sort condition
      const orderBy = createSortCondition(sortBy, sortDirection, { createdAt: "desc" });

      // Execute query with simplified pagination
      const interviews = await ctx.db.interview.findMany({
        where: filters,
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
          assessment: {
            select: {
              id: true,
              overallScore: true,
              technicalScore: true,
              communicationScore: true,
              problemSolvingScore: true,
            },
          },
          _count: {
            select: {
              questions: true,
              interviewNotes: true,
              mediaRecordings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      // Process pagination results
      const paginationResult = processPaginationResults(interviews, { limit, cursor });

      return {
        ...paginationResult,
        totalCount: await ctx.db.interview.count({ where: filters }),
      } as InterviewListOutput;
    }),

  /**
   * Get interview statistics
   */
  getStats: protectedProcedure
    .input(getInterviewStatsSchema)
    .query(async ({ ctx, input }) => {
      const { userId, from, to } = input;
      
      // Determine user filter based on role and input
      const userFilter = ctx.user.role === "ADMIN" 
        ? (userId ? { userId } : {})
        : { userId: ctx.user.id };

      const dateFilter = createDateRangeFilter(from, to, "createdAt");
      const baseFilter = combineFilters(
        { deletedAt: null },
        userFilter,
        dateFilter
      );

      const [
        totalInterviews,
        completedInterviews,
        avgDuration,
        avgScore,
        statusDistribution,
        recentInterviews,
        monthlyTrends,
        topFocusAreas,
      ] = await Promise.all([
        // Total interviews
        ctx.db.interview.count({ where: baseFilter }),
        
        // Completed interviews
        ctx.db.interview.count({ 
          where: { ...baseFilter, status: "COMPLETED" } 
        }),
        
        // Average duration
        ctx.db.interview.aggregate({
          where: { ...baseFilter, status: "COMPLETED" },
          _avg: { duration: true },
        }),
        
        // Average score from assessments
        ctx.db.assessment.aggregate({
          where: {
            interview: baseFilter,
          },
          _avg: { overallScore: true },
        }),
        
        // Status distribution
        ctx.db.interview.groupBy({
          by: ["status"],
          where: baseFilter,
          _count: { status: true },
        }).then(results => 
          results.reduce((acc, { status, _count }) => ({
            ...acc,
            [status]: _count.status,
          }), {} as Record<string, number>)
        ),
        
        // Recent interviews
        ctx.db.interview.findMany({
          where: baseFilter,
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            jobDescription: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
        }),
        
        // Monthly trends (last 12 months)
        ctx.db.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*)::int as count,
            AVG(CASE WHEN status = 'COMPLETED' THEN 
              (SELECT "overallScore" FROM assessments WHERE "interviewId" = interviews.id)
            END)::float as "averageScore"
          FROM interviews 
          WHERE "deletedAt" IS NULL 
            AND "createdAt" >= NOW() - INTERVAL '12 months'
            ${userId ? `AND "userId" = '${userId}'` : ''}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month ASC
        `,
        
        // Top focus areas
        ctx.db.interview.findMany({
          where: baseFilter,
          include: {
            jobDescription: {
              select: {
                focusAreas: true,
              },
            },
          },
        }).then(interviews => {
          const areaCount: Record<string, number> = {};
          interviews.forEach(interview => {
            interview.jobDescription.focusAreas.forEach(area => {
              areaCount[area] = (areaCount[area] || 0) + 1;
            });
          });
          
          return Object.entries(areaCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([area, count]) => ({ area, count }));
        }),
      ]);

      const result: InterviewStatsOutput = {
        totalInterviews,
        completedInterviews,
        averageDuration: avgDuration._avg.duration,
        averageScore: avgScore._avg.overallScore,
        statusDistribution,
        recentInterviews,
        trendsData: {
          monthlyInterviews: (monthlyTrends as any[]).map(row => ({
            month: row.month.toISOString().slice(0, 7), // YYYY-MM format
            count: row.count,
            averageScore: row.averageScore,
          })),
          topFocusAreas,
        },
      };

      return result;
    }),

  /**
   * Question management
   */
  questions: createTRPCRouter({
    create: protectedProcedure
      .input(createQuestionSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify interview exists and user has permission
        const interview = await ctx.db.interview.findFirst({
          where: {
            id: input.interviewId,
            userId: ctx.user.id,
            deletedAt: null,
          },
        });

        if (!interview) {
          throw createError.notFound("Interview", input.interviewId);
        }

        const question = await ctx.db.question.create({
          data: input,
        });

        return question;
      }),

    update: protectedProcedure
      .input(updateQuestionSchema)
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;

        // Verify question exists and user has permission
        const question = await ctx.db.question.findFirst({
          where: {
            id,
            interview: {
              userId: ctx.user.id,
              deletedAt: null,
            },
          },
        });

        if (!question) {
          throw createError.notFound("Question", id);
        }

        const updatedQuestion = await ctx.db.question.update({
          where: { id },
          data: updateData,
        });

        return updatedQuestion;
      }),

    bulkCreate: protectedProcedure
      .input(bulkCreateQuestionsSchema)
      .mutation(async ({ ctx, input }) => {
        const { interviewId, questions } = input;

        // Verify interview exists and user has permission
        const interview = await ctx.db.interview.findFirst({
          where: {
            id: interviewId,
            userId: ctx.user.id,
            deletedAt: null,
          },
        });

        if (!interview) {
          throw createError.notFound("Interview", interviewId);
        }

        const createdQuestions = await ctx.db.question.createMany({
          data: questions.map(q => ({
            ...q,
            interviewId,
          })),
        });

        return {
          success: true,
          createdCount: createdQuestions.count,
        };
      }),
  }),

  /**
   * Interview notes management
   */
  notes: createTRPCRouter({
    create: protectedProcedure
      .input(createInterviewNoteSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify interview exists and user has permission
        const interview = await ctx.db.interview.findFirst({
          where: {
            id: input.interviewId,
            userId: ctx.user.id,
            deletedAt: null,
          },
        });

        if (!interview) {
          throw createError.notFound("Interview", input.interviewId);
        }

        const note = await ctx.db.interviewNote.create({
          data: {
            ...input,
            userId: ctx.user.id,
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        return note;
      }),

    update: protectedProcedure
      .input(updateInterviewNoteSchema)
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;

        // Verify note exists and user has permission
        const note = await ctx.db.interviewNote.findFirst({
          where: {
            id,
            userId: ctx.user.id,
          },
        });

        if (!note) {
          throw createError.notFound("Interview note", id);
        }

        const updatedNote = await ctx.db.interviewNote.update({
          where: { id },
          data: updateData,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        return updatedNote;
      }),

    list: protectedProcedure
      .input(listInterviewNotesSchema)
      .query(async ({ ctx, input }) => {
        const { interviewId, limit, cursor } = input;

        // Verify interview exists and user has permission
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

        const notes = await ctx.db.interviewNote.findMany({
          where: { interviewId },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { timestamp: "asc" },
          take: limit,
          skip: cursor ? 1 : 0,
          ...(cursor ? { cursor: { id: cursor } } : {}),
        });

        return processPaginationResults(notes, { limit, cursor });
      }),
  }),

  /**
   * Session management
   */
  extendSession: protectedProcedure
    .input(extendSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { interviewId, additionalMinutes } = input;

      const interview = await ctx.db.interview.findFirst({
        where: {
          id: interviewId,
          userId: ctx.user.id,
          status: "IN_PROGRESS",
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Active interview", interviewId);
      }

      // Log the session extension (you might want to store this in a separate table)
      await ctx.db.interview.update({
        where: { id: interviewId },
        data: {
          notes: `${interview.notes || ""}\n\nSession extended by ${additionalMinutes} minutes at ${new Date().toISOString()}`.trim(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        extendedBy: additionalMinutes,
        newEndTime: new Date(Date.now() + additionalMinutes * 60 * 1000),
      };
    }),

  saveSessionState: protectedProcedure
    .input(saveSessionStateSchema)
    .mutation(async ({ ctx, input }) => {
      const { interviewId, sessionState, currentQuestionIndex } = input;

      const interview = await ctx.db.interview.findFirst({
        where: {
          id: interviewId,
          userId: ctx.user.id,
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", interviewId);
      }

      // For now, store session state in notes (in production, use a dedicated table)
      const stateString = JSON.stringify({
        sessionState,
        currentQuestionIndex,
        timestamp: new Date().toISOString(),
      });

      await ctx.db.interview.update({
        where: { id: interviewId },
        data: {
          notes: `${interview.notes || ""}\n\nSession state saved: ${stateString}`.trim(),
          updatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Save conversation transcript and screenshots from Gemini Live session
   */
  saveConversationData: protectedProcedure
    .input(z.object({
      interviewId: z.string(),
      conversationData: z.object({
        sessionId: z.string(),
        model: z.string(),
        duration: z.number().optional().nullable(),
        turns: z.array(z.any()),
        screenCaptures: z.array(z.any()),
        analytics: z.any(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { interviewId, conversationData } = input;

      // Verify interview belongs to user
      const interview = await ctx.db.interview.findFirst({
        where: {
          id: interviewId,
          userId: ctx.user.id,
          deletedAt: null,
        },
      });

      if (!interview) {
        throw createError.notFound("Interview", interviewId);
      }

      // Save conversation transcript
      const transcript = await ctx.db.conversationTranscript.create({
        data: {
          interviewId,
          sessionId: conversationData.sessionId,
          model: conversationData.model,
          duration: conversationData.duration || 0,
          turns: conversationData.turns,
          screenshots: conversationData.screenCaptures,
          analytics: conversationData.analytics,
        },
      });

      // Update interview status and duration
      await ctx.db.interview.update({
        where: { id: interviewId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          duration: conversationData.duration || undefined,
          geminiSessionId: conversationData.sessionId,
        },
      });

      return transcript;
    }),

  /**
   * Get conversation data for an interview
   */
  getConversationData: protectedProcedure
    .input(z.object({ interviewId: z.string() }))
    .query(async ({ ctx, input }) => {
      const transcript = await ctx.db.conversationTranscript.findUnique({
        where: { interviewId: input.interviewId },
        include: {
          interview: {
            include: {
              jobDescription: {
                select: {
                  title: true,
                  company: true,
                  companyName: true,
                  focusAreas: true,
                },
              },
            },
          },
        },
      });

      if (!transcript) {
        throw createError.notFound("Conversation transcript", input.interviewId);
      }

      // Verify ownership
      if (transcript.interview.userId !== ctx.user.id && ctx.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this conversation",
        });
      }

      return transcript;
    }),
});