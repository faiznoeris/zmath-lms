export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type:
    | "multiple_choice"
    | "true_false"
    | "fill_blank"
    | "matching"
    | "essay";
  points: number;
  options?: object;
  correct_answer?: string;
  explanation?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}
