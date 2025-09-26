import { geminiClient, DEFAULT_MODEL_CONFIG } from "../providers/gemini/client";
import { focusAreaSchema, type FocusAreaResponse } from "../providers/gemini/types";
import { createFocusAreaPrompt } from "../prompts/practice/focus-areas";
import { geminiDbLogger } from "../../api/utils/gemini-db-logger";

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
  requirements: string[],
  userId?: string,
  sessionId?: string
): Promise<string[]> {
  const startTime = performance.now();
  console.log(`[FocusAreas] Starting generation at ${new Date().toISOString()}`);

  let dbLogId: string | undefined;

  try {
    const prompt = createFocusAreaPrompt(description, requirements);

    console.log(`[FocusAreas] Prompt length: ${prompt.length} chars`);
    console.log(`[FocusAreas] Using model: ${DEFAULT_MODEL_CONFIG.model}`);

    // Log request to database
    dbLogId = await geminiDbLogger.logRequest({
      userId,
      sessionId,
      endpoint: "generateFocusAreaSuggestions",
      prompt,
      modelUsed: DEFAULT_MODEL_CONFIG.model,
      metadata: {
        descriptionLength: description.length,
        requirementsCount: requirements.length,
      },
    });

    const apiStartTime = performance.now();

    // Try with schema validation first
    let response;
    try {
      const model = geminiClient.getGenerativeModel({
        model: DEFAULT_MODEL_CONFIG.model,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: focusAreaSchema as any,
          temperature: 0.2,
          maxOutputTokens: DEFAULT_MODEL_CONFIG.maxOutputTokens,
        },
      });
      response = await model.generateContent(prompt);
    } catch (schemaError) {
      console.log(`[FocusAreas] Schema validation failed, retrying without schema:`, schemaError);

      // Fallback without schema
      const model = geminiClient.getGenerativeModel({
        model: DEFAULT_MODEL_CONFIG.model,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: DEFAULT_MODEL_CONFIG.maxOutputTokens,
        },
      });
      response = await model.generateContent(prompt);
    }

    const apiEndTime = performance.now();
    console.log(`[FocusAreas] API response in ${(apiEndTime - apiStartTime).toFixed(2)}ms`);

    // Extract response text using the correct API
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
    const focusAreas = (parsedData as FocusAreaResponse).focusAreas ?? [];

    const totalTime = performance.now() - startTime;
    console.log(`[FocusAreas] Completed in ${totalTime.toFixed(2)}ms`);
    console.log(`[FocusAreas] Generated ${focusAreas.length} focus areas`);

    // Log successful response
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        response: { focusAreas },
        responseTime: Math.round(totalTime),
        success: true,
      });
    }

    return focusAreas;

  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`[FocusAreas] Error after ${totalTime.toFixed(2)}ms:`, error);

    // Log error
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        responseTime: Math.round(totalTime),
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    console.error("Focus area generation error:", error);
    return [];
  }
}