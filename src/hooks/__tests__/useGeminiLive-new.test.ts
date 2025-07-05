/**
 * Tests for the new simplified useGeminiLive hook
 * Focuses on the React integration and state management
 */

import { renderHook, act } from '@testing-library/react';
import { useGeminiLive, useGeminiLiveInterview, type UseGeminiLiveOptions } from '../useGeminiLive';
import type { InterviewContext } from '~/lib/gemini-live';

// Mock the Gemini Live client
const mockClient = {
  startSession: jest.fn(),
  endSession: jest.fn(),
  startListening: jest.fn(),
  stopListening: jest.fn(),
  updateContext: jest.fn(),
  sendInitialGreeting: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  isConnected: false,
  isListening: false,
  isAISpeaking: false,
  currentContext: null,
};

const mockCreateClient = jest.fn(() => mockClient);

jest.mock('~/lib/gemini-live', () => ({
  createGeminiLiveClient: (config: any) => mockCreateClient(config),
  GeminiLiveClient: jest.fn(),
}));

describe('useGeminiLive Hook', () => {
  let mockContext: InterviewContext;

  beforeEach(() => {
    mockContext = {
      interviewId: 'test-interview',
      jobTitle: 'Software Engineer',
      focusAreas: ['JavaScript'],
      difficulty: 'MEDIUM',
      questions: [{
        id: 'q1',
        questionText: 'Test question',
        questionType: 'TECHNICAL',
        difficulty: 'MEDIUM'
      }],
      currentQuestionIndex: 0
    };

    // Reset all mocks
    jest.clearAllMocks();
    mockClient.isConnected = false;
    mockClient.isListening = false;
    mockClient.isAISpeaking = false;
  });

  describe('Basic Hook Functionality', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useGeminiLive());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isListening).toBe(false);
      expect(result.current.isAISpeaking).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.connectionState).toBe('disconnected');
      expect(result.current.audioLevel).toBe(0);
      expect(result.current.client).toBe(null);
    });

    test('should create client on connect', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      expect(mockCreateClient).toHaveBeenCalledWith({
        apiKey: 'test-api-key'
      });
      expect(mockClient.startSession).toHaveBeenCalledWith(mockContext);
    });

    test('should handle connection errors', async () => {
      mockClient.startSession.mockRejectedValue(new Error('Connection failed'));

      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        try {
          await result.current.connect(mockContext, 'test-api-key');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Connection failed');
      expect(result.current.connectionState).toBe('error');
    });
  });

  describe('Event Handling', () => {
    test('should setup event handlers on connect', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      // Verify event handlers were set up
      expect(mockClient.on).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('listening-start', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('listening-stop', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('ai-speaking-start', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('ai-speaking-stop', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    test('should handle connected event', async () => {
      const onConnected = jest.fn();
      const { result } = renderHook(() => useGeminiLive({ onConnected }));

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      // Get the connected event handler and call it
      const connectedHandler = mockClient.on.mock.calls
        .find(call => call[0] === 'connected')?.[1];
      
      if (connectedHandler) {
        act(() => {
          connectedHandler();
        });

        expect(result.current.isConnected).toBe(true);
        expect(result.current.connectionState).toBe('connected');
        expect(result.current.error).toBe(null);
        expect(onConnected).toHaveBeenCalled();
      }
    });

    test('should handle audio events', async () => {
      const onAudioReceived = jest.fn();
      const { result } = renderHook(() => useGeminiLive({ onAudioReceived }));

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      // Simulate ai-speaking-start event
      const speakingStartHandler = mockClient.on.mock.calls
        .find(call => call[0] === 'ai-speaking-start')?.[1];
      
      if (speakingStartHandler) {
        act(() => {
          speakingStartHandler();
        });

        expect(result.current.isAISpeaking).toBe(true);
      }

      // Simulate audio-received event
      const audioReceivedHandler = mockClient.on.mock.calls
        .find(call => call[0] === 'audio-received')?.[1];
      
      if (audioReceivedHandler) {
        const audioData = { data: new ArrayBuffer(1024) };
        act(() => {
          audioReceivedHandler(audioData);
        });

        expect(onAudioReceived).toHaveBeenCalledWith(audioData);
      }
    });
  });

  describe('Audio Control', () => {
    test('should start listening when connected', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      // Mock client as connected
      mockClient.isConnected = true;

      await act(async () => {
        await result.current.startListening();
      });

      expect(mockClient.startListening).toHaveBeenCalled();
    });

    test('should throw error when starting listening without connection', async () => {
      const { result } = renderHook(() => useGeminiLive());

      mockClient.isConnected = false;
      mockClient.startListening.mockRejectedValue(new Error('Not connected'));

      await act(async () => {
        try {
          await result.current.startListening();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Not connected');
    });

    test('should stop listening', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      act(() => {
        result.current.stopListening();
      });

      expect(mockClient.stopListening).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    test('should disconnect properly', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      await act(async () => {
        await result.current.disconnect();
      });

      expect(mockClient.endSession).toHaveBeenCalled();
    });

    test('should update context', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      const contextUpdate = { currentQuestionIndex: 1 };
      act(() => {
        result.current.updateContext(contextUpdate);
      });

      expect(mockClient.updateContext).toHaveBeenCalledWith(contextUpdate);
    });

    test('should send initial greeting', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      act(() => {
        result.current.sendInitialGreeting();
      });

      expect(mockClient.sendInitialGreeting).toHaveBeenCalled();
    });

    test('should clear errors', async () => {
      const { result } = renderHook(() => useGeminiLive());

      // Set an error state
      await act(async () => {
        try {
          await result.current.connect(mockContext, 'invalid-key');
        } catch (error) {
          // Expected
        }
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Reconnection', () => {
    test('should reconnect with stored context and API key', async () => {
      const { result } = renderHook(() => useGeminiLive());

      // Initial connection
      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      // Clear mocks to test reconnection
      jest.clearAllMocks();

      await act(async () => {
        await result.current.reconnect();
      });

      expect(mockCreateClient).toHaveBeenCalledWith({
        apiKey: 'test-api-key'
      });
      expect(mockClient.startSession).toHaveBeenCalledWith(mockContext);
    });

    test('should throw error when reconnecting without previous connection', async () => {
      const { result } = renderHook(() => useGeminiLive());

      await act(async () => {
        try {
          await result.current.reconnect();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('Cleanup', () => {
    test('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useGeminiLive());

      await act(async () => {
        await result.current.connect(mockContext, 'test-api-key');
      });

      unmount();

      expect(mockClient.endSession).toHaveBeenCalled();
    });
  });
});

describe('useGeminiLiveInterview Hook', () => {
  test('should create client with interview-specific config', async () => {
    const customInstruction = 'Custom interview instruction';
    const { result } = renderHook(() => 
      useGeminiLiveInterview({
        config: { systemInstruction: customInstruction }
      })
    );

    const mockContext: InterviewContext = {
      interviewId: 'test',
      jobTitle: 'Engineer',
      focusAreas: [],
      difficulty: 'MEDIUM',
      questions: [],
      currentQuestionIndex: 0
    };

    await act(async () => {
      await result.current.connect(mockContext, 'test-api-key');
    });

    expect(mockCreateClient).toHaveBeenCalledWith({
      model: 'models/gemini-2.0-flash-exp',
      responseModalities: ['AUDIO'],
      voice: 'Puck',
      systemInstruction: customInstruction,
      apiKey: 'test-api-key'
    });
  });

  test('should use default interview system instruction', async () => {
    const { result } = renderHook(() => useGeminiLiveInterview());

    const mockContext: InterviewContext = {
      interviewId: 'test',
      jobTitle: 'Engineer',
      focusAreas: [],
      difficulty: 'MEDIUM',
      questions: [],
      currentQuestionIndex: 0
    };

    await act(async () => {
      await result.current.connect(mockContext, 'test-api-key');
    });

    const createCallArgs = mockCreateClient.mock.calls[0][0];
    expect(createCallArgs.systemInstruction).toContain('professional AI interviewer');
    expect(createCallArgs.systemInstruction).toContain('10-30 seconds');
  });
});