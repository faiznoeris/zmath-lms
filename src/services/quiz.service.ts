import { createClient } from "@/src/utils/supabase/client";
import { Result } from "@/src/models/Result";
import { Quiz } from "../models/Quiz";
import { Question } from "../models/Question";

const supabase = createClient();

// Fetch quiz details
export const fetchQuizApi = async (id: string): Promise<Quiz> => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const fetchQuizQuestionApi = async (id: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id,quiz_id,question_text,question_type,options,created_at,updated_at"
    )
    .eq("quiz_id", id);

  if (error) throw error;
  return data;
};

// Fetch quiz results/history for current user
export const fetchQuizResultsApi = async (
  quizId: string
): Promise<Result[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("results")
    .select("*")
    .eq("quiz_id", parseInt(quizId))
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data || [];
};
