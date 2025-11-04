export interface Lesson {
  id: number;
  title: string;
  content?: string;
  order_number: number;
  created_at: string;
  course_id: number; // Foreign key to courses table
}

export interface CreateLessonInput {
  title: string;
  content?: string;
  order_number: number;
  course_id: number;
}

export interface UpdateLessonInput {
  title?: string;
  content?: string;
  order_number?: number;
  course_id?: number;
}
