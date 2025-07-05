import { GoogleGenAI, Type } from "@google/genai";
import { env } from "~/env";

/**
 * Initialize Gemini AI client
 */
const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });

/**
 * JSON Schema for job description parsing
 */
const jobDescriptionParseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Extracted job title/position name",
    },
    company: {
      type: Type.STRING,
      description: "Company name if mentioned",
    },
    difficulty: {
      type: Type.STRING,
      description: "Experience level: JUNIOR, MEDIUM, or SENIOR",
    },
    requirements: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "List of key requirements, skills, and qualifications",
    },
    focusAreas: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Technical focus areas like Machine Learning, SQL, Python Programming",
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
          items: {
            type: Type.STRING,
          },
          description: "Main job responsibilities",
        },
        requiredSkills: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: "Must-have skills and technologies",
        },
        preferredSkills: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: "Nice-to-have skills and technologies",
        },
        experienceLevel: {
          type: Type.STRING,
          description: "Experience level description",
        },
        location: {
          type: Type.STRING,
          description: "Work location if mentioned",
        },
        employmentType: {
          type: Type.STRING,
          description: "Employment type if mentioned",
        },
      },
      description: "Additional extracted information",
    },
  },
  required: ["requirements", "focusAreas"],
};

/**
 * Parse job description using Gemini 2.5 Flash
 */
export async function parseJobDescriptionWithGemini(description: string) {
  try {
    const prompt = `
Analyze the following job description and extract structured information. Focus on accuracy and be conservative - only extract information that is clearly stated or strongly implied.

Key instructions:
- Extract job title, company name, and experience level
- Identify all technical requirements and skills mentioned
- Categorize skills into focus areas using standard tech domains
- Distinguish between required vs preferred skills
- Determine difficulty level based on experience requirements and complexity

Job Description:
${description}

Please parse this job description and return the structured data.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: jobDescriptionParseSchema,
        temperature: 0.1, // Low temperature for consistent parsing
      },
    });
    
    // Parse the JSON response
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }
    const parsedData: unknown = JSON.parse(responseText);
    
    return {
      success: true,
      data: parsedData as { title?: string; company?: string; difficulty?: "JUNIOR" | "MEDIUM" | "SENIOR"; requirements?: string[]; focusAreas?: string[]; extractedInfo?: { summary?: string; location?: string; employmentType?: string; salary?: string; benefits?: string[] } },
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Fallback error response
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse job description",
      data: {
        title: undefined,
        company: undefined,
        difficulty: undefined,
        requirements: [],
        focusAreas: [],
        extractedInfo: undefined,
      },
    };
  }
}

/**
 * Generate focus area suggestions using Gemini
 */
export async function generateFocusAreaSuggestions(
  description: string,
  requirements: string[]
): Promise<string[]> {
  try {
    const prompt = `
Based on this job description and requirements, suggest relevant technical focus areas for an interview.

Job Description: ${description}

Requirements: ${requirements.join(", ")}

Common focus areas include: Machine Learning, Data Analysis, Statistics, Python Programming, SQL, Data Visualization, Deep Learning, Natural Language Processing, Computer Vision, Big Data, Cloud Computing, A/B Testing, Business Intelligence, Data Engineering, MLOps, Product Sense, Problem Solving, System Design.

Return 5-8 most relevant focus areas.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focusAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "List of technical focus areas",
            },
          },
          required: ["focusAreas"],
        },
        temperature: 0.2,
      },
    });
    
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }
    const parsedData: unknown = JSON.parse(responseText);
    return (parsedData as { focusAreas?: string[] }).focusAreas ?? [];
  } catch (error) {
    console.error("Focus area generation error:", error);
    return [];
  }
}