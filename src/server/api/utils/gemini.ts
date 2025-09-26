import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { env } from "~/env";
import { geminiLogStore } from "./log-store";
import { geminiDbLogger } from "./gemini-db-logger";

/**
 * Initialize Gemini AI client
 */
const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);

/**
 * Analyze job description for practice sessions using Gemini 2.5 Flash
 */
export async function analyzePracticeJobDescription(
  description: string,
  availableArchetypes: string[] = [],
  userId?: string,
  sessionId?: string
) {
  const startTime = performance.now();
  console.log(`[Gemini] Starting job description analysis at ${new Date().toISOString()}`);
  
  // Initialize database logging
  let dbLogId: string | undefined;
  
  try {
    const archetypeList = availableArchetypes.length > 0 
      ? `\n\nAvailable Role Archetypes to match against:\n${availableArchetypes.map(a => `- ${a}`).join('\n')}`
      : '';

    const prompt = `Extract information from the job description and return it in this EXACT JSON structure:

{
  "title": "Job title here",
  "company": "Company name here (use brand name like 'Meta' not 'Meta Platforms, Inc.')",
  "team": "Team/department name here or 'Not specified' if not mentioned",
  "experience": "Use one of: '0-2 years', '3-5 years', '5+ years', or 'Not specified'",
  "archetype": "Choose from the archetypes list below"
}
${archetypeList}

JOB DESCRIPTION STARTS HERE:
${description}
JOB DESCRIPTION ENDS HERE

Return ONLY the JSON object with these 5 fields. Do not add any other fields or text.`;

    console.log(`[Gemini] Prompt prepared, length: ${prompt.length} chars`);
    console.log(`[Gemini] Making API request to Gemini 2.5 Flash`);
    console.log(`[Gemini] Using API key prefix: ${env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 10)}...`);
    
    // Log request to database
    dbLogId = await geminiDbLogger.logRequest({
      userId,
      sessionId,
      endpoint: "analyzeJobDescription",
      prompt,
      modelUsed: "gemini-2.0-flash",
      metadata: {
        descriptionLength: description.length,
        archetypeCount: availableArchetypes.length,
      },
    });
    
    const apiStartTime = performance.now();
    
    // Use simpler approach without schema validation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 500, // Reduced since we only need 5 fields
      },
    });
    const response = await model.generateContent(prompt);
    
    const apiEndTime = performance.now();
    console.log(`[Gemini] API response received in ${(apiEndTime - apiStartTime).toFixed(2)}ms`);
    console.log(`[Gemini] Raw response object:`, response);
    console.log(`[Gemini] Response object:`, Object.keys(response));
    console.log(`[Gemini] Response.response exists:`, !!response.response);
    
    // Parse the JSON response - Google AI SDK uses response.text() directly
    let responseText: string | undefined;

    // Try response.text() first (standard Google AI SDK method)
    if (response.text) {
      responseText = typeof response.text === 'function' ? response.text() : response.text;
      console.log(`[Gemini] Using response.text() method`);
    }
    // Try response.response.text() as fallback
    else if (response.response?.text) {
      responseText = typeof response.response.text === 'function' ? response.response.text() : response.response.text;
      console.log(`[Gemini] Using response.response.text() path`);
    }
    // Try candidates path as last resort
    else if (response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.response.candidates[0].content.parts[0].text;
      console.log(`[Gemini] Using candidates path for text`);
    }

    if (!responseText) {
      console.error('[Gemini] Failed to extract text from response:', response);
      throw new Error("Empty response from Gemini API");
    }
    
    console.log(`[Gemini] Response text:`, responseText);
    console.log(`[Gemini] Parsing response text, length: ${responseText.length} chars`);
    const parseStartTime = performance.now();
    const parsedData: unknown = JSON.parse(responseText);
    const parseEndTime = performance.now();
    console.log(`[Gemini] JSON parsed in ${(parseEndTime - parseStartTime).toFixed(2)}ms`);

    const totalTime = performance.now() - startTime;
    console.log(`[Gemini] Total analysis completed in ${totalTime.toFixed(2)}ms`);
    console.log(`[Gemini] Parsed data:`, JSON.stringify(parsedData, null, 2));
    
    // Log successful response to database
    if (dbLogId) {
      const responseData = parsedData as any;
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        response: responseData,
        responseTime: Math.round(totalTime),
        success: true,
      });
    }
    
    // Transform the simplified response to match expected format
    const responseData = parsedData as {
      title?: string;
      company?: string;
      team?: string;
      experience?: string;
      archetype?: string;
    };

    const result = {
      success: true,
      data: {
        title: responseData.title,
        company: responseData.company,
        team: responseData.team,
        experience: responseData.experience,
        // Map archetype to archetypeMatch for backward compatibility
        archetypeMatch: responseData.archetype ? {
          bestMatch: responseData.archetype,
          confidence: 0.8,
          reasoning: "Matched from job description"
        } : undefined,
        // These fields are no longer extracted by AI - will be populated from database
        difficulty: "MEDIUM" as const,
        requirements: [],
        focusAreas: [],
        extractedInfo: undefined,
      },
    };

    console.log(`[Gemini] Returning result:`, JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`[Gemini] Error after ${totalTime.toFixed(2)}ms:`, error);
    
    // Log error to database
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        responseTime: Math.round(totalTime),
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
    
    // Fallback error response
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze job description",
      data: {
        title: undefined,
        company: undefined,
        team: undefined,
        experience: undefined,
        difficulty: "MEDIUM" as const,
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
 * Generate interview case based on selected skills
 */
export async function generateCaseWithGemini(params: {
  jobTitle: string;
  company?: string;
  experience?: string;
  userId?: string;
  sessionId?: string;
  skillRequirements: Array<{
    skillId: string;
    skillName: string;
    targetProficiency: number;
    observableBehaviors: Array<{
      level: number;
      description: string;
      generalDescription?: string;
      exampleResponses?: string;
      commonMistakes?: string;
    }>;
  }>;
}) {
  const { jobTitle, company, experience, userId, sessionId, skillRequirements } = params;
  
  // Initialize database logging
  let dbLogId: string | undefined;
  const startTime = Date.now();

  try {
    // Build skill descriptions for the prompt
    const skillDescriptions = skillRequirements.map(sr => {
      const levelDetails = sr.observableBehaviors
        .map(b => {
          let levelInfo = `  Level ${b.level}:`;
          levelInfo += `\n    Observable Behavior: ${b.description}`;

          if (b.generalDescription) {
            levelInfo += `\n    General Description: ${b.generalDescription}`;
          }
          if (b.exampleResponses) {
            levelInfo += `\n    Example Responses: ${b.exampleResponses}`;
          }
          if (b.commonMistakes) {
            levelInfo += `\n    Common Mistakes: ${b.commonMistakes}`;
          }

          return levelInfo;
        })
        .join('\n\n');

      return `${sr.skillName} (TARGET: Level ${sr.targetProficiency} - ${['', 'Aware', 'Competent', 'Proficient'][sr.targetProficiency] || 'Unknown'}):
${levelDetails || '  - General proficiency expected'}

  **Note**: Focus questions on Level ${sr.targetProficiency}, but use all levels to understand progression.`;
    }).join('\n\n');

    const prompt = `You are creating a technical interview case for a ${jobTitle}${company ? ` position at ${company}` : ''}${experience ? ` (${experience} experience)` : ''}.

## Skills to Evaluate
- Use the provided skills and proficiency levels exactly as given below. Do not invent, rename, merge, or split skills.
- **IMPORTANT**: All three levels (1, 2, 3) are provided for each skill to give you complete context about the progression, but focus on the TARGET PROFICIENCY LEVEL specified for each skill.
- Pay special attention to the general descriptions, example responses, and common mistakes for each level to create questions that effectively discriminate between proficiency levels.
- Design questions that allow candidates to demonstrate the specific behaviors for their target proficiency level while revealing if they are actually at a lower or higher level.
- Use Level 1 descriptions to understand what basic/inadequate performance looks like
- Use Level 2 descriptions to understand what competent/expected performance looks like
- Use Level 3 descriptions to understand what advanced/exceptional performance looks like
${skillDescriptions}


## Main Case Requirements
1. Base the scenario on the given company, role, experience level (${experience || 'mid-level'}), and team context.
   - If no company is provided, invent a realistic but generic technology company. Do not reuse real company names.
   - Adjust the complexity and expectations based on the experience level (${experience || 'not specified'})
2. Create a detailed business scenario **relevant to the industry and position**.
3. Include realistic **datasets, tools, or resources** that the candidate would use.
   - Provide sample data **schemas** and **5–10 example rows** if relevant. Use Markdown tables inside strings.
4. Make the scenario detailed enough to support 3–5 diverse questions.
5. The case should be **authentic and practical** for the target role.

---

## Question Requirements (each item in "questions")
1. Provide a **specific sub-context** tied to the main scenario.
2. Write a **clear, challenging question** that demonstrates **1–3 skills** at the specified target proficiency level.
   - Questions should be designed to distinguish between levels (e.g., a Level 2 question should reveal if someone is at Level 1, 2, or 3)
   - Use the example responses and common mistakes to calibrate difficulty appropriately
3. Tag with the **exact skill numIds and names** from the provided list (see Tagging Rules below).
4. Each question must be answerable in **5–10 minutes**.
5. Include **2–4 follow-up questions** that probe different aspects (edge cases, tradeoffs, scaling, communication).
   - Follow-ups should help identify if the candidate exceeds or falls short of the target proficiency
6. Vary question types across:
   - Technical implementation (e.g., coding, SQL),
   - Analysis & interpretation,
   - System/design thinking,
   - Communication & justification.
7. Progressively **increase complexity** across the sequence.
8. For technical prompts (e.g., SQL), include enough **context + sample data** so a solution is feasible.

---

## Output Format — Return ONLY valid JSON (no Markdown outside strings)
Return **only** a JSON object in exactly this structure (no extra keys, no missing keys, no comments):

{
  "title": "Brief case title (e.g., 'Customer Churn Prediction Pipeline')",
  "context": "2–3 paragraphs (each 120–220 words) describing the detailed business scenario. Include dataset schemas and 5–10 sample rows per table as Markdown tables if useful.",
  "questions": [
    {
      "questionText": "Clear, specific question that tests the skills",
      "questionContext": "Optional additional context for this question. Keep under 120 words.",
      "evaluatesSkills": ["<skillNumId> - <Exact Skill Name>", "<skillNumId> - <Exact Skill Name>"],
      "followUps": [
        "Follow-up question 1",
        "Follow-up question 2",
        "Follow-up question 3"
      ]
    }
  ]
}

---

## Global Constraints
- Generate **3–5 questions** total.
- Each question must test **1–3 skills**.
- Questions should **logically build on each other** when appropriate.
- Follow-ups must probe **different dimensions** (performance, correctness, design, tradeoffs, communication).
- Ensure the JSON is **well-formed** and contains **no text before or after** the JSON.
- Do **not** include code blocks, backticks, headings, or explanations outside the JSON.

---

## Tagging Rules for "evaluatesSkills"
- Use the exact **numId** and **name** from the provided skills list.
- Format for each entry: **"<numId> - <Exact Skill Name>"**.
- Do **not** invent skills or modify names.
- If a required skill is missing from the input, **exclude it** (do not guess).

---

## Example (do not copy; follow structure and style)
{
  "title": "Group Video Chat Feature Analysis",
  "context": "You are working as a Data Scientist at Meta. You're analyzing one of the platform's core features - the **one-on-one video calling** system that connects billions of users worldwide through Facebook Messenger. The feature has been a cornerstone of Meta's communication tools for years, enabling friends and family to have face-to-face conversations regardless of physical distance. To help inform strategic decisions about the feature's evolution, you have access to two comprehensive datasets:\\n\\n### Table: \`video_calls\`\\n\\n| Column           | Description                         |\\n|-----------------|-------------------------------------|\\n| caller          | User ID initiating the call         |\\n| recipient       | User ID receiving the call          |\\n| ds              | Date of the call                    |\\n| call_id         | Unique call identifier              |\\n| duration_seconds| Length of the call in seconds       |\\n\\nHere is some example data:\\n\\n| caller | recipient | ds         | call_id | duration_seconds |\\n|--------|-----------|------------|---------|------------------|\\n| 458921 | 672104    | 2023-01-01 | v8k2p9  | 183             |\\n| 458921 | 891345    | 2023-01-01 | m4n7v2  | 472             |\\n| 672104 | 234567    | 2023-01-02 | x9h5j4  | 256             |\\n| 891345 | 345678    | 2023-01-02 | q2w3e4  | 67              |\\n| 345678 | 891345    | 2023-01-03 | t7y8u9  | 124             |\\n| 234567 | 458921    | 2023-01-03 | p3l5k8  | 538             |\\n\\n### Table: \`daily_active_users\`\\n\\n| Column           | Description                               |\\n|-----------------|-------------------------------------------|\\n| user_id         | Unique identifier for the user            |\\n| ds              | Date the user was active/logged in        |\\n| country         | User's country                            |\\n| daily_active_flag| Indicates if user was active that day (1) |\\n\\nBelow you can see an example data:\\n\\n| user_id | ds         | country | daily_active_flag |\\n|---------|-----------|---------|--------------------|\\n| 458921  | 2023-01-01| France  | 1                 |\\n| 672104  | 2023-01-01| France  | 1                 |\\n| 891345  | 2023-01-01| Spain   | 1                 |\\n| 234567  | 2023-01-02| France  | 1                 |\\n| 345678  | 2023-01-02| France  | 1                 |\\n| 458921  | 2023-01-03| France  | 1                 |\\n\\nThe company is considering launching a **group video chat** feature. You'll be using these tables for analysis on user behavior, potential demand, and how to measure success.",
  "questions": [
    {
      "questionText": "Write an SQL query to find the top 5 users by total call duration in January 2023.",
      "questionContext": "Focus on calls longer than 60 seconds.",
      "evaluatesSkills": ["101 - Databases & SQL"],
      "followUps": [
        "How would you optimize this query for a billion-row table?",
        "How could you adapt this query for weekly cohorts?",
        "What indexing strategy might you use?"
      ]
    }
  ]
}
`;

    // Log the full prompt being sent to Gemini
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[Gemini Case Generation] ${new Date().toISOString()}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`[Job Title]: ${jobTitle}`);
    console.log(`[Company]: ${company || 'Not specified'}`);
    console.log(`[Experience]: ${experience || 'Not specified'}`);
    console.log(`[Skills Count]: ${skillRequirements.length}`);
    console.log(`[Skills]: ${skillRequirements.map(s => `${s.skillName} (Level ${s.targetProficiency})`).join(', ')}`);
    console.log(`\n[Full Prompt Sent to Gemini]:`);
    console.log(`${'- '.repeat(40)}`);
    console.log(prompt);
    console.log(`${'- '.repeat(40)}`);
    console.log(`[Prompt Length]: ${prompt.length} characters`);
    console.log(`${'='.repeat(80)}\n`);
    
    // Log request to database
    dbLogId = await geminiDbLogger.logRequest({
      userId,
      sessionId,
      endpoint: "generateCase",
      prompt,
      jobTitle,
      company,
      skills: skillRequirements.map(s => `${s.skillName} (Level ${s.targetProficiency})`),
      modelUsed: "gemini-2.0-flash",
      metadata: {
        experience: experience || 'Not specified',
        skillDetails: skillRequirements,
      },
    });

    // Store log in memory
    geminiLogStore.addLog({
      type: 'REQUEST',
      userId,
      sessionId,
      jobTitle,
      company: company || undefined,
      skills: skillRequirements.map(s => `${s.skillName} (Level ${s.targetProficiency})`),
      prompt,
      promptLength: prompt.length,
      metadata: {
        experience: experience || 'Not specified',
        skillDetails: skillRequirements,
      },
    });

    console.log(`[Gemini] Generating case for ${jobTitle} with ${skillRequirements.length} skills`);
    const startTime = Date.now();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 4000,
      },
    });
    const response = await model.generateContent(prompt);

    // Parse response
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

    const parsedCase = JSON.parse(responseText);

    const responseTime = Date.now() - startTime;

    // Log the response from Gemini
    console.log(`\n[Gemini Response Received]:`);
    console.log(`${'- '.repeat(40)}`);
    console.log(JSON.stringify(parsedCase, null, 2));
    console.log(`${'- '.repeat(40)}`);
    console.log(`[Response Summary]:`);
    console.log(`  - Case Title: ${parsedCase.title}`);
    console.log(`  - Context Length: ${parsedCase.context?.length || 0} characters`);
    console.log(`  - Questions Count: ${parsedCase.questions?.length || 0}`);

    if (parsedCase.questions) {
      parsedCase.questions.forEach((q: any, idx: number) => {
        console.log(`  - Question ${idx + 1}: Evaluates ${q.evaluatesSkills?.length || 0} skills, ${q.followUps?.length || 0} follow-ups`);
      });
    }
    
    // Log successful response to database
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        response: parsedCase,
        responseTime,
        success: true,
      });
    }

    // Store response log
    geminiLogStore.addLog({
      type: 'RESPONSE',
      userId,
      sessionId,
      jobTitle,
      company: company || undefined,
      skills: skillRequirements.map(s => `${s.skillName} (Level ${s.targetProficiency})`),
      response: parsedCase,
      responseTime,
      metadata: {
        caseTitle: parsedCase.title,
        questionsCount: parsedCase.questions?.length || 0,
        contextLength: parsedCase.context?.length || 0,
      },
    });

    // Map skill names to IDs in the evaluatesSkills arrays
    if (parsedCase.questions) {
      parsedCase.questions = parsedCase.questions.map((q: any) => {
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

    console.log(`[Gemini] Successfully generated case with ${parsedCase.questions?.length || 0} questions`);
    console.log(`${'='.repeat(80)}\n`);

    return parsedCase;
  } catch (error) {
    console.error(`\n${'='.repeat(80)}`);
    console.error('[Gemini Case Generation ERROR]');
    console.error(`${'='.repeat(80)}`);
    console.error('[Error Details]:', error);
    console.error(`[Job Title]: ${jobTitle}`);
    console.error(`[Company]: ${company || 'Not specified'}`);
    console.error(`[Skills]: ${skillRequirements.map(s => `${s.skillName} (Level ${s.targetProficiency})`).join(', ')}`);
    console.error(`${'='.repeat(80)}\n`);
    
    // Log error to database
    if (dbLogId) {
      await geminiDbLogger.logResponse({
        logId: dbLogId,
        responseTime: Date.now() - startTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    // Store error log
    geminiLogStore.addLog({
      type: 'ERROR',
      userId,
      sessionId,
      jobTitle,
      company: company || undefined,
      skills: skillRequirements.map(s => `${s.skillName} (Level ${s.targetProficiency})`),
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        errorStack: error instanceof Error ? error.stack : undefined,
        skillDetails: skillRequirements,
      },
    });

    // Return a fallback case structure
    return {
      title: `${jobTitle} Technical Assessment`,
      context: `You are being evaluated for a ${jobTitle} position${company ? ` at ${company}` : ''}. This assessment will test your proficiency in ${skillRequirements.map(s => s.skillName).join(', ')}.`,
      questions: skillRequirements.slice(0, 3).map((skill) => ({
        questionText: `Demonstrate your ${skill.skillName} skills by solving a relevant problem.`,
        questionContext: null,
        evaluatesSkills: [skill.skillId],
        followUps: [
          "Can you explain your approach?",
          "What alternatives did you consider?",
          "How would you optimize this solution?"
        ]
      }))
    };
  }
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