/**
 * @jest-environment jsdom
 */

import { GeminiWebSocketClient } from '../websocket-client';

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  readyState = MockWebSocket.OPEN;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  addEventListener = jest.fn((event: string, handler: any) => {
    if (event === 'open') this.onopen = handler;
    if (event === 'message') this.onmessage = handler;
    if (event === 'error') this.onerror = handler;
    if (event === 'close') this.onclose = handler;
  });

  send = jest.fn();
  close = jest.fn();

  simulateOpen() {
    setTimeout(() => this.onopen?.(new Event('open')), 0);
  }

  async simulateMessage(data: any) {
    const jsonString = JSON.stringify(data);
    // Create a proper mock Blob with text() method
    const blob = {
      text: async () => jsonString,
      size: jsonString.length,
      type: 'application/json'
    } as Blob;

    if (this.onmessage) {
      await this.onmessage(new MessageEvent('message', { data: blob }));
    }
    // Give time for async blob.text() and handlers to process
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  simulateClose(code = 1000, reason = '') {
    this.onclose?.(new CloseEvent('close', { code, reason }));
  }
}

(global as any).WebSocket = MockWebSocket;

describe('GeminiWebSocketClient', () => {
  let client: GeminiWebSocketClient;
  let mockWsInstance: MockWebSocket;
  const url = 'wss://test.example.com';
  const config = { model: 'test-model' };

  beforeEach(() => {
    // Reset mockWsInstance
    mockWsInstance = null as any;

    // Store reference to mock instance when WebSocket is constructed
    const OriginalMockWebSocket = (global as any).WebSocket;
    (global as any).WebSocket = class extends OriginalMockWebSocket {
      constructor(...args: any[]) {
        super(...args);
        mockWsInstance = this as any;
      }
    };

    client = new GeminiWebSocketClient(url, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect()', () => {
    it('should create WebSocket connection', async () => {
      const connectPromise = client.connect();
      mockWsInstance.simulateOpen();
      await connectPromise;

      expect((client as any).ws).toBeDefined();
    });

    it('should send setup message on connect', async () => {
      const connectPromise = client.connect();
      mockWsInstance.simulateOpen();
      await connectPromise;

      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({ setup: config }));
    });

    it('should emit connected event on setup complete', async () => {
      const handler = jest.fn();
      client.on('connected', handler);

      const connectPromise = client.connect();

      // Wait for WebSocket to be created and message listener to be attached
      await new Promise(resolve => setTimeout(resolve, 0));

      mockWsInstance.simulateOpen();
      await connectPromise;

      // Now send the message
      await mockWsInstance.simulateMessage({ setupComplete: true });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    it('should emit user-transcript event', async () => {
      const handler = jest.fn();
      client.on('user-transcript', handler);

      const connectPromise = client.connect();

      // Wait for WebSocket to be created and message listener to be attached
      await new Promise(resolve => setTimeout(resolve, 0));

      mockWsInstance.simulateOpen();
      await connectPromise;

      await mockWsInstance.simulateMessage({
        serverContent: {
          inputTranscription: { text: 'Hello' }
        }
      });

      expect(handler).toHaveBeenCalledWith({
        transcript: 'Hello',
        timestamp: expect.any(String)
      });
    });

    it('should emit turn-complete event', async () => {
      const handler = jest.fn();
      client.on('turn-complete', handler);

      const connectPromise = client.connect();

      // Wait for WebSocket to be created and message listener to be attached
      await new Promise(resolve => setTimeout(resolve, 0));

      mockWsInstance.simulateOpen();
      await connectPromise;

      await mockWsInstance.simulateMessage({
        serverContent: { turnComplete: true }
      });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('sendAudio()', () => {
    it('should send audio data correctly', async () => {
      const connectPromise = client.connect();
      mockWsInstance.simulateOpen();
      await connectPromise;

      await client.sendAudio('base64audiodata');

      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({
        realtimeInput: {
          mediaChunks: [{
            mimeType: 'audio/pcm',
            data: 'base64audiodata'
          }]
        }
      }));
    });
  });

  describe('sendText()', () => {
    it('should send text message', async () => {
      const connectPromise = client.connect();
      mockWsInstance.simulateOpen();
      await connectPromise;

      await client.sendText('Hello AI');

      expect(mockWsInstance.send).toHaveBeenCalledWith(JSON.stringify({
        clientContent: {
          turns: [{
            role: 'user',
            parts: [{ text: 'Hello AI' }]
          }],
          turnComplete: true
        }
      }));
    });
  });

  describe('disconnect()', () => {
    it('should close WebSocket', async () => {
      const connectPromise = client.connect();
      mockWsInstance.simulateOpen();
      await connectPromise;

      client.disconnect();

      expect(mockWsInstance.close).toHaveBeenCalled();
    });
  });
});
