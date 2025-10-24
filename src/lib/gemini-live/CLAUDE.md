# Gemini Live Module

## Purpose
Client-side real-time WebSocket API integration for Gemini Live audio/video streaming.
This is **separate** from `server/ai/` which handles server-side text-based AI processing.

## Architecture Overview
Modular implementation with clear separation of concerns:
- **Audio capture & playback** (browser AudioWorklet API)
- **Video capture** (browser MediaRecorder API)
- **WebSocket communication** (Gemini Live WebSocket API)
- **Session orchestration** (main client class)

## Directory Structure

```
gemini-live/
├── types.ts                          # TypeScript interfaces, types, enums
├── audio/                            # Audio capture and playback
│   ├── recorder.ts                   # Microphone input using AudioWorklet
│   ├── streamer.ts                   # Audio playback with smart buffering
│   ├── __tests__/                    # Audio module tests
│   └── index.ts                      # Audio module exports
├── video/                            # Video capture
│   ├── screen-recorder.ts            # Screen sharing and screenshot capture
│   ├── __tests__/                    # Video module tests
│   └── index.ts                      # Video module exports
├── client/                           # API communication
│   ├── websocket-client.ts           # WebSocket connection management
│   ├── gemini-client.ts              # Main orchestrator class
│   ├── __tests__/                    # Client module tests
│   └── index.ts                      # Client module exports
└── index.ts                          # Public API exports
```

## Usage

### Always import from the main module for backward compatibility:
```typescript
import { GeminiLiveClient, createGeminiLiveClient } from '~/lib/gemini-live';
```

### For internal development, you can import specific modules:
```typescript
import { AudioRecorder } from '~/lib/gemini-live/audio/recorder';
import { GeminiWebSocketClient } from '~/lib/gemini-live/client/websocket-client';
```

## Modifying Specific Features

### Audio Issues
- **Microphone capture**: Check `audio/recorder.ts`
  - AudioWorklet setup, getUserMedia permissions
  - Base64 encoding for transmission
- **Audio playback**: Check `audio/streamer.ts`
  - Smart buffering (320ms chunks)
  - Web Audio API scheduling
  - Graceful finish without cutoffs
- **Audio mixing**: Check root `src/lib/audio-mixer.ts`
  - Combining microphone + AI audio for recording

### Video Issues
- **Screen sharing**: Check `video/screen-recorder.ts`
  - getDisplayMedia API
  - Periodic screenshot capture (1 FPS)
  - External stream support

### Connection Problems
- **WebSocket**: Check `client/websocket-client.ts`
  - Connection establishment and retry
  - Message parsing (serverContent, setupComplete)
  - Event emission system
- **Session management**: Check `client/gemini-client.ts`
  - Session lifecycle (start/end)
  - Event handler delegation
  - Conversation tracking and export

### Type Definitions
- **All interfaces/types**: Check `types.ts`
  - GeminiLiveConfig
  - InterviewContext
  - ConversationSession
  - Event types

## Testing

Each module has dedicated unit tests in `__tests__/` folders:
- `audio/__tests__/recorder.test.ts` - AudioRecorder tests
- `audio/__tests__/streamer.test.ts` - AudioStreamer tests
- `video/__tests__/screen-recorder.test.ts` - ScreenRecorder tests
- `client/__tests__/websocket-client.test.ts` - WebSocket client tests
- `client/__tests__/gemini-client.test.ts` - Main client tests

Integration tests remain at `src/lib/__tests__/gemini-live-integration.test.ts`

## Related Code

- **React hook**: `src/hooks/useGeminiLive.ts` - React wrapper around GeminiLiveClient
- **UI component**: `src/components/interview/LiveInterviewSession.tsx` - Main interview UI
- **Server AI**: `src/server/ai/` - **SEPARATE** server-side text-based AI (job analysis, case generation)
  - Uses `@google/generative-ai` SDK (different from Gemini Live WebSocket)
  - Request/response pattern (not streaming)
  - Runs on server via tRPC

## Key Differences: lib/gemini-live vs server/ai

| Feature | lib/gemini-live | server/ai |
|---------|----------------|-----------|
| **Purpose** | Real-time interview conversations | Job analysis, case generation |
| **API** | Gemini Live WebSocket | Google Generative AI SDK |
| **Location** | Client-side (browser) | Server-side (tRPC) |
| **Communication** | Bidirectional streaming | Request/response |
| **Data** | Audio/video streams | Text prompts/responses |
| **Use Case** | Live AI interviewer | Generate interview questions |

## File Size Breakdown

Before refactoring: **1,314 lines** in single file

After refactoring:
- `types.ts`: 103 lines
- `audio/recorder.ts`: 106 lines
- `audio/streamer.ts`: 212 lines
- `video/screen-recorder.ts`: 158 lines
- `client/websocket-client.ts`: 213 lines
- `client/gemini-client.ts`: 474 lines
- **Total**: 1,266 lines (plus 431 lines of dead code removed)
- **Tests**: 5 new test files with comprehensive coverage

## Common Tasks

### Adding a new event type:
1. Add to `GeminiLiveEventType` in `types.ts`
2. Emit from `client/gemini-client.ts` or `client/websocket-client.ts`
3. Handle in `hooks/useGeminiLive.ts`

### Changing audio format:
1. Update `audio/recorder.ts` - AudioWorklet processing
2. Update `client/websocket-client.ts` - mimeType in sendAudio()

### Adding screen capture features:
1. Modify `video/screen-recorder.ts`
2. Update `client/gemini-client.ts` - startScreenRecording() options
