/**
 * @jest-environment jsdom
 */

import { AudioStreamer } from '../streamer';

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};

  createGain = jest.fn().mockReturnValue({
    gain: {
      setValueAtTime: jest.fn()
    },
    connect: jest.fn()
  });

  createMediaStreamDestination = jest.fn().mockReturnValue({
    stream: { id: 'mock-stream' },
    connect: jest.fn()
  });

  createBuffer = jest.fn().mockImplementation((channels: number, length: number, sampleRate: number) => ({
    getChannelData: jest.fn().mockReturnValue(new Float32Array(length)),
    duration: length / sampleRate
  }));

  createBufferSource = jest.fn().mockReturnValue({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn(),
    onended: null
  });

  resume = jest.fn().mockResolvedValue(undefined);
  close = jest.fn().mockResolvedValue(undefined);
}

(global as any).AudioContext = MockAudioContext;

describe('AudioStreamer', () => {
  let audioContext: AudioContext;
  let streamer: AudioStreamer;

  beforeEach(() => {
    jest.useFakeTimers();
    audioContext = new AudioContext();
    streamer = new AudioStreamer(audioContext);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create gain node and destination', () => {
      expect(audioContext.createGain).toHaveBeenCalled();
      expect(audioContext.createMediaStreamDestination).toHaveBeenCalled();
    });

    it('should initialize and resume audio context when suspended', async () => {
      // Set context to suspended state
      (audioContext as any).state = 'suspended';

      await streamer.initialize();
      expect(audioContext.resume).toHaveBeenCalled();
    });
  });

  describe('streamAudio()', () => {
    beforeEach(async () => {
      await streamer.initialize();
    });

    it('should ignore empty chunks', () => {
      const emptyChunk = new Uint8Array(0);
      streamer.streamAudio(emptyChunk);

      expect((streamer as any).audioQueue.length).toBe(0);
    });

    it('should accumulate audio in processing buffer', () => {
      const chunk1 = new Uint8Array(100);
      const chunk2 = new Uint8Array(100);

      streamer.streamAudio(chunk1);
      const bufferLength1 = (streamer as any).processingBuffer.length;

      streamer.streamAudio(chunk2);
      const bufferLength2 = (streamer as any).processingBuffer.length;

      expect(bufferLength2).toBeGreaterThan(bufferLength1);
    });

    it('should not accept audio when finishing', async () => {
      await streamer.initialize();

      // Set finishing state
      (streamer as any).isFinishing = true;

      const chunk = new Uint8Array(100);
      streamer.streamAudio(chunk);

      // Processing buffer should remain empty
      expect((streamer as any).processingBuffer.length).toBe(0);
    });
  });

  describe('finishPlayback()', () => {
    beforeEach(async () => {
      await streamer.initialize();
    });

    it('should set finishing flag when there is audio to play', () => {
      // Add some audio to the queue so isFinishing stays true
      (streamer as any).processingBuffer = new Float32Array(100);

      streamer.finishPlayback();
      expect((streamer as any).isFinishing).toBe(true);
    });

    it('should flush processing buffer to queue', () => {
      // Add some data to processing buffer using the internal property
      const testBuffer = new Float32Array(100);
      for (let i = 0; i < testBuffer.length; i++) {
        testBuffer[i] = Math.random();
      }
      (streamer as any).processingBuffer = testBuffer;

      streamer.finishPlayback();

      const queue = (streamer as any).audioQueue;
      expect(queue.length).toBeGreaterThan(0);
      expect((streamer as any).processingBuffer.length).toBe(0);
    });
  });

  describe('stop()', () => {
    beforeEach(async () => {
      await streamer.initialize();
    });

    it('should stop playback', () => {
      (streamer as any).isPlaying = true;

      streamer.stop();

      expect((streamer as any).isPlaying).toBe(false);
    });

    it('should clear audio queue', () => {
      (streamer as any).audioQueue = [new Float32Array(100)];

      streamer.stop();

      expect((streamer as any).audioQueue.length).toBe(0);
    });
  });

  describe('audioStream getter', () => {
    it('should return MediaStream from destination', () => {
      const stream = streamer.audioStream;
      expect(stream).toBeDefined();
      expect(stream.id).toBe('mock-stream');
    });
  });
});
