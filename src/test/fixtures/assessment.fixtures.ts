// Test fixtures for video assessment system
import type { QuestionAssessment, FinalAssessment } from "~/server/ai/prompts/assessment/types";

/**
 * Mock QuestionAssessment for testing
 */
export const mockQuestionAssessment: QuestionAssessment = {
  questionId: "question_123",
  feedbackItems: [
    {
      feedbackType: "STRENGTH",
      timestampDisplay: "2:15",
      behaviorTitle: "Structured Problem Approach",
      whatYouDid: "You immediately broke down the problem into smaller components and created a clear plan of attack.",
      whyItWorked: "This systematic approach demonstrates strong analytical thinking and organizational skills that are crucial for complex technical challenges.",
      displayOrder: 1,
    },
    {
      feedbackType: "GROWTH_AREA",
      timestampDisplay: "4:30",
      behaviorTitle: "Edge Case Consideration",
      whatYouDid: "You focused on the happy path solution without exploring potential failure scenarios.",
      whatWasMissing: "You didn't consider edge cases like null inputs, empty arrays, or concurrent access patterns.",
      actionableNextStep: "Before finalizing solutions, systematically ask yourself: 'What could go wrong?' and 'What unusual inputs might break this?'",
      displayOrder: 2,
    },
  ],
  skillScores: [
    {
      skillId: "skill_sql_123",
      observedLevel: 3,
      reasoning: "Demonstrated expert-level SQL optimization with proper indexing strategy",
      specificEvidence: [
        "At 1:30 - Correctly identified missing index as root cause",
        "At 3:45 - Proposed composite index with optimal column order",
      ],
    },
    {
      skillId: "skill_problem_solving_456",
      observedLevel: 2,
      reasoning: "Showed solid problem decomposition but missed edge case analysis",
      specificEvidence: [
        "At 0:45 - Broke down problem into logical steps",
        "At 2:20 - Implemented working solution efficiently",
      ],
    },
  ],
};

/**
 * Mock FinalAssessment for testing
 */
export const mockFinalAssessment: FinalAssessment = {
  overallScore: 4,
  performanceLabel: "Impressive Performance",
  whatYouDidBest: "You demonstrated exceptional analytical thinking throughout the interview, consistently breaking down complex problems into manageable components and proposing well-structured solutions.",
  topOpportunitiesForGrowth: "Focus on proactively identifying edge cases and failure scenarios before implementing solutions. Consider scalability implications earlier in your problem-solving process.",
  feedbackItems: [
    {
      feedbackType: "STRENGTH",
      timestampDisplay: "2:15",
      behaviorTitle: "Structured Problem Approach",
      whatYouDid: "You immediately broke down the problem into smaller components and created a clear plan of attack.",
      whyItWorked: "This systematic approach demonstrates strong analytical thinking and organizational skills that are crucial for complex technical challenges.",
      displayOrder: 1,
    },
    {
      feedbackType: "STRENGTH",
      timestampDisplay: "7:45",
      behaviorTitle: "SQL Query Optimization",
      whatYouDid: "You identified the performance bottleneck in the query and proposed a specific indexing strategy.",
      whyItWorked: "This shows deep understanding of database internals and ability to diagnose and solve real-world performance issues.",
      displayOrder: 2,
    },
    {
      feedbackType: "GROWTH_AREA",
      timestampDisplay: "4:30",
      behaviorTitle: "Edge Case Consideration",
      whatYouDid: "You focused on the happy path solution without exploring potential failure scenarios.",
      whatWasMissing: "You didn't consider edge cases like null inputs, empty arrays, or concurrent access patterns.",
      actionableNextStep: "Before finalizing solutions, systematically ask yourself: 'What could go wrong?' and 'What unusual inputs might break this?'",
      displayOrder: 3,
    },
  ],
  skillScores: [
    {
      skillId: "skill_sql_123",
      skillScore: 3,
      categoryOrder: 1,
      skillOrder: 1,
    },
    {
      skillId: "skill_problem_solving_456",
      skillScore: 2,
      categoryOrder: 2,
      skillOrder: 1,
    },
  ],
};

/**
 * Mock InterviewQuestionRecording for testing
 */
export const mockRecording = {
  id: "rec_123",
  questionId: "question_123",
  interviewId: "interview_123",
  questionOrder: 0,
  questionText: "How would you optimize this slow database query?",
  filePath: "user_123/interview_123/question_0_1234567890.webm",
  duration: 300, // 5 minutes
  uploadStatus: "COMPLETED" as const,
  assessmentStatus: "PENDING" as const,
  geminiFileUri: null,
  geminiFileUploadedAt: null,
  assessmentStartedAt: null,
  assessmentCompletedAt: null,
  assessmentError: null,
  assessmentData: null,
  createdAt: new Date("2025-01-01T10:00:00Z"),
  uploadedAt: new Date("2025-01-01T10:05:00Z"),
  interview: {
    id: "interview_123",
    userId: "user_123",
    status: "IN_PROGRESS" as const,
    startedAt: new Date("2025-01-01T10:00:00Z"),
    completedAt: null,
    questions: [],
  },
};

/**
 * Mock Interview with multiple recordings
 */
export const mockInterviewWithRecordings = {
  id: "interview_123",
  userId: "user_123",
  status: "COMPLETED" as const,
  startedAt: new Date("2025-01-01T10:00:00Z"),
  completedAt: new Date("2025-01-01T10:15:00Z"),
  practiceSession: {
    id: "session_123",
    interviewCases: [
      {
        id: "case_123",
        caseTitle: "Database Performance Optimization",
        caseContext: "You are working with a large e-commerce platform experiencing slow query performance during peak hours.",
        caseQuestions: [
          {
            id: "question_123",
            questionText: "How would you optimize this slow database query?",
            orderIndex: 0,
          },
          {
            id: "question_456",
            questionText: "What monitoring would you implement?",
            orderIndex: 1,
          },
          {
            id: "question_789",
            questionText: "How would you handle schema migrations?",
            orderIndex: 2,
          },
        ],
      },
    ],
  },
};

/**
 * Mock Skills with domains
 */
export const mockSkills = [
  {
    id: "skill_sql_123",
    name: "SQL Optimization",
    domain: {
      id: "domain_technical",
      name: "Technical Skills",
      order: 1,
    },
  },
  {
    id: "skill_problem_solving_456",
    name: "Problem Solving",
    domain: {
      id: "domain_analytical",
      name: "Analytical Thinking",
      order: 2,
    },
  },
];

/**
 * Mock completed recordings for aggregation
 */
export const mockCompletedRecordings = [
  {
    id: "rec_123",
    questionId: "question_123",
    questionOrder: 0,
    questionText: "How would you optimize this slow database query?",
    duration: 300,
    assessmentStatus: "COMPLETED" as const,
    assessmentData: mockQuestionAssessment,
  },
  {
    id: "rec_456",
    questionId: "question_456",
    questionOrder: 1,
    questionText: "What monitoring would you implement?",
    duration: 300,
    assessmentStatus: "COMPLETED" as const,
    assessmentData: {
      ...mockQuestionAssessment,
      questionId: "question_456",
    },
  },
  {
    id: "rec_789",
    questionId: "question_789",
    questionOrder: 2,
    questionText: "How would you handle schema migrations?",
    duration: 300,
    assessmentStatus: "COMPLETED" as const,
    assessmentData: {
      ...mockQuestionAssessment,
      questionId: "question_789",
    },
  },
];

/**
 * Helper to create mock Gemini File API response
 */
export const mockGeminiFileUploadResponse = {
  fileUri: "https://generativelanguage.googleapis.com/v1beta/files/abc123",
  mimeType: "video/webm",
  fileName: "files/abc123",
};

/**
 * Helper to create mock Gemini generateContent response
 */
export const createMockGeminiResponse = (data: QuestionAssessment | FinalAssessment) => ({
  response: {
    text: () => JSON.stringify(data),
  },
});

/**
 * Helper to create mock video buffer
 */
export const mockVideoBuffer = Buffer.from("mock video data");

/**
 * Helper to create mock Supabase download response
 */
export const mockSupabaseDownloadResponse = {
  data: new Blob([mockVideoBuffer], { type: "video/webm" }),
  error: null,
};
