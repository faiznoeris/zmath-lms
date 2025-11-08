"use client";

import React from "react";
import { Box, Button, Stack } from "@mui/material";
import { useQuizStore } from "@/src/stores";

const QuizSidebar = () => {
  const { quiz, currentQuestionIndex, setCurrentQuestionIndex, userAnswers } =
    useQuizStore();
  const questions = quiz?.questions;

  return (
    <Box
      sx={{ maxWidth: 350, borderRight: "solid #0000001f thin", pt: 2, px: 3 }}
    >
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {questions?.map((question, index) => {
          const isActive = currentQuestionIndex === index;
          // A question is answered if its ID exists as a key in userAnswers
          const isAnswered = userAnswers.hasOwnProperty(question.id);

          return (
            <Button
              key={question.id}
              // Style logic:
              // - "contained" if it's the active question.
              // - "contained" with secondary color if answered but not active.
              // - "outlined" if not answered and not active.
              variant={isActive || isAnswered ? "contained" : "outlined"}
              color={isActive ? "primary" : "secondary"}
              onClick={() => setCurrentQuestionIndex(index)}
              sx={{ minWidth: "40px" }}
            >
              {index + 1}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};

export default QuizSidebar;
