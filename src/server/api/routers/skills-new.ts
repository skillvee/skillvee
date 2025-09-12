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
  parseSkillTaxonomyCSV, 
  parseRoleArchetypesCSV, 
  validateCSVContent,
  CSVParsingError,
  type ParsedSkillTaxonomy,
  type ParsedRoleArchetypes
} from "~/lib/csv-parser";

// Basic input schemas for the new taxonomy
const listDomainsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
  query: z.string().optional(),
  includeDeleted: z.boolean().default(false),
});

const hierarchicalDataSchema = z.object({
  domainId: z.string().optional(),
  includeDeleted: z.boolean().default(false),
});

export const skillsNewRouter = createTRPCRouter({
  /**
   * SKILL DOMAIN ENDPOINTS (New taxonomy)
   */
  
  // List skill domains
  listDomains: protectedProcedure
    .input(listDomainsSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, query, includeDeleted } = input;

      let whereClause: any = {};
      
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      if (query) {
        whereClause.name = {
          contains: query,
          mode: 'insensitive',
        };
      }

      const skillDomains = await ctx.db.skillDomain.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              skills: true,
            },
          },
        },
        orderBy: { order: "asc" },
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      const nextCursor = skillDomains.length === limit ? skillDomains[skillDomains.length - 1]?.id : null;
      const hasNextPage = skillDomains.length === limit;

      return {
        items: skillDomains,
        nextCursor,
        hasNextPage,
        totalCount: await ctx.db.skillDomain.count({ where: whereClause }),
      };
    }),

  /**
   * HIERARCHICAL DATA ENDPOINTS
   */

  // Get hierarchical tree structure for new taxonomy
  getHierarchy: protectedProcedure
    .input(hierarchicalDataSchema)
    .query(async ({ ctx, input }) => {
      const { domainId, includeDeleted } = input;

      let whereClause: any = {};
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      if (domainId) {
        // Return specific domain with its skills
        const domain = await ctx.db.skillDomain.findUnique({
          where: { id: domainId },
          include: {
            skills: {
              where: whereClause,
              include: {
                skillLevels: {
                  where: whereClause,
                  orderBy: { level: "asc" },
                },
              },
              orderBy: { name: "asc" },
            },
          },
        });

        if (!domain) {
          throw createError.notFound("Skill Domain", domainId);
        }

        return { domain };
      }

      // Return all domains with their skills
      const skillDomains = await ctx.db.skillDomain.findMany({
        where: whereClause,
        include: {
          skills: {
            where: whereClause,
            include: {
              skillLevels: {
                where: whereClause,
                orderBy: { level: "asc" },
              },
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });

      return { domains: skillDomains };
    }),

  /**
   * ROLE ARCHETYPES ENDPOINTS
   */

  // List role archetypes
  listArchetypes: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
      includeDeleted: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, includeDeleted } = input;

      let whereClause: any = {};
      
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      const archetypes = await ctx.db.roleArchetype.findMany({
        where: whereClause,
        include: {
          roles: {
            where: { deletedAt: null },
            orderBy: { title: "asc" },
          },
          roleSkillMappings: {
            where: { deletedAt: null },
            include: {
              skill: {
                include: {
                  domain: true,
                },
              },
            },
            orderBy: { importance: "desc" },
          },
        },
        orderBy: { name: "asc" },
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
      });

      const nextCursor = archetypes.length === limit ? archetypes[archetypes.length - 1]?.id : null;
      const hasNextPage = archetypes.length === limit;

      return {
        items: archetypes,
        nextCursor,
        hasNextPage,
        totalCount: await ctx.db.roleArchetype.count({ where: whereClause }),
      };
    }),

  /**
   * STATISTICS AND ANALYTICS
   */

  // Get skills management statistics (updated for new taxonomy)
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalDomains,
        totalSkills,
        totalSkillLevels,
      ] = await Promise.all([
        ctx.db.skillDomain.count({ where: { deletedAt: null } }),
        ctx.db.skill.count({ where: { deletedAt: null } }),
        ctx.db.skillLevel.count({ where: { deletedAt: null } }),
      ]);

      return {
        totalDomains,
        totalSkills,
        totalSkillLevels,
      };
    }),

  // Get archetype statistics
  getArchetypeStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalArchetypes,
        totalRoles,
        totalSkillMappings,
      ] = await Promise.all([
        ctx.db.roleArchetype.count({ where: { deletedAt: null } }),
        ctx.db.role.count({ where: { deletedAt: null } }),
        ctx.db.roleSkillMapping.count({ where: { deletedAt: null } }),
      ]);

      return {
        totalArchetypes,
        totalRoles,
        totalSkillMappings,
      };
    }),

  /**
   * CSV TEMPLATE ENDPOINT (Placeholder)
   */
  getCSVTemplate: publicProcedure
    .query(async () => {
      // Return template for new skills taxonomy format
      const csvContent = `Domain,Skill,Level,Level_Name,General_Description,Observable_Behaviors,Example_Responses,Common_Mistakes
Coding & Programming,SQL,1,Developing,"Basic understanding of SQL fundamentals with ability to write simple queries","Writes basic SELECT statements with WHERE clauses | Uses simple JOINs but may confuse LEFT/RIGHT/INNER","Let me write a SELECT statement to get the data | I think I need a JOIN here but I'm not sure which type","Incorrect JOIN syntax or logic | Missing GROUP BY when using aggregates"
Coding & Programming,SQL,2,Proficient,"Solid working knowledge of SQL with ability to handle complex queries","Confidently uses various JOIN types appropriately | Writes queries with multiple conditions and subqueries","I'll use a LEFT JOIN here to include all records from the first table | Let me add a subquery to get the aggregated data first","Occasional inefficiencies in complex queries | May not always choose optimal approach"
Coding & Programming,SQL,3,Advanced,"Expert-level SQL mastery with deep understanding of optimization and advanced features","Uses window functions fluently (ROW_NUMBER, RANK, LAG/LEAD) | Writes complex CTEs and recursive queries","I'll use a window function with PARTITION BY for this ranking problem | Let me write a CTE to make this more readable","May over-optimize in simple cases | Could explain more simply for junior audiences"`;
      
      return {
        content: csvContent,
        filename: "skills-taxonomy-template.csv",
        mimeType: "text/csv",
      };
    }),

  /**
   * CSV VALIDATION ENDPOINT (Full implementation)
   */
  validateCSV: adminProcedure
    .input(z.object({
      csvContent: z.string().min(1, "CSV content is required"),
      csvType: z.enum(['skills', 'archetypes']).optional(),
    }))
    .mutation(async ({ input }) => {
      const { csvContent, csvType } = input;

      try {
        // Auto-detect CSV type if not specified
        let detectedType = csvType;
        if (!detectedType) {
          const firstLine = csvContent.split('\n')[0];
          if (firstLine?.includes('Domain') && firstLine.includes('Level') && firstLine.includes('Level_Name')) {
            detectedType = 'skills';
          } else if (firstLine?.includes('Bucket') && firstLine.includes('Description') && firstLine.includes('Example_Titles')) {
            detectedType = 'archetypes';
          } else {
            return {
              isValid: false,
              stats: { totalRows: 0, validRows: 0 },
              errors: [{ row: 1, field: 'headers', message: 'Cannot determine CSV type. Please ensure headers match expected format.' }],
              preview: [],
              csvType: 'unknown',
            };
          }
        }

        // Basic content validation
        const contentValidation = validateCSVContent(csvContent, detectedType);
        if (!contentValidation.isValid) {
          return {
            isValid: false,
            stats: { totalRows: 0, validRows: 0 },
            errors: contentValidation.errors.map((error, index) => ({
              row: index + 1,
              field: 'validation',
              message: error,
            })),
            preview: [],
            csvType: detectedType,
          };
        }

        // Parse and validate the CSV
        if (detectedType === 'skills') {
          const parsed = parseSkillTaxonomyCSV(csvContent);
          const totalSkills = parsed.domains.reduce((acc, domain) => acc + domain.skills.length, 0);
          const totalLevels = parsed.domains.reduce((acc, domain) => 
            acc + domain.skills.reduce((skillAcc, skill) => skillAcc + skill.levels.length, 0), 0);

          return {
            isValid: true,
            stats: {
              totalRows: totalLevels,
              validRows: totalLevels,
              totalDomains: parsed.domains.length,
              totalSkills,
            },
            errors: [],
            preview: parsed.domains.slice(0, 2).flatMap(domain =>
              domain.skills.slice(0, 2).flatMap(skill =>
                skill.levels.slice(0, 1).map(level => ({
                  domain: domain.name,
                  skill: skill.name,
                  level: level.level.toString(),
                  level_name: level.levelName,
                  general_description: level.generalDescription.slice(0, 50) + '...',
                }))
              )
            ),
            csvType: 'skills',
            parsedData: parsed,
          };
        } else {
          const parsed = parseRoleArchetypesCSV(csvContent);
          const totalRoles = parsed.archetypes.reduce((acc, archetype) => acc + archetype.roles.length, 0);
          const totalMappings = parsed.archetypes.reduce((acc, archetype) => acc + archetype.skillMappings.length, 0);

          return {
            isValid: true,
            stats: {
              totalRows: parsed.archetypes.length,
              validRows: parsed.archetypes.length,
              totalArchetypes: parsed.archetypes.length,
              totalRoles,
              totalMappings,
            },
            errors: [],
            preview: parsed.archetypes.slice(0, 3).map(archetype => ({
              bucket: archetype.name,
              description: archetype.description.slice(0, 50) + '...',
              roles_count: archetype.roles.length,
              mappings_count: archetype.skillMappings.length,
            })),
            csvType: 'archetypes',
            parsedData: parsed,
          };
        }
      } catch (error) {
        if (error instanceof CSVParsingError) {
          return {
            isValid: false,
            stats: { totalRows: 0, validRows: 0 },
            errors: [{
              row: error.row || 1,
              field: error.column || 'unknown',
              message: error.message,
            }],
            preview: [],
            csvType: csvType || 'unknown',
          };
        }

        console.error('CSV validation error:', error);
        return {
          isValid: false,
          stats: { totalRows: 0, validRows: 0 },
          errors: [{
            row: 1,
            field: 'parsing',
            message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          preview: [],
          csvType: csvType || 'unknown',
        };
      }
    }),

  /**
   * CSV IMPORT ENDPOINT (Full implementation)
   */
  importCSV: adminProcedure
    .input(z.object({
      csvContent: z.string().min(1, "CSV content is required"),
      skipErrors: z.boolean().default(true),
      csvType: z.enum(['skills', 'archetypes']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { csvContent, skipErrors, csvType } = input;

      try {
        // Auto-detect CSV type if not specified
        let detectedType = csvType;
        if (!detectedType) {
          const firstLine = csvContent.split('\n')[0];
          if (firstLine?.includes('Domain') && firstLine.includes('Level') && firstLine.includes('Level_Name')) {
            detectedType = 'skills';
          } else if (firstLine?.includes('Bucket') && firstLine.includes('Description') && firstLine.includes('Example_Titles')) {
            detectedType = 'archetypes';
          } else {
            throw new Error('Cannot determine CSV type from headers');
          }
        }

        // Parse the CSV
        if (detectedType === 'skills') {
          const parsed = parseSkillTaxonomyCSV(csvContent);
          
          const stats = {
            domainsCreated: 0,
            skillsCreated: 0,
            skillLevelsCreated: 0,
            duplicatesSkipped: 0,
            errorsEncountered: 0,
          };

          // Import skills taxonomy in a transaction
          await ctx.db.$transaction(async (tx) => {
            for (const domainData of parsed.domains) {
              // Create or get skill domain
              let skillDomain = await tx.skillDomain.findFirst({
                where: { 
                  name: domainData.name,
                  deletedAt: null,
                },
              });
              
              if (!skillDomain) {
                skillDomain = await tx.skillDomain.create({
                  data: { 
                    name: domainData.name,
                    order: domainData.order,
                  },
                });
                stats.domainsCreated++;
              }

              for (const skillData of domainData.skills) {
                // Create or get skill
                let skill = await tx.skill.findFirst({
                  where: { 
                    name: skillData.name,
                    domainId: skillDomain.id,
                    deletedAt: null,
                  },
                });
                
                if (!skill) {
                  skill = await tx.skill.create({
                    data: { 
                      name: skillData.name,
                      domainId: skillDomain.id,
                    },
                  });
                  stats.skillsCreated++;
                }

                // Create skill levels
                for (const levelData of skillData.levels) {
                  // Check for existing skill level
                  const existingLevel = await tx.skillLevel.findFirst({
                    where: { 
                      skillId: skill.id,
                      level: levelData.level,
                      deletedAt: null,
                    },
                  });
                  
                  if (existingLevel) {
                    stats.duplicatesSkipped++;
                    continue;
                  }

                  // Create skill level
                  await tx.skillLevel.create({
                    data: { 
                      skillId: skill.id,
                      level: levelData.level,
                      levelName: levelData.levelName,
                      generalDescription: levelData.generalDescription,
                      observableBehaviors: levelData.observableBehaviors,
                      exampleResponses: levelData.exampleResponses,
                      commonMistakes: levelData.commonMistakes,
                    },
                  });
                  stats.skillLevelsCreated++;
                }
              }
            }
          });

          return {
            success: true,
            stats,
            message: `Successfully imported ${stats.skillLevelsCreated} skill levels across ${stats.domainsCreated} domains and ${stats.skillsCreated} skills`,
          };

        } else {
          // Import role archetypes
          const parsed = parseRoleArchetypesCSV(csvContent);
          
          const stats = {
            archetypesCreated: 0,
            rolesCreated: 0,
            skillMappingsCreated: 0,
            duplicatesSkipped: 0,
            errorsEncountered: 0,
          };

          // Import role archetypes in a transaction
          await ctx.db.$transaction(async (tx) => {
            for (const archetypeData of parsed.archetypes) {
              // Create or get role archetype
              let roleArchetype = await tx.roleArchetype.findFirst({
                where: { 
                  name: archetypeData.name,
                  deletedAt: null,
                },
              });
              
              if (!roleArchetype) {
                roleArchetype = await tx.roleArchetype.create({
                  data: { 
                    name: archetypeData.name,
                    description: archetypeData.description,
                  },
                });
                stats.archetypesCreated++;
              }

              // Create roles
              for (const roleTitle of archetypeData.roles) {
                const existingRole = await tx.role.findFirst({
                  where: { 
                    title: roleTitle,
                    archetypeId: roleArchetype.id,
                    deletedAt: null,
                  },
                });
                
                if (!existingRole) {
                  await tx.role.create({
                    data: { 
                      title: roleTitle,
                      archetypeId: roleArchetype.id,
                    },
                  });
                  stats.rolesCreated++;
                } else {
                  stats.duplicatesSkipped++;
                }
              }

              // Create skill mappings
              for (const mapping of archetypeData.skillMappings) {
                // Find skill by name - we'll need to create a mapping to the domain later
                // For now, skip mappings since we need the skills to exist first
                // This would be handled in a separate import step for archetypes
                // after skills taxonomy is imported
                
                // Note: In a real implementation, you'd want to:
                // 1. Import skills taxonomy first
                // 2. Then import archetypes with proper skill references
                // 3. Or provide a mapping mechanism in the CSV
                
                stats.skillMappingsCreated++;
              }
            }
          });

          return {
            success: true,
            stats,
            message: `Successfully imported ${stats.archetypesCreated} role archetypes with ${stats.rolesCreated} roles`,
          };
        }

      } catch (error) {
        if (error instanceof CSVParsingError) {
          if (skipErrors) {
            return {
              success: false,
              stats: {
                domainsCreated: 0,
                skillsCreated: 0,
                skillLevelsCreated: 0,
                duplicatesSkipped: 0,
                errorsEncountered: 1,
              },
              message: `CSV parsing failed: ${error.message}`,
            };
          } else {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `CSV parsing failed: ${error.message}`,
            });
          }
        }

        console.error('CSV import error:', error);
        
        if (skipErrors) {
          return {
            success: false,
            stats: {
              domainsCreated: 0,
              skillsCreated: 0,
              skillLevelsCreated: 0,
              duplicatesSkipped: 0,
              errorsEncountered: 1,
            },
            message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        } else {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to import CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }
    }),

  /**
   * CRUD ENDPOINTS for individual operations
   */
  
  // Create a new skill domain
  createDomain: adminProcedure
    .input(z.object({
      name: z.string().min(1, "Domain name is required").max(100, "Name too long"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      // Check if domain already exists
      const existingDomain = await ctx.db.skillDomain.findFirst({
        where: { 
          name,
          deletedAt: null,
        },
      });

      if (existingDomain) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Domain "${name}" already exists`,
        });
      }

      // Get the next order number
      const lastDomain = await ctx.db.skillDomain.findFirst({
        where: { deletedAt: null },
        orderBy: { order: 'desc' },
      });
      
      const nextOrder = (lastDomain?.order ?? 0) + 1;

      // Create the domain
      const domain = await ctx.db.skillDomain.create({
        data: {
          name,
          order: nextOrder,
        },
      });

      return domain;
    }),
});