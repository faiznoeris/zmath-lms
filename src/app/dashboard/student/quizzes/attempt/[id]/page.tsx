"use client";

import React from "react";
import { Box, Button, Card, CardContent, Skeleton, Alert } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQuizStore } from "@/src/stores";
import { useAuthStore } from "@/src/stores";
import {
  MathQuestionDisplay,
  QuizBottomNav,
  QuizAnswerOptions,
  ModalComponent,
  QuizAnswerFileUpload,
} from "@/src/components";
import {
  fetchQuizWithQuestions,
  updateQuizAttemptState,
  MarkQuizSubmitted,
  createQuizResult,
} from "@/src/services/quiz.service";
import { loadQuizAttemptState } from "@/src/utils/quizHelpers";

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const { quiz, currentQuestionIndex, sessionId, userAnswers, setQuiz, resetQuizState } = useQuizStore();
  const { user } = useAuthStore();
  const [isModalOpen, setModalOpen] = React.useState(false);

  // Fetch quiz data with React Query
  const {
    data: quizData,
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
    if (quizData && !quiz) {
      setQuiz(quizData);
    }
  }, [quizData, quiz, setQuiz]);

  // Mutation for updating quiz state
  const updateQuizStateMutation = useMutation({
    mutationFn: async () => {
      if (!quiz || !quiz.questions) {
        throw new Error("Quiz data not available");
      }

      const latestAttemptState = loadQuizAttemptState(sessionId);
      const timeRemainingInSeconds = latestAttemptState?.timeRemaining;

      // Create an array of state objects
      const statesToUpdate = quiz.questions.map(question => {
        const selectedAnswer = userAnswers[question.id];

        return {
          quiz_id: quiz.id,
          question_id: question.id,
          time_remaining: timeRemainingInSeconds,
          selected_answer: selectedAnswer,
        };
      });

      // Update quiz state
      const updateResult = await updateQuizAttemptState(statesToUpdate);

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to save quiz state");
      }

      return statesToUpdate;
    },
    onError: (error) => {
      console.error("Failed to update quiz state:", error);
      alert("Gagal menyimpan jawaban. Silakan coba lagi.");
    },
  });

  // Mutation for marking quiz as submitted
  const markSubmittedMutation = useMutation({
    mutationFn: async (states: { quiz_id: string; question_id: string }[]) => {
      const submitResult = await MarkQuizSubmitted(states);
      
      if (!submitResult.success) {
        throw new Error(submitResult.error || "Failed to mark quiz as submitted");
      }

      // Create result entry in results table
      const resultCreation = await createQuizResult(quizId);
      
      if (!resultCreation.success) {
        throw new Error(resultCreation.error || "Failed to create quiz result");
      }

      return resultCreation.data; // Return the result data with ID
    },
    onSuccess: (result) => {
      // Clear quiz state from localStorage before redirecting
      resetQuizState();
      
      // Redirect to quiz result page using result ID
      if (result?.id) {
        router.push(`/dashboard/student/quizzes/result/${result.id}`);
      } else {
        router.push(`/dashboard/student/quizzes/result/${quizId}`);
      }
    },
    onError: (error) => {
      console.error("Failed to submit quiz:", error);
      alert("Gagal mengakhiri kuis. Silakan coba lagi.");
    },
  });

  const handleModal = () => {
    setModalOpen(prev => !prev);
  };

  const handleEndQuiz = async () => {
    setModalOpen(false);
    
    try {
      // First, update quiz state
      const statesToUpdate = await updateQuizStateMutation.mutateAsync();
      
      // Then, mark as submitted
      const quizIds = statesToUpdate.map(item => ({
        quiz_id: item.quiz_id,
        question_id: item.question_id,
      }));
      
      await markSubmittedMutation.mutateAsync(quizIds);
    } catch (error) {
      // Errors are already handled in mutation onError callbacks
      console.error("Error in handleEndQuiz:", error);
    }
  };

  const question = quiz?.questions?.[currentQuestionIndex];
  const questionType = question?.question_type;
  const answerOptions = [
    question?.option_a,
    question?.option_b,
    question?.option_c,
    question?.option_d,
  ];

  // Loading state
  if (quizLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={120}
              sx={{ mt: 2 }}
            />
            <Skeleton variant="text" width="60%" height={30} sx={{ mt: 2 }} />
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="60%" height={30} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Error state
  if (quizError) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Error loading quiz: {quizError instanceof Error ? quizError.message : "Unknown error"}
        </Alert>
      </Box>
    );
  }

  // No question state
  if (!question) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={120}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          maxWidth: 1200,
          minWidth: 300,
          mx: "auto",
          p: 3,
          pb: 0,
          width: "100%",
        }}
      >
        <Card sx={{ minHeight: 400 }}>
          <CardContent>
            <MathQuestionDisplay
              question={question?.question_text}
              questionNumber={currentQuestionIndex + 1}
            />
            {questionType === "multiple_choice" ? (
              <QuizAnswerOptions
                attemptId={sessionId}
                quizId={quiz.id}
                questionId={question.id}
                options={answerOptions}
              />
            ) : (
              <QuizAnswerFileUpload
                attemptId={sessionId}
                quizId={quiz.id}
                userId={user?.id || ""}
                questionId={question.id}
              />
            )}
          </CardContent>
        </Card>
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
          p: 3,
          pt: 2,
        }}
      >
        <QuizBottomNav onOpenModal={handleModal} />
      </Box>
      <ModalComponent
        isOpen={isModalOpen}
        onClose={handleModal}
        title="Apakah anda yakin ingin mengakhiri kuis ini?"
        actions={
          <>
            <Button 
              onClick={handleModal} 
              variant="outlined" 
              disabled={updateQuizStateMutation.isPending || markSubmittedMutation.isPending}
            >
              Review kembali
            </Button>
            <Button 
              onClick={handleEndQuiz} 
              variant="contained"
              disabled={updateQuizStateMutation.isPending || markSubmittedMutation.isPending}
            >
              {(updateQuizStateMutation.isPending || markSubmittedMutation.isPending) 
                ? "Menyimpan..." 
                : "Akhiri kuis"}
            </Button>
          </>
        }
      >
        Setelah mengakhiri kuis, Anda tidak dapat mengubah jawaban lagi.
      </ModalComponent>
    </>
  );
}
