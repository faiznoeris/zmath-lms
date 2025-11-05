// Central export for all types and models
// Import and re-export all model types for easy access

export type { Course } from '@/src/models/Course';
export type { Enrollment } from '@/src/models/Enrollment';
export type { Lesson } from '@/src/models/Lesson';
export type { Material } from '@/src/models/Material';
export type { Question } from '@/src/models/Question';
export type { Quiz } from '@/src/models/Quiz';
export type { Result } from '@/src/models/Result';
export type { Submission } from '@/src/models/Submission';
export type { User } from '@/src/models/User';

// Re-export service extended types
export type { LessonWithCourse } from '@/src/services/lesson.service';
export type { MaterialWithLesson } from '@/src/services/material.service';
export type { QuizWithCourse, QuizWithQuestions } from '@/src/services/quiz.service';
