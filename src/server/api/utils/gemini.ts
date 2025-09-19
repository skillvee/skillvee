import { GoogleGenAI, Type } from "@google/genai";
import { env } from "~/env";

/**
 * Initialize Gemini AI client
 */
const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });

/**
 * Simplified JSON Schema for fast job description analysis
 */
const practiceJobAnalysisSchema = {
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
    },
    archetypeMatch: {
      type: Type.OBJECT,
      properties: {
        bestMatch: {
          type: Type.STRING,
          description: "Best matching role archetype from the list",
        },
        confidence: {
          type: Type.NUMBER,
          description: "Confidence score 0-1",
        },
      },
      description: "Role archetype matching",
    },
  },
  required: ["title", "archetypeMatch"],
};

/**
 * Analyze job description for practice sessions using Gemini 2.5 Flash
 */
export async function analyzePracticeJobDescription(
  description: string,
  availableArchetypes: string[] = []
) {
  const startTime = performance.now();
  console.log(`[Gemini] Starting job description analysis at ${new Date().toISOString()}`);
  
  try {
    const archetypeList = availableArchetypes.length > 0 
      ? `\n\nAvailable Role Archetypes to match against:\n${availableArchetypes.map(a => `- ${a}`).join('\n')}`
      : '';

    const prompt = `Extract key information from this job description for a data science interview session.

REQUIRED FORMAT:
- Company: Use brand names (Meta not Meta Platforms Inc)
- Experience: Use ranges (0-2 years, 3-5 years, 5+ years)
- Team: Use title case (Data Science, Machine Learning)

ARCHETYPE MATCHING:
- Only match data science/ML/analytics roles
- Return "Other" for non-data science jobs (software eng, marketing, etc.)
- Use confidence 0.1 for non-data roles, 0.7+ for data roles

Job Description: ${description}${archetypeList}

Return structured JSON with title, company, team, experience, difficulty, and archetypeMatch.`;

    console.log(`[Gemini] Prompt prepared, length: ${prompt.length} chars`);
    console.log(`[Gemini] Making API request to Gemini 2.5 Flash`);
    console.log(`[Gemini] Using API key prefix: ${env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 10)}...`);
    
    const apiStartTime = performance.now();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: practiceJobAnalysisSchema,
        temperature: 0.05, // Very low for consistent extraction
        maxOutputTokens: 1000, // Allow sufficient space for JSON response
      },
    });
    
    const apiEndTime = performance.now();
    console.log(`[Gemini] API response received in ${(apiEndTime - apiStartTime).toFixed(2)}ms`);
    console.log(`[Gemini] Raw response object:`, response);
    console.log(`[Gemini] Response.text exists:`, !!response.text);
    console.log(`[Gemini] Response.text type:`, typeof response.text);
    console.log(`[Gemini] Response candidates:`, response.candidates);
    console.log(`[Gemini] First candidate:`, response.candidates?.[0]);
    console.log(`[Gemini] First candidate content:`, response.candidates?.[0]?.content);
    
    // Parse the JSON response - try different access patterns
    let responseText = response.text;
    if (!responseText && response.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
      console.log(`[Gemini] Using candidates path for text:`, responseText);
    }
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }
    
    console.log(`[Gemini] Parsing response text, length: ${responseText.length} chars`);
    const parseStartTime = performance.now();
    const parsedData: unknown = JSON.parse(responseText);
    const parseEndTime = performance.now();
    console.log(`[Gemini] JSON parsed in ${(parseEndTime - parseStartTime).toFixed(2)}ms`);
    
    const totalTime = performance.now() - startTime;
    console.log(`[Gemini] Total analysis completed in ${totalTime.toFixed(2)}ms`);
    console.log(`[Gemini] Response data:`, JSON.stringify(parsedData, null, 2));
    
    return {
      success: true,
      data: parsedData as { 
        title?: string; 
        company?: string; 
        team?: string;
        experience?: string;
        difficulty?: "EASY" | "MEDIUM" | "HARD" | "JUNIOR" | "SENIOR"; 
        archetypeMatch?: {
          bestMatch?: string;
          confidence?: number;
          reasoning?: string;
        };
        requirements?: string[]; 
        focusAreas?: string[]; 
        extractedInfo?: { 
          summary?: string; 
          location?: string; 
          employmentType?: string; 
          keyResponsibilities?: string[];
          requiredSkills?: string[];
          preferredSkills?: string[];
          experienceLevel?: string;
        } 
      },
    };
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`[Gemini] Error after ${totalTime.toFixed(2)}ms:`, error);
    
    // Fallback error response
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze job description",
      data: {
        title: undefined,
        company: undefined,
        team: undefined,
        experience: undefined,
        difficulty: undefined,
        archetypeMatch: undefined,
        requirements: [],
        focusAreas: [],
        extractedInfo: undefined,
      },
    };
  }
}

/**
 * Create practice session data for role selection (without job description)
 */
export function createRoleSelectionSessionData(selectedRole: string) {
  return {
    success: true,
    data: {
      title: selectedRole,
      company: undefined,
      team: undefined,
      experience: undefined,
      difficulty: "MEDIUM" as const,
      archetypeMatch: undefined,
      requirements: [],
      focusAreas: getDefaultFocusAreasForRole(selectedRole),
      extractedInfo: {
        summary: `Practice interview session for ${selectedRole} position`,
        location: undefined,
        employmentType: undefined,
        keyResponsibilities: [],
        requiredSkills: [],
        preferredSkills: [],
        experienceLevel: undefined,
      },
    },
  };
}

/**
 * Get default focus areas based on selected role
 */
function getDefaultFocusAreasForRole(role: string): string[] {
  const roleKeywords = role.toLowerCase();
  
  if (roleKeywords.includes('data analyst')) {
    return ['Data Analysis', 'SQL', 'Statistics', 'Data Visualization'];
  } else if (roleKeywords.includes('machine learning') || roleKeywords.includes('ml')) {
    return ['Machine Learning', 'Python Programming', 'Statistics', 'Deep Learning'];
  } else if (roleKeywords.includes('data engineer')) {
    return ['Data Engineering', 'SQL', 'Python Programming', 'Big Data', 'Cloud Computing'];
  } else if (roleKeywords.includes('analytics engineer')) {
    return ['Data Analysis', 'SQL', 'Data Engineering', 'Business Intelligence'];
  } else if (roleKeywords.includes('quantitative')) {
    return ['Statistics', 'Python Programming', 'Machine Learning', 'A/B Testing'];
  } else if (roleKeywords.includes('ai') || roleKeywords.includes('deep learning')) {
    return ['Deep Learning', 'Machine Learning', 'Python Programming', 'Computer Vision', 'Natural Language Processing'];
  } else {
    // Default for any data science role
    return ['Data Analysis', 'Python Programming', 'SQL', 'Machine Learning', 'Statistics'];
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