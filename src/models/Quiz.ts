export interface Quiz {
  id: string;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  is_graded?: boolean;
  course_id?: string;
  created_at: string;
}
