import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { FeedbackType } from "@prisma/client";

// Input schemas
const createAssessmentSchema = z.object({
  interviewId: z.string(),
  caseId: z.string(),
  overallScore: z.number().min(1).max(5),
  performanceLabel: z.string(),
  whatYouDidBest: z.string(),
  topOpportunitiesForGrowth: z.string(),
  videoUrl: z.string().optional(),
  videoDurationSeconds: z.number().optional(),
  videoThumbnailUrl: z.string().optional(),
  startedAt: z.date(),
  completedAt: z.date(),
  interviewDurationSeconds: z.number(),
  feedbackItems: z.array(z.object({
    feedbackType: z.enum(['STRENGTH', 'GROWTH_AREA']),
    timestampDisplay: z.string(),
    timestampSeconds: z.number(),
    behaviorTitle: z.string(),
    whatYouDid: z.string(),
    whyItWorked: z.string().optional(),
    whatWasMissing: z.string().optional(),
    actionableNextStep: z.string().optional(),
    impactStatement: z.string(),
    displayOrder: z.number()
  })),
  skillScores: z.array(z.object({
    categoryName: z.string(),
    categoryIcon: z.string(),
    categoryOrder: z.number(),
    skillName: z.string(),
    skillScore: z.number().min(1).max(5),
    isFocusArea: z.boolean(),
    skillOrder: z.number()
  }))
});

export const assessmentRouter = createTRPCRouter({
  // Get assessment by ID
  getById: protectedProcedure
    .input(z.object({
      assessmentId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin or assessment owner
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { role: true }
      });

      const isAdmin = user?.role === 'ADMIN';

      const assessment = await ctx.db.interviewAssessment.findUnique({
        where: {
          id: input.assessmentId,
          // Allow admins to access any assessment, regular users only their own
          ...(isAdmin ? {} : { userId: ctx.userId })
        },
        include: {
          feedbackItems: {
            orderBy: [
              { feedbackType: 'asc' },
              { displayOrder: 'asc' }
            ]
          },
          skillScores: {
            include: {
              skill: {
                include: {
                  domain: true
                }
              }
            },
            orderBy: [
              { categoryOrder: 'asc' },
              { skillOrder: 'asc' }
            ]
          },
          interview: true
        }
      });

      if (!assessment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assessment not found',
        });
      }

      // Fetch the case data if caseId exists
      let interviewCase = null;
      if (assessment.caseId) {
        interviewCase = await ctx.db.interviewCase.findUnique({
          where: { id: assessment.caseId },
          include: {
            caseQuestions: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        });
      }

      return {
        ...assessment,
        case: interviewCase
      };
    }),

  // Get assessment by interview ID
  getByInterviewId: protectedProcedure
    .input(z.object({
      interviewId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin or assessment owner
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { role: true }
      });

      const isAdmin = user?.role === 'ADMIN';

      const assessment = await ctx.db.interviewAssessment.findFirst({
        where: {
          interviewId: input.interviewId,
          // Allow admins to access any assessment, regular users only their own
          ...(isAdmin ? {} : { userId: ctx.userId })
        },
        include: {
          feedbackItems: {
            orderBy: [
              { feedbackType: 'asc' },
              { displayOrder: 'asc' }
            ]
          },
          skillScores: {
            include: {
              skill: {
                include: {
                  domain: true
                }
              }
            },
            orderBy: [
              { categoryOrder: 'asc' },
              { skillOrder: 'asc' }
            ]
          },
          interview: true
        }
      });

      if (!assessment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No assessment found for this interview',
        });
      }

      // Fetch the case data if caseId exists
      let interviewCase = null;
      if (assessment.caseId) {
        interviewCase = await ctx.db.interviewCase.findUnique({
          where: { id: assessment.caseId },
          include: {
            caseQuestions: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        });
      }

      return {
        ...assessment,
        case: interviewCase
      };
    }),

  // Get all assessments for current user (or all if admin)
  getUserAssessments: protectedProcedure
    .query(async ({ ctx }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { role: true }
      });

      const isAdmin = user?.role === 'ADMIN';

      const assessments = await ctx.db.interviewAssessment.findMany({
        where: {
          // Admins see all assessments, regular users only their own
          ...(isAdmin ? {} : { userId: ctx.userId })
        },
        include: {
          interview: {
            include: {
              jobDescription: true
            }
          }
        },
        orderBy: {
          completedAt: 'desc'
        }
      });

      return assessments;
    }),

  // Create assessment (for testing or AI service)
  create: protectedProcedure
    .input(createAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the interview exists and belongs to the user
      const interview = await ctx.db.interview.findFirst({
        where: {
          id: input.interviewId,
          userId: ctx.userId
        }
      });

      if (!interview) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Interview not found',
        });
      }

      // For each skill in the input, find or create the corresponding Skill record
      const skillScoresData = await Promise.all(
        input.skillScores.map(async (skillInput) => {
          // Find the skill domain by name (using categoryName as domain name)
          let domain = await ctx.db.skillDomain.findFirst({
            where: { name: skillInput.categoryName }
          });

          // If domain doesn't exist, create it
          if (!domain) {
            // Get the max order to set the new domain's order
            const maxDomain = await ctx.db.skillDomain.findFirst({
              orderBy: { order: 'desc' }
            });
            domain = await ctx.db.skillDomain.create({
              data: {
                name: skillInput.categoryName,
                order: (maxDomain?.order ?? -1) + 1
              }
            });
          }

          // Find or create the skill
          let skill = await ctx.db.skill.findFirst({
            where: {
              name: skillInput.skillName,
              domainId: domain.id
            }
          });

          if (!skill) {
            skill = await ctx.db.skill.create({
              data: {
                name: skillInput.skillName,
                domainId: domain.id
              }
            });
          }

          return {
            skillId: skill.id,
            skillScore: skillInput.skillScore,
            categoryOrder: skillInput.categoryOrder,
            skillOrder: skillInput.skillOrder
          };
        })
      );

      // Create the assessment with all related data
      const assessment = await ctx.db.interviewAssessment.create({
        data: {
          userId: ctx.userId,
          interviewId: input.interviewId,
          caseId: input.caseId,
          overallScore: input.overallScore,
          performanceLabel: input.performanceLabel,
          whatYouDidBest: input.whatYouDidBest,
          topOpportunitiesForGrowth: input.topOpportunitiesForGrowth,
          videoUrl: input.videoUrl,
          videoDurationSeconds: input.videoDurationSeconds,
          videoThumbnailUrl: input.videoThumbnailUrl,
          startedAt: input.startedAt,
          completedAt: input.completedAt,
          interviewDurationSeconds: input.interviewDurationSeconds,
          feedbackItems: {
            create: input.feedbackItems.map(item => ({
              feedbackType: item.feedbackType as FeedbackType,
              timestampDisplay: item.timestampDisplay,
              timestampSeconds: item.timestampSeconds,
              behaviorTitle: item.behaviorTitle,
              whatYouDid: item.whatYouDid,
              whyItWorked: item.whyItWorked,
              whatWasMissing: item.whatWasMissing,
              actionableNextStep: item.actionableNextStep,
              impactStatement: item.impactStatement,
              displayOrder: item.displayOrder
            }))
          },
          skillScores: {
            create: skillScoresData
          }
        },
        include: {
          feedbackItems: true,
          skillScores: true
        }
      });

      return assessment;
    }),

  // Delete assessment (for testing)
  delete: protectedProcedure
    .input(z.object({
      assessmentId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const assessment = await ctx.db.interviewAssessment.findFirst({
        where: {
          id: input.assessmentId,
          userId: ctx.userId
        }
      });

      if (!assessment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assessment not found',
        });
      }

      await ctx.db.interviewAssessment.delete({
        where: { id: input.assessmentId }
      });

      return { success: true };
    }),
});