-- Add missing enum types for practice sessions
CREATE TYPE "SessionType" AS ENUM ('JOB_DESCRIPTION', 'ROLE_SELECTION');

-- Note: Other enums like Difficulty should already exist from previous migrations
-- But let's make sure they exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Difficulty') THEN
        CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'JUNIOR', 'SENIOR');
    END IF;
END
$$;