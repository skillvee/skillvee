import { useState, useCallback } from 'react';
import { 
  parseSkillTaxonomyCSV, 
  parseRoleArchetypesCSV, 
  validateCSVContent,
  CSVParsingError,
} from '~/lib/csv-parser';
import type { 
  ParsedSkillTaxonomy,
  ParsedRoleArchetypes 
} from '~/lib/csv-parser';

export type CSVType = 'skills' | 'archetypes';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: ParsedSkillTaxonomy | ParsedRoleArchetypes;
  type?: CSVType;
}

interface UseCSVValidationReturn {
  validationResult: ValidationResult | null;
  isValidating: boolean;
  validateFile: (file: File, expectedType?: CSVType) => Promise<ValidationResult>;
  clearValidation: () => void;
}

export function useCSVValidation(): UseCSVValidationReturn {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = useCallback(async (file: File, expectedType?: CSVType): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      // Read file content
      const csvContent = await file.text();
      
      // Auto-detect CSV type if not specified
      let csvType = expectedType;
      
      if (!csvType) {
        // Try to detect based on headers
        const firstLine = csvContent.split('\n')[0];
        if (firstLine?.includes('Domain') && firstLine.includes('Level') && firstLine.includes('Level_Name')) {
          csvType = 'skills';
        } else if (firstLine?.includes('Bucket') && firstLine.includes('Description') && firstLine.includes('Example_Titles')) {
          csvType = 'archetypes';
        }
      }

      if (!csvType) {
        return {
          isValid: false,
          errors: ['Cannot determine CSV type. Please ensure headers match expected format.'],
        };
      }

      // Basic validation
      const validation = validateCSVContent(csvContent, csvType);
      if (!validation.isValid) {
        const result = {
          isValid: false,
          errors: validation.errors,
          type: csvType,
        };
        setValidationResult(result);
        return result;
      }

      // Parse the CSV
      let parsedData: ParsedSkillTaxonomy | ParsedRoleArchetypes;
      
      try {
        if (csvType === 'skills') {
          parsedData = parseSkillTaxonomyCSV(csvContent);
        } else {
          parsedData = parseRoleArchetypesCSV(csvContent);
        }

        const result = {
          isValid: true,
          errors: [],
          data: parsedData,
          type: csvType,
        };
        
        setValidationResult(result);
        return result;
      } catch (parseError) {
        if (parseError instanceof CSVParsingError) {
          const result = {
            isValid: false,
            errors: [parseError.message],
            type: csvType,
          };
          setValidationResult(result);
          return result;
        }
        throw parseError;
      }
    } catch (error) {
      const result = {
        isValid: false,
        errors: [`Failed to process CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    isValidating,
    validateFile,
    clearValidation,
  };
}