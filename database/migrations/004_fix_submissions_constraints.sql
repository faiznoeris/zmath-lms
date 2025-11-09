-- ===============================
-- Fix Submissions Constraints
-- ===============================
-- Remove incorrect unique constraint on question_id alone
-- Add correct unique constraint on (user_id, question_id)

-- Drop the incorrect constraint if it exists
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS submissions_question_id_key;

-- Drop any existing unique constraint on user/question
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS unique_user_question_submission;

-- Add the correct unique constraint
-- This ensures one submission per user per question
ALTER TABLE submissions 
ADD CONSTRAINT unique_user_question_submission 
UNIQUE (user_id, question_id);
