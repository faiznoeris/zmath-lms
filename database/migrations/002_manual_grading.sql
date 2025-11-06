-- Migration: Add manual grading support for submissions
-- filepath: database/migrations/002_manual_grading.sql

-- Add manual grading fields to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS manual_score INTEGER,
ADD COLUMN IF NOT EXISTS graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS requires_grading BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;

-- Add index for faster lookups of submissions requiring grading
CREATE INDEX IF NOT EXISTS idx_submissions_requires_grading 
ON submissions(requires_grading, quiz_id) 
WHERE requires_grading = TRUE;

-- Add index for graded submissions
CREATE INDEX IF NOT EXISTS idx_submissions_graded 
ON submissions(graded_by, graded_at);

-- Update RLS policies for submissions to allow teachers to grade
CREATE POLICY "Teachers can grade submissions for their quizzes" 
ON submissions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM questions
    JOIN quizzes ON questions.quiz_id = quizzes.id
    JOIN courses ON quizzes.course_id = courses.id
    WHERE questions.id = submissions.question_id
    AND courses.user_id = auth.uid()
  )
);

-- Function to mark essay questions as requiring grading
CREATE OR REPLACE FUNCTION mark_essay_for_grading()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the question is an essay type
  IF EXISTS (
    SELECT 1 FROM questions 
    WHERE id = NEW.question_id 
    AND question_type = 'essay'
  ) THEN
    NEW.requires_grading = TRUE;
    NEW.is_correct = NULL; -- Essays can't be auto-graded
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically mark essay submissions for manual grading
DROP TRIGGER IF EXISTS mark_essay_grading ON submissions;
CREATE TRIGGER mark_essay_grading
  BEFORE INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION mark_essay_for_grading();

-- Update the check_submission_answer function to handle essay questions
CREATE OR REPLACE FUNCTION check_submission_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip auto-checking for essay questions (will be marked by trigger above)
  IF EXISTS (
    SELECT 1 FROM questions 
    WHERE id = NEW.question_id 
    AND question_type = 'essay'
  ) THEN
    NEW.is_correct := NULL;
    RETURN NEW;
  END IF;
  
  -- Compare selected answer with correct answer for other types
  NEW.is_correct := (
    SELECT NEW.selected_answer = correct_answer
    FROM questions
    WHERE id = NEW.question_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the calculate_quiz_result function to consider manual scores
CREATE OR REPLACE FUNCTION calculate_quiz_result(p_quiz_id UUID, p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_score INTEGER;
  v_total_points INTEGER;
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
  
  -- Insert or update result
  INSERT INTO results (quiz_id, user_id, score, total_points, completed_at)
  VALUES (p_quiz_id, p_user_id, v_score, v_total_points, NOW())
  ON CONFLICT (quiz_id, user_id) 
  DO UPDATE SET 
    score = v_score, 
    total_points = v_total_points,
    completed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for pending submissions that need grading
CREATE OR REPLACE VIEW pending_submissions_view AS
SELECT 
  s.id,
  s.user_id,
  s.quiz_id,
  s.question_id,
  s.selected_answer,
  s.submitted_at,
  s.requires_grading,
  q.question_text,
  q.question_type,
  q.points,
  qz.title as quiz_title,
  qz.course_id,
  c.title as course_title,
  c.user_id as teacher_id,
  u.email as student_email,
  u.raw_user_meta_data->>'full_name' as student_name
FROM submissions s
JOIN questions q ON s.question_id = q.id
JOIN quizzes qz ON q.quiz_id = qz.id
JOIN courses c ON qz.course_id = c.id
JOIN auth.users u ON s.user_id = u.id
WHERE s.requires_grading = TRUE 
  AND s.graded_at IS NULL;

-- Grant access to the view
GRANT SELECT ON pending_submissions_view TO authenticated;

COMMENT ON COLUMN submissions.manual_score IS 'Score assigned by teacher for manual grading (overrides auto-grading)';
COMMENT ON COLUMN submissions.graded_by IS 'User ID of teacher who graded this submission';
COMMENT ON COLUMN submissions.graded_at IS 'Timestamp when submission was graded';
COMMENT ON COLUMN submissions.requires_grading IS 'Flag indicating if submission needs manual grading (e.g., essay questions)';
COMMENT ON COLUMN submissions.teacher_feedback IS 'Feedback from teacher about the submission';
