import { Type } from "@google/genai";

/**
 * Schema for job analysis response
 */
export const jobAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Job title/position name",
    },
    company: {
      type: Type.STRING,
      description: "Company name (use common name like 'Meta' not 'Meta Platforms, Inc.')",
    },
    team: {
      type: Type.STRING,
      description: "Team/department name (e.g., 'Data Science', 'Engineering')",
    },
    experience: {
      type: Type.STRING,
      description: "Experience range (e.g., '0-2 years', '3-5 years', '5+ years')",
    },
    difficulty: {
      type: Type.STRING,
      description: "Difficulty level: EASY, MEDIUM, HARD, JUNIOR, or SENIOR",
      enum: ["EASY", "MEDIUM", "HARD", "JUNIOR", "SENIOR"],
    },
    archetypeId: {
      type: Type.NUMBER,
      description: "Simple archetype ID (1-6)",
    },
    archetypeConfidence: {
      type: Type.NUMBER,
      description: "Confidence score 0-1 for archetype match",
    },
    extractedInfo: {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: "Brief summary of the role",
        },
        keyResponsibilities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Main responsibilities",
        },
        requiredSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Required technical skills",
        },
        preferredSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Nice-to-have skills",
        },
      },
    },
    requirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key requirements from the job description",
    },
    focusAreas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
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
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Brief case title",
    },
    context: {
      type: Type.STRING,
      description: "Detailed business scenario with context",
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: {
            type: Type.STRING,
            description: "The main question",
          },
          questionContext: {
            type: Type.STRING,
            description: "Additional context for the question",
          },
          evaluatesSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Skills being evaluated by this question",
          },
          followUps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
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