/**
 * @jest-environment jsdom
 */

import { ScreenRecorder } from '../screen-recorder';

// Mock getDisplayMedia
const mockGetDisplayMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  configurable: true,
  value: {
    getDisplayMedia: mockGetDisplayMedia
  }
});

// Mock crypto.randomUUID
const mockRandomUUID = jest.fn(() => 'mock-uuid-123');
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {};
}
global.crypto.randomUUID = mockRandomUUID;

describe('ScreenRecorder', () => {
  let recorder: ScreenRecorder;
  let mockStream: MediaStream;
  let mockVideoTrack: MediaStreamTrack;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockVideo: HTMLVideoElement;

  beforeEach(() => {
    jest.useFakeTimers();
    recorder = new ScreenRecorder();

    // Mock video track
    mockVideoTrack = {
      kind: 'video',
      id: 'mock-video-track',
      addEventListener: jest.fn(),
      stop: jest.fn()
    } as any;

    // Mock stream
    mockStream = {
      id: 'mock-stream-id',
      getTracks: jest.fn().mockReturnValue([mockVideoTrack]),
      getVideoTracks: jest.fn().mockReturnValue([mockVideoTrack])
    } as any;

    mockGetDisplayMedia.mockResolvedValue(mockStream);

    // Mock canvas and context
    mockContext = {
      drawImage: jest.fn()
    } as any;

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn().mockReturnValue(mockContext),
      toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,mockbase64data')
    } as any;

    // Mock video element
    mockVideo = {
      srcObject: null,
      videoWidth: 1920,
      videoHeight: 1080,
      play: jest.fn().mockResolvedValue(undefined)
    } as any;

    // Mock document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as any;
      if (tagName === 'video') return mockVideo as any;
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('start() without external stream', () => {
    it('should request screen sharing permission', async () => {
      const onScreenCapture = jest.fn();

      await recorder.start(onScreenCapture);

      expect(mockGetDisplayMedia).toHaveBeenCalled();
    });

    it('should create video element and set stream', async () => {
      const onScreenCapture = jest.fn();

      await recorder.start(onScreenCapture);

      expect(document.createElement).toHaveBeenCalledWith('video');
      expect(mockVideo.srcObject).toBe(mockStream);
      expect(mockVideo.play).toHaveBeenCalled();
    });

    it('should start periodic screenshot capture at specified interval', async () => {
      const onScreenCapture = jest.fn();
      const captureIntervalMs = 2000;

      await recorder.start(onScreenCapture, undefined, captureIntervalMs);

      // Fast-forward time
      jest.advanceTimersByTime(captureIntervalMs);

      expect(onScreenCapture).toHaveBeenCalled();
    });
  });

  describe('start() with external stream', () => {
    it('should use external stream instead of requesting permission', async () => {
      const onScreenCapture = jest.fn();
      const externalStream = mockStream;

      await recorder.start(onScreenCapture, undefined, 1000, externalStream);

      expect(mockGetDisplayMedia).not.toHaveBeenCalled();
      expect(mockVideo.srcObject).toBe(externalStream);
    });
  });

  describe('screenshot capture', () => {
    it('should capture screenshot with correct dimensions', async () => {
      const onScreenCapture = jest.fn();

      await recorder.start(onScreenCapture);

      jest.advanceTimersByTime(1000);

      expect(mockCanvas.width).toBe(1920);
      expect(mockCanvas.height).toBe(1080);
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockVideo, 0, 0);
    });

    it('should emit screen capture event with correct format', async () => {
      const onScreenCapture = jest.fn();

      await recorder.start(onScreenCapture);

      jest.advanceTimersByTime(1000);

      expect(onScreenCapture).toHaveBeenCalledWith({
        id: 'mock-uuid-123',
        timestamp: expect.any(String),
        data: 'mockbase64data',
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080
      });
    });
  });

  describe('stop()', () => {
    it('should stop tracks when stream is not external', async () => {
      const onScreenCapture = jest.fn();

      await recorder.start(onScreenCapture);
      recorder.stop();

      expect(mockVideoTrack.stop).toHaveBeenCalled();
    });

    it('should NOT stop tracks when stream is external', async () => {
      const onScreenCapture = jest.fn();
      const externalStream = mockStream;

      await recorder.start(onScreenCapture, undefined, 1000, externalStream);
      recorder.stop();

      expect(mockVideoTrack.stop).not.toHaveBeenCalled();
    });

    it('should set isRecording to false', async () => {
      const onScreenCapture = jest.fn();

      await recorder.start(onScreenCapture);
      expect(recorder.isActive).toBe(true);

      recorder.stop();
      expect(recorder.isActive).toBe(false);
    });
  });

  describe('isActive getter', () => {
    it('should return false when not recording', () => {
      expect(recorder.isActive).toBe(false);
    });

    it('should return true when recording', async () => {
      const onScreenCapture = jest.fn();

      await recorder.start(onScreenCapture);

      expect(recorder.isActive).toBe(true);
    });
  });
});
