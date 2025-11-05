-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- First, drop existing tables if they exist
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
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

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  type TEXT CHECK (type IN ('video', 'document')) NOT NULL,
  content_url TEXT NOT NULL,
  description TEXT,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')) NOT NULL,
  option_a VARCHAR,
  option_b VARCHAR,
  option_c VARCHAR,
  option_d VARCHAR,
  correct_answer VARCHAR,
  points INTEGER DEFAULT 1 CHECK (points > 0),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  selected_answer TEXT,
  is_correct BOOLEAN,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score INTEGER NOT NULL CHECK (score >= 0),
  total_points INTEGER NOT NULL CHECK (total_points > 0),
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((score::DECIMAL / total_points::DECIMAL) * 100) STORED,
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
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
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

-- Materials policies
CREATE POLICY "Anyone can view materials" 
ON materials FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create materials" 
ON materials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update materials" 
ON materials FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete materials" 
ON materials FOR DELETE USING (auth.uid() IS NOT NULL);

-- Submissions policies
CREATE POLICY "Users can view their own submissions" 
ON submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions" 
ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Course creators can view submissions for their quizzes" 
ON submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM questions
    JOIN quizzes ON questions.quiz_id = quizzes.id
    JOIN courses ON quizzes.course_id = courses.id
    WHERE questions.id = submissions.question_id
    AND courses.user_id = auth.uid()
  )
);

-- Create updated_at trigger for submissions
CREATE OR REPLACE FUNCTION update_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_submissions_timestamp ON submissions;
CREATE TRIGGER update_submissions_timestamp
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_submissions_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_question_id ON submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_id ON submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);

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
CREATE OR REPLACE FUNCTION calculate_quiz_result(p_quiz_id UUID, p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_score INTEGER;
  v_total_points INTEGER;
BEGIN
  -- Calculate total points earned from correct answers
  SELECT COALESCE(SUM(q.points), 0)
  INTO v_score
  FROM submissions s
  JOIN questions q ON s.question_id = q.id
  WHERE q.quiz_id = p_quiz_id
    AND s.user_id = p_user_id
    AND s.is_correct = true;
  
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

-- Create updated_at trigger for materials
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

-- Create updated_at trigger for quizzes
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

-- Create updated_at trigger for questions
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
CREATE INDEX IF NOT EXISTS idx_materials_lesson_id ON materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_type ON questions(question_type);
