# Single Screen Sharing Prompt - Implementation Complete

**Date:** 2025-10-17
**Status:** ✅ **COMPLETE - Ready for Testing**

---

## 🎯 Problem Solved

Previously, users were prompted **twice** for screen sharing:
1. Once by Gemini Live for AI screen capture
2. Once by the video recorder for question-level recording

This created a confusing user experience and the AI couldn't see the screen when screen capture was disabled.

## ✅ Solution Implemented

**Centralized Stream Management with Dependency Injection**

The screen is now requested **once** at the LiveInterviewSession level, and the MediaStream is shared between:
1. **ScreenRecorder** (for AI screenshots every 5 seconds)
2. **MediaRecorder** (for question-level video recording)

---

## 📦 Changes Made

### Phase 1: Modified ScreenRecorder Class
**File:** `src/lib/gemini-live.ts`

**Changes:**
- Added `isExternalStream: boolean` property to track if stream is owned
- Updated `start()` method to accept optional `externalStream?: MediaStream` parameter
- Modified `stop()` method to only stop tracks if `!this.isExternalStream`

**Key Code:**
```typescript
async start(
  onScreenCapture: (capture: ScreenCapture) => void,
  onVideoChunk?: (base64: string) => void,
  captureIntervalMs: number = 5000,
  externalStream?: MediaStream  // NEW
): Promise<void> {
  // Use external stream if provided
  if (externalStream) {
    this.stream = externalStream;
    this.isExternalStream = true;
  } else {
    this.stream = await navigator.mediaDevices.getDisplayMedia({...});
    this.isExternalStream = false;
  }
  // ...
}

stop(): void {
  // Only stop tracks if we own the stream
  if (this.stream && !this.isExternalStream) {
    this.stream.getTracks().forEach(track => track.stop());
  }
  this.stream = null;
  this.isExternalStream = false;
  // ...
}
```

### Phase 2: Modified useQuestionVideoRecorder Hook
**File:** `src/hooks/useQuestionVideoRecorder.ts`

**Changes:**
- Added `providedStream?: MediaStream` to hook props
- Added `ownsStreamRef` to track stream ownership
- Updated `initialize()` to use provided stream if available
- Updated `cleanup()` to only stop tracks if `ownsStreamRef.current === true`

**Key Code:**
```typescript
interface UseQuestionVideoRecorderProps {
  // ... other props
  providedStream?: MediaStream;  // NEW
}

const initialize = useCallback(async () => {
  let stream: MediaStream;

  if (providedStream) {
    console.log("[Recorder] Using provided external stream");
    stream = providedStream;
    ownsStreamRef.current = false;
  } else {
    console.log("[Recorder] Requesting new screen capture");
    stream = await navigator.mediaDevices.getDisplayMedia({...});
    ownsStreamRef.current = true;
  }
  // ...
}, [providedStream, onError]);

const cleanup = useCallback(() => {
  // Only stop tracks if we own the stream
  if (streamRef.current && ownsStreamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
  }
  // ...
}, []);
```

### Phase 3: Modified GeminiLiveClient & Hook
**File:** `src/lib/gemini-live.ts` + `src/hooks/useGeminiLive.ts`

**Changes:**
- Updated `GeminiLiveClient.startScreenRecording()` to accept `externalStream?: MediaStream`
- Updated `useGeminiLive` hook's `startScreenRecording()` to accept and pass external stream

**Key Code:**
```typescript
// In GeminiLiveClient
async startScreenRecording(
  captureIntervalMs: number = 5000,
  externalStream?: MediaStream  // NEW
): Promise<void> {
  this.screenRecorder = new ScreenRecorder();
  await this.screenRecorder.start(
    (capture) => { ... },
    undefined,
    captureIntervalMs,
    externalStream  // PASS IT THROUGH
  );
  // ...
}

// In useGeminiLive hook
const startScreenRecording = useCallback(async (externalStream?: MediaStream) => {
  await clientRef.current.startScreenRecording(5000, externalStream);
  // ...
}, []);
```

### Phase 4: Modified LiveInterviewSession Component
**File:** `src/components/interview/LiveInterviewSession.tsx`

**Changes:**
- Added `sharedStreamRef` to store the MediaStream
- Updated `startSession()` to request screen sharing **once** before initializing either system
- Pass shared stream to both `geminiLive.startScreenRecording()` and `questionRecorder` (via providedStream prop)
- Added cleanup in `useEffect`, `handleEndInterview()`, and error handler

**Key Code:**
```typescript
// Added ref
const sharedStreamRef = useRef<MediaStream | null>(null);

// Pass to video recorder
const questionRecorder = useQuestionVideoRecorder({
  // ... other props
  providedStream: sharedStreamRef.current ?? undefined,
});

// In startSession():
// Request screen sharing ONCE
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: { displaySurface: "monitor" },
  audio: true,
});
sharedStreamRef.current = stream;

// Start Gemini with shared stream
if (geminiConfig?.enableScreenCapture) {
  await geminiLive.startScreenRecording(stream);
}

// Initialize video recorder (it will use the provided stream)
await questionRecorder.initialize();
await questionRecorder.startRecording(0);

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (sharedStreamRef.current) {
      sharedStreamRef.current.getTracks().forEach(track => track.stop());
      sharedStreamRef.current = null;
    }
  };
}, []);
```

---

## 🔄 How It Works

### Flow Diagram
```
LiveInterviewSession
  │
  ├─ Request screen sharing (ONCE)
  │   └─ Store in sharedStreamRef
  │
  ├─ Pass to Gemini Live
  │   └─ ScreenRecorder.start(externalStream)
  │       └─ Takes screenshots every 5s
  │       └─ Doesn't stop stream on cleanup
  │
  └─ Pass to Question Recorder
      └─ useQuestionVideoRecorder(providedStream)
          └─ MediaRecorder records video
          └─ Doesn't stop stream on cleanup

On Interview End:
  └─ LiveInterviewSession stops all tracks
```

### Key Principle: **Owner Responsibility**

- **LiveInterviewSession** requests the screen sharing and **owns** the stream
- Both **ScreenRecorder** and **useQuestionVideoRecorder** receive the stream but **do not own it**
- Only the owner (`LiveInterviewSession`) stops the MediaStream tracks during cleanup
- Consumers set `isExternalStream` / `ownsStreamRef` flags to prevent double cleanup

---

## 🧪 Testing Checklist

### Before Testing
- [ ] Verify `geminiConfig.enableScreenCapture` is `true` in live page
- [ ] Ensure all files are saved and built

### User Experience Testing
- [ ] Start interview from practice flow
- [ ] Verify **only one** screen sharing prompt appears
- [ ] Confirm both screen + audio permissions requested in single prompt
- [ ] Grant permissions and start interview
- [ ] Verify AI greets first and can see your screen
- [ ] Verify question recording starts automatically
- [ ] Test full interview flow through all questions

### Technical Verification
- [ ] Check browser console logs show:
  - "🖥️ Requesting screen sharing (single prompt)..."
  - "✅ Screen sharing granted!"
  - "📸 Starting Gemini screen capture with shared stream..."
  - "✅ Gemini screen capture started!"
  - "🎥 Initializing question video recorder with shared stream..."
  - "✅ Question video recorder initialized!"
- [ ] Verify AI takes screenshots (check Gemini events in console)
- [ ] Verify videos upload to Supabase (check network tab)
- [ ] End interview and check cleanup logs

### Cleanup Testing
- [ ] End interview normally - verify stream stops
- [ ] Close browser tab mid-interview - verify no memory leaks
- [ ] Trigger error during interview - verify cleanup runs

---

## 🎉 Benefits

1. **Better UX**: Users only see one screen sharing prompt instead of two
2. **AI Can See Screen**: ScreenRecorder gets the stream for screenshots
3. **Video Recording Works**: MediaRecorder gets the same stream for recording
4. **Efficient**: Single MediaStream used by both systems
5. **Clean Lifecycle**: Proper ownership and cleanup prevents memory leaks

---

## 🔍 Troubleshooting

### If user still sees two prompts:
- Check that `geminiConfig.enableScreenCapture` is `true`
- Verify `LiveInterviewSession` is actually passing the stream
- Check console logs to see which system is requesting screen sharing

### If AI can't see screen:
- Ensure `geminiConfig.enableScreenCapture` is `true`
- Verify `geminiLive.startScreenRecording(stream)` is being called
- Check for errors in ScreenRecorder initialization

### If video recording fails:
- Verify `providedStream` prop is passed to `useQuestionVideoRecorder`
- Check if stream has both video and audio tracks
- Look for MediaRecorder errors in console

---

## 📝 Related Files

- [PermissionsConsentDialog.tsx](src/components/interview/PermissionsConsentDialog.tsx) - Consent UI
- [useQuestionVideoRecorder.ts](src/hooks/useQuestionVideoRecorder.ts) - Video recording hook
- [gemini-live.ts](src/lib/gemini-live.ts) - Gemini Live client and ScreenRecorder
- [useGeminiLive.ts](src/hooks/useGeminiLive.ts) - React hook wrapper for Gemini
- [LiveInterviewSession.tsx](src/components/interview/LiveInterviewSession.tsx) - Main orchestrator
- [IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md) - Question-level video recording feature

---

**Implementation Complete!** 🎉

Ready for testing at: `http://localhost:3000/interview/live?caseId=...`
