import { renderHook, act, waitFor } from '@testing-library/react';
import { useMediaUpload } from '../useMediaUpload';
import { api } from '~/trpc/react';

// Mock tRPC
jest.mock('~/trpc/react', () => ({
  api: {
    media: {
      initiateUpload: {
        useMutation: jest.fn(),
      },
      completeUpload: {
        useMutation: jest.fn(),
      },
      abortUpload: {
        useMutation: jest.fn(),
      },
    },
  },
}));

const mockInitiateUpload = jest.fn();
const mockCompleteUpload = jest.fn();
const mockAbortUpload = jest.fn();

// Mock Blob
const mockBlob = {
  size: 1024 * 1024, // 1MB
  type: 'video/webm',
  slice: jest.fn(() => mockBlob),
} as unknown as Blob;

describe('useMediaUpload', () => {
  const mockInterviewId = 'test-interview-id';
  const mockOnUploadComplete = jest.fn();
  const mockOnUploadProgress = jest.fn();
  const mockOnUploadError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup tRPC mocks
    (api.media.initiateUpload.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockInitiateUpload,
    });
    
    (api.media.completeUpload.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockCompleteUpload,
    });
    
    (api.media.abortUpload.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockAbortUpload,
    });
  });

  it('should initialize with idle upload state', () => {
    const { result } = renderHook(() => 
      useMediaUpload({
        interviewId: mockInterviewId,
        onUploadComplete: mockOnUploadComplete,
        onUploadProgress: mockOnUploadProgress,
        onUploadError: mockOnUploadError,
      })
    );

    expect(result.current.uploadState.status).toBe('idle');
    expect(result.current.uploadState.progress.percentage).toBe(0);
    expect(result.current.uploadState.error).toBe(null);
    expect(result.current.uploadState.recordingId).toBe(null);
  });

  it('should successfully upload a recording', async () => {
    const mockUploadInfo = {
      uploadId: 'test-upload-id',
      uploadUrls: [
        { partNumber: 1, uploadUrl: 'http://test-upload-url' }
      ],
      maxPartSize: 50 * 1024 * 1024,
      expiresIn: 3600,
    };

    mockInitiateUpload.mockResolvedValue(mockUploadInfo);
    mockCompleteUpload.mockResolvedValue({
      success: true,
      recording: { id: 'test-recording-id' },
    });

    const { result } = renderHook(() => 
      useMediaUpload({
        interviewId: mockInterviewId,
        onUploadComplete: mockOnUploadComplete,
        onUploadProgress: mockOnUploadProgress,
        onUploadError: mockOnUploadError,
      })
    );

    let uploadResult: boolean;
    await act(async () => {
      uploadResult = await result.current.uploadRecording(
        mockBlob,
        'SCREEN_AND_AUDIO',
        'test-recording.webm'
      );
    });

    expect(uploadResult!).toBe(true);
    expect(mockInitiateUpload).toHaveBeenCalledWith({
      fileName: 'test-recording.webm',
      fileSize: BigInt(mockBlob.size),
      mimeType: 'video/webm',
      interviewId: mockInterviewId,
      recordingType: 'SCREEN_AND_AUDIO',
    });

    // Wait for upload completion
    await waitFor(() => {
      expect(result.current.uploadState.status).toBe('completed');
    });

    expect(mockOnUploadComplete).toHaveBeenCalledWith('test-upload-id');
  });

  it('should handle upload failure gracefully', async () => {
    const uploadError = new Error('Upload failed');
    mockInitiateUpload.mockRejectedValue(uploadError);

    const { result } = renderHook(() => 
      useMediaUpload({
        interviewId: mockInterviewId,
        onUploadComplete: mockOnUploadComplete,
        onUploadProgress: mockOnUploadProgress,
        onUploadError: mockOnUploadError,
      })
    );

    let uploadResult: boolean;
    await act(async () => {
      uploadResult = await result.current.uploadRecording(
        mockBlob,
        'SCREEN_AND_AUDIO'
      );
    });

    expect(uploadResult!).toBe(false);
    expect(result.current.uploadState.status).toBe('failed');
    expect(result.current.uploadState.error).toBe('Upload failed');
    expect(mockOnUploadError).toHaveBeenCalledWith('Upload failed');
  });

  it('should prevent multiple simultaneous uploads', async () => {
    const { result } = renderHook(() => 
      useMediaUpload({
        interviewId: mockInterviewId,
        onUploadComplete: mockOnUploadComplete,
        onUploadProgress: mockOnUploadProgress,
        onUploadError: mockOnUploadError,
      })
    );

    // Set upload state to uploading
    act(() => {
      (result.current as any).setUploadState({
        status: 'uploading',
        progress: { loaded: 500, total: 1000, percentage: 50 },
        error: null,
        recordingId: 'test-id',
      });
    });

    const uploadResult = await act(async () => {
      return result.current.uploadRecording(mockBlob, 'SCREEN_AND_AUDIO');
    });

    expect(uploadResult).toBe(false);
    expect(mockInitiateUpload).not.toHaveBeenCalled();
  });

  it('should handle different recording types', async () => {
    const mockUploadInfo = {
      uploadId: 'test-upload-id',
      uploadUrls: [{ partNumber: 1, uploadUrl: 'http://test-upload-url' }],
      maxPartSize: 50 * 1024 * 1024,
      expiresIn: 3600,
    };

    mockInitiateUpload.mockResolvedValue(mockUploadInfo);
    mockCompleteUpload.mockResolvedValue({ success: true });

    const { result } = renderHook(() => 
      useMediaUpload({
        interviewId: mockInterviewId,
        onUploadComplete: mockOnUploadComplete,
        onUploadProgress: mockOnUploadProgress,
        onUploadError: mockOnUploadError,
      })
    );

    // Test SCREEN recording type
    await act(async () => {
      await result.current.uploadRecording(mockBlob, 'SCREEN');
    });

    expect(mockInitiateUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        recordingType: 'SCREEN',
      })
    );

    // Test AUDIO recording type
    jest.clearAllMocks();
    mockInitiateUpload.mockResolvedValue(mockUploadInfo);
    mockCompleteUpload.mockResolvedValue({ success: true });

    await act(async () => {
      await result.current.uploadRecording(mockBlob, 'AUDIO');
    });

    expect(mockInitiateUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        recordingType: 'AUDIO',
      })
    );
  });

  it('should generate appropriate file names and extensions', async () => {
    const mockUploadInfo = {
      uploadId: 'test-upload-id',
      uploadUrls: [{ partNumber: 1, uploadUrl: 'http://test-upload-url' }],
      maxPartSize: 50 * 1024 * 1024,
      expiresIn: 3600,
    };

    mockInitiateUpload.mockResolvedValue(mockUploadInfo);
    mockCompleteUpload.mockResolvedValue({ success: true });

    const { result } = renderHook(() => 
      useMediaUpload({
        interviewId: mockInterviewId,
        onUploadComplete: mockOnUploadComplete,
        onUploadProgress: mockOnUploadProgress,
        onUploadError: mockOnUploadError,
      })
    );

    // Test with custom filename
    await act(async () => {
      await result.current.uploadRecording(
        mockBlob,
        'SCREEN_AND_AUDIO',
        'custom-recording.webm'
      );
    });

    expect(mockInitiateUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'custom-recording.webm',
        mimeType: 'video/webm',
      })
    );

    // Test auto-generated filename
    jest.clearAllMocks();
    mockInitiateUpload.mockResolvedValue(mockUploadInfo);
    
    await act(async () => {
      await result.current.uploadRecording(mockBlob, 'SCREEN_AND_AUDIO');
    });

    expect(mockInitiateUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: expect.stringMatching(/recording-\d+\.webm$/),
      })
    );
  });

  it('should clear upload state', () => {
    const { result } = renderHook(() => 
      useMediaUpload({
        interviewId: mockInterviewId,
        onUploadComplete: mockOnUploadComplete,
        onUploadProgress: mockOnUploadProgress,
        onUploadError: mockOnUploadError,
      })
    );

    // Set some upload state
    act(() => {
      (result.current as any).setUploadState({
        status: 'failed',
        progress: { loaded: 100, total: 200, percentage: 50 },
        error: 'Test error',
        recordingId: 'test-id',
      });
    });

    // Clear the state
    act(() => {
      result.current.clearUpload();
    });

    expect(result.current.uploadState.status).toBe('idle');
    expect(result.current.uploadState.progress.percentage).toBe(0);
    expect(result.current.uploadState.error).toBe(null);
    expect(result.current.uploadState.recordingId).toBe(null);
  });

  it('should call onUploadProgress during upload simulation', async () => {
    const mockUploadInfo = {
      uploadId: 'test-upload-id',
      uploadUrls: [{ partNumber: 1, uploadUrl: 'http://test-upload-url' }],
      maxPartSize: 50 * 1024 * 1024,
      expiresIn: 3600,
    };

    mockInitiateUpload.mockResolvedValue(mockUploadInfo);
    mockCompleteUpload.mockResolvedValue({ success: true });

    const { result } = renderHook(() => 
      useMediaUpload({
        interviewId: mockInterviewId,
        onUploadComplete: mockOnUploadComplete,
        onUploadProgress: mockOnUploadProgress,
        onUploadError: mockOnUploadError,
      })
    );

    await act(async () => {
      await result.current.uploadRecording(mockBlob, 'SCREEN_AND_AUDIO');
    });

    // Should have been called multiple times during upload simulation
    expect(mockOnUploadProgress).toHaveBeenCalled();
    
    // Final call should be 100%
    const finalCall = mockOnUploadProgress.mock.calls[mockOnUploadProgress.mock.calls.length - 1];
    expect(finalCall[0].percentage).toBe(100);
  });
});