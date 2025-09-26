-- Create gemini_api_logs table
CREATE TABLE IF NOT EXISTS gemini_api_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Core tracking fields
    "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "sessionId" TEXT REFERENCES practice_sessions(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    
    -- Request/Response data  
    prompt TEXT NOT NULL,
    "promptLength" INTEGER NOT NULL,
    response JSONB,
    "responseTime" INTEGER,
    
    -- Metadata
    "jobTitle" TEXT,
    company TEXT,
    skills TEXT[],
    "modelUsed" TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    metadata JSONB,
    
    -- Timestamps
    "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_gemini_api_logs_userId ON gemini_api_logs("userId");
CREATE INDEX IF NOT EXISTS idx_gemini_api_logs_sessionId ON gemini_api_logs("sessionId");
CREATE INDEX IF NOT EXISTS idx_gemini_api_logs_timestamp ON gemini_api_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_gemini_api_logs_endpoint ON gemini_api_logs(endpoint);

-- Add RLS policies
ALTER TABLE gemini_api_logs ENABLE ROW LEVEL SECURITY;

-- Admin users can view all logs
CREATE POLICY "Admin users can view all logs" ON gemini_api_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'ADMIN'
        )
    );

-- Users can view their own logs
CREATE POLICY "Users can view own logs" ON gemini_api_logs
    FOR SELECT
    USING ("userId" = auth.uid()::text);

-- System can insert logs (no auth required for inserts from backend)
CREATE POLICY "System can insert logs" ON gemini_api_logs
    FOR INSERT
    WITH CHECK (true);