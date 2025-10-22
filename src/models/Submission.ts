export interface Submission {
  id: string;
  user_id: string;
  quiz_id: string;
  score?: number;
  answers?: object;
  submitted_at: string;
  time_spent_seconds?: number;
  attempt_number: number;
  created_at: string;
}
