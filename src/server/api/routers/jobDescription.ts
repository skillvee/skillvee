import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { 
  createTRPCRouter, 
  protectedProcedure, 
  publicProcedure,
  adminProcedure,
  aiProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import { generateFocusAreaSuggestions } from "~/server/ai";
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
  createJobDescriptionSchema,
  updateJobDescriptionSchema,
  getJobDescriptionSchema,
  deleteJobDescriptionSchema,
  listJobDescriptionsSchema,
  detectFocusAreasSchema,
  bulkDeleteJobDescriptionsSchema,
  duplicateJobDescriptionSchema,
  createTemplateSchema,
  getTemplatesSchema,
  type JobDescriptionOutput,
  type JobDescriptionListOutput,
  type FocusAreasOutput,
} from "../schemas/jobDescription";

export const jobDescriptionRouter = createTRPCRouter({
  /**
   * Create a new job description
   */
  create: protectedProcedure
    .input(createJobDescriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, company, description, requirements, focusAreas, isTemplate } = input;

      // Only admins can create templates
      if (isTemplate && ctx.user.role !== "ADMIN") {
        throw createError.forbidden("create templates");
      }

      const jobDescription = await ctx.db.jobDescription.create({
        data: {
          title,
          company,
          description,
          requirements,
          focusAreas: focusAreas || [],
          isTemplate,
          userId: isTemplate ? null : ctx.user.id, // Templates are system-wide
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });

      return jobDescription;
    }),

  /**
   * Get job description by ID
   */
  getById: protectedProcedure
    .input(getJobDescriptionSchema)
    .query(async ({ ctx, input }) => {
      const jobDescription = await ctx.db.jobDescription.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
          OR: [
            { userId: ctx.user.id }, // User's own job descriptions
            { isTemplate: true }, // Public templates
            ...(ctx.user.role === "ADMIN" ? [{}] : []), // Admins can see all
          ],
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });

      if (!jobDescription) {
        throw createError.notFound("Job description", input.id);
      }

      return jobDescription;
    }),

  /**
   * Update job description
   */
  update: protectedProcedure
    .input(updateJobDescriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if job description exists and user has permission
      const existing = await ctx.db.jobDescription.findFirst({
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
        throw createError.notFound("Job description", id);
      }

      // Only admins can modify templates
      if (existing.isTemplate && ctx.user.role !== "ADMIN") {
        throw createError.forbidden("modify templates");
      }

      const updatedJobDescription = await ctx.db.jobDescription.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });

      return updatedJobDescription;
    }),

  /**
   * Delete job description (soft delete)
   */
  delete: protectedProcedure
    .input(deleteJobDescriptionSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if job description exists and user has permission
      const existing = await ctx.db.jobDescription.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
          OR: [
            { userId: ctx.user.id },
            ...(ctx.user.role === "ADMIN" ? [{}] : []),
          ],
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });

      if (!existing) {
        throw createError.notFound("Job description", input.id);
      }

      // Prevent deletion if there are active interviews
      if (existing._count.interviews > 0) {
        throw createError.conflict(
          "Cannot delete job description with existing interviews",
          { interviewCount: existing._count.interviews }
        );
      }

      await ctx.db.jobDescription.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  /**
   * List job descriptions with filtering and pagination
   */
  list: protectedProcedure
    .input(listJobDescriptionsSchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        query,
        sortBy,
        sortDirection,
        isTemplate,
        userId,
        company,
        includeDeleted,
      } = input;

      // Build filters
      const searchFilter = createSearchConditions(query, ["title", "description", "company"]);
      const inclusionFilter = createInclusionFilter(includeDeleted);
      const permissionFilter = createPermissionFilter(ctx.user.id, ctx.user.role);
      
      const filters = combineFilters(
        inclusionFilter,
        permissionFilter,
        searchFilter,
        isTemplate !== undefined ? { isTemplate } : undefined,
        userId ? { userId } : undefined,
        company ? { company: { contains: company, mode: "insensitive" } } : undefined
      );

      // Build sort condition
      const orderBy = createSortCondition(sortBy, sortDirection);

      // Create pagination args
      const paginationArgs = createPaginationArgs({ limit, cursor }, orderBy as any);

      // Execute query with simplified pagination
      const jobDescriptions = await ctx.db.jobDescription.findMany({
        where: filters,
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      // Process pagination results
      const paginationResult = processPaginationResults(jobDescriptions, { limit, cursor });

      return {
        ...paginationResult,
        totalCount: includeDeleted ? undefined : await ctx.db.jobDescription.count({
          where: filters,
        }),
      } as JobDescriptionListOutput;
    }),

  /**
   * Get templates for job descriptions
   */
  getTemplates: publicProcedure
    .input(getTemplatesSchema)
    .query(async ({ ctx, input }) => {
      const { category, query, sortBy, sortDirection } = input;

      const searchFilter = createSearchConditions(query, ["title", "description"]);
      const filters = combineFilters(
        { isTemplate: true, deletedAt: null },
        searchFilter,
        category ? { focusAreas: { has: category } } : undefined
      );

      const templates = await ctx.db.jobDescription.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          requirements: true,
          focusAreas: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });

      return templates;
    }),

  /**
   * Create a template (admin only)
   */
  createTemplate: adminProcedure
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { category, ...templateData } = input;

      const template = await ctx.db.jobDescription.create({
        data: {
          ...templateData,
          focusAreas: [...templateData.focusAreas, category],
          isTemplate: true,
          userId: null, // System template
        },
      });

      return template;
    }),

  /**
   * Duplicate a job description
   */
  duplicate: protectedProcedure
    .input(duplicateJobDescriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, newTitle, makeTemplate } = input;

      // Get original job description
      const original = await ctx.db.jobDescription.findFirst({
        where: {
          id,
          deletedAt: null,
          OR: [
            { userId: ctx.user.id },
            { isTemplate: true },
            ...(ctx.user.role === "ADMIN" ? [{}] : []),
          ],
        },
      });

      if (!original) {
        throw createError.notFound("Job description", id);
      }

      // Only admins can create templates
      if (makeTemplate && ctx.user.role !== "ADMIN") {
        throw createError.forbidden("create templates");
      }

      const duplicate = await ctx.db.jobDescription.create({
        data: {
          title: newTitle || `${original.title} (Copy)`,
          company: original.company,
          description: original.description,
          requirements: original.requirements,
          focusAreas: original.focusAreas,
          isTemplate: makeTemplate || false,
          userId: makeTemplate ? null : ctx.user.id,
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });

      return duplicate;
    }),

  /**
   * Bulk delete job descriptions
   */
  bulkDelete: protectedProcedure
    .input(bulkDeleteJobDescriptionsSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      // Check permissions and get job descriptions with interview counts
      const jobDescriptions = await ctx.db.jobDescription.findMany({
        where: {
          id: { in: ids },
          deletedAt: null,
          OR: [
            { userId: ctx.user.id },
            ...(ctx.user.role === "ADMIN" ? [{}] : []),
          ],
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });

      if (jobDescriptions.length === 0) {
        throw createError.notFound("Job descriptions");
      }

      // Check for job descriptions with interviews
      const withInterviews = jobDescriptions.filter(jd => jd._count.interviews > 0);
      if (withInterviews.length > 0) {
        throw createError.conflict(
          "Some job descriptions have existing interviews and cannot be deleted",
          { affectedIds: withInterviews.map(jd => jd.id) }
        );
      }

      // Perform bulk soft delete
      const result = await ctx.db.jobDescription.updateMany({
        where: {
          id: { in: jobDescriptions.map(jd => jd.id) },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        deletedCount: result.count,
      };
    }),

  /**
   * AI-powered focus area detection using Gemini 2.5 Flash
   */
  detectFocusAreas: aiProcedure
    .input(detectFocusAreasSchema)
    .mutation(async ({ input }) => {
      const { description, requirements } = input;

      try {
        // Use Gemini 2.5 Flash for focus area detection
        const detectedAreas = await generateFocusAreaSuggestions(description, requirements);
        
        // Predefined focus areas for fallback and suggestions
        const allFocusAreas = [
          "Machine Learning",
          "Data Analysis", 
          "Statistics",
          "Python Programming",
          "SQL",
          "Data Visualization",
          "Deep Learning",
          "Natural Language Processing",
          "Computer Vision",
          "Big Data",
          "Cloud Computing",
          "A/B Testing",
          "Business Intelligence",
          "Data Engineering",
          "MLOps",
          "Product Sense",
          "Problem Solving",
          "System Design",
        ];

        const result: FocusAreasOutput = {
          focusAreas: detectedAreas.slice(0, 8), // Limit to 8 focus areas
          confidence: 0.90, // Higher confidence with AI
          suggestions: allFocusAreas
            .filter(area => !detectedAreas.includes(area))
            .slice(0, 5),
        };

        return result;
      } catch (error) {
        console.error("Focus area detection error:", error);
        
        // Fallback to basic keyword matching if AI fails
        const allFocusAreas = [
          "Machine Learning",
          "Data Analysis",
          "Statistics", 
          "Python Programming",
          "SQL",
          "Data Visualization",
          "Deep Learning",
          "Natural Language Processing",
          "Computer Vision",
          "Big Data",
          "Cloud Computing",
          "A/B Testing",
          "Business Intelligence",
          "Data Engineering",
          "MLOps",
        ];

        const detectedAreas = allFocusAreas.filter(area => {
          const lowerArea = area.toLowerCase();
          const lowerDesc = description.toLowerCase();
          const lowerReqs = requirements.join(" ").toLowerCase();
          
          return lowerDesc.includes(lowerArea) || 
                 lowerReqs.includes(lowerArea) ||
                 (lowerArea.includes("python") && (lowerDesc.includes("python") || lowerReqs.includes("python"))) ||
                 (lowerArea.includes("sql") && (lowerDesc.includes("sql") || lowerReqs.includes("database")));
        });

        const result: FocusAreasOutput = {
          focusAreas: detectedAreas.slice(0, 8),
          confidence: 0.70, // Lower confidence for fallback
          suggestions: allFocusAreas.filter(area => !detectedAreas.includes(area)).slice(0, 5),
        };

        return result;
      }
    }),

  /**
   * Get job description statistics
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.role === "ADMIN" ? undefined : ctx.user.id;
      const userFilter = userId ? { userId } : {};

      const [
        totalJobDescriptions,
        templatesCount,
        averageInterviewsPerJob,
        topFocusAreas,
        recentJobDescriptions,
      ] = await Promise.all([
        ctx.db.jobDescription.count({
          where: {
            ...userFilter,
            deletedAt: null,
          },
        }),
        ctx.db.jobDescription.count({
          where: {
            isTemplate: true,
            deletedAt: null,
          },
        }),
        // Calculate average interviews per job description
        Promise.resolve(0), // Placeholder for averageInterviewsPerJob
        // Get top focus areas
        ctx.db.jobDescription.findMany({
          where: {
            ...userFilter,
            deletedAt: null,
          },
          select: {
            focusAreas: true,
          },
        }).then(results => {
          const areaCount: Record<string, number> = {};
          results.forEach(jd => {
            jd.focusAreas.forEach(area => {
              areaCount[area] = (areaCount[area] || 0) + 1;
            });
          });
          
          return Object.entries(areaCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([area, count]) => ({ area, count }));
        }),
        ctx.db.jobDescription.findMany({
          where: {
            ...userFilter,
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            company: true,
            createdAt: true,
            _count: {
              select: {
                interviews: true,
              },
            },
          },
        }),
      ]);

      return {
        totalJobDescriptions,
        templatesCount,
        averageInterviewsPerJob: 0, // Fix this calculation
        topFocusAreas,
        recentJobDescriptions,
      };
    }),
});