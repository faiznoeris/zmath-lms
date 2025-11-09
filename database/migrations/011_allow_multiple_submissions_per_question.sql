-- Migration: Allow Multiple Submissions Per Question
-- Description: Remove unique constraint on submissions to allow multiple quiz attempts
-- Link submissions to specific result attempts via result_id
-- Date: 2025-11-09

-- Step 1: Add result_id column to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS result_id UUID REFERENCES results(id) ON DELETE CASCADE;

COMMENT ON COLUMN submissions.result_id IS 
'Links this submission to a specific quiz attempt result. Allows multiple submissions per user/question across different attempts.';

-- Step 2: Drop the unique constraint that prevents multiple submissions per user/question
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS unique_user_question_submission;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_result_id ON submissions(result_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_quiz ON submissions(user_id, quiz_id);

COMMENT ON INDEX idx_submissions_result_id IS 
'Optimizes queries for fetching submissions by result attempt.';

COMMENT ON INDEX idx_submissions_user_quiz IS 
'Optimizes queries for fetching submissions by user and quiz.';

DROP FUNCTION calculate_quiz_result(uuid,uuid);
-- Step 4: Update calculate_quiz_result to link submissions to the new result
CREATE OR REPLACE FUNCTION calculate_quiz_result(p_quiz_id UUID, p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_score INTEGER;
  v_total_points INTEGER;
  v_percentage DECIMAL(5,2);
  v_passing_score INTEGER;
  v_is_passed BOOLEAN;
  v_result_id UUID;
BEGIN
  -- Calculate total points earned from correct answers and manual scores
  SELECT COALESCE(SUM(
    CASE 
      -- Use manual score if provided
      WHEN s.manual_score IS NOT NULL THEN s.manual_score
      -- Use points if auto-graded correctly
      WHEN s.is_correct = true THEN q.points
      -- Otherwise 0 points
      ELSE 0
    END
  ), 0)
  INTO v_score
  FROM submissions s
  JOIN questions q ON s.question_id = q.id
  WHERE q.quiz_id = p_quiz_id
    AND s.user_id = p_user_id
    AND s.result_id IS NULL; -- Only count submissions not yet linked to a result
  
  -- Calculate total possible points for the quiz
  SELECT COALESCE(SUM(points), 1)
  INTO v_total_points
  FROM questions
  WHERE quiz_id = p_quiz_id;
  
  -- Calculate percentage (score is already out of 100)
  v_percentage := v_score;
  
  -- Get passing score for the quiz
  SELECT COALESCE(passing_score, 60)
  INTO v_passing_score
  FROM quizzes
  WHERE id = p_quiz_id;
  
  -- Determine if passed
  v_is_passed := v_percentage >= v_passing_score;
  
  -- Insert a new result and get its ID
  INSERT INTO results (quiz_id, user_id, score, total_points, is_passed, percentage, completed_at)
  VALUES (p_quiz_id, p_user_id, v_score, v_total_points, v_is_passed, v_percentage, NOW())
  RETURNING id INTO v_result_id;
  
  -- Link all unlinked submissions for this attempt to the new result
  UPDATE submissions
  SET result_id = v_result_id
  WHERE user_id = p_user_id
    AND quiz_id = p_quiz_id
    AND result_id IS NULL;
  
  RETURN v_result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_quiz_result(UUID, UUID) IS 
'Calculates quiz score, creates a new result entry, and links submissions to that result. Returns the result ID.';
