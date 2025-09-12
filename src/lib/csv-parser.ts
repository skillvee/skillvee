import { parse } from 'csv-parse/sync';

export interface SkillTaxonomyRow {
  Domain: string;
  Skill: string;
  Level: number;
  Level_Name: string;
  General_Description: string;
  Observable_Behaviors: string;
  Example_Responses: string;
  Common_Mistakes: string;
}

export interface RoleArchetypeRow {
  Bucket: string;
  Description: string;
  "Example Titles": string;
  [skillName: string]: string; // For all the skill columns with ✔/✔✔/✔✔✔
}

export interface ParsedSkillTaxonomy {
  domains: {
    name: string;
    order: number;
    skills: {
      name: string;
      levels: {
        level: number;
        levelName: string;
        generalDescription: string;
        observableBehaviors: string;
        exampleResponses: string;
        commonMistakes: string;
      }[];
    }[];
  }[];
}

export interface ParsedRoleArchetypes {
  archetypes: {
    name: string;
    description: string;
    roles: string[];
    skillMappings: {
      domain: string;
      skill: string;
      importance: 'LOW' | 'MEDIUM' | 'HIGH';
    }[];
  }[];
  skillDomains: string[]; // Extracted from CSV headers
}

export class CSVParsingError extends Error {
  row?: number;
  column?: string;

  constructor(message: string, row?: number, column?: string) {
    super(message);
    this.name = 'CSVParsingError';
    this.row = row;
    this.column = column;
  }
}

/**
 * Parse skills taxonomy CSV data
 * Expected format: Domain,Skill,Level,Level_Name,General_Description,Observable_Behaviors,Example_Responses,Common_Mistakes
 */
export function parseSkillTaxonomyCSV(csvContent: string): ParsedSkillTaxonomy {
  try {
    const records: SkillTaxonomyRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      throw new CSVParsingError('CSV file is empty or contains no valid data');
    }

    // Validate required columns
    const requiredColumns = ['Domain', 'Skill', 'Level', 'Level_Name', 'General_Description', 'Observable_Behaviors', 'Example_Responses', 'Common_Mistakes'];
    const firstRecord = records[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRecord!));
    
    if (missingColumns.length > 0) {
      throw new CSVParsingError(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Group by domain and skill
    const domainMap = new Map<string, Map<string, SkillTaxonomyRow[]>>();
    
    records.forEach((record, index) => {
      // Validate required fields
      if (!record.Domain?.trim()) {
        throw new CSVParsingError('Domain is required', index + 2);
      }
      if (!record.Skill?.trim()) {
        throw new CSVParsingError('Skill is required', index + 2);
      }
      if (!record.Level || isNaN(Number(record.Level))) {
        throw new CSVParsingError('Level must be a valid number', index + 2);
      }
      
      const level = Number(record.Level);
      if (level < 1 || level > 3) {
        throw new CSVParsingError('Level must be between 1 and 3', index + 2);
      }

      const domain = record.Domain.trim();
      const skill = record.Skill.trim();

      if (!domainMap.has(domain)) {
        domainMap.set(domain, new Map());
      }
      
      const skillMap = domainMap.get(domain)!;
      if (!skillMap.has(skill)) {
        skillMap.set(skill, []);
      }
      
      skillMap.get(skill)!.push(record);
    });

    // Convert to output format
    const domains = Array.from(domainMap.entries()).map(([domainName, skillMap], domainIndex) => ({
      name: domainName,
      order: domainIndex + 1,
      skills: Array.from(skillMap.entries()).map(([skillName, skillRecords]) => ({
        name: skillName,
        levels: skillRecords
          .sort((a, b) => Number(a.Level) - Number(b.Level))
          .map(record => ({
            level: Number(record.Level),
            levelName: record.Level_Name.trim(),
            generalDescription: record.General_Description.trim(),
            observableBehaviors: record.Observable_Behaviors.trim(),
            exampleResponses: record.Example_Responses.trim(),
            commonMistakes: record.Common_Mistakes.trim(),
          }))
      }))
    }));

    return { domains };
  } catch (error) {
    if (error instanceof CSVParsingError) {
      throw error;
    }
    throw new CSVParsingError(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse role archetypes CSV data  
 * Expected format: Bucket,Description,Example_Titles,SQL,Python,R,Classical ML algorithms,...
 */
export function parseRoleArchetypesCSV(csvContent: string): ParsedRoleArchetypes {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 3) {
      throw new CSVParsingError('CSV must contain domain header, skill header, and at least one data row');
    }

    // Parse the skill headers from the second row (first row is domain groupings)
    const skillHeaderLine = lines[1]!;
    const headers = parse(skillHeaderLine, {
      skip_empty_lines: true,
      trim: true,
    })[0] as string[];

    // Find skill headers (they start after Example_Titles column)
    const skillDomainStartIndex = 3;
    const skillHeaders = headers.slice(skillDomainStartIndex);
    
    // Extract unique skill domains from the skill headers
    const skillDomains = [...new Set(skillHeaders)].filter(header => header.trim());

    // Parse data rows (skip both header rows)
    const records = parse(csvContent, {
      columns: headers,
      skip_empty_lines: true,
      trim: true,
      from: 3, // Skip both header rows
    }) as RoleArchetypeRow[];

    const archetypes = records.map((record, index) => {
      // Validate required fields
      if (!record.Bucket?.trim()) {
        throw new CSVParsingError('Bucket (archetype name) is required', index + 2);
      }
      if (!record.Description?.trim()) {
        throw new CSVParsingError('Description is required', index + 2);
      }
      if (!record["Example Titles"]?.trim()) {
        throw new CSVParsingError('Example Titles is required', index + 2);
      }

      // Parse roles from Example Titles
      const roleText = record["Example Titles"].replace(/^•\s*/gm, '').trim();
      const roles = roleText
        .split(/\n|•/)
        .map(role => role.trim())
        .filter(role => role.length > 0);

      // Parse skill mappings
      const skillMappings: ParsedRoleArchetypes['archetypes'][0]['skillMappings'] = [];
      
      skillHeaders.forEach(skillName => {
        if (!skillName.trim()) return;
        
        const value = record[skillName];
        if (value && value.includes('✔')) {
          const checkCount = (value.match(/✔/g) || []).length;
          let importance: 'LOW' | 'MEDIUM' | 'HIGH';
          
          if (checkCount >= 3) importance = 'HIGH';
          else if (checkCount === 2) importance = 'MEDIUM';
          else importance = 'LOW';

          // For now, we'll assign all skills to a generic domain
          // In the real implementation, this would need mapping logic
          skillMappings.push({
            domain: 'Unknown', // This will need to be mapped properly
            skill: skillName,
            importance,
          });
        }
      });

      return {
        name: record.Bucket.trim(),
        description: record.Description.trim(),
        roles,
        skillMappings,
      };
    });

    return {
      archetypes,
      skillDomains,
    };
  } catch (error) {
    if (error instanceof CSVParsingError) {
      throw error;
    }
    throw new CSVParsingError(`Failed to parse role archetypes CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate CSV content before parsing
 */
export function validateCSVContent(content: string, type: 'skills' | 'archetypes'): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('CSV content is empty');
    return { isValid: false, errors };
  }

  const lines = content.split('\n').filter(line => line.trim());
  
  if (type === 'skills' && lines.length < 2) {
    errors.push('CSV must contain at least a header row and one data row');
    return { isValid: false, errors };
  }
  
  if (type === 'archetypes' && lines.length < 3) {
    errors.push('Archetypes CSV must contain domain header, skill header, and at least one data row');
    return { isValid: false, errors };
  }

  try {
    let headers: string[];
    
    if (type === 'skills') {
      headers = parse(lines[0]!, { trim: true })[0] as string[];
    } else {
      // For archetypes, headers are in the second line
      headers = parse(lines[1]!, { trim: true })[0] as string[];
    }
    
    if (type === 'skills') {
      const requiredColumns = ['Domain', 'Skill', 'Level', 'Level_Name', 'General_Description', 'Observable_Behaviors', 'Example_Responses', 'Common_Mistakes'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        errors.push(`Missing required columns for skills CSV: ${missingColumns.join(', ')}`);
      }
    } else if (type === 'archetypes') {
      const requiredColumns = ['Bucket', 'Description', 'Example Titles'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        errors.push(`Missing required columns for archetypes CSV: ${missingColumns.join(', ')}`);
      }
    }
  } catch (error) {
    errors.push(`Invalid CSV header format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Create a database import payload from parsed CSV data
 */
export interface DatabaseImportPayload {
  skillDomains: Array<{
    name: string;
    order: number;
    skills: Array<{
      name: string;
      levels: Array<{
        level: number;
        levelName: string;
        generalDescription: string;
        observableBehaviors: string;
        exampleResponses: string;
        commonMistakes: string;
      }>;
    }>;
  }>;
  roleArchetypes: Array<{
    name: string;
    description: string;
    roles: string[];
    skillMappings: Array<{
      domainName: string;
      skillName: string;
      importance: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
  }>;
}

export function createDatabasePayload(
  skillsData: ParsedSkillTaxonomy,
  archetypesData: ParsedRoleArchetypes,
  domainSkillMapping: Record<string, string> // Maps skill names to domain names
): DatabaseImportPayload {
  // Map archetype skill mappings to correct domains
  const updatedArchetypes = archetypesData.archetypes.map(archetype => ({
    ...archetype,
    skillMappings: archetype.skillMappings.map(mapping => ({
      domainName: domainSkillMapping[mapping.skill] || 'Unknown',
      skillName: mapping.skill,
      importance: mapping.importance,
    }))
  }));

  return {
    skillDomains: skillsData.domains,
    roleArchetypes: updatedArchetypes,
  };
}