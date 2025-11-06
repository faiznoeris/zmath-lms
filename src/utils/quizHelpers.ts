/**
 * Get pass/fail status based on score and passing threshold
 * @param score - Actual score achieved
 * @param passingScore - Minimum passing score (optional)
 * @returns "Passed", "Failed", or null if no passing score defined
 */
export function getResultStatus(
  score: number,
  passingScore?: number
): "Passed" | "Failed" | null {
  if (passingScore === null || passingScore === undefined) return null;
  return score >= passingScore ? "Passed" : "Failed";
}

/**
 * Calculate percentage score
 * @param correctAnswers - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @returns Percentage score (0-100)
 */
export function calculateScorePercentage(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

/**
 * Formats milliseconds into a MM:SS string.
 * @param milliseconds The raw time in milliseconds from the countdown hook.
 * @returns A formatted string e.g., "05:00".
 */
export const formatCountdownTime = (milliseconds: number) => {
  // Ensure we don't display negative numbers
  if (milliseconds < 0) milliseconds = 0;

  // 1. Convert milliseconds to total seconds
  const totalSeconds = Math.floor(milliseconds / 1000);

  // 2. Get the minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // 3. Pad with leading zeros to ensure two digits
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
};

/**
 * Defines the structure of the quiz attempt state stored in localStorage.
 */
export interface QuizAttemptState {
  attemptId: string;
  timeRemaining: number; // Time remaining in milliseconds
  timestamp: number; // The UNIX timestamp (Date.now()) when the state was saved
}

/**
 * Generates a unique key for storing quiz attempt state in localStorage.
 * @param attemptId The unique identifier for the quiz submission.
 * @returns A string to be used as a localStorage key.
 */
const getStorageKey = (attemptId: string): string =>
  `quiz-attempt-${attemptId}`;

/**
 * Saves the current state of a quiz attempt to localStorage.
 * @param attemptId The unique identifier for the quiz submission.
 * @param timeRemaining The time remaining in the quiz, in milliseconds.
 */
export function saveQuizAttemptState(
  attemptId: string,
  timeRemaining: number
): void {
  // Ensure this code only runs on the client where localStorage is available
  if (typeof window === "undefined") {
    return;
  }

  try {
    const state: QuizAttemptState = {
      attemptId,
      timeRemaining,
      timestamp: Date.now(),
    };
    const storageKey = getStorageKey(attemptId);
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save quiz attempt state to localStorage:", error);
  }
}

/**
 * Loads the saved state of a quiz attempt from localStorage.
 * @param attemptId The unique identifier for the quiz submission.
 * @returns The saved QuizAttemptState object, or null if not found or invalid.
 */
export function loadQuizAttemptState(
  attemptId: string
): QuizAttemptState | null {
  // Ensure this code only runs on the client
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storageKey = getStorageKey(attemptId);
    const savedStateJSON = localStorage.getItem(storageKey);

    if (!savedStateJSON) {
      return null;
    }

    const savedState = JSON.parse(savedStateJSON);
    return savedState;
  } catch (error) {
    console.error(
      "Failed to load quiz attempt state from localStorage:",
      error
    );
    return null;
  }
}
