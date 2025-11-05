export interface Course {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  user_id: string; // Creator/Owner
  teacher_id?: string; // Assigned teacher
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  teacher_id?: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  teacher_id?: string;
}
