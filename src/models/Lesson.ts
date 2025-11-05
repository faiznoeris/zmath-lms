export interface Lesson {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  course_id: string;
}

export interface CreateLessonInput {
  title: string;
  content?: string;
  course_id: string;
}

export interface UpdateLessonInput {
  title?: string;
  content?: string;
  course_id?: string;
}
