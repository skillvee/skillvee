-- Add practice sessions table for temporary session storage
CREATE TABLE "practice_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "jobTitle" TEXT,
    "company" TEXT,
    "team" TEXT,
    "experience" TEXT,
    "archetypeId" TEXT,
    "requirements" TEXT[] NOT NULL DEFAULT '{}',
    "focusAreas" TEXT[] NOT NULL DEFAULT '{}',
    "difficulty" TEXT,
    "extractedInfo" JSONB,
    "originalDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX "practice_sessions_userId_idx" ON "practice_sessions"("userId");
CREATE INDEX "practice_sessions_sessionType_idx" ON "practice_sessions"("sessionType");
CREATE INDEX "practice_sessions_archetypeId_idx" ON "practice_sessions"("archetypeId");
CREATE INDEX "practice_sessions_expiresAt_idx" ON "practice_sessions"("expiresAt");

-- Add foreign key constraints
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_archetypeId_fkey" FOREIGN KEY ("archetypeId") REFERENCES "role_archetypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add practice session relation to interviews table
ALTER TABLE "interviews" ADD COLUMN "practiceSessionId" TEXT;

-- Add foreign key for practice session in interviews
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_practiceSessionId_fkey" FOREIGN KEY ("practiceSessionId") REFERENCES "practice_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for practice session relation
CREATE INDEX "interviews_practiceSessionId_idx" ON "interviews"("practiceSessionId");