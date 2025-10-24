/**
 * WebSocket client for Gemini Live API
 *
 * Handles:
 * - Connection management with retry logic
 * - Message parsing and event emission
 * - Audio/text message sending
 * - Setup and configuration
 */
export class GeminiWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private config: any;
  private eventHandlers = new Map<string, Set<(data: any) => void>>();
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(url: string, config: any) {
    this.url = url;
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return this.connectionPromise!;
    }

    if (this.isConnecting) {
      return this.connectionPromise!;
    }

    this.isConnecting = true;

    this.connectionPromise = new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);

      ws.addEventListener('open', () => {
        this.ws = ws;
        this.isConnecting = false;

        // Send setup message
        this.sendJSON({ setup: this.config });
        resolve();
      });

      ws.addEventListener('error', (error) => {
        console.error('[WebSocketClient] Connection error:', error);
        this.isConnecting = false;
        reject(error);
      });

      ws.addEventListener('message', async (event) => {
        if (event.data instanceof Blob) {
          await this.handleMessage(event.data);
        }
      });

      ws.addEventListener('close', (event) => {
        this.emit('disconnected', { code: event.code, reason: event.reason });
      });
    });

    return this.connectionPromise;
  }

  private async handleMessage(blob: Blob): Promise<void> {
    try {
      const text = await blob.text();
      const response = JSON.parse(text);

      // Handle setup completion
      if (response.setupComplete) {
        this.emit('connected', {});
        return;
      }

      // Handle server content
      if (response.serverContent) {
        if (response.serverContent.interrupted) {
          this.emit('interrupted', {});
          return;
        }

        if (response.serverContent.turnComplete) {
          this.emit('turn-complete', {});
        }

        // Handle input transcription (user speech)
        if (response.serverContent.inputTranscription) {
          this.emit('user-transcript', {
            transcript: response.serverContent.inputTranscription.text,
            timestamp: new Date().toISOString()
          });
        }

        // Handle output transcription (AI speech)
        if (response.serverContent.outputTranscription) {
          this.emit('ai-transcript', {
            transcript: response.serverContent.outputTranscription.text,
            timestamp: new Date().toISOString()
          });
        }

        if (response.serverContent.modelTurn) {
          const parts = response.serverContent.modelTurn.parts;

          // Process audio parts
          const audioParts = parts.filter((p: any) =>
            p.inlineData && p.inlineData.mimeType.startsWith('audio/pcm')
          );

          audioParts.forEach((part: any) => {
            if (part.inlineData?.data) {
              const audioData = this.base64ToArrayBuffer(part.inlineData.data);
              this.emit('audio', audioData);
            }
          });

          // Process text parts
          const textParts = parts.filter((p: any) => p.text);
          textParts.forEach((part: any) => {
            this.emit('text-received', { text: part.text });
          });
        }
      }
    } catch (error) {
      console.error('[WebSocketClient] Error processing message:', error);
      this.emit('error', { error: 'Failed to process message' });
    }
  }

  async sendAudio(base64audio: string): Promise<void> {
    const data = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm',
          data: base64audio
        }]
      }
    };
    await this.sendJSON(data);
  }

  async sendText(text: string, endOfTurn = true): Promise<void> {
    const data = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text: text }]
        }],
        turnComplete: endOfTurn
      }
    };
    await this.sendJSON(data);
  }

  async sendVideo(base64Data: string, mimeType: string = "image/jpeg"): Promise<void> {
    const data = {
      realtimeInput: {
        mediaChunks: [{
          mimeType,
          data: base64Data
        }]
      }
    };
    console.log(`[WebSocketClient] Sending video frame (${mimeType}, ${Math.round(base64Data.length / 1024)}KB)`);
    await this.sendJSON(data);
  }

  private async sendJSON(json: any): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(json));
    } else {
      console.warn('[WebSocketClient] Cannot send - WebSocket not open');
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
}
