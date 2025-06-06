import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import type { UserRole } from "@prisma/client";

/**
 * Test helpers for tRPC testing
 */

// Mock database instance
const mockDb = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  jobDescription: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    updateMany: jest.fn(),
  },
  interview: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  question: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createMany: jest.fn(),
  },
  assessment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  mediaRecording: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  interviewNote: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $queryRaw: jest.fn(),
} as any;

/**
 * Create a test context for tRPC
 */
export function createTestContext({
  userId = null,
  userRole = "INTERVIEWER",
}: {
  userId?: string | null;
  userRole?: UserRole;
} = {}) {
  const mockUser = userId ? {
    id: userId,
    clerkId: userId,
    email: "test@example.com",
    role: userRole,
  } : null;

  return {
    db: mockDb,
    userId,
    sessionId: userId ? "test-session" : null,
    user: mockUser,
    headers: new Headers(),
  };
}

/**
 * Create a test caller for tRPC procedures
 */
export function createTestCaller(context: ReturnType<typeof createTestContext>) {
  return createCaller(context);
}

/**
 * Mock database responses
 */
export const mockDatabaseResponses = {
  user: {
    findUnique: (data: any) => mockDb.user.findUnique.mockResolvedValue(data),
    findMany: (data: any[]) => mockDb.user.findMany.mockResolvedValue(data),
    create: (data: any) => mockDb.user.create.mockResolvedValue(data),
    update: (data: any) => mockDb.user.update.mockResolvedValue(data),
  },
  jobDescription: {
    findUnique: (data: any) => mockDb.jobDescription.findUnique.mockResolvedValue(data),
    findMany: (data: any[]) => mockDb.jobDescription.findMany.mockResolvedValue(data),
    findFirst: (data: any) => mockDb.jobDescription.findFirst.mockResolvedValue(data),
    create: (data: any) => mockDb.jobDescription.create.mockResolvedValue(data),
    update: (data: any) => mockDb.jobDescription.update.mockResolvedValue(data),
    count: (count: number) => mockDb.jobDescription.count.mockResolvedValue(count),
  },
  interview: {
    findUnique: (data: any) => mockDb.interview.findUnique.mockResolvedValue(data),
    findMany: (data: any[]) => mockDb.interview.findMany.mockResolvedValue(data),
    findFirst: (data: any) => mockDb.interview.findFirst.mockResolvedValue(data),
    create: (data: any) => mockDb.interview.create.mockResolvedValue(data),
    update: (data: any) => mockDb.interview.update.mockResolvedValue(data),
    count: (count: number) => mockDb.interview.count.mockResolvedValue(count),
  },
  assessment: {
    findUnique: (data: any) => mockDb.assessment.findUnique.mockResolvedValue(data),
    findMany: (data: any[]) => mockDb.assessment.findMany.mockResolvedValue(data),
    findFirst: (data: any) => mockDb.assessment.findFirst.mockResolvedValue(data),
    create: (data: any) => mockDb.assessment.create.mockResolvedValue(data),
    update: (data: any) => mockDb.assessment.update.mockResolvedValue(data),
  },
  mediaRecording: {
    findUnique: (data: any) => mockDb.mediaRecording.findUnique.mockResolvedValue(data),
    findMany: (data: any[]) => mockDb.mediaRecording.findMany.mockResolvedValue(data),
    findFirst: (data: any) => mockDb.mediaRecording.findFirst.mockResolvedValue(data),
    create: (data: any) => mockDb.mediaRecording.create.mockResolvedValue(data),
    update: (data: any) => mockDb.mediaRecording.update.mockResolvedValue(data),
  },
};

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  Object.values(mockDb).forEach(model => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach(method => {
        if (typeof method === 'function' && 'mockReset' in method) {
          (method as any).mockReset();
        }
      });
    }
  });
}

/**
 * Sample test data
 */
export const sampleData = {
  user: {
    id: "test-user-id",
    clerkId: "test-clerk-id",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    profileImage: null,
    role: "INTERVIEWER" as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  jobDescription: {
    id: "test-job-id",
    title: "Senior Data Scientist",
    company: "Test Company",
    description: "We are looking for a senior data scientist...",
    requirements: ["Python", "Machine Learning", "SQL"],
    focusAreas: ["Machine Learning", "Data Analysis"],
    isTemplate: false,
    userId: "test-user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    _count: { interviews: 0 },
  },
  interview: {
    id: "test-interview-id",
    userId: "test-user-id",
    jobDescriptionId: "test-job-id",
    status: "SCHEDULED" as const,
    scheduledAt: new Date(),
    startedAt: null,
    completedAt: null,
    duration: null,
    geminiSessionId: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    jobDescription: {
      id: "test-job-id",
      title: "Senior Data Scientist",
      company: "Test Company",
    },
    _count: {
      questions: 0,
      interviewNotes: 0,
      mediaRecordings: 0,
    },
  },
  assessment: {
    id: "test-assessment-id",
    interviewId: "test-interview-id",
    overallScore: 8,
    technicalScore: 8,
    communicationScore: 7,
    problemSolvingScore: 9,
    strengthsAnalysis: "Strong technical skills and problem-solving ability",
    improvementAreas: "Could improve communication clarity",
    detailedFeedback: "Excellent performance overall...",
    recommendedNextSteps: "Focus on advanced system design concepts",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  mediaRecording: {
    id: "test-recording-id",
    interviewId: "test-interview-id",
    recordingType: "SCREEN_AND_AUDIO" as const,
    filePath: "/uploads/test-interview/recording.mp4",
    fileSize: BigInt(1024000),
    duration: 1800,
    uploadStatus: "COMPLETED" as const,
    transcriptionStatus: "COMPLETED" as const,
    transcriptionText: "This is a test transcription...",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};