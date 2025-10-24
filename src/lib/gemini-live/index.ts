/**
 * Gemini Live API Integration
 *
 * Main entry point for the modular Gemini Live implementation.
 * Re-exports all public APIs for backward compatibility.
 *
 * Import from this file to use the Gemini Live API:
 * ```typescript
 * import { GeminiLiveClient, createGeminiLiveClient } from '~/lib/gemini-live';
 * ```
 */

// Type exports
export type {
  GeminiLiveConfig,
  InterviewContext,
  Question,
  GeminiLiveEventType,
  GeminiLiveEventHandler,
  ConversationTurn,
  ScreenCapture,
  ConversationSession,
} from './types';

// Audio exports
export { AudioRecorder } from './audio/recorder';
export { AudioStreamer } from './audio/streamer';

// Video exports
export { ScreenRecorder } from './video/screen-recorder';

// Client exports
export { GeminiWebSocketClient } from './client/websocket-client';
export { GeminiLiveClient, createGeminiLiveClient } from './client/gemini-client';
