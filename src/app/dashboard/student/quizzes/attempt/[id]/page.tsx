"use client";

import React from "react";
import { Box, Button, Card, CardContent, Skeleton } from "@mui/material";
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
  updateQuizAttemptState,
  MarkQuizSubmitted,
} from "@/src/services/quiz.service";
import { loadQuizAttemptState } from "@/src/utils/quizHelpers";

export default function QuizAttemptPage() {
  const { quiz, currentQuestionIndex, sessionId, userAnswers } = useQuizStore();
  const { user } = useAuthStore();
  const question = quiz?.questions?.[currentQuestionIndex];
  const questionType = question?.question_type;
  const answerOptions = [
    question?.option_a,
    question?.option_b,
    question?.option_c,
    question?.option_d,
  ];
  const [isModalOpen, setModalOpen] = React.useState(false);

  const handleModal = () => {
    setModalOpen(prev => !prev);
  };

  const handleEndQuiz = async () => {
    if (!quiz || !quiz.questions) return;

    const latestAttemptState = loadQuizAttemptState(sessionId);
    const timeRemainingInSeconds = latestAttemptState?.timeRemaining;

    // Create an array of state objects, now including the answer.
    const statesToUpdate = quiz.questions.map(question => {
      // Find the answer for the current question in the userAnswers map
      const selectedAnswer = userAnswers[question.id];

      return {
        quiz_id: quiz.id,
        question_id: question.id,
        time_remaining: timeRemainingInSeconds,
        // Include the selected answer if it exists.
        // If it's undefined, it will be handled correctly by the upsert.
        selected_answer: selectedAnswer,
      };
    });

    const updateResult = await updateQuizAttemptState(statesToUpdate);

    const quizIds = statesToUpdate.map(item => ({
      quiz_id: item.quiz_id,
      question_id: item.question_id,
    }));

    if (updateResult.success) {
      await MarkQuizSubmitted(quizIds);
    } else {
      console.error("Failed to save final quiz state:", updateResult.error);
    }
  };

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
      >
        <Button onClick={handleModal} variant="outlined">
          Review kembali
        </Button>
        <Button onClick={handleEndQuiz} variant="contained">
          Akhiri kuis
        </Button>
      </ModalComponent>
    </>
  );
}
