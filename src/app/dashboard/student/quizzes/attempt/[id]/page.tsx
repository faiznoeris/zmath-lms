"use client";

import React from "react";
import { Box, Card, CardContent } from "@mui/material";
import { useQuizStore } from "@/src/stores";
import { MathQuestionDisplay, QuizBottomNav } from "@/src/components";

export default function QuizAttemptPage() {
  const { quiz, currentQuestionIndex } = useQuizStore();
  const question = quiz?.questions?.[currentQuestionIndex];

  if (!question) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Card>
        <CardContent>
          <MathQuestionDisplay
            question={question?.question_text}
            questionNumber={currentQuestionIndex + 1}
          />
          {/* You can render answer options here */}
        </CardContent>
      </Card>
      <QuizBottomNav />
    </Box>
  );
}
