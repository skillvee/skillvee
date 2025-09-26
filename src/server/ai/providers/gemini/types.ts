import { SchemaType } from "@google/generative-ai";

/**
 * Schema for job analysis response
 */
export const jobAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "Job title/position name",
    },
    company: {
      type: SchemaType.STRING,
      description: "Company name (use common name like 'Meta' not 'Meta Platforms, Inc.')",
    },
    team: {
      type: SchemaType.STRING,
      description: "Team/department name (e.g., 'Data Science', 'Engineering')",
    },
    experience: {
      type: SchemaType.STRING,
      description: "Experience range (e.g., '0-2 years', '3-5 years', '5+ years')",
    },
    difficulty: {
      type: SchemaType.STRING,
      description: "Difficulty level: EASY, MEDIUM, HARD, JUNIOR, or SENIOR",
      enum: ["EASY", "MEDIUM", "HARD", "JUNIOR", "SENIOR"],
    },
    archetypeId: {
      type: SchemaType.NUMBER,
      description: "Simple archetype ID (1-6)",
    },
    archetypeConfidence: {
      type: SchemaType.NUMBER,
      description: "Confidence score 0-1 for archetype match",
    },
    extractedInfo: {
      type: SchemaType.OBJECT,
      properties: {
        summary: {
          type: SchemaType.STRING,
          description: "Brief summary of the role",
        },
        keyResponsibilities: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Main responsibilities",
        },
        requiredSkills: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Required technical skills",
        },
        preferredSkills: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Nice-to-have skills",
        },
      },
    },
    requirements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Key requirements from the job description",
    },
    focusAreas: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Primary technical focus areas for the interview",
    },
  },
  required: ["title", "archetypeId", "archetypeConfidence", "difficulty"],
};

export interface JobAnalysisResponse {
  title: string;
  company?: string;
  team?: string;
  experience?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "JUNIOR" | "SENIOR";
  archetypeId: number;
  archetypeConfidence: number;
  extractedInfo?: {
    summary?: string;
    keyResponsibilities?: string[];
    requiredSkills?: string[];
    preferredSkills?: string[];
  };
  requirements?: string[];
  focusAreas?: string[];
}

/**
 * Schema for case generation response
 */
export const caseGenerationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "Brief case title",
    },
    context: {
      type: SchemaType.STRING,
      description: "Detailed business scenario with context",
    },
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questionText: {
            type: SchemaType.STRING,
            description: "The main question",
          },
          questionContext: {
            type: SchemaType.STRING,
            description: "Additional context for the question",
          },
          evaluatesSkills: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Skills being evaluated by this question",
          },
          followUps: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Follow-up questions",
          },
        },
        required: ["questionText", "evaluatesSkills", "followUps"],
      },
      description: "Array of interview questions",
    },
  },
  required: ["title", "context", "questions"],
};

export interface CaseGenerationResponse {
  title: string;
  context: string;
  questions: Array<{
    questionText: string;
    questionContext?: string;
    evaluatesSkills: string[];
    followUps: string[];
  }>;
}