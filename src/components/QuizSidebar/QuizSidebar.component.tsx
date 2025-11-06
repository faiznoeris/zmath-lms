"use client";

import React from "react";
import { Box, Button, Stack } from "@mui/material";
import { useQuizStore } from "@/src/stores";

const QuizSidebar = () => {
  const { quiz, currentQuestionIndex, setCurrentQuestionIndex } =
    useQuizStore();
  const questions = quiz?.questions;

  return (
    <Box
      sx={{ maxWidth: 350, borderRight: "solid #0000001f thin", pt: 2, px: 3 }}
    >
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {questions?.map((question, index) => (
          <Button
            key={question.id}
            variant={currentQuestionIndex === index ? "contained" : "outlined"}
            onClick={() => setCurrentQuestionIndex(index)}
            sx={{ minWidth: "40px" }}
          >
            {index + 1}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default QuizSidebar;
