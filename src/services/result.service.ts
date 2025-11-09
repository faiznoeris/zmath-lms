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

    // First, fetch results with quiz information
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

    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    // Get all result IDs to fetch their submissions
    const resultIds = data.map((r) => r.id);

    // Fetch submissions for these specific results
    const { data: submissionsData, error: submissionsError } = await supabase
      .from("submissions")
      .select("result_id, requires_grading, manual_score")
      .in("result_id", resultIds);

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      // Continue without submission data rather than failing
    }

    // Create a map of submissions by result_id for quick lookup
    const submissionsMap = new Map<string, Array<{ requires_grading: boolean; manual_score: number | null }>>();
    
    if (submissionsData) {
      submissionsData.forEach((sub) => {
        const key = sub.result_id || "null";
        if (!submissionsMap.has(key)) {
          submissionsMap.set(key, []);
        }
        submissionsMap.get(key)!.push({
          requires_grading: sub.requires_grading,
          manual_score: sub.manual_score,
        });
      });
    }

    // Transform the nested data structure
    type ResultRow = {
      id: string;
      score: number;
      total_points: number;
      percentage: number;
      is_passed: boolean;
      completed_at: string;
      quiz_id: string;
      user_id: string;
      quizzes: {
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
    };

    const results: ResultWithDetails[] = (data || []).map((result: ResultRow) => {
      const quiz = result.quizzes;

      // Get submissions for this specific result
      const submissions = submissionsMap.get(result.id) || [];

      // Check if there's pending manual grading
      const hasPendingGrading = submissions.some(
        (sub) => sub.requires_grading && sub.manual_score === null
      );

      return {
        id: result.id,
        score: result.score,
        total_points: result.total_points,
        percentage: result.percentage,
        is_passed: result.is_passed,
        completed_at: result.completed_at,
        quiz_id: result.quiz_id,
        user_id: result.user_id,
        has_pending_grading: hasPendingGrading,
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
