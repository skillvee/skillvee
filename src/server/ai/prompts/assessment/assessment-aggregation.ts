// src/server/ai/prompts/assessment/assessment-aggregation.ts

import type { AssessmentAggregationContext } from './types';

/**
 * Creates a prompt for aggregating multiple question assessments into a final interview assessment
 *
 * Model: Gemini 2.5 Pro (text-only, highest quality reasoning)
 * Input: All question assessments + metadata
 * Output: Overall score (1-5), summaries, aggregated feedback
 */
export function createAggregationPrompt(context: AssessmentAggregationContext): string {
  // Format question assessments
  const questionsText = context.questionAssessments
    .map((qa, index) => {
      const strengths = qa.feedbackItems
        .filter(f => f.feedbackType === 'STRENGTH')
        .map(f => `    - [${f.timestampDisplay}] ${f.behaviorTitle}: ${f.whatYouDid}`)
        .join('\n');

      const growthAreas = qa.feedbackItems
        .filter(f => f.feedbackType === 'GROWTH_AREA')
        .map(f => `    - [${f.timestampDisplay}] ${f.behaviorTitle}: ${f.whatYouDid}`)
        .join('\n');

      const skills = qa.skillScores
        .map(s => `    - Skill ${s.skillId}: Level ${s.observedLevel} - ${s.reasoning}`)
        .join('\n');

      return `
### Question ${index + 1}
**Strengths:**
${strengths || '    (none)'}

**Growth Areas:**
${growthAreas || '    (none)'}

**Skill Scores:**
${skills}
`;
    })
    .join('\n');

  // Format question durations for timestamp adjustment
  const durationsText = context.questionDurations
    .map((d, i) => `  Question ${i + 1}: ${d.startSeconds}s - ${d.endSeconds}s (cumulative)`)
    .join('\n');

  // Format all skills
  const allSkillsText = context.allSkills
    .map(s => `  - ${s.skillId}: ${s.skillName} (Domain: ${s.domainName}, Order: ${s.domainOrder})`)
    .join('\n');

  return `You are an expert technical interview assessor. You have analyzed ${context.questionAssessments.length} individual interview questions, and now you must synthesize these into a comprehensive final assessment.

## Interview Overview

**Case:** ${context.case.caseTitle}
**Interview Duration:** ${Math.floor(context.interview.durationSeconds / 60)} minutes ${context.interview.durationSeconds % 60} seconds
**Total Questions:** ${context.questionAssessments.length}

**Case Context:**
${context.case.caseContext}

---

## Question-by-Question Assessments

${questionsText}

---

## Question Timing (for timestamp adjustment)

${durationsText}

---

## All Skills Evaluated

${allSkillsText}

---

## Your Task

Synthesize the individual question assessments into a final comprehensive interview assessment.

### 1. Calculate Overall Score (1-5 scale)

Review all question assessments holistically and assign an overall interview score:

**Score Mapping:**
- **1** → "Building Foundation" - Significant gaps in multiple areas
- **2** → "Developing Skills" - Shows promise but needs improvement
- **3** → "Strong Foundation" - Meets expectations consistently
- **4** → "Impressive Performance" - Exceeds expectations in multiple areas
- **5** → "Exceptional Mastery" - Outstanding performance across the board

**Considerations:**
- Weight later questions more heavily (shows growth or sustained quality)
- Look at skill score trends across questions
- Consider both strengths and growth areas
- Assess overall problem-solving approach

### 2. Write Summary Paragraphs

**What You Did Best** (200-500 characters):
- Synthesize the strongest patterns across all questions
- Focus on 2-3 key strengths
- Be specific and encouraging
- Reference multiple questions if relevant

**Top Opportunities for Growth** (200-500 characters):
- Synthesize the most important areas for improvement
- Focus on 2-3 key patterns
- Be constructive and actionable
- Reference multiple questions if relevant

### 3. Select Best Feedback Items

From all question assessments, select:
- **3-5 STRENGTH items** (most impactful moments)
- **3-5 GROWTH_AREA items** (most important improvements)

**Selection Criteria:**
- Choose items that span the interview (not all from one question)
- Prioritize items that support your overall assessment
- Ensure diversity (different skills/behaviors)
- Later questions can be weighted more heavily

**Timestamp Adjustment:**
- Convert timestamps from question-relative to interview-cumulative time
- Use the question timing data above
- Example: Question 2 timestamp "3:15" → Add Question 1's end time

### 4. Aggregate Skill Scores

For each unique skill across all questions:
- Calculate average score across questions where it was evaluated
- Round intelligently (favor higher if close, e.g., 2.5 → 3)
- Skill scores remain on 1-3 scale
- Assign categoryOrder (from domainOrder) and skillOrder (alphabetical within domain)

---

## Output Format

Return ONLY valid JSON matching this exact schema. No markdown, no code blocks, no explanation outside the JSON.

{
  "overallScore": 4,
  "performanceLabel": "Impressive Performance",
  "whatYouDidBest": "You demonstrated exceptional analytical thinking by consistently breaking down complex problems into manageable components. Your SQL optimization skills and clear communication stood out across multiple questions.",
  "topOpportunitiesForGrowth": "Focus on proactively identifying edge cases before implementation. Strengthen your statistical analysis by incorporating confidence intervals and sample size calculations into your initial problem framing.",
  "feedbackItems": [
    {
      "feedbackType": "STRENGTH",
      "timestampDisplay": "2:15",
      "behaviorTitle": "Structured Problem Approach",
      "whatYouDid": "You immediately broke down the problem into clear components: data validation, transformation logic, and output formatting.",
      "whyItWorked": "This systematic approach demonstrates strong analytical thinking and makes complex problems manageable.",
      "displayOrder": 1
    },
    {
      "feedbackType": "GROWTH_AREA",
      "timestampDisplay": "8:30",
      "behaviorTitle": "Edge Case Consideration",
      "whatYouDid": "You implemented the core solution without first discussing potential edge cases like null values or empty datasets.",
      "whatWasMissing": "Proactive edge case identification demonstrates thoroughness and reduces production bugs.",
      "actionableNextStep": "Before coding, explicitly list potential edge cases (nulls, empties, extremes) and validate assumptions with the interviewer.",
      "displayOrder": 1
    }
  ],
  "skillScores": [
    {
      "skillId": "skill_123",
      "skillScore": 3,
      "categoryOrder": 1,
      "skillOrder": 1
    },
    {
      "skillId": "skill_456",
      "skillScore": 2,
      "categoryOrder": 1,
      "skillOrder": 2
    }
  ]
}

---

## Important Rules

1. **Overall score (1-5)** vs **Skill scores (1-3)**: Don't confuse these scales
2. **Performance label must match overall score** using the exact mapping above
3. **Character limits are strict**:
   - whatYouDidBest: 200-500 characters
   - topOpportunitiesForGrowth: 200-500 characters
   - behaviorTitle: 20-50 characters
   - whatYouDid: 100-300 characters
   - whyItWorked: 100-300 characters
   - whatWasMissing: 100-300 characters
   - actionableNextStep: 100-300 characters
4. **Timestamps must be adjusted to cumulative interview time**
   - Use question timing data to calculate
   - Format: "MM:SS" (e.g., "2:15", "18:47")
5. **Minimum requirements**:
   - 3-5 STRENGTH items
   - 3-5 GROWTH_AREA items
   - All unique skills must have scores
6. **Re-order feedback items**:
   - Sort by timestamp (chronological)
   - Set displayOrder accordingly (1, 2, 3...)
7. **JSON only**: Return valid JSON with no additional text, markdown, or code blocks`;
}
