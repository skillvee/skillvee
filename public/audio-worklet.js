/**
 * AudioWorklet processor for real-time audio processing
 * Converts Float32 audio to Int16 format for Gemini Live API
 */
class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = new Int16Array(2048);
        this.bufferWriteIndex = 0;
    }

    process(inputs) {
        if (inputs[0].length) {
            const channel0 = inputs[0][0];
            this.processChunk(channel0);
        }
        return true;
    }

    processChunk(float32Array) {
        try {
            for (let i = 0; i < float32Array.length; i++) {
                // Convert Float32 to Int16 with proper clamping
                const int16Value = Math.max(-32768, Math.min(32767, Math.floor(float32Array[i] * 32768)));
                this.buffer[this.bufferWriteIndex++] = int16Value;

                // Send buffer when full
                if (this.bufferWriteIndex >= this.buffer.length) {
                    this.sendAndClearBuffer();
                }
            }
        } catch (error) {
            this.port.postMessage({
                event: 'error',
                error: {
                    message: error.message,
                    stack: error.stack
                }
            });
        }
    }

    sendAndClearBuffer() {
        this.port.postMessage({
            event: 'chunk',
            data: {
                int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
            },
        });
        this.bufferWriteIndex = 0;
    }
}

registerProcessor('audio-processor', AudioProcessor);