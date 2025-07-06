import { describe, it, expect } from "@jest/globals";
import { 
  parseAndValidateCSV, 
  transformCSVToHierarchy, 
  generateCSVTemplate, 
  exportSkillsToCSV 
} from "../csv-parser";

describe("CSV Parser Utilities", () => {
  describe("parseAndValidateCSV", () => {
    it("should parse valid CSV content successfully", () => {
      const csvContent = `Domain,Category,Skill,Competency,Priority,Level_1_Name,Level_1_Description,Level_2_Name,Level_2_Description,Level_3_Name,Level_3_Description,Level_4_Name,Level_4_Description,Level_5_Name,Level_5_Description
Technical Skills,Programming,JavaScript,Async Programming,PRIMARY,Novice,Basic understanding of async concepts,Beginner,Can use promises with guidance,Proficient,Independent use of async/await,Advanced,Handles complex async patterns,Expert,Masters all async concepts
Technical Skills,Programming,JavaScript,DOM Manipulation,SECONDARY,Novice,Basic element selection,Beginner,Can modify properties,Proficient,Creates dynamic interfaces,Advanced,Optimizes DOM operations,Expert,Masters virtual DOM concepts`;

      const result = parseAndValidateCSV(csvContent);

      expect(result.isValid).toBe(true);
      expect(result.rows).toHaveLength(2);
      expect(result.stats.totalRows).toBe(2);
      expect(result.stats.validRows).toBe(2);
      expect(result.stats.errorRows).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Check first row data
      const firstRow = result.rows[0];
      expect(firstRow.domain).toBe("Technical Skills");
      expect(firstRow.category).toBe("Programming");
      expect(firstRow.skill).toBe("JavaScript");
      expect(firstRow.competency).toBe("Async Programming");
      expect(firstRow.priority).toBe("PRIMARY");
      expect(firstRow.level_1_name).toBe("Novice");
      expect(firstRow.level_5_description).toBe("Masters all async concepts");
    });

    it("should detect validation errors in CSV", () => {
      const csvContent = `Domain,Category,Skill,Competency,Priority,Level_1_Name,Level_1_Description,Level_2_Name,Level_2_Description,Level_3_Name,Level_3_Description,Level_4_Name,Level_4_Description,Level_5_Name,Level_5_Description
Technical Skills,Programming,JavaScript,Async Programming,INVALID_PRIORITY,Novice,Basic understanding,Beginner,Can apply with guidance,Proficient,Independent application,Advanced,Complex scenarios,Expert,Innovation and teaching
,Programming,JavaScript,DOM Manipulation,PRIMARY,Novice,Basic element selection,Beginner,Can modify properties,Proficient,Creates dynamic interfaces,Advanced,Optimizes DOM operations,Expert,Masters virtual DOM concepts`;

      const result = parseAndValidateCSV(csvContent);

      expect(result.isValid).toBe(false);
      expect(result.stats.totalRows).toBe(2);
      expect(result.stats.validRows).toBe(0);
      expect(result.stats.errorRows).toBe(2);
      expect(result.errors.length).toBeGreaterThan(0);

      // Check for specific validation errors
      const priorityError = result.errors.find(e => e.field === "priority");
      expect(priorityError).toBeDefined();
      expect(priorityError?.row).toBe(2); // Row 2 (first data row after header)

      const domainError = result.errors.find(e => e.field === "domain");
      expect(domainError).toBeDefined();
      expect(domainError?.row).toBe(3); // Row 3 (second data row)
    });

    it("should handle empty CSV content", () => {
      const result = parseAndValidateCSV("");

      expect(result.isValid).toBe(false);
      expect(result.rows).toHaveLength(0);
      expect(result.stats.totalRows).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle malformed CSV", () => {
      const csvContent = `Domain,Category,Skill
Invalid CSV with missing columns`;

      const result = parseAndValidateCSV(csvContent);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate priority enum values", () => {
      const csvContent = `Domain,Category,Skill,Competency,Priority,Level_1_Name,Level_1_Description,Level_2_Name,Level_2_Description,Level_3_Name,Level_3_Description,Level_4_Name,Level_4_Description,Level_5_Name,Level_5_Description
Technical Skills,Programming,JavaScript,Async Programming,HIGH,Novice,Basic understanding,Beginner,Can apply with guidance,Proficient,Independent application,Advanced,Complex scenarios,Expert,Innovation and teaching`;

      const result = parseAndValidateCSV(csvContent);

      expect(result.isValid).toBe(false);
      const priorityError = result.errors.find(e => e.field === "priority");
      expect(priorityError).toBeDefined();
      expect(priorityError?.message).toContain("Invalid enum value");
    });
  });

  describe("transformCSVToHierarchy", () => {
    it("should transform CSV rows into hierarchical structure", () => {
      const csvRows = [
        {
          domain: "Technical Skills",
          category: "Programming",
          skill: "JavaScript",
          competency: "Async Programming",
          priority: "PRIMARY" as const,
          level_1_name: "Novice",
          level_1_description: "Basic understanding",
          level_2_name: "Beginner", 
          level_2_description: "Can apply with guidance",
          level_3_name: "Proficient",
          level_3_description: "Independent application",
          level_4_name: "Advanced",
          level_4_description: "Complex scenarios",
          level_5_name: "Expert",
          level_5_description: "Innovation and teaching",
        },
        {
          domain: "Technical Skills",
          category: "Programming",
          skill: "JavaScript",
          competency: "DOM Manipulation",
          priority: "SECONDARY" as const,
          level_1_name: "Novice",
          level_1_description: "Basic element selection",
          level_2_name: "Beginner",
          level_2_description: "Can modify properties",
          level_3_name: "Proficient", 
          level_3_description: "Creates dynamic interfaces",
          level_4_name: "Advanced",
          level_4_description: "Optimizes DOM operations",
          level_5_name: "Expert",
          level_5_description: "Masters virtual DOM",
        },
        {
          domain: "Cognitive",
          category: "Problem Solving",
          skill: "Analytical Thinking",
          competency: "Pattern Recognition",
          priority: "PRIMARY" as const,
          level_1_name: "Novice",
          level_1_description: "Struggles with patterns",
          level_2_name: "Beginner",
          level_2_description: "Identifies obvious patterns",
          level_3_name: "Proficient",
          level_3_description: "Recognizes complex patterns",
          level_4_name: "Advanced", 
          level_4_description: "Transfers patterns across domains",
          level_5_name: "Expert",
          level_5_description: "Creates new pattern frameworks",
        },
      ];

      const hierarchy = transformCSVToHierarchy(csvRows);

      // Check domains
      expect(hierarchy.size).toBe(2);
      expect(hierarchy.has("Technical Skills")).toBe(true);
      expect(hierarchy.has("Cognitive")).toBe(true);

      // Check Technical Skills domain
      const technicalDomain = hierarchy.get("Technical Skills");
      expect(technicalDomain).toBeDefined();
      expect(technicalDomain?.categories.size).toBe(1);
      expect(technicalDomain?.categories.has("Programming")).toBe(true);

      // Check Programming category
      const programmingCategory = technicalDomain?.categories.get("Programming");
      expect(programmingCategory).toBeDefined();
      expect(programmingCategory?.skills.size).toBe(1);
      expect(programmingCategory?.skills.has("JavaScript")).toBe(true);

      // Check JavaScript skill
      const jsSkill = programmingCategory?.skills.get("JavaScript");
      expect(jsSkill).toBeDefined();
      expect(jsSkill?.competencies).toHaveLength(2);

      // Check competencies
      const asyncCompetency = jsSkill?.competencies.find(c => c.name === "Async Programming");
      expect(asyncCompetency).toBeDefined();
      expect(asyncCompetency?.priority).toBe("PRIMARY");
      expect(asyncCompetency?.levels).toHaveLength(5);

      const domCompetency = jsSkill?.competencies.find(c => c.name === "DOM Manipulation");
      expect(domCompetency).toBeDefined();
      expect(domCompetency?.priority).toBe("SECONDARY");

      // Check Cognitive domain
      const cognitiveDomain = hierarchy.get("Cognitive");
      expect(cognitiveDomain).toBeDefined();
      expect(cognitiveDomain?.categories.size).toBe(1);
      expect(cognitiveDomain?.categories.has("Problem Solving")).toBe(true);
    });

    it("should handle empty rows array", () => {
      const hierarchy = transformCSVToHierarchy([]);
      expect(hierarchy.size).toBe(0);
    });

    it("should group multiple competencies under same skill", () => {
      const csvRows = [
        {
          domain: "Technical Skills",
          category: "Programming", 
          skill: "JavaScript",
          competency: "Competency 1",
          priority: "PRIMARY" as const,
          level_1_name: "L1", level_1_description: "D1",
          level_2_name: "L2", level_2_description: "D2", 
          level_3_name: "L3", level_3_description: "D3",
          level_4_name: "L4", level_4_description: "D4",
          level_5_name: "L5", level_5_description: "D5",
        },
        {
          domain: "Technical Skills",
          category: "Programming",
          skill: "JavaScript", 
          competency: "Competency 2",
          priority: "SECONDARY" as const,
          level_1_name: "L1", level_1_description: "D1",
          level_2_name: "L2", level_2_description: "D2",
          level_3_name: "L3", level_3_description: "D3", 
          level_4_name: "L4", level_4_description: "D4",
          level_5_name: "L5", level_5_description: "D5",
        },
      ];

      const hierarchy = transformCSVToHierarchy(csvRows);
      
      const domain = hierarchy.get("Technical Skills");
      const category = domain?.categories.get("Programming");
      const skill = category?.skills.get("JavaScript");
      
      expect(skill?.competencies).toHaveLength(2);
      expect(skill?.competencies[0].name).toBe("Competency 1");
      expect(skill?.competencies[1].name).toBe("Competency 2");
    });
  });

  describe("generateCSVTemplate", () => {
    it("should generate valid CSV template with headers", () => {
      const template = generateCSVTemplate();

      expect(template).toContain("Domain,Category,Skill,Competency,Priority");
      expect(template).toContain("Level_1_Name,Level_1_Description");
      expect(template).toContain("Level_5_Name,Level_5_Description");
      expect(template).toContain("Technical Skills");
      expect(template).toContain("Programming");
      expect(template).toContain("JavaScript");
      expect(template).toContain("Async Programming");
      
      // Should have sample data
      const lines = template.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Header + at least one sample row
      
      // Check that sample data includes all priority levels
      expect(template).toContain("PRIMARY");
      expect(template).toContain("SECONDARY");
    });

    it("should escape quotes properly in CSV", () => {
      const template = generateCSVTemplate();
      
      // Template should use proper CSV escaping with quotes around fields
      const lines = template.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          // Each line should have properly quoted fields
          expect(line).toMatch(/^"[^"]*"(,"[^"]*")*$/);
        }
      });
    });
  });

  describe("exportSkillsToCSV", () => {
    it("should export hierarchy data to CSV format", () => {
      const hierarchyData = {
        domains: [
          {
            name: "Technical Skills",
            categories: [
              {
                name: "Programming",
                skills: [
                  {
                    name: "JavaScript",
                    competencies: [
                      {
                        name: "Async Programming",
                        priority: "PRIMARY",
                        levels: [
                          { level: 1, name: "Novice", description: "Basic understanding" },
                          { level: 2, name: "Beginner", description: "Can apply with guidance" },
                          { level: 3, name: "Proficient", description: "Independent application" },
                          { level: 4, name: "Advanced", description: "Complex scenarios" },
                          { level: 5, name: "Expert", description: "Innovation and teaching" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const csvContent = exportSkillsToCSV(hierarchyData);

      // Check headers
      expect(csvContent).toContain("Domain,Category,Skill,Competency,Priority");
      expect(csvContent).toContain("Level_1_Name,Level_1_Description");
      expect(csvContent).toContain("Level_5_Name,Level_5_Description");

      // Check data
      expect(csvContent).toContain("Technical Skills");
      expect(csvContent).toContain("Programming");
      expect(csvContent).toContain("JavaScript");
      expect(csvContent).toContain("Async Programming");
      expect(csvContent).toContain("PRIMARY");
      expect(csvContent).toContain("Novice");
      expect(csvContent).toContain("Expert");

      // Check structure
      const lines = csvContent.split('\n');
      expect(lines.length).toBe(2); // Header + 1 data row
    });

    it("should handle missing competency levels gracefully", () => {
      const hierarchyData = {
        domains: [
          {
            name: "Test Domain",
            categories: [
              {
                name: "Test Category",
                skills: [
                  {
                    name: "Test Skill",
                    competencies: [
                      {
                        name: "Test Competency",
                        priority: "NONE",
                        levels: [
                          { level: 1, name: "Level 1", description: "Description 1" },
                          { level: 3, name: "Level 3", description: "Description 3" },
                          // Missing levels 2, 4, 5
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const csvContent = exportSkillsToCSV(hierarchyData);

      // Should still generate valid CSV with empty fields for missing levels
      expect(csvContent).toContain("Level 1");
      expect(csvContent).toContain("Level 3");
      
      // Count commas to ensure all columns are present
      const dataLine = csvContent.split('\n')[1];
      const commaCount = (dataLine?.match(/,/g) || []).length;
      expect(commaCount).toBe(14); // 15 columns = 14 commas
    });

    it("should handle empty hierarchy data", () => {
      const csvContent = exportSkillsToCSV({ domains: [] });

      // Should only have headers
      const lines = csvContent.split('\n');
      expect(lines.length).toBe(1);
      expect(csvContent).toContain("Domain,Category,Skill,Competency,Priority");
    });

    it("should sort levels correctly", () => {
      const hierarchyData = {
        domains: [
          {
            name: "Test Domain",
            categories: [
              {
                name: "Test Category", 
                skills: [
                  {
                    name: "Test Skill",
                    competencies: [
                      {
                        name: "Test Competency",
                        priority: "PRIMARY",
                        levels: [
                          { level: 5, name: "Level 5", description: "Description 5" },
                          { level: 1, name: "Level 1", description: "Description 1" },
                          { level: 3, name: "Level 3", description: "Description 3" },
                          { level: 2, name: "Level 2", description: "Description 2" },
                          { level: 4, name: "Level 4", description: "Description 4" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const csvContent = exportSkillsToCSV(hierarchyData);
      const dataLine = csvContent.split('\n')[1];
      
      // Levels should be in order 1, 2, 3, 4, 5
      expect(dataLine).toContain('"Level 1","Description 1","Level 2","Description 2","Level 3","Description 3","Level 4","Description 4","Level 5","Description 5"');
    });
  });
});