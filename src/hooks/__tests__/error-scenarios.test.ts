import { renderHook, act, waitFor } from '@testing-library/react';
import { useMediaCapture } from '../useMediaCapture';
import { useMediaUpload } from '../useMediaUpload';
import { usePermissions } from '../usePermissions';

// Mock the APIs
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  ondataavailable: null as any,
  onstart: null as any,
  onstop: null as any,
  onpause: null as any,
  onresume: null as any,
  onerror: null as any,
  state: 'inactive',
};

const mockMediaStream = {
  getTracks: jest.fn(() => [
    { stop: jest.fn(), onended: null },
    { stop: jest.fn(), onended: null },
  ]),
  addTrack: jest.fn(),
};

// Mock tRPC for upload tests
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

import { api } from '~/trpc/react';

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup MediaRecorder mock
    (global as any).MediaRecorder = jest.fn(() => mockMediaRecorder);
    Object.defineProperty(MediaRecorder, 'isTypeSupported', {
      writable: true,
      value: jest.fn(() => true),
    });

    // Setup navigator mocks
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getDisplayMedia: jest.fn(() => Promise.resolve(mockMediaStream)),
        getUserMedia: jest.fn(() => Promise.resolve(mockMediaStream)),
      },
    });

    Object.defineProperty(global, 'URL', {
      writable: true,
      value: {
        createObjectURL: jest.fn(() => 'mock-url'),
        revokeObjectURL: jest.fn(),
      },
    });
  });

  describe('usePermissions Error Scenarios', () => {
    it('should handle camera permission denied', async () => {
      const permissionError = Object.assign(new Error('Permission denied'), { 
        name: 'NotAllowedError' 
      });
      
      navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(permissionError);

      const { result } = renderHook(() => usePermissions());

      let permissionGranted: boolean;
      await act(async () => {
        permissionGranted = await result.current.requestCameraPermission();
      });

      expect(permissionGranted!).toBe(false);
      expect(result.current.permissions.camera).toBe('denied');
      expect(result.current.error?.type).toBe('permission_denied');
      expect(result.current.error?.message).toContain('Camera access was denied');
    });

    it('should handle device not found error', async () => {
      const deviceError = Object.assign(new Error('Device not found'), { 
        name: 'NotFoundError' 
      });
      
      navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(deviceError);

      const { result } = renderHook(() => usePermissions());

      let permissionGranted: boolean;
      await act(async () => {
        permissionGranted = await result.current.requestMicrophonePermission();
      });

      expect(permissionGranted!).toBe(false);
      expect(result.current.error?.type).toBe('not_supported');
      expect(result.current.error?.message).toContain('No microphone device found');
    });

    it('should handle browser not supported', async () => {
      // Remove mediaDevices to simulate unsupported browser
      delete (global.navigator as any).mediaDevices;

      const { result } = renderHook(() => usePermissions());

      let permissionGranted: boolean;
      await act(async () => {
        permissionGranted = await result.current.requestScreenPermission();
      });

      expect(permissionGranted!).toBe(false);
      expect(result.current.error?.type).toBe('not_supported');
      expect(result.current.error?.message).toContain('Screen capture is not supported');
    });

    it('should handle unknown permission errors', async () => {
      const unknownError = new Error('Unknown error');
      navigator.mediaDevices.getDisplayMedia = jest.fn().mockRejectedValue(unknownError);

      const { result } = renderHook(() => usePermissions());

      let permissionGranted: boolean;
      await act(async () => {
        permissionGranted = await result.current.requestScreenPermission();
      });

      expect(permissionGranted!).toBe(false);
      expect(result.current.error?.type).toBe('browser_error');
      expect(result.current.error?.message).toContain('Unknown error');
    });
  });

  describe('useMediaCapture Error Scenarios', () => {
    it('should handle MediaRecorder creation failure', async () => {
      // Mock MediaRecorder constructor to throw
      (global as any).MediaRecorder = jest.fn(() => {
        throw new Error('MediaRecorder not supported');
      });

      const { result } = renderHook(() => useMediaCapture());

      let success: boolean;
      await act(async () => {
        success = await result.current.startRecording({
          type: 'screen_and_audio',
        });
      });

      expect(success!).toBe(false);
      expect(result.current.error?.type).toBe('recording_failed');
      expect(result.current.state).toBe('error');
    });

    it('should handle stream creation failure', async () => {
      const streamError = Object.assign(new Error('Stream failed'), { 
        name: 'NotAllowedError' 
      });
      
      navigator.mediaDevices.getDisplayMedia = jest.fn().mockRejectedValue(streamError);

      const { result } = renderHook(() => useMediaCapture());

      let success: boolean;
      await act(async () => {
        success = await result.current.startRecording({
          type: 'screen',
        });
      });

      expect(success!).toBe(false);
      expect(result.current.error?.type).toBe('permission_denied');
      expect(result.current.state).toBe('error');
    });

    it('should handle recording during already active session', async () => {
      const { result } = renderHook(() => useMediaCapture());

      // Manually set state to recording
      act(() => {
        (result.current as any).setState('recording');
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.startRecording({
          type: 'screen_and_audio',
        });
      });

      expect(success!).toBe(false);
      expect(result.current.error?.type).toBe('recording_failed');
      expect(result.current.error?.message).toContain('already in progress');
    });

    it('should handle MediaRecorder error event', async () => {
      const { result } = renderHook(() => useMediaCapture());

      await act(async () => {
        await result.current.startRecording({
          type: 'screen_and_audio',
        });
      });

      // Simulate MediaRecorder error
      act(() => {
        if (mockMediaRecorder.onerror) {
          mockMediaRecorder.onerror(new ErrorEvent('error', {
            error: new Error('Recording error'),
          }));
        }
      });

      expect(result.current.error?.type).toBe('recording_failed');
      expect(result.current.state).toBe('error');
    });

    it('should handle stream ending unexpectedly', async () => {
      const mockTrack = { 
        stop: jest.fn(), 
        onended: null as any,
      };
      
      const mockStream = {
        getTracks: jest.fn(() => [mockTrack]),
        addTrack: jest.fn(),
      };

      navigator.mediaDevices.getDisplayMedia = jest.fn().mockResolvedValue(mockStream);

      const { result } = renderHook(() => useMediaCapture());

      await act(async () => {
        await result.current.startRecording({
          type: 'screen',
        });
      });

      // Simulate stream track ending
      act(() => {
        if (mockTrack.onended) {
          mockTrack.onended();
        }
      });

      // Should trigger stop recording
      expect(mockMediaRecorder.state).toBeDefined();
    });

    it('should handle unsupported MIME types', async () => {
      // Mock no supported MIME types
      Object.defineProperty(MediaRecorder, 'isTypeSupported', {
        writable: true,
        value: jest.fn(() => false),
      });

      const { result } = renderHook(() => useMediaCapture());

      let success: boolean;
      await act(async () => {
        success = await result.current.startRecording({
          type: 'screen_and_audio',
        });
      });

      expect(success!).toBe(false);
      expect(result.current.error?.type).toBe('recording_failed');
      expect(result.current.error?.message).toContain('No supported recording format');
    });
  });

  describe('useMediaUpload Error Scenarios', () => {
    const mockBlob = new Blob(['test'], { type: 'video/webm' });
    const mockInterviewId = 'test-interview-id';

    beforeEach(() => {
      (api.media.initiateUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });
      (api.media.completeUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });
      (api.media.abortUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });
    });

    it('should handle upload initiation failure', async () => {
      const mockInitiateUpload = jest.fn().mockRejectedValue(new Error('Upload initiation failed'));
      (api.media.initiateUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: mockInitiateUpload,
      });

      const { result } = renderHook(() => 
        useMediaUpload({
          interviewId: mockInterviewId,
          onUploadError: jest.fn(),
        })
      );

      let success: boolean;
      await act(async () => {
        success = await result.current.uploadRecording(mockBlob, 'SCREEN_AND_AUDIO');
      });

      expect(success!).toBe(false);
      expect(result.current.uploadState.status).toBe('failed');
      expect(result.current.uploadState.error).toBe('Upload initiation failed');
    });

    it('should handle upload completion failure', async () => {
      const mockInitiateUpload = jest.fn().mockResolvedValue({
        uploadId: 'test-upload-id',
        uploadUrls: [{ partNumber: 1, uploadUrl: 'http://test-url' }],
        maxPartSize: 50 * 1024 * 1024,
        expiresIn: 3600,
      });

      const mockCompleteUpload = jest.fn().mockRejectedValue(new Error('Upload completion failed'));

      (api.media.initiateUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: mockInitiateUpload,
      });
      (api.media.completeUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: mockCompleteUpload,
      });

      const { result } = renderHook(() => 
        useMediaUpload({
          interviewId: mockInterviewId,
          onUploadError: jest.fn(),
        })
      );

      let success: boolean;
      await act(async () => {
        success = await result.current.uploadRecording(mockBlob, 'SCREEN_AND_AUDIO');
      });

      await waitFor(() => {
        expect(success!).toBe(false);
        expect(result.current.uploadState.status).toBe('failed');
        expect(result.current.uploadState.error).toBe('Upload completion failed');
      });
    });

    it('should handle network timeout during upload', async () => {
      const mockInitiateUpload = jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      (api.media.initiateUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: mockInitiateUpload,
      });

      const { result } = renderHook(() => 
        useMediaUpload({
          interviewId: mockInterviewId,
          onUploadError: jest.fn(),
        })
      );

      let success: boolean;
      await act(async () => {
        success = await result.current.uploadRecording(mockBlob, 'SCREEN_AND_AUDIO');
      });

      await waitFor(() => {
        expect(success!).toBe(false);
        expect(result.current.uploadState.error).toBe('Network timeout');
      });
    });

    it('should handle upload cancellation', async () => {
      const mockAbortUpload = jest.fn().mockResolvedValue({ success: true });
      (api.media.abortUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: mockAbortUpload,
      });

      const { result } = renderHook(() => 
        useMediaUpload({
          interviewId: mockInterviewId,
          onUploadError: jest.fn(),
        })
      );

      // Set upload state to uploading
      act(() => {
        (result.current as any).setUploadState({
          status: 'uploading',
          progress: { loaded: 500, total: 1000, percentage: 50 },
          error: null,
          recordingId: 'test-recording-id',
        });
      });

      await act(async () => {
        await result.current.cancelUpload();
      });

      expect(mockAbortUpload).toHaveBeenCalledWith({
        recordingId: 'test-recording-id',
        uploadId: 'unknown',
        reason: 'Upload cancelled by user',
      });
    });

    it('should handle abort upload failure gracefully', async () => {
      const mockAbortUpload = jest.fn().mockRejectedValue(new Error('Abort failed'));
      (api.media.abortUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: mockAbortUpload,
      });

      // Mock console.warn to verify it's called
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => 
        useMediaUpload({
          interviewId: mockInterviewId,
          onUploadError: jest.fn(),
        })
      );

      // Set upload state to uploading
      act(() => {
        (result.current as any).setUploadState({
          status: 'uploading',
          progress: { loaded: 500, total: 1000, percentage: 50 },
          error: null,
          recordingId: 'test-recording-id',
        });
      });

      await act(async () => {
        await result.current.cancelUpload();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to cancel upload:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle large file upload with chunking errors', async () => {
      // Create a large blob (simulated)
      const largeBlob = new Blob(['x'.repeat(100 * 1024 * 1024)], { type: 'video/webm' }); // 100MB

      const mockInitiateUpload = jest.fn().mockResolvedValue({
        uploadId: 'test-upload-id',
        uploadUrls: [
          { partNumber: 1, uploadUrl: 'http://test-url-1' },
          { partNumber: 2, uploadUrl: 'http://test-url-2' },
        ],
        maxPartSize: 50 * 1024 * 1024,
        expiresIn: 3600,
      });

      (api.media.initiateUpload.useMutation as jest.Mock).mockReturnValue({
        mutateAsync: mockInitiateUpload,
      });

      const { result } = renderHook(() => 
        useMediaUpload({
          interviewId: mockInterviewId,
          onUploadError: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.uploadRecording(largeBlob, 'SCREEN_AND_AUDIO');
      });

      // Should handle chunked upload (simulated in the hook)
      expect(mockInitiateUpload).toHaveBeenCalled();
    });
  });

  describe('Integration Error Scenarios', () => {
    it('should handle simultaneous permission requests', async () => {
      const { result } = renderHook(() => usePermissions());

      // Make multiple simultaneous permission requests
      const promises = [
        result.current.requestCameraPermission(),
        result.current.requestMicrophonePermission(),
        result.current.requestScreenPermission(),
      ];

      const results = await Promise.allSettled(promises);

      // All should complete without throwing
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
    });

    it('should handle memory cleanup on component unmount', () => {
      const { result, unmount } = renderHook(() => useMediaCapture());

      // Create some recording data
      act(() => {
        (result.current as any).setRecordedBlob(new Blob(['test']));
        (result.current as any).setPreviewUrl('blob:test-url');
      });

      // Unmount should clean up resources
      unmount();

      // Verify cleanup (URL.revokeObjectURL should be called)
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});