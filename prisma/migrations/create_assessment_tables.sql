-- Create InterviewAssessment table
CREATE TABLE IF NOT EXISTS "InterviewAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "performanceLabel" TEXT NOT NULL,
    "whatYouDidBest" TEXT NOT NULL,
    "topOpportunitiesForGrowth" TEXT NOT NULL,
    "videoUrl" TEXT,
    "videoDurationSeconds" INTEGER,
    "videoThumbnailUrl" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "interviewDurationSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewAssessment_pkey" PRIMARY KEY ("id")
);

-- Create unique index on interviewId
CREATE UNIQUE INDEX "InterviewAssessment_interviewId_key" ON "InterviewAssessment"("interviewId");

-- Create index on userId for faster lookups
CREATE INDEX "InterviewAssessment_userId_idx" ON "InterviewAssessment"("userId");

-- Create AssessmentFeedback table
CREATE TABLE IF NOT EXISTS "AssessmentFeedback" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "feedbackType" TEXT NOT NULL,
    "timestampDisplay" TEXT NOT NULL,
    "timestampSeconds" INTEGER NOT NULL,
    "behaviorTitle" TEXT NOT NULL,
    "whatYouDid" TEXT NOT NULL,
    "whyItWorked" TEXT,
    "whatWasMissing" TEXT,
    "actionableNextStep" TEXT,
    "impactStatement" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentFeedback_pkey" PRIMARY KEY ("id")
);

-- Create index on assessmentId
CREATE INDEX "AssessmentFeedback_assessmentId_idx" ON "AssessmentFeedback"("assessmentId");

-- Create AssessmentSkillScore table
CREATE TABLE IF NOT EXISTS "AssessmentSkillScore" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryIcon" TEXT NOT NULL,
    "categoryOrder" INTEGER NOT NULL,
    "skillName" TEXT NOT NULL,
    "skillScore" INTEGER NOT NULL,
    "isFocusArea" BOOLEAN NOT NULL DEFAULT false,
    "skillOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentSkillScore_pkey" PRIMARY KEY ("id")
);

-- Create index on assessmentId
CREATE INDEX "AssessmentSkillScore_assessmentId_idx" ON "AssessmentSkillScore"("assessmentId");

-- Add foreign key constraints
ALTER TABLE "InterviewAssessment"
    ADD CONSTRAINT "InterviewAssessment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InterviewAssessment"
    ADD CONSTRAINT "InterviewAssessment_interviewId_fkey"
    FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InterviewAssessment"
    ADD CONSTRAINT "InterviewAssessment_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "InterviewCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AssessmentFeedback"
    ADD CONSTRAINT "AssessmentFeedback_assessmentId_fkey"
    FOREIGN KEY ("assessmentId") REFERENCES "InterviewAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssessmentSkillScore"
    ADD CONSTRAINT "AssessmentSkillScore_assessmentId_fkey"
    FOREIGN KEY ("assessmentId") REFERENCES "InterviewAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;