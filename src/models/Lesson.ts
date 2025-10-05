export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content?: string;
  order_index: number;
  estimated_minutes?: number;
  created_at: string;
  updated_at: string;
}
