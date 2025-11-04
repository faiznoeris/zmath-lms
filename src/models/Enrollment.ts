export interface Enrollment {
  id: number;
  enrolled_at: string;
  user_id: string;
  course_id: number;
}

export interface CreateEnrollmentInput {
  user_id: string;
  course_id: number;
}

export interface EnrollmentWithDetails extends Enrollment {
  user?: {
    id: string;
    username: string;
    full_name?: string;
  };
  course?: {
    id: number;
    title: string;
    description?: string;
  };
}
