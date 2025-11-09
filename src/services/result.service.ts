import { createClient } from "@/src/utils/supabase/client";
import { ResultWithQuiz } from "@/src/models/Result";

export interface ResultWithDetails extends ResultWithQuiz {
  quiz?: {
    id: string;
    title: string;
    passing_score?: number;
    course?: {
      id: string;
      title: string;
    };
  };
  student?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

/**
 * Fetch all quiz results for courses owned by a teacher
 * Note: Call this from a server action that provides the authenticated user_id
 */
export async function fetchTeacherResults(teacherId: string): Promise<{
  success: boolean;
  data?: ResultWithDetails[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("results")
      .select(
        `
        *,
        quizzes!inner(
          id,
          title,
          passing_score,
          course_id,
          courses!inner(
            id,
            title,
            user_id
          )
        )
      `
      )
      .eq("quizzes.courses.user_id", teacherId)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Error fetching results:", error);
      return { success: false, error: error.message };
    }

    // Transform the nested data structure
    const results: ResultWithDetails[] = (data || []).map((result) => {
      const quiz = result.quizzes as unknown as {
        id: string;
        title: string;
        passing_score?: number;
        course_id: string;
        courses: {
          id: string;
          title: string;
          user_id: string;
        };
      };

      return {
        ...result,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          passing_score: quiz.passing_score,
          course: {
            id: quiz.courses.id,
            title: quiz.courses.title,
          },
        },
        student: undefined, // Will be populated by server action
      };
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching teacher results:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
