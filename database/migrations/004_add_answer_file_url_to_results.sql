-- ===============================
-- MIGRATION: Add Answer File URL to Results Table
-- ===============================
-- This migration adds a column to store the file URL for scanned/uploaded answers
-- Useful for essay-type questions where students upload images/PDFs of their work
-- ===============================

-- Add the answer_file_url column to results table
ALTER TABLE results
ADD COLUMN answer_file_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN results.answer_file_url IS 'URL/path to uploaded answer file (e.g., scanned essay answers, written work images)';

-- ===============================
-- ROLLBACK (if needed)
-- ===============================
-- To rollback this migration, run:
-- ALTER TABLE results DROP COLUMN IF EXISTS answer_file_url;
-- ===============================
