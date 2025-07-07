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
          rubric_level_1: record.Rubric_Level_1,
          rubric_level_2: record.Rubric_Level_2,
          rubric_level_3: record.Rubric_Level_3,
          rubric_level_4: record.Rubric_Level_4,
          rubric_level_5: record.Rubric_Level_5,
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
          rubricLevel1: string;
          rubricLevel2: string;
          rubricLevel3: string;
          rubricLevel4: string;
          rubricLevel5: string;
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

    // Add competency with rubric levels
    skill.competencies.push({
      name: row.competency,
      priority: row.priority,
      rubricLevel1: row.rubric_level_1,
      rubricLevel2: row.rubric_level_2,
      rubricLevel3: row.rubric_level_3,
      rubricLevel4: row.rubric_level_4,
      rubricLevel5: row.rubric_level_5,
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
    "Rubric_Level_1",
    "Rubric_Level_2",
    "Rubric_Level_3",
    "Rubric_Level_4",
    "Rubric_Level_5"
  ];

  const sampleRows = [
    [
      "Technical Skills",
      "Programming",
      "JavaScript",
      "Async Programming",
      "PRIMARY",
      "Struggles with basic async concepts and often writes blocking code. Needs guidance on promises and callbacks.",
      "Understands promises but makes errors with chaining and error handling. Can use async/await with guidance.",
      "Uses async/await correctly and handles basic error cases. Understands event loop concepts.",
      "Handles complex async patterns including concurrency control and advanced error handling.",
      "Masters all async programming concepts including custom promises, generators, and performance optimization."
    ],
    [
      "Technical Skills",
      "Programming", 
      "JavaScript",
      "DOM Manipulation",
      "SECONDARY",
      "Basic element selection and property modification. Often relies on jQuery or frameworks.",
      "Can modify element properties and handle basic events. Understanding of DOM structure is developing.",
      "Creates dynamic interfaces with proper event handling. Understands DOM APIs and browser compatibility.",
      "Optimizes DOM operations and uses modern APIs like MutationObserver. Handles complex interactions.",
      "Masters virtual DOM concepts, performance optimization, and accessibility considerations."
    ],
    [
      "Cognitive",
      "Problem Solving",
      "Analytical Thinking", 
      "Pattern Recognition",
      "PRIMARY",
      "Struggles to identify patterns in data or problems. Needs explicit guidance to see connections.",
      "Can identify obvious patterns but misses subtle relationships. Requires assistance for complex analysis.",
      "Recognizes patterns in familiar domains and can apply known frameworks for analysis.",
      "Quickly identifies complex patterns and can transfer pattern recognition across different domains.",
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
    "Rubric_Level_1",
    "Rubric_Level_2",
    "Rubric_Level_3",
    "Rubric_Level_4",
    "Rubric_Level_5"
  ];
  rows.push(headers);

  // Process hierarchy data
  if (hierarchyData?.domains) {
    hierarchyData.domains.forEach((domain: any) => {
      domain.categories?.forEach((category: any) => {
        category.skills?.forEach((skill: any) => {
          skill.competencies?.forEach((competency: any) => {
            const row = [
              domain.name,
              category.name,
              skill.name,
              competency.name,
              competency.priority || "NONE",
              competency.rubricLevel1 || "",
              competency.rubricLevel2 || "",
              competency.rubricLevel3 || "",
              competency.rubricLevel4 || "",
              competency.rubricLevel5 || ""
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