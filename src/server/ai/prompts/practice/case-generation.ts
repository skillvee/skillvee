interface SkillRequirement {
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
}

interface CaseGenerationContext {
  jobTitle: string;
  company?: string;
  experience?: string;
  skillRequirements: SkillRequirement[];
}

/**
 * Creates a prompt for generating interview case questions with detailed skill level context
 */
export function createCaseGenerationPrompt(context: CaseGenerationContext): string {
  // Build skill descriptions with full level context
  const skillDescriptions = context.skillRequirements.map(sr => {
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

  return `You are creating a technical interview case for a ${context.jobTitle}${context.company ? ` position at ${context.company}` : ''}${context.experience ? ` (${context.experience} experience)` : ''}.

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
1. Base the scenario on the given company, role, experience level (${context.experience || 'mid-level'}), and team context.
   - If no company is provided, invent a realistic but generic technology company. Do not reuse real company names.
   - Adjust the complexity and expectations based on the experience level (${context.experience || 'not specified'})
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
   - Questions should use the data and information provided in the context of the case to create a realistic scenario.
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

## Output Format
  - Return only one JSON object (no extra text, no Markdown outside strings).
  - Any Markdown (including Markdown tables) must appear inside string values and be escaped/newline-encoded so the JSON remains valid. Example within a string: "| col1 | col2 |\n|------|------|\n| A | B |".
  - context must contain 2–3 paragraphs, each 120–220 words. Paragraphs are plain text strings (may include escaped Markdown tables).
  - Questions must be an object where every question is an independent JSON object keyed by a unique identifier (e.g., "q1", "q2"). This ensures each question is its own {}.
  - Each question object must contain exactly the fields shown below.
  - There must be at least one question object.

Sample output:
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
- Use the exact **skillId** and **name** from the provided skills list.
- Format for each entry: **"<skillId> - <Exact Skill Name>"**.
- Do **not** invent skills or modify names.
- If a required skill is missing from the input, **exclude it** (do not guess).`;
}

// Export the interface for use in other files
export type { SkillRequirement };