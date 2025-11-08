-- Migration: Add passing_score column to quizzes table
-- Description: Adds a passing_score column to the quizzes table with a default value of 60
-- and a constraint to ensure the value is between 0 and 100

-- Add passing_score column to quizzes table
ALTER TABLE quizzes 
ADD COLUMN passing_score INTEGER DEFAULT 60 CHECK (passing_score >= 0 AND passing_score <= 100);

-- Update existing quizzes to have the default passing score of 60
UPDATE quizzes 
SET passing_score = 60 
WHERE passing_score IS NULL;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN quizzes.passing_score IS 'Minimum percentage score required to pass the quiz (0-100). Default is 60%.';
