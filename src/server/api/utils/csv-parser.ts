import { z } from "zod";
import { parse } from "csv-parse/sync";
import { csvRowSchema, type CSVRow } from "../schemas/skills";

export interface CSVValidationResult {
  isValid: boolean;
  rows: CSVRow[];
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
}

export interface CSVImportStats {
  domainsCreated: number;
  categoriesCreated: number;
  skillsCreated: number;
  competenciesCreated: number;
  levelsCreated: number;
  duplicatesSkipped: number;
  errorsEncountered: number;
}

/**
 * Parse and validate CSV file content
 */
export function parseAndValidateCSV(csvContent: string): CSVValidationResult {
  const errors: Array<{ row: number; field: string; message: string }> = [];
  const validRows: CSVRow[] = [];

  try {
    // Parse CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Validate each row
    records.forEach((record: any, index: number) => {
      const rowNumber = index + 2; // +2 because CSV has headers and 0-indexed

      try {
        // Validate row against schema
        const validatedRow = csvRowSchema.parse({
          domain: record.Domain,
          category: record.Category,
          skill: record.Skill,
          competency: record.Competency,
          priority: record.Priority,
          level_1_name: record.Level_1_Name,
          level_1_description: record.Level_1_Description,
          level_2_name: record.Level_2_Name,
          level_2_description: record.Level_2_Description,
          level_3_name: record.Level_3_Name,
          level_3_description: record.Level_3_Description,
          level_4_name: record.Level_4_Name,
          level_4_description: record.Level_4_Description,
          level_5_name: record.Level_5_Name,
          level_5_description: record.Level_5_Description,
        });

        validRows.push(validatedRow);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((zodError) => {
            errors.push({
              row: rowNumber,
              field: zodError.path.join('.'),
              message: zodError.message,
            });
          });
        } else {
          errors.push({
            row: rowNumber,
            field: 'general',
            message: 'Unknown validation error',
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      rows: validRows,
      errors,
      stats: {
        totalRows: records.length,
        validRows: validRows.length,
        errorRows: records.length - validRows.length,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      rows: [],
      errors: [
        {
          row: 0,
          field: 'file',
          message: error instanceof Error ? error.message : 'Failed to parse CSV file',
        },
      ],
      stats: {
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
      },
    };
  }
}

/**
 * Transform CSV rows into hierarchical data structure for import
 */
export function transformCSVToHierarchy(rows: CSVRow[]) {
  const domains = new Map<string, {
    name: string;
    categories: Map<string, {
      name: string;
      skills: Map<string, {
        name: string;
        competencies: Array<{
          name: string;
          priority: "PRIMARY" | "SECONDARY" | "NONE";
          levels: Array<{
            level: number;
            name: string;
            description: string;
          }>;
        }>;
      }>;
    }>;
  }>();

  rows.forEach((row) => {
    // Get or create domain
    if (!domains.has(row.domain)) {
      domains.set(row.domain, {
        name: row.domain,
        categories: new Map(),
      });
    }
    const domain = domains.get(row.domain)!;

    // Get or create category
    if (!domain.categories.has(row.category)) {
      domain.categories.set(row.category, {
        name: row.category,
        skills: new Map(),
      });
    }
    const category = domain.categories.get(row.category)!;

    // Get or create skill
    if (!category.skills.has(row.skill)) {
      category.skills.set(row.skill, {
        name: row.skill,
        competencies: [],
      });
    }
    const skill = category.skills.get(row.skill)!;

    // Add competency with levels
    skill.competencies.push({
      name: row.competency,
      priority: row.priority,
      levels: [
        { level: 1, name: row.level_1_name, description: row.level_1_description },
        { level: 2, name: row.level_2_name, description: row.level_2_description },
        { level: 3, name: row.level_3_name, description: row.level_3_description },
        { level: 4, name: row.level_4_name, description: row.level_4_description },
        { level: 5, name: row.level_5_name, description: row.level_5_description },
      ],
    });
  });

  return domains;
}

/**
 * Generate CSV template content
 */
export function generateCSVTemplate(): string {
  const headers = [
    "Domain",
    "Category", 
    "Skill",
    "Competency",
    "Priority",
    "Level_1_Name",
    "Level_1_Description",
    "Level_2_Name", 
    "Level_2_Description",
    "Level_3_Name",
    "Level_3_Description",
    "Level_4_Name",
    "Level_4_Description",
    "Level_5_Name",
    "Level_5_Description"
  ];

  const sampleRows = [
    [
      "Technical Skills",
      "Programming",
      "JavaScript",
      "Async Programming",
      "PRIMARY",
      "Beginning/Novice",
      "Struggles with basic async concepts and often writes blocking code. Needs guidance on promises and callbacks.",
      "Developing/Basic", 
      "Understands promises but makes errors with chaining and error handling. Can use async/await with guidance.",
      "Competent/Proficient",
      "Uses async/await correctly and handles basic error cases. Understands event loop concepts.",
      "Accomplished/Advanced",
      "Handles complex async patterns including concurrency control and advanced error handling.",
      "Exemplary/Expert",
      "Masters all async programming concepts including custom promises, generators, and performance optimization."
    ],
    [
      "Technical Skills",
      "Programming", 
      "JavaScript",
      "DOM Manipulation",
      "SECONDARY",
      "Beginning/Novice",
      "Basic element selection and property modification. Often relies on jQuery or frameworks.",
      "Developing/Basic",
      "Can modify element properties and handle basic events. Understanding of DOM structure is developing.",
      "Competent/Proficient", 
      "Creates dynamic interfaces with proper event handling. Understands DOM APIs and browser compatibility.",
      "Accomplished/Advanced",
      "Optimizes DOM operations and uses modern APIs like MutationObserver. Handles complex interactions.",
      "Exemplary/Expert",
      "Masters virtual DOM concepts, performance optimization, and accessibility considerations."
    ],
    [
      "Cognitive",
      "Problem Solving",
      "Analytical Thinking", 
      "Pattern Recognition",
      "PRIMARY",
      "Beginning/Novice",
      "Struggles to identify patterns in data or problems. Needs explicit guidance to see connections.",
      "Developing/Basic",
      "Can identify obvious patterns but misses subtle relationships. Requires assistance for complex analysis.",
      "Competent/Proficient",
      "Recognizes patterns in familiar domains and can apply known frameworks for analysis.",
      "Accomplished/Advanced", 
      "Quickly identifies complex patterns and can transfer pattern recognition across different domains.",
      "Exemplary/Expert",
      "Naturally sees abstract patterns and can create new frameworks for pattern analysis."
    ]
  ];

  const csvContent = [headers, ...sampleRows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return csvContent;
}

/**
 * Export skills data to CSV format
 */
export function exportSkillsToCSV(hierarchyData: any): string {
  const rows: string[][] = [];
  
  // Add headers
  const headers = [
    "Domain",
    "Category",
    "Skill", 
    "Competency",
    "Priority",
    "Level_1_Name",
    "Level_1_Description",
    "Level_2_Name",
    "Level_2_Description", 
    "Level_3_Name",
    "Level_3_Description",
    "Level_4_Name",
    "Level_4_Description",
    "Level_5_Name", 
    "Level_5_Description"
  ];
  rows.push(headers);

  // Process hierarchy data
  if (hierarchyData?.domains) {
    hierarchyData.domains.forEach((domain: any) => {
      domain.categories?.forEach((category: any) => {
        category.skills?.forEach((skill: any) => {
          skill.competencies?.forEach((competency: any) => {
            // Sort levels by level number
            const sortedLevels = [...(competency.levels || [])]
              .sort((a, b) => a.level - b.level);
            
            // Pad levels array to ensure we have 5 levels
            const levels = Array.from({ length: 5 }, (_, i) => {
              const level = sortedLevels.find(l => l.level === i + 1);
              return level || { name: "", description: "" };
            });

            const row = [
              domain.name,
              category.name,
              skill.name,
              competency.name,
              competency.priority || "NONE",
              ...levels.flatMap(level => [level.name, level.description])
            ];
            
            rows.push(row);
          });
        });
      });
    });
  }

  // Convert to CSV string
  const csvContent = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return csvContent;
}