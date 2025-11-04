export interface Quiz {
  id: string;
  lesson_id?: string;
  course_id?: number; // Foreign key to courses table
  title: string;
  description?: string;
  time_limit_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  is_graded: boolean;
  created_at: string;
  updated_at: string;
}
