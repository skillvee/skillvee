import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { TRPCError } from '@trpc/server';

// Mock Clerk before importing anything else
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

// Mock the entire tRPC setup
jest.mock('../../trpc', () => ({
  createTRPCContext: jest.fn(),
  publicProcedure: {
    query: jest.fn(),
    mutation: jest.fn(),
  },
  protectedProcedure: {
    query: jest.fn(),
    mutation: jest.fn(),
  },
  adminProcedure: {
    query: jest.fn(),
    mutation: jest.fn(),
  },
  createCallerFactory: jest.fn(),
  createTRPCRouter: jest.fn(),
}));

import { aiRouter } from '../ai';

// Mock the Prisma client
const mockDb = {
  interview: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
};

// Mock the environment
jest.mock('~/env', () => ({
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: 'test-api-key',
  },
}));

// Mock the Gemini Live client
jest.mock('~/lib/gemini-live', () => ({
  createGeminiLiveClient: jest.fn(() => ({
    startSession: jest.fn(),
    endSession: jest.fn(),
  })),
}));

describe('AI Router - Gemini Live Integration', () => {
  let ctx: any;
  let caller: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create test context
    ctx = {
      db: mockDb,
      user: {
        id: 'user-123',
        role: 'INTERVIEWER',
        email: 'test@example.com',
      },
    };

    // Create caller
    caller = aiRouter.createCaller(ctx);
  });

  describe('startConversation', () => {
    const mockInterview = {
      id: 'interview-123',
      userId: 'user-123',
      status: 'SCHEDULED',
      jobDescription: {
        id: 'job-123',
        title: 'Software Engineer',
        companyName: 'Test Company',
        company: 'Test Company',
        focusAreas: ['JavaScript', 'React'],
        difficulty: 'MEDIUM',
      },
      questions: [
        {
          id: 'q1',
          questionText: 'Tell me about yourself',
          questionType: 'BEHAVIORAL',
          difficulty: 'MEDIUM',
          expectedAnswer: 'Should be personal',
          evaluationCriteria: '["Communication", "Experience"]',
          timeAllocation: 300,
          followUpQuestions: '["What motivates you?"]',
        },
      ],
    };

    test('should start conversation for SCHEDULED interview', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);
      mockDb.interview.update.mockResolvedValue({ ...mockInterview, status: 'IN_PROGRESS' });

      const result = await caller.startConversation({
        interviewId: 'interview-123',
        sessionConfig: {
          voice: 'alloy',
          speed: 1.0,
          temperature: 0.7,
          maxTokens: 2048,
        },
        context: {
          candidateName: 'John Doe',
          position: 'Software Engineer',
          company: 'Test Company',
        },
      });

      expect(result).toMatchObject({
        sessionId: expect.stringMatching(/^gemini_live_/),
        status: 'ready',
        config: {
          model: 'models/gemini-2.0-flash-exp',
          responseModalities: ['AUDIO'],
          voice: 'Puck',
          apiKey: 'test-api-key',
          systemInstruction: expect.stringContaining('Software Engineer'),
        },
        context: {
          interviewId: 'interview-123',
          jobTitle: 'Software Engineer',
          companyName: 'Test Company',
          focusAreas: ['JavaScript', 'React'],
          difficulty: 'MEDIUM',
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: 'q1',
              questionText: 'Tell me about yourself',
            }),
          ]),
          currentQuestionIndex: 0,
        },
        expiresAt: expect.any(Date),
        wsEndpoint: expect.stringContaining('wss://generativelanguage.googleapis.com'),
      });
    });

    test('should start conversation for IN_PROGRESS interview', async () => {
      const inProgressInterview = { ...mockInterview, status: 'IN_PROGRESS' };
      mockDb.interview.findFirst.mockResolvedValue(inProgressInterview);

      const result = await caller.startConversation({
        interviewId: 'interview-123',
        sessionConfig: {
          voice: 'alloy',
          speed: 1.0,
          temperature: 0.7,
          maxTokens: 2048,
        },
      });

      expect(result.status).toBe('ready');
      expect(mockDb.interview.update).not.toHaveBeenCalled(); // Should not update if already IN_PROGRESS
    });

    test('should update SCHEDULED interview to IN_PROGRESS', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);
      mockDb.interview.update.mockResolvedValue({ ...mockInterview, status: 'IN_PROGRESS' });

      await caller.startConversation({
        interviewId: 'interview-123',
        sessionConfig: {
          voice: 'alloy',
          speed: 1.0,
          temperature: 0.7,
          maxTokens: 2048,
        },
      });

      expect(mockDb.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-123' },
        data: {
          status: 'IN_PROGRESS',
          startedAt: expect.any(Date),
        },
      });
    });

    test('should build system instruction with interview context', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);
      mockDb.interview.update.mockResolvedValue({ ...mockInterview, status: 'IN_PROGRESS' });

      const result = await caller.startConversation({
        interviewId: 'interview-123',
        sessionConfig: {
          voice: 'alloy',
          speed: 1.0,
          temperature: 0.7,
          maxTokens: 2048,
        },
      });

      expect(result.config.systemInstruction).toContain('Software Engineer');
      expect(result.config.systemInstruction).toContain('Test Company');
      expect(result.config.systemInstruction).toContain('JavaScript, React');
      expect(result.config.systemInstruction).toContain('MEDIUM');
      expect(result.config.systemInstruction).toContain('1'); // Total questions
    });

    test('should handle interview not found', async () => {
      mockDb.interview.findFirst.mockResolvedValue(null);

      await expect(
        caller.startConversation({
          interviewId: 'nonexistent-interview',
          sessionConfig: {
            voice: 'alloy',
            speed: 1.0,
            temperature: 0.7,
            maxTokens: 2048,
          },
        })
      ).rejects.toThrow('Active interview not found');
    });

    test('should handle unauthorized access', async () => {
      const unauthorizedInterview = { ...mockInterview, userId: 'other-user' };
      mockDb.interview.findFirst.mockResolvedValue(unauthorizedInterview);

      await expect(
        caller.startConversation({
          interviewId: 'interview-123',
          sessionConfig: {
            voice: 'alloy',
            speed: 1.0,
            temperature: 0.7,
            maxTokens: 2048,
          },
        })
      ).rejects.toThrow('Active interview not found');
    });

    test('should parse JSON fields correctly', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);
      mockDb.interview.update.mockResolvedValue({ ...mockInterview, status: 'IN_PROGRESS' });

      const result = await caller.startConversation({
        interviewId: 'interview-123',
        sessionConfig: {
          voice: 'alloy',
          speed: 1.0,
          temperature: 0.7,
          maxTokens: 2048,
        },
      });

      expect(result.context.questions[0]).toMatchObject({
        evaluationCriteria: ['Communication', 'Experience'],
        followUpQuestions: ['What motivates you?'],
      });
    });

    test('should handle invalid JSON in database fields', async () => {
      const invalidJsonInterview = {
        ...mockInterview,
        questions: [
          {
            ...mockInterview.questions[0],
            evaluationCriteria: 'invalid json',
            followUpQuestions: null,
          },
        ],
      };
      mockDb.interview.findFirst.mockResolvedValue(invalidJsonInterview);
      mockDb.interview.update.mockResolvedValue({ ...invalidJsonInterview, status: 'IN_PROGRESS' });

      const result = await caller.startConversation({
        interviewId: 'interview-123',
        sessionConfig: {
          voice: 'alloy',
          speed: 1.0,
          temperature: 0.7,
          maxTokens: 2048,
        },
      });

      expect(result.context.questions[0]).toMatchObject({
        evaluationCriteria: undefined,
        followUpQuestions: undefined,
      });
    });
  });

  describe('endConversation', () => {
    const mockInterview = {
      id: 'interview-123',
      userId: 'user-123',
      status: 'IN_PROGRESS',
      geminiSessionId: 'session-123',
    };

    test('should end conversation successfully', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);
      mockDb.interview.update.mockResolvedValue({
        ...mockInterview,
        status: 'COMPLETED',
        endedAt: new Date(),
      });

      const result = await caller.endConversation({
        interviewId: 'interview-123',
        sessionId: 'session-123',
        reason: 'completed',
      });

      expect(result).toMatchObject({
        sessionId: 'session-123',
        status: 'ended',
        reason: 'completed',
        endedAt: expect.any(Date),
      });

      expect(mockDb.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-123' },
        data: {
          geminiSessionId: null,
          geminiConfig: null,
          endedAt: expect.any(Date),
          status: 'COMPLETED',
        },
      });
    });

    test('should handle cancellation', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);
      mockDb.interview.update.mockResolvedValue(mockInterview);

      const result = await caller.endConversation({
        interviewId: 'interview-123',
        sessionId: 'session-123',
        reason: 'cancelled',
      });

      expect(result.reason).toBe('cancelled');
      expect(mockDb.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-123' },
        data: {
          geminiSessionId: null,
          geminiConfig: null,
          endedAt: undefined,
          status: 'IN_PROGRESS', // Should remain in progress when cancelled
        },
      });
    });

    test('should handle interview not found', async () => {
      mockDb.interview.findFirst.mockResolvedValue(null);

      await expect(
        caller.endConversation({
          interviewId: 'nonexistent-interview',
          sessionId: 'session-123',
          reason: 'completed',
        })
      ).rejects.toThrow('Interview not found');
    });
  });

  describe('updateConversationContext', () => {
    const mockInterview = {
      id: 'interview-123',
      userId: 'user-123',
      geminiSessionId: 'session-123',
      questions: [
        { id: 'q1', questionText: 'Question 1', questionType: 'TECHNICAL' },
        { id: 'q2', questionText: 'Question 2', questionType: 'BEHAVIORAL' },
      ],
    };

    test('should update context successfully', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);

      const result = await caller.updateConversationContext({
        interviewId: 'interview-123',
        sessionId: 'session-123',
        currentQuestionIndex: 1,
        additionalContext: 'Moving to behavioral questions',
      });

      expect(result).toMatchObject({
        sessionId: 'session-123',
        currentQuestionIndex: 1,
        currentQuestion: {
          id: 'q2',
          questionText: 'Question 2',
          questionType: 'BEHAVIORAL',
        },
        progress: 100, // (1 + 1) / 2 * 100
        remainingQuestions: 0, // 2 - 1 - 1
        additionalContext: 'Moving to behavioral questions',
        updatedAt: expect.any(Date),
      });
    });

    test('should handle invalid question index', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);

      await expect(
        caller.updateConversationContext({
          interviewId: 'interview-123',
          sessionId: 'session-123',
          currentQuestionIndex: 10, // Out of bounds
        })
      ).rejects.toThrow('Invalid question index');
    });

    test('should handle session mismatch', async () => {
      const wrongSessionInterview = { ...mockInterview, geminiSessionId: 'different-session' };
      mockDb.interview.findFirst.mockResolvedValue(wrongSessionInterview);

      await expect(
        caller.updateConversationContext({
          interviewId: 'interview-123',
          sessionId: 'session-123',
          currentQuestionIndex: 1,
        })
      ).rejects.toThrow('Active interview session not found');
    });
  });

  describe('getConversationStatus', () => {
    const mockInterview = {
      id: 'interview-123',
      status: 'IN_PROGRESS',
      geminiSessionId: 'session-123',
      geminiConfig: '{"model": "models/gemini-2.0-flash-exp", "voice": "Puck"}',
      createdAt: new Date('2024-01-01'),
      startedAt: new Date('2024-01-01T10:00:00Z'),
      endedAt: null,
      questions: [
        { id: 'q1', questionText: 'Question 1' },
        { id: 'q2', questionText: 'Question 2' },
      ],
      jobDescription: {
        title: 'Software Engineer',
        focusAreas: ['JavaScript', 'React'],
        difficulty: 'MEDIUM',
      },
    };

    test('should get active session status', async () => {
      mockDb.interview.findFirst.mockResolvedValue(mockInterview);

      const result = await caller.getConversationStatus({
        interviewId: 'interview-123',
        sessionId: 'session-123',
      });

      expect(result).toMatchObject({
        interviewId: 'interview-123',
        sessionId: 'session-123',
        isActive: true,
        status: 'IN_PROGRESS',
        config: {
          model: 'models/gemini-2.0-flash-exp',
          voice: 'Puck',
        },
        questionCount: 2,
        jobTitle: 'Software Engineer',
        focusAreas: ['JavaScript', 'React'],
        difficulty: 'MEDIUM',
        createdAt: expect.any(Date),
        startedAt: expect.any(Date),
        endedAt: null,
      });
    });

    test('should handle inactive session', async () => {
      const inactiveInterview = { ...mockInterview, geminiSessionId: null };
      mockDb.interview.findFirst.mockResolvedValue(inactiveInterview);

      const result = await caller.getConversationStatus({
        interviewId: 'interview-123',
      });

      expect(result.isActive).toBe(false);
      expect(result.sessionId).toBe(null);
    });

    test('should handle invalid JSON config', async () => {
      const invalidConfigInterview = { ...mockInterview, geminiConfig: 'invalid json' };
      mockDb.interview.findFirst.mockResolvedValue(invalidConfigInterview);

      const result = await caller.getConversationStatus({
        interviewId: 'interview-123',
        sessionId: 'session-123',
      });

      expect(result.config).toBe(null);
    });
  });

  describe('validateGeminiLiveConnection', () => {
    test('should validate connection for admin users', async () => {
      const adminCtx = { ...ctx, user: { ...ctx.user, role: 'ADMIN' } };
      const adminCaller = aiRouter.createCaller(adminCtx);

      const result = await adminCaller.validateGeminiLiveConnection();

      expect(result).toMatchObject({
        isValid: true,
        model: 'models/gemini-2.0-flash-exp',
        features: ['AUDIO', 'Real-time conversation', 'Session management'],
        apiKeyStatus: 'valid',
        validatedAt: expect.any(Date),
      });
    });

    test('should reject non-admin users', async () => {
      await expect(caller.validateGeminiLiveConnection()).rejects.toThrow(
        'Not authorized to validate Gemini Live connection'
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      mockDb.interview.findFirst.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        caller.startConversation({
          interviewId: 'interview-123',
          sessionConfig: {
            voice: 'alloy',
            speed: 1.0,
            temperature: 0.7,
            maxTokens: 2048,
          },
        })
      ).rejects.toThrow();
    });

    test('should handle Gemini Live client creation errors', async () => {
      const mockInterview = {
        id: 'interview-123',
        userId: 'user-123',
        status: 'SCHEDULED',
        jobDescription: {
          title: 'Software Engineer',
          focusAreas: ['JavaScript'],
          difficulty: 'MEDIUM',
        },
        questions: [],
      };

      mockDb.interview.findFirst.mockResolvedValue(mockInterview);
      mockDb.interview.update.mockResolvedValue({ ...mockInterview, status: 'IN_PROGRESS' });

      // Mock createGeminiLiveClient to throw
      const { createGeminiLiveClient } = require('~/lib/gemini-live');
      (createGeminiLiveClient as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid API key');
      });

      await expect(
        caller.startConversation({
          interviewId: 'interview-123',
          sessionConfig: {
            voice: 'alloy',
            speed: 1.0,
            temperature: 0.7,
            maxTokens: 2048,
          },
        })
      ).rejects.toThrow('Failed to start conversation session');
    });
  });
});