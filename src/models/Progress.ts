export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  completion_percentage: number;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}
