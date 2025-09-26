import { geminiClient, DEFAULT_MODEL_CONFIG } from "../providers/gemini/client";
import { caseGenerationSchema, type CaseGenerationResponse } from "../providers/gemini/types";
import { createCaseGenerationPrompt, type SkillRequirement } from "../prompts/practice/case-generation";
import { geminiDbLogger } from "../../api/utils/gemini-db-logger";

interface CaseGenerationParams {
  jobTitle: string;
  company?: string;
  experience?: string;
  userId?: string;
  sessionId?: string;
  skillRequirements: SkillRequirement[];
}

/**
 * Generates an interview case with AI using detailed skill level context
 */
export async function generateInterviewCase(
  params: CaseGenerationParams
): Promise<{ success: boolean; data?: CaseGenerationResponse; error?: string }> {
  const { jobTitle, company, experience, userId, sessionId, skillRequirements } = params;

  const startTime = performance.now();
  console.log(`[CaseGeneration] Starting case generation at ${new Date().toISOString()}`);
  console.log(`[CaseGeneration] Job: ${jobTitle} | Company: ${company || 'Not specified'} | Skills: ${skillRequirements.length}`);

  // Initialize database logging
  let dbLogId: string | undefined;

  try {
    // Create the enhanced prompt with skill level context
    const prompt = createCaseGenerationPrompt({
      jobTitle,
      company,
      experience,
      skillRequirements,
    });

    console.log(`[CaseGeneration] Prompt length: ${prompt.length} chars`);
    console.log(`[CaseGeneration] Using model: ${DEFAULT_MODEL_CONFIG.model}`);

    // Log request to database
    dbLogId = await geminiDbLogger.logRequest({
      userId,
      sessionId,
      endpoint: "generateCase",
      prompt,
      jobTitle,
      company,
      skills: skillRequirements.map(s => `${s.skillName} (Level ${s.targetProficiency})`),
      modelUsed: DEFAULT_MODEL_CONFIG.model,
      metadata: {
        experience: experience || 'Not specified',
        skillDetails: skillRequirements,
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
          responseSchema: caseGenerationSchema as any,
          temperature: 0.3, // Slightly higher for creative case generation
          maxOutputTokens: 4000, // More tokens for complex cases
        },
      });
      response = await model.generateContent(prompt);
    } catch (schemaError) {
      console.log(`[CaseGeneration] Schema validation failed, retrying without schema:`, schemaError);

      // Fallback without schema
      const model = geminiClient.getGenerativeModel({
        model: DEFAULT_MODEL_CONFIG.model,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        },
      });
      response = await model.generateContent(prompt);
    }

    const apiEndTime = performance.now();
    console.log(`[CaseGeneration] API response in ${(apiEndTime - apiStartTime).toFixed(2)}ms`);

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

    // Parse JSON response
    const parsedCase = JSON.parse(responseText) as CaseGenerationResponse;

    // Map skill names to IDs in the evaluatesSkills arrays
    if (parsedCase.questions) {
      parsedCase.questions = parsedCase.questions.map((q) => {
        // Convert skill names in evaluatesSkills to skill IDs
        if (q.evaluatesSkills && Array.isArray(q.evaluatesSkills)) {
          q.evaluatesSkills = q.evaluatesSkills.map((skillRef: string) => {
            // Find matching skill by name (case-insensitive)
            const matchingSkill = skillRequirements.find(
              sr => sr.skillName.toLowerCase() === skillRef.toLowerCase() ||
                    sr.skillId === skillRef
            );
            return matchingSkill ? matchingSkill.skillId : skillRef;
          });
        }
        return q;
      });
    }

    const totalTime = performance.now() - startTime;
    console.log(`[CaseGeneration] Completed in ${totalTime.toFixed(2)}ms`);
    console.log(`[CaseGeneration] Generated ${parsedCase.questions?.length || 0} questions`);

    // Log successful response
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        response: parsedCase,
        responseTime: Math.round(totalTime),
        success: true,
      });
    }

    return {
      success: true,
      data: parsedCase,
    };

  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`[CaseGeneration] Error after ${totalTime.toFixed(2)}ms:`, error);

    // Log error
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        responseTime: Math.round(totalTime),
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    // Return a fallback case structure
    const fallbackCase: CaseGenerationResponse = {
      title: `${jobTitle} Technical Assessment`,
      context: `You are being evaluated for a ${jobTitle} position${company ? ` at ${company}` : ''}. This assessment will test your proficiency in ${skillRequirements.map(s => s.skillName).join(', ')}.`,
      questions: skillRequirements.slice(0, 3).map((skill) => ({
        questionText: `Demonstrate your ${skill.skillName} skills by solving a relevant problem.`,
        questionContext: `This question evaluates your ${skill.skillName} abilities.`,
        evaluatesSkills: [skill.skillId],
        followUps: [
          "Can you explain your approach?",
          "What alternatives did you consider?",
          "How would you optimize this solution?"
        ]
      }))
    };

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate interview case",
      data: fallbackCase, // Provide fallback even on error
    };
  }
}