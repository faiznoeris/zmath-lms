-- Migration: Add is_passed column to results table
-- Created: 2025-11-08
-- Description: Add is_passed boolean column to store whether the result meets the passing score

-- Add is_passed column to results table
ALTER TABLE results
ADD COLUMN is_passed BOOLEAN;

-- Update existing records to calculate is_passed based on percentage and quiz passing_score
UPDATE results r
SET is_passed = (
  CASE 
    WHEN r.percentage >= COALESCE(q.passing_score, 60) THEN true
    ELSE false
  END
)
FROM quizzes q
WHERE r.quiz_id = q.id;

-- Set NOT NULL constraint after populating existing data
ALTER TABLE results
ALTER COLUMN is_passed SET NOT NULL;

-- Add comment
COMMENT ON COLUMN results.is_passed IS 'Whether the result meets the quiz passing score requirement';

-- Update the calculate_quiz_result function to set is_passed
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
  
  -- Insert or update result
  INSERT INTO results (quiz_id, user_id, score, total_points, is_passed, completed_at)
  VALUES (p_quiz_id, p_user_id, v_score, v_total_points, v_is_passed, NOW())
  ON CONFLICT (quiz_id, user_id) 
  DO UPDATE SET 
    score = v_score, 
    total_points = v_total_points,
    is_passed = v_is_passed,
    completed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
