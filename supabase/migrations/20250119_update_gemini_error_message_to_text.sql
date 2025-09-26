-- Update errorMessage column to TEXT type to support longer error messages
ALTER TABLE gemini_api_logs
ALTER COLUMN "errorMessage" TYPE TEXT;