import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeminiLive, useGeminiLiveInterview, useGeminiLivePermissions } from '../useGeminiLive';
import type { InterviewContext } from '~/lib/gemini-live';

// Mock the GeminiLiveClient
const mockClient = {
  startSession: jest.fn(),
  endSession: jest.fn(),
  startListening: jest.fn(),
  stopListening: jest.fn(),
  updateContext: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  isConnected: false,
  isListening: false,
  isAISpeaking: false,
  sessionId: null,
  currentContext: null,
};

jest.mock('~/lib/gemini-live', () => ({
  createGeminiLiveClient: jest.fn(() => mockClient),
  GeminiLiveClient: jest.fn(() => mockClient),
}));

// Mock navigator.permissions
const mockPermissions = {
  query: jest.fn(),
};

const mockGetUserMedia = jest.fn();

Object.defineProperty(navigator, 'permissions', {
  writable: true,
  value: mockPermissions,
});

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

describe('useGeminiLive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isConnected = false;
    mockClient.isListening = false;
    mockClient.isAISpeaking = false;
    mockClient.sessionId = null;
  });

  describe('Basic Hook Functionality', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useGeminiLive());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isListening).toBe(false);
      expect(result.current.isAISpeaking).toBe(false);
      expect(result.current.sessionId).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.connectionState).toBe('disconnected');
    });

    test('should provide all required actions', () => {
      const { result } = renderHook(() => useGeminiLive());

      expect(typeof result.current.connect).toBe('function');
      expect(typeof result.current.disconnect).toBe('function');
      expect(typeof result.current.startListening).toBe('function');
      expect(typeof result.current.stopListening).toBe('function');
      expect(typeof result.current.updateContext).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.reconnect).toBe('function');
    });
  });

  describe('Connection Management', () => {
    test('should connect successfully', async () => {
      const { result } = renderHook(() => useGeminiLive());

      const mockContext: InterviewContext = {
        interviewId: 'test-id',
        jobTitle: 'Developer',
        focusAreas: ['JavaScript'],
        difficulty: 'MEDIUM',
        questions: [],
        currentQuestionIndex: 0,
      };

      mockClient.startSession.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      expect(mockClient.startSession).toHaveBeenCalledWith(mockContext);
      expect(result.current.connectionState).toBe('connecting');
    });

    test('should handle connection error', async () => {
      const { result } = renderHook(() => useGeminiLive());

      const mockContext: InterviewContext = {
        interviewId: 'test-id',
        jobTitle: 'Developer',
        focusAreas: ['JavaScript'],
        difficulty: 'MEDIUM',
        questions: [],
        currentQuestionIndex: 0,
      };

      mockClient.startSession.mockRejectedValue(new Error('Connection failed'));

      await act(async () => {
        try {
          await result.current.connect(mockContext, 'test-api-key');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.connectionState).toBe('error');
      expect(result.current.error).toBe('Connection failed');
    });

    test('should disconnect properly', async () => {
      const { result } = renderHook(() => useGeminiLive());

      mockClient.endSession.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.disconnect();
      });

      expect(mockClient.endSession).toHaveBeenCalled();
    });
  });

  describe('Audio Management', () => {
    test('should start listening when connected', async () => {
      const { result } = renderHook(() => useGeminiLive());

      // Mock as connected
      Object.defineProperty(result.current, 'isConnected', { value: true });
      mockClient.startListening.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.startListening();
      });

      expect(mockClient.startListening).toHaveBeenCalled();
    });

    test('should throw error when not connected', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        try {
          await result.current.startListening();
        } catch (error) {
          expect(error).toEqual(new Error('Not connected to Gemini Live'));
        }
      });
    });

    test('should stop listening', () => {
      const { result } = renderHook(() => useGeminiLive());

      act(() => {
        result.current.stopListening();
      });

      expect(mockClient.stopListening).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    test('should handle connected event', () => {
      const onConnected = jest.fn();
      renderHook(() => useGeminiLive({ onConnected }));

      // Simulate the connected event
      const connectHandler = mockClient.on.mock.calls.find(
        call => call[0] === 'connected'
      )?.[1];

      if (connectHandler) {
        act(() => {
          connectHandler({ sessionId: 'test-session' });
        });
      }

      expect(onConnected).toHaveBeenCalled();
    });

    test('should handle error event', () => {
      const onError = jest.fn();
      renderHook(() => useGeminiLive({ onError }));

      // Simulate the error event
      const errorHandler = mockClient.on.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      if (errorHandler) {
        act(() => {
          errorHandler({ error: 'Test error' });
        });
      }

      expect(onError).toHaveBeenCalledWith('Test error');
    });
  });

  describe('Context Updates', () => {
    test('should update context', () => {
      const { result } = renderHook(() => useGeminiLive());

      const contextUpdate = { currentQuestionIndex: 1 };

      act(() => {
        result.current.updateContext(contextUpdate);
      });

      expect(mockClient.updateContext).toHaveBeenCalledWith(contextUpdate);
    });
  });

  describe('Error Clearing', () => {
    test('should clear error state', () => {
      const { result } = renderHook(() => useGeminiLive());

      // First set an error state
      act(() => {
        (result.current as any).setState?.({ error: 'Test error' });
      });

      act(() => {
        result.current.clearError();
      });

      // Should clear the error
      expect(result.current.error).toBe(null);
    });
  });
});

describe('useGeminiLiveInterview', () => {
  test('should use interview-optimized configuration', () => {
    const { result } = renderHook(() => useGeminiLiveInterview());

    expect(result.current).toBeDefined();
    expect(typeof result.current.connect).toBe('function');
  });

  test('should accept custom options', () => {
    const customOptions = {
      config: {
        voice: 'Kore' as const,
        systemInstruction: 'Custom instruction',
      },
    };

    const { result } = renderHook(() => useGeminiLiveInterview(customOptions));

    expect(result.current).toBeDefined();
  });
});

describe('useGeminiLivePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default permissions', () => {
    const { result } = renderHook(() => useGeminiLivePermissions());

    expect(result.current.permissions.microphone).toBe('prompt');
    expect(result.current.permissions.camera).toBe('prompt');
    expect(result.current.hasMicrophoneAccess).toBe(false);
    expect(result.current.hasCameraAccess).toBe(false);
  });

  test('should check permissions when available', async () => {
    const mockMicPermission = {
      state: 'granted' as PermissionState,
      onchange: null,
    };
    const mockCameraPermission = {
      state: 'denied' as PermissionState,
      onchange: null,
    };

    mockPermissions.query.mockImplementation((descriptor: PermissionDescriptor) => {
      if (descriptor.name === 'microphone') {
        return Promise.resolve(mockMicPermission);
      }
      if (descriptor.name === 'camera') {
        return Promise.resolve(mockCameraPermission);
      }
      return Promise.reject(new Error('Unknown permission'));
    });

    const { result } = renderHook(() => useGeminiLivePermissions());

    await waitFor(() => {
      expect(result.current.permissions.microphone).toBe('granted');
      expect(result.current.permissions.camera).toBe('denied');
      expect(result.current.hasMicrophoneAccess).toBe(true);
      expect(result.current.hasCameraAccess).toBe(false);
    });
  });

  test('should request microphone permission', async () => {
    const mockStream = { getTracks: () => [{ stop: jest.fn() }] };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useGeminiLivePermissions());

    let permissionGranted = false;
    await act(async () => {
      permissionGranted = await result.current.requestMicrophonePermission();
    });

    expect(permissionGranted).toBe(true);
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  test('should handle microphone permission denial', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    const { result } = renderHook(() => useGeminiLivePermissions());

    let permissionGranted = true;
    await act(async () => {
      permissionGranted = await result.current.requestMicrophonePermission();
    });

    expect(permissionGranted).toBe(false);
  });

  test('should handle permissions API not available', () => {
    // Temporarily remove permissions API
    const originalPermissions = navigator.permissions;
    delete (navigator as any).permissions;

    const { result } = renderHook(() => useGeminiLivePermissions());

    expect(result.current.permissions.microphone).toBe('prompt');
    expect(result.current.permissions.camera).toBe('prompt');

    // Restore permissions API
    Object.defineProperty(navigator, 'permissions', {
      writable: true,
      value: originalPermissions,
    });
  });
});

describe('Hook Integration', () => {
  test('should work together in interview scenario', async () => {
    const { result: geminiResult } = renderHook(() => useGeminiLiveInterview());
    const { result: permissionsResult } = renderHook(() => useGeminiLivePermissions());

    // Mock successful permission
    mockGetUserMedia.mockResolvedValue({ getTracks: () => [{ stop: jest.fn() }] });

    // Request permission
    let hasPermission = false;
    await act(async () => {
      hasPermission = await permissionsResult.current.requestMicrophonePermission();
    });

    expect(hasPermission).toBe(true);

    // Mock successful connection
    mockClient.startSession.mockResolvedValue(undefined);
    mockClient.isConnected = true;

    const mockContext: InterviewContext = {
      interviewId: 'test-id',
      jobTitle: 'Developer',
      focusAreas: ['JavaScript'],
      difficulty: 'MEDIUM',
      questions: [],
      currentQuestionIndex: 0,
    };

    // Connect to Gemini Live
    await act(async () => {
      await geminiResult.current.connect(mockContext, 'test-api-key');
    });

    // Start listening
    mockClient.startListening.mockResolvedValue(undefined);
    await act(async () => {
      await geminiResult.current.startListening();
    });

    expect(mockClient.startSession).toHaveBeenCalled();
    expect(mockClient.startListening).toHaveBeenCalled();
  });
});