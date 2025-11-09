-- Migration: Allow Multiple Quiz Attempts
-- Description: Remove unique constraint on results table and update calculate_quiz_result to always create new results
-- This allows students to retake quizzes and keep history of all attempts
-- Date: 2025-11-09

-- Step 1: Drop the unique constraint on (quiz_id, user_id)
ALTER TABLE results DROP CONSTRAINT IF EXISTS results_quiz_id_user_id_key;

-- Step 2: Update the calculate_quiz_result function to always INSERT new results
CREATE OR REPLACE FUNCTION calculate_quiz_result(p_quiz_id UUID, p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_score INTEGER;
  v_total_points INTEGER;
  v_percentage DECIMAL(5,2);
  v_passing_score INTEGER;
  v_is_passed BOOLEAN;
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
    AND s.user_id = p_user_id;
  
  -- Calculate total possible points for the quiz
  SELECT COALESCE(SUM(points), 1)
  INTO v_total_points
  FROM questions
  WHERE quiz_id = p_quiz_id;
  
  -- Calculate percentage
  v_percentage := (v_score::DECIMAL / v_total_points::DECIMAL) * 100;
  
  -- Get passing score for the quiz
  SELECT COALESCE(passing_score, 60)
  INTO v_passing_score
  FROM quizzes
  WHERE id = p_quiz_id;
  
  -- Determine if passed
  v_is_passed := v_percentage >= v_passing_score;
  
  -- Always insert a new result (allows multiple attempts)
  INSERT INTO results (quiz_id, user_id, score, total_points, is_passed, completed_at)
  VALUES (p_quiz_id, p_user_id, v_score, v_total_points, v_is_passed, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_quiz_result(UUID, UUID) IS 
'Calculates quiz score and creates a new result entry. Always creates new records to support multiple quiz attempts.';

-- Step 3: Add index for faster lookups by quiz_id and user_id
CREATE INDEX IF NOT EXISTS idx_results_quiz_user ON results(quiz_id, user_id, completed_at DESC);

COMMENT ON INDEX idx_results_quiz_user IS 
'Optimizes queries for fetching user results for a specific quiz, ordered by completion date.';
