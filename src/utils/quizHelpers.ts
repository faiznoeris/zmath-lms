/**
 * Get pass/fail status based on score and passing threshold
 * @param score - Actual score achieved
 * @param passingScore - Minimum passing score (optional)
 * @returns "Passed", "Failed", or null if no passing score defined
 */
export function getResultStatus(score: number, passingScore?: number): "Passed" | "Failed" | null {
  if (passingScore === null || passingScore === undefined) return null;
  return score >= passingScore ? "Passed" : "Failed";
}

/**
 * Calculate percentage score
 * @param correctAnswers - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @returns Percentage score (0-100)
 */
export function calculateScorePercentage(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}
