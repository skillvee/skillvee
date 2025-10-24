/**
 * @jest-environment jsdom
 */

import { AudioRecorder } from '../recorder';

// Mock AudioWorklet and Web Audio API
class MockAudioContext {
  state = 'running';
  sampleRate = 16000;
  currentTime = 0;
  destination = {};
  audioWorklet = {
    addModule: jest.fn().mockResolvedValue(undefined)
  };

  createMediaStreamSource = jest.fn().mockReturnValue({
    connect: jest.fn()
  });

  close = jest.fn().mockResolvedValue(undefined);
  resume = jest.fn().mockResolvedValue(undefined);
}

class MockAudioWorkletNode {
  port = {
    onmessage: null as ((event: any) => void) | null
  };

  connect = jest.fn();
}

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia
  }
});

// Mock AudioContext and AudioWorkletNode
(global as any).AudioContext = MockAudioContext;
(global as any).AudioWorkletNode = MockAudioWorkletNode;

describe('AudioRecorder', () => {
  let recorder: AudioRecorder;
  let mockStream: MediaStream;
  let mockTrack: MediaStreamTrack;

  beforeEach(() => {
    recorder = new AudioRecorder();

    // Create mock track
    mockTrack = {
      kind: 'audio',
      id: 'mock-track-id',
      label: 'Mock Microphone',
      enabled: true,
      muted: false,
      stop: jest.fn()
    } as any;

    // Create mock stream
    mockStream = {
      id: 'mock-stream-id',
      getTracks: jest.fn().mockReturnValue([mockTrack]),
      getAudioTracks: jest.fn().mockReturnValue([mockTrack])
    } as any;

    mockGetUserMedia.mockResolvedValue(mockStream);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start()', () => {
    it('should request microphone access with correct constraints', async () => {
      const onAudioData = jest.fn();

      await recorder.start(onAudioData);

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    });

    it('should process audio chunks and call onAudioData with base64', async () => {
      const onAudioData = jest.fn();

      await recorder.start(onAudioData);

      const processor = (recorder as any).processor;
      expect(processor).toBeDefined();

      // Simulate audio chunk from AudioWorklet
      const mockAudioBuffer = new ArrayBuffer(4);
      const view = new DataView(mockAudioBuffer);
      view.setInt16(0, 100, true);
      view.setInt16(2, 200, true);

      processor.port.onmessage({
        data: {
          event: 'chunk',
          data: {
            int16arrayBuffer: mockAudioBuffer
          }
        }
      });

      expect(onAudioData).toHaveBeenCalled();
      const base64Result = onAudioData.mock.calls[0][0];
      expect(typeof base64Result).toBe('string');
    });

    it('should throw error if getUserMedia fails', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      const onAudioData = jest.fn();

      await expect(recorder.start(onAudioData)).rejects.toThrow('Failed to start audio recording');
    });
  });

  describe('stop()', () => {
    it('should stop all tracks', async () => {
      const onAudioData = jest.fn();

      await recorder.start(onAudioData);
      recorder.stop();

      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('should handle stop when not recording', () => {
      expect(() => recorder.stop()).not.toThrow();
    });
  });

  describe('microphoneStream getter', () => {
    it('should return null when not recording', () => {
      expect(recorder.microphoneStream).toBeNull();
    });

    it('should return stream when recording', async () => {
      const onAudioData = jest.fn();

      await recorder.start(onAudioData);

      expect(recorder.microphoneStream).toBe(mockStream);
    });
  });
});
