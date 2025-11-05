export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay";
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  points?: number;
  explanation?: string;
  created_at?: string;
  updated_at?: string;
}
