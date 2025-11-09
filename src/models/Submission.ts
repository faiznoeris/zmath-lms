export interface Submission {
  id: string;
  user_id: string;
  quiz_id: string;
  question_id: string;
  selected_answer?: string;
  is_correct?: boolean;
  score?: number;
  answers?: object;
  answer_file_url?: string; // URL to uploaded answer file for this question
  submitted_at: string;
  time_spent_seconds?: number;
  attempt_number?: number;
  created_at: string;
  // Manual grading fields
  manual_score?: number;
  graded_by?: string;
  graded_at?: string;
  requires_grading?: boolean;
  teacher_feedback?: string;
  // Timer fields
  started_at?: string;
  time_remaining?: number;
  last_sync_at?: string;
  is_timed_out?: boolean;
}

export interface SubmissionWithDetails extends Submission {
  question?: {
    id: string;
    question_text: string;
    question_type: string;
    points: number;
    correct_answer?: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    explanation?: string;
    quiz_id?: string;
  };
  quiz?: {
    id: string;
    title: string;
    course_id: string;
    passing_score?: number;
  };
  course?: {
    id: string;
    title: string;
  };
  student?: {
    id: string;
    email: string;
    full_name?: string;
  };
  grader?: {
    id: string;
    email: string;
    full_name?: string;
  };
}
