// src/server/ai/prompts/assessment/types.ts

/**
 * Skill level definitions for assessment (from SkillLevel table)
 */
export interface SkillLevelBehavior {
  level: number; // 1, 2, or 3
  levelName: string; // e.g., "Developing", "Proficient", "Advanced"
  generalDescription: string; // High-level description of this level
  observableBehaviors: string; // What you can observe at this level
  exampleResponses: string; // What good responses look like
  commonMistakes: string; // What mistakes indicate lower level
}

export interface SkillDefinition {
  skillId: string;
  skillName: string;
  domainName: string;
  targetLevel: number; // 1, 2, or 3
  levelBehaviors: SkillLevelBehavior[]; // All 3 levels for context
}

/**
 * Input context for per-question video assessment
 */
export interface QuestionVideoAssessmentContext {
  // Video to analyze
  videoUrl: string;

  // Interview case context
  caseTitle: string;
  caseContext: string;

  // This specific question
  questionId: string;
  questionText: string;
  questionContext?: string;
  questionOrder: number; // 0-based index
  totalQuestions: number;

  // Skills this question tests
  skillsToEvaluate: string[]; // ["skill_123 - SQL", "skill_456 - Python"]
  followUpQuestions: string[];

  // Skill level definitions (1-3 scale)
  skillDefinitions: SkillDefinition[];
}

/**
 * Output from per-question video assessment
 */
export interface FeedbackItem {
  feedbackType: "STRENGTH" | "GROWTH_AREA";
  timestampDisplay: string; // "MM:SS" format
  behaviorTitle: string; // 20-50 chars
  whatYouDid: string; // 100-300 chars
  whyItWorked?: string; // 100-300 chars (STRENGTH only)
  whatWasMissing?: string; // 100-300 chars (GROWTH_AREA only)
  actionableNextStep?: string; // 100-300 chars (GROWTH_AREA only)
  displayOrder: number;
}

export interface SkillScore {
  skillId: string;
  observedLevel: number; // 1, 2, or 3
  reasoning: string; // 100-200 chars
  specificEvidence: string[]; // 2-4 examples
}

export interface QuestionAssessment {
  questionId: string;
  feedbackItems: FeedbackItem[];
  skillScores: SkillScore[];
}

/**
 * Input context for assessment aggregation
 */
export interface AssessmentAggregationContext {
  questionAssessments: QuestionAssessment[];

  interview: {
    interviewId: string;
    startedAt: Date;
    completedAt: Date;
    durationSeconds: number;
  };

  case: {
    caseId: string;
    caseTitle: string;
    caseContext: string;
  };

  allSkills: {
    skillId: string;
    skillName: string;
    domainName: string;
    domainOrder: number;
  }[];

  // Cumulative question durations for timestamp adjustment
  questionDurations: {
    questionId: string;
    startSeconds: number; // Cumulative start time
    endSeconds: number; // Cumulative end time
  }[];
}

/**
 * Output from assessment aggregation
 */
export interface AggregatedFeedbackItem {
  feedbackType: "STRENGTH" | "GROWTH_AREA";
  timestampDisplay: string; // Adjusted to cumulative interview time
  behaviorTitle: string; // 20-50 chars
  whatYouDid: string; // 100-300 chars
  whyItWorked?: string; // 100-300 chars
  whatWasMissing?: string; // 100-300 chars
  actionableNextStep?: string; // 100-300 chars
  displayOrder: number;
}

export interface AggregatedSkillScore {
  skillId: string;
  skillScore: number; // 1-3 (averaged from question assessments)
  categoryOrder: number;
  skillOrder: number;
}

export interface FinalAssessment {
  overallScore: number; // 1-5 overall performance
  performanceLabel: string; // Based on score mapping
  whatYouDidBest: string; // 200-500 chars
  topOpportunitiesForGrowth: string; // 200-500 chars
  feedbackItems: AggregatedFeedbackItem[];
  skillScores: AggregatedSkillScore[];
}
