import { createClient } from "@/src/utils/supabase/client";
import { SubmissionWithDetails } from "@/src/models/Submission";

export interface PendingSubmission {
  id: string;
  user_id: string;
  quiz_id: string;
  question_id: string;
  selected_answer?: string;
  answer_file_url?: string;
  submitted_at: string;
  requires_grading: boolean;
  question_text: string;
  question_type: string;
  points: number;
  quiz_title: string;
  course_id: string;
  course_title: string;
  teacher_id: string;
  student_email: string;
  student_name?: string;
}

export interface GroupedSubmissions {
  quiz_id: string;
  quiz_title: string;
  course_title: string;
  pending_count: number;
  submissions: PendingSubmission[];
}

export interface GradeSubmissionData {
  manual_score: number;
  teacher_feedback?: string;
}

/**
 * Fetch all pending submissions that require manual grading for the current teacher
 * Note: Call this from a server action that provides the authenticated user_id
 */
export async function fetchPendingSubmissions(userId: string): Promise<{
  success: boolean;
  data?: PendingSubmission[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    // Fetch pending submissions using raw SQL query to access the view
    const { data, error } = await supabase
      .from("submissions")
      .select(
        `
        id,
        user_id,
        quiz_id,
        question_id,
        selected_answer,
        answer_file_url,
        submitted_at,
        requires_grading,
        submitted_at,
        questions!inner(
          question_text,
          question_type,
          points,
          quiz_id,
          quizzes!inner(
            title,
            course_id,
            courses!inner(
              title,
              user_id
            )
          )
        )
      `
      )
      .eq("requires_grading", true)
      .is("graded_at", null)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: true });

    if (error) {
      console.error("Error fetching pending submissions:", error);
      return { success: false, error: error.message };
    }

    // Transform the nested data structure
    const pendingSubmissions: PendingSubmission[] = [];

    for (const submission of data || []) {
      const question = submission.questions as unknown as {
        question_text: string;
        question_type: string;
        points: number;
        quiz_id: string;
        quizzes: {
          title: string;
          course_id: string;
          courses: {
            title: string;
            user_id: string;
          };
        };
      };
      const quiz = question?.quizzes;
      const course = quiz?.courses;

      // Only include submissions for courses owned by the current user (teacher)
      if (course?.user_id !== userId) {
        continue;
      }

      pendingSubmissions.push({
        id: submission.id,
        user_id: submission.user_id,
        quiz_id: submission.quiz_id,
        question_id: submission.question_id,
        selected_answer: submission.selected_answer,
        answer_file_url: submission.answer_file_url,
        submitted_at: submission.submitted_at,
        requires_grading: submission.requires_grading || false,
        question_text: question?.question_text || "",
        question_type: question?.question_type || "",
        points: question?.points || 0,
        quiz_title: quiz?.title || "",
        course_id: quiz?.course_id || "",
        course_title: course?.title || "",
        teacher_id: course?.user_id || "",
        student_email: "", // Will be populated by server action
        student_name: undefined, // Will be populated by server action
      });
    }

    return { success: true, data: pendingSubmissions };
  } catch (error) {
    console.error("Error fetching pending submissions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch pending submissions grouped by quiz
 */
export async function fetchGroupedPendingSubmissions(userId: string): Promise<{
  success: boolean;
  data?: GroupedSubmissions[];
  error?: string;
}> {
  try {
    const result = await fetchPendingSubmissions(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (!result.data) {
      return { success: true, data: [] };
    }

    // Group submissions by quiz
    const grouped = result.data.reduce((acc, submission) => {
      const existing = acc.find((g) => g.quiz_id === submission.quiz_id);

      if (existing) {
        existing.submissions.push(submission);
        existing.pending_count++;
      } else {
        acc.push({
          quiz_id: submission.quiz_id,
          quiz_title: submission.quiz_title,
          course_title: submission.course_title,
          pending_count: 1,
          submissions: [submission],
        });
      }

      return acc;
    }, [] as GroupedSubmissions[]);

    return { success: true, data: grouped };
  } catch (error) {
    console.error("Error grouping pending submissions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch a single submission with full details
 * Note: Student and grader data should be enriched by server action
 */
export async function fetchSubmissionById(
  id: string
): Promise<{ success: boolean; data?: SubmissionWithDetails; error?: string }> {
  try {
    const supabase = createClient();

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
          explanation,
          quiz_id
        ),
        quizzes!submissions_quiz_id_fkey(
          id,
          title,
          course_id,
          passing_score,
          courses(
            id,
            title
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Return submission without student/grader data (will be enriched by server action)
    const submissionWithDetails: SubmissionWithDetails = {
      ...data,
      question: (data as unknown as { questions: SubmissionWithDetails['question'] }).questions,
      quiz: (data as unknown as { quizzes: SubmissionWithDetails['quiz'] }).quizzes,
      course: (data as unknown as { quizzes?: { courses?: SubmissionWithDetails['course'] } }).quizzes?.courses,
      student: undefined, // Will be populated by server action
      grader: undefined, // Will be populated by server action
    };

    return { success: true, data: submissionWithDetails };
  } catch (error) {
    console.error("Error fetching submission:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Grade a submission manually
 */
export async function gradeSubmission(
  submissionId: string,
  gradeData: GradeSubmissionData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

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
        manual_score: gradeData.manual_score,
        teacher_feedback: gradeData.teacher_feedback,
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
 * Fetch all submissions for a specific quiz
 */
export async function fetchSubmissionsByQuiz(
  quizId: string
): Promise<{ success: boolean; data?: SubmissionWithDetails[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("submissions")
      .select(
        `
        *,
        questions(
          id,
          question_text,
          question_type,
          points
        )
      `
      )
      .eq("quiz_id", quizId)
      .order("submitted_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Return submissions without student data (will be enriched by server action if needed)
    const submissionsWithDetails: SubmissionWithDetails[] = (data || []).map(
      (submission) => ({
        ...submission,
        question: (submission as unknown as { questions: SubmissionWithDetails['question'] }).questions,
        student: undefined, // Will be populated by server action if needed
      })
    );

    return { success: true, data: submissionsWithDetails };
  } catch (error) {
    console.error("Error fetching submissions by quiz:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch submissions that need grading for a specific quiz
 */
export async function fetchPendingSubmissionsByQuiz(
  quizId: string,
  userId: string
): Promise<{ success: boolean; data?: PendingSubmission[]; error?: string }> {
  try {
    const result = await fetchPendingSubmissions(userId);

    if (!result.success || !result.data) {
      return result;
    }

    const filtered = result.data.filter((s) => s.quiz_id === quizId);

    return { success: true, data: filtered };
  } catch (error) {
    console.error("Error fetching pending submissions by quiz:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
