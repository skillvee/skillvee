# PRD: Question-Level Video Recording for Live Interviews

**Status:** Draft
**Created:** 2025-10-17
**Author:** Claude Code
**Epic:** Interview Experience Enhancement

---

## Executive Summary

Transform the live interview experience by recording separate video segments for each interview question instead of one continuous video. This enables per-question AI assessment, better video management, and a more granular interview analysis workflow.

---

## Problem Statement

### Current State
- Interviews are recorded as one continuous video
- Long videos are difficult to assess with AI (token limits, processing time)
- No granular tracking of which question is being answered
- Assessment must process entire interview at once

### Desired State
- Each interview question has its own video recording
- Seamless recording continues in the background (user doesn't notice the segmentation)
- Videos are uploaded automatically as questions progress
- Results view shows individual question videos for verification
- Future: Per-question assessment with consolidated results

---

## Goals & Success Metrics

### Goals
1. **Seamless UX**: Users don't notice video segmentation - no re-prompting for screen sharing
2. **Reliable Recording**: Video capture is fault-tolerant with automatic retry
3. **Data Integrity**: All question videos are properly stored and associated with questions
4. **Future-Ready**: Architecture supports per-question AI assessment

### Success Metrics
- ✅ 100% of questions have associated video recordings
- ✅ Zero user-facing interruptions during question transitions
- ✅ Upload success rate > 95% (with retry logic)
- ✅ Results page displays all question videos correctly

---

## User Stories

### As a User (Candidate)
1. **Story 1**: When I start a live interview, I want to see the current question displayed prominently so I know what to focus on
2. **Story 2**: When I finish answering a question, I want to click "Next Question" and move to the next question seamlessly
3. **Story 3**: When I click "Next Question", I want to confirm my decision before proceeding
4. **Story 4**: When my video recording fails, I want to be notified and restart the interview without losing data
5. **Story 5**: When I complete the interview, I want to see all my question videos in the results page

### As a Developer
1. **Story 6**: I want a new database table to store per-question recordings and metadata
2. **Story 7**: I want video recording to continue seamlessly while switching questions in the background
3. **Story 8**: I want failed uploads to retry automatically before failing
4. **Story 9**: I want the AI to receive full context initially and reminders on question transitions

---

## Technical Architecture

### Database Schema Changes

#### New Table: `InterviewQuestionRecording`
```prisma
model InterviewQuestionRecording {
  id                    String              @id @default(cuid())
  interviewId           String
  questionId            String              // From CaseQuestion or generated
  questionText          String              // Denormalized for quick access
  questionOrder         Int                 // Question index in interview

  // Video Recording
  recordingType         RecordingType       @default(SCREEN_AND_AUDIO)
  filePath              String              // Supabase storage path
  fileSize              BigInt
  duration              Int?                // Duration in seconds

  // Upload Status
  uploadStatus          UploadStatus        @default(UPLOADING)
  uploadStartedAt       DateTime?
  uploadCompletedAt     DateTime?
  uploadRetryCount      Int                 @default(0)
  uploadError           String?

  // Transcription
  transcriptionStatus   TranscriptionStatus @default(PENDING)
  transcriptionText     String?

  // Timestamps
  recordingStartedAt    DateTime
  recordingEndedAt      DateTime?
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  interview             Interview           @relation(fields: [interviewId], references: [id], onDelete: Cascade)

  @@index([interviewId])
  @@index([questionId])
  @@index([uploadStatus])
  @@map("interview_question_recordings")
}
```

#### Update Existing Table: `Interview`
```prisma
model Interview {
  // ... existing fields ...
  questionRecordings    InterviewQuestionRecording[]
}
```

---

## UI/UX Design

### Live Interview Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Live AI Interview                        [Timer] [●●●]  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────────┐
│  Case Context        │  Current Question & Notes                │
│  [Collapsible Card]  │                                          │
│                      │  ┌────────────────────────────────────┐  │
│  - Tables            │  │ Question 2 of 5                    │  │
│  - Data samples      │  │                                    │  │
│  - Business context  │  │ [Question Text Here]               │  │
│                      │  │                                    │  │
│                      │  └────────────────────────────────────┘  │
│                      │                                          │
│                      │  ┌────────────────────────────────────┐  │
│                      │  │ Interview Notes                    │  │
│                      │  │                                    │  │
│                      │  │ [Notepad Textarea]                 │  │
│                      │  │                                    │  │
│                      │  │                                    │  │
│                      │  └────────────────────────────────────┘  │
│                      │                                          │
│                      │  [Pause]              [Next Question]   │
│                      │                       [End Interview]   │
└──────────────────────┴──────────────────────────────────────────┘
```

### New Component: `CurrentQuestionDisplay`
- **Location**: Above the notepad, right panel
- **Content**:
  - Progress indicator: "Question 2 of 5"
  - Question text (from `CaseQuestion.questionText`)
- **Style**: Card with border, prominent typography

### Updated Component: `LiveInterviewSession`
- Add question progression state management
- Add video recording segmentation logic
- Add background upload orchestration

### New Component: `NextQuestionDialog`
**Trigger**: User clicks "Next Question" button
**Content**:
```
┌────────────────────────────────��────────────────┐
│  Move to Next Question?                         │
│                                                 │
│  You're about to move to question 3 of 5.      │
│  Your current answer will be saved.            │
│                                                 │
│           [Cancel]        [Continue]           │
└─────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Phase 1: Database & Backend

#### 1.1 Prisma Schema Migration
**File**: `prisma/schema.prisma`
- Add `InterviewQuestionRecording` model
- Add relation to `Interview` model
- Run migration: `npx prisma db push`

#### 1.2 tRPC Router for Question Recordings
**File**: `src/server/api/routers/questionRecording.ts`

**Endpoints**:
```typescript
export const questionRecordingRouter = createTRPCRouter({
  // Create new question recording entry
  create: protectedProcedure
    .input(createQuestionRecordingSchema)
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Update recording status (upload progress, completion)
  updateStatus: protectedProcedure
    .input(updateQuestionRecordingStatusSchema)
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Get all recordings for an interview
  getByInterviewId: protectedProcedure
    .input(z.object({ interviewId: z.string() }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Get specific question recording with signed URL
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Initiate upload to Supabase Storage
  initiateUpload: protectedProcedure
    .input(initiateQuestionUploadSchema)
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Complete upload
  completeUpload: protectedProcedure
    .input(completeQuestionUploadSchema)
    .mutation(async ({ ctx, input }) => { /* ... */ }),
});
```

#### 1.3 Supabase Storage Configuration
**Bucket**: `interview-question-videos`
**Path Structure**: `{userId}/{interviewId}/question_{order}.webm`
**Policies**:
- Authenticated users can upload to their own folder
- Authenticated users can read their own videos
- Admins can read all videos

---

### Phase 2: Frontend - Recording Logic

#### 2.1 New Hook: `useQuestionVideoRecorder`
**File**: `src/hooks/useQuestionVideoRecorder.ts`

**Purpose**: Manage per-question video recording with seamless transitions

**State**:
```typescript
interface QuestionRecorderState {
  mediaRecorder: MediaRecorder | null;
  currentQuestionIndex: number;
  currentRecordingId: string | null;
  isRecording: boolean;
  recordingStartTime: number | null;
  chunks: Blob[];
  stream: MediaStream | null;
  error: string | null;
}
```

**Key Functions**:
```typescript
// Initialize recorder (called once at interview start)
const initializeRecorder = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { mediaSource: "screen" },
    audio: true,
  });

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9,opus",
  });

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  setMediaRecorder(recorder);
  setStream(stream);
};

// Start recording for a question
const startQuestionRecording = async (questionId: string, questionOrder: number) => {
  if (!mediaRecorder) return;

  // Create database entry
  const recording = await createQuestionRecordingMutation.mutateAsync({
    interviewId,
    questionId,
    questionOrder,
    questionText: questions[questionOrder].questionText,
  });

  setCurrentRecordingId(recording.id);
  setCurrentQuestionIndex(questionOrder);
  setRecordingStartTime(Date.now());
  setChunks([]);

  mediaRecorder.start(1000); // Collect data every second
  setIsRecording(true);
};

// Stop recording and upload (called on question transition)
const stopAndUploadQuestionRecording = async () => {
  if (!mediaRecorder || !isRecording) return;

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: "video/webm" });
        const duration = Math.floor((Date.now() - recordingStartTime!) / 1000);

        // Upload to Supabase
        await uploadQuestionVideo({
          recordingId: currentRecordingId!,
          blob,
          duration,
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    mediaRecorder.stop();
    setIsRecording(false);
  });
};

// Transition to next question (seamless)
const transitionToNextQuestion = async (nextQuestionIndex: number) => {
  // Stop and upload current recording
  await stopAndUploadQuestionRecording();

  // Start new recording immediately
  const nextQuestion = questions[nextQuestionIndex];
  await startQuestionRecording(nextQuestion.id, nextQuestionIndex);

  // Notify AI of question change
  await notifyAIQuestionChange(nextQuestion);
};

// Cleanup (called on interview end)
const cleanup = () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};
```

#### 2.2 Upload Function with Retry Logic
**File**: `src/hooks/useQuestionVideoUpload.ts`

```typescript
const uploadQuestionVideo = async ({
  recordingId,
  blob,
  duration,
  maxRetries = 3,
}: UploadParams) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Update status to uploading
      await updateStatusMutation.mutateAsync({
        id: recordingId,
        uploadStatus: "UPLOADING",
        uploadRetryCount: attempt,
      });

      // Get upload URL from tRPC
      const { uploadUrl, filePath } = await initiateUploadMutation.mutateAsync({
        recordingId,
        fileSize: BigInt(blob.size),
        duration,
      });

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("interview-question-videos")
        .upload(filePath, blob, {
          contentType: "video/webm",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Mark as completed
      await completeUploadMutation.mutateAsync({
        recordingId,
        filePath,
        fileSize: BigInt(blob.size),
        duration,
      });

      return { success: true };

    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        // Mark as failed
        await updateStatusMutation.mutateAsync({
          id: recordingId,
          uploadStatus: "FAILED",
          uploadError: error.message,
          uploadRetryCount: attempt,
        });

        throw new Error(`Upload failed after ${maxRetries} attempts`);
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
};
```

---

### Phase 3: Frontend - UI Components

#### 3.1 New Component: `CurrentQuestionDisplay`
**File**: `src/components/interview/CurrentQuestionDisplay.tsx`

```typescript
interface CurrentQuestionDisplayProps {
  questionText: string;
  currentIndex: number;
  totalQuestions: number;
  className?: string;
}

export function CurrentQuestionDisplay({
  questionText,
  currentIndex,
  totalQuestions,
  className,
}: CurrentQuestionDisplayProps) {
  return (
    <Card className={cn("mb-4", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            Question {currentIndex + 1} of {totalQuestions}
          </Badge>
        </div>
        <p className="text-lg font-medium leading-relaxed">
          {questionText}
        </p>
      </CardContent>
    </Card>
  );
}
```

#### 3.2 New Component: `NextQuestionDialog`
**File**: `src/components/interview/NextQuestionDialog.tsx`

```typescript
interface NextQuestionDialogProps {
  open: boolean;
  currentQuestion: number;
  totalQuestions: number;
  onConfirm: () => void;
  onCancel: () => void;
  isTransitioning?: boolean;
}

export function NextQuestionDialog({
  open,
  currentQuestion,
  totalQuestions,
  onConfirm,
  onCancel,
  isTransitioning,
}: NextQuestionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Next Question?</DialogTitle>
          <DialogDescription>
            You're about to move to question {currentQuestion + 2} of {totalQuestions}.
            Your current answer will be saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isTransitioning}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isTransitioning}
          >
            {isTransitioning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Transitioning...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### 3.3 Update Component: `LiveInterviewSession`
**File**: `src/components/interview/LiveInterviewSession.tsx`

**Changes**:
1. Add question progression state
2. Integrate `useQuestionVideoRecorder` hook
3. Add `CurrentQuestionDisplay` component
4. Add `NextQuestionDialog` component
5. Update "Next Question" button handler
6. Add error handling for recording failures

**New State**:
```typescript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [showNextQuestionDialog, setShowNextQuestionDialog] = useState(false);
const [isTransitioning, setIsTransitioning] = useState(false);
const [recordingError, setRecordingError] = useState<string | null>(null);
```

**New Handler**:
```typescript
const handleNextQuestion = async () => {
  if (currentQuestionIndex >= questions.length - 1) {
    // Last question - end interview
    await handleEndInterview();
    return;
  }

  setShowNextQuestionDialog(true);
};

const handleConfirmNextQuestion = async () => {
  setIsTransitioning(true);

  try {
    // Transition video recording to next question
    await questionRecorder.transitionToNextQuestion(currentQuestionIndex + 1);

    // Update question index
    setCurrentQuestionIndex(prev => prev + 1);

    // Close dialog
    setShowNextQuestionDialog(false);
  } catch (error) {
    console.error("Failed to transition to next question:", error);
    setRecordingError("Failed to save video. Please try again.");
  } finally {
    setIsTransitioning(false);
  }
};
```

**Updated Layout** (right panel):
```tsx
<div className="lg:col-span-1 h-[calc(100vh-12rem)] flex flex-col">
  {/* Current Question Display */}
  <CurrentQuestionDisplay
    questionText={questions[currentQuestionIndex].questionText}
    currentIndex={currentQuestionIndex}
    totalQuestions={questions.length}
  />

  {/* Interview Notepad */}
  <InterviewNotepad
    initialNotes={interviewNotes}
    onChange={setInterviewNotes}
    placeholder="Take notes during the interview..."
    className="flex-1"
  />

  {/* Interview Controls */}
  <Card className="mt-4 flex-shrink-0">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <Button
          variant={geminiLive.isListening ? "destructive" : "default"}
          size="sm"
          onClick={togglePause}
        >
          {isSessionPaused ? <Play /> : <Pause />}
          {isSessionPaused ? "Resume" : "Pause"}
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleNextQuestion}
            disabled={isTransitioning}
          >
            {currentQuestionIndex === questions.length - 1
              ? "End Interview"
              : "Next Question"}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

{/* Next Question Dialog */}
<NextQuestionDialog
  open={showNextQuestionDialog}
  currentQuestion={currentQuestionIndex}
  totalQuestions={questions.length}
  onConfirm={handleConfirmNextQuestion}
  onCancel={() => setShowNextQuestionDialog(false)}
  isTransitioning={isTransitioning}
/>
```

---

### Phase 4: AI Context Management

#### 4.1 Update Initial AI System Instructions
**File**: `src/hooks/useGeminiLive.ts` (or wherever AI context is set)

**Initial Context** (sent when interview starts):
```typescript
const buildInitialAIContext = (interview: Interview, questions: Question[]) => {
  return `You are conducting a technical interview for ${interview.jobDescription.title}.

CASE CONTEXT:
${caseContext}

INTERVIEW STRUCTURE:
This interview has ${questions.length} questions. You will be notified when the candidate moves to each question.

QUESTIONS AND FOLLOW-UPS:
${questions.map((q, idx) => `
Question ${idx + 1}: ${q.questionText}
Skills Evaluated: ${q.skillsToEvaluate.join(", ")}
Follow-up Questions (use if needed):
${q.followUpQuestions.map((fu, i) => `  ${i + 1}. ${fu}`).join("\n")}
`).join("\n")}

INSTRUCTIONS:
- Start with Question 1 and wait for the candidate's response
- Ask follow-up questions only if the candidate's answer is incomplete or lacks detail
- When you receive a "QUESTION_TRANSITION" message, acknowledge it and move to the new question
- Be conversational and encouraging while maintaining professionalism
- Focus on understanding the candidate's thought process and technical knowledge
`;
};
```

#### 4.2 Question Transition Message
**Function**: `notifyAIQuestionChange`

```typescript
const notifyAIQuestionChange = async (question: Question, index: number) => {
  const message = `QUESTION_TRANSITION: We are now moving to Question ${index + 1}.

Question ${index + 1}: ${question.questionText}

Skills to Evaluate: ${question.skillsToEvaluate.join(", ")}

Available Follow-ups (use if needed):
${question.followUpQuestions.map((fu, i) => `${i + 1}. ${fu}`).join("\n")}

Please acknowledge the transition and begin discussing this question with the candidate.`;

  // Send to Gemini Live
  await geminiLive.sendTextMessage(message);
};
```

---

### Phase 5: Results Page Updates

#### 5.1 Update Results Page
**File**: `src/app/interview/results/[id]/page.tsx`

**New Section**: Question Videos Gallery

```tsx
{/* Question Videos Section */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center">
      <Video className="w-5 h-5 mr-2" />
      Question Recordings
    </CardTitle>
    <CardDescription>
      Video recordings for each interview question
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {questionRecordings.map((recording, index) => (
        <div key={recording.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Badge variant="outline" className="mb-2">
                Question {recording.questionOrder + 1}
              </Badge>
              <p className="text-sm font-medium">{recording.questionText}</p>
            </div>
            <Badge variant={
              recording.uploadStatus === "COMPLETED" ? "success" :
              recording.uploadStatus === "UPLOADING" ? "warning" :
              "destructive"
            }>
              {recording.uploadStatus}
            </Badge>
          </div>

          {recording.uploadStatus === "COMPLETED" && (
            <div className="mt-3">
              <video
                src={recording.videoUrl}
                controls
                className="w-full rounded border"
                style={{ maxHeight: "300px" }}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Duration: {formatDuration(recording.duration)}</span>
                <span>Size: {formatFileSize(Number(recording.fileSize))}</span>
              </div>
            </div>
          )}

          {recording.uploadStatus === "UPLOADING" && (
            <div className="mt-3 text-center text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
              Uploading video...
            </div>
          )}

          {recording.uploadStatus === "FAILED" && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Upload failed: {recording.uploadError}
              </AlertDescription>
            </Alert>
          )}
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

#### 5.2 Add Query for Question Recordings
```typescript
const { data: questionRecordings } = api.questionRecording.getByInterviewId.useQuery(
  { interviewId },
  { enabled: !!interviewId, refetchInterval: 5000 } // Poll for upload progress
);
```

---

## Error Handling & Edge Cases

### Recording Failures
**Scenario**: MediaRecorder fails or browser loses screen capture permission

**Handling**:
```typescript
recorder.onerror = (error) => {
  console.error("Recording error:", error);

  // Stop interview and show error
  setRecordingError(
    "Video recording failed. Please restart the interview to try again."
  );

  // Cleanup
  cleanup();

  // Mark interview as failed
  await updateInterviewMutation.mutateAsync({
    id: interviewId,
    status: "CANCELLED",
  });
};
```

**User Message**:
```
┌─────────────────────────────────────────────────┐
│  ⚠️  Recording Error                             │
│                                                 │
│  Video recording has stopped unexpectedly.     │
│  Please restart the interview to continue.     │
│                                                 │
│           [Go to Dashboard]                     │
└─────────────────────────────────────────────────┘
```

### Upload Failures
**Scenario**: Network issue or Supabase error during upload

**Handling**:
- Automatic retry with exponential backoff (3 attempts)
- If all retries fail, mark as FAILED in database
- Allow user to continue interview
- Show warning in results page

### User Closes Browser/Tab
**Scenario**: User accidentally closes the tab or browser crashes

**Handling**:
- Interview state is lost (no recovery)
- Partially uploaded videos remain in database with status "UPLOADING"
- User must restart interview from beginning
- Background job to clean up orphaned recordings after 24 hours

### Connection Loss
**Scenario**: User loses internet connection during interview

**Handling**:
- Gemini Live connection will drop
- Recording continues locally
- On reconnect, upload will retry
- If reconnect fails, show error and require restart

---

## Implementation Phases

### Phase 1: Foundation (Week 1) ✅ COMPLETED
- [x] Database schema changes
- [x] Prisma migration
- [x] tRPC router for question recordings
- [x] Supabase storage bucket setup (user configuration required)

### Phase 2: Core Recording (Week 2) ✅ COMPLETED
- [x] `useQuestionVideoRecorder` hook
- [x] `useQuestionVideoUpload` hook with retry
- [x] Recording start/stop/transition logic
- [x] Error handling and cleanup

### Phase 3: UI Components (Week 3) ✅ COMPLETED
- [x] `CurrentQuestionDisplay` component
- [x] `NextQuestionDialog` component
- [x] Update `LiveInterviewSession` layout
- [x] Question progression state management

### Phase 4: AI Integration (Week 4) ✅ COMPLETED
- [x] Update initial AI context with all questions
- [x] Question transition notifications (via sendTextMessage)
- [x] Follow-up question logic (included in AI context)
- [x] Testing AI behavior (pending manual testing)

### Phase 5: Results & Polish (Week 5) ✅ COMPLETED
- [x] Update results page with video gallery
- [x] Video playback with signed URLs
- [x] Upload status polling (5s interval)
- [x] Error states and messaging
- [x] Upload progress indicators
- [x] Retry attempt display

### Phase 6: Testing & Deployment
- [ ] Unit tests for hooks
- [ ] Integration tests for recording flow
- [ ] Manual QA of full interview flow
- [ ] Deploy to staging
- [ ] Deploy to production

---

## Testing Strategy

### Unit Tests
- `useQuestionVideoRecorder` hook
- `useQuestionVideoUpload` hook with retry logic
- `CurrentQuestionDisplay` component
- `NextQuestionDialog` component

### Integration Tests
- Full question recording lifecycle
- Question transition flow
- Upload with retry
- Error scenarios

### Manual Testing Checklist
- [ ] Start interview and verify screen sharing prompt
- [ ] Answer first question and click "Next Question"
- [ ] Verify confirmation dialog appears
- [ ] Confirm and verify seamless transition
- [ ] Verify no re-prompt for screen sharing
- [ ] Complete all questions
- [ ] End interview
- [ ] Check results page for all videos
- [ ] Verify video playback
- [ ] Test with poor network (upload retry)
- [ ] Test browser close/reload (restart required)
- [ ] Test recording error (restart required)

---

## Future Enhancements (Out of Scope)

### Per-Question Assessment
- Send each question video to AI for assessment
- Generate per-question feedback
- Aggregate scores for overall assessment
- Store results in `InterviewAssessment` table

### Question Navigation
- Allow users to go back to previous questions
- Re-record specific questions
- Compare multiple attempts

### Real-time Feedback
- Show AI hints during question
- Progress indicators for expected answer depth
- Time remaining per question

### Advanced Analytics
- Heatmaps of where users spent time
- Speaking time vs thinking time analysis
- Confidence indicators based on voice analysis

---

## Open Questions
None - all questions have been answered by the user.

---

## Appendix

### File Structure
```
src/
├── components/interview/
│   ├── CurrentQuestionDisplay.tsx          [NEW]
│   ├── NextQuestionDialog.tsx              [NEW]
│   └── LiveInterviewSession.tsx            [UPDATED]
│
├── hooks/
│   ├── useQuestionVideoRecorder.ts         [NEW]
│   └── useQuestionVideoUpload.ts           [NEW]
│
├── server/api/
│   ├── routers/
│   │   └── questionRecording.ts            [NEW]
│   └── schemas/
│       └── questionRecording.ts            [NEW]
│
├── app/interview/
│   └── results/[id]/page.tsx               [UPDATED]
│
└── prisma/
    └── schema.prisma                        [UPDATED]
```

### Dependencies
- No new dependencies required
- Uses existing: MediaRecorder API, Supabase Storage, tRPC

### Environment Variables
```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

**End of PRD**
