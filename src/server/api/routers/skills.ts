import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { 
  createTRPCRouter, 
  protectedProcedure, 
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";

import { createError } from "../types/errors";
import {
  createPaginationArgs,
  processPaginationResults,
  createSearchConditions,
  createSortCondition,
  combineFilters,
  createInclusionFilter,
} from "../utils/pagination";

import {
  // Domain schemas
  createDomainSchema,
  updateDomainSchema,
  deleteDomainSchema,
  listDomainsSchema,
  
  // Category schemas
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  listCategoriesSchema,
  
  // Skill schemas
  createSkillSchema,
  updateSkillSchema,
  deleteSkillSchema,
  listSkillsSchema,
  
  // Competency schemas
  createCompetencySchema,
  updateCompetencySchema,
  deleteCompetencySchema,
  listCompetenciesSchema,
  
  
  // Bulk operations
  bulkDeleteSchema,
  bulkUpdateSchema,
  
  // Hierarchical data
  hierarchicalDataSchema,
  
  // CSV operations
  csvExportSchema,
  csvImportSchema,
  csvRowSchema,
  
  // Output types
  type DomainOutput,
  type CategoryOutput,
  type SkillOutput,
  type CompetencyOutput,
  type SkillsStats,
} from "../schemas/skills";

export const skillsRouter = createTRPCRouter({
  /**
   * DOMAIN ENDPOINTS
   */
  
  // Create domain (admin only)
  createDomain: adminProcedure
    .input(createDomainSchema)
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      // Check for duplicate name
      const existing = await ctx.db.domain.findFirst({
        where: { 
          name,
          deletedAt: null,
        },
      });

      if (existing) {
        throw createError.conflict(
          "Domain with this name already exists",
          { name }
        );
      }

      const domain = await ctx.db.domain.create({
        data: { name },
        include: {
          _count: {
            select: {
              categories: true,
            },
          },
        },
      });

      return domain;
    }),

  // List domains
  listDomains: protectedProcedure
    .input(listDomainsSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, query, sortBy, sortDirection, includeDeleted } = input;

      const searchFilter = createSearchConditions(query, ["name"]);
      const inclusionFilter = createInclusionFilter(includeDeleted);
      
      const filters = combineFilters(inclusionFilter, searchFilter);
      const orderBy = createSortCondition(sortBy, sortDirection);

      const domains = await ctx.db.domain.findMany({
        where: filters,
        include: {
          _count: {
            select: {
              categories: true,
            },
          },
        },
        orderBy: orderBy as any,
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      const paginationResult = processPaginationResults(domains, { limit, cursor });

      return {
        ...paginationResult,
        totalCount: await ctx.db.domain.count({ where: filters }),
      };
    }),

  // Update domain (admin only)
  updateDomain: adminProcedure
    .input(updateDomainSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      // Check if domain exists
      const existing = await ctx.db.domain.findFirst({
        where: { id, deletedAt: null },
      });

      if (!existing) {
        throw createError.notFound("Domain", id);
      }

      // Check for duplicate name
      const duplicate = await ctx.db.domain.findFirst({
        where: { 
          name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw createError.conflict(
          "Domain with this name already exists",
          { name }
        );
      }

      const domain = await ctx.db.domain.update({
        where: { id },
        data: { name, updatedAt: new Date() },
        include: {
          _count: {
            select: {
              categories: true,
            },
          },
        },
      });

      return domain;
    }),

  // Delete domain (admin only)
  deleteDomain: adminProcedure
    .input(deleteDomainSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if domain exists
      const existing = await ctx.db.domain.findFirst({
        where: { id, deletedAt: null },
        include: {
          _count: {
            select: {
              categories: true,
            },
          },
        },
      });

      if (!existing) {
        throw createError.notFound("Domain", id);
      }

      // Check if domain has categories
      if (existing._count.categories > 0) {
        throw createError.conflict(
          "Cannot delete domain with existing categories",
          { categoryCount: existing._count.categories }
        );
      }

      await ctx.db.domain.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  /**
   * CATEGORY ENDPOINTS
   */
  
  // Create category (admin only)
  createCategory: adminProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, domainId } = input;

      // Check if domain exists
      const domain = await ctx.db.domain.findFirst({
        where: { id: domainId, deletedAt: null },
      });

      if (!domain) {
        throw createError.notFound("Domain", domainId);
      }

      // Check for duplicate name within domain
      const existing = await ctx.db.category.findFirst({
        where: { 
          name,
          domainId,
          deletedAt: null,
        },
      });

      if (existing) {
        throw createError.conflict(
          "Category with this name already exists in this domain",
          { name, domainId }
        );
      }

      const category = await ctx.db.category.create({
        data: { name, domainId },
        include: {
          domain: true,
          _count: {
            select: {
              skills: true,
            },
          },
        },
      });

      return category;
    }),

  // List categories
  listCategories: protectedProcedure
    .input(listCategoriesSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, domainId, query, sortBy, sortDirection, includeDeleted } = input;

      const searchFilter = createSearchConditions(query, ["name"]);
      const inclusionFilter = createInclusionFilter(includeDeleted);
      
      const filters = combineFilters(
        inclusionFilter, 
        searchFilter,
        domainId ? { domainId } : undefined
      );

      const orderBy = createSortCondition(sortBy, sortDirection);

      const categories = await ctx.db.category.findMany({
        where: filters,
        include: {
          domain: true,
          _count: {
            select: {
              skills: true,
            },
          },
        },
        orderBy: orderBy as any,
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      const paginationResult = processPaginationResults(categories, { limit, cursor });

      return {
        ...paginationResult,
        totalCount: await ctx.db.category.count({ where: filters }),
      };
    }),

  // Update category (admin only)
  updateCategory: adminProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      // Check if category exists
      const existing = await ctx.db.category.findFirst({
        where: { id, deletedAt: null },
      });

      if (!existing) {
        throw createError.notFound("Category", id);
      }

      // Check for duplicate name within domain
      const duplicate = await ctx.db.category.findFirst({
        where: { 
          name,
          domainId: existing.domainId,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw createError.conflict(
          "Category with this name already exists in this domain",
          { name, domainId: existing.domainId }
        );
      }

      const category = await ctx.db.category.update({
        where: { id },
        data: { name, updatedAt: new Date() },
        include: {
          domain: true,
          _count: {
            select: {
              skills: true,
            },
          },
        },
      });

      return category;
    }),

  // Delete category (admin only)
  deleteCategory: adminProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if category exists
      const existing = await ctx.db.category.findFirst({
        where: { id, deletedAt: null },
        include: {
          _count: {
            select: {
              skills: true,
            },
          },
        },
      });

      if (!existing) {
        throw createError.notFound("Category", id);
      }

      // Check if category has skills
      if (existing._count.skills > 0) {
        throw createError.conflict(
          "Cannot delete category with existing skills",
          { skillCount: existing._count.skills }
        );
      }

      await ctx.db.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  /**
   * SKILL ENDPOINTS
   */
  
  // Create skill (admin only)
  createSkill: adminProcedure
    .input(createSkillSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, categoryId } = input;

      // Check if category exists
      const category = await ctx.db.category.findFirst({
        where: { id: categoryId, deletedAt: null },
      });

      if (!category) {
        throw createError.notFound("Category", categoryId);
      }

      // Check for duplicate name within category
      const existing = await ctx.db.skill.findFirst({
        where: { 
          name,
          categoryId,
          deletedAt: null,
        },
      });

      if (existing) {
        throw createError.conflict(
          "Skill with this name already exists in this category",
          { name, categoryId }
        );
      }

      const skill = await ctx.db.skill.create({
        data: { name, categoryId },
        include: {
          category: {
            include: {
              domain: true,
            },
          },
          _count: {
            select: {
              competencies: true,
            },
          },
        },
      });

      return skill;
    }),

  // List skills
  listSkills: protectedProcedure
    .input(listSkillsSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, categoryId, domainId, query, sortBy, sortDirection, includeDeleted } = input;

      const searchFilter = createSearchConditions(query, ["name"]);
      const inclusionFilter = createInclusionFilter(includeDeleted);
      
      let filters = combineFilters(inclusionFilter, searchFilter);

      // Add category filter
      if (categoryId) {
        filters = combineFilters(filters, { categoryId });
      }

      // Add domain filter (requires join)
      if (domainId) {
        filters = combineFilters(filters, {
          category: {
            domainId,
            deletedAt: null,
          },
        });
      }

      const orderBy = createSortCondition(sortBy, sortDirection);

      const skills = await ctx.db.skill.findMany({
        where: filters,
        include: {
          category: {
            include: {
              domain: true,
            },
          },
          _count: {
            select: {
              competencies: true,
            },
          },
        },
        orderBy: orderBy as any,
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      const paginationResult = processPaginationResults(skills, { limit, cursor });

      return {
        ...paginationResult,
        totalCount: await ctx.db.skill.count({ where: filters }),
      };
    }),

  // Update skill (admin only)
  updateSkill: adminProcedure
    .input(updateSkillSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      // Check if skill exists
      const existing = await ctx.db.skill.findFirst({
        where: { id, deletedAt: null },
      });

      if (!existing) {
        throw createError.notFound("Skill", id);
      }

      // Check for duplicate name within category
      const duplicate = await ctx.db.skill.findFirst({
        where: { 
          name,
          categoryId: existing.categoryId,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw createError.conflict(
          "Skill with this name already exists in this category",
          { name, categoryId: existing.categoryId }
        );
      }

      const skill = await ctx.db.skill.update({
        where: { id },
        data: { name, updatedAt: new Date() },
        include: {
          category: {
            include: {
              domain: true,
            },
          },
          _count: {
            select: {
              competencies: true,
            },
          },
        },
      });

      return skill;
    }),

  // Delete skill (admin only)
  deleteSkill: adminProcedure
    .input(deleteSkillSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if skill exists
      const existing = await ctx.db.skill.findFirst({
        where: { id, deletedAt: null },
        include: {
          _count: {
            select: {
              competencies: true,
            },
          },
        },
      });

      if (!existing) {
        throw createError.notFound("Skill", id);
      }

      // Check if skill has competencies
      if (existing._count.competencies > 0) {
        throw createError.conflict(
          "Cannot delete skill with existing competencies",
          { competencyCount: existing._count.competencies }
        );
      }

      await ctx.db.skill.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  /**
   * COMPETENCY ENDPOINTS
   */
  
  // Create competency with rubric levels (admin only)
  createCompetency: adminProcedure
    .input(createCompetencySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, priority, skillId, rubricLevel1, rubricLevel2, rubricLevel3, rubricLevel4, rubricLevel5 } = input;

      // Check if skill exists
      const skill = await ctx.db.skill.findFirst({
        where: { id: skillId, deletedAt: null },
      });

      if (!skill) {
        throw createError.notFound("Skill", skillId);
      }

      // Check for duplicate name within skill
      const existing = await ctx.db.competency.findFirst({
        where: { 
          name,
          skillId,
          deletedAt: null,
        },
      });

      if (existing) {
        throw createError.conflict(
          "Competency with this name already exists in this skill",
          { name, skillId }
        );
      }

      // Create competency with rubric levels
      const competency = await ctx.db.competency.create({
        data: { 
          name, 
          priority, 
          skillId,
          rubricLevel1,
          rubricLevel2,
          rubricLevel3,
          rubricLevel4,
          rubricLevel5,
        },
        include: {
          skill: {
            include: {
              category: {
                include: {
                  domain: true,
                },
              },
            },
          },
        },
      });

      return competency;
    }),

  // List competencies
  listCompetencies: protectedProcedure
    .input(listCompetenciesSchema)
    .query(async ({ ctx, input }) => {
      const { 
        limit, 
        cursor, 
        skillId, 
        categoryId, 
        domainId, 
        priority, 
        query, 
        sortBy, 
        sortDirection, 
        includeDeleted 
      } = input;

      const searchFilter = createSearchConditions(query, ["name"]);
      const inclusionFilter = createInclusionFilter(includeDeleted);
      
      let filters = combineFilters(inclusionFilter, searchFilter);

      // Add priority filter
      if (priority) {
        filters = combineFilters(filters, { priority });
      }

      // Add skill filter
      if (skillId) {
        filters = combineFilters(filters, { skillId });
      }

      // Add category filter (requires join)
      if (categoryId) {
        filters = combineFilters(filters, {
          skill: {
            categoryId,
            deletedAt: null,
          },
        });
      }

      // Add domain filter (requires nested join)
      if (domainId) {
        filters = combineFilters(filters, {
          skill: {
            category: {
              domainId,
              deletedAt: null,
            },
            deletedAt: null,
          },
        });
      }

      const orderBy = createSortCondition(sortBy, sortDirection);

      const competencies = await ctx.db.competency.findMany({
        where: filters,
        include: {
          skill: {
            include: {
              category: {
                include: {
                  domain: true,
                },
              },
            },
          },
        },
        orderBy: orderBy as any,
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      const paginationResult = processPaginationResults(competencies, { limit, cursor });

      return {
        ...paginationResult,
        totalCount: await ctx.db.competency.count({ where: filters }),
      };
    }),

  // Update competency (admin only)
  updateCompetency: adminProcedure
    .input(updateCompetencySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, priority, rubricLevel1, rubricLevel2, rubricLevel3, rubricLevel4, rubricLevel5 } = input;

      // Check if competency exists
      const existing = await ctx.db.competency.findFirst({
        where: { id, deletedAt: null },
      });

      if (!existing) {
        throw createError.notFound("Competency", id);
      }

      // Check for duplicate name within skill if name is being updated
      if (name) {
        const duplicate = await ctx.db.competency.findFirst({
          where: { 
            name,
            skillId: existing.skillId,
            id: { not: id },
            deletedAt: null,
          },
        });

        if (duplicate) {
          throw createError.conflict(
            "Competency with this name already exists in this skill",
            { name, skillId: existing.skillId }
          );
        }
      }

      const competency = await ctx.db.competency.update({
        where: { id },
        data: { 
          ...(name && { name }),
          ...(priority && { priority }),
          ...(rubricLevel1 && { rubricLevel1 }),
          ...(rubricLevel2 && { rubricLevel2 }),
          ...(rubricLevel3 && { rubricLevel3 }),
          ...(rubricLevel4 && { rubricLevel4 }),
          ...(rubricLevel5 && { rubricLevel5 }),
          updatedAt: new Date(),
        },
        include: {
          skill: {
            include: {
              category: {
                include: {
                  domain: true,
                },
              },
            },
          },
        },
      });

      return competency;
    }),

  // Delete competency (admin only)
  deleteCompetency: adminProcedure
    .input(deleteCompetencySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if competency exists
      const existing = await ctx.db.competency.findFirst({
        where: { id, deletedAt: null },
      });

      if (!existing) {
        throw createError.notFound("Competency", id);
      }

      await ctx.db.competency.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),


  /**
   * HIERARCHICAL DATA ENDPOINTS
   */

  // Get hierarchical tree structure
  getHierarchy: protectedProcedure
    .input(hierarchicalDataSchema)
    .query(async ({ ctx, input }) => {
      const { domainId, categoryId, skillId, includeDeleted } = input;

      const inclusionFilter = createInclusionFilter(includeDeleted);

      if (skillId) {
        // Return skill with competencies and levels
        const skill = await ctx.db.skill.findUnique({
          where: { id: skillId },
          include: {
            category: {
              include: {
                domain: true,
              },
            },
            competencies: {
              where: inclusionFilter,
              orderBy: { name: "asc" },
            },
          },
        });

        if (!skill) {
          throw createError.notFound("Skill", skillId);
        }

        return { skill };
      }

      if (categoryId) {
        // Return category with skills and their competencies
        const category = await ctx.db.category.findUnique({
          where: { id: categoryId },
          include: {
            domain: true,
            skills: {
              where: inclusionFilter,
              include: {
                competencies: {
                  where: inclusionFilter,
                  orderBy: { name: "asc" },
                },
              },
              orderBy: { name: "asc" },
            },
          },
        });

        if (!category) {
          throw createError.notFound("Category", categoryId);
        }

        return { category };
      }

      if (domainId) {
        // Return domain with full hierarchy
        const domain = await ctx.db.domain.findUnique({
          where: { id: domainId },
          include: {
            categories: {
              where: inclusionFilter,
              include: {
                skills: {
                  where: inclusionFilter,
                  include: {
                    competencies: {
                      where: inclusionFilter,
                      orderBy: { name: "asc" },
                    },
                  },
                  orderBy: { name: "asc" },
                },
              },
              orderBy: { name: "asc" },
            },
          },
        });

        if (!domain) {
          throw createError.notFound("Domain", domainId);
        }

        return { domain };
      }

      // Return all domains with full hierarchy
      const domains = await ctx.db.domain.findMany({
        where: inclusionFilter,
        include: {
          categories: {
            where: inclusionFilter,
            include: {
              skills: {
                where: inclusionFilter,
                include: {
                  competencies: {
                    where: inclusionFilter,
                    orderBy: { name: "asc" },
                  },
                },
                orderBy: { name: "asc" },
              },
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      return { domains };
    }),

  /**
   * STATISTICS AND ANALYTICS
   */

  // Get skills management statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalDomains,
        totalCategories,
        totalSkills,
        totalCompetencies,
        primaryCompetencies,
        secondaryCompetencies,
        recentlyAdded,
      ] = await Promise.all([
        ctx.db.domain.count({ where: { deletedAt: null } }),
        ctx.db.category.count({ where: { deletedAt: null } }),
        ctx.db.skill.count({ where: { deletedAt: null } }),
        ctx.db.competency.count({ where: { deletedAt: null } }),
        ctx.db.competency.count({ 
          where: { 
            priority: "PRIMARY",
            deletedAt: null,
          } 
        }),
        ctx.db.competency.count({ 
          where: { 
            priority: "SECONDARY",
            deletedAt: null,
          } 
        }),
        // Get recently added items across all types
        Promise.all([
          ctx.db.domain.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, name: true, createdAt: true },
          }),
          ctx.db.category.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, name: true, createdAt: true },
          }),
          ctx.db.skill.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, name: true, createdAt: true },
          }),
          ctx.db.competency.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, name: true, createdAt: true },
          }),
        ]).then(([domains, categories, skills, competencies]) => {
          const recent = [
            ...domains.map(d => ({ ...d, type: "domain" as const })),
            ...categories.map(c => ({ ...c, type: "category" as const })),
            ...skills.map(s => ({ ...s, type: "skill" as const })),
            ...competencies.map(c => ({ ...c, type: "competency" as const })),
          ];
          
          return recent
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10);
        }),
      ]);

      const stats: SkillsStats = {
        totalDomains,
        totalCategories,
        totalSkills,
        totalCompetencies,
        primaryCompetencies,
        secondaryCompetencies,
        recentlyAdded,
      };

      return stats;
    }),

  /**
   * BULK OPERATIONS
   */

  // Bulk delete (admin only)
  bulkDelete: adminProcedure
    .input(bulkDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      // This is a simplified bulk delete - in production you'd want to check
      // what type of entities these are and handle cascade deletes properly
      
      // For now, assume these are competency IDs as the most common bulk operation
      const competencies = await ctx.db.competency.findMany({
        where: {
          id: { in: ids },
          deletedAt: null,
        },
      });

      if (competencies.length === 0) {
        throw createError.notFound("Competencies");
      }

      const result = await ctx.db.competency.updateMany({
        where: {
          id: { in: competencies.map(c => c.id) },
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

  // Bulk update priority (admin only)
  bulkUpdatePriority: adminProcedure
    .input(bulkUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { ids, data } = input;

      if (!data.priority) {
        throw createError.validation("priority", "Priority is required for bulk update");
      }

      const competencies = await ctx.db.competency.findMany({
        where: {
          id: { in: ids },
          deletedAt: null,
        },
      });

      if (competencies.length === 0) {
        throw createError.notFound("Competencies");
      }

      const result = await ctx.db.competency.updateMany({
        where: {
          id: { in: competencies.map(c => c.id) },
        },
        data: {
          priority: data.priority,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        updatedCount: result.count,
      };
    }),

  /**
   * CSV IMPORT VALIDATION
   */
  validateCSV: adminProcedure
    .input(z.object({
      csvContent: z.string().min(1, "CSV content is required"),
    }))
    .mutation(async ({ input }) => {
      const { parseAndValidateCSV } = await import("../utils/csv-parser");
      
      const validationResult = parseAndValidateCSV(input.csvContent);
      
      return {
        isValid: validationResult.isValid,
        stats: validationResult.stats,
        errors: validationResult.errors.slice(0, 50), // Limit errors for performance
        preview: validationResult.rows.slice(0, 5).map(row => ({
          domain: row.domain,
          category: row.category,
          skill: row.skill,
          competency: row.competency,
          priority: row.priority,
        })),
      };
    }),

  /**
   * CSV IMPORT EXECUTION
   */
  importCSV: adminProcedure
    .input(z.object({
      csvContent: z.string().min(1, "CSV content is required"),
      skipErrors: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const { parseAndValidateCSV, transformCSVToHierarchy } = await import("../utils/csv-parser");
      
      // Validate CSV first
      const validationResult = parseAndValidateCSV(input.csvContent);
      
      if (!validationResult.isValid && !input.skipErrors) {
        throw createError.validation("csv", "CSV contains validation errors");
      }

      // Transform to hierarchy
      const hierarchy = transformCSVToHierarchy(validationResult.rows);
      
      const stats = {
        domainsCreated: 0,
        categoriesCreated: 0,
        skillsCreated: 0,
        competenciesCreated: 0,
        duplicatesSkipped: 0,
        errorsEncountered: validationResult.errors.length,
      };

      try {
        // Import data in a transaction
        await ctx.db.$transaction(async (tx) => {
          for (const [domainName, domainData] of hierarchy.entries()) {
            // Create or get domain
            let domain = await tx.domain.findFirst({
              where: { name: domainName, deletedAt: null },
            });
            
            if (!domain) {
              domain = await tx.domain.create({
                data: { name: domainName },
              });
              stats.domainsCreated++;
            }

            for (const [categoryName, categoryData] of domainData.categories.entries()) {
              // Create or get category
              let category = await tx.category.findFirst({
                where: { 
                  name: categoryName, 
                  domainId: domain.id,
                  deletedAt: null,
                },
              });
              
              if (!category) {
                category = await tx.category.create({
                  data: { 
                    name: categoryName, 
                    domainId: domain.id,
                  },
                });
                stats.categoriesCreated++;
              }

              for (const [skillName, skillData] of categoryData.skills.entries()) {
                // Create or get skill
                let skill = await tx.skill.findFirst({
                  where: { 
                    name: skillName, 
                    categoryId: category.id,
                    deletedAt: null,
                  },
                });
                
                if (!skill) {
                  skill = await tx.skill.create({
                    data: { 
                      name: skillName, 
                      categoryId: category.id,
                    },
                  });
                  stats.skillsCreated++;
                }

                for (const competencyData of skillData.competencies) {
                  // Check for existing competency
                  const existingCompetency = await tx.competency.findFirst({
                    where: { 
                      name: competencyData.name, 
                      skillId: skill.id,
                      deletedAt: null,
                    },
                  });
                  
                  if (existingCompetency) {
                    stats.duplicatesSkipped++;
                    continue;
                  }

                  // Create competency with rubric levels
                  const competency = await tx.competency.create({
                    data: { 
                      name: competencyData.name, 
                      priority: competencyData.priority,
                      skillId: skill.id,
                      rubricLevel1: competencyData.rubricLevel1 || "Basic understanding",
                      rubricLevel2: competencyData.rubricLevel2 || "Developing skills",
                      rubricLevel3: competencyData.rubricLevel3 || "Proficient application",
                      rubricLevel4: competencyData.rubricLevel4 || "Advanced expertise",
                      rubricLevel5: competencyData.rubricLevel5 || "Expert mastery",
                    },
                  });
                  stats.competenciesCreated++;
                }
              }
            }
          }
        });

        return {
          success: true,
          stats,
          message: `Successfully imported ${stats.competenciesCreated} competencies across ${stats.domainsCreated} domains`,
        };
      } catch (error) {
        console.error("CSV import error:", error);
        throw createError.internal(
          "Failed to import CSV data",
          { error: error instanceof Error ? error.message : "Unknown error" }
        );
      }
    }),

  /**
   * CSV EXPORT
   */
  exportCSV: protectedProcedure
    .input(csvExportSchema)
    .query(async ({ ctx, input }) => {
      const { exportSkillsToCSV } = await import("../utils/csv-parser");
      
      // Get hierarchy data based on filters
      const inclusionFilter = createInclusionFilter(input.includeDeleted || false);
      
      let filters = inclusionFilter;
      
      if (input.domainId) {
        filters = combineFilters(filters, { id: input.domainId });
      }

      const domains = await ctx.db.domain.findMany({
        where: filters,
        include: {
          categories: {
            where: combineFilters(
              inclusionFilter,
              input.categoryId ? { id: input.categoryId } : undefined
            ),
            include: {
              skills: {
                where: combineFilters(
                  inclusionFilter,
                  input.skillId ? { id: input.skillId } : undefined
                ),
                include: {
                  competencies: {
                    where: inclusionFilter,
                    orderBy: { name: "asc" },
                  },
                },
                orderBy: { name: "asc" },
              },
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      const csvContent = exportSkillsToCSV({ domains });
      
      return {
        content: csvContent,
        filename: `skills-export-${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: "text/csv",
      };
    }),

  /**
   * GET CSV TEMPLATE
   */
  getCSVTemplate: publicProcedure
    .query(async () => {
      const { generateCSVTemplate } = await import("../utils/csv-parser");
      
      const csvContent = generateCSVTemplate();
      
      return {
        content: csvContent,
        filename: "skills-template.csv",
        mimeType: "text/csv",
      };
    }),
});