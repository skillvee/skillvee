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


// Competency schemas
export const competencySchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  priority: competencyPrioritySchema,
  skillId: idSchema,
  rubricLevel1: richTextSchema,
  rubricLevel2: richTextSchema,
  rubricLevel3: richTextSchema,
  rubricLevel4: richTextSchema,
  rubricLevel5: richTextSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCompetencySchema = z.object({
  name: z.string().min(1).max(100).transform((str) => str.trim()),
  priority: competencyPrioritySchema.default("NONE"),
  skillId: idSchema,
  rubricLevel1: richTextSchema,
  rubricLevel2: richTextSchema,
  rubricLevel3: richTextSchema,
  rubricLevel4: richTextSchema,
  rubricLevel5: richTextSchema,
});

export const updateCompetencySchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100).transform((str) => str.trim()).optional(),
  priority: competencyPrioritySchema.optional(),
  rubricLevel1: richTextSchema.optional(),
  rubricLevel2: richTextSchema.optional(),
  rubricLevel3: richTextSchema.optional(),
  rubricLevel4: richTextSchema.optional(),
  rubricLevel5: richTextSchema.optional(),
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
  rubric_level_1: richTextSchema,
  rubric_level_2: richTextSchema,
  rubric_level_3: richTextSchema,
  rubric_level_4: richTextSchema,
  rubric_level_5: richTextSchema,
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
  skill: skillOutputSchema.optional(),
});

// Stats and analytics
export const skillsStatsSchema = z.object({
  totalDomains: z.number(),
  totalCategories: z.number(),
  totalSkills: z.number(),
  totalCompetencies: z.number(),
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
export type CompetencyPriority = z.infer<typeof competencyPrioritySchema>;

export type DomainOutput = z.infer<typeof domainOutputSchema>;
export type CategoryOutput = z.infer<typeof categoryOutputSchema>;
export type SkillOutput = z.infer<typeof skillOutputSchema>;
export type CompetencyOutput = z.infer<typeof competencyOutputSchema>;

export type SkillsStats = z.infer<typeof skillsStatsSchema>;
export type CSVRow = z.infer<typeof csvRowSchema>;