import { z } from "zod";
import {
  idSchema,
  paginationSchema,
  searchSchema,
  richTextSchema,
  companyNameSchema,
  jobTitleSchema,
  skillsSchema,
  focusAreasSchema,
  metadataSchema,
} from "./common";

/**
 * Job Description validation schemas
 */

// Create job description input
export const createJobDescriptionSchema = z.object({
  title: jobTitleSchema,
  company: companyNameSchema.optional(),
  description: richTextSchema,
  requirements: skillsSchema,
  focusAreas: focusAreasSchema.optional(),
  isTemplate: z.boolean().default(false),
});

// Update job description input
export const updateJobDescriptionSchema = z.object({
  id: idSchema,
  title: jobTitleSchema.optional(),
  company: companyNameSchema.optional(),
  description: richTextSchema.optional(),
  requirements: skillsSchema.optional(),
  focusAreas: focusAreasSchema.optional(),
  isTemplate: z.boolean().optional(),
});

// Get job description by ID
export const getJobDescriptionSchema = z.object({
  id: idSchema,
});

// Delete job description
export const deleteJobDescriptionSchema = z.object({
  id: idSchema,
});

// List job descriptions with filtering
export const listJobDescriptionsSchema = z.object({
  ...paginationSchema.shape,
  ...searchSchema.shape,
  isTemplate: z.boolean().optional(),
  userId: idSchema.optional(),
  company: z.string().optional(),
  includeDeleted: z.boolean().default(false),
});

// AI focus area detection input
export const detectFocusAreasSchema = z.object({
  description: richTextSchema,
  requirements: skillsSchema,
});

// Bulk operations
export const bulkDeleteJobDescriptionsSchema = z.object({
  ids: z.array(idSchema).min(1).max(100),
});

export const duplicateJobDescriptionSchema = z.object({
  id: idSchema,
  newTitle: jobTitleSchema.optional(),
  makeTemplate: z.boolean().default(false),
});

// Template-specific schemas
export const createTemplateSchema = z.object({
  title: jobTitleSchema,
  description: richTextSchema,
  requirements: skillsSchema,
  focusAreas: focusAreasSchema,
  category: z.string().min(1).max(50), // e.g., "Data Science", "Engineering"
});

export const getTemplatesSchema = z.object({
  category: z.string().optional(),
  ...searchSchema.shape,
});

// Job description output schemas
export const jobDescriptionOutputSchema = z.object({
  id: idSchema,
  title: z.string(),
  company: z.string().nullable(),
  description: z.string(),
  requirements: z.array(z.string()),
  focusAreas: z.array(z.string()),
  isTemplate: z.boolean(),
  userId: idSchema.nullable(),
  ...metadataSchema.shape,
  _count: z.object({
    interviews: z.number(),
  }).optional(),
});

export const jobDescriptionListOutputSchema = z.object({
  items: z.array(jobDescriptionOutputSchema),
  hasNextPage: z.boolean(),
  nextCursor: z.string().optional(),
  totalCount: z.number().optional(),
});

// Focus areas detection output
export const focusAreasOutputSchema = z.object({
  focusAreas: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  suggestions: z.array(z.string()).optional(),
});

/**
 * Type exports for use in routers
 */
export type CreateJobDescriptionInput = z.infer<typeof createJobDescriptionSchema>;
export type UpdateJobDescriptionInput = z.infer<typeof updateJobDescriptionSchema>;
export type ListJobDescriptionsInput = z.infer<typeof listJobDescriptionsSchema>;
export type JobDescriptionOutput = z.infer<typeof jobDescriptionOutputSchema>;
export type JobDescriptionListOutput = z.infer<typeof jobDescriptionListOutputSchema>;
export type DetectFocusAreasInput = z.infer<typeof detectFocusAreasSchema>;
export type FocusAreasOutput = z.infer<typeof focusAreasOutputSchema>;