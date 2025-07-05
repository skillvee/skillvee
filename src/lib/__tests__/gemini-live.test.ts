// Mock the env import before importing anything
jest.mock('~/env', () => ({
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: 'test-api-key',
  },
}));

import { GeminiLiveClient, createGeminiLiveClient, type InterviewContext, type GeminiLiveConfig } from '../gemini-live';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(data: string) {
    // Mock send functionality
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code: code || 1000, reason: reason || '' }));
  }

  // Helper methods for testing
  simulateMessage(data: any) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }

  simulateError() {
    this.onerror?.(new Event('error'));
  }
}

// Mock AudioContext
class MockAudioContext {
  sampleRate = 16000;
  state = 'running';
  destination = {};

  constructor(options?: { sampleRate: number }) {
    if (options?.sampleRate) {
      this.sampleRate = options.sampleRate;
    }
  }

  createMediaStreamSource() {
    return {
      connect: jest.fn(),
    };
  }

  createScriptProcessor() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      onaudioprocess: null,
    };
  }

  decodeAudioData(buffer: ArrayBuffer) {
    return Promise.resolve({
      duration: 1.0,
      length: 16000,
      sampleRate: 16000,
    });
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      onended: null,
    };
  }

  close() {
    return Promise.resolve();
  }
}

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

// Mock MediaStream
class MockMediaStream {
  getTracks() {
    return [{ stop: jest.fn() }];
  }
}

// Setup global mocks
(global as any).WebSocket = MockWebSocket;
(global as any).AudioContext = MockAudioContext;
(global as any).MediaStream = MockMediaStream;

describe('GeminiLiveClient', () => {
  let client: GeminiLiveClient;
  let mockConfig: GeminiLiveConfig;
  let mockContext: InterviewContext;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-api-key',
      model: 'models/gemini-2.0-flash-exp',
      responseModalities: ['AUDIO'],
      voice: 'Puck',
      audioConfig: {
        sampleRate: 16000,
        encoding: 'pcm16',
        channels: 1,
      },
    };

    mockContext = {
      interviewId: 'test-interview-id',
      jobTitle: 'Software Engineer',
      companyName: 'Test Company',
      focusAreas: ['JavaScript', 'React'],
      difficulty: 'MEDIUM',
      questions: [
        {
          id: 'q1',
          questionText: 'Tell me about yourself',
          questionType: 'BEHAVIORAL',
          difficulty: 'MEDIUM',
        },
      ],
      currentQuestionIndex: 0,
    };

    client = new GeminiLiveClient(mockConfig);
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Client Creation', () => {
    test('should create client with default config', () => {
      const testClient = createGeminiLiveClient({
        apiKey: 'test-key',
      });
      expect(testClient).toBeInstanceOf(GeminiLiveClient);
    });

    test('should create client with custom config', () => {
      const customConfig = {
        apiKey: 'test-key',
        model: 'models/gemini-2.5-flash-preview-native-audio-dialog' as const,
        voice: 'Kore' as const,
      };
      const testClient = createGeminiLiveClient(customConfig);
      expect(testClient).toBeInstanceOf(GeminiLiveClient);
    });
  });

  describe('Session Management', () => {
    test('should start session successfully', async () => {
      const connectPromise = client.startSession(mockContext);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(client.isConnected).toBe(true);
      expect(client.sessionId).toBeTruthy();
      
      await expect(connectPromise).resolves.toBeUndefined();
    });

    test('should handle connection failure', async () => {
      // Mock WebSocket to fail immediately
      const originalWebSocket = (global as any).WebSocket;
      (global as any).WebSocket = class extends MockWebSocket {
        constructor(url: string) {
          super(url);
          // Set to closed state immediately to simulate connection failure
          this.readyState = MockWebSocket.CLOSED;
          setTimeout(() => {
            this.onerror?.(new Event('error'));
            this.onclose?.(new CloseEvent('close', { code: 1006, reason: 'Connection failed' }));
          }, 1);
        }
      };

      await expect(client.startSession(mockContext)).rejects.toThrow(/Connection failed|Failed to start Gemini Live session/);
      
      (global as any).WebSocket = originalWebSocket;
    });

    test('should end session properly', async () => {
      await client.startSession(mockContext);
      expect(client.isConnected).toBe(true);
      
      await client.endSession();
      expect(client.isConnected).toBe(false);
      expect(client.sessionId).toBe(null);
    });
  });

  describe('Audio Handling', () => {
    beforeEach(async () => {
      await client.startSession(mockContext);
    });

    test('should start listening when connected', async () => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream() as any);
      
      await client.startListening();
      expect(client.isListening).toBe(true);
    });

    test('should stop listening', async () => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream() as any);
      
      await client.startListening();
      expect(client.isListening).toBe(true);
      
      client.stopListening();
      expect(client.isListening).toBe(false);
    });

    test('should handle microphone permission denied', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
      
      await expect(client.startListening()).rejects.toThrow();
    });

    test('should send audio chunks', async () => {
      const audioData = new ArrayBuffer(1024);
      const sendSpy = jest.fn();
      
      // Mock the WebSocket send method
      (client as any).session.websocket.send = sendSpy;
      
      await client.sendAudioChunk(audioData);
      expect(sendSpy).toHaveBeenCalled();
    });
  });

  describe('Message Handling', () => {
    test('should handle setup complete message', async () => {
      await client.startSession(mockContext);
      
      const setupHandler = jest.fn();
      client.on('setup-complete', setupHandler);
      
      const mockWebSocket = (client as any).session.websocket as MockWebSocket;
      mockWebSocket.simulateMessage(JSON.stringify({ setupComplete: true }));
      
      expect(setupHandler).toHaveBeenCalled();
    });

    test('should handle server content messages', async () => {
      await client.startSession(mockContext);
      
      const textHandler = jest.fn();
      client.on('text-received', textHandler);
      
      const mockWebSocket = (client as any).session.websocket as MockWebSocket;
      mockWebSocket.simulateMessage(JSON.stringify({
        serverContent: {
          modelTurn: {
            parts: [{ text: 'Hello from AI' }]
          }
        }
      }));
      
      expect(textHandler).toHaveBeenCalledWith({ text: 'Hello from AI' });
    });

    test('should handle binary messages (Blob)', async () => {
      await client.startSession(mockContext);
      
      const errorHandler = jest.fn();
      client.on('error', errorHandler);
      
      const mockWebSocket = (client as any).session.websocket as MockWebSocket;
      const blobData = new Blob(['test'], { type: 'audio/pcm' });
      mockWebSocket.simulateMessage(blobData);
      
      // Should handle blob and emit appropriate error if processing fails
      expect(errorHandler).toHaveBeenCalledWith({ error: 'Failed to process audio data' });
    });
  });

  describe('Context Management', () => {
    test('should update context', async () => {
      await client.startSession(mockContext);
      
      const newContext = { currentQuestionIndex: 1 };
      client.updateContext(newContext);
      
      expect(client.currentContext?.currentQuestionIndex).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle WebSocket errors', async () => {
      await client.startSession(mockContext);
      
      const errorHandler = jest.fn();
      client.on('error', errorHandler);
      
      const mockWebSocket = (client as any).session.websocket as MockWebSocket;
      mockWebSocket.simulateError();
      
      expect(errorHandler).toHaveBeenCalledWith({ error: 'WebSocket connection error' });
    });

    test('should reconnect on unexpected disconnection', async () => {
      await client.startSession(mockContext);
      
      const disconnectHandler = jest.fn();
      client.on('disconnected', disconnectHandler);
      
      const mockWebSocket = (client as any).session.websocket as MockWebSocket;
      mockWebSocket.close(1006, 'Unexpected close');
      
      expect(disconnectHandler).toHaveBeenCalled();
    });
  });

  describe('Session Renewal', () => {
    test('should have renewal timer set', async () => {
      await client.startSession(mockContext);
      
      // Check that renewal timer is set
      expect((client as any).renewalTimer).toBeTruthy();
    });
  });

  describe('Getters', () => {
    test('should return correct state when disconnected', () => {
      expect(client.isConnected).toBe(false);
      expect(client.isListening).toBe(false);
      expect(client.isAISpeaking).toBe(false);
      expect(client.sessionId).toBe(null);
      expect(client.currentContext).toBe(null);
    });

    test('should return correct state when connected', async () => {
      await client.startSession(mockContext);
      
      expect(client.isConnected).toBe(true);
      expect(client.sessionId).toBeTruthy();
      expect(client.currentContext).toEqual(mockContext);
    });
  });
});

describe('Utility Functions', () => {
  test('should convert ArrayBuffer to base64', () => {
    const client = new GeminiLiveClient({
      apiKey: 'test',
      model: 'models/gemini-2.0-flash-exp',
      responseModalities: ['AUDIO'],
      audioConfig: { sampleRate: 16000, encoding: 'pcm16', channels: 1 },
    });
    
    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    view[0] = 72; // 'H'
    view[1] = 101; // 'e'
    view[2] = 108; // 'l'
    view[3] = 108; // 'l'
    
    const result = (client as any).arrayBufferToBase64(buffer);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should convert Float32Array to PCM16', () => {
    const client = new GeminiLiveClient({
      apiKey: 'test',
      model: 'models/gemini-2.0-flash-exp',
      responseModalities: ['AUDIO'],
      audioConfig: { sampleRate: 16000, encoding: 'pcm16', channels: 1 },
    });
    
    const float32 = new Float32Array([0.5, -0.5, 1.0, -1.0]);
    const result = (client as any).convertToPCM16(float32);
    
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(float32.length * 2);
  });
});