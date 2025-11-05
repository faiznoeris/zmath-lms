export interface Result {
  id: string;
  score: number;
  total_points: number;
  percentage: number;
  completed_at: string;
  quiz_id: string;
  user_id: string;
}

export interface ResultWithQuiz extends Result {
  quiz?: {
    id: string;
    title: string;
    passing_score?: number;
  };
}
