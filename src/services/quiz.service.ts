import { createClient } from "@/src/utils/supabase/client";
import { Quiz } from "@/src/models/Quiz";
import { Question } from "@/src/models/Question";
import { Result } from "@/src/models/Result";
import { Submission } from "@/src/models/Submission";

export interface QuizWithCourse extends Quiz {
  course: {
    id: string;
    title: string;
  };
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

/**
 * Fetch all quizzes with course details
 */
export async function fetchQuizzes(): Promise<{
  success: boolean;
  data?: QuizWithCourse[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        course:courses!quizzes_course_id_fkey(id, title),
        questions(id)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as QuizWithCourse[] };
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch quiz by ID
 */
export async function fetchQuizById(
  id: string
): Promise<{ success: boolean; data?: Quiz; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch quiz with questions
 */
export async function fetchQuizWithQuestions(
  id: string
): Promise<{ success: boolean; data?: QuizWithQuestions; error?: string }> {
  try {
    const supabase = createClient();

    // Fetch quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();

    if (quizError) {
      return { success: false, error: quizError.message };
    }

    // Fetch questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select(
        "id,quiz_id,question_text,question_type,created_at,updated_at,option_a,option_b,option_c,option_d,points,explanation"
      )
      .eq("quiz_id", id)
      .order("id", { ascending: true });

    if (questionsError) {
      return { success: false, error: questionsError.message };
    }

    return {
      success: true,
      data: { ...quiz, questions } as QuizWithQuestions,
    };
  } catch (error) {
    console.error("Error fetching quiz with questions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create quiz result entry in results table using database calculation
 */
export async function createQuizResult(
  quizId: string
): Promise<{ success: boolean; data?: Result; error?: string }> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Use database RPC function to calculate and insert result
    const { error: calcError } = await supabase.rpc("calculate_quiz_result", {
      p_quiz_id: quizId,
      p_user_id: user.id,
    });

    if (calcError) {
      return { success: false, error: calcError.message };
    }

    // Fetch the created result
    const { data: result, error: fetchError } = await supabase
      .from("results")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating quiz result:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new quiz
 */
export async function createQuiz(
  quiz: Omit<Quiz, "id" | "created_at">
): Promise<{ success: boolean; data?: Quiz; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quizzes")
      .insert(quiz)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating quiz:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(
  id: string,
  quiz: Partial<Omit<Quiz, "id" | "created_at">>
): Promise<{ success: boolean; data?: Quiz; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quizzes")
      .update(quiz)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating quiz:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Delete questions first (cascade should handle this, but being explicit)
    await supabase.from("questions").delete().eq("quiz_id", id);

    // Delete quiz
    const { error } = await supabase.from("quizzes").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch quizzes by course ID
 */
export async function fetchQuizzesByCourse(
  courseId: string
): Promise<{ success: boolean; data?: Quiz[]; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching quizzes by course:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create questions for a quiz
 */
export async function createQuestions(
  questions: Omit<Question, "id">[]
): Promise<{ success: boolean; data?: Question[]; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("questions")
      .insert(questions)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating questions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update questions for a quiz (delete old ones and insert new ones)
 */
export async function updateQuestions(
  quizId: string,
  questions: Omit<Question, "id">[]
): Promise<{ success: boolean; data?: Question[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Delete existing questions
    await supabase.from("questions").delete().eq("quiz_id", quizId);

    // Insert new questions
    const { data, error } = await supabase
      .from("questions")
      .insert(questions)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating questions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch quiz results for a student
 */
export async function fetchQuizResults(
  quizId: string,
  userId: string
): Promise<{ success: boolean; data?: Result[]; error?: string }> {
  try {
    const supabase = createClient();
    
    // First, fetch results
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) {
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
      // Continue without submission data
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

    // Check each result for pending manual grading
    const resultsWithPendingStatus = data.map((result) => {
      const submissions = submissionsMap.get(result.id) || [];
      
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
      } as Result;
    });

    return { success: true, data: resultsWithPendingStatus };
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch quiz results for the current authenticated user (client-side)
 * Use this from client components where you need to get results for the logged-in user
 */
export async function fetchMyQuizResults(
  quizId: string
): Promise<{ success: boolean; data?: Result[]; error?: string }> {
  try {
    // Import client supabase dynamically to avoid "use server" conflict
    const { createClient: createClientBrowser } = await import(
      "@/src/utils/supabase/client"
    );
    const supabase = createClientBrowser();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // First, fetch results
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) {
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
      // Continue without submission data
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

    // Check each result for pending manual grading
    const resultsWithPendingStatus = data.map((result) => {
      const submissions = submissionsMap.get(result.id) || [];
      
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
      } as Result;
    });

    return { success: true, data: resultsWithPendingStatus };
  } catch (error) {
    console.error("Error fetching my quiz results:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Check for ongoing quiz attempt
 * Returns existing submission if there's time remaining
 */
export async function checkOngoingAttempt(quizId: string): Promise<{
  success: boolean;
  data?: {
    submission: Submission | null;
    hasTimeRemaining: boolean;
  };
  error?: string;
}> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Find any submission for this quiz that has time remaining and is not submitted
    // Also filter by result_id IS NULL to only get current attempt
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("quiz_id", quizId)
      .is("submitted_at", null)
      .is("result_id", null) // Only get submissions for current attempt
      .order("last_sync_at", { ascending: false })
      .limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!submissions || submissions.length === 0) {
      return {
        success: true,
        data: {
          submission: null,
          hasTimeRemaining: false,
        },
      };
    }

    const submission = submissions[0];
    const hasTimeRemaining =
      submission.time_remaining && submission.time_remaining > 0;

    return {
      success: true,
      data: {
        submission: hasTimeRemaining ? submission : null,
        hasTimeRemaining,
      },
    };
  } catch (error) {
    console.error("Error checking ongoing attempt:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch all submissions for an ongoing quiz attempt
 * Returns all unsubmitted answers for the current user and quiz
 */
export async function fetchOngoingSubmissions(quizId: string): Promise<{
  success: boolean;
  data?: Submission[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch all submissions for this quiz that are not yet submitted
    // Filter by result_id IS NULL to only get current attempt
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("quiz_id", quizId)
      .is("submitted_at", null)
      .is("result_id", null); // Only get submissions for current attempt

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: submissions || [],
    };
  } catch (error) {
    console.error("Error fetching ongoing submissions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Initialize Quiz Submission
 * Creates or updates a submission record for a specific question
 */
export async function initializeQuizSubmission(
  quizId: string,
  questionId: string,
  time_remaining: number,
  last_sync_at: Date
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // For re-attempts, we create NEW submissions instead of updating old ones
    // The result_id will be null until the quiz is submitted and calculated
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        question_id: questionId,
        time_remaining,
        last_sync_at,
        result_id: null, // Will be set when quiz is completed
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Represents the state of a single question's submission to be saved.
 * All properties are optional except question_id, allowing for flexible updates.
 */
export interface SubmissionState {
  quiz_id: string;
  question_id: string;
  selected_answer?: string;
  time_remaining?: number;
}

/**
 * Update Quiz Attempt State (Bulk Operation)
 * Creates or updates multiple submission records in a single database call.
 * This is the preferred method for syncing state for multiple questions.
 */
export async function updateQuizAttemptState(
  states: SubmissionState[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Process each submission individually to ensure proper handling
    const updatePromises = states.map(async (state) => {
      // Check if submission exists for current attempt (result_id is NULL)
      const { data: existing } = await supabase
        .from("submissions")
        .select("id, is_correct")
        .eq("user_id", user.id)
        .eq("question_id", state.question_id)
        .is("result_id", null) // Only get submissions for ongoing attempt
        .maybeSingle();

      if (existing) {
        // Update existing submission for current attempt, preserving is_correct
        return supabase
          .from("submissions")
          .update({
            selected_answer: state.selected_answer,
            time_remaining: state.time_remaining,
            last_sync_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Insert new submission for current attempt
        return supabase.from("submissions").insert({
          user_id: user.id,
          quiz_id: state.quiz_id,
          question_id: state.question_id,
          selected_answer: state.selected_answer,
          time_remaining: state.time_remaining,
          last_sync_at: new Date().toISOString(),
          result_id: null, // Will be set when quiz is completed
        });
      }
    });

    const results = await Promise.all(updatePromises);

    // Check if any operations failed
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Error in bulk update submissions:", errors[0].error?.message);
      return { success: false, error: errors[0].error?.message };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Exception in updateQuizAttemptState:", message);
    return { success: false, error: message };
  }
}

/**
 * Update User Answer State
 * Updates the selected answer for a specific question
 */
export async function updateUserAnswerState(
  attemptId: string, // Kept for backward compatibility but not used
  questionId: string,
  quizId: string,
  timeRemaining: number,
  userAnswer: string
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if submission exists for current attempt (result_id IS NULL)
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .is("result_id", null)
      .maybeSingle();

    let data, error;

    if (existing) {
      // Update existing submission for current attempt
      const result = await supabase
        .from("submissions")
        .update({
          time_remaining: timeRemaining,
          selected_answer: userAnswer,
        })
        .eq("id", existing.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new submission for current attempt
      const result = await supabase
        .from("submissions")
        .insert({
          user_id: user.id,
          question_id: questionId,
          quiz_id: quizId,
          time_remaining: timeRemaining,
          selected_answer: userAnswer,
          result_id: null,
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating user answer state:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

interface SubmittedQuizState {
  quiz_id: string;
  question_id: string;
}

/**
 * Mark Quiz as Submitted
 */
export async function MarkQuizSubmitted(states: SubmittedQuizState[]) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const submittedAt = new Date().toISOString();

    // Update each submission individually to preserve existing data
    // Only update submissions for current attempt (result_id IS NULL)
    const updatePromises = states.map(state =>
      supabase
        .from("submissions")
        .update({
          submitted_at: submittedAt,
          is_submitted: true,
        })
        .eq("user_id", user.id)
        .eq("question_id", state.question_id)
        .is("result_id", null) // Only update submissions for current attempt
    );

    const results = await Promise.all(updatePromises);

    // Check if any updates failed
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Error in bulk update submissions:", errors[0].error?.message);
      return { success: false, error: errors[0].error?.message };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Exception in MarkQuizSubmitted:", message);
    return { success: false, error: message };
  }
}

export interface QuestionResult {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "essay";
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  points?: number;
  explanation?: string;
  selected_answer?: string;
  is_correct?: boolean;
  manual_score?: number;
  requires_grading?: boolean;
  teacher_feedback?: string;
  answer_file_url?: string;
}

export interface QuizResult {
  quiz: Quiz;
  questions: QuestionResult[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  pendingGrading: number;
}

/**
 * Fetch quiz result with user's submissions
 */
export async function fetchQuizResult(
  quizId: string
): Promise<{ success: boolean; data?: QuizResult; error?: string }> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError) {
      return { success: false, error: quizError.message };
    }

    // Fetch questions with user's submissions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });

    if (questionsError) {
      return { success: false, error: questionsError.message };
    }

    // Fetch user's submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id);

    if (submissionsError) {
      return { success: false, error: submissionsError.message };
    }

    // Map submissions to questions
    const submissionMap = new Map(
      submissions.map(sub => [sub.question_id, sub])
    );

    const questionsWithResults: QuestionResult[] = questions.map(q => {
      const submission = submissionMap.get(q.id);
      return {
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        points: q.points,
        explanation: q.explanation,
        selected_answer: submission?.selected_answer,
        is_correct: submission?.is_correct,
        manual_score: submission?.manual_score,
        requires_grading: submission?.requires_grading,
        teacher_feedback: submission?.teacher_feedback,
        answer_file_url: submission?.answer_file_url,
      };
    });

    // Calculate scores
    let totalScore = 0;
    let maxScore = 0;
    let pendingGrading = 0;

    questionsWithResults.forEach(q => {
      maxScore += q.points || 0;

      if (q.question_type === "essay" && q.requires_grading) {
        pendingGrading++;
      } else if (q.is_correct) {
        totalScore += q.points || 0;
      } else if (q.manual_score !== undefined && q.manual_score !== null) {
        totalScore += q.manual_score;
      }
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
      success: true,
      data: {
        quiz,
        questions: questionsWithResults,
        totalScore,
        maxScore,
        percentage,
        pendingGrading,
      },
    };
  } catch (error) {
    console.error("Error fetching quiz result:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch result by result ID with quiz and submission details
 */
export async function fetchResultById(
  resultId: string
): Promise<{ success: boolean; data?: QuizResult; error?: string }> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch result with quiz details
    const { data: result, error: resultError } = await supabase
      .from("results")
      .select("*, quiz:quizzes(*)")
      .eq("id", resultId)
      .eq("user_id", user.id)
      .single();

    if (resultError) {
      return { success: false, error: resultError.message };
    }

    const quizId = result.quiz_id;

    // Fetch questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });

    if (questionsError) {
      return { success: false, error: questionsError.message };
    }

    // Fetch user's submissions for this specific result
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("result_id", resultId);

    if (submissionsError) {
      return { success: false, error: submissionsError.message };
    }

    // Map submissions to questions
    const submissionMap = new Map(
      submissions.map((sub) => [sub.question_id, sub])
    );

    const questionsWithResults: QuestionResult[] = questions.map((q) => {
      const submission = submissionMap.get(q.id);
      return {
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        points: q.points,
        explanation: q.explanation,
        selected_answer: submission?.selected_answer,
        is_correct: submission?.is_correct,
        manual_score: submission?.manual_score,
        requires_grading: submission?.requires_grading,
        teacher_feedback: submission?.teacher_feedback,
        answer_file_url: submission?.answer_file_url,
      };
    });

    // Count pending grading
    let pendingGrading = 0;
    questionsWithResults.forEach((q) => {
      if (q.question_type === "essay" && q.requires_grading) {
        pendingGrading++;
      }
    });

    return {
      success: true,
      data: {
        quiz: result.quiz,
        questions: questionsWithResults,
        totalScore: result.score,
        maxScore: result.total_points,
        percentage: result.percentage,
        pendingGrading,
      },
    };
  } catch (error) {
    console.error("Error fetching result by ID:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}