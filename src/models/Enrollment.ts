export interface Enrollment {
  id: string;
  enrolled_at: string;
  user_id: string;
  course_id: string;
}

export interface CreateEnrollmentInput {
  user_id: string;
  course_id: string;
}

export interface EnrollmentWithDetails extends Enrollment {
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
  course?: {
    id: string;
    title: string;
    description?: string;
  };
}
