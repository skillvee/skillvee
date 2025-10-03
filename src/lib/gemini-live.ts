import { env } from "~/env";

/**
 * Modern Gemini Live API implementation based on working JavaScript example
 * Uses AudioWorklet and proper buffering for stable audio communication
 */

export interface GeminiLiveConfig {
  apiKey: string;
  model: 'models/gemini-2.0-flash-exp' | 'models/gemini-2.5-flash-preview-native-audio-dialog';
  responseModalities: ('AUDIO' | 'TEXT')[];
  systemInstruction?: string;
  voice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  enableInputTranscription?: boolean;
  enableOutputTranscription?: boolean;
  enableScreenCapture?: boolean;
}

export interface InterviewContext {
  interviewId: string;
  jobTitle: string;
  companyName?: string;
  focusAreas: string[];
  difficulty: 'JUNIOR' | 'MEDIUM' | 'SENIOR';
  questions: Question[];
  currentQuestionIndex: number;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  expectedAnswer?: string;
  evaluationCriteria?: string[];
  timeAllocation?: number;
  followUpQuestions?: string[];
}

export type GeminiLiveEventType =
  | 'connected'
  | 'disconnected'
  | 'audio-received'
  | 'text-received'
  | 'user-transcript'
  | 'ai-transcript'
  | 'screen-capture'
  | 'turn-complete'
  | 'interrupted'
  | 'error'
  | 'listening-start'
  | 'listening-stop'
  | 'ai-speaking-start'
  | 'ai-speaking-stop';

export type GeminiLiveEventHandler<T = any> = (data: T) => void;

export interface ConversationTurn {
  id: string;
  timestamp: string;
  role: 'user' | 'assistant';
  content: {
    audio?: {
      data: string; // base64
      mimeType: string;
      duration?: number;
    };
    text?: string;
    transcript?: string;
  };
  metadata?: {
    turnComplete?: boolean;
    interrupted?: boolean;
  };
}

export interface ScreenCapture {
  id: string;
  timestamp: string;
  data: string; // base64 image
  mimeType: string;
  width: number;
  height: number;
}

export interface ConversationSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  model: string;
  turns: ConversationTurn[];
  screenCaptures: ScreenCapture[];
  analytics: {
    totalTurns: number;
    userTurns: number;
    assistantTurns: number;
    userSpeakingTime: number;
    aiSpeakingTime: number;
    averageResponseTime: number;
    interruptionCount: number;
  };
}

/**
 * AudioRecorder handles microphone input using modern AudioWorklet
 * 
 * Features:
 * - Modern AudioWorklet (non-deprecated)
 * - Continuous streaming to WebSocket
 * - Proper cleanup and error handling
 * - Base64 encoding for transmission
 */
class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: AudioWorkletNode | null = null;
  private onAudioData: ((base64: string) => void) | null = null;
  private isRecording = false;

  /**
   * Start recording audio from microphone
   * @param onAudioData Callback for processed audio chunks (base64 encoded)
   */
  async start(onAudioData: (base64: string) => void): Promise<void> {
    this.onAudioData = onAudioData;
    
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Initialize Web Audio API
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      // Load AudioWorklet
      await this.audioContext.audioWorklet.addModule('/audio-worklet.js');
      this.processor = new AudioWorkletNode(this.audioContext, 'audio-processor');
      
      // Handle processed audio chunks
      this.processor.port.onmessage = (event) => {
        if (!this.isRecording) return;
        
        if (event.data.event === 'chunk' && this.onAudioData) {
          const base64Data = this.arrayBufferToBase64(event.data.data.int16arrayBuffer);
          this.onAudioData(base64Data);
        }
      };

      // Connect audio pipeline
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      this.isRecording = true;
      
    } catch (error) {
      throw new Error('Failed to start audio recording: ' + error);
    }
  }

  /**
   * Stop recording and cleanup resources
   */
  stop(): void {
    try {
      if (!this.isRecording) return;

      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      this.isRecording = false;

      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    } catch (error) {
      throw new Error('Failed to stop audio recording: ' + error);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
  }
}

/**
 * ScreenRecorder handles screen capture using MediaRecorder API
 *
 * Features:
 * - Screen sharing with getDisplayMedia
 * - Periodic screenshot capture
 * - Stream video data to WebSocket
 * - Automatic cleanup and error handling
 */
class ScreenRecorder {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private captureInterval: NodeJS.Timeout | null = null;
  private onScreenCapture: ((capture: ScreenCapture) => void) | null = null;
  private onVideoChunk: ((base64: string) => void) | null = null;
  private isRecording = false;

  /**
   * Start screen recording
   * @param onScreenCapture Callback for periodic screenshots
   * @param onVideoChunk Callback for video stream data
   * @param captureIntervalMs Interval for taking screenshots (default: 5000ms)
   */
  async start(
    onScreenCapture: (capture: ScreenCapture) => void,
    onVideoChunk?: (base64: string) => void,
    captureIntervalMs: number = 5000
  ): Promise<void> {
    this.onScreenCapture = onScreenCapture;
    this.onVideoChunk = onVideoChunk || null;

    try {
      // Request screen sharing permission
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 15 }
        } as DisplayMediaStreamOptions['video'],
        audio: false // We handle audio separately
      });

      // Setup video element for frame capture
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.play();

      // Setup canvas for screenshot capture
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');

      this.isRecording = true;

      // Start periodic screenshot capture
      this.captureInterval = setInterval(() => {
        if (this.isRecording) {
          this.captureScreenshot();
        }
      }, captureIntervalMs);

      // Handle stream end (user stops sharing)
      this.stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        this.stop();
      });

    } catch (error) {
      throw new Error('Failed to start screen recording: ' + error);
    }
  }

  private captureScreenshot(): void {
    if (!this.videoElement || !this.canvas || !this.context || !this.onScreenCapture) {
      return;
    }

    try {
      // Set canvas dimensions to match video
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;

      // Draw current video frame to canvas
      this.context.drawImage(this.videoElement, 0, 0);

      // Convert to base64
      const dataUrl = this.canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = dataUrl.split(',')[1]!;

      const capture: ScreenCapture = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        data: base64Data,
        mimeType: 'image/jpeg',
        width: this.canvas.width,
        height: this.canvas.height
      };

      this.onScreenCapture(capture);

    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }

  /**
   * Stop screen recording and cleanup resources
   */
  stop(): void {
    try {
      if (!this.isRecording) return;

      // Clear interval
      if (this.captureInterval) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
      }

      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      // Cleanup video element
      if (this.videoElement) {
        this.videoElement.srcObject = null;
        this.videoElement = null;
      }

      // Cleanup canvas
      this.canvas = null;
      this.context = null;

      this.isRecording = false;

    } catch (error) {
      console.error('Failed to stop screen recording:', error);
    }
  }

  get isActive(): boolean {
    return this.isRecording;
  }
}

/**
 * AudioStreamer handles audio playback with proper buffering
 * 
 * Key Features:
 * - Smart buffering system (320ms chunks)
 * - Smooth audio scheduling with Web Audio API
 * - Graceful finishing without cutoffs
 * - Memory efficient queue management
 * - Cross-browser compatible (Chrome, Firefox, Safari, Edge)
 */
class AudioStreamer {
  private context: AudioContext;
  private audioQueue: Float32Array[] = [];
  private isPlaying = false;
  private isFinishing = false; // Flag to prevent new audio during finish
  private sampleRate = 24000;
  private bufferSize: number;
  private processingBuffer = new Float32Array(0);
  private scheduledTime = 0;
  private gainNode: GainNode;
  private isInitialized = false;
  private scheduledSources = new Set<AudioBufferSourceNode>();
  private onFinishCallback: (() => void) | null = null;

  constructor(context: AudioContext) {
    this.context = context;
    this.bufferSize = Math.floor(this.sampleRate * 0.32); // 320ms buffer
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
  }

  async initialize(): Promise<void> {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    this.scheduledTime = this.context.currentTime + 0.05; // 50ms initial delay
    this.gainNode.gain.setValueAtTime(1, this.context.currentTime);
    this.isInitialized = true;
  }

  streamAudio(chunk: Uint8Array): void {
    if (!this.isInitialized) {
      return;
    }

    if (!chunk || chunk.length === 0) {
      return;
    }

    // Don't accept new audio if we're finishing playback
    if (this.isFinishing) {
      return;
    }

    try {
      // Convert Int16 to Float32
      const float32Array = new Float32Array(chunk.length / 2);
      const dataView = new DataView(chunk.buffer);

      for (let i = 0; i < chunk.length / 2; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Array[i] = int16 / 32768; // Scale to [-1.0, 1.0]
      }

      // Accumulate in processing buffer
      const newBuffer = new Float32Array(this.processingBuffer.length + float32Array.length);
      newBuffer.set(this.processingBuffer);
      newBuffer.set(float32Array, this.processingBuffer.length);
      this.processingBuffer = newBuffer;

      // Split into playable chunks
      while (this.processingBuffer.length >= this.bufferSize) {
        const buffer = this.processingBuffer.slice(0, this.bufferSize);
        this.audioQueue.push(buffer);
        this.processingBuffer = this.processingBuffer.slice(this.bufferSize);
      }

      // Start playback if not already playing
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.scheduleNextBuffer();
      }
    } catch (error) {
      // Audio processing error - ignore to maintain stream continuity
    }
  }

  private scheduleNextBuffer(): void {
    if (!this.isPlaying) return;

    const SCHEDULE_AHEAD_TIME = 0.2;

    try {
      // Schedule buffers within look-ahead window
      while (this.audioQueue.length > 0 && this.scheduledTime < this.context.currentTime + SCHEDULE_AHEAD_TIME) {
        const audioData = this.audioQueue.shift()!;
        const audioBuffer = this.createAudioBuffer(audioData);
        const source = this.context.createBufferSource();

        // Track source
        this.scheduledSources.add(source);
        source.onended = () => {
          this.scheduledSources.delete(source);
        };

        source.buffer = audioBuffer;
        source.connect(this.gainNode);

        const startTime = Math.max(this.scheduledTime, this.context.currentTime);
        source.start(startTime);
        this.scheduledTime = startTime + audioBuffer.duration;
      }

      // Schedule next check
      if (this.audioQueue.length > 0) {
        const nextCheckTime = (this.scheduledTime - this.context.currentTime) * 1000;
        setTimeout(() => this.scheduleNextBuffer(), Math.max(0, nextCheckTime - 50));
      } else {
        this.isPlaying = false;
        // If we were finishing playback and queue is empty, we're done
        if (this.isFinishing) {
          this.isFinishing = false;
          if (this.onFinishCallback) {
            this.onFinishCallback();
            this.onFinishCallback = null;
          }
        }
      }
    } catch (error) {
      // Audio scheduling error - stop playback to prevent issues
      this.isPlaying = false;
    }
  }

  private createAudioBuffer(audioData: Float32Array): AudioBuffer {
    const audioBuffer = this.context.createBuffer(1, audioData.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(audioData);
    return audioBuffer;
  }

  /**
   * Finish audio playback gracefully without cutting off
   * @param onFinish Callback when all audio has finished playing
   */
  finishPlayback(onFinish?: () => void): void {
    this.isFinishing = true; // Stop accepting new audio
    this.onFinishCallback = onFinish || null;
    
    // Process any remaining audio in the buffer
    if (this.processingBuffer.length > 0) {
      this.audioQueue.push(this.processingBuffer);
      this.processingBuffer = new Float32Array(0);
    }
    
    // Continue playing the queue until empty - don't stop playing if already playing
    if (this.audioQueue.length > 0) {
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.scheduleNextBuffer();
      }
      // If already playing, the existing scheduleNextBuffer loop will handle the remaining queue
    } else {
      // No audio to play, call finish callback immediately
      if (this.onFinishCallback) {
        this.onFinishCallback();
        this.onFinishCallback = null;
      }
      this.isFinishing = false;
    }
  }

  resetFinishing(): void {
    this.isFinishing = false;
    this.onFinishCallback = null; // Clear any pending finish callback
  }

  stop(): void {
    this.isPlaying = false;
    this.isFinishing = false; // Reset finishing flag
    this.onFinishCallback = null; // Clear any pending finish callback
    
    // Stop all active sources
    for (const source of this.scheduledSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (error) {
        // Ignore errors from already stopped sources
      }
    }
    this.scheduledSources.clear();
    
    this.audioQueue = [];
    this.processingBuffer = new Float32Array(0);
    this.scheduledTime = this.context.currentTime;
  }
}

/**
 * WebSocket client for Gemini Live API
 * 
 * Handles:
 * - Connection management with retry logic
 * - Message parsing and event emission
 * - Audio/text message sending
 * - Setup and configuration
 */
class GeminiWebSocketClient {
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

  private async sendJSON(json: any): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(json));
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
    if (this._isListening || !this._isConnected) return;

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

  async startScreenRecording(captureIntervalMs: number = 5000): Promise<void> {
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
        captureIntervalMs
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

    this.conversationSession.screenCaptures.push(capture);
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