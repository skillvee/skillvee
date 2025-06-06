// Mock DOM environment for MediaRecorder API testing
import { renderHook, act } from '@testing-library/react';
import { useMediaCapture } from '../useMediaCapture';

// Mock MediaRecorder API
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

// Mock browser APIs
Object.defineProperty(global, 'MediaRecorder', {
  writable: true,
  value: jest.fn(() => mockMediaRecorder),
});

Object.defineProperty(MediaRecorder, 'isTypeSupported', {
  writable: true,
  value: jest.fn(() => true),
});

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

describe('useMediaCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaRecorder.state = 'inactive';
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useMediaCapture());

    expect(result.current.state).toBe('idle');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.recordedBlob).toBe(null);
    expect(result.current.stats.duration).toBe(0);
  });

  it('should return supported MIME types', () => {
    const { result } = renderHook(() => useMediaCapture());
    
    const supportedTypes = result.current.getSupportedMimeTypes();
    expect(Array.isArray(supportedTypes)).toBe(true);
  });

  it('should return optimal MIME type', () => {
    const { result } = renderHook(() => useMediaCapture());
    
    const optimalType = result.current.getOptimalMimeType();
    expect(typeof optimalType).toBe('string');
  });

  it('should start recording with screen and audio', async () => {
    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      const success = await result.current.startRecording({
        type: 'screen_and_audio',
        maxDuration: 30000,
      });
      expect(success).toBe(true);
    });

    expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalled();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    expect(MediaRecorder).toHaveBeenCalled();
  });

  it('should start recording with screen only', async () => {
    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      const success = await result.current.startRecording({
        type: 'screen',
      });
      expect(success).toBe(true);
    });

    expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalled();
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('should start recording with audio only', async () => {
    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      const success = await result.current.startRecording({
        type: 'audio',
      });
      expect(success).toBe(true);
    });

    expect(navigator.mediaDevices.getDisplayMedia).not.toHaveBeenCalled();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  it('should handle recording errors gracefully', async () => {
    // Mock a permission denied error
    (navigator.mediaDevices.getDisplayMedia as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
    );

    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      const success = await result.current.startRecording({
        type: 'screen',
      });
      expect(success).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.type).toBe('permission_denied');
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useMediaCapture());

    // Manually set an error state for testing
    act(() => {
      (result.current as any).error = { type: 'browser_error', message: 'Test error' };
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('should clear recording data', () => {
    const { result } = renderHook(() => useMediaCapture());

    act(() => {
      result.current.clearRecording();
    });

    expect(result.current.recordedBlob).toBe(null);
    expect(result.current.previewUrl).toBe(null);
    expect(result.current.stats.duration).toBe(0);
  });

  it('should stop recording when called', () => {
    const { result } = renderHook(() => useMediaCapture());

    act(() => {
      result.current.stopRecording();
    });

    // Since we're not in a recording state, this should not throw
    expect(mockMediaRecorder.stop).not.toHaveBeenCalled();
  });

  it('should pause and resume recording', () => {
    const { result } = renderHook(() => useMediaCapture());

    act(() => {
      result.current.pauseRecording();
    });

    act(() => {
      result.current.resumeRecording();
    });

    // Since we're not in a recording state, these should not throw
    expect(mockMediaRecorder.pause).not.toHaveBeenCalled();
    expect(mockMediaRecorder.resume).not.toHaveBeenCalled();
  });
});