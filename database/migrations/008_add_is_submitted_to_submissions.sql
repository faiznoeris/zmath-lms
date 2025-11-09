-- Migration: Add is_submitted column to submissions table
-- Date: 2025-11-09
-- Description: Adds a boolean column to track whether a submission has been submitted

-- Add is_submitted column
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS is_submitted BOOLEAN DEFAULT FALSE;

-- Update existing records where submitted_at is not null to set is_submitted = true
UPDATE submissions 
SET is_submitted = TRUE 
WHERE submitted_at IS NOT NULL;

-- Add comment to the column
COMMENT ON COLUMN submissions.is_submitted IS 'Indicates whether the submission has been finalized/submitted';
