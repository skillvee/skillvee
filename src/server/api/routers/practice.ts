import { z } from "zod";

import { 
  createTRPCRouter, 
  protectedProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import { createRoleSelectionSessionData } from "../utils/gemini";
import { analyzeJobDescription } from "../../ai/services/job-analysis.service";
import { generateInterviewCase } from "../../ai/services/case-generation.service";

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

const createInterviewCaseSchema = z.object({
  sessionId: z.string(),
  domainId: z.string(),
  selectedSkills: z.array(z.string()), // Skill names from UI
});

const getInterviewCaseSchema = z.object({
  caseId: z.string(),
});

export const practiceRouter = createTRPCRouter({
  /**
   * Analyze job description with AI for practice session
   */
  analyzeJobDescription: protectedProcedure
    .input(analyzeJobDescriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { description } = input;

      // Get available archetypes with roles for matching
      const archetypes = await ctx.db.roleArchetype.findMany({
        where: { deletedAt: null },
        include: {
          roles: {
            select: { title: true },
            where: { deletedAt: null },
          },
        },
      });

      // Analyze with AI using new service
      const analysisResult = await analyzeJobDescription(
        description,
        archetypes,
        ctx.user.id,
        undefined // sessionId will be created after analysis
      );

      if (!analysisResult.success) {
        throw createError.internal(`Failed to analyze job description: ${analysisResult.error}`);
      }

      const data = analysisResult.data;

      if (!data) {
        throw createError.internal("No data returned from job analysis");
      }

      // Check for unsupported job types using new confidence field
      if (data.archetypeId === undefined || data.archetypeConfidence < 0.6) {
        throw createError.unsupportedJobType(data.title || "Unknown");
      }

      // Validate and sanitize difficulty value
      const validDifficultyValues = ["EASY", "MEDIUM", "HARD", "JUNIOR", "SENIOR"] as const;
      const sanitizedDifficulty = data.difficulty && validDifficultyValues.includes(data.difficulty as any) 
        ? data.difficulty as "EASY" | "MEDIUM" | "HARD" | "JUNIOR" | "SENIOR"
        : "MEDIUM"; // Default to MEDIUM if invalid

      // Find matching archetype by simpleId
      let matchedArchetypeId: string | undefined;
      if (data.archetypeId) {
        const matchedArchetype = await ctx.db.roleArchetype.findFirst({
          where: {
            simpleId: data.archetypeId,
            deletedAt: null
          },
        });
        if (!matchedArchetype) {
          console.warn(`[Practice] No archetype found for simpleId ${data.archetypeId}`);
        } else {
          matchedArchetypeId = matchedArchetype.id;
          console.log(`[Practice] Matched archetype: ${matchedArchetype.name} (simpleId: ${data.archetypeId})`);
        }
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
            extractedInfo: data.extractedInfo as any || null,
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
          archetypeMatch: {
            archetype: session.archetype || null,
            confidence: data.archetypeConfidence,
          },
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

      // Create role-to-archetype mapping
      const roleArchetypeMapping: Record<string, string[]> = {
        "Data Analyst": ["Data Analyst", "Business Analyst", "Analytics"],
        "Machine Learning Engineer": ["Machine Learning Engineer", "ML Engineer", "AI Engineer", "Data Scientist"],
        "ML Research Scientist": ["ML Research Scientist", "Research Scientist", "AI Researcher", "Data Scientist"],
        "Data Engineer": ["Data Engineer", "Data Infrastructure Engineer", "Backend Engineer"],
        "Analytics Engineer": ["Analytics Engineer", "Data Analyst", "Business Intelligence"],
        "Quantitative Analyst": ["Quantitative Analyst", "Quant", "Financial Analyst", "Data Scientist"],
        "AI / Deep Learning Specialist": ["AI Specialist", "Deep Learning Engineer", "AI Engineer", "Machine Learning Engineer"],
      };

      // Find matching archetype from database using single query with OR conditions
      let matchedArchetype = null;
      const possibleMatches = roleArchetypeMapping[role] || [role];
      
      // Use a single query with OR conditions to avoid connection pool issues
      const archetypes = await ctx.db.roleArchetype.findMany({
        where: { 
          OR: possibleMatches.map(archetypeName => ({
            name: { contains: archetypeName, mode: 'insensitive' }
          })),
          deletedAt: null 
        },
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
        orderBy: { name: 'asc' }, // Consistent ordering
        take: 1, // Only take the first match
      });
      
      if (archetypes.length > 0) {
        matchedArchetype = archetypes[0];
      }

      // Extract focus areas from archetype skills or use fallback
      let focusAreas: string[] = [];
      if (matchedArchetype && matchedArchetype.roleSkillMappings.length > 0) {
        // Group skills by domain and pick top domains
        const domainSkillCounts = new Map<string, number>();
        matchedArchetype.roleSkillMappings.forEach(mapping => {
          const domainName = mapping.skill.domain.name;
          domainSkillCounts.set(domainName, (domainSkillCounts.get(domainName) || 0) + 1);
        });
        
        // Sort domains by skill count and take top ones
        focusAreas = Array.from(domainSkillCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([domain]) => domain);
      } else {
        // Fallback to hardcoded focus areas from gemini utility
        const sessionData = createRoleSelectionSessionData(role);
        focusAreas = sessionData.data.focusAreas || [];
      }

      // Create practice session with minimal data to avoid connection issues
      let session;
      try {
        session = await ctx.db.practiceSession.create({
          data: {
            userId: ctx.user.id,
            sessionType: "ROLE_SELECTION",
            jobTitle: role,
            company: null, // Unknown for role selection
            team: null, // Unknown for role selection  
            experience: null, // Unknown for role selection
            archetypeId: matchedArchetype?.id || null,
            requirements: [],
            focusAreas: focusAreas,
            difficulty: "MEDIUM", // Default for role selection
            extractedInfo: {
              summary: `Practice interview session for ${role} position`,
            } as any,
            originalDescription: null,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
          // Remove includes to reduce connection pool pressure
          select: {
            id: true,
            userId: true,
            sessionType: true,
            jobTitle: true,
            company: true,
            team: true,
            experience: true,
            archetypeId: true,
            requirements: true,
            focusAreas: true,
            difficulty: true,
            extractedInfo: true,
            originalDescription: true,
            createdAt: true,
            expiresAt: true,
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
        matchedArchetype: matchedArchetype ? {
          id: matchedArchetype.id,
          name: matchedArchetype.name,
          skillDomains: focusAreas,
        } : null,
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

  /**
   * Create an interview case based on selected skills
   */
  createInterviewCase: protectedProcedure
    .input(createInterviewCaseSchema)
    .mutation(async ({ ctx, input }) => {
      const { sessionId, domainId, selectedSkills } = input;

      console.log(`\n${'='.repeat(80)}`);
      console.log(`[CREATE INTERVIEW CASE] ${new Date().toISOString()}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`[User ID]: ${ctx.user.id}`);
      console.log(`[Session ID]: ${sessionId}`);
      console.log(`[Domain ID]: ${domainId}`);
      console.log(`[Selected Skills]: ${selectedSkills.join(', ')}`);
      console.log(`${'='.repeat(80)}\n`);

      // 1. Get practice session with archetype data
      const session = await ctx.db.practiceSession.findUnique({
        where: { id: sessionId },
        include: {
          archetype: {
            include: {
              roleSkillMappings: {
                where: { deletedAt: null },
                include: {
                  skill: {
                    include: {
                      skillLevels: {
                        orderBy: { level: 'asc' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!session) {
        throw createError.notFound("Practice session", sessionId);
      }

      if (session.userId !== ctx.user.id) {
        throw createError.forbidden("access this practice session");
      }

      console.log(`[Session Details]:`);
      console.log(`  - Job Title: ${session.jobTitle || 'Not specified'}`);
      console.log(`  - Company: ${session.company || 'Not specified'}`);
      console.log(`  - Experience: ${session.experience || 'Not specified'}`);
      console.log(`  - Archetype: ${session.archetype?.name || 'Not specified'}`);

      // 2. Build skill requirements for Gemini
      const skillRequirements = [];

      console.log(`[Building Skill Requirements]:`);

      for (const skillName of selectedSkills) {
        const mapping = session.archetype?.roleSkillMappings.find(
          m => m.skill.name === skillName
        );

        if (!mapping) {
          // If skill not in mapping, still include it with default level
          skillRequirements.push({
            skillId: skillName, // Use name as fallback ID
            skillName: skillName,
            targetProficiency: 2, // Default to Competent
            observableBehaviors: []
          });
          continue;
        }

        // Determine target proficiency based on importance
        const targetLevel = {
          'HIGH': 3,    // Proficient
          'MEDIUM': 2,  // Competent
          'LOW': 1      // Aware
        }[mapping.importance];

        // Get all skill levels (1, 2, 3) to provide complete context for assessment
        // This helps the AI understand the full progression and better discriminate between levels
        const allSkillLevels = mapping.skill.skillLevels.filter(
          sl => sl.level >= 1 && sl.level <= 3
        ).sort((a, b) => a.level - b.level);

        const requirement = {
          skillId: mapping.skill.id,
          skillName: mapping.skill.name,
          targetProficiency: targetLevel,
          observableBehaviors: allSkillLevels.map(sl => ({
            level: sl.level,
            description: sl.observableBehaviors, // Use observableBehaviors field
            generalDescription: sl.generalDescription,
            exampleResponses: sl.exampleResponses,
            commonMistakes: sl.commonMistakes
          }))
        };

        skillRequirements.push(requirement);

        console.log(`  - ${mapping.skill.name}:`);
        console.log(`    * Importance: ${mapping.importance}`);
        console.log(`    * Target Proficiency: Level ${targetLevel}`);
        console.log(`    * Observable Behaviors: ${allSkillLevels.length} levels (all levels for context)`);
      }

      // 3. Generate case with new AI service
      const caseResult = await generateInterviewCase({
        jobTitle: session.jobTitle || "Data Professional",
        company: session.company || undefined,
        experience: session.experience || undefined,
        userId: ctx.user.id,
        sessionId,
        skillRequirements,
      });

      if (!caseResult.success || !caseResult.data) {
        throw createError.internal(`Failed to generate interview case: ${caseResult.error}`);
      }

      const generatedCase = caseResult.data;

      // 4. Store the case and questions
      const interviewCase = await ctx.db.interviewCase.create({
        data: {
          practiceSessionId: sessionId,
          caseTitle: generatedCase.title,
          caseContext: generatedCase.context,
          caseData: generatedCase,
          totalDuration: generatedCase.questions.length * 15, // Estimate 15 min per question
          caseQuestions: {
            create: generatedCase.questions.map((q: any, idx: number) => ({
              questionText: q.questionText,
              questionContext: q.questionContext,
              skillsToEvaluate: q.evaluatesSkills || [],
              followUpQuestions: q.followUps || [],
              orderIndex: idx,
            }))
          }
        },
        include: {
          caseQuestions: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      });

      console.log(`\n[Interview Case Created Successfully]:`);
      console.log(`  - Case ID: ${interviewCase.id}`);
      console.log(`  - Title: ${interviewCase.caseTitle}`);
      console.log(`  - Total Duration: ${interviewCase.totalDuration} minutes`);
      console.log(`  - Questions Count: ${interviewCase.caseQuestions.length}`);
      console.log(`${'='.repeat(80)}\n`);

      return {
        caseId: interviewCase.id,
        case: interviewCase
      };
    }),

  /**
   * Get an interview case by ID
   */
  getInterviewCase: protectedProcedure
    .input(getInterviewCaseSchema)
    .query(async ({ ctx, input }) => {
      const { caseId } = input;

      const interviewCase = await ctx.db.interviewCase.findUnique({
        where: { id: caseId },
        include: {
          caseQuestions: {
            orderBy: { orderIndex: 'asc' }
          },
          practiceSession: {
            select: {
              id: true,
              userId: true,
              jobTitle: true,
              company: true
            }
          }
        }
      });

      if (!interviewCase) {
        throw createError.notFound("Interview case", caseId);
      }

      // Check if user has access to this case
      if (interviewCase.practiceSession.userId !== ctx.user.id && ctx.user.role !== "ADMIN") {
        throw createError.forbidden("access this interview case");
      }

      return interviewCase;
    }),

  /**
   * Get user's interview cases
   */
  getUserCases: protectedProcedure
    .query(async ({ ctx }) => {
      const cases = await ctx.db.interviewCase.findMany({
        where: {
          practiceSession: {
            userId: ctx.user.id
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20, // Limit to recent 20 cases
        include: {
          _count: {
            select: {
              caseQuestions: true
            }
          }
        }
      });

      return cases;
    }),
});