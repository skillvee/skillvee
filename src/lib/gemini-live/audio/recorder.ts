/**
 * AudioRecorder handles microphone input using modern AudioWorklet
 *
 * Features:
 * - Modern AudioWorklet (non-deprecated)
 * - Continuous streaming to WebSocket
 * - Proper cleanup and error handling
 * - Base64 encoding for transmission
 */
export class AudioRecorder {
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
      console.log('[AudioRecorder] Requesting microphone access...');
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
      console.log('[AudioRecorder] ✅ Microphone stream acquired:', this.stream.id);

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

  /**
   * Get the underlying microphone MediaStream
   * Useful for combining with other streams (e.g., screen recording)
   * @returns The microphone MediaStream, or null if not recording
   */
  get microphoneStream(): MediaStream | null {
    return this.stream;
  }
}
