"use server";

import { createClient } from "@/src/utils/supabase/server";

/**
 * Server action to fetch submission details
 * Can be used for server-side rendering if needed
 */
export async function getSubmissionAction(submissionId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select(
        `
        *,
        questions(
          id,
          question_text,
          question_type,
          points,
          correct_answer,
          option_a,
          option_b,
          option_c,
          option_d,
          explanation
        ),
        quizzes!submissions_quiz_id_fkey(
          id,
          title,
          course_id,
          courses(
            id,
            title
          )
        )
      `
      )
      .eq("id", submissionId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching submission:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Server action to grade a submission
 * Provides an alternative to the client-side service
 */
export async function gradeSubmissionAction(
  submissionId: string,
  manualScore: number,
  teacherFeedback?: string
) {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Update the submission with grading data
    const { error } = await supabase
      .from("submissions")
      .update({
        manual_score: manualScore,
        teacher_feedback: teacherFeedback,
        graded_by: user.id,
        graded_at: new Date().toISOString(),
        requires_grading: false,
      })
      .eq("id", submissionId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Fetch the submission to get quiz and user IDs
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("quiz_id, user_id")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      console.error("Error fetching submission for result calculation");
      return { success: true }; // Still return success for the grading
    }

    // Recalculate quiz results
    const { error: calcError } = await supabase.rpc("calculate_quiz_result", {
      p_quiz_id: submission.quiz_id,
      p_user_id: submission.user_id,
    });

    if (calcError) {
      console.error("Error calculating quiz result:", calcError);
      // Don't fail the grading if result calculation fails
    }

    return { success: true };
  } catch (error) {
    console.error("Error grading submission:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Server action to fetch pending submissions count
 * Useful for displaying badges on dashboard
 */
export async function getPendingSubmissionsCount() {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { count, error } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("requires_grading", true)
      .is("graded_at", null);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Error fetching pending submissions count:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
