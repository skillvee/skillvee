// Unit tests for assessment aggregation service
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { aggregateInterviewAssessment } from '../assessment-aggregation.service';
import {
  mockInterviewWithRecordings,
  mockCompletedRecordings,
  mockSkills,
  mockFinalAssessment,
  createMockGeminiResponse,
} from '~/test/fixtures/assessment.fixtures';

// Mock dependencies
jest.mock('~/server/ai/providers/gemini', () => require('~/test/__mocks__/gemini-client'));
jest.mock('~/server/db', () => require('~/test/__mocks__/prisma'));

import { mockGenerateContent, resetGeminiMocks } from '~/test/__mocks__/gemini-client';
import {
  mockFindMany,
  mockFindUnique,
  mockFindFirst,
  mockCreate,
  resetPrismaMocks,
} from '~/test/__mocks__/prisma';

describe('assessment-aggregation.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGeminiMocks();
    resetPrismaMocks();
  });

  describe('aggregateInterviewAssessment', () => {
    it('should successfully aggregate all question assessments into final assessment', async () => {
      // Setup: Mock database responses
      mockFindMany
        .mockResolvedValueOnce(mockCompletedRecordings) // Fetch recordings
        .mockResolvedValueOnce(mockSkills); // Fetch skills

      mockFindUnique.mockResolvedValue(mockInterviewWithRecordings); // Fetch interview

      mockFindFirst.mockResolvedValue(null); // No existing assessment

      mockCreate.mockResolvedValue({
        id: 'assessment_123',
        ...mockFinalAssessment,
        userId: 'user_123',
        interviewId: 'interview_123',
        caseId: 'case_123',
        feedbackItems: mockFinalAssessment.feedbackItems,
        skillScores: mockFinalAssessment.skillScores,
      });

      // Setup: Mock Gemini synthesis
      mockGenerateContent.mockResolvedValue(createMockGeminiResponse(mockFinalAssessment));

      // Execute
      const result = await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Success result
      expect(result.success).toBe(true);
      expect(result.assessmentId).toBe('assessment_123');
      expect(result.error).toBeUndefined();

      // Verify: All recordings fetched
      expect(mockFindMany).toHaveBeenNthCalledWith(1, {
        where: { interviewId: 'interview_123' },
        select: {
          id: true,
          questionId: true,
          questionOrder: true,
          questionText: true,
          duration: true,
          assessmentStatus: true,
          assessmentData: true,
        },
        orderBy: { questionOrder: 'asc' },
      });

      // Verify: Existing assessment checked
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { interviewId: 'interview_123' },
      });

      // Verify: Interview context fetched
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'interview_123' },
        include: {
          practiceSession: {
            include: {
              interviewCases: {
                include: {
                  caseQuestions: {
                    orderBy: { orderIndex: 'asc' },
                  },
                },
              },
            },
          },
        },
      });

      // Verify: Skills fetched
      expect(mockFindMany).toHaveBeenNthCalledWith(2, {
        where: {
          id: { in: expect.arrayContaining(['skill_sql_123', 'skill_problem_solving_456']) },
        },
        include: { domain: true },
        orderBy: [{ domain: { order: 'asc' } }, { name: 'asc' }],
      });

      // Verify: AI synthesis called with correct context
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('questionAssessments'));

      // Verify: Final assessment created in database
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user_123',
          interviewId: 'interview_123',
          caseId: 'case_123',
          overallScore: 4,
          performanceLabel: 'Impressive Performance',
          whatYouDidBest: expect.any(String),
          topOpportunitiesForGrowth: expect.any(String),
          feedbackItems: {
            create: expect.arrayContaining([
              expect.objectContaining({
                feedbackType: 'STRENGTH',
                timestampDisplay: expect.any(String),
                behaviorTitle: expect.any(String),
              }),
            ]),
          },
          skillScores: {
            create: expect.arrayContaining([
              expect.objectContaining({
                skillId: expect.any(String),
                skillScore: expect.any(Number),
              }),
            ]),
          },
        }),
        include: {
          feedbackItems: true,
          skillScores: true,
        },
      });
    });

    it('should return existing assessment if already created', async () => {
      // Setup: Existing assessment exists
      const existingAssessment = {
        id: 'existing_assessment_123',
        interviewId: 'interview_123',
      };

      mockFindMany.mockResolvedValue(mockCompletedRecordings);
      mockFindFirst.mockResolvedValue(existingAssessment);

      // Execute
      const result = await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Returns existing assessment ID
      expect(result.success).toBe(true);
      expect(result.assessmentId).toBe('existing_assessment_123');

      // Verify: No AI synthesis called
      expect(mockGenerateContent).not.toHaveBeenCalled();

      // Verify: No new assessment created
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should fail if not all questions are assessed', async () => {
      // Setup: Some questions not completed
      const incompleteRecordings = [
        { ...mockCompletedRecordings[0], assessmentStatus: 'COMPLETED' },
        { ...mockCompletedRecordings[1], assessmentStatus: 'IN_PROGRESS' },
        { ...mockCompletedRecordings[2], assessmentStatus: 'PENDING' },
      ];

      mockFindMany.mockResolvedValue(incompleteRecordings);

      // Execute
      const result = await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Error result
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not all questions assessed');
      expect(result.error).toContain('1/3 completed');

      // Verify: No synthesis attempted
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('should fail if no recordings found', async () => {
      // Setup: No recordings
      mockFindMany.mockResolvedValue([]);

      // Execute
      const result = await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Error result
      expect(result.success).toBe(false);
      expect(result.error).toContain('No question recordings found');
    });

    it('should fail if interview not found', async () => {
      // Setup
      mockFindMany.mockResolvedValue(mockCompletedRecordings);
      mockFindFirst.mockResolvedValue(null);
      mockFindUnique.mockResolvedValue(null); // Interview not found

      // Execute
      const result = await aggregateInterviewAssessment({
        interviewId: 'non_existent',
        userId: 'user_123',
      });

      // Verify: Error result
      expect(result.success).toBe(false);
      expect(result.error).toContain('Interview non_existent not found');
    });

    it('should fail if no interview case found', async () => {
      // Setup: Interview without case
      const interviewWithoutCase = {
        ...mockInterviewWithRecordings,
        practiceSession: {
          ...mockInterviewWithRecordings.practiceSession,
          interviewCases: [],
        },
      };

      mockFindMany.mockResolvedValue(mockCompletedRecordings);
      mockFindFirst.mockResolvedValue(null);
      mockFindUnique.mockResolvedValue(interviewWithoutCase);

      // Execute
      const result = await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Error result
      expect(result.success).toBe(false);
      expect(result.error).toContain('No interview case found');
    });

    it('should handle AI synthesis failure gracefully', async () => {
      // Setup
      mockFindMany
        .mockResolvedValueOnce(mockCompletedRecordings)
        .mockResolvedValueOnce(mockSkills);

      mockFindUnique.mockResolvedValue(mockInterviewWithRecordings);
      mockFindFirst.mockResolvedValue(null);

      // Setup: AI synthesis error
      mockGenerateContent.mockRejectedValue(new Error('API rate limit exceeded'));

      // Execute
      const result = await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Error result
      expect(result.success).toBe(false);
      expect(result.error).toContain('API rate limit exceeded');

      // Verify: No assessment created
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should handle invalid AI response format', async () => {
      // Setup
      mockFindMany
        .mockResolvedValueOnce(mockCompletedRecordings)
        .mockResolvedValueOnce(mockSkills);

      mockFindUnique.mockResolvedValue(mockInterviewWithRecordings);
      mockFindFirst.mockResolvedValue(null);

      // Setup: Invalid AI response
      const invalidResponse = {
        response: {
          text: () => JSON.stringify({ overallScore: 4 }), // Missing required fields
        },
      };
      mockGenerateContent.mockResolvedValue(invalidResponse as any);

      // Execute
      const result = await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Error result
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid aggregation response');
    });

    it('should correctly calculate cumulative timing for timestamp adjustment', async () => {
      // Setup
      mockFindMany
        .mockResolvedValueOnce(mockCompletedRecordings)
        .mockResolvedValueOnce(mockSkills);

      mockFindUnique.mockResolvedValue(mockInterviewWithRecordings);
      mockFindFirst.mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue(createMockGeminiResponse(mockFinalAssessment));
      mockCreate.mockResolvedValue({
        id: 'assessment_123',
        ...mockFinalAssessment,
      } as any);

      // Execute
      await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: AI prompt includes cumulative timing
      const promptArg = mockGenerateContent.mock.calls[0]?.[0];
      expect(promptArg).toContain('0s - 300s'); // Question 1: 0-300s
      expect(promptArg).toContain('300s - 600s'); // Question 2: 300-600s
      expect(promptArg).toContain('600s - 900s'); // Question 3: 600-900s
    });

    it('should filter out invalid skill IDs when storing scores', async () => {
      // Setup
      const assessmentWithInvalidSkills = {
        ...mockFinalAssessment,
        skillScores: [
          { skillId: 'skill_sql_123', skillScore: 3, categoryOrder: 1, skillOrder: 1 },
          { skillId: 'invalid_skill', skillScore: 2, categoryOrder: 2, skillOrder: 1 }, // Invalid
        ],
      };

      mockFindMany
        .mockResolvedValueOnce(mockCompletedRecordings)
        .mockResolvedValueOnce(mockSkills); // Only returns valid skills

      mockFindUnique.mockResolvedValue(mockInterviewWithRecordings);
      mockFindFirst.mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue(createMockGeminiResponse(assessmentWithInvalidSkills));
      mockCreate.mockResolvedValue({ id: 'assessment_123' } as any);

      // Spy on console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Execute
      await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Warning logged for invalid skill
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skill invalid_skill not found in database')
      );

      // Verify: Only valid skill stored
      const createCall = mockCreate.mock.calls[0]?.[0] as any;
      expect(createCall.data.skillScores.create).toHaveLength(1);
      expect(createCall.data.skillScores.create[0].skillId).toBe('skill_sql_123');

      consoleSpy.mockRestore();
    });

    it('should correctly parse MM:SS timestamps to seconds', async () => {
      // Setup
      mockFindMany
        .mockResolvedValueOnce(mockCompletedRecordings)
        .mockResolvedValueOnce(mockSkills);

      mockFindUnique.mockResolvedValue(mockInterviewWithRecordings);
      mockFindFirst.mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue(createMockGeminiResponse(mockFinalAssessment));
      mockCreate.mockResolvedValue({ id: 'assessment_123' } as any);

      // Execute
      await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Timestamps converted correctly
      const createCall = mockCreate.mock.calls[0]?.[0] as any;
      const feedbackItems = createCall.data.feedbackItems.create;

      // "2:15" should be 2*60 + 15 = 135 seconds
      const item1 = feedbackItems.find((item: any) => item.timestampDisplay === '2:15');
      expect(item1?.timestampSeconds).toBe(135);

      // "7:45" should be 7*60 + 45 = 465 seconds
      const item2 = feedbackItems.find((item: any) => item.timestampDisplay === '7:45');
      expect(item2?.timestampSeconds).toBe(465);
    });

    it('should log performance metrics during aggregation', async () => {
      // Setup
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      mockFindMany
        .mockResolvedValueOnce(mockCompletedRecordings)
        .mockResolvedValueOnce(mockSkills);

      mockFindUnique.mockResolvedValue(mockInterviewWithRecordings);
      mockFindFirst.mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue(createMockGeminiResponse(mockFinalAssessment));
      mockCreate.mockResolvedValue({ id: 'assessment_123' } as any);

      // Execute
      await aggregateInterviewAssessment({
        interviewId: 'interview_123',
        userId: 'user_123',
      });

      // Verify: Performance logging
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AssessmentAggregation] Starting aggregation')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AssessmentAggregation] Synthesis completed in')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AssessmentAggregation] Successfully created assessment')
      );

      consoleSpy.mockRestore();
    });
  });
});
