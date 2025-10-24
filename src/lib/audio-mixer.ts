/**
 * AudioMixer - Combines multiple audio streams into a single mixed output stream
 *
 * Uses Web Audio API to mix multiple MediaStream audio tracks into one,
 * which is essential for recording both microphone and AI audio in a single
 * video file that plays correctly in all video players.
 *
 * @example
 * const mixer = new AudioMixer(48000);
 * mixer.addStream(microphoneStream);
 * mixer.addStream(aiAudioStream);
 * const mixedStream = mixer.getOutputStream();
 * // Use mixedStream in MediaRecorder
 * mixer.cleanup(); // When done
 */
export class AudioMixer {
  private audioContext: AudioContext;
  private destination: MediaStreamAudioDestinationNode;
  private sources: MediaStreamAudioSourceNode[] = [];
  private gainNodes: GainNode[] = [];

  /**
   * Create a new AudioMixer
   * @param sampleRate - Sample rate for the audio context (default: 48000 Hz)
   */
  constructor(sampleRate: number = 48000) {
    this.audioContext = new AudioContext({ sampleRate });
    this.destination = this.audioContext.createMediaStreamDestination();
  }

  /**
   * Add an audio stream to the mix
   * @param stream - MediaStream containing audio tracks to add
   * @param gain - Volume level (0.0 to 1.0, default: 1.0)
   */
  addStream(stream: MediaStream, gain: number = 1.0): void {
    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length === 0) {
      return;
    }

    // Create a source from the stream
    const source = this.audioContext.createMediaStreamSource(stream);

    // Create a gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = gain;

    // Connect: source → gain → destination
    source.connect(gainNode);
    gainNode.connect(this.destination);

    // Store references for cleanup
    this.sources.push(source);
    this.gainNodes.push(gainNode);
  }

  /**
   * Get the mixed output stream
   * @returns MediaStream containing a single mixed audio track
   */
  getOutputStream(): MediaStream {
    return this.destination.stream;
  }

  /**
   * Adjust the volume of a specific input stream
   * @param index - Index of the stream (order it was added)
   * @param gain - New volume level (0.0 to 1.0)
   */
  setGain(index: number, gain: number): void {
    if (index >= 0 && index < this.gainNodes.length) {
      this.gainNodes[index]!.gain.value = gain;
    }
  }

  /**
   * Clean up audio context and connections
   */
  cleanup(): void {
    // Disconnect all nodes
    this.sources.forEach(source => source.disconnect());
    this.gainNodes.forEach(gainNode => gainNode.disconnect());

    // Close audio context
    void this.audioContext.close();

    // Clear references
    this.sources = [];
    this.gainNodes = [];
  }
}
