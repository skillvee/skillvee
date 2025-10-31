// Unit tests for video assessment service
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { processQuestionRecording } from '../video-assessment.service';
import {
  mockRecording,
  mockQuestionAssessment,
  mockGeminiFileUploadResponse,
  mockSupabaseDownloadResponse,
  createMockGeminiResponse,
  mockVideoBuffer,
} from '~/test/fixtures/assessment.fixtures';

// Mock dependencies
jest.mock('~/server/ai/providers/gemini', () => require('~/test/__mocks__/gemini-client'));
jest.mock('~/server/ai/providers/gemini/file-manager');
jest.mock('@supabase/supabase-js', () => require('~/test/__mocks__/supabase'));
jest.mock('~/server/db', () => require('~/test/__mocks__/prisma'));

import { mockGenerateContent, resetGeminiMocks } from '~/test/__mocks__/gemini-client';
import { mockDownload, resetSupabaseMocks } from '~/test/__mocks__/supabase';
import { mockFindUnique, mockUpdate, resetPrismaMocks, db } from '~/test/__mocks__/prisma';
import { uploadVideoToGemini } from '~/server/ai/providers/gemini/file-manager';

const mockUploadVideoToGemini = uploadVideoToGemini as jest.MockedFunction<typeof uploadVideoToGemini>;

describe('video-assessment.service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    resetGeminiMocks();
    resetSupabaseMocks();
    resetPrismaMocks();
  });

  describe('processQuestionRecording', () => {
    it('should successfully process a new recording from start to finish', async () => {
      // Setup: Mock database responses
      mockFindUnique
        .mockResolvedValueOnce(mockRecording) // Initial fetch
        .mockResolvedValueOnce({
          ...mockRecording,
          geminiFileUri: mockGeminiFileUploadResponse.fileUri,
        }); // After upload

      mockUpdate
        .mockResolvedValueOnce({ ...mockRecording, assessmentStatus: 'IN_PROGRESS' }) // Set to IN_PROGRESS
        .mockResolvedValueOnce({
          ...mockRecording,
          geminiFileUri: mockGeminiFileUploadResponse.fileUri,
        }) // Save Gemini URI
        .mockResolvedValueOnce({
          ...mockRecording,
          assessmentStatus: 'COMPLETED',
          assessmentData: mockQuestionAssessment,
        }); // Final completion

      // Setup: Mock Supabase download
      mockDownload.mockResolvedValue(mockSupabaseDownloadResponse);

      // Setup: Mock Gemini file upload
      mockUploadVideoToGemini.mockResolvedValue(mockGeminiFileUploadResponse);

      // Setup: Mock Gemini assessment generation
      mockGenerateContent.mockResolvedValue(createMockGeminiResponse(mockQuestionAssessment));

      // Execute
      await processQuestionRecording({ recordingId: 'rec_123' });

      // Verify: Status updated to IN_PROGRESS
      expect(mockUpdate).toHaveBeenNthCalledWith(1, {
        where: { id: 'rec_123' },
        data: {
          assessmentStatus: 'IN_PROGRESS',
          assessmentStartedAt: expect.any(Date),
        },
      });

      // Verify: Video downloaded from Supabase
      expect(mockDownload).toHaveBeenCalledWith(mockRecording.filePath);

      // Verify: Video uploaded to Gemini
      expect(mockUploadVideoToGemini).toHaveBeenCalledWith(
        expect.any(Buffer),
        'video/webm',
        'recording_rec_123'
      );

      // Verify: Gemini File URI saved to database
      expect(mockUpdate).toHaveBeenNthCalledWith(2, {
        where: { id: 'rec_123' },
        data: {
          geminiFileUri: mockGeminiFileUploadResponse.fileUri,
          geminiFileUploadedAt: expect.any(Date),
        },
      });

      // Verify: AI assessment called with correct parameters
      expect(mockGenerateContent).toHaveBeenCalledWith([
        {
          fileData: {
            fileUri: mockGeminiFileUploadResponse.fileUri,
            mimeType: 'video/webm',
          },
        },
        { text: expect.stringContaining('questionId') },
      ]);

      // Verify: Final status updated to COMPLETED
      expect(mockUpdate).toHaveBeenNthCalledWith(3, {
        where: { id: 'rec_123' },
        data: {
          assessmentStatus: 'COMPLETED',
          assessmentCompletedAt: expect.any(Date),
          assessmentData: mockQuestionAssessment,
          assessmentError: null,
        },
      });
    });

    it('should skip Gemini upload if video already uploaded', async () => {
      // Setup: Recording already has Gemini file URI
      const recordingWithGeminiFile = {
        ...mockRecording,
        geminiFileUri: mockGeminiFileUploadResponse.fileUri,
        geminiFileUploadedAt: new Date(),
      };

      mockFindUnique.mockResolvedValue(recordingWithGeminiFile);
      mockUpdate
        .mockResolvedValueOnce({ ...recordingWithGeminiFile, assessmentStatus: 'IN_PROGRESS' })
        .mockResolvedValueOnce({ ...recordingWithGeminiFile, assessmentStatus: 'COMPLETED' });

      mockGenerateContent.mockResolvedValue(createMockGeminiResponse(mockQuestionAssessment));

      // Execute
      await processQuestionRecording({ recordingId: 'rec_123' });

      // Verify: Supabase download NOT called
      expect(mockDownload).not.toHaveBeenCalled();

      // Verify: Gemini upload NOT called
      expect(mockUploadVideoToGemini).not.toHaveBeenCalled();

      // Verify: AI assessment still called
      expect(mockGenerateContent).toHaveBeenCalled();

      // Verify: Completed successfully
      expect(mockUpdate).toHaveBeenLastCalledWith({
        where: { id: 'rec_123' },
        data: expect.objectContaining({
          assessmentStatus: 'COMPLETED',
        }),
      });
    });

    it('should handle Supabase download failure', async () => {
      // Setup
      mockFindUnique.mockResolvedValue(mockRecording);
      mockUpdate.mockResolvedValue({ ...mockRecording, assessmentStatus: 'IN_PROGRESS' });

      // Setup: Supabase download error
      mockDownload.mockResolvedValue({
        data: null,
        error: { message: 'File not found' },
      });

      // Execute & Verify: Should throw and set status to FAILED
      await expect(processQuestionRecording({ recordingId: 'rec_123' })).rejects.toThrow();

      // Verify: Status set to FAILED
      expect(mockUpdate).toHaveBeenLastCalledWith({
        where: { id: 'rec_123' },
        data: {
          assessmentStatus: 'FAILED',
          assessmentError: expect.stringContaining('Failed to download video'),
        },
      });
    });

    it('should handle Gemini file upload failure', async () => {
      // Setup
      mockFindUnique.mockResolvedValue(mockRecording);
      mockUpdate.mockResolvedValue({ ...mockRecording, assessmentStatus: 'IN_PROGRESS' });
      mockDownload.mockResolvedValue(mockSupabaseDownloadResponse);

      // Setup: Gemini upload error
      mockUploadVideoToGemini.mockRejectedValue(new Error('Upload failed'));

      // Execute & Verify
      await expect(processQuestionRecording({ recordingId: 'rec_123' })).rejects.toThrow();

      // Verify: Status set to FAILED
      expect(mockUpdate).toHaveBeenLastCalledWith({
        where: { id: 'rec_123' },
        data: {
          assessmentStatus: 'FAILED',
          assessmentError: expect.stringContaining('Upload failed'),
        },
      });
    });

    it('should handle AI assessment generation failure', async () => {
      // Setup
      mockFindUnique
        .mockResolvedValueOnce(mockRecording)
        .mockResolvedValueOnce({
          ...mockRecording,
          geminiFileUri: mockGeminiFileUploadResponse.fileUri,
        });

      mockUpdate
        .mockResolvedValueOnce({ ...mockRecording, assessmentStatus: 'IN_PROGRESS' })
        .mockResolvedValueOnce({
          ...mockRecording,
          geminiFileUri: mockGeminiFileUploadResponse.fileUri,
        });

      mockDownload.mockResolvedValue(mockSupabaseDownloadResponse);
      mockUploadVideoToGemini.mockResolvedValue(mockGeminiFileUploadResponse);

      // Setup: AI generation error
      mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'));

      // Execute & Verify
      await expect(processQuestionRecording({ recordingId: 'rec_123' })).rejects.toThrow();

      // Verify: Status set to FAILED
      expect(mockUpdate).toHaveBeenLastCalledWith({
        where: { id: 'rec_123' },
        data: {
          assessmentStatus: 'FAILED',
          assessmentError: expect.stringContaining('API quota exceeded'),
        },
      });
    });

    it('should handle invalid AI response format', async () => {
      // Setup
      const recordingWithGeminiFile = {
        ...mockRecording,
        geminiFileUri: mockGeminiFileUploadResponse.fileUri,
      };

      mockFindUnique.mockResolvedValue(recordingWithGeminiFile);
      mockUpdate
        .mockResolvedValueOnce({ ...recordingWithGeminiFile, assessmentStatus: 'IN_PROGRESS' })
        .mockResolvedValueOnce({ ...recordingWithGeminiFile, assessmentStatus: 'FAILED' });

      // Setup: Invalid AI response (missing required fields)
      const invalidResponse = {
        response: {
          text: () => JSON.stringify({ questionId: 'test' }), // Missing feedbackItems and skillScores
        },
      };
      mockGenerateContent.mockResolvedValue(invalidResponse as any);

      // Execute & Verify
      await expect(processQuestionRecording({ recordingId: 'rec_123' })).rejects.toThrow();

      // Verify: Status set to FAILED
      expect(mockUpdate).toHaveBeenLastCalledWith({
        where: { id: 'rec_123' },
        data: {
          assessmentStatus: 'FAILED',
          assessmentError: expect.stringContaining('Invalid assessment response'),
        },
      });
    });

    it('should handle recording not found', async () => {
      // Setup: Recording doesn't exist
      mockFindUnique.mockResolvedValue(null);

      // Execute & Verify
      await expect(processQuestionRecording({ recordingId: 'non_existent' })).rejects.toThrow(
        'Recording non_existent not found'
      );
    });

    it('should log performance metrics during processing', async () => {
      // Setup
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const recordingWithGeminiFile = {
        ...mockRecording,
        geminiFileUri: mockGeminiFileUploadResponse.fileUri,
      };

      mockFindUnique.mockResolvedValue(recordingWithGeminiFile);
      mockUpdate
        .mockResolvedValueOnce({ ...recordingWithGeminiFile, assessmentStatus: 'IN_PROGRESS' })
        .mockResolvedValueOnce({ ...recordingWithGeminiFile, assessmentStatus: 'COMPLETED' });

      mockGenerateContent.mockResolvedValue(createMockGeminiResponse(mockQuestionAssessment));

      // Execute
      await processQuestionRecording({ recordingId: 'rec_123' });

      // Verify: Performance logging
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[VideoAssessment] Starting processing')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[VideoAssessment] Assessment completed in')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[VideoAssessment] Successfully completed processing')
      );

      consoleSpy.mockRestore();
    });
  });
});
