-- Migration: Move answer_file_url from results to submissions table
-- Description: The answer_file_url should be per question submission, not per quiz result
-- This migration moves the column from results table to submissions table

-- Step 1: Add answer_file_url column to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS answer_file_url TEXT;

-- Step 2: Add comment to document the column
COMMENT ON COLUMN submissions.answer_file_url IS 'URL/path to uploaded answer file for this question (e.g., scanned essay answers, written work images)';

-- Step 3: Remove answer_file_url column from results table (if it exists)
ALTER TABLE results 
DROP COLUMN IF EXISTS answer_file_url;

-- Note: This migration is safe to run multiple times (idempotent)
