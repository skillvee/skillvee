-- Add AssessmentStatus enum
CREATE TYPE "AssessmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- Add video assessment fields to interview_question_recordings table
ALTER TABLE "interview_question_recordings"
  ADD COLUMN "geminiFileUri" TEXT,
  ADD COLUMN "geminiFileUploadedAt" TIMESTAMP(3),
  ADD COLUMN "assessmentStatus" "AssessmentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "assessmentStartedAt" TIMESTAMP(3),
  ADD COLUMN "assessmentCompletedAt" TIMESTAMP(3),
  ADD COLUMN "assessmentError" TEXT,
  ADD COLUMN "assessmentData" JSONB;

-- Add index on assessmentStatus for efficient querying
CREATE INDEX "interview_question_recordings_assessmentStatus_idx" ON "interview_question_recordings"("assessmentStatus");
