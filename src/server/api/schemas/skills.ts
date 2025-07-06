import { z } from "zod";
import { 
  idSchema, 
  paginationSchema, 
  searchSchema, 
  textContentSchema, 
  richTextSchema,
  metadataSchema,
  sanitizedTextSchema 
} from "./common";

/**
 * Skills Management System Schemas
 * 
 * Hierarchical structure: Domain → Category → Skill → Competency → CompetencyLevel
 */

// Enum schemas
export const competencyPrioritySchema = z.enum(["PRIMARY", "SECONDARY", "NONE"]);

// Domain schemas
export const domainSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createDomainSchema = z.object({
  name: z.string().min(1).max(100).transform((str) => str.trim()),
});

export const updateDomainSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()),
});

export const deleteDomainSchema = z.object({
  id: idSchema,
});

export const listDomainsSchema = paginationSchema.extend({
  query: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  includeDeleted: z.boolean().default(false),
});

// Category schemas
export const categorySchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  domainId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  domainId: idSchema,
});

export const updateCategorySchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()),
});

export const deleteCategorySchema = z.object({
  id: idSchema,
});

export const listCategoriesSchema = paginationSchema.extend({
  domainId: idSchema.optional(),
  query: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  includeDeleted: z.boolean().default(false),
});

// Skill schemas
export const skillSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  categoryId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createSkillSchema = z.object({
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  categoryId: idSchema,
});

export const updateSkillSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()),
});

export const deleteSkillSchema = z.object({
  id: idSchema,
});

export const listSkillsSchema = paginationSchema.extend({
  categoryId: idSchema.optional(),
  domainId: idSchema.optional(),
  query: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  includeDeleted: z.boolean().default(false),
});

// Competency Level schemas
export const competencyLevelSchema = z.object({
  id: idSchema,
  level: z.number().int().min(1).max(5),
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  description: richTextSchema,
  competencyId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCompetencyLevelSchema = z.object({
  level: z.number().int().min(1).max(5),
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  description: richTextSchema,
  competencyId: idSchema,
});

export const updateCompetencyLevelSchema = z.object({
  id: idSchema,
  level: z.number().int().min(1).max(5).optional(),
  name: z.string().min(1).max(100).transform((str) => str.trim()).optional(),
  description: richTextSchema.optional(),
});

export const deleteCompetencyLevelSchema = z.object({
  id: idSchema,
});

// Competency schemas
export const competencySchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  priority: competencyPrioritySchema,
  skillId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCompetencySchema = z.object({
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  priority: competencyPrioritySchema.default("NONE"),
  skillId: idSchema,
  levels: z.array(z.object({
    level: z.number().int().min(1).max(5),
    name: z.string().min(1).max(100).transform((str) => str.trim()),
    description: richTextSchema,
  })).min(1).max(5),
});

export const updateCompetencySchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()).optional(),
  priority: competencyPrioritySchema.optional(),
});

export const deleteCompetencySchema = z.object({
  id: idSchema,
});

export const listCompetenciesSchema = paginationSchema.extend({
  skillId: idSchema.optional(),
  categoryId: idSchema.optional(),
  domainId: idSchema.optional(),
  priority: competencyPrioritySchema.optional(),
  query: z.string().optional(),
  sortBy: z.enum(["name", "priority", "createdAt", "updatedAt"]).default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  includeDeleted: z.boolean().default(false),
});

// Bulk operations
export const bulkDeleteSchema = z.object({
  ids: z.array(idSchema).min(1).max(100),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(idSchema).min(1).max(100),
  data: z.object({
    priority: competencyPrioritySchema.optional(),
  }),
});

// CSV import/export schemas
export const csvImportSchema = z.object({
  file: z.any(), // Will be validated by multer
  validateOnly: z.boolean().default(false),
});

export const csvExportSchema = z.object({
  domainId: idSchema.optional(),
  categoryId: idSchema.optional(),
  skillId: idSchema.optional(),
  format: z.enum(["csv", "xlsx"]).default("csv"),
  includeDeleted: z.boolean().default(false),
});

export const csvRowSchema = z.object({
  domain: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  skill: z.string().min(1).max(100),
  competency: z.string().min(1).max(100),
  priority: competencyPrioritySchema,
  level_1_name: z.string().min(1).max(100),
  level_1_description: richTextSchema,
  level_2_name: z.string().min(1).max(100),
  level_2_description: richTextSchema,
  level_3_name: z.string().min(1).max(100),
  level_3_description: richTextSchema,
  level_4_name: z.string().min(1).max(100),
  level_4_description: richTextSchema,
  level_5_name: z.string().min(1).max(100),
  level_5_description: richTextSchema,
});

// Hierarchical data structures
export const hierarchicalDataSchema = z.object({
  domainId: idSchema.optional(),
  categoryId: idSchema.optional(),
  skillId: idSchema.optional(),
  includeDeleted: z.boolean().default(false),
});

// Output type schemas
export const domainOutputSchema = domainSchema.extend({
  _count: z.object({
    categories: z.number(),
  }).optional(),
  categories: z.array(categorySchema).optional(),
});

export const categoryOutputSchema = categorySchema.extend({
  _count: z.object({
    skills: z.number(),
  }).optional(),
  domain: domainSchema.optional(),
  skills: z.array(skillSchema).optional(),
});

export const skillOutputSchema = skillSchema.extend({
  _count: z.object({
    competencies: z.number(),
  }).optional(),
  category: categoryOutputSchema.optional(),
  competencies: z.array(competencySchema).optional(),
});

export const competencyOutputSchema = competencySchema.extend({
  _count: z.object({
    levels: z.number(),
  }).optional(),
  skill: skillOutputSchema.optional(),
  levels: z.array(competencyLevelSchema).optional(),
});

export const competencyLevelOutputSchema = competencyLevelSchema.extend({
  competency: competencyOutputSchema.optional(),
});

// Stats and analytics
export const skillsStatsSchema = z.object({
  totalDomains: z.number(),
  totalCategories: z.number(),
  totalSkills: z.number(),
  totalCompetencies: z.number(),
  totalLevels: z.number(),
  primaryCompetencies: z.number(),
  secondaryCompetencies: z.number(),
  recentlyAdded: z.array(z.object({
    id: idSchema,
    name: z.string(),
    type: z.enum(["domain", "category", "skill", "competency"]),
    createdAt: z.date(),
  })).optional(),
  topPriorityAreas: z.array(z.object({
    name: z.string(),
    count: z.number(),
    type: z.enum(["domain", "category", "skill"]),
  })).optional(),
});

// Type exports
export type Domain = z.infer<typeof domainSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Competency = z.infer<typeof competencySchema>;
export type CompetencyLevel = z.infer<typeof competencyLevelSchema>;
export type CompetencyPriority = z.infer<typeof competencyPrioritySchema>;

export type DomainOutput = z.infer<typeof domainOutputSchema>;
export type CategoryOutput = z.infer<typeof categoryOutputSchema>;
export type SkillOutput = z.infer<typeof skillOutputSchema>;
export type CompetencyOutput = z.infer<typeof competencyOutputSchema>;
export type CompetencyLevelOutput = z.infer<typeof competencyLevelOutputSchema>;

export type SkillsStats = z.infer<typeof skillsStatsSchema>;
export type CSVRow = z.infer<typeof csvRowSchema>;