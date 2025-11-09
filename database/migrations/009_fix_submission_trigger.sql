-- Migration: Fix submission answer check trigger
-- Description: Modify the trigger to only update is_correct when selected_answer is actually changed
-- Date: 2025-11-09

-- Drop existing trigger function and recreate with proper logic
DROP TRIGGER IF EXISTS check_answer_on_submit_update ON submissions;

-- Update the trigger function to only check answer when selected_answer changes
CREATE OR REPLACE FUNCTION check_submission_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update is_correct if selected_answer is being set or changed
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.selected_answer IS DISTINCT FROM OLD.selected_answer) THEN
    -- Compare selected answer with correct answer
    NEW.is_correct := (
      SELECT NEW.selected_answer = correct_answer
      FROM questions
      WHERE id = NEW.question_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the update trigger
CREATE TRIGGER check_answer_on_submit_update
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_submission_answer();

COMMENT ON FUNCTION check_submission_answer() IS 
'Automatically checks if selected_answer matches correct_answer. Only runs when selected_answer is inserted or updated.';
