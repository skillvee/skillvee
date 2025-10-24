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
export class AudioStreamer {
  private context: AudioContext;
  private audioQueue: Float32Array[] = [];
  private isPlaying = false;
  private isFinishing = false; // Flag to prevent new audio during finish
  private sampleRate = 24000;
  private bufferSize: number;
  private processingBuffer = new Float32Array(0);
  private scheduledTime = 0;
  private gainNode: GainNode;
  private destination: MediaStreamAudioDestinationNode;
  private isInitialized = false;
  private scheduledSources = new Set<AudioBufferSourceNode>();
  private onFinishCallback: (() => void) | null = null;

  constructor(context: AudioContext) {
    this.context = context;
    this.bufferSize = Math.floor(this.sampleRate * 0.32); // 320ms buffer
    this.gainNode = this.context.createGain();

    // Create MediaStreamDestination to capture AI audio for recording
    this.destination = this.context.createMediaStreamDestination();

    // Connect to BOTH speakers (for user to hear) and destination (for recording)
    this.gainNode.connect(this.context.destination);  // Speakers
    this.gainNode.connect(this.destination);          // Capture stream
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

  /**
   * Get the AI audio output stream for recording
   * @returns MediaStream containing the AI's audio output
   */
  get audioStream(): MediaStream {
    return this.destination.stream;
  }
}
