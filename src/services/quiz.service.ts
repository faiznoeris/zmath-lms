import { createClient } from "@/src/utils/supabase/client";
import { Quiz } from "@/src/models/Quiz";
import { Question } from "@/src/models/Question";
import { Result } from "@/src/models/Result";

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
      .select("*")
      .eq("quiz_id", id)
      .order("id", { ascending: true });

    if (questionsError) {
      return { success: false, error: questionsError.message };
    }

    return {
      success: true,
      data: { ...quiz, questions: questions || [] } as QuizWithQuestions,
    };
  } catch (error) {
    console.error("Error fetching quiz with questions:", error);
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
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
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

    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching my quiz results:", error);
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

    // Use upsert instead of insert to handle existing submissions
    const { data, error } = await supabase
      .from("submissions")
      .upsert(
        {
          user_id: user.id,
          quiz_id: quizId,
          question_id: questionId,
          time_remaining,
          last_sync_at,
        },
        { onConflict: "user_id,question_id" }
      )
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
 * Update Quiz Attempt State
 * Updates time remaining for a specific question submission
 */
export async function updateQuizAttemptState(
  quizId: string,
  questionId: string,
  timeRemaining: number,
  lastSyncAt: Date
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Use upsert to create if doesn't exist or update if it does
    const { data, error } = await supabase
      .from("submissions")
      .upsert(
        {
          user_id: user.id,
          quiz_id: quizId,
          question_id: questionId,
          time_remaining: timeRemaining,
          last_sync_at: lastSyncAt,
        },
        { onConflict: "user_id,question_id" }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating quiz attempt state:", error);
    return { success: false, error: "An unexpected error occurred" };
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

    const { data, error } = await supabase
      .from("submissions")
      .upsert(
        {
          user_id: user.id,
          question_id: questionId,
          quiz_id: quizId,
          selected_answer: userAnswer,
        },
        { onConflict: "user_id,question_id" }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating user answer state:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
