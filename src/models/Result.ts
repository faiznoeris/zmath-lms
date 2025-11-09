export interface Result {
  id: string;
  score: number;
  total_points: number;
  percentage: number;
  is_passed: boolean;
  completed_at: string;
  quiz_id: string;
  user_id: string;
  has_pending_grading?: boolean; // Flag for manual grading pending
}

export interface ResultWithQuiz extends Result {
  quiz?: {
    id: string;
    title: string;
    passing_score?: number;
  };
}
