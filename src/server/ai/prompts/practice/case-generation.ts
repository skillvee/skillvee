interface CaseGenerationContext {
  jobTitle: string;
  company?: string;
  team?: string;
  selectedSkills: string[];
  domainName: string;
  difficulty?: string;
}

/**
 * Creates a prompt for generating interview case questions
 */
export function createCaseGenerationPrompt(context: CaseGenerationContext): string {
  const skillsList = context.selectedSkills.join(", ");
  const companyContext = context.company
    ? `at ${context.company}${context.team ? ` (${context.team} team)` : ''}`
    : '';

  const difficultyGuide = getDifficultyGuide(context.difficulty);

  return `Generate a realistic interview case for a ${context.jobTitle} position${companyContext}.

## INTERVIEW FOCUS
Domain: ${context.domainName}
Skills to Evaluate: ${skillsList}
Difficulty Level: ${context.difficulty || 'MEDIUM'}

## DIFFICULTY GUIDELINES
${difficultyGuide}

## CASE REQUIREMENTS

1. **Context**: Create a realistic business scenario relevant to the role and company
2. **Data**: Include specific metrics, datasets, or technical constraints
3. **Questions**: Generate 3-5 progressively challenging questions that:
   - Start with fundamentals
   - Build to more complex analysis
   - Test the specified skills
   - Include follow-up probes

## EXPECTED RESPONSE FORMAT

Return ONLY valid JSON with this structure:
{
  "caseTitle": "Brief, descriptive title",
  "caseContext": "2-3 paragraph business scenario with context and problem statement",
  "caseData": {
    "metrics": ["List of relevant metrics or data points"],
    "constraints": ["Technical or business constraints"],
    "additionalContext": "Any extra information needed"
  },
  "questions": [
    {
      "questionText": "The main question",
      "questionContext": "Why this question matters",
      "followUpQuestions": [
        "What if...",
        "How would you handle..."
      ],
      "skillsEvaluated": ["Skill1", "Skill2"],
      "timeAllocation": 10
    }
  ],
  "totalDuration": 45
}

Generate a case that would realistically appear in a ${context.jobTitle} interview.`;
}

/**
 * Get difficulty-specific guidelines
 */
function getDifficultyGuide(difficulty?: string): string {
  const guides: Record<string, string> = {
    JUNIOR: `
- Focus on fundamentals and basic concepts
- Use straightforward scenarios with clear requirements
- Test understanding of core tools and methods
- Avoid complex edge cases`,

    MEDIUM: `
- Balance fundamental and intermediate concepts
- Include some ambiguity requiring clarification
- Test ability to apply knowledge to new scenarios
- Include 1-2 trade-off decisions`,

    HARD: `
- Include complex, multi-faceted problems
- Test deep technical knowledge and experience
- Require optimization and scalability considerations
- Include ambiguous requirements needing clarification`,

    SENIOR: `
- Focus on system design and architecture decisions
- Include cross-functional considerations
- Test leadership and mentoring scenarios
- Require strategic thinking and long-term planning`
  };

  return guides[difficulty || 'MEDIUM'] || guides.MEDIUM;
}