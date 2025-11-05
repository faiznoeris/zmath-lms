export interface Result {
  id: number;
  score: number;
  completed_at: string;
  quiz_id: number;
  user_id: string;
}

export interface ResultWithQuiz extends Result {
  quiz?: {
    id: number;
    title: string;
    passing_score?: number;
  };
}
