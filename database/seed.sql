-- ===============================
-- SEED DATA FOR LMS MATEMATIKA
-- ===============================
-- This file contains test data for the LMS system
-- Run this after running schema.sql

-- NOTE: Replace '74c7dbbc-b7bb-431e-9f20-0c2868750b07' with an actual user UUID from auth.users table
-- You can get it by running: SELECT id FROM auth.users LIMIT 1;

-- ===============================
-- COURSES
-- ===============================
INSERT INTO public.courses (title, description, user_id, teacher_id) VALUES
('Aljabar Dasar', 'Pelajari konsep dasar aljabar termasuk persamaan, variabel, dan fungsi', '74c7dbbc-b7bb-431e-9f20-0c2868750b07', NULL),
('Dasar-Dasar Geometri', 'Pengenalan bentuk, sudut, dan penalaran spasial', '74c7dbbc-b7bb-431e-9f20-0c2868750b07', NULL),
('Pengantar Kalkulus', 'Memahami limit, turunan, dan dasar-dasar integral', '74c7dbbc-b7bb-431e-9f20-0c2868750b07', NULL);

-- ===============================
-- LESSONS
-- ===============================

-- Lessons untuk Aljabar Dasar
INSERT INTO public.lessons (title, content, course_id) 
SELECT 
  title,
  content,
  (SELECT id FROM courses WHERE title = 'Aljabar Dasar' LIMIT 1) as course_id
FROM (VALUES
  ('Pengenalan Variabel', 'Memahami apa itu variabel dan cara menggunakannya dalam ekspresi matematika'),
  ('Menyelesaikan Persamaan Linear', 'Belajar teknik untuk menyelesaikan persamaan dengan satu variabel'),
  ('Bekerja dengan Eksponen', 'Aturan dan sifat-sifat eksponen dan pangkat'),
  ('Pemfaktoran Polinomial', 'Metode untuk memfaktorkan ekspresi kuadrat dan polinomial')
) AS lessons(title, content);

-- Lessons untuk Dasar-Dasar Geometri
INSERT INTO public.lessons (title, content, course_id) 
SELECT 
  title,
  content,
  (SELECT id FROM courses WHERE title = 'Dasar-Dasar Geometri' LIMIT 1) as course_id
FROM (VALUES
  ('Garis dan Sudut', 'Memahami berbagai jenis sudut dan hubungannya'),
  ('Segitiga dan Sifat-Sifatnya', 'Menjelajahi klasifikasi segitiga dan teorema'),
  ('Lingkaran dan Keliling', 'Sifat-sifat lingkaran, jari-jari, diameter, dan perhitungan keliling'),
  ('Luas dan Keliling', 'Menghitung luas dan keliling berbagai bentuk')
) AS lessons(title, content);

-- Lessons untuk Pengantar Kalkulus
INSERT INTO public.lessons (title, content, course_id) 
SELECT 
  title,
  content,
  (SELECT id FROM courses WHERE title = 'Pengantar Kalkulus' LIMIT 1) as course_id
FROM (VALUES
  ('Memahami Limit', 'Konsep limit dan pentingnya dalam kalkulus'),
  ('Pengenalan Turunan', 'Apa itu turunan dan aturan dasar diferensiasi'),
  ('Aplikasi Turunan', 'Menggunakan turunan untuk menyelesaikan masalah dunia nyata')
) AS lessons(title, content);

-- ===============================
-- MATERIALS
-- ===============================
-- Note: Using 'video' or 'document' type only (matching schema constraint)

-- Materi Aljabar Dasar
INSERT INTO public.materials (title, type, content_url, description, lesson_id)
SELECT 
  title, type, content_url, description,
  (SELECT id FROM lessons WHERE lessons.title = lesson_title AND course_id = (SELECT id FROM courses WHERE title = 'Aljabar Dasar' LIMIT 1) LIMIT 1) as lesson_id
FROM (VALUES
  ('Penjelasan Variabel', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Video menjelaskan variabel dengan contoh', 'Pengenalan Variabel'),
  ('Lembar Latihan Variabel', 'document', 'https://example.com/docs/latihan-variabel.pdf', 'Soal latihan untuk variabel', 'Pengenalan Variabel'),
  ('Panduan Persamaan Linear', 'document', 'https://example.com/docs/persamaan-linear.pdf', 'Panduan langkah demi langkah menyelesaikan persamaan linear', 'Menyelesaikan Persamaan Linear'),
  ('Video Aturan Eksponen', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Video tutorial tentang aturan eksponen', 'Bekerja dengan Eksponen'),
  ('Video Teknik Pemfaktoran', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Tutorial video tentang metode pemfaktoran', 'Pemfaktoran Polinomial')
) AS materials(title, type, content_url, description, lesson_title);

-- Materi Geometri
INSERT INTO public.materials (title, type, content_url, description, lesson_id)
SELECT 
  title, type, content_url, description,
  (SELECT id FROM lessons WHERE lessons.title = lesson_title AND course_id = (SELECT id FROM courses WHERE title = 'Dasar-Dasar Geometri' LIMIT 1) LIMIT 1) as lesson_id
FROM (VALUES
  ('Panduan Jenis Sudut', 'document', 'https://example.com/docs/jenis-sudut.pdf', 'Panduan berbagai jenis sudut', 'Garis dan Sudut'),
  ('Teorema Segitiga', 'document', 'https://example.com/docs/teorema-segitiga.pdf', 'Teorema segitiga penting dan pembuktian', 'Segitiga dan Sifat-Sifatnya'),
  ('Video Sifat Lingkaran', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Pengenalan sifat-sifat lingkaran', 'Lingkaran dan Keliling'),
  ('Lembar Contek Rumus Luas', 'document', 'https://example.com/docs/rumus-luas.pdf', 'Referensi cepat untuk rumus luas dan keliling', 'Luas dan Keliling')
) AS materials(title, type, content_url, description, lesson_title);

-- Materi Kalkulus
INSERT INTO public.materials (title, type, content_url, description, lesson_id)
SELECT 
  title, type, content_url, description,
  (SELECT id FROM lessons WHERE lessons.title = lesson_title AND course_id = (SELECT id FROM courses WHERE title = 'Pengantar Kalkulus' LIMIT 1) LIMIT 1) as lesson_id
FROM (VALUES
  ('Panduan Limit', 'document', 'https://example.com/docs/panduan-limit.pdf', 'Panduan memahami konsep limit', 'Memahami Limit'),
  ('Aturan Turunan', 'document', 'https://example.com/docs/aturan-turunan.pdf', 'Aturan turunan umum dan contoh', 'Pengenalan Turunan'),
  ('Turunan di Dunia Nyata', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Video tentang aplikasi praktis turunan', 'Aplikasi Turunan')
) AS materials(title, type, content_url, description, lesson_title);

-- ===============================
-- QUIZZES
-- ===============================

INSERT INTO public.quizzes (title, description, time_limit_minutes, course_id)
SELECT 
  title, description, time_limit_minutes,
  (SELECT id FROM courses WHERE courses.title = course_title LIMIT 1) as course_id
FROM (VALUES
  ('Kuis Dasar Aljabar', 'Uji pemahaman Anda tentang variabel dan persamaan dasar', 15, 'Aljabar Dasar'),
  ('Kuis Bentuk Geometri', 'Kuis tentang segitiga, sudut, dan geometri dasar', 20, 'Dasar-Dasar Geometri'),
  ('Kuis Dasar Kalkulus', 'Penilaian limit dan turunan', 25, 'Pengantar Kalkulus')
) AS quizzes(title, description, time_limit_minutes, course_title);

-- ===============================
-- QUESTIONS
-- ===============================

-- Questions untuk Kuis Dasar Aljabar
INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer)
SELECT 
  (SELECT id FROM quizzes WHERE title = 'Kuis Dasar Aljabar' LIMIT 1) as quiz_id,
  question_text, question_type, options::jsonb, correct_answer
FROM (VALUES
  ('Selesaikan untuk x: 2x + 5 = 13', 'multiple_choice', '["A) x = 4", "B) x = 9", "C) x = 6", "D) x = 8"]', 'A'),
  ('Berapakah nilai dari 3² × 3³?', 'multiple_choice', '["A) 3⁵", "B) 9⁵", "C) 3⁶", "D) 6⁵"]', 'A'),
  ('Sederhanakan: 4(x + 2)', 'multiple_choice', '["A) 4x + 2", "B) 4x + 8", "C) x + 8", "D) 4x + 6"]', 'B')
) AS questions(question_text, question_type, options, correct_answer);

-- Questions untuk Kuis Bentuk Geometri
INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer)
SELECT 
  (SELECT id FROM quizzes WHERE title = 'Kuis Bentuk Geometri' LIMIT 1) as quiz_id,
  question_text, question_type, options::jsonb, correct_answer
FROM (VALUES
  ('Berapakah jumlah sudut dalam segitiga?', 'multiple_choice', '["A) 90°", "B) 180°", "C) 270°", "D) 360°"]', 'B'),
  ('Jika sebuah lingkaran memiliki jari-jari 5 cm, berapakah diameternya?', 'multiple_choice', '["A) 5 cm", "B) 10 cm", "C) 15 cm", "D) 25 cm"]', 'B'),
  ('Sudut pelengkap dari 30° adalah:', 'multiple_choice', '["A) 30°", "B) 60°", "C) 90°", "D) 150°"]', 'B')
) AS questions(question_text, question_type, options, correct_answer);

-- Questions untuk Kuis Dasar Kalkulus
INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer)
SELECT 
  (SELECT id FROM quizzes WHERE title = 'Kuis Dasar Kalkulus' LIMIT 1) as quiz_id,
  question_text, question_type, options::jsonb, correct_answer
FROM (VALUES
  ('Berapakah turunan dari x²?', 'multiple_choice', '["A) x", "B) 2x", "C) x³", "D) 2"]', 'B'),
  ('Limit dari (x - 2)/(x - 2) ketika x mendekati 2 adalah:', 'multiple_choice', '["A) 0", "B) 1", "C) 2", "D) tidak terdefinisi"]', 'D'),
  ('Jika f(x) = 5x, berapakah f''(x)?', 'multiple_choice', '["A) 0", "B) 5", "C) 10x", "D) 5x"]', 'A')
) AS questions(question_text, question_type, options, correct_answer);

-- ===============================
-- VERIFICATION QUERIES
-- ===============================
-- Run these to verify the data was inserted correctly

-- SELECT 'Courses:', COUNT(*) FROM courses;
-- SELECT 'Lessons:', COUNT(*) FROM lessons;
-- SELECT 'Materials:', COUNT(*) FROM materials;
-- SELECT 'Quizzes:', COUNT(*) FROM quizzes;
-- SELECT 'Questions:', COUNT(*) FROM questions;

-- SELECT c.title as course, COUNT(l.id) as lesson_count 
-- FROM courses c 
-- LEFT JOIN lessons l ON c.id = l.course_id 
-- GROUP BY c.id, c.title;

-- SELECT l.title as lesson, COUNT(m.id) as material_count 
-- FROM lessons l 
-- LEFT JOIN materials m ON l.id = m.lesson_id 
-- GROUP BY l.id, l.title;

-- SELECT q.title as quiz, COUNT(qu.id) as question_count 
-- FROM quizzes q 
-- LEFT JOIN questions qu ON q.id = qu.quiz_id 
-- GROUP BY q.id, q.title;
