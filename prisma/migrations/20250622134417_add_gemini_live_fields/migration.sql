-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Difficulty" ADD VALUE 'JUNIOR';
ALTER TYPE "Difficulty" ADD VALUE 'SENIOR';

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "geminiConfig" TEXT;

-- AlterTable
ALTER TABLE "job_descriptions" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "evaluationCriteria" TEXT,
ADD COLUMN     "followUpQuestions" TEXT,
ADD COLUMN     "timeAllocation" INTEGER;
