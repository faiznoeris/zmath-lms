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
