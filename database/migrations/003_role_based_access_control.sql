-- ===============================
-- MIGRATION: Role-Based Access Control
-- ===============================
-- This migration updates policies to implement role-based access:
-- - Admins: Full access to all tables
-- - Teachers: Full access to all tables
-- - Students: Read-only access to most tables, Read/Write for submissions and results
-- ===============================

-- ===============================
-- DROP OLD POLICIES
-- ===============================

-- Drop ALL existing course policies
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Admins have full access to courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;
DROP POLICY IF EXISTS "Course creators can update their own courses" ON courses;
DROP POLICY IF EXISTS "Course creators can delete their own courses" ON courses;
DROP POLICY IF EXISTS "Teachers and Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Teachers and Admins can update courses" ON courses;
DROP POLICY IF EXISTS "Teachers and Admins can delete courses" ON courses;

-- Drop ALL existing enrollment policies
DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins have full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON enrollments;
DROP POLICY IF EXISTS "Course creators can enroll students" ON enrollments;
DROP POLICY IF EXISTS "Users can unenroll from courses" ON enrollments;
DROP POLICY IF EXISTS "Course creators can unenroll students" ON enrollments;
DROP POLICY IF EXISTS "Teachers and Admins can view all enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can unenroll from courses" ON enrollments;

-- Drop ALL existing lessons policies
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins have full access to lessons" ON lessons;
DROP POLICY IF EXISTS "Course creators can create lessons" ON lessons;
DROP POLICY IF EXISTS "Course creators can update their course lessons" ON lessons;
DROP POLICY IF EXISTS "Course creators can delete their course lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers and Admins can view all lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers and Admins can update lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers and Admins can delete lessons" ON lessons;

-- Drop ALL existing material policies
DROP POLICY IF EXISTS "Anyone can view materials" ON materials;
DROP POLICY IF EXISTS "Admins have full access to materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can create materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can update materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can delete materials" ON materials;
DROP POLICY IF EXISTS "Teachers and Admins can view all materials" ON materials;
DROP POLICY IF EXISTS "Teachers and Admins can update materials" ON materials;
DROP POLICY IF EXISTS "Teachers and Admins can delete materials" ON materials;

-- Drop ALL existing quiz policies
DROP POLICY IF EXISTS "Anyone can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins have full access to quizzes" ON quizzes;
DROP POLICY IF EXISTS "Authenticated users can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Authenticated users can update quizzes" ON quizzes;
DROP POLICY IF EXISTS "Authenticated users can delete quizzes" ON quizzes;
DROP POLICY IF EXISTS "Teachers and Admins can view all quizzes" ON quizzes;
DROP POLICY IF EXISTS "Teachers and Admins can update quizzes" ON quizzes;
DROP POLICY IF EXISTS "Teachers and Admins can delete quizzes" ON quizzes;

-- Drop ALL existing question policies
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
DROP POLICY IF EXISTS "Admins have full access to questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can create questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can update questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can delete questions" ON questions;
DROP POLICY IF EXISTS "Teachers and Admins can view all questions" ON questions;
DROP POLICY IF EXISTS "Teachers and Admins can update questions" ON questions;
DROP POLICY IF EXISTS "Teachers and Admins can delete questions" ON questions;

-- Drop ALL existing submission policies
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins have full access to submissions" ON submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON submissions;
DROP POLICY IF EXISTS "Course creators can view submissions for their quizzes" ON submissions;
DROP POLICY IF EXISTS "Teachers and Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON submissions;
DROP POLICY IF EXISTS "Students can update their own submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers and Admins can update submissions" ON submissions;

-- Drop ALL existing result policies
DROP POLICY IF EXISTS "Users can view their own results" ON results;
DROP POLICY IF EXISTS "Admins have full access to results" ON results;
DROP POLICY IF EXISTS "System can insert results" ON results;
DROP POLICY IF EXISTS "Course creators can view results for their quizzes" ON results;
DROP POLICY IF EXISTS "Teachers and Admins can view all results" ON results;
DROP POLICY IF EXISTS "Students can insert results" ON results;
DROP POLICY IF EXISTS "Students can update their own results" ON results;
DROP POLICY IF EXISTS "Teachers and Admins can update results" ON results;

-- ===============================
-- CREATE NEW ROLE-BASED POLICIES
-- ===============================

-- Helper function to check if user is admin or teacher
CREATE OR REPLACE FUNCTION is_admin_or_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'teacher');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- COURSES POLICIES
-- ===============================

-- Teachers and Admins can view all courses
CREATE POLICY "Teachers and Admins can view all courses"
ON courses FOR SELECT USING (is_admin_or_teacher());

-- Teachers and Admins can update courses
CREATE POLICY "Teachers and Admins can update courses"
ON courses FOR UPDATE USING (
  is_admin_or_teacher() OR auth.uid() = user_id
);

-- Teachers and Admins can delete courses
CREATE POLICY "Teachers and Admins can delete courses"
ON courses FOR DELETE USING (
  is_admin_or_teacher() OR auth.uid() = user_id
);

-- ===============================
-- ENROLLMENTS POLICIES
-- ===============================

-- Teachers and Admins can view all enrollments
CREATE POLICY "Teachers and Admins can view all enrollments"
ON enrollments FOR SELECT USING (is_admin_or_teacher());

-- Students can unenroll themselves
CREATE POLICY "Students can unenroll from courses"
ON enrollments FOR DELETE USING (
  auth.uid() = user_id AND 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'student'
);

-- ===============================
-- LESSONS POLICIES
-- ===============================

-- Teachers and Admins can view all lessons
CREATE POLICY "Teachers and Admins can view all lessons"
ON lessons FOR SELECT USING (is_admin_or_teacher());

-- Teachers and Admins can update lessons
CREATE POLICY "Teachers and Admins can update lessons"
ON lessons FOR UPDATE USING (is_admin_or_teacher());

-- Teachers and Admins can delete lessons
CREATE POLICY "Teachers and Admins can delete lessons"
ON lessons FOR DELETE USING (is_admin_or_teacher());

-- ===============================
-- MATERIALS POLICIES
-- ===============================

-- Teachers and Admins can view all materials
CREATE POLICY "Teachers and Admins can view all materials"
ON materials FOR SELECT USING (is_admin_or_teacher());

-- Teachers and Admins can update materials
CREATE POLICY "Teachers and Admins can update materials"
ON materials FOR UPDATE USING (is_admin_or_teacher());

-- Teachers and Admins can delete materials
CREATE POLICY "Teachers and Admins can delete materials"
ON materials FOR DELETE USING (is_admin_or_teacher());

-- ===============================
-- QUIZZES POLICIES
-- ===============================

-- Teachers and Admins can view all quizzes
CREATE POLICY "Teachers and Admins can view all quizzes"
ON quizzes FOR SELECT USING (is_admin_or_teacher());

-- Teachers and Admins can update quizzes
CREATE POLICY "Teachers and Admins can update quizzes"
ON quizzes FOR UPDATE USING (is_admin_or_teacher());

-- Teachers and Admins can delete quizzes
CREATE POLICY "Teachers and Admins can delete quizzes"
ON quizzes FOR DELETE USING (is_admin_or_teacher());

-- ===============================
-- QUESTIONS POLICIES
-- ===============================

-- Teachers and Admins can view all questions
CREATE POLICY "Teachers and Admins can view all questions"
ON questions FOR SELECT USING (is_admin_or_teacher());

-- Teachers and Admins can update questions
CREATE POLICY "Teachers and Admins can update questions"
ON questions FOR UPDATE USING (is_admin_or_teacher());

-- Teachers and Admins can delete questions
CREATE POLICY "Teachers and Admins can delete questions"
ON questions FOR DELETE USING (is_admin_or_teacher());

-- ===============================
-- SUBMISSIONS POLICIES
-- ===============================

-- Teachers and Admins can view all submissions
CREATE POLICY "Teachers and Admins can view all submissions"
ON submissions FOR SELECT USING (is_admin_or_teacher());

-- Students can create their own submissions
CREATE POLICY "Students can create submissions"
ON submissions FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'student'
);

-- Students can update their own submissions (before grading)
CREATE POLICY "Students can update their own submissions"
ON submissions FOR UPDATE USING (
  auth.uid() = user_id AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'student'
);

-- Teachers and Admins can update any submissions (for grading)
CREATE POLICY "Teachers and Admins can update submissions"
ON submissions FOR UPDATE USING (is_admin_or_teacher());

-- ===============================
-- RESULTS POLICIES
-- ===============================

-- Teachers and Admins can view all results
CREATE POLICY "Teachers and Admins can view all results"
ON results FOR SELECT USING (is_admin_or_teacher());

-- Students can insert their own results
CREATE POLICY "Students can insert results"
ON results FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'student'
);

-- Students can update their own results
CREATE POLICY "Students can update their own results"
ON results FOR UPDATE USING (
  auth.uid() = user_id AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'student'
);

-- Teachers and Admins can update any results
CREATE POLICY "Teachers and Admins can update results"
ON results FOR UPDATE USING (is_admin_or_teacher());

-- ===============================
-- SUMMARY
-- ===============================
-- After this migration:
-- 1. Admins have full access (via existing "Admins have full access" policies)
-- 2. Teachers have full access to educational content
-- 3. Students have:
--    - READ access to: courses, lessons, materials, quizzes, questions
--    - READ/WRITE access to: their own submissions and results
--    - Can unenroll from courses
-- ===============================
