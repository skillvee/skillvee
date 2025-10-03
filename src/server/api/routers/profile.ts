import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { FitLevel } from "@prisma/client";

// Input validation schemas
const createProfileSchema = z.object({
  currentTitle: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  isPublic: z.boolean().default(false),
  profileSlug: z.string().optional(),
});

const roleFitSchema = z.object({
  roleTitle: z.string(),
  fitLevel: z.enum(["VERY_HIGH", "HIGH", "MEDIUM", "LOW"] as const),
  displayOrder: z.number(),
});

const skillScoreSchema = z.object({
  skillId: z.string(),
  score: z.number().min(0).max(100),
});

const workExperienceSchema = z.object({
  companyName: z.string(),
  title: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
});

const educationSchema = z.object({
  institutionName: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  startYear: z.number(),
  endYear: z.number().optional(),
  description: z.string().optional(),
});

export const profileRouter = createTRPCRouter({
  // Get profile by username or slug
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      // First try to find by profileSlug
      let userProfile = await ctx.db.userProfile.findFirst({
        where: { profileSlug: input.username },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });

      // If not found by slug, try to find by email prefix (username part)
      if (!userProfile) {
        const user = await ctx.db.user.findFirst({
          where: {
            email: {
              startsWith: input.username,
              contains: "@",
            },
          },
        });

        if (user) {
          userProfile = await ctx.db.userProfile.findUnique({
            where: { userId: user.id },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profileImage: true,
                },
              },
            },
          });
        }
      }

      if (!userProfile || !userProfile.isPublic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found or not public",
        });
      }

      // Fetch all related data in parallel
      const [roleFits, skillScores, workExperiences, educations] = await Promise.all([
        // Role fits
        ctx.db.userRoleFit.findMany({
          where: { userId: userProfile.userId },
          orderBy: { displayOrder: "asc" },
        }),

        // Skill scores with domain information
        ctx.db.profileSkillScore.findMany({
          where: { userId: userProfile.userId },
          include: {
            skill: {
              include: {
                domain: true,
              },
            },
          },
        }),

        // Work experiences
        ctx.db.workExperience.findMany({
          where: { userId: userProfile.userId },
          include: {
            company: true,
          },
          orderBy: { displayOrder: "asc" },
        }),

        // Education
        ctx.db.education.findMany({
          where: { userId: userProfile.userId },
          include: {
            institution: true,
          },
          orderBy: { displayOrder: "asc" },
        }),
      ]);

      // Calculate years of experience
      const yearsExperience = workExperiences.length > 0
        ? Math.floor(
            (Date.now() - new Date(workExperiences[workExperiences.length - 1]!.startDate).getTime()) /
              (1000 * 60 * 60 * 24 * 365)
          )
        : 0;

      // Format highest education
      const highestEducation = educations[0];
      const educationSummary = highestEducation
        ? `${highestEducation.degree} ${highestEducation.institution.name}`
        : null;

      return {
        profile: userProfile,
        roleFits,
        skillScores: skillScores.map(ss => ({
          id: ss.id,
          skillName: ss.skill.name,
          category: ss.skill.domain.name,
          score: ss.score,
          skillId: ss.skillId,
        })),
        workExperiences,
        educations,
        yearsExperience,
        educationSummary,
      };
    }),

  // Get current user's profile for editing
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const userProfile = await ctx.db.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // Fetch all related data
    const [roleFits, skillScores, workExperiences, educations] = await Promise.all([
      ctx.db.userRoleFit.findMany({
        where: { userId },
        orderBy: { displayOrder: "asc" },
      }),
      ctx.db.profileSkillScore.findMany({
        where: { userId },
        include: {
          skill: {
            include: {
              domain: true,
            },
          },
        },
      }),
      ctx.db.workExperience.findMany({
        where: { userId },
        include: {
          company: true,
        },
        orderBy: { displayOrder: "asc" },
      }),
      ctx.db.education.findMany({
        where: { userId },
        include: {
          institution: true,
        },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

    return {
      profile: userProfile,
      roleFits,
      skillScores: skillScores.map(ss => ({
        id: ss.id,
        skillName: ss.skill.name,
        category: ss.skill.domain.name,
        score: ss.score,
        skillId: ss.skillId,
      })),
      workExperiences,
      educations,
    };
  }),

  // Create or update profile
  upsertProfile: protectedProcedure
    .input(createProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if profileSlug is unique if provided
      if (input.profileSlug) {
        const existing = await ctx.db.userProfile.findFirst({
          where: {
            profileSlug: input.profileSlug,
            NOT: { userId },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Profile URL is already taken",
          });
        }
      }

      const profile = await ctx.db.userProfile.upsert({
        where: { userId },
        update: input,
        create: {
          ...input,
          userId,
        },
      });

      return profile;
    }),

  // Update role fits
  updateRoleFits: protectedProcedure
    .input(z.array(roleFitSchema))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Delete existing role fits
      await ctx.db.userRoleFit.deleteMany({
        where: { userId },
      });

      // Create new role fits
      const roleFits = await ctx.db.userRoleFit.createMany({
        data: input.map((fit) => ({
          ...fit,
          userId,
        })),
      });

      return roleFits;
    }),

  // Update skill scores
  updateSkillScores: protectedProcedure
    .input(z.array(skillScoreSchema))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Use transaction for bulk upsert
      const updates = input.map((score) =>
        ctx.db.profileSkillScore.upsert({
          where: {
            userId_skillId: {
              userId,
              skillId: score.skillId,
            },
          },
          update: {
            score: score.score,
          },
          create: {
            userId,
            skillId: score.skillId,
            score: score.score,
          },
        })
      );

      const skillScores = await ctx.db.$transaction(updates);
      return skillScores;
    }),

  // Add work experience
  addWorkExperience: protectedProcedure
    .input(workExperienceSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Find or create company
      const company = await ctx.db.company.upsert({
        where: { name: input.companyName },
        update: {},
        create: {
          name: input.companyName,
        },
      });

      // Get max display order
      const maxOrder = await ctx.db.workExperience.findFirst({
        where: { userId },
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });

      const workExperience = await ctx.db.workExperience.create({
        data: {
          userId,
          companyId: company.id,
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate,
          description: input.description,
          tags: input.tags,
          location: input.location,
          displayOrder: (maxOrder?.displayOrder ?? 0) + 1,
        },
        include: {
          company: true,
        },
      });

      return workExperience;
    }),

  // Update work experience
  updateWorkExperience: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: workExperienceSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Verify ownership
      const existing = await ctx.db.workExperience.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Work experience not found",
        });
      }

      // Find or create company if name changed
      const company = await ctx.db.company.upsert({
        where: { name: input.data.companyName },
        update: {},
        create: {
          name: input.data.companyName,
        },
      });

      const workExperience = await ctx.db.workExperience.update({
        where: { id: input.id },
        data: {
          companyId: company.id,
          title: input.data.title,
          startDate: input.data.startDate,
          endDate: input.data.endDate,
          description: input.data.description,
          tags: input.data.tags,
          location: input.data.location,
        },
        include: {
          company: true,
        },
      });

      return workExperience;
    }),

  // Delete work experience
  deleteWorkExperience: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Verify ownership
      const existing = await ctx.db.workExperience.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Work experience not found",
        });
      }

      await ctx.db.workExperience.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Add education
  addEducation: protectedProcedure
    .input(educationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Find or create institution
      const institution = await ctx.db.institution.upsert({
        where: { name: input.institutionName },
        update: {},
        create: {
          name: input.institutionName,
        },
      });

      // Get max display order
      const maxOrder = await ctx.db.education.findFirst({
        where: { userId },
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });

      const education = await ctx.db.education.create({
        data: {
          userId,
          institutionId: institution.id,
          degree: input.degree,
          fieldOfStudy: input.fieldOfStudy,
          startYear: input.startYear,
          endYear: input.endYear,
          description: input.description,
          displayOrder: (maxOrder?.displayOrder ?? 0) + 1,
        },
        include: {
          institution: true,
        },
      });

      return education;
    }),

  // Update education
  updateEducation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: educationSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Verify ownership
      const existing = await ctx.db.education.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Education not found",
        });
      }

      // Find or create institution if name changed
      const institution = await ctx.db.institution.upsert({
        where: { name: input.data.institutionName },
        update: {},
        create: {
          name: input.data.institutionName,
        },
      });

      const education = await ctx.db.education.update({
        where: { id: input.id },
        data: {
          institutionId: institution.id,
          degree: input.data.degree,
          fieldOfStudy: input.data.fieldOfStudy,
          startYear: input.data.startYear,
          endYear: input.data.endYear,
          description: input.data.description,
        },
        include: {
          institution: true,
        },
      });

      return education;
    }),

  // Delete education
  deleteEducation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Verify ownership
      const existing = await ctx.db.education.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Education not found",
        });
      }

      await ctx.db.education.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get all available skills grouped by domain
  getAllSkills: publicProcedure.query(async ({ ctx }) => {
    const skills = await ctx.db.skill.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        domain: true,
      },
      orderBy: {
        domain: {
          order: "asc",
        },
      },
    });

    // Group by domain
    const grouped = skills.reduce((acc, skill) => {
      const domainName = skill.domain.name;
      if (!acc[domainName]) {
        acc[domainName] = [];
      }
      acc[domainName]!.push({
        id: skill.id,
        name: skill.name,
      });
      return acc;
    }, {} as Record<string, Array<{ id: string; name: string }>>);

    return grouped;
  }),
});