// Integration tests for assessment tRPC router
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TRPCError } from '@trpc/server';
import {
  mockRecording,
  mockInterviewWithRecordings,
  mockCompletedRecordings,
  mockFinalAssessment,
} from '~/test/fixtures/assessment.fixtures';

// Mock service dependencies
jest.mock('~/server/ai/services/video-assessment.service');
jest.mock('~/server/ai/services/assessment-aggregation.service');
jest.mock('~/server/db', () => require('~/test/__mocks__/prisma'));

import { processQuestionRecording } from '~/server/ai/services/video-assessment.service';
import { aggregateInterviewAssessment } from '~/server/ai/services/assessment-aggregation.service';
import {
  mockFindFirst,
  mockFindUnique,
  mockFindMany,
  resetPrismaMocks,
  db,
} from '~/test/__mocks__/prisma';

const mockProcessQuestionRecording = processQuestionRecording as jest.MockedFunction<
  typeof processQuestionRecording
>;
const mockAggregateInterviewAssessment = aggregateInterviewAssessment as jest.MockedFunction<
  typeof aggregateInterviewAssessment
>;

// Import router after mocks are set up
import { assessmentRouter } from '../assessment';

describe('assessment.router', () => {
  // Mock tRPC context
  const createMockContext = (userId = 'user_123') => ({
    userId,
    db,
    session: { userId },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetPrismaMocks();
  });

  describe('processQuestionRecording', () => {
    it('should start processing for valid recording owned by user', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue({
        ...mockRecording,
        interview: { userId: 'user_123' },
      });
      mockProcessQuestionRecording.mockResolvedValue(undefined);

      // Execute
      const result = await assessmentRouter
        .createCaller(ctx as any)
        .processQuestionRecording({ recordingId: 'rec_123' });

      // Verify
      expect(result.success).toBe(true);
      expect(result.message).toBe('Assessment processing started');

      // Verify recording ownership checked
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { id: 'rec_123' },
        include: {
          interview: {
            select: { userId: true },
          },
        },
      });

      // Note: processQuestionRecording is called asynchronously, so we can't verify it was called
    });

    it('should throw NOT_FOUND if recording does not exist', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(null);

      // Execute & Verify
      await expect(
        assessmentRouter.createCaller(ctx as any).processQuestionRecording({ recordingId: 'non_existent' })
      ).rejects.toThrow('Recording not found');

      await expect(
        assessmentRouter.createCaller(ctx as any).processQuestionRecording({ recordingId: 'non_existent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw UNAUTHORIZED if user does not own recording', async () => {
      // Setup
      const ctx = createMockContext('user_456'); // Different user
      mockFindFirst.mockResolvedValue({
        ...mockRecording,
        interview: { userId: 'user_123' }, // Owned by user_123
      });

      // Execute & Verify
      await expect(
        assessmentRouter.createCaller(ctx as any).processQuestionRecording({ recordingId: 'rec_123' })
      ).rejects.toThrow('Not authorized to access this recording');

      await expect(
        assessmentRouter.createCaller(ctx as any).processQuestionRecording({ recordingId: 'rec_123' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('getQuestionAssessmentStatus', () => {
    it('should return assessment status for valid recording', async () => {
      // Setup
      const ctx = createMockContext();
      const recordingWithStatus = {
        id: 'rec_123',
        assessmentStatus: 'COMPLETED' as const,
        assessmentStartedAt: new Date('2025-01-01T10:00:00Z'),
        assessmentCompletedAt: new Date('2025-01-01T10:05:00Z'),
        assessmentError: null,
        assessmentData: { questionId: 'question_123' },
        interview: { userId: 'user_123' },
      };

      mockFindFirst.mockResolvedValue(recordingWithStatus);

      // Execute
      const result = await assessmentRouter
        .createCaller(ctx as any)
        .getQuestionAssessmentStatus({ recordingId: 'rec_123' });

      // Verify
      expect(result.recordingId).toBe('rec_123');
      expect(result.status).toBe('COMPLETED');
      expect(result.startedAt).toEqual(recordingWithStatus.assessmentStartedAt);
      expect(result.completedAt).toEqual(recordingWithStatus.assessmentCompletedAt);
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ questionId: 'question_123' });
    });

    it('should throw NOT_FOUND if recording does not exist', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(null);

      // Execute & Verify
      await expect(
        assessmentRouter.createCaller(ctx as any).getQuestionAssessmentStatus({ recordingId: 'non_existent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Recording not found',
      });
    });

    it('should throw UNAUTHORIZED if user does not own recording', async () => {
      // Setup
      const ctx = createMockContext('user_456');
      mockFindFirst.mockResolvedValue({
        id: 'rec_123',
        assessmentStatus: 'COMPLETED' as const,
        interview: { userId: 'user_123' },
      });

      // Execute & Verify
      await expect(
        assessmentRouter.createCaller(ctx as any).getQuestionAssessmentStatus({ recordingId: 'rec_123' })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('getInterviewAssessmentStatus', () => {
    it('should return overall status for all questions', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(mockInterviewWithRecordings as any);

      const recordings = [
        {
          id: 'rec_1',
          questionOrder: 0,
          assessmentStatus: 'COMPLETED' as const,
          assessmentStartedAt: new Date(),
          assessmentCompletedAt: new Date(),
          assessmentError: null,
        },
        {
          id: 'rec_2',
          questionOrder: 1,
          assessmentStatus: 'IN_PROGRESS' as const,
          assessmentStartedAt: new Date(),
          assessmentCompletedAt: null,
          assessmentError: null,
        },
        {
          id: 'rec_3',
          questionOrder: 2,
          assessmentStatus: 'PENDING' as const,
          assessmentStartedAt: null,
          assessmentCompletedAt: null,
          assessmentError: null,
        },
      ];

      mockFindMany.mockResolvedValue(recordings);

      // Execute
      const result = await assessmentRouter
        .createCaller(ctx as any)
        .getInterviewAssessmentStatus({ interviewId: 'interview_123' });

      // Verify
      expect(result.interviewId).toBe('interview_123');
      expect(result.overallStatus).toBe('IN_PROGRESS');
      expect(result.totalQuestions).toBe(3);
      expect(result.completedCount).toBe(1);
      expect(result.inProgressCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(result.questions).toHaveLength(3);
      expect(result.questions[0]?.status).toBe('COMPLETED');
      expect(result.questions[1]?.status).toBe('IN_PROGRESS');
      expect(result.questions[2]?.status).toBe('PENDING');
    });

    it('should return COMPLETED status when all questions complete', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(mockInterviewWithRecordings as any);

      const completedRecordings = mockCompletedRecordings.map((r, idx) => ({
        id: r.id,
        questionOrder: idx,
        assessmentStatus: 'COMPLETED' as const,
        assessmentStartedAt: new Date(),
        assessmentCompletedAt: new Date(),
        assessmentError: null,
      }));

      mockFindMany.mockResolvedValue(completedRecordings);

      // Execute
      const result = await assessmentRouter
        .createCaller(ctx as any)
        .getInterviewAssessmentStatus({ interviewId: 'interview_123' });

      // Verify
      expect(result.overallStatus).toBe('COMPLETED');
      expect(result.completedCount).toBe(3);
      expect(result.totalQuestions).toBe(3);
    });

    it('should return FAILED status if any question failed', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(mockInterviewWithRecordings as any);

      const recordingsWithFailure = [
        {
          id: 'rec_1',
          questionOrder: 0,
          assessmentStatus: 'COMPLETED' as const,
          assessmentStartedAt: new Date(),
          assessmentCompletedAt: new Date(),
          assessmentError: null,
        },
        {
          id: 'rec_2',
          questionOrder: 1,
          assessmentStatus: 'FAILED' as const,
          assessmentStartedAt: new Date(),
          assessmentCompletedAt: null,
          assessmentError: 'API error',
        },
      ];

      mockFindMany.mockResolvedValue(recordingsWithFailure);

      // Execute
      const result = await assessmentRouter
        .createCaller(ctx as any)
        .getInterviewAssessmentStatus({ interviewId: 'interview_123' });

      // Verify
      expect(result.overallStatus).toBe('FAILED');
      expect(result.failedCount).toBe(1);
    });

    it('should throw NOT_FOUND if interview does not exist', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(null);

      // Execute & Verify
      await expect(
        assessmentRouter.createCaller(ctx as any).getInterviewAssessmentStatus({ interviewId: 'non_existent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Interview not found',
      });
    });
  });

  describe('aggregateInterviewAssessment', () => {
    it('should successfully aggregate when all questions complete', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(mockInterviewWithRecordings as any);

      const completedRecordings = mockCompletedRecordings.map((r) => ({
        assessmentStatus: 'COMPLETED' as const,
      }));

      mockFindMany.mockResolvedValue(completedRecordings);

      mockAggregateInterviewAssessment.mockResolvedValue({
        success: true,
        assessmentId: 'assessment_123',
      });

      // Execute
      const result = await assessmentRouter
        .createCaller(ctx as any)
        .aggregateInterviewAssessment({ interviewId: 'interview_123' });

      // Verify
      expect(result.success).toBe(true);
      expect(result.assessmentId).toBe('assessment_123');
      expect(result.message).toBe('Assessment aggregation completed successfully');

      // Verify service called with correct params
      expect(mockAggregateInterviewAssessment).toHaveBeenCalledWith({
        interviewId: 'interview_123',
        userId: 'user_123',
      });
    });

    it('should throw PRECONDITION_FAILED if not all questions complete', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(mockInterviewWithRecordings as any);

      const partialRecordings = [
        { assessmentStatus: 'COMPLETED' as const },
        { assessmentStatus: 'IN_PROGRESS' as const },
        { assessmentStatus: 'PENDING' as const },
      ];

      mockFindMany.mockResolvedValue(partialRecordings);

      // Execute & Verify
      await expect(
        assessmentRouter.createCaller(ctx as any).aggregateInterviewAssessment({ interviewId: 'interview_123' })
      ).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: 'Cannot aggregate: 1/3 questions completed',
      });

      // Verify aggregation service NOT called
      expect(mockAggregateInterviewAssessment).not.toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR if aggregation service fails', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(mockInterviewWithRecordings as any);

      const completedRecordings = mockCompletedRecordings.map((r) => ({
        assessmentStatus: 'COMPLETED' as const,
      }));

      mockFindMany.mockResolvedValue(completedRecordings);

      mockAggregateInterviewAssessment.mockResolvedValue({
        success: false,
        error: 'AI synthesis failed',
      });

      // Execute & Verify
      await expect(
        assessmentRouter.createCaller(ctx as any).aggregateInterviewAssessment({ interviewId: 'interview_123' })
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'AI synthesis failed',
      });
    });

    it('should throw NOT_FOUND if interview does not exist', async () => {
      // Setup
      const ctx = createMockContext();
      mockFindFirst.mockResolvedValue(null);

      // Execute & Verify
      await expect(
        assessmentRouter.createCaller(ctx as any).aggregateInterviewAssessment({ interviewId: 'non_existent' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Interview not found',
      });

      // Verify aggregation service NOT called
      expect(mockAggregateInterviewAssessment).not.toHaveBeenCalled();
    });
  });
});
