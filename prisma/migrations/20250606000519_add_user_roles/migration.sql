-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INTERVIEWER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'INTERVIEWER';

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
