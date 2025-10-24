import type { ScreenCapture } from '../types';

/**
 * ScreenRecorder handles screen capture using MediaRecorder API
 *
 * Features:
 * - Screen sharing with getDisplayMedia
 * - Periodic screenshot capture
 * - Stream video data to WebSocket
 * - Automatic cleanup and error handling
 */
export class ScreenRecorder {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private captureInterval: NodeJS.Timeout | null = null;
  private onScreenCapture: ((capture: ScreenCapture) => void) | null = null;
  private onVideoChunk: ((base64: string) => void) | null = null;
  private isRecording = false;
  private isExternalStream = false;

  /**
   * Start screen recording
   * @param onScreenCapture Callback for periodic screenshots
   * @param onVideoChunk Callback for video stream data
   * @param captureIntervalMs Interval for taking screenshots (default: 1000ms for 1 FPS)
   * @param externalStream Optional external MediaStream to use instead of requesting new one
   */
  async start(
    onScreenCapture: (capture: ScreenCapture) => void,
    onVideoChunk?: (base64: string) => void,
    captureIntervalMs: number = 1000,
    externalStream?: MediaStream
  ): Promise<void> {
    this.onScreenCapture = onScreenCapture;
    this.onVideoChunk = onVideoChunk || null;

    try {
      // Use external stream if provided, otherwise request screen sharing permission
      if (externalStream) {
        this.stream = externalStream;
        this.isExternalStream = true;
      } else {
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 15 }
          } as DisplayMediaStreamOptions['video'],
          audio: false // We handle audio separately
        });
        this.isExternalStream = false;
      }

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

      // Stop all tracks only if we own the stream
      if (this.stream && !this.isExternalStream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
      this.stream = null;
      this.isExternalStream = false;

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
