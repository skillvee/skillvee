import type {
  GeminiLiveConfig,
  InterviewContext,
  GeminiLiveEventType,
  GeminiLiveEventHandler,
  ConversationSession,
  ConversationTurn,
  ScreenCapture,
} from '../types';
import { AudioRecorder } from '../audio/recorder';
import { AudioStreamer } from '../audio/streamer';
import { ScreenRecorder } from '../video/screen-recorder';
import { GeminiWebSocketClient } from './websocket-client';

/**
 * Main Gemini Live client that orchestrates everything
 *
 * Architecture:
 * - AudioRecorder: Captures microphone using AudioWorklet
 * - GeminiWebSocketClient: Manages WebSocket connection to Gemini Live
 * - AudioStreamer: Handles audio playback with smart buffering
 * - Event system: Type-safe event handling for all audio/connection states
 *
 * Usage:
 * ```typescript
 * const client = createGeminiLiveClient({ apiKey: 'your-key' });
 * await client.startSession(interviewContext);
 * await client.startListening();
 * ```
 */
export class GeminiLiveClient {
  private config: GeminiLiveConfig;
  private context: InterviewContext | null = null;
  private client: GeminiWebSocketClient | null = null;
  private audioRecorder: AudioRecorder | null = null;
  private audioStreamer: AudioStreamer | null = null;
  private audioContext: AudioContext | null = null;
  private screenRecorder: ScreenRecorder | null = null;
  private eventHandlers = new Map<GeminiLiveEventType, Set<GeminiLiveEventHandler>>();

  private _isConnected = false;
  private _isListening = false;
  private _isAISpeaking = false;
  private _isScreenRecording = false;

  // Conversation tracking
  private conversationSession: ConversationSession | null = null;
  private currentTurn: ConversationTurn | null = null;

  constructor(config: GeminiLiveConfig) {
    this.config = config;
  }

  async startSession(context: InterviewContext): Promise<void> {
    try {
      if (!this.config.apiKey || this.config.apiKey === 'test-gemini-api-key') {
        throw new Error('Valid API key required');
      }

      // Store context
      this.context = context;

      // Initialize conversation session
      this.conversationSession = {
        sessionId: crypto.randomUUID(),
        startTime: new Date().toISOString(),
        model: this.config.model,
        turns: [],
        screenCaptures: [],
        analytics: {
          totalTurns: 0,
          userTurns: 0,
          assistantTurns: 0,
          userSpeakingTime: 0,
          aiSpeakingTime: 0,
          averageResponseTime: 0,
          interruptionCount: 0
        }
      };

      // Initialize audio context
      this.audioContext = new AudioContext();
      this.audioStreamer = new AudioStreamer(this.audioContext);
      await this.audioStreamer.initialize();

      // Setup WebSocket client
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;

      const geminiConfig = {
        model: this.config.model,
        generationConfig: {
          responseModalities: this.config.responseModalities,
          speechConfig: this.config.responseModalities.includes('AUDIO') ? {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voice || 'Puck'
              }
            }
          } : undefined,
        },
        systemInstruction: {
          parts: [{
            text: this.buildSystemPrompt()
          }]
        },
        // Enable transcription capabilities
        ...(this.config.enableInputTranscription && {
          inputAudioTranscription: {}
        }),
        ...(this.config.enableOutputTranscription && {
          outputAudioTranscription: {}
        })
      };

      this.client = new GeminiWebSocketClient(wsUrl, geminiConfig);
      this.setupEventListeners();

      await this.client.connect();
      this._isConnected = true;

    } catch (error) {
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('connected', () => {
      this.emit('connected', {});
    });

    this.client.on('disconnected', (data) => {
      this._isConnected = false;
      this._isListening = false;
      this._isAISpeaking = false;
      this.emit('disconnected', data);
    });

    this.client.on('audio', (audioData: ArrayBuffer) => {
      if (this.audioStreamer) {
        // Reset finishing state when new audio arrives
        this.audioStreamer.resetFinishing();

        this._isAISpeaking = true;
        this.emit('ai-speaking-start', {});
        this.audioStreamer.streamAudio(new Uint8Array(audioData));
        this.emit('audio-received', { data: audioData });
      }
    });

    this.client.on('text-received', (data) => {
      this.emit('text-received', data);
    });

    this.client.on('user-transcript', (data) => {
      this.handleUserTranscript(data.transcript, data.timestamp);
      this.emit('user-transcript', data);
    });

    this.client.on('ai-transcript', (data) => {
      this.handleAITranscript(data.transcript, data.timestamp);
      this.emit('ai-transcript', data);
    });

    this.client.on('turn-complete', () => {
      // Let audio finish playing naturally instead of cutting it off
      if (this.audioStreamer) {
        this.audioStreamer.finishPlayback(() => {
          // Called when audio actually finishes playing
          this._isAISpeaking = false;
          this.emit('ai-speaking-stop', {});
        });
      } else {
        // No audio streamer, change state immediately
        this._isAISpeaking = false;
        this.emit('ai-speaking-stop', {});
      }

      this.emit('turn-complete', {});
    });

    this.client.on('interrupted', () => {
      this._isAISpeaking = false;
      this.audioStreamer?.stop();
      this.emit('interrupted', {});
      this.emit('ai-speaking-stop', {});
    });

    this.client.on('error', (data) => {
      this.emit('error', data);
    });
  }

  async startListening(): Promise<void> {
    if (this._isListening || !this._isConnected) {
      return;
    }

    try {
      this.audioRecorder = new AudioRecorder();
      await this.audioRecorder.start((base64Audio) => {
        if (this.client) {
          this.client.sendAudio(base64Audio);
        }
      });

      this._isListening = true;
      this.emit('listening-start', {});
    } catch (error) {
      console.error('[GeminiLive] Failed to start listening:', error);
      throw error;
    }
  }

  stopListening(): void {
    if (!this._isListening) return;

    if (this.audioRecorder) {
      this.audioRecorder.stop();
      this.audioRecorder = null;
    }

    this._isListening = false;
    this.emit('listening-stop', {});
  }

  async startScreenRecording(captureIntervalMs: number = 1000, externalStream?: MediaStream): Promise<void> {
    if (!this.config.enableScreenCapture) {
      throw new Error('Screen capture not enabled in config');
    }

    if (this._isScreenRecording) return;

    try {
      this.screenRecorder = new ScreenRecorder();
      await this.screenRecorder.start(
        (capture) => {
          this.handleScreenCapture(capture);
          this.emit('screen-capture', capture);
        },
        undefined,
        captureIntervalMs,
        externalStream
      );

      this._isScreenRecording = true;
    } catch (error) {
      throw error;
    }
  }

  stopScreenRecording(): void {
    if (!this._isScreenRecording || !this.screenRecorder) return;

    this.screenRecorder.stop();
    this.screenRecorder = null;
    this._isScreenRecording = false;
  }

  sendInitialGreeting(): void {
    if (!this.client || !this._isConnected) return;

    const greeting = `Hello! I'm here for the ${this.context?.jobTitle} interview. Please introduce yourself and let's begin!`;
    this.client.sendText(greeting);
  }

  sendText(text: string, endOfTurn = true): void {
    if (!this.client || !this._isConnected) {
      console.warn('[GeminiLiveClient] Cannot send text: client not connected');
      return;
    }
    this.client.sendText(text, endOfTurn);
  }

  private handleUserTranscript(transcript: string, timestamp: string): void {
    if (!this.conversationSession) return;

    // Create or update current user turn
    if (!this.currentTurn || this.currentTurn.role !== 'user') {
      this.currentTurn = {
        id: crypto.randomUUID(),
        timestamp,
        role: 'user',
        content: {
          transcript
        }
      };
      this.conversationSession.turns.push(this.currentTurn);
      this.conversationSession.analytics.userTurns++;
      this.conversationSession.analytics.totalTurns++;
    } else {
      // Append to existing transcript
      this.currentTurn.content.transcript = (this.currentTurn.content.transcript || '') + ' ' + transcript;
    }
  }

  private handleAITranscript(transcript: string, timestamp: string): void {
    if (!this.conversationSession) return;

    // Create or update current AI turn
    if (!this.currentTurn || this.currentTurn.role !== 'assistant') {
      this.currentTurn = {
        id: crypto.randomUUID(),
        timestamp,
        role: 'assistant',
        content: {
          transcript
        }
      };
      this.conversationSession.turns.push(this.currentTurn);
      this.conversationSession.analytics.assistantTurns++;
      this.conversationSession.analytics.totalTurns++;
    } else {
      // Append to existing transcript
      this.currentTurn.content.transcript = (this.currentTurn.content.transcript || '') + ' ' + transcript;
    }
  }

  private handleScreenCapture(capture: ScreenCapture): void {
    if (!this.conversationSession) return;

    // Store locally for conversation export
    this.conversationSession.screenCaptures.push(capture);

    if (this.client && this._isConnected) {
      this.client.sendVideo(capture.data, capture.mimeType)
        .catch(error => {
          console.error('[GeminiLive] Failed to send screen capture to API:', error);
        });
    }
  }

  updateContext(contextUpdate: Partial<InterviewContext>): void {
    if (!this.context) return;
    this.context = { ...this.context, ...contextUpdate };
  }

  async endSession(): Promise<ConversationSession | null> {
    try {
      this.stopListening();
      this.stopScreenRecording();

      // Finalize conversation session
      if (this.conversationSession) {
        this.conversationSession.endTime = new Date().toISOString();
        const startTime = new Date(this.conversationSession.startTime);
        const endTime = new Date(this.conversationSession.endTime);
        this.conversationSession.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        // Calculate analytics
        this.updateSessionAnalytics();
      }

      if (this.audioStreamer) {
        this.audioStreamer.stop();
        this.audioStreamer = null;
      }

      if (this.client) {
        this.client.disconnect();
        this.client = null;
      }

      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      this._isConnected = false;
      this._isListening = false;
      this._isAISpeaking = false;
      this._isScreenRecording = false;

      const session = this.conversationSession;
      this.conversationSession = null;
      this.currentTurn = null;

      return session;

    } catch (error) {
      console.error('Error ending session:', error);
      return null;
    }
  }

  private updateSessionAnalytics(): void {
    if (!this.conversationSession) return;

    const analytics = this.conversationSession.analytics;
    const turns = this.conversationSession.turns;

    // Calculate response times, speaking times, etc.
    let totalResponseTime = 0;
    let responseCount = 0;

    for (let i = 1; i < turns.length; i++) {
      const prevTurn = turns[i - 1]!;
      const currentTurn = turns[i]!;

      if (prevTurn.role === 'user' && currentTurn.role === 'assistant') {
        const prevTime = new Date(prevTurn.timestamp).getTime();
        const currentTime = new Date(currentTurn.timestamp).getTime();
        totalResponseTime += (currentTime - prevTime) / 1000;
        responseCount++;
      }
    }

    analytics.averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
  }

  exportConversation(): ConversationSession | null {
    return this.conversationSession ? { ...this.conversationSession } : null;
  }

  private buildSystemPrompt(): string {
    if (!this.context) return this.config.systemInstruction || '';

    const basePrompt = this.config.systemInstruction || `You are an AI interviewer conducting a technical interview for a ${this.context.jobTitle} position.`;

    return `${basePrompt}

Interview Context:
- Company: ${this.context.companyName || 'Tech Company'}
- Role: ${this.context.jobTitle}
- Focus Areas: ${this.context.focusAreas.join(', ')}
- Difficulty Level: ${this.context.difficulty}
- Current Question: ${this.context.currentQuestionIndex + 1} of ${this.context.questions.length}

Current Question: "${this.context.questions[this.context.currentQuestionIndex]?.questionText || 'No question available'}"

Instructions:
1. Listen carefully to the candidate's response
2. Provide follow-up questions when appropriate
3. Ask probing questions if answers seem incomplete
4. Encourage thinking out loud
5. Be supportive but professional
6. Keep responses concise (10-30 seconds)
7. Focus on technical aspects relevant to the current question
8. Provide constructive feedback when appropriate

Respond naturally as a human interviewer. The candidate is waiting for your response.`;
  }

  // Event handling
  on<T = any>(event: GeminiLiveEventType, handler: GeminiLiveEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off<T = any>(event: GeminiLiveEventType, handler: GeminiLiveEventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit<T = any>(event: GeminiLiveEventType, data: T): void {
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

  // Getters
  get isConnected(): boolean {
    return this._isConnected;
  }

  get isListening(): boolean {
    return this._isListening;
  }

  get isAISpeaking(): boolean {
    return this._isAISpeaking;
  }

  get currentContext(): InterviewContext | null {
    return this.context;
  }

  get isScreenRecording(): boolean {
    return this._isScreenRecording;
  }

  get conversationData(): ConversationSession | null {
    return this.conversationSession;
  }

  /**
   * Get the microphone MediaStream from the audio recorder
   * Useful for combining with screen recording to create composite streams
   * @returns The microphone MediaStream, or null if not listening
   */
  get microphoneStream(): MediaStream | null {
    return this.audioRecorder?.microphoneStream || null;
  }

  /**
   * Get the AI audio output stream
   * Useful for combining with video recording to capture AI's voice
   * @returns The AI audio MediaStream, or null if not initialized
   */
  get aiAudioStream(): MediaStream | null {
    return this.audioStreamer?.audioStream || null;
  }
}

/**
 * Create a Gemini Live client with configuration
 */
export function createGeminiLiveClient(overrides: Partial<GeminiLiveConfig> & { apiKey: string }): GeminiLiveClient {
  const config: GeminiLiveConfig = {
    model: 'models/gemini-2.0-flash-exp',
    responseModalities: ['AUDIO'],
    voice: 'Puck',
    enableInputTranscription: false,
    enableOutputTranscription: false,
    enableScreenCapture: false,
    ...overrides,
  };

  return new GeminiLiveClient(config);
}
