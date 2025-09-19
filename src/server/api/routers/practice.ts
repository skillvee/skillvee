import { z } from "zod";

import { 
  createTRPCRouter, 
  protectedProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import { 
  analyzePracticeJobDescription, 
  createRoleSelectionSessionData 
} from "../utils/gemini";

// Input schemas
const analyzeJobDescriptionSchema = z.object({
  description: z.string().min(10, "Job description must be at least 10 characters"),
});

const selectRoleSchema = z.object({
  role: z.string().min(1, "Role is required"),
});

const getSessionSchema = z.object({
  sessionId: z.string(),
});

const cleanupExpiredSchema = z.object({
  olderThanDays: z.number().min(1).max(30).default(7),
});

export const practiceRouter = createTRPCRouter({
  /**
   * Analyze job description with AI for practice session
   */
  analyzeJobDescription: protectedProcedure
    .input(analyzeJobDescriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { description } = input;

      // Get available archetypes for matching
      const archetypes = await ctx.db.roleArchetype.findMany({
        where: { deletedAt: null },
        select: { name: true },
      });
      const archetypeNames = archetypes.map(a => a.name);

      // Analyze with AI
      const analysisResult = await analyzePracticeJobDescription(description, archetypeNames);

      if (!analysisResult.success) {
        throw createError.internal(`Failed to analyze job description: ${analysisResult.error}`);
      }

      const data = analysisResult.data;

      // Check for unsupported job types
      if (data.archetypeMatch?.bestMatch === "Other" || 
          (data.archetypeMatch?.confidence !== undefined && data.archetypeMatch.confidence < 0.6)) {
        throw createError.unsupportedJobType(data.title);
      }

      // Validate and sanitize difficulty value
      const validDifficultyValues = ["EASY", "MEDIUM", "HARD", "JUNIOR", "SENIOR"] as const;
      const sanitizedDifficulty = data.difficulty && validDifficultyValues.includes(data.difficulty as any) 
        ? data.difficulty as "EASY" | "MEDIUM" | "HARD" | "JUNIOR" | "SENIOR"
        : "MEDIUM"; // Default to MEDIUM if invalid

      // Find matching archetype ID if one was matched
      let matchedArchetypeId: string | undefined;
      if (data.archetypeMatch?.bestMatch) {
        const matchedArchetype = await ctx.db.roleArchetype.findFirst({
          where: { 
            name: data.archetypeMatch.bestMatch,
            deletedAt: null 
          },
        });
        matchedArchetypeId = matchedArchetype?.id;
      }

      // Create practice session
      let session;
      try {
        session = await ctx.db.practiceSession.create({
          data: {
            userId: ctx.user.id,
            sessionType: "JOB_DESCRIPTION",
            jobTitle: data.title || null,
            company: data.company || null,
            team: data.team || null,
            experience: data.experience || null,
            archetypeId: matchedArchetypeId || null,
            requirements: data.requirements || [],
            focusAreas: data.focusAreas || [],
            difficulty: sanitizedDifficulty,
            extractedInfo: data.extractedInfo ? JSON.parse(JSON.stringify(data.extractedInfo)) : null,
            originalDescription: description,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
          include: {
            archetype: {
              include: {
                roleSkillMappings: {
                  where: { deletedAt: null },
                  include: {
                    skill: {
                      include: {
                        domain: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        // Handle missing table error gracefully
        if (error instanceof Error && error.message.includes('relation "practice_sessions" does not exist')) {
          throw createError.internal("Database migration pending. Please apply the practice_sessions migration and try again.");
        }
        throw error;
      }

      return {
        sessionId: session.id,
        analysisResult: {
          ...data,
          archetypeMatch: data.archetypeMatch ? {
            ...data.archetypeMatch,
            archetype: (session as any).archetype ?? null,
          } : undefined,
        },
      };
    }),

  /**
   * Create practice session for role selection (without job description)
   */
  selectRole: protectedProcedure
    .input(selectRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const { role } = input;

      // Generate session data for role selection
      const sessionData = createRoleSelectionSessionData(role);
      const data = sessionData.data;

      // Create practice session
      let session;
      try {
        session = await ctx.db.practiceSession.create({
          data: {
            userId: ctx.user.id,
            sessionType: "ROLE_SELECTION",
            jobTitle: data.title || null,
            company: data.company || null,
            team: data.team || null,
            experience: data.experience || null,
            archetypeId: null, // No archetype matching for role selection
            requirements: data.requirements || [],
            focusAreas: data.focusAreas || [],
            difficulty: "MEDIUM", // Default for role selection
            extractedInfo: data.extractedInfo ? JSON.parse(JSON.stringify(data.extractedInfo)) : null,
            originalDescription: null,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });
      } catch (error) {
        // Handle missing table error gracefully
        if (error instanceof Error && error.message.includes('relation "practice_sessions" does not exist')) {
          throw createError.internal("Database migration pending. Please apply the practice_sessions migration and try again.");
        }
        throw error;
      }

      return {
        sessionId: session.id,
        sessionData: data,
      };
    }),

  /**
   * Get practice session data
   */
  getSession: protectedProcedure
    .input(getSessionSchema)
    .query(async ({ ctx, input }) => {
      const { sessionId } = input;

      let session;
      try {
        session = await ctx.db.practiceSession.findFirst({
          where: {
            id: sessionId,
            userId: ctx.user.id,
            expiresAt: { gt: new Date() }, // Not expired
          },
          include: {
            archetype: {
              include: {
                roleSkillMappings: {
                  where: { deletedAt: null },
                  include: {
                    skill: {
                      include: {
                        domain: true,
                      },
                    },
                  },
                },
              },
            },
            interviews: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                status: true,
                createdAt: true,
                completedAt: true,
                assessment: {
                  select: {
                    overallScore: true,
                    technicalScore: true,
                    communicationScore: true,
                    problemSolvingScore: true,
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        // Handle missing table error gracefully
        if (error instanceof Error && error.message.includes('relation "practice_sessions" does not exist')) {
          throw createError.internal("Database migration pending. Please apply the practice_sessions migration and try again.");
        }
        throw error;
      }

      if (!session) {
        throw createError.notFound("Practice session", sessionId);
      }

      return {
        id: session.id,
        sessionType: session.sessionType,
        jobTitle: session.jobTitle,
        company: session.company,
        team: session.team,
        experience: session.experience,
        difficulty: session.difficulty,
        requirements: session.requirements,
        focusAreas: session.focusAreas,
        extractedInfo: session.extractedInfo,
        originalDescription: session.originalDescription,
        archetype: session.archetype,
        interviews: session.interviews,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      };
    }),

  /**
   * Clean up expired practice sessions (admin/background job)
   */
  cleanupExpired: protectedProcedure
    .input(cleanupExpiredSchema)
    .mutation(async ({ ctx, input }) => {
      const { olderThanDays } = input;
      
      // Only allow cleanup for admin users or the system
      if (ctx.user.role !== "ADMIN") {
        throw createError.forbidden("cleanup expired sessions");
      }

      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

      const deletedSessions = await ctx.db.practiceSession.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } }, // Already expired
            { createdAt: { lt: cutoffDate } }, // Older than specified days
          ],
        },
      });

      return {
        deletedCount: deletedSessions.count,
        cutoffDate,
      };
    }),

  /**
   * Get user's recent practice sessions
   */
  getRecentSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const sessions = await ctx.db.practiceSession.findMany({
        where: {
          userId: ctx.user.id,
          expiresAt: { gt: new Date() }, // Not expired
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          sessionType: true,
          jobTitle: true,
          company: true,
          createdAt: true,
          expiresAt: true,
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });

      return sessions;
    }),
});