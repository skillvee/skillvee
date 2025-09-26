import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { env } from "~/env";

/**
 * Initialize Gemini AI client
 */
const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);

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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            focusAreas: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
              },
              description: "List of technical focus areas",
            },
          },
          required: ["focusAreas"],
        },
        temperature: 0.2,
      },
    });
    const response = await model.generateContent(prompt);

    let responseText: string | undefined;

    // Try response.text() method first (standard API)
    if ((response as any).text) {
      responseText = typeof (response as any).text === 'function' ? (response as any).text() : (response as any).text;
    }
    // Try response.response.text() (nested response)
    if (!responseText && (response as any).response?.text) {
      responseText = typeof (response as any).response.text === 'function' ? (response as any).response.text() : (response as any).response.text;
    }
    // Try candidates path as fallback
    if (!responseText && (response as any).response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = (response as any).response.candidates[0].content.parts[0].text;
    }
    // Try direct candidates path
    if (!responseText && (response as any).candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = (response as any).candidates[0].content.parts[0].text;
    }

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