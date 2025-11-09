-- Migration: Update Percentage Calculation
-- Description: Change percentage calculation from (score/total_points)*100 to score (out of 100)
-- This assumes scores are already calculated out of 100
-- Date: 2025-11-09

-- Step 1: Drop the generated column
ALTER TABLE results 
DROP COLUMN IF EXISTS percentage;

-- Step 2: Add percentage as a regular DECIMAL column (not generated)
ALTER TABLE results 
ADD COLUMN percentage DECIMAL(5,2);

-- Step 3: Update existing data - set percentage equal to score (assuming score is out of 100)
UPDATE results
SET percentage = score;

-- Step 4: Add NOT NULL constraint after populating data
ALTER TABLE results 
ALTER COLUMN percentage SET NOT NULL;

-- Step 5: Add check constraint to ensure percentage is between 0 and 100
ALTER TABLE results
ADD CONSTRAINT check_percentage_range CHECK (percentage >= 0 AND percentage <= 100);

COMMENT ON COLUMN results.percentage IS 
'Score as a percentage out of 100. This is the same as the score field since scores are calculated out of 100.';
