"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  Button,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import QuizIcon from "@mui/icons-material/Quiz";
import TimerIcon from "@mui/icons-material/Timer";
import GradeIcon from "@mui/icons-material/Grade";
import HistoryIcon from "@mui/icons-material/History";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  fetchQuizWithQuestions,
  fetchMyQuizResults,
  initializeQuizSubmission,
  checkOngoingAttempt,
  fetchOngoingSubmissions,
} from "@/src/services/quiz.service";
import { Result } from "@/src/models/Result";
import { formatDate } from "@/src/utils/dateFormat";
import { useQuizStore } from "@/src/stores";

export default function QuizDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quizStore = useQuizStore();
  const { 
    setQuiz, 
    setSessionId, 
    setUserAnswer, 
    setTimeRemaining, 
    resetQuizState,
    sessionId: storedSessionId,
    timeRemaining: storedTimeRemaining,
  } = quizStore;
  const quizId = params.id as string;

  // Fetch quiz details
  const {
    data: quiz,
    isLoading: quizLoading,
    error: quizError,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const result = await fetchQuizWithQuestions(quizId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!quizId,
  });

  // Store quiz data to zustand after fetching
  React.useEffect(() => {
    if (!!quiz) {
      setQuiz(quiz);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz]);

  // Fetch quiz results/history
  const { data: results = [], isLoading: resultsLoading } = useQuery<Result[]>({
    queryKey: ["quiz-results", quizId],
    queryFn: async () => {
      const result = await fetchMyQuizResults(quizId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!quizId,
  });

  const isLoading = quizLoading || resultsLoading;
  const hasAttempts = results.length > 0;
  const bestScore = hasAttempts
    ? Math.max(...results.map(r => r.percentage))
    : null;
  const latestAttempt = hasAttempts ? results[0] : null;
  const passingScore = quiz?.passing_score ?? 60;
  const bestScorePassed = bestScore !== null && bestScore >= passingScore;

  if (quizError) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="error">Error loading quiz: {quizError.message}</Alert>
      </Box>
    );
  }

  const handleStartAttempt = async () => {
    if (!quiz || typeof quiz.time_limit_minutes !== "number") {
      console.error("Quiz details not loaded yet");
      return;
    }

    // Priority 1: Check if there's an ongoing session in the store (localStorage)
    // Only resume if there's time remaining (not submitted)
    if (storedSessionId && storedTimeRemaining && storedTimeRemaining > 0) {
      // Session data already in store, just navigate
      router.push(`/dashboard/student/quizzes/attempt/${quizId}`);
      return;
    }

    // Priority 2: Check database for ongoing attempt (not yet submitted)
    const ongoingAttemptCheck = await checkOngoingAttempt(quizId);
    
    if (ongoingAttemptCheck.success && ongoingAttemptCheck.data?.hasTimeRemaining) {
      // Continue previous session from database
      const submission = ongoingAttemptCheck.data.submission;
      
      // Only resume if NOT submitted yet
      if (submission && !submission.submitted_at) {
        // Fetch all existing submissions for this quiz attempt
        const submissionsResult = await fetchOngoingSubmissions(quizId);
        
        if (submissionsResult.success && submissionsResult.data) {
          // Populate the store with existing answers
          submissionsResult.data.forEach((sub) => {
            if (sub.selected_answer) {
              setUserAnswer(sub.question_id, sub.selected_answer);
            }
          });
        }
        
        // Set the remaining time from the database session
        if (submission.time_remaining) {
          setTimeRemaining(submission.time_remaining);
        }
        
        setSessionId(submission.id);
        router.push(`/dashboard/student/quizzes/attempt/${quizId}`);
        return;
      }
    }

    // Start new attempt (no ongoing attempt OR previous was submitted)
    const questionId = quiz.questions[0].id;
    const startTime = new Date();
    const timeLimitInSeconds = quiz.time_limit_minutes * 60;

    // Reset quiz state for fresh start
    resetQuizState();

    const initializeQuiz = await initializeQuizSubmission(
      quizId,
      questionId,
      timeLimitInSeconds,
      startTime
    );

    if (initializeQuiz.success && initializeQuiz.data?.id) {
      setSessionId(initializeQuiz.data.id);
      router.push(`/dashboard/student/quizzes/attempt/${quizId}`);
    } else {
      console.error(
        "Failed to initialize quiz submission:",
        initializeQuiz.error || "No attempt ID returned"
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => router.push("/dashboard/student")}
          sx={{ cursor: "pointer" }}
        >
          My Courses
        </Link>
        <Typography color="text.primary">Quiz Details</Typography>
      </Breadcrumbs>

      {/* Quiz Header */}
      {isLoading ? (
        <Skeleton variant="rectangular" height={200} sx={{ mb: 4 }} />
      ) : (
        <Card elevation={2} sx={{ mb: 4, p: 3 }}>
          <Box
            sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}
          >
            <QuizIcon sx={{ fontSize: 48, color: "warning.main" }} />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={600}
                gutterBottom
              >
                {quiz?.title}
              </Typography>
              {quiz?.description && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {quiz.description}
                </Typography>
              )}

              {/* Quiz Info */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {quiz?.time_limit_minutes && (
                  <Chip
                    icon={<TimerIcon />}
                    label={`${quiz.time_limit_minutes} minutes`}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {quiz?.passing_score !== null &&
                  quiz?.passing_score !== undefined && (
                    <Chip
                      icon={<GradeIcon />}
                      label={`Passing Score: ${quiz.passing_score}%`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                {quiz?.max_attempts && (
                  <Chip
                    label={`Max Attempts: ${quiz.max_attempts}`}
                    color="info"
                    variant="outlined"
                  />
                )}
                {quiz?.is_graded && (
                  <Chip label="Graded" color="warning" size="small" />
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Action Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            {hasAttempts ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<ReplayIcon />}
                onClick={handleStartAttempt}
                sx={{ minWidth: 200 }}
              >
                Re-attempt Quiz
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartAttempt}
                color="success"
                sx={{ minWidth: 200 }}
              >
                Start Attempt
              </Button>
            )}
          </Box>

          {/* Statistics */}
          {hasAttempts && (
            <Box
              sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}
            >
              <Card
                variant="outlined"
                sx={{ p: 2, minWidth: 150, textAlign: "center" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Attempts
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {results.length}
                </Typography>
              </Card>
              <Card
                variant="outlined"
                sx={{ p: 2, minWidth: 150, textAlign: "center" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Best Score
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={600}
                  color={bestScorePassed ? "success.main" : "error.main"}
                >
                  {bestScore?.toFixed(2)}%
                </Typography>
                {quiz?.passing_score !== null &&
                  quiz?.passing_score !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      Min: {quiz.passing_score}%
                    </Typography>
                  )}
              </Card>
              {latestAttempt && (
                <Card
                  variant="outlined"
                  sx={{ p: 2, minWidth: 150, textAlign: "center" }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Latest Score
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {latestAttempt.percentage}%
                  </Typography>
                </Card>
              )}
            </Box>
          )}
        </Card>
      )}

      {/* Attempt History */}
      {hasAttempts && (
        <Card elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <HistoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
            <Typography variant="h5" fontWeight={600}>
              Attempt History
            </Typography>
          </Box>

          {isLoading ? (
            <Box>
              {[1, 2, 3].map(n => (
                <Skeleton
                  key={n}
                  variant="rectangular"
                  height={60}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Attempt #</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Score</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Percentage</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                      {quiz?.passing_score !== null &&
                        quiz?.passing_score !== undefined && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            (Min: {quiz.passing_score}%)
                          </Typography>
                        )}
                    </TableCell>
                    <TableCell>
                      <strong>Completed At</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => {
                    const passed = quiz?.passing_score
                      ? result.percentage >= quiz.passing_score
                      : result.percentage >= 60;
                    const status = passed ? "Passed" : "Failed";
                    return (
                      <TableRow 
                        key={result.id} 
                        hover
                        onClick={() => router.push(`/dashboard/student/quizzes/result/${result.id}`)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{results.length - index}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {result.score} / {result.total_points} points
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            fontWeight={600}
                            color={
                              passed ? "success.main" : "error.main"
                            }
                          >
                            {result.percentage.toFixed(2)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            color={passed ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(result.completed_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !hasAttempts && (
        <Card elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <HistoryIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Attempts Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click &quot;Start Attempt&quot; above to take this quiz for the
            first time.
          </Typography>
        </Card>
      )}
    </Box>
  );
}
