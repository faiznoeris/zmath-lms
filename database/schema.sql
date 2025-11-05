-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- First, drop existing tables if they exist
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- ===============================
-- TABLES
-- ===============================

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- teacher_id
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- student_id
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, course_id)
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  option_a VARCHAR,
  option_b VARCHAR,
  option_c VARCHAR,
  option_d VARCHAR,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  quizzes_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  selected_answer CHAR(1) CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- student_id
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score INTEGER NOT NULL CHECK (score >= 0),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(quiz_id, user_id)
);

-- ===============================
-- ROW LEVEL SECURITY POLICIES
-- ===============================

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view courses" 
ON courses FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create courses" 
ON courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Course creators can update their own courses" 
ON courses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Course creators can delete their own courses" 
ON courses FOR DELETE USING (auth.uid() = user_id);

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" 
ON enrollments FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Users can enroll in courses" 
ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Course creators can enroll students" 
ON enrollments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_id 
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Users can unenroll from courses" 
ON enrollments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Course creators can unenroll students" 
ON enrollments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.user_id = auth.uid()
  )
);

-- Lessons policies
CREATE POLICY "Anyone can view lessons" 
ON lessons FOR SELECT USING (true);

CREATE POLICY "Course creators can create lessons" 
ON lessons FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_id 
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Course creators can update their course lessons" 
ON lessons FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_id 
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Course creators can delete their course lessons" 
ON lessons FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_id 
    AND courses.user_id = auth.uid()
  )
);

-- Quizzes policies
CREATE POLICY "Anyone can view quizzes" 
ON quizzes FOR SELECT USING (true);

CREATE POLICY "Course creators can create quizzes" 
ON quizzes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_id 
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Course creators can update their course quizzes" 
ON quizzes FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_id 
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Course creators can delete their course quizzes" 
ON quizzes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_id 
    AND courses.user_id = auth.uid()
  )
);

-- Questions policies
CREATE POLICY "Anyone can view questions" 
ON questions FOR SELECT USING (true);

CREATE POLICY "Course creators can create questions" 
ON questions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM quizzes 
    JOIN courses ON quizzes.course_id = courses.id
    WHERE quizzes.id = quizzes_id 
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Course creators can update questions" 
ON questions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    JOIN courses ON quizzes.course_id = courses.id
    WHERE quizzes.id = quizzes_id 
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Course creators can delete questions" 
ON questions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    JOIN courses ON quizzes.course_id = courses.id
    WHERE quizzes.id = quizzes_id 
    AND courses.user_id = auth.uid()
  )
);

-- Submissions policies
CREATE POLICY "Users can view their own submissions" 
ON submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions" 
ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Course creators can view submissions for their quizzes" 
ON submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM questions
    JOIN quizzes ON questions.quizzes_id = quizzes.id
    JOIN courses ON quizzes.course_id = courses.id
    WHERE questions.id = submissions.question_id
    AND courses.user_id = auth.uid()
  )
);

-- Results policies
CREATE POLICY "Users can view their own results" 
ON results FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert results" 
ON results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Course creators can view results for their quizzes" 
ON results FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quizzes
    JOIN courses ON quizzes.course_id = courses.id
    WHERE quizzes.id = results.quiz_id
    AND courses.user_id = auth.uid()
  )
);

-- ===============================
-- FUNCTIONS AND TRIGGERS
-- ===============================

-- Function to calculate quiz results
CREATE OR REPLACE FUNCTION calculate_quiz_result(p_quiz_id INTEGER, p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_score INTEGER;
  v_total_questions INTEGER;
BEGIN
  -- Count correct answers
  SELECT COUNT(*)
  INTO v_score
  FROM submissions s
  JOIN questions q ON s.question_id = q.id
  WHERE q.quizzes_id = p_quiz_id
    AND s.user_id = p_user_id
    AND s.is_correct = true;
  
  -- Count total questions
  SELECT COUNT(*)
  INTO v_total_questions
  FROM questions
  WHERE quizzes_id = p_quiz_id;
  
  -- Calculate percentage score
  v_score := (v_score * 100) / NULLIF(v_total_questions, 0);
  
  -- Insert or update result
  INSERT INTO results (quiz_id, user_id, score, completed_at)
  VALUES (p_quiz_id, p_user_id, v_score, NOW())
  ON CONFLICT (quiz_id, user_id) 
  DO UPDATE SET score = v_score, completed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if answer is correct and update submission
CREATE OR REPLACE FUNCTION check_submission_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Compare selected answer with correct answer
  NEW.is_correct := (
    SELECT NEW.selected_answer = correct_answer
    FROM questions
    WHERE id = NEW.question_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically check answers on submission
CREATE TRIGGER check_answer_on_submit
  BEFORE INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_submission_answer();



-- Drop existing materials policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view materials" ON materials;
  DROP POLICY IF EXISTS "Authenticated users can create materials" ON materials;
  DROP POLICY IF EXISTS "Authenticated users can update materials" ON materials;
  DROP POLICY IF EXISTS "Authenticated users can delete materials" ON materials;
  DROP POLICY IF EXISTS "Users can update materials" ON materials;
  DROP POLICY IF EXISTS "Users can delete materials" ON materials;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create materials table if not exists
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  type TEXT CHECK (type IN ('video', 'document')) NOT NULL,
  content_url TEXT NOT NULL,
  description TEXT,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Materials policies
CREATE POLICY "Anyone can view materials" 
ON materials FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create materials" 
ON materials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update materials" 
ON materials FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete materials" 
ON materials FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_materials_timestamp ON materials;
CREATE TRIGGER update_materials_timestamp
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_materials_updated_at();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_materials_lesson_id ON materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);



DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;

-- Create quizzes table if not exists
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table if not exists
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')) NOT NULL,
  options JSONB,
  correct_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Drop existing quizzes policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view quizzes" ON quizzes;
  DROP POLICY IF EXISTS "Authenticated users can create quizzes" ON quizzes;
  DROP POLICY IF EXISTS "Authenticated users can update quizzes" ON quizzes;
  DROP POLICY IF EXISTS "Authenticated users can delete quizzes" ON quizzes;
  DROP POLICY IF EXISTS "Course creators can create quizzes" ON quizzes;
  DROP POLICY IF EXISTS "Course creators can update their course quizzes" ON quizzes;
  DROP POLICY IF EXISTS "Course creators can delete their course quizzes" ON quizzes;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Drop existing questions policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
  DROP POLICY IF EXISTS "Authenticated users can create questions" ON questions;
  DROP POLICY IF EXISTS "Authenticated users can update questions" ON questions;
  DROP POLICY IF EXISTS "Authenticated users can delete questions" ON questions;
  DROP POLICY IF EXISTS "Course creators can create questions" ON questions;
  DROP POLICY IF EXISTS "Course creators can update questions" ON questions;
  DROP POLICY IF EXISTS "Course creators can delete questions" ON questions;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Quizzes policies
CREATE POLICY "Anyone can view quizzes" 
ON quizzes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create quizzes" 
ON quizzes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update quizzes" 
ON quizzes FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete quizzes" 
ON quizzes FOR DELETE USING (auth.uid() IS NOT NULL);

-- Questions policies
CREATE POLICY "Anyone can view questions" 
ON questions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" 
ON questions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update questions" 
ON questions FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete questions" 
ON questions FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_quizzes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quizzes_timestamp ON quizzes;
CREATE TRIGGER update_quizzes_timestamp
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_quizzes_updated_at();

CREATE OR REPLACE FUNCTION update_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_questions_timestamp ON questions;
CREATE TRIGGER update_questions_timestamp
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_questions_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_type ON questions(question_type);
