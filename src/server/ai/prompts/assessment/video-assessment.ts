// src/server/ai/prompts/assessment/video-assessment.ts

import type { QuestionVideoAssessmentContext } from './types';

/**
 * Creates a prompt for analyzing a single interview question video
 *
 * Model: Gemini 2.0 Flash (multimodal)
 * Input: Video URL + question context + skill definitions
 * Output: Question-level feedback items + skill scores (1-3)
 */
export function createVideoAssessmentPrompt(context: QuestionVideoAssessmentContext): string {
  // Format skills to evaluate
  const skillsList = context.skillsToEvaluate
    .map(skill => `  - ${skill}`)
    .join('\n');

  // Format skill definitions with ALL level behaviors (provides complete context)
  const skillDefinitionsText = context.skillDefinitions
    .map(skill => {
      const levels = skill.levelBehaviors
        .map(behavior => `
  **Level ${behavior.level}: ${behavior.levelName}**

  General Description:
  ${behavior.generalDescription}

  Observable Behaviors:
  ${behavior.observableBehaviors}

  Example Responses:
  ${behavior.exampleResponses}

  Common Mistakes:
  ${behavior.commonMistakes}`)
        .join('\n');

      return `
### ${skill.skillName} (Domain: ${skill.domainName})
**Target Proficiency: Level ${skill.targetLevel}**

${levels}
`;
    })
    .join('\n---\n');

  // Format follow-up questions
  const followUpsText = context.followUpQuestions
    .map((q, i) => `  ${i + 1}. ${q}`)
    .join('\n');

  return `You are an expert technical interview assessor analyzing a recorded interview question. Your task is to evaluate the candidate's performance based on both their verbal communication (audio) and their on-screen work (visual).

## Interview Context

**Case:** ${context.caseTitle}

**Case Context:**
${context.caseContext}

**Question ${context.questionOrder + 1} of ${context.totalQuestions}:**
${context.questionText}

${context.questionContext ? `**Additional Question Context:**\n${context.questionContext}\n` : ''}

**Follow-up Questions Asked:**
${followUpsText}

---

## Skills Being Evaluated

This question tests the following skills. You MUST score ALL of these skills (even if not demonstrated).

${skillsList}

---

## Skill Level Definitions (1-3 Scale)

For each skill above, you have access to THREE levels of proficiency. These levels help you understand the full spectrum from basic to advanced performance. Pay close attention to the target level for each skill, but use all three levels to calibrate your assessment.

**How to use these definitions:**
- Level 1 shows what developing/basic performance looks like
- Level 2 shows what proficient/expected performance looks like
- Level 3 shows what advanced/exceptional performance looks like
- Use the Observable Behaviors to identify what level the candidate demonstrated
- Use Example Responses to see what good answers sound like at each level
- Use Common Mistakes to spot indicators of lower proficiency

${skillDefinitionsText}

---

## Your Task

Watch the entire video carefully, observing both:
1. **Audio**: What the candidate says, how they explain their thinking, communication clarity
2. **Visual**: What the candidate does on screen (code, queries, diagrams, etc.)

Then provide:

### 1. Feedback Items (1-3 of each type)
Identify specific moments that demonstrate strengths or areas for growth.

**For STRENGTH items:**
- Note the timestamp (MM:SS format) when this occurred
- Give it a short title (20-50 characters)
- Describe what the candidate did (100-300 characters)
- Explain why it worked well (100-300 characters)

**For GROWTH_AREA items:**
- Note the timestamp (MM:SS format) when this occurred
- Give it a short title (20-50 characters)
- Describe what the candidate did (100-300 characters)
- Explain what was missing (100-300 characters)
- Provide an actionable next step for improvement (100-300 characters)

### 2. Skill Scores (ALL skills must be scored)
For each skill in the "Skills Being Evaluated" list:
- Assign a level (1, 2, or 3) based on observed behavior compared to the level definitions
- If the skill was not demonstrated at all → Level 1
- Provide reasoning (100-200 characters) explaining why this level
- List 2-4 specific pieces of evidence from the video
- Reference the Observable Behaviors and Example Responses from the level definitions

---

## Output Format

Return ONLY valid JSON matching this exact schema. No markdown, no code blocks, no explanation outside the JSON.

{
  "questionId": "${context.questionId}",
  "feedbackItems": [
    {
      "feedbackType": "STRENGTH",
      "timestampDisplay": "2:15",
      "behaviorTitle": "Clear Problem Breakdown",
      "whatYouDid": "You systematically broke the problem into three clear components: data validation, transformation logic, and output formatting.",
      "whyItWorked": "This structured approach makes complex problems manageable and shows strong analytical thinking.",
      "displayOrder": 1
    },
    {
      "feedbackType": "GROWTH_AREA",
      "timestampDisplay": "4:30",
      "behaviorTitle": "Missing Edge Case Handling",
      "whatYouDid": "You implemented the core logic without considering null values or empty arrays in the dataset.",
      "whatWasMissing": "Proactive identification of edge cases before implementation demonstrates thoroughness and reduces bugs.",
      "actionableNextStep": "Before writing code, explicitly list potential edge cases (nulls, empties, extremes) and handle them upfront.",
      "displayOrder": 1
    }
  ],
  "skillScores": [
    {
      "skillId": "skill_123",
      "observedLevel": 2,
      "reasoning": "Demonstrated competent SQL usage with proper joins and filtering, but missed optimization opportunities with indexing.",
      "specificEvidence": [
        "Correctly used LEFT JOIN to combine customer and orders tables at 3:20",
        "Applied WHERE clause filtering at 3:45",
        "Did not consider index usage for the large dataset at 5:10"
      ]
    }
  ]
}

---

## Important Rules

1. **Timestamps**: Use "MM:SS" format relative to THIS video (not cumulative). Example: "2:15", "12:03"
2. **All skills must be scored**: If a skill was not demonstrated, score it as Level 1 with reasoning like "No evidence of X observed during this question"
3. **Use the level definitions**: Compare the candidate's performance to the Observable Behaviors, Example Responses, and Common Mistakes for each level
4. **Character limits are strict**:
   - behaviorTitle: 20-50 characters
   - whatYouDid: 100-300 characters
   - whyItWorked: 100-300 characters
   - whatWasMissing: 100-300 characters
   - actionableNextStep: 100-300 characters
   - reasoning: 100-200 characters
5. **Evidence must be specific**: Reference actual moments, actions, or statements from the video
6. **Minimum requirements**:
   - At least 1 STRENGTH item
   - At least 1 GROWTH_AREA item
   - Score for EVERY skill in skillsToEvaluate
7. **JSON only**: Return valid JSON with no additional text, markdown, or code blocks`;
}
