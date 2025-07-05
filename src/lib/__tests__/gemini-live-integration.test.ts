/**
 * Integration tests for the complete Gemini Live workflow
 * Tests the full flow from connection to audio conversation
 */

// Mock the env import
jest.mock('~/env', () => ({
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: 'test-api-key',
  },
}));

import { GeminiLiveClient, createGeminiLiveClient, type InterviewContext } from '../gemini-live';

// Mock implementations similar to other tests but with focus on integration
class MockAudioContext {
  state = 'running';
  sampleRate = 24000;
  currentTime = 0;
  destination = { connect: jest.fn() };

  createGain() {
    return {
      gain: { setValueAtTime: jest.fn() },
      connect: jest.fn(),
    };
  }

  createMediaStreamSource(stream: any) {
    return { connect: jest.fn() };
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      duration: length / sampleRate,
      getChannelData: (channel: number) => new Float32Array(length),
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      onended: null as (() => void) | null,
    };
  }

  async addModule() { return Promise.resolve(); }
  get audioWorklet() { return { addModule: this.addModule.bind(this) }; }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
}

class MockAudioWorkletNode {
  port = {
    onmessage: null as ((event: MessageEvent) => void) | null,
    postMessage: jest.fn(),
  };

  connect() {}
  disconnect() {}
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

  removeEventListener(type: string, listener: (event: any) => void) {
    if (type === 'open') this.onopen = null;
    else if (type === 'message') this.onmessage = null;
    else if (type === 'close') this.onclose = null;
    else if (type === 'error') this.onerror = null;
  }

  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  send(data: string) {}
  
  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose(new CloseEvent('close', { code: 1000, reason: '' }));
  }

  // Integration test helpers
  simulateCompleteConversationFlow() {
    // 1. Setup complete
    this.simulateMessage({ setupComplete: true });
    
    // 2. AI speaks (audio data)
    setTimeout(() => {
      this.simulateAudioMessage(new ArrayBuffer(1024));
    }, 10);
    
    // 3. AI finishes speaking
    setTimeout(() => {
      this.simulateMessage({
        serverContent: { turnComplete: true }
      });
    }, 50);
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
}

// Setup mocks
(global as any).AudioContext = MockAudioContext;
(global as any).AudioWorkletNode = MockAudioWorkletNode;
(global as any).WebSocket = MockWebSocket;

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    }),
  },
});

describe('Gemini Live Integration Tests', () => {
  let client: GeminiLiveClient;
  let mockContext: InterviewContext;

  beforeEach(() => {
    mockContext = {
      interviewId: 'integration-test',
      jobTitle: 'Senior Software Engineer',
      companyName: 'Tech Corp',
      focusAreas: ['JavaScript', 'React', 'Node.js'],
      difficulty: 'SENIOR',
      questions: [
        {
          id: 'q1',
          questionText: 'Describe your experience with React hooks',
          questionType: 'TECHNICAL',
          difficulty: 'SENIOR'
        },
        {
          id: 'q2',
          questionText: 'How would you optimize a slow React component?',
          questionType: 'TECHNICAL',
          difficulty: 'SENIOR'
        }
      ],
      currentQuestionIndex: 0
    };

    client = createGeminiLiveClient({
      apiKey: 'test-integration-key',
      model: 'models/gemini-2.0-flash-exp',
      responseModalities: ['AUDIO'],
      voice: 'Puck',
      systemInstruction: 'You are conducting a technical interview.'
    });

    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(async () => {
    if (client.isConnected) {
      await client.endSession();
    }
    jest.clearAllMocks();
  });

  describe('Complete Interview Flow', () => {
    test('should handle full interview session lifecycle', async () => {
      const events: string[] = [];
      
      // Track all events
      client.on('connected', () => events.push('connected'));
      client.on('listening-start', () => events.push('listening-start'));
      client.on('ai-speaking-start', () => events.push('ai-speaking-start'));
      client.on('ai-speaking-stop', () => events.push('ai-speaking-stop'));
      client.on('turn-complete', () => events.push('turn-complete'));
      client.on('disconnected', () => events.push('disconnected'));

      // 1. Start session
      await client.startSession(mockContext);
      expect(client.isConnected).toBe(true);

      // 2. Simulate setup complete from server
      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateMessage({ setupComplete: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(events).toContain('connected');

      // 3. Start listening
      await client.startListening();
      expect(client.isListening).toBe(true);
      expect(events).toContain('listening-start');

      // 4. Simulate AI response with audio
      mockWs.simulateAudioMessage(new ArrayBuffer(2048));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(events).toContain('ai-speaking-start');
      expect(client.isAISpeaking).toBe(true);

      // 5. Simulate turn complete (AI finishes speaking)
      mockWs.simulateMessage({
        serverContent: { turnComplete: true }
      });
      expect(events).toContain('turn-complete');

      // Wait for callback-based completion
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(events).toContain('ai-speaking-stop');
      expect(client.isAISpeaking).toBe(false);

      // 6. Update context (move to next question)
      client.updateContext({ currentQuestionIndex: 1 });
      expect(client.currentContext?.currentQuestionIndex).toBe(1);

      // 7. End session
      await client.endSession();
      expect(client.isConnected).toBe(false);
      expect(client.isListening).toBe(false);
    });

    test('should handle multiple turn conversation', async () => {
      const audioReceivedEvents: any[] = [];
      client.on('audio-received', (data) => audioReceivedEvents.push(data));

      // Start session
      await client.startSession(mockContext);
      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateMessage({ setupComplete: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Turn 1: AI speaks
      mockWs.simulateAudioMessage(new ArrayBuffer(1024));
      await new Promise(resolve => setTimeout(resolve, 10));
      
      mockWs.simulateMessage({ serverContent: { turnComplete: true } });
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(client.isAISpeaking).toBe(false);
      expect(audioReceivedEvents).toHaveLength(1);

      // Turn 2: AI speaks again (follow-up question)
      mockWs.simulateAudioMessage(new ArrayBuffer(1024));
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(client.isAISpeaking).toBe(true);
      
      mockWs.simulateMessage({ serverContent: { turnComplete: true } });
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(client.isAISpeaking).toBe(false);
      expect(audioReceivedEvents).toHaveLength(2);
    });

    test('should handle interruptions gracefully', async () => {
      await client.startSession(mockContext);
      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateMessage({ setupComplete: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // AI starts speaking
      mockWs.simulateAudioMessage(new ArrayBuffer(1024));
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(client.isAISpeaking).toBe(true);

      // Simulate interruption
      mockWs.simulateMessage({
        serverContent: { interrupted: true }
      });

      expect(client.isAISpeaking).toBe(false);
    });
  });

  describe('Error Recovery', () => {
    test('should recover from connection errors during session', async () => {
      let errorCount = 0;
      client.on('error', () => errorCount++);

      await client.startSession(mockContext);
      const mockWs = (client as any).client.ws as MockWebSocket;

      // Simulate connection established
      mockWs.simulateMessage({ setupComplete: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Simulate error
      mockWs.onerror?.(new Event('error'));
      expect(errorCount).toBe(1);

      // Should still be functional for new attempts
      await client.startListening();
      expect(client.isListening).toBe(true);
    });

    test('should handle malformed audio data', async () => {
      let errorReceived = false;
      client.on('error', () => errorReceived = true);

      await client.startSession(mockContext);
      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateMessage({ setupComplete: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Send malformed message
      const invalidBlob = new Blob(['invalid'], { type: 'application/json' });
      mockWs.onmessage?.(new MessageEvent('message', { data: invalidBlob }));

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(errorReceived).toBe(true);
    });
  });

  describe('Context-Aware Responses', () => {
    test('should build appropriate system prompt from context', async () => {
      await client.startSession(mockContext);

      const systemPrompt = (client as any).buildSystemPrompt();

      expect(systemPrompt).toContain('Senior Software Engineer');
      expect(systemPrompt).toContain('Tech Corp');
      expect(systemPrompt).toContain('JavaScript');
      expect(systemPrompt).toContain('React');
      expect(systemPrompt).toContain('Node.js');
      expect(systemPrompt).toContain('SENIOR');
      expect(systemPrompt).toContain('Describe your experience with React hooks');
      expect(systemPrompt).toContain('1 of 2'); // Current question index
    });

    test('should update system context when question changes', async () => {
      await client.startSession(mockContext);

      // Move to next question
      client.updateContext({ currentQuestionIndex: 1 });

      const systemPrompt = (client as any).buildSystemPrompt();
      expect(systemPrompt).toContain('How would you optimize a slow React component?');
      expect(systemPrompt).toContain('2 of 2');
    });
  });

  describe('Audio Timing and Buffering', () => {
    test('should handle rapid audio chunks without dropping data', async () => {
      const audioEvents: any[] = [];
      client.on('audio-received', (data) => audioEvents.push(data));

      await client.startSession(mockContext);
      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateMessage({ setupComplete: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Send multiple rapid audio chunks
      for (let i = 0; i < 5; i++) {
        mockWs.simulateAudioMessage(new ArrayBuffer(512));
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      expect(audioEvents).toHaveLength(5);
      expect(client.isAISpeaking).toBe(true);
    });

    test('should handle audio finishing callback timing', async () => {
      const speakingEvents: string[] = [];
      client.on('ai-speaking-start', () => speakingEvents.push('start'));
      client.on('ai-speaking-stop', () => speakingEvents.push('stop'));

      await client.startSession(mockContext);
      const mockWs = (client as any).client.ws as MockWebSocket;
      mockWs.simulateMessage({ setupComplete: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Start audio
      mockWs.simulateAudioMessage(new ArrayBuffer(1024));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(speakingEvents).toEqual(['start']);

      // Finish audio
      mockWs.simulateMessage({ serverContent: { turnComplete: true } });
      
      // Should not immediately stop (callback-based)
      expect(speakingEvents).toEqual(['start']);

      // Wait for callback
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(speakingEvents).toEqual(['start', 'stop']);
    });
  });

  describe('Resource Cleanup', () => {
    test('should properly cleanup all resources on session end', async () => {
      await client.startSession(mockContext);
      await client.startListening();

      expect(client.isConnected).toBe(true);
      expect(client.isListening).toBe(true);

      await client.endSession();

      expect(client.isConnected).toBe(false);
      expect(client.isListening).toBe(false);
      expect(client.isAISpeaking).toBe(false);
      expect(client.currentContext).toBe(null);
    });

    test('should handle cleanup errors gracefully', async () => {
      await client.startSession(mockContext);
      
      // Mock cleanup errors
      const mockStreamer = (client as any).audioStreamer;
      if (mockStreamer) {
        mockStreamer.stop = jest.fn(() => {
          throw new Error('Cleanup error');
        });
      }

      // Should not throw
      await expect(client.endSession()).resolves.toBeUndefined();
    });
  });
});