-- Migration: Update Result for Manual Grading
-- Description: Create function to update existing result when manual grading is done
-- This prevents creating duplicate results when grading essay questions
-- Date: 2025-11-09

-- Create function to update existing result based on result_id
CREATE OR REPLACE FUNCTION update_quiz_result(p_result_id UUID)
RETURNS void AS $$
DECLARE
  v_score INTEGER;
  v_total_points INTEGER;
  v_percentage DECIMAL(5,2);
  v_passing_score INTEGER;
  v_is_passed BOOLEAN;
  v_quiz_id UUID;
  v_user_id UUID;
BEGIN
  -- Get quiz_id and user_id from the result
  SELECT quiz_id, user_id
  INTO v_quiz_id, v_user_id
  FROM results
  WHERE id = p_result_id;
  
  IF v_quiz_id IS NULL THEN
    RAISE EXCEPTION 'Result not found with id %', p_result_id;
  END IF;
  
  -- Calculate total points earned from correct answers and manual scores
  -- Only sum submissions linked to this specific result
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
  WHERE s.result_id = p_result_id;
  
  -- Calculate total possible points for the quiz
  SELECT COALESCE(SUM(points), 1)
  INTO v_total_points
  FROM questions
  WHERE quiz_id = v_quiz_id;
  
  -- Calculate percentage (score is already out of 100)
  v_percentage := v_score;
  
  -- Get passing score for the quiz
  SELECT COALESCE(passing_score, 60)
  INTO v_passing_score
  FROM quizzes
  WHERE id = v_quiz_id;
  
  -- Determine if passed
  v_is_passed := v_percentage >= v_passing_score;
  
  -- Update the existing result
  UPDATE results
  SET 
    score = v_score,
    total_points = v_total_points,
    percentage = v_percentage,
    is_passed = v_is_passed,
    completed_at = NOW()
  WHERE id = p_result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_quiz_result(UUID) IS 
'Recalculates and updates an existing quiz result after manual grading. Does not create new records.';
