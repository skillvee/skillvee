# Phase 1 Implementation Summary: Per-Question Video Assessment

**Status:** ✅ Complete and Type-Safe
**Date:** 2025-10-24
**Branch:** `feature/video-assessment-ai`

## Overview

Phase 1 implements the infrastructure for processing individual interview question recordings with Gemini AI. Each question video is uploaded to Gemini File API, analyzed with multimodal AI, and results are stored in the database.

## Architecture

### Data Flow

```
1. User completes interview → Question videos saved to Supabase Storage
2. Frontend calls processQuestionRecording() → tRPC endpoint
3. Service downloads video from Supabase
4. Service uploads video to Gemini File API
5. Service sends video + prompt to Gemini 2.5 Pro
6. Gemini returns QuestionAssessment (feedback items + skill scores)
7. Service stores result in InterviewQuestionRecording.assessmentData
8. Status updated: PENDING → IN_PROGRESS → COMPLETED (or FAILED)
```

### Database Schema Changes

**Table:** `interview_question_recordings`

```sql
-- New columns added
geminiFileUri            TEXT                -- Gemini File API URI
geminiFileUploadedAt     TIMESTAMP(3)        -- Upload completion timestamp
assessmentStatus         AssessmentStatus    -- PENDING | IN_PROGRESS | COMPLETED | FAILED
assessmentStartedAt      TIMESTAMP(3)        -- AI processing start time
assessmentCompletedAt    TIMESTAMP(3)        -- AI processing completion time
assessmentError          TEXT                -- Error message if failed
assessmentData           JSONB               -- QuestionAssessment JSON result

-- New enum
CREATE TYPE "AssessmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- New index for efficient status queries
CREATE INDEX "interview_question_recordings_assessmentStatus_idx"
  ON "interview_question_recordings"("assessmentStatus");
```

**Migration Applied:** `supabase/migrations/20251024155610_add_video_assessment_fields.sql`

### File Structure

```
src/server/ai/
├── providers/gemini/
│   ├── client.ts                   # Existing Gemini client
│   ├── file-manager.ts            # NEW: File API upload/management
│   └── types.ts                    # Existing types
├── prompts/assessment/
│   ├── video-assessment.ts         # Existing: Prompt template
│   └── types.ts                    # Existing: Type definitions
└── services/
    └── video-assessment.service.ts # NEW: Main orchestration logic

src/server/api/routers/
└── assessment.ts                   # MODIFIED: Added 4 new endpoints

src/env.js                          # MODIFIED: Added SUPABASE_SERVICE_ROLE_KEY

prisma/schema.prisma                # MODIFIED: Added assessment fields
```

## Implementation Details

### 1. Gemini File Manager (`file-manager.ts`)

**Purpose:** Upload videos to Gemini File API and manage file lifecycle

**Key Functions:**

```typescript
// Upload video and wait for processing
uploadVideoToGemini(
  videoBuffer: Buffer,
  mimeType: string,
  displayName?: string
): Promise<{ fileUri: string; mimeType: string; fileName: string }>

// Delete file from Gemini
deleteGeminiFile(fileName: string): Promise<boolean>

// Get file metadata
getGeminiFile(fileName: string): Promise<FileMetadata>
```

**Configuration:**
```typescript
SUPPORTED_VIDEO_FORMATS = [
  "video/webm", "video/mp4", "video/mpeg", "video/mov",
  "video/avi", "video/flv", "video/mpg", "video/wmv", "video/3gpp"
]

FILE_PROCESSING_CONFIG = {
  maxPollAttempts: 30,
  pollIntervalMs: 2000,
  maxFileSizeBytes: 2GB
}
```

**Implementation Notes:**
- Uses temporary files in OS tmpdir (Node.js file API requirement)
- Polls Gemini API until file state is ACTIVE or FAILED
- Automatic cleanup of temp files via try/finally
- Validates file size and MIME type before upload

### 2. Video Assessment Service (`video-assessment.service.ts`)

**Purpose:** Orchestrate the complete assessment workflow

**Main Function:**
```typescript
processQuestionRecording(params: { recordingId: string }): Promise<void>
```

**Workflow:**
1. Fetch recording from DB (includes interview, question data)
2. Check if video already uploaded to Gemini
3. If not uploaded:
   - Download video from Supabase storage bucket `interview-question-videos`
   - Upload to Gemini File API
   - Save `geminiFileUri` and `geminiFileUploadedAt` to DB
4. Build assessment context (case info, question details, skill definitions)
5. Call Gemini 2.5 Pro with video file reference + text prompt
6. Parse JSON response into `QuestionAssessment` type
7. Store result in `assessmentData` JSONB field
8. Update status to COMPLETED or FAILED

**Helper Functions:**

```typescript
// Download from Supabase, upload to Gemini
uploadVideoToGeminiFile(params: {
  recordingId: string;
  supabaseFilePath: string
}): Promise<{ fileUri: string; mimeType: string; fileName: string }>

// Generate AI assessment using Gemini
assessQuestionVideo(params: {
  recordingId: string;
  questionId: string;
  interviewId: string;
  userId: string
}): Promise<AssessmentResult>
```

**Error Handling:**
- All errors caught and stored in `assessmentError` field
- Status set to FAILED on any exception
- Detailed console logging for debugging

**TODO for Phase 2:**
Currently the service builds assessment context with placeholder data:
```typescript
// Lines 238-248 in video-assessment.service.ts
const context: QuestionVideoAssessmentContext = {
  videoUrl: recording.geminiFileUri,
  caseTitle: "Sample Case", // TODO: Get from interview case
  caseContext: "Sample context", // TODO: Get from interview case
  questionId: recording.questionId,
  questionText: recording.questionText,
  questionContext: undefined, // TODO: Get from question
  questionOrder: recording.questionOrder,
  totalQuestions: 3, // TODO: Get actual count
  skillsToEvaluate: [], // TODO: Get from question
  followUpQuestions: [], // TODO: Get from question
  skillDefinitions: [], // TODO: Get from database
};
```

**Phase 2 needs to:**
- Fetch InterviewCase data (caseTitle, caseContext)
- Fetch CaseQuestion data (questionContext, followUpQuestions)
- Fetch skill definitions from Skill + SkillLevel tables
- Map skills to evaluate from interview configuration

### 3. tRPC API Endpoints (`assessment.ts`)

**Added 4 new endpoints to existing router:**

#### `processQuestionRecording` (mutation)
```typescript
Input: { recordingId: string }
Output: { success: true, message: "Assessment processing started" }

// Authorization: User must own the interview
// Behavior: Triggers async processing, returns immediately
// Use case: Called after video upload completes
```

#### `getQuestionAssessmentStatus` (query)
```typescript
Input: { recordingId: string }
Output: {
  recordingId: string;
  status: AssessmentStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  data: QuestionAssessment | null; // Parsed from assessmentData JSONB
}

// Authorization: User must own the interview
// Use case: Poll for completion, display progress
```

#### `getInterviewAssessmentStatus` (query)
```typescript
Input: { interviewId: string }
Output: {
  interviewId: string;
  overallStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  totalQuestions: number;
  completedCount: number;
  failedCount: number;
  inProgressCount: number;
  questions: Array<{
    recordingId: string;
    questionOrder: number;
    status: AssessmentStatus;
    startedAt: Date | null;
    completedAt: Date | null;
    error: string | null;
  }>;
}

// Overall status logic:
// - COMPLETED: All questions completed
// - FAILED: Any question failed
// - IN_PROGRESS: Some completed or in progress
// - PENDING: None started
```

#### `aggregateInterviewAssessment` (mutation)
```typescript
Input: { interviewId: string }
Output: NOT_IMPLEMENTED (placeholder for Phase 2)

// This is where Phase 2 implementation will happen
// Will aggregate all QuestionAssessments into final InterviewAssessment
```

### 4. Environment Configuration

**Added to `src/env.js`:**
```javascript
server: {
  // ... existing vars
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
}

runtimeEnv: {
  // ... existing vars
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
```

**Required in `.env`:**
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

This key is needed to download videos from Supabase storage in server-side code.

## Data Structures

### QuestionAssessment (stored in `assessmentData`)

```typescript
interface QuestionAssessment {
  questionId: string;
  feedbackItems: FeedbackItem[];
  skillScores: SkillScore[];
}

interface FeedbackItem {
  feedbackType: "STRENGTH" | "GROWTH_AREA";
  timestampDisplay: string;        // "MM:SS" relative to this video
  behaviorTitle: string;           // 20-50 chars
  whatYouDid: string;             // 100-300 chars
  whyItWorked?: string;           // 100-300 chars (STRENGTH only)
  whatWasMissing?: string;        // 100-300 chars (GROWTH_AREA only)
  actionableNextStep?: string;    // 100-300 chars (GROWTH_AREA only)
  displayOrder: number;
}

interface SkillScore {
  skillId: string;
  observedLevel: number;           // 1, 2, or 3
  reasoning: string;               // 100-200 chars
  specificEvidence: string[];      // 2-4 examples from video
}
```

### QuestionVideoAssessmentContext (input to AI)

```typescript
interface QuestionVideoAssessmentContext {
  videoUrl: string;                // Gemini File API URI

  // Case context
  caseTitle: string;
  caseContext: string;

  // Question details
  questionId: string;
  questionText: string;
  questionContext?: string;
  questionOrder: number;           // 0-based index
  totalQuestions: number;

  // Skills being evaluated
  skillsToEvaluate: string[];      // ["skill_123 - SQL", ...]
  followUpQuestions: string[];

  // Skill level definitions (1-3 scale)
  skillDefinitions: SkillDefinition[];
}

interface SkillDefinition {
  skillId: string;
  skillName: string;
  domainName: string;
  targetLevel: number;             // 1, 2, or 3
  levelBehaviors: SkillLevelBehavior[]; // All 3 levels for context
}

interface SkillLevelBehavior {
  level: number;
  levelName: string;
  generalDescription: string;
  observableBehaviors: string;
  exampleResponses: string;
  commonMistakes: string;
}
```

## AI Prompt Strategy

**Prompt Template:** `src/server/ai/prompts/assessment/video-assessment.ts`

**Model:** Gemini 2.5 Pro (multimodal)

**Key Features:**
- Provides all 3 skill levels (1-3) for calibration
- Requires minimum 1 STRENGTH and 1 GROWTH_AREA feedback item
- Strict character limits enforced
- Timestamps in MM:SS format relative to individual video
- Evidence must be specific with timestamps
- Returns JSON only (no markdown, no code blocks)

**Generation Config:**
```typescript
{
  model: GEMINI_MODELS.PRO, // "gemini-2.5-pro"
  responseMimeType: "application/json",
  temperature: 0.2,
  maxOutputTokens: 4000,
}
```

**Input Format:**
```typescript
model.generateContent([
  {
    fileData: {
      fileUri: "https://generativelanguage.googleapis.com/v1beta/files/...",
      mimeType: "video/webm"
    }
  },
  { text: promptText }
])
```

## Testing Status

✅ **TypeScript Compilation:** Passes `npm run typecheck`
✅ **Prisma Client:** Regenerated with new schema
✅ **Migration:** Applied to production database
⏳ **Unit Tests:** Not yet written (recommended for Phase 2)
⏳ **Integration Tests:** Not yet written (recommended for Phase 2)

## Known Limitations & TODOs

### Immediate TODOs (blocking Phase 2)
1. **Fetch real context data** in `assessQuestionVideo()`:
   - Query `InterviewCase` table for case title and context
   - Query `CaseQuestion` table for question context and follow-ups
   - Query `Skill` and `SkillLevel` tables for skill definitions
   - Determine which skills to evaluate (from interview configuration)

2. **Determine skill evaluation strategy:**
   - How are skills assigned to questions? (Case-level? Question-level?)
   - Where is target proficiency level stored?
   - How to fetch all 3 levels of behavior definitions per skill?

### Future Enhancements
1. **Retry logic** for failed assessments (exponential backoff)
2. **Batch processing** for multiple questions in parallel
3. **Progress webhooks** instead of polling
4. **Video thumbnails** generation during upload
5. **Cost tracking** for Gemini API usage
6. **Unit tests** for file manager and service layer
7. **Integration tests** for end-to-end workflow

## Phase 2 Preparation

### What Phase 2 Needs to Do

**Goal:** Aggregate all per-question assessments into a single `InterviewAssessment` record

**Input:** All `QuestionAssessment` objects from `assessmentData` JSONB fields

**Output:** Records in these tables:
- `InterviewAssessment` (1 record)
- `AssessmentFeedback` (multiple records)
- `AssessmentSkillScore` (multiple records)

**Key Tasks:**

1. **Fetch all question assessments:**
   ```typescript
   const recordings = await db.interviewQuestionRecording.findMany({
     where: { interviewId, assessmentStatus: 'COMPLETED' },
     select: { assessmentData: true, duration: true, questionOrder: true }
   });
   ```

2. **Aggregate feedback items:**
   - Collect all feedback items from all questions
   - Adjust timestamps from question-relative (MM:SS) to interview-relative (cumulative)
   - Select top 3-5 STRENGTH and top 3-5 GROWTH_AREA items
   - Assign final displayOrder

3. **Aggregate skill scores:**
   - For each skill, average the `observedLevel` across all questions
   - Map to 1-5 scale if needed (currently 1-3)
   - Assign `categoryOrder` and `skillOrder` based on domain

4. **Calculate overall performance:**
   - Average all skill scores → `overallScore` (1-5)
   - Map to `performanceLabel` (e.g., "Strong Performance", "Developing")
   - Generate `whatYouDidBest` summary (200-500 chars)
   - Generate `topOpportunitiesForGrowth` summary (200-500 chars)

5. **Store in database:**
   ```typescript
   await db.interviewAssessment.create({
     data: {
       userId,
       interviewId,
       caseId,
       overallScore,
       performanceLabel,
       whatYouDidBest,
       topOpportunitiesForGrowth,
       startedAt: interview.startedAt,
       completedAt: interview.completedAt,
       interviewDurationSeconds: calculateDuration(),
       feedbackItems: { create: aggregatedFeedbackItems },
       skillScores: { create: aggregatedSkillScores }
     }
   });
   ```

### Example Query to Get All Assessment Data

```typescript
const recordings = await db.interviewQuestionRecording.findMany({
  where: {
    interviewId: "int_xyz",
    assessmentStatus: "COMPLETED"
  },
  select: {
    id: true,
    questionId: true,
    questionOrder: true,
    duration: true,
    assessmentData: true, // Contains QuestionAssessment JSON
  },
  orderBy: { questionOrder: "asc" }
});

// Parse assessmentData
const questionAssessments = recordings.map(r => ({
  ...r,
  assessment: r.assessmentData as QuestionAssessment
}));
```

### Timestamp Adjustment Logic

```typescript
// Build cumulative duration map
let cumulativeSeconds = 0;
const questionDurations = recordings.map(r => {
  const start = cumulativeSeconds;
  const end = cumulativeSeconds + (r.duration || 0);
  cumulativeSeconds = end;
  return { questionId: r.questionId, start, end };
});

// Adjust feedback timestamps from "2:15" (question time) to "12:45" (interview time)
function adjustTimestamp(
  questionTimestamp: string,
  questionId: string
): string {
  const [min, sec] = questionTimestamp.split(':').map(Number);
  const questionSeconds = min * 60 + sec;

  const questionInfo = questionDurations.find(q => q.questionId === questionId);
  const interviewSeconds = questionInfo.start + questionSeconds;

  const totalMin = Math.floor(interviewSeconds / 60);
  const totalSec = interviewSeconds % 60;
  return `${totalMin}:${totalSec.toString().padStart(2, '0')}`;
}
```

### Aggregation Service Template

Create: `src/server/ai/services/assessment-aggregation.service.ts`

```typescript
interface AggregateAssessmentParams {
  interviewId: string;
  userId: string;
}

export async function aggregateInterviewAssessment(
  params: AggregateAssessmentParams
): Promise<InterviewAssessment> {
  // 1. Fetch all completed question assessments
  // 2. Aggregate feedback items with timestamp adjustment
  // 3. Aggregate skill scores (average observedLevel)
  // 4. Calculate overall score and performance label
  // 5. Generate summary text (whatYouDidBest, topOpportunitiesForGrowth)
  // 6. Create InterviewAssessment with related records
  // 7. Return created assessment
}
```

## Database Queries for Phase 2

### Get Interview Case Data
```typescript
const interviewCase = await db.interviewCase.findFirst({
  where: {
    practiceSession: {
      interviews: { some: { id: interviewId } }
    }
  },
  include: {
    caseQuestions: {
      orderBy: { orderIndex: 'asc' },
      include: {
        // Follow-up questions stored in JSON field
      }
    }
  }
});
```

### Get Skills and Levels
```typescript
const skills = await db.skill.findMany({
  where: {
    id: { in: skillIdsFromQuestions }
  },
  include: {
    domain: true,
    skillLevels: {
      orderBy: { level: 'asc' } // Get all 3 levels
    }
  }
});
```

### Check if Assessment Already Exists
```typescript
const existing = await db.interviewAssessment.findUnique({
  where: { interviewId }
});

if (existing) {
  // Decide: update or throw error?
}
```

## API Endpoint Implementation

Update `aggregateInterviewAssessment` in `src/server/api/routers/assessment.ts`:

```typescript
aggregateInterviewAssessment: protectedProcedure
  .input(z.object({ interviewId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Verify all questions are assessed
    const status = await getInterviewAssessmentStatus(input.interviewId);
    if (status.overallStatus !== "COMPLETED") {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: `Cannot aggregate: ${status.completedCount}/${status.totalQuestions} questions completed`
      });
    }

    // Call aggregation service
    const assessment = await aggregateInterviewAssessment({
      interviewId: input.interviewId,
      userId: ctx.userId
    });

    return assessment;
  })
```

## Summary

Phase 1 provides a **complete, type-safe foundation** for per-question video assessment. Each question recording can now be:
1. Uploaded to Gemini File API
2. Analyzed with AI
3. Results stored in database
4. Status tracked through completion

**Ready for Phase 2:** The `assessmentData` JSONB field contains rich, structured `QuestionAssessment` objects ready to be aggregated into the final `InterviewAssessment` record.

**Next Step:** Implement the aggregation service that combines all question assessments into a cohesive interview-level assessment with cumulative timestamps, averaged skill scores, and top feedback items.
