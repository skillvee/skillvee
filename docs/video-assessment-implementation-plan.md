# Video Assessment Implementation Plan

## 🎯 Feature Overview

Implement automated AI-powered video assessment for interview questions using Gemini API video analysis. The system will process each question's recording, generate AI feedback, and then create an overall interview assessment.

---

## 📊 Current State Analysis

### Existing Infrastructure

**Video Upload System** ✅
- Videos already uploading to Supabase storage bucket: `interview-question-videos`
- Storage path format: `{userId}/{interviewId}/question_{questionOrder}_{timestamp}.webm`
- Upload handled by `useQuestionVideoUpload` hook
- Files stored with signed URLs (1-hour expiry)

**Database Schema** ✅
- `InterviewQuestionRecording` table stores:
  - `filePath` (Supabase storage path)
  - `questionId`, `questionOrder`, `questionText`
  - `uploadStatus` (UPLOADING, COMPLETED, FAILED)
  - Upload timing fields
- `InterviewAssessment` table ready for final aggregated results
- `AssessmentFeedback` and `AssessmentSkillScore` tables for detailed feedback

**AI Infrastructure** ✅
- Server-side AI services in `src/server/ai/`
- Gemini client configured (`providers/gemini/client.ts`)
- Existing prompts: `video-assessment.ts` and `assessment-aggregation.ts`
- Service pattern established (e.g., `case-generation.service.ts`)

**Feedback Page** ✅
- Located at `/practice/feedback`
- Displays assessment results with tabs for feedback, skills, video, and context
- Ready to consume `InterviewAssessment` data

---

## 🎬 Gemini API Video Capabilities (Research Findings)

### File API Upload Pattern
1. **Upload video to Gemini File API** (not inline)
   - Required for files >20MB or videos >1 minute
   - Files persist for **48 hours** after upload
   - Maximum file size: **2GB per file**
   - Returns a `file.uri` for referencing in prompts

2. **Supported Formats**
   - ✅ `video/webm` (our current format)
   - Also: mp4, mpeg, mov, avi, flv, mpg, wmv, 3gpp

3. **Processing Specifications**
   - Sampling: 1 frame per second (FPS)
   - Audio: 1Kbps single channel processing
   - Token usage: ~300 tokens/second (default resolution)
   - Max duration (2M context models): 2 hours

4. **API Flow**
   ```typescript
   // 1. Upload to Gemini File API
   const uploadedFile = await client.files.upload({
     file: videoBuffer, // or stream
     mimeType: 'video/webm'
   });

   // 2. Reference in prompt
   const result = await model.generateContent([
     { fileData: { fileUri: uploadedFile.uri, mimeType: uploadedFile.mimeType } },
     { text: "Your assessment prompt here..." }
   ]);
   ```

### Key Considerations
- **File retention**: Gemini deletes files after 48 hours (fine for our use case)
- **Prompt structure**: Video content BEFORE text prompt for best results
- **Processing time**: Expect ~10-30 seconds per video depending on length
- **Model choice**: Using Gemini 2.5 Pro for both video assessment and aggregation

---

## 🔧 Technical Architecture

### Phase 1: Question-Level Video Assessment

#### 1.1 Database Schema Updates

**Add new fields to `InterviewQuestionRecording`:**
```prisma
model InterviewQuestionRecording {
  // ... existing fields ...

  // New AI assessment fields
  geminiFileUri         String?           // Gemini File API URI
  geminiFileUploadedAt  DateTime?         // When uploaded to Gemini
  assessmentStatus      AssessmentStatus  @default(PENDING)
  assessmentStartedAt   DateTime?
  assessmentCompletedAt DateTime?
  assessmentError       String?
  assessmentData        Json?             // Raw AI response (QuestionAssessmentResult)

  @@index([assessmentStatus])
}

enum AssessmentStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}
```

**Why these fields?**
- Track Gemini File API upload separately from Supabase upload
- Monitor assessment progress for each question
- Store raw AI response for debugging/reprocessing
- Enable status queries for showing loaders in UI

#### 1.2 New Service: `video-assessment.service.ts`

**Location:** `src/server/ai/services/video-assessment.service.ts`

**Core Functions:**

```typescript
// 1. Upload video from Supabase to Gemini File API
async function uploadVideoToGemini(params: {
  recordingId: string;
  supabaseFilePath: string;
}): Promise<{ geminiFileUri: string; mimeType: string }>;

// 2. Process single question video with AI
async function assessQuestionVideo(params: {
  recordingId: string;
  questionId: string;
  interviewId: string;
  userId: string;
}): Promise<{ success: boolean; data?: QuestionAssessmentResult; error?: string }>;

// 3. Orchestrator: upload + assess
async function processQuestionRecording(recordingId: string): Promise<void>;
```

**Implementation Details:**

```typescript
// Download from Supabase
const { data: supabaseClient } = createClient();
const { data: videoBuffer } = await supabaseClient
  .storage
  .from('interview-question-videos')
  .download(supabaseFilePath);

// Upload to Gemini File API
import { GoogleAIFileManager } from "@google/generative-ai/server";
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const uploadResult = await fileManager.uploadFile(videoPath, {
  mimeType: "video/webm",
  displayName: `question_${questionOrder}_${timestamp}`,
});

// Wait for processing (Gemini requires this)
let file = await fileManager.getFile(uploadResult.file.name);
while (file.state === "PROCESSING") {
  await new Promise(resolve => setTimeout(resolve, 2000));
  file = await fileManager.getFile(uploadResult.file.name);
}

// Generate assessment with video context
const model = geminiClient.getGenerativeModel({
  model: GEMINI_MODELS.PRO, // 2.5 Pro for video assessment
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
    maxOutputTokens: 4000,
  },
});

const prompt = createVideoAssessmentPrompt(context);
const result = await model.generateContent([
  {
    fileData: {
      fileUri: file.uri,
      mimeType: file.mimeType,
    },
  },
  { text: prompt },
]);

// Parse and validate response
const assessmentData = JSON.parse(result.response.text());
```

#### 1.3 New tRPC Router: `assessment.ts`

**Location:** `src/server/api/routers/assessment.ts`

**Endpoints:**

```typescript
export const assessmentRouter = createTRPCRouter({
  // Process a single question recording (manual trigger or webhook)
  processQuestionRecording: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await processQuestionRecording(input.recordingId);
      return { success: true };
    }),

  // Get question assessment status
  getQuestionAssessmentStatus: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Return assessmentStatus, assessmentData fields
    }),

  // Aggregate all question assessments into final interview assessment
  aggregateInterviewAssessment: protectedProcedure
    .input(z.object({ interviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Call aggregateAssessment service function
    }),

  // Get final assessment by ID or interviewId (already exists?)
  getById: protectedProcedure.input(...),
  getByInterviewId: protectedProcedure.input(...),
});
```

#### 1.4 Background Processing Strategy

**Option A: Immediate Processing (Recommended for MVP)**
- When video upload completes, immediately trigger assessment
- User sees loader for last question on feedback page
- Simple, no additional infrastructure needed

**Implementation:**
```typescript
// In questionRecording.completeUpload mutation
await completeUpload({ recordingId, status: 'COMPLETED' });

// Trigger assessment asynchronously (don't await)
processQuestionRecording(recordingId)
  .catch(err => console.error('Assessment failed:', err));
```

**Option B: Queue-Based Processing (Future Enhancement)**
- Use Vercel Queue or similar for background jobs
- More scalable, better error handling
- Requires additional setup

---

### Phase 2: Interview-Level Assessment Aggregation

#### 2.1 New Service: `assessment-aggregation.service.ts`

**Location:** `src/server/ai/services/assessment-aggregation.service.ts`

**Core Function:**

```typescript
async function aggregateInterviewAssessment(params: {
  interviewId: string;
  userId: string;
}): Promise<{
  success: boolean;
  assessmentId?: string;
  error?: string
}>;
```

**Implementation Flow:**

1. **Fetch all question assessments**
   ```typescript
   const recordings = await ctx.db.interviewQuestionRecording.findMany({
     where: {
       interviewId,
       assessmentStatus: 'COMPLETED'
     },
     include: { interview: true },
     orderBy: { questionOrder: 'asc' }
   });
   ```

2. **Build aggregation context**
   ```typescript
   const context: AssessmentAggregationContext = {
     interview: { /* ... */ },
     case: { /* ... */ },
     questionAssessments: recordings.map(r => r.assessmentData),
     questionDurations: recordings.map(r => ({
       startSeconds: /* cumulative */,
       endSeconds: /* cumulative */
     })),
     allSkills: /* fetch from interviewSkills */
   };
   ```

3. **Call Gemini with aggregation prompt**
   ```typescript
   const prompt = createAggregationPrompt(context);
   const model = geminiClient.getGenerativeModel({
     model: GEMINI_MODELS.PRO, // Use Pro for complex reasoning
     generationConfig: {
       responseMimeType: "application/json",
       responseSchema: aggregationResponseSchema,
       temperature: 0.3,
       maxOutputTokens: 6000,
     },
   });
   const result = await model.generateContent(prompt);
   ```

4. **Store in InterviewAssessment table**
   ```typescript
   const assessment = await ctx.db.interviewAssessment.create({
     data: {
       userId,
       interviewId,
       caseId,
       overallScore: aggregated.overallScore,
       performanceLabel: aggregated.performanceLabel,
       whatYouDidBest: aggregated.whatYouDidBest,
       topOpportunitiesForGrowth: aggregated.topOpportunitiesForGrowth,
       // ... timing fields
       feedbackItems: {
         create: aggregated.feedbackItems.map(item => ({
           feedbackType: item.feedbackType,
           timestampDisplay: item.timestampDisplay,
           timestampSeconds: parseTimestamp(item.timestampDisplay),
           behaviorTitle: item.behaviorTitle,
           whatYouDid: item.whatYouDid,
           whyItWorked: item.whyItWorked,
           whatWasMissing: item.whatWasMissing,
           actionableNextStep: item.actionableNextStep,
           impactStatement: '...', // Derive or default
           displayOrder: item.displayOrder,
         }))
       },
       skillScores: {
         create: aggregated.skillScores.map(score => ({
           skillId: score.skillId,
           skillScore: score.skillScore,
           categoryOrder: score.categoryOrder,
           skillOrder: score.skillOrder,
         }))
       }
     }
   });
   ```

---

### Phase 3: Frontend Integration

#### 3.1 Live Interview Page Updates

**File:** `src/app/interview/live/page.tsx`

**When last question completes:**

```typescript
// After final recording stops
const handleFinalQuestionComplete = async () => {
  // 1. Start upload
  setUploadStatus('uploading');
  await uploadRecording(recordingBlob, questionOrder);

  // 2. Redirect immediately (don't wait for assessment)
  router.push(`/practice/feedback?interviewId=${interviewId}`);
};
```

#### 3.2 Feedback Page Updates

**File:** `src/app/practice/feedback/page.tsx`

**Enhanced loading logic:**

```typescript
// Poll for assessment completion
const { data: assessmentStatus } = api.assessment.getAssessmentStatus.useQuery(
  { interviewId },
  {
    enabled: !!interviewId,
    refetchInterval: (data) => {
      // Stop polling when completed
      return data?.status === 'COMPLETED' ? false : 3000;
    }
  }
);

// Show skeletons for loading states
{assessmentStatus?.lastQuestionStatus === 'IN_PROGRESS' && (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
)}

{assessmentStatus?.aggregationStatus === 'IN_PROGRESS' && (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Analyzing your overall performance...</span>
      </div>
    </CardHeader>
  </Card>
)}
```

---

## 🗂️ File Structure Summary

### New Files to Create

```
src/server/ai/services/
├── video-assessment.service.ts      # Question video processing
└── assessment-aggregation.service.ts # Final interview aggregation

src/server/api/routers/
└── assessment.ts                     # tRPC endpoints for assessments

src/server/ai/providers/gemini/
└── file-manager.ts                   # Gemini File API wrapper (optional)

docs/
└── video-assessment-implementation-plan.md # This file!
```

### Files to Modify

```
prisma/schema.prisma                  # Add assessment fields to InterviewQuestionRecording
src/server/api/routers/questionRecording.ts  # Trigger assessment after upload
src/app/interview/live/page.tsx       # Redirect after final upload
src/app/practice/feedback/page.tsx    # Add loading states and polling
```

---

## 🔄 Complete User Flow

### Scenario: User completes 3-question interview

**Question 1 (00:00 - 05:00)**
1. ✅ User records answer → video uploaded to Supabase
2. ✅ Upload completes → trigger `processQuestionRecording(recording1.id)`
3. 🔄 Background: Upload to Gemini → Process with AI → Store results
4. ✅ Assessment completes in ~20 seconds

**Question 2 (05:00 - 10:00)**
1. ✅ User records answer → video uploaded to Supabase
2. ✅ Upload completes → trigger `processQuestionRecording(recording2.id)`
3. 🔄 Background: Upload to Gemini → Process with AI → Store results
4. ✅ Assessment completes in ~20 seconds

**Question 3 (10:00 - 15:00)** ⭐ Final Question
1. ✅ User records answer → video uploaded to Supabase
2. ✅ Upload completes → trigger `processQuestionRecording(recording3.id)`
3. ➡️ User immediately redirected to `/practice/feedback?interviewId=xyz`
4. 🔄 Background: Q3 upload to Gemini → Process with AI → Store results

**Feedback Page (/practice/feedback?interviewId=xyz)**

**Initial Load (Questions 1-2 ready, Q3 + Overall processing)**
- ✅ Show Q1 and Q2 feedback immediately (already in DB)
- 🔄 Show skeleton for Q3 section
- 🔄 Show skeleton for Overall Performance section
- 🔄 Poll `getAssessmentStatus` every 3 seconds

**After Q3 completes (~20 seconds)**
- ✅ Q3 feedback appears
- ✅ Trigger `aggregateInterviewAssessment(interviewId)`
- 🔄 Show "Analyzing overall performance..." loader

**After Aggregation completes (~10 seconds)**
- ✅ Overall Performance section appears
- ✅ Stop polling
- ✅ User sees complete feedback

**Total wait time:** ~30 seconds (most spent waiting for final question AI)

---

## ✅ Implementation Decisions

### 1. Assessment Trigger Timing: **Immediate Processing**
Process each question video right after upload completes.
- ✅ Questions 1 & 2 will be ready when user finishes question 3
- ✅ Simpler implementation (no batching logic needed)
- ✅ Better user experience (progressive feedback)

### 2. Video Storage Strategy: **Keep Indefinitely**
Videos remain in Supabase storage for user review.
- Users can revisit their performance anytime
- Videos are valuable for dispute resolution or quality checks
- Storage cost is acceptable (~$0.021/GB/month for webm files)

### 3. Failed Assessment Handling: **Auto-Retry**
Automatic retry with exponential backoff (2-3 attempts).
- Reduces transient API failures
- Logs failures for monitoring
- Shows error state after all retries exhausted

### 4. Feedback Page UX: **Timing + Partial Results**
Show estimated time and display results as they complete.
```
✅ Question 1 - Ready
✅ Question 2 - Ready
⏳ Question 3 - Analyzing... (usually takes 20-30 seconds)
⏳ Overall Assessment - Pending
```
- Clear progress indication
- Users see immediate value (Q1, Q2 feedback)
- Sets expectations for wait time

### 5. Assessment Re-generation: **No User Regeneration**
Assessments are final; no user-triggered retries.
- Ensures consistency and fairness
- Prevents "gaming" the system
- Admin/support can manually trigger if bugs occur

### 6. Model Selection: **Gemini 2.5 Pro for All Processing**
Use Gemini 2.5 Pro for both question assessment and aggregation.
- Consistent quality across all AI processing
- Better reasoning for complex video analysis
- Simplified model management

### 7. Testing Strategy: **Unit + Integration Tests**
Focus on automated testing with real API integration.
- Unit tests with mocked Gemini responses
- Integration tests with actual video processing
- CI/CD pipeline validation before deployment

---

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Update Prisma schema (assessment fields)
- [ ] Create `video-assessment.service.ts`
- [ ] Create Gemini File API upload helper
- [ ] Create `assessment.ts` tRPC router
- [ ] Write unit tests for services

### Phase 2: Question Assessment (Week 1-2)
- [ ] Implement `processQuestionRecording` endpoint
- [ ] Integrate with `questionRecording.completeUpload`
- [ ] Test with sample videos
- [ ] Add error handling and retries

### Phase 3: Aggregation (Week 2)
- [ ] Create `assessment-aggregation.service.ts`
- [ ] Implement `aggregateInterviewAssessment` endpoint
- [ ] Test aggregation logic with mock data
- [ ] Validate against existing prompts

### Phase 4: Frontend Integration (Week 2-3)
- [ ] Update live interview page (redirect logic)
- [ ] Update feedback page (loading states)
- [ ] Add polling for assessment status
- [ ] Implement skeleton loaders
- [ ] Add error states and retry buttons

### Phase 5: Testing & Polish (Week 3)
- [ ] End-to-end testing with real interviews
- [ ] Review AI feedback quality
- [ ] Optimize prompts if needed
- [ ] Performance testing (10+ concurrent assessments)
- [ ] Documentation updates

### Phase 6: Deployment (Week 4)
- [ ] Beta rollout (10% of users)
- [ ] Monitor errors and API costs
- [ ] Collect user feedback
- [ ] Full production rollout

---

## 🎨 Proposed UI/UX Enhancements

### Feedback Page Loading States

**Skeleton Design:**
```tsx
<div className="space-y-4">
  {/* Loading indicator for question being processed */}
  <Card className="border-blue-200 bg-blue-50">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <div>
          <CardTitle>Question 3 - Analyzing...</CardTitle>
          <CardDescription>
            Our AI is reviewing your video response. This usually takes 20-30 seconds.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    </CardContent>
  </Card>

  {/* Loading indicator for overall assessment */}
  <Card className="border-purple-200 bg-purple-50">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
        <div>
          <CardTitle>Creating Your Overall Assessment</CardTitle>
          <CardDescription>
            Synthesizing insights from all your responses...
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  </Card>
</div>
```

---

## 🔐 Security & Privacy Considerations

1. **Video Access Control**
   - ✅ Supabase RLS policies: Users can only access their own videos
   - ✅ Signed URLs expire after 1 hour
   - ✅ Gemini File API: Files auto-delete after 48 hours

2. **Assessment Data Privacy**
   - Store assessmentData as JSON in database (not in Gemini)
   - Only authorized users can view their assessments
   - No video/assessment sharing between users (for now)

3. **Rate Limiting**
   - Implement rate limits on assessment endpoints
   - Prevent abuse (e.g., re-processing same video repeatedly)

4. **Error Logging**
   - Log failures to `gemini_api_logs` table
   - Include error messages but NOT video content
   - Monitor for unusual patterns (API failures, quota issues)

---

## 📈 Success Metrics

### Technical Metrics
- ✅ Assessment completion rate: >95%
- ✅ Average processing time: <30 seconds per question
- ✅ API error rate: <2%
- ✅ User satisfaction with feedback quality: >4.0/5.0

### Business Metrics
- 📊 % of interviews with AI feedback enabled
- 📊 User engagement with feedback (time spent, feedback viewed)
- 📊 Repeat interview rate (do users come back after seeing feedback?)

---

## 🛠️ Troubleshooting Guide (for Future Reference)

### Common Issues

**Problem: "Video processing takes too long"**
- Check video file size (>100MB may be slow)
- Verify Gemini File API status (file.state === "ACTIVE")
- Consider using lower resolution for faster processing

**Problem: "Assessment returns empty response"**
- Verify prompt structure (video BEFORE text)
- Check JSON schema validation
- Review token limits (maxOutputTokens)

**Problem: "Gemini File API upload fails"**
- Verify API key has File API access
- Check video format (must be supported MIME type)
- Ensure file is not corrupted

**Problem: "User sees stale data on feedback page"**
- Check tRPC query caching settings
- Verify polling refetchInterval logic
- Clear browser cache if needed

---

## 💡 Future Enhancements (Post-MVP)

1. **Real-time Progress Updates**
   - Use WebSockets or Server-Sent Events for live progress
   - Show "Currently analyzing timestamp 2:34..." updates

2. **Video Highlights**
   - Extract key moments from AI feedback
   - Generate video clips for strengths/growth areas

3. **Comparative Analytics**
   - Show how user's performance compares to others in same role
   - Benchmark scores across skill domains

4. **AI Coaching Mode**
   - Interactive follow-up: "Want tips on improving SQL optimization?"
   - Personalized practice recommendations

5. **Multi-language Support**
   - Assess interviews in languages other than English
   - Gemini supports 100+ languages

6. **Custom Assessment Rubrics**
   - Allow companies to define their own evaluation criteria
   - Adjust prompts based on company culture/values

---

## 📝 Next Steps

1. **Set up development environment** (verify API keys, prepare sample videos)
2. **Update Prisma schema** (add assessment fields to InterviewQuestionRecording)
3. **Create video-assessment.service.ts** (Gemini File API integration)
4. **Create assessment-aggregation.service.ts** (final interview synthesis)
5. **Build assessment.ts tRPC router** (expose endpoints for frontend)
6. **Update frontend pages** (live interview redirect + feedback page loaders)
7. **Write tests** (unit + integration)
8. **Begin Phase 1 implementation** (see Implementation Phases section)

---

## 📚 References

- [Gemini Video Understanding Docs](https://ai.google.dev/gemini-api/docs/video-understanding)
- [Gemini File API Guide](https://ai.google.dev/api/files)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Your video-assessment.ts prompt](src/server/ai/prompts/assessment/video-assessment.ts)
- [Your assessment-aggregation.ts prompt](src/server/ai/prompts/assessment/assessment-aggregation.ts)

---

**Document Created:** 2025-10-24
**Last Updated:** 2025-10-24
**Status:** ✅ Approved - Ready for Implementation
