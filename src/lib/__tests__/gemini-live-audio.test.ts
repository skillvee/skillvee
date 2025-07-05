/**
 * Tests for the new Gemini Live audio implementation
 * Focuses on AudioRecorder, AudioStreamer, and callback-based completion
 */

// Mock the env import
jest.mock('~/env', () => ({
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: 'test-api-key',
  },
}));

import { GeminiLiveClient, createGeminiLiveClient, type InterviewContext } from '../gemini-live';

// Mock AudioWorklet and AudioContext
class MockAudioContext {
  state = 'running';
  sampleRate = 16000;
  currentTime = 0;
  destination = { connect: jest.fn() };

  constructor(options?: { sampleRate: number }) {
    if (options?.sampleRate) {
      this.sampleRate = options.sampleRate;
    }
  }

  createGain() {
    return {
      gain: { setValueAtTime: jest.fn() },
      connect: jest.fn(),
    };
  }

  createMediaStreamSource(stream: any) {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      duration: length / sampleRate,
      getChannelData: (channel: number) => new Float32Array(length),
    };
  }

  createBufferSource() {
    const source = {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      onended: null as (() => void) | null,
    };
    return source;
  }

  async addModule(url: string) {
    return Promise.resolve();
  }

  get audioWorklet() {
    return {
      addModule: this.addModule.bind(this),
    };
  }

  async resume() {
    this.state = 'running';
  }

  async close() {
    this.state = 'closed';
  }
}

class MockAudioWorkletNode {
  port = {
    onmessage: null as ((event: MessageEvent) => void) | null,
    postMessage: jest.fn(),
  };

  constructor(context: AudioContext, name: string) {}

  connect(destination: any) {}
  disconnect() {}

  // Helper for testing
  simulateAudioChunk(data: ArrayBuffer) {
    if (this.port.onmessage) {
      this.port.onmessage(new MessageEvent('message', {
        data: {
          event: 'chunk',
          data: { int16arrayBuffer: data }
        }
      }));
    }
  }
}

class MockMediaStream {
  getTracks() {
    return [{ stop: jest.fn() }];
  }
}

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;

  constructor(url: string) {
    this.url = url;
    // Simulate immediate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen(new Event('open'));
    }, 0);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (type === 'open') this.onopen = listener;
    else if (type === 'message') this.onmessage = listener;
    else if (type === 'close') this.onclose = listener;
    else if (type === 'error') this.onerror = listener;
  }

  removeEventListener() {
    // Mock implementation
  }

  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  send(data: string) {
    // Mock send
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose(new CloseEvent('close', { code: code || 1000, reason: reason || '' }));
  }

  // Test helpers
  simulateSetupComplete() {
    this.simulateMessage({ setupComplete: true });
  }

  simulateMessage(data: any) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    if (this.onmessage) this.onmessage(new MessageEvent('message', { data: blob }));
  }

  simulateAudioMessage(audioData: ArrayBuffer) {
    const response = {
      serverContent: {
        modelTurn: {
          parts: [{
            inlineData: {
              mimeType: 'audio/pcm',
              data: btoa(String.fromCharCode(...new Uint8Array(audioData)))
            }
          }]
        }
      }
    };
    this.simulateMessage(response);
  }

  simulateTurnComplete() {
    const response = {
      serverContent: {
        turnComplete: true
      }
    };
    this.simulateMessage(response);
  }
}

// Setup global mocks
(global as any).AudioContext = MockAudioContext;
(global as any).AudioWorkletNode = MockAudioWorkletNode;
(global as any).WebSocket = MockWebSocket;

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue(new MockMediaStream()),
  },
});

describe('Gemini Live Audio Implementation', () => {
  let client: GeminiLiveClient;
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

    client = createGeminiLiveClient({
      apiKey: 'test-api-key'
    });

    // Mock console to avoid noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Session Management', () => {
    test('should start session and connect to WebSocket', async () => {
      await client.startSession(mockContext);
      
      expect(client.isConnected).toBe(true);
    });

    test('should handle invalid API key', async () => {
      const invalidClient = createGeminiLiveClient({
        apiKey: 'test-gemini-api-key' // Known invalid key
      });

      await expect(invalidClient.startSession(mockContext))
        .rejects.toThrow('Valid API key required');
    });

    test('should end session properly', async () => {
      await client.startSession(mockContext);
      expect(client.isConnected).toBe(true);

      await client.endSession();
      expect(client.isConnected).toBe(false);
    });
  });

  describe('Audio Recording', () => {
    beforeEach(async () => {
      await client.startSession(mockContext);
    });

    test('should start listening with AudioWorklet', async () => {
      await client.startListening();
      
      expect(client.isListening).toBe(true);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    });

    test('should stop listening and cleanup', async () => {
      await client.startListening();
      expect(client.isListening).toBe(true);

      client.stopListening();
      expect(client.isListening).toBe(false);
    });

    test('should handle microphone permission denied', async () => {
      (navigator.mediaDevices.getUserMedia as jest.Mock)
        .mockRejectedValueOnce(new Error('Permission denied'));

      await expect(client.startListening()).rejects.toThrow();
    });
  });

  describe('Audio Playback', () => {
    beforeEach(async () => {
      await client.startSession(mockContext);
    });

    test('should handle audio reception and start speaking', async () => {
      const audioData = new ArrayBuffer(1024);
      let speakingStarted = false;

      client.on('ai-speaking-start', () => {
        speakingStarted = true;
      });

      // Simulate audio from WebSocket
      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateAudioMessage(audioData);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(speakingStarted).toBe(true);
      expect(client.isAISpeaking).toBe(true);
    });

    test('should finish audio playback gracefully', async () => {
      const audioData = new ArrayBuffer(1024);
      let speakingStopped = false;

      client.on('ai-speaking-stop', () => {
        speakingStopped = true;
      });

      // Start audio playback
      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateAudioMessage(audioData);

      await new Promise(resolve => setTimeout(resolve, 10));

      // Signal turn complete
      mockWs.simulateTurnComplete();

      // Give callback time to execute
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(speakingStopped).toBe(true);
      expect(client.isAISpeaking).toBe(false);
    });

    test('should reset finishing state on new audio', async () => {
      const audioData = new ArrayBuffer(1024);
      const mockWs = (client as any).client.ws as MockWebSocket;

      // Start first audio
      mockWs.simulateAudioMessage(audioData);
      await new Promise(resolve => setTimeout(resolve, 10));

      // Signal turn complete to start finishing
      mockWs.simulateTurnComplete();

      // Send new audio before finishing completes
      mockWs.simulateAudioMessage(audioData);

      // Should still be playing new audio
      expect(client.isAISpeaking).toBe(true);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await client.startSession(mockContext);
    });

    test('should emit connected event on setup complete', async () => {
      let connected = false;
      client.on('connected', () => {
        connected = true;
      });

      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateSetupComplete();

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(connected).toBe(true);
    });

    test('should emit text-received event', async () => {
      let receivedText = '';
      client.on('text-received', (data) => {
        receivedText = data.text;
      });

      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateMessage({
        serverContent: {
          modelTurn: {
            parts: [{ text: 'Hello from AI' }]
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(receivedText).toBe('Hello from AI');
    });

    test('should emit turn-complete event', async () => {
      let turnCompleted = false;
      client.on('turn-complete', () => {
        turnCompleted = true;
      });

      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateTurnComplete();

      expect(turnCompleted).toBe(true);
    });
  });

  describe('Context Management', () => {
    test('should update context during session', async () => {
      await client.startSession(mockContext);
      
      const updates = { currentQuestionIndex: 1 };
      client.updateContext(updates);

      expect(client.currentContext?.currentQuestionIndex).toBe(1);
    });

    test('should build system prompt with context', async () => {
      await client.startSession(mockContext);
      
      const prompt = (client as any).buildSystemPrompt();
      expect(prompt).toContain('Software Engineer');
      expect(prompt).toContain('JavaScript');
      expect(prompt).toContain('MEDIUM');
    });
  });

  describe('Error Handling', () => {
    test('should handle WebSocket errors gracefully', async () => {
      await client.startSession(mockContext);
      
      let errorReceived = false;
      client.on('error', () => {
        errorReceived = true;
      });

      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.onerror?.(new Event('error'));

      expect(errorReceived).toBe(true);
    });

    test('should handle malformed messages', async () => {
      await client.startSession(mockContext);
      
      let errorReceived = false;
      client.on('error', () => {
        errorReceived = true;
      });

      const mockWs = (client as any).client.ws as MockWebSocket;
      const invalidBlob = new Blob(['invalid json'], { type: 'application/json' });
      mockWs.onmessage?.(new MessageEvent('message', { data: invalidBlob }));

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(errorReceived).toBe(true);
    });
  });

  describe('Audio State Synchronization', () => {
    test('should properly sync isConnected state', async () => {
      expect(client.isConnected).toBe(false);
      
      await client.startListening().catch(() => {
        // Should fail because not connected
      });

      await client.startSession(mockContext);
      expect(client.isConnected).toBe(true);

      // Now should work
      await client.startListening();
      expect(client.isListening).toBe(true);
    });

    test('should prevent starting listening when not connected', async () => {
      await expect(client.startListening())
        .rejects.toThrow('Not connected to Gemini Live');
    });
  });
});

describe('Audio Utility Functions', () => {
  test('should convert ArrayBuffer to base64 correctly', () => {
    // Test the private method through reflection
    const client = createGeminiLiveClient({ apiKey: 'test' });
    const recorder = new (client as any).AudioRecorder();
    
    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    view[0] = 72; // 'H'
    view[1] = 101; // 'e'
    view[2] = 108; // 'l'
    view[3] = 108; // 'l'
    
    const result = recorder.arrayBufferToBase64(buffer);
    expect(result).toBe(btoa('Hell'));
  });

  test('should handle empty audio buffers', () => {
    const client = createGeminiLiveClient({ apiKey: 'test' });
    const streamer = new (client as any).AudioStreamer(new MockAudioContext());
    
    // Should not throw with empty chunk
    expect(() => {
      streamer.streamAudio(new Uint8Array(0));
    }).not.toThrow();
  });
});