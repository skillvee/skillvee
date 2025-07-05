import { env } from "~/env";

/**
 * Gemini Live API WebSocket Client
 * Implements real-time bidirectional audio conversation with Gemini 2.0
 */

export interface GeminiLiveConfig {
  apiKey: string;
  model: 'models/gemini-2.0-flash-exp' | 'models/gemini-2.5-flash-preview-native-audio-dialog';
  responseModalities: ('AUDIO' | 'TEXT')[];
  systemInstruction?: string;
  voice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  audioConfig: {
    sampleRate: number;
    encoding: 'pcm16';
    channels: 1;
  };
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

export interface GeminiLiveSession {
  sessionId: string;
  isConnected: boolean;
  isListening: boolean;
  isAISpeaking: boolean;
  audioContext: AudioContext | null;
  websocket: WebSocket | null;
  context: InterviewContext;
  startTime: number;
  lastRenewal: number;
  expiresAt: number;
}

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}

export interface ServerMessage {
  serverContent?: {
    modelTurn?: {
      parts: Array<{
        inlineData?: {
          mimeType: string;
          data: string;
        };
        text?: string;
      }>;
    };
    turnComplete?: boolean;
    interrupted?: boolean;
  };
  setupComplete?: boolean;
  toolCall?: any;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export type GeminiLiveEventType = 
  | 'connected'
  | 'disconnected'
  | 'setup-complete'
  | 'audio-received'
  | 'text-received'
  | 'turn-complete'
  | 'interrupted'
  | 'error'
  | 'session-renewed'
  | 'listening-start'
  | 'listening-stop'
  | 'ai-speaking-start'
  | 'ai-speaking-stop';

export type GeminiLiveEventHandler<T = any> = (data: T) => void;

export class GeminiLiveClient {
  private config: GeminiLiveConfig;
  private session: GeminiLiveSession | null = null;
  private renewalTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private eventHandlers = new Map<GeminiLiveEventType, Set<GeminiLiveEventHandler>>();
  
  // Audio queue management
  private audioQueue: Array<{ buffer: AudioBuffer; timestamp: number }> = [];
  private isPlayingAudio = false;
  private setupCompleted = false;

  constructor(config: GeminiLiveConfig) {
    this.config = {
      ...config,
      audioConfig: {
        sampleRate: 16000, // Required by Gemini Live
        encoding: 'pcm16',
        channels: 1,
      },
    };
  }


  /**
   * Start a new Gemini Live session
   */
  async startSession(interviewContext: InterviewContext): Promise<void> {
    try {
      console.log('GeminiLiveClient: Starting session with config:', {
        ...this.config,
        apiKey: this.config.apiKey ? '[API_KEY_SET]' : '[API_KEY_MISSING]'
      });
      
      // Validate API key
      if (!this.config.apiKey || this.config.apiKey === 'test-gemini-api-key') {
        throw new Error('Google Generative AI API key is required. Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable.');
      }
      
      if (this.session?.isConnected) {
        await this.endSession();
      }

      // Reset state for new session
      this.setupCompleted = false;
      this.clearAudioQueue();

      // Initialize audio context with output sample rate (24kHz for Gemini Live output)
      console.log('GeminiLiveClient: Creating AudioContext...');
      const audioContext = new AudioContext({
        sampleRate: 24000, // Match Gemini Live output sample rate
      });

      // Create WebSocket connection
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;
      console.log('GeminiLiveClient: Creating WebSocket to:', wsUrl.replace(this.config.apiKey, '[API_KEY]'));
      const websocket = new WebSocket(wsUrl);

      const sessionId = this.generateSessionId();
      const now = Date.now();
      
      this.session = {
        sessionId,
        isConnected: false,
        isListening: false,
        isAISpeaking: false,
        audioContext,
        websocket,
        context: interviewContext,
        startTime: now,
        lastRenewal: now,
        expiresAt: now + (25 * 60 * 1000), // 25 minutes (conservative)
      };

      console.log('GeminiLiveClient: Setting up WebSocket handlers...');
      await this.setupWebSocketHandlers();
      
      console.log('GeminiLiveClient: Waiting for connection...');
      await this.waitForConnection();
      
      console.log('GeminiLiveClient: Initializing session...');
      await this.initializeSession();
      
      this.startRenewalTimer();
      this.reconnectAttempts = 0;
      
      console.log('GeminiLiveClient: Session started successfully, waiting for setup...');
      
      // Wait for setup completion before resolving
      await this.waitForSetupCompletion();

    } catch (error) {
      console.error('GeminiLiveClient: Failed to start session:', error);
      this.cleanup();
      throw new Error(`Failed to start Gemini Live session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private async setupWebSocketHandlers(): Promise<void> {
    if (!this.session?.websocket) return;

    const ws = this.session.websocket;

    ws.onopen = () => {
      console.log('GeminiLiveClient: WebSocket opened');
      if (this.session) {
        this.session.isConnected = true;
        console.log('GeminiLiveClient: Session marked as connected');
      }
    };

    ws.onmessage = async (event) => {
      try {
        // Check if the message is binary data (Blob/ArrayBuffer) or JSON
        if (event.data instanceof Blob) {
          // Convert Blob to text first to check if it's JSON or actual binary audio
          const text = await event.data.text();
          
          // Try to parse as JSON first (Gemini Live sends JSON as Blobs sometimes)
          try {
            const message: ServerMessage = JSON.parse(text);
            console.log('GeminiLiveClient: Received JSON message (from Blob):', message);
            this.handleServerMessage(message);
          } catch (jsonError) {
            // If JSON parsing fails, treat as binary audio data
            console.log('GeminiLiveClient: Received binary audio data, size:', event.data.size);
            this.handleAudioData(event.data);
          }
        } else if (event.data instanceof ArrayBuffer) {
          // Try to convert to string first to check if it's JSON
          const text = new TextDecoder().decode(event.data);
          try {
            const message: ServerMessage = JSON.parse(text);
            console.log('GeminiLiveClient: Received JSON message (from ArrayBuffer):', message);
            this.handleServerMessage(message);
          } catch (jsonError) {
            // If JSON parsing fails, treat as binary audio data
            console.log('GeminiLiveClient: Received ArrayBuffer audio data, size:', event.data.byteLength);
            this.handleAudioData(event.data);
          }
        } else if (typeof event.data === 'string') {
          // Parse JSON messages
          const message: ServerMessage = JSON.parse(event.data);
          console.log('GeminiLiveClient: Received JSON string message:', message);
          this.handleServerMessage(message);
        } else {
          console.warn('GeminiLiveClient: Received unknown message type:', typeof event.data);
        }
      } catch (error) {
        console.error('Failed to process WebSocket message:', error);
        this.emit('error', { error: 'Failed to parse server message' });
      }
    };

    ws.onclose = (event) => {
      console.log('GeminiLiveClient: WebSocket closed', event.code, event.reason);
      if (this.session) {
        this.session.isConnected = false;
        this.session.isListening = false;
        this.session.isAISpeaking = false;
      }
      this.emit('disconnected', { code: event.code, reason: event.reason });
      this.handleDisconnection(event.code);
    };

    ws.onerror = (error) => {
      console.error('GeminiLiveClient: WebSocket error:', error);
      this.emit('error', { error: 'WebSocket connection error' });
    };
  }

  /**
   * Wait for WebSocket connection to be established
   */
  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.session?.websocket) {
        reject(new Error('No WebSocket connection'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      const checkConnection = () => {
        if (this.session?.isConnected) {
          clearTimeout(timeout);
          resolve();
        } else if (this.session?.websocket?.readyState === WebSocket.CLOSED) {
          clearTimeout(timeout);
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  /**
   * Wait for setup completion
   */
  private async waitForSetupCompletion(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.setupCompleted) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Setup completion timeout'));
      }, 10000);

      const checkSetup = () => {
        if (this.setupCompleted) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkSetup, 100);
        }
      };

      checkSetup();
    });
  }

  /**
   * Initialize session with setup message
   */
  private async initializeSession(): Promise<void> {
    if (!this.session?.websocket || !this.session.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const setupMessage = {
      setup: {
        model: this.config.model,
        generation_config: {
          response_modalities: this.config.responseModalities,
          speech_config: this.config.responseModalities.includes('AUDIO') ? {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: this.config.voice || 'Puck'
              }
            }
          } : undefined,
        },
        system_instruction: {
          parts: [{
            text: this.buildSystemPrompt()
          }]
        }
      }
    };

    this.session.websocket.send(JSON.stringify(setupMessage));
  }

  /**
   * Build system prompt for interview context
   */
  private buildSystemPrompt(): string {
    const context = this.session?.context;
    if (!context) return this.config.systemInstruction || '';

    const basePrompt = this.config.systemInstruction || `You are an AI interviewer conducting a technical interview for a ${context.jobTitle} position.`;

    return `${basePrompt}

Interview Context:
- Company: ${context.companyName || 'Tech Company'}
- Role: ${context.jobTitle}
- Focus Areas: ${context.focusAreas.join(', ')}
- Difficulty Level: ${context.difficulty}
- Current Question: ${context.currentQuestionIndex + 1} of ${context.questions.length}

Current Question: "${context.questions[context.currentQuestionIndex]?.questionText || 'No question available'}"

Instructions:
1. Listen carefully to the candidate's response
2. Provide follow-up questions when appropriate to clarify or explore deeper
3. Ask probing questions if their answer seems incomplete or unclear
4. Encourage them to think out loud and explain their reasoning
5. Be supportive but professional in your tone
6. If they seem stuck, provide gentle hints without giving away the answer
7. Keep your responses concise (10-30 seconds of speech)
8. Don't move to the next question unless explicitly asked
9. Focus on the technical aspects relevant to the current question
10. Provide constructive feedback when appropriate

Respond naturally as if you're a human interviewer having a conversation. The candidate is waiting for your response.`;
  }

  /**
   * Handle server messages from Gemini Live
   */
  private handleServerMessage(message: ServerMessage): void {
    // Setup complete - mark session as properly initialized
    if (message.setupComplete) {
      console.log('GeminiLiveClient: Setup completed, session is now ready');
      this.setupCompleted = true;
      // Emit connected event now that setup is complete
      this.emit('connected', { sessionId: this.session?.sessionId });
      this.emit('setup-complete', {});
      
      // Don't send automatic greeting - wait for user to be ready
      console.log('GeminiLiveClient: Ready for user interaction, no automatic greeting');
      return;
    }

    // Server content (model responses)
    if (message.serverContent) {
      const { modelTurn, turnComplete, interrupted } = message.serverContent;

      if (modelTurn?.parts) {
        console.log('GeminiLiveClient: Processing modelTurn with', modelTurn.parts.length, 'parts');
        for (const part of modelTurn.parts) {
          console.log('GeminiLiveClient: Part structure:', {
            hasInlineData: !!part.inlineData,
            hasText: !!part.text,
            mimeType: part.inlineData?.mimeType,
            dataLength: part.inlineData?.data?.length,
            textContent: part.text?.substring(0, 100) + ((part.text?.length ?? 0) > 100 ? '...' : ''),
            partKeys: Object.keys(part)
          });
          
          // Handle audio response
          if (part.inlineData?.mimeType?.startsWith('audio/') && part.inlineData.data) {
            console.log('GeminiLiveClient: 🎵 Found audio data with MIME type:', part.inlineData.mimeType);
            this.handleAudioResponse(part.inlineData.data, part.inlineData.mimeType);
          }
          
          // Handle text response
          if (part.text) {
            console.log('GeminiLiveClient: 📝 Received text response:', part.text.substring(0, 200));
            this.emit('text-received', { text: part.text });
          }
        }
      } else if (message.serverContent.turnComplete) {
        console.log('GeminiLiveClient: Turn completed without modelTurn parts');
      } else {
        console.log('GeminiLiveClient: ServerContent without modelTurn parts:', {
          turnComplete: message.serverContent.turnComplete,
          interrupted: message.serverContent.interrupted,
          hasModelTurn: !!message.serverContent.modelTurn
        });
      }

      if (interrupted) {
        this.emit('interrupted', {});
        if (this.session) {
          this.session.isAISpeaking = false;
        }
        this.emit('ai-speaking-stop', {});
      }

      if (turnComplete) {
        this.emit('turn-complete', {});
        if (this.session) {
          this.session.isAISpeaking = false;
        }
        this.emit('ai-speaking-stop', {});
      }
    }

    // Tool calls
    if (message.toolCall) {
      // Handle tool calls if needed for future functionality
      console.log('Tool call received:', message.toolCall);
    }

    // Usage metadata
    if (message.usageMetadata) {
      console.log('Token usage:', message.usageMetadata);
    }
  }

  /**
   * Handle binary audio data from WebSocket
   */
  private async handleAudioData(audioData: Blob | ArrayBuffer): Promise<void> {
    try {
      console.log('GeminiLiveClient: Processing audio data...');
      
      // Convert Blob to ArrayBuffer if needed
      let buffer: ArrayBuffer;
      if (audioData instanceof Blob) {
        buffer = await audioData.arrayBuffer();
      } else {
        buffer = audioData;
      }
      
      // Debug: Log first few bytes to understand the data format
      const view = new Uint8Array(buffer);
      const firstBytes = Array.from(view.slice(0, Math.min(20, view.length)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
      console.log(`GeminiLiveClient: Audio buffer (${buffer.byteLength} bytes), first bytes: ${firstBytes}`);
      
      // Emit audio received event
      this.emit('audio-received', { 
        data: buffer, 
        size: buffer.byteLength,
        timestamp: Date.now()
      });
      
      // Mark AI as speaking when we receive audio data
      if (this.session) {
        this.session.isAISpeaking = true;
      }
      this.emit('ai-speaking-start', {});
      
      // Process the audio for playback
      await this.playAudioData(buffer);
      
    } catch (error) {
      console.error('Failed to handle audio data:', error);
      this.emit('error', { error: 'Failed to process audio data' });
    }
  }

  /**
   * Play audio data through the audio context
   */
  private async playAudioData(buffer: ArrayBuffer): Promise<void> {
    if (!this.session?.audioContext) return;
    
    try {
      // First try to decode as standard audio format (unlikely to work with Gemini Live)
      const audioBuffer = await this.session.audioContext.decodeAudioData(buffer.slice());
      
      // Create buffer source
      const source = this.session.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.session.audioContext.destination);
      
      // Play the audio
      source.start();
      
      console.log('GeminiLiveClient: ✅ Playing decoded audio response');
      
    } catch (error) {
      // Expected for Gemini Live - it sends raw PCM data, not encoded audio
      console.log('GeminiLiveClient: Decode failed (expected), trying raw PCM...');
      this.handleRawPCMAudio(buffer);
    }
  }

  /**
   * Handle raw PCM audio data
   */
  private handleRawPCMAudio(buffer: ArrayBuffer): void {
    try {
      if (!this.session?.audioContext) return;
      
      // Skip very small buffers (control/metadata)
      if (buffer.byteLength < 1000) {
        console.log('GeminiLiveClient: Skipping small audio buffer:', buffer.byteLength, 'bytes');
        return;
      }
      
      // Assume 16-bit PCM at 24kHz (Gemini Live output format)
      const sampleRate = 24000;
      const channels = 1;
      const bytesPerSample = 2;
      const sampleCount = buffer.byteLength / bytesPerSample;
      
      console.log('GeminiLiveClient: Processing PCM audio:', {
        bufferSize: buffer.byteLength,
        sampleCount,
        sampleRate,
        duration: sampleCount / sampleRate
      });
      
      // Ensure we have valid sample count
      if (sampleCount <= 0) {
        console.warn('GeminiLiveClient: Invalid sample count:', sampleCount);
        return;
      }
      
      // Create audio buffer
      const audioBuffer = this.session.audioContext.createBuffer(channels, sampleCount, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert 16-bit PCM to float32
      const view = new DataView(buffer);
      for (let i = 0; i < sampleCount; i++) {
        const sample = view.getInt16(i * 2, true); // little-endian
        channelData[i] = sample / 32768; // Convert to float32 range [-1, 1]
      }
      
      // Queue the audio instead of playing immediately
      this.queueAudioBuffer(audioBuffer);
      
      console.log('GeminiLiveClient: ✅ Queued raw PCM audio successfully');
      
    } catch (error) {
      console.error('Failed to handle raw PCM audio:', error);
    }
  }

  /**
   * Handle audio response from Gemini (base64 encoded PCM)
   */
  private async handleAudioResponse(base64Audio: string, mimeType?: string): Promise<void> {
    if (!this.session?.audioContext) return;

    try {
      console.log('GeminiLiveClient: Processing base64 audio response, length:', base64Audio.length);
      
      // Mark AI as speaking
      if (this.session && !this.session.isAISpeaking) {
        this.session.isAISpeaking = true;
        this.emit('ai-speaking-start', {});
      }

      // Decode base64 audio data to ArrayBuffer
      const audioData = this.base64ToArrayBuffer(base64Audio);
      console.log('GeminiLiveClient: Decoded base64 to ArrayBuffer, size:', audioData.byteLength);
      
      // Try standard audio decoding first
      try {
        const audioBuffer = await this.session.audioContext.decodeAudioData(audioData.slice());
        
        // Queue the successfully decoded audio
        this.queueAudioBuffer(audioBuffer);
        console.log('GeminiLiveClient: ✅ Queued audio response (standard decode)');
        
        this.emit('audio-received', { duration: audioBuffer.duration });
        
      } catch (decodeError) {
        // If standard decoding fails, try as raw PCM (24kHz, 16-bit)
        console.log('GeminiLiveClient: Standard decode failed, trying raw PCM...');
        this.handleRawPCMAudioFromBase64(audioData, mimeType);
      }

    } catch (error) {
      console.error('GeminiLiveClient: Error playing audio response:', error);
      this.emit('error', { error: 'Failed to play audio response' });
    }
  }

  /**
   * Handle raw PCM audio data decoded from base64
   */
  private handleRawPCMAudioFromBase64(buffer: ArrayBuffer, mimeType?: string): void {
    try {
      if (!this.session?.audioContext) return;
      
      console.log('GeminiLiveClient: Processing raw PCM from base64, size:', buffer.byteLength, 'mimeType:', mimeType);
      
      // Skip very small buffers
      if (buffer.byteLength < 100) {
        console.log('GeminiLiveClient: Skipping tiny buffer:', buffer.byteLength, 'bytes');
        return;
      }
      
      // Extract sample rate from MIME type (e.g., "audio/pcm;rate=24000")
      let sampleRate = 24000; // Default to 24kHz
      if (mimeType && mimeType.includes('rate=')) {
        const rateMatch = mimeType.match(/rate=(\d+)/);
        if (rateMatch && rateMatch[1]) {
          sampleRate = parseInt(rateMatch[1], 10);
        }
      }
      
      const channels = 1;
      const bytesPerSample = 2; // 16-bit PCM
      const sampleCount = buffer.byteLength / bytesPerSample;
      
      console.log('GeminiLiveClient: Processing base64 PCM audio:', {
        bufferSize: buffer.byteLength,
        sampleCount,
        sampleRate,
        duration: sampleCount / sampleRate,
        mimeType
      });
      
      // Ensure we have valid sample count
      if (sampleCount <= 0) {
        console.warn('GeminiLiveClient: Invalid sample count:', sampleCount);
        return;
      }
      
      // Create audio buffer with the correct sample rate
      const audioBuffer = this.session.audioContext.createBuffer(channels, sampleCount, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert 16-bit PCM to float32 (little-endian as per Gemini Live spec)
      const view = new DataView(buffer);
      for (let i = 0; i < sampleCount; i++) {
        const sample = view.getInt16(i * 2, true); // little-endian
        channelData[i] = sample / 32768; // Convert to float32 range [-1, 1]
      }
      
      // Queue the audio instead of playing immediately
      this.queueAudioBuffer(audioBuffer);
      
      console.log('GeminiLiveClient: ✅ Queued raw PCM audio from base64 successfully');
      
    } catch (error) {
      console.error('GeminiLiveClient: Failed to handle raw PCM audio from base64:', error);
    }
  }

  /**
   * Send initial greeting to start the conversation (call manually when ready)
   */
  public sendInitialGreeting(): void {
    if (!this.session?.websocket || !this.session.isConnected) {
      console.warn('GeminiLiveClient: Cannot send initial greeting - session not connected');
      return;
    }

    try {
      const context = this.session.context;
      const currentQuestion = context.questions[context.currentQuestionIndex];
      
      const greetingMessage = {
        client_content: {
          turns: [{
            role: 'user',
            parts: [{
              text: `Hello! I'm here for the ${context.jobTitle} interview. Please introduce yourself and let's begin!`
            }]
          }],
          turn_complete: true
        }
      };

      console.log('GeminiLiveClient: Sending initial greeting to start conversation');
      this.session.websocket.send(JSON.stringify(greetingMessage));
    } catch (error) {
      console.error('GeminiLiveClient: Failed to send initial greeting:', error);
    }
  }

  /**
   * Queue audio buffer for sequential playback
   */
  private queueAudioBuffer(audioBuffer: AudioBuffer): void {
    this.audioQueue.push({
      buffer: audioBuffer,
      timestamp: Date.now()
    });
    
    console.log('GeminiLiveClient: Audio queued, queue length:', this.audioQueue.length);
    
    // Start playing if not already playing
    if (!this.isPlayingAudio) {
      this.playNextAudioInQueue();
    }
  }

  /**
   * Play the next audio buffer in the queue
   */
  private playNextAudioInQueue(): void {
    if (this.audioQueue.length === 0 || !this.session?.audioContext) {
      this.isPlayingAudio = false;
      return;
    }

    this.isPlayingAudio = true;
    const { buffer } = this.audioQueue.shift()!;
    
    console.log('GeminiLiveClient: Playing audio buffer, remaining in queue:', this.audioQueue.length);

    // Create and play the audio source
    const source = this.session.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.session.audioContext.destination);
    
    // When this buffer finishes, play the next one
    source.onended = () => {
      console.log('GeminiLiveClient: Audio buffer finished, playing next...');
      this.playNextAudioInQueue();
    };
    
    source.start();
  }

  /**
   * Clear the audio queue
   */
  private clearAudioQueue(): void {
    this.audioQueue = [];
    this.isPlayingAudio = false;
    console.log('GeminiLiveClient: Audio queue cleared');
  }

  /**
   * Send audio chunk to Gemini Live
   */
  async sendAudioChunk(audioData: ArrayBuffer): Promise<void> {
    if (!this.session?.websocket || !this.session.isConnected) {
      throw new Error('Session not connected');
    }

    try {
      const base64Data = this.arrayBufferToBase64(audioData);
      
      const message = {
        realtime_input: {
          media_chunks: [{
            mime_type: 'audio/pcm',
            data: base64Data
          }]
        }
      };

      console.log('GeminiLiveClient: Sending audio chunk message, base64 length:', base64Data.length);
      this.session.websocket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send audio chunk:', error);
      this.emit('error', { error: 'Failed to send audio chunk' });
    }
  }

  /**
   * Update interview context (for question progression)
   */
  updateContext(contextUpdate: Partial<InterviewContext>): void {
    if (!this.session) return;

    this.session.context = { ...this.session.context, ...contextUpdate };
    
    // Send updated system instruction if context changed significantly
    if (contextUpdate.currentQuestionIndex !== undefined) {
      this.sendContextUpdate();
    }
  }

  /**
   * Send context update to maintain conversation state
   */
  private sendContextUpdate(): void {
    if (!this.session?.websocket || !this.session.isConnected) return;

    try {
      const message = {
        client_content: {
          turns: [{
            role: 'user',
            parts: [{
              text: `[CONTEXT UPDATE] We are now on question ${this.session.context.currentQuestionIndex + 1} of ${this.session.context.questions.length}. 

Current question: "${this.session.context.questions[this.session.context.currentQuestionIndex]?.questionText || 'No question available'}"

Please acknowledge this context change and be ready to discuss this question with the candidate.`
            }]
          }]
        }
      };

      this.session.websocket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send context update:', error);
    }
  }

  /**
   * Start listening for user audio input
   */
  async startListening(): Promise<void> {
    if (!this.session?.isConnected) {
      throw new Error('Session not connected');
    }

    if (this.session.isListening) {
      return; // Already listening
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.audioConfig.sampleRate,
          channelCount: this.config.audioConfig.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio processing chain
      const source = this.session.audioContext!.createMediaStreamSource(stream);
      const processor = this.session.audioContext!.createScriptProcessor(4096, 1, 1);
      
      // Process audio in real-time
      processor.onaudioprocess = async (event) => {
        if (!this.session?.isListening) return;

        const inputBuffer = event.inputBuffer.getChannelData(0);
        
        // Calculate RMS to check if there's actual audio input
        let rms = 0;
        for (let i = 0; i < inputBuffer.length; i++) {
          const sample = inputBuffer[i] ?? 0;
          rms += sample * sample;
        }
        rms = Math.sqrt(rms / inputBuffer.length);
        
        // Only send audio if there's significant input (not just noise)
        if (rms > 0.01) {
          const pcmData = this.convertToPCM16(inputBuffer);
          console.log('GeminiLiveClient: Sending audio chunk, RMS:', rms.toFixed(4), 'size:', pcmData.byteLength);
          
          try {
            await this.sendAudioChunk(pcmData);
          } catch (error) {
            console.error('Failed to send audio chunk:', error);
          }
        }
      };

      // Connect audio chain
      source.connect(processor);
      if (this.session.audioContext) {
        processor.connect(this.session.audioContext.destination);
      }

      // Store stream for cleanup
      (this.session as any).mediaStream = stream;
      (this.session as any).audioProcessor = processor;

      this.session.isListening = true;
      console.log('GeminiLiveClient: 🎤 Microphone started, isListening set to true, current state:', this.session.isListening);
      this.emit('listening-start', {});

    } catch (error) {
      console.error('Failed to start listening:', error);
      this.emit('error', { error: 'Failed to access microphone' });
      throw error;
    }
  }

  /**
   * Stop listening for user audio input
   */
  stopListening(): void {
    if (!this.session || !this.session.isListening) return;

    // Stop media stream
    const mediaStream = (this.session as any).mediaStream as MediaStream;
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    // Disconnect audio processor
    const audioProcessor = (this.session as any).audioProcessor as ScriptProcessorNode;
    if (audioProcessor) {
      audioProcessor.disconnect();
    }

    this.session.isListening = false;
    this.emit('listening-stop', {});
  }

  /**
   * Session renewal with context preservation
   */
  private startRenewalTimer(): void {
    // Renew session 2 minutes before expiration
    const renewalTime = 23 * 60 * 1000; // 23 minutes
    
    this.renewalTimer = setTimeout(() => {
      this.renewSession();
    }, renewalTime);
  }

  /**
   * Renew session with context preservation
   */
  private async renewSession(): Promise<void> {
    if (!this.session) return;

    console.log('Renewing Gemini Live session...');
    
    try {
      // Save current context and state
      const currentContext = { ...this.session.context };
      const wasListening = this.session.isListening;
      
      // End current session gracefully
      await this.endSession(false); // Don't emit disconnected event
      
      // Start new session with preserved context
      await this.startSession(currentContext);
      
      // Restore listening state
      if (wasListening) {
        await this.startListening();
      }
      
      console.log('Session renewed successfully');
      this.emit('session-renewed', { sessionId: this.session.sessionId });
      
    } catch (error) {
      console.error('Failed to renew session:', error);
      this.emit('error', { error: 'Session renewal failed' });
    }
  }

  /**
   * Handle disconnection with retry logic
   */
  private async handleDisconnection(code: number): Promise<void> {
    if (code === 1000) {
      // Normal closure, don't reconnect
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) || 1000; // Exponential backoff
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(async () => {
        if (this.session) {
          try {
            const context = { ...this.session.context };
            await this.startSession(context);
          } catch (error) {
            console.error('Reconnection failed:', error);
          }
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('error', { error: 'Connection lost and unable to reconnect' });
    }
  }

  /**
   * End the current session
   */
  async endSession(emitDisconnected = true): Promise<void> {
    if (this.renewalTimer) {
      clearTimeout(this.renewalTimer);
      this.renewalTimer = null;
    }

    // Clear audio queue and reset state
    this.clearAudioQueue();
    this.setupCompleted = false;

    if (this.session) {
      // Stop listening
      this.stopListening();

      // Close WebSocket
      if (this.session.websocket && this.session.websocket.readyState === WebSocket.OPEN) {
        this.session.websocket.close(1000, 'Session ended');
      }

      // Close audio context
      if (this.session.audioContext && this.session.audioContext.state !== 'closed') {
        await this.session.audioContext.close();
      }

      if (emitDisconnected) {
        this.emit('disconnected', { sessionId: this.session.sessionId });
      }
    }

    this.cleanup();
  }

  /**
   * Cleanup session resources
   */
  private cleanup(): void {
    this.session = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Event handling
   */
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

  /**
   * Utility methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i] || 0);
    }
    return btoa(binary);
  }

  private convertToPCM16(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < float32Array.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Array[i] || 0));
      view.setInt16(i * 2, sample * 0x7FFF, true);
    }
    
    return buffer;
  }

  /**
   * Getters for session state
   */
  get isConnected(): boolean {
    return (this.session?.isConnected && this.setupCompleted) ?? false;
  }

  get isListening(): boolean {
    return this.session?.isListening ?? false;
  }

  get isAISpeaking(): boolean {
    return this.session?.isAISpeaking ?? false;
  }

  get sessionId(): string | null {
    return this.session?.sessionId ?? null;
  }

  get currentContext(): InterviewContext | null {
    return this.session?.context ?? null;
  }
}

/**
 * Create a Gemini Live client with configuration (API key must be provided)
 */
export function createGeminiLiveClient(overrides: Partial<GeminiLiveConfig> & { apiKey: string }): GeminiLiveClient {
  const config: GeminiLiveConfig = {
    model: 'models/gemini-2.0-flash-exp', // Correct model name for Gemini Live API
    responseModalities: ['AUDIO'],
    voice: 'Puck',
    audioConfig: {
      sampleRate: 16000,
      encoding: 'pcm16',
      channels: 1,
    },
    ...overrides,
  };

  return new GeminiLiveClient(config);
}