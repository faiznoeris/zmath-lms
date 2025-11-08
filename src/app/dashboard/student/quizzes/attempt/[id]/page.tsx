"use client";

import React from "react";
import { Box, Button, Card, CardContent, Skeleton } from "@mui/material";
import { useQuizStore } from "@/src/stores";
import {
  MathQuestionDisplay,
  QuizBottomNav,
  QuizAnswerOptions,
  ModalComponent,
  FileUpload,
} from "@/src/components";
import { loadQuizAttemptState } from "@/src/utils/quizHelpers";

export default function QuizAttemptPage() {
  const { quiz, currentQuestionIndex, sessionId } = useQuizStore();
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

  const handleEndQuiz = () => {};

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
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        maxWidth: 1200,
        mx: "auto",
        p: 3,
      }}
    >
      <Card>
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
            <FileUpload items="Upload jawaban anda" acceptedFile="image/*" />
          )}
        </CardContent>
      </Card>
      <QuizBottomNav onOpenModal={handleModal} />
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
    </Box>
  );
}
