-- Migration: Add quiz timer tracking
-- filepath: database/migrations/003_add_quiz_timers.sql

-- Add timer fields to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS time_remaining INTEGER, -- seconds remaining
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_timed_out BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_submissions_timer 
ON submissions(user_id, quiz_id, started_at) 
WHERE submitted_at IS NULL;

-- Add trigger to auto-set started_at
CREATE OR REPLACE FUNCTION set_submission_started_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_started_at
BEFORE INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION set_submission_started_at();