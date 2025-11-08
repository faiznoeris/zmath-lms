"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import { useQuizStore } from "@/src/stores";

interface QuizBottomNavProps {
  onOpenModal: () => void;
}

const QuizBottomNav = ({ onOpenModal }: QuizBottomNavProps) => {
  const { quiz, currentQuestionIndex, setCurrentQuestionIndex } =
    useQuizStore();
  const totalQuestion = quiz?.questions?.length ?? 0;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: currentQuestionIndex > 0 ? "space-between" : "flex-end",
      }}
    >
      {currentQuestionIndex > 0 && (
        <Button
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
        >
          Sebelumnya
        </Button>
      )}
      {currentQuestionIndex < totalQuestion - 1 ? (
        <Button
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
        >
          Selanjutnya
        </Button>
      ) : (
        <Button onClick={onOpenModal}>Selesai</Button>
      )}
    </Box>
  );
};

export default QuizBottomNav;
