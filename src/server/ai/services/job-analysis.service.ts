import { type RoleArchetype } from "@prisma/client";
import { geminiClient, DEFAULT_MODEL_CONFIG } from "../providers/gemini/client";
import { jobAnalysisSchema, type JobAnalysisResponse } from "../providers/gemini/types";
import { createJobAnalysisPrompt } from "../prompts/practice/job-analysis";
import { geminiDbLogger } from "../../api/utils/gemini-db-logger";

interface ArchetypeWithRoles extends RoleArchetype {
  roles: { title: string }[];
}

/**
 * Analyzes a job description and matches it to an archetype
 */
export async function analyzeJobDescription(
  description: string,
  archetypes: ArchetypeWithRoles[],
  userId?: string,
  sessionId?: string
): Promise<{ success: boolean; data?: JobAnalysisResponse; error?: string }> {
  const startTime = performance.now();
  console.log(`[JobAnalysis] Starting analysis at ${new Date().toISOString()}`);

  // Initialize database logging
  let dbLogId: string | undefined;

  try {
    // Prepare archetype data for the prompt
    const archetypeInfo = archetypes.map(a => ({
      id: a.id,
      simpleId: a.simpleId!,
      name: a.name,
      description: a.description,
      commonRoles: a.roles.map(r => r.title),
    }));

    // Create the prompt
    const prompt = createJobAnalysisPrompt(description, archetypeInfo);

    console.log(`[JobAnalysis] Prompt length: ${prompt.length} chars`);
    console.log(`[JobAnalysis] Using model: ${DEFAULT_MODEL_CONFIG.model}`);

    // Log request to database
    dbLogId = await geminiDbLogger.logRequest({
      userId,
      sessionId,
      endpoint: "analyzeJobDescription",
      prompt,
      modelUsed: DEFAULT_MODEL_CONFIG.model,
      metadata: {
        descriptionLength: description.length,
        archetypeCount: archetypes.length,
      },
    });

    const apiStartTime = performance.now();

    // Try with schema validation first
    let response;
    try {
      response = await geminiClient.models.generateContent({
        model: DEFAULT_MODEL_CONFIG.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: jobAnalysisSchema,
          temperature: DEFAULT_MODEL_CONFIG.temperature,
          maxOutputTokens: DEFAULT_MODEL_CONFIG.maxOutputTokens,
        },
      });
    } catch (schemaError) {
      console.log(`[JobAnalysis] Schema validation failed, retrying without schema:`, schemaError);

      // Fallback without schema
      response = await geminiClient.models.generateContent({
        model: DEFAULT_MODEL_CONFIG.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: DEFAULT_MODEL_CONFIG.temperature,
          maxOutputTokens: DEFAULT_MODEL_CONFIG.maxOutputTokens,
        },
      });
    }

    const apiEndTime = performance.now();
    console.log(`[JobAnalysis] API response in ${(apiEndTime - apiStartTime).toFixed(2)}ms`);

    // Extract response text
    let responseText = response.text;
    if (!responseText && response.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
    }

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    // Parse JSON response
    const parsedData = JSON.parse(responseText) as JobAnalysisResponse;

    const totalTime = performance.now() - startTime;
    console.log(`[JobAnalysis] Completed in ${totalTime.toFixed(2)}ms`);
    console.log(`[JobAnalysis] Matched archetype ${parsedData.archetypeId} with confidence ${parsedData.archetypeConfidence}`);

    // Log successful response
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        response: parsedData,
        responseTime: Math.round(totalTime),
        success: true,
      });
    }

    return {
      success: true,
      data: parsedData,
    };

  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`[JobAnalysis] Error after ${totalTime.toFixed(2)}ms:`, error);

    // Log error
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        responseTime: Math.round(totalTime),
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze job description",
    };
  }
}