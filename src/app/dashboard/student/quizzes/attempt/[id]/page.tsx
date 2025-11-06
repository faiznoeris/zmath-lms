"use client";

import React from "react";
import { Box, Card, CardContent, Skeleton } from "@mui/material";
import { useQuizStore } from "@/src/stores";
import {
  MathQuestionDisplay,
  QuizBottomNav,
  QuizAnswerOptions,
} from "@/src/components";

export default function QuizAttemptPage() {
  const { quiz, currentQuestionIndex } = useQuizStore();
  const question = quiz?.questions?.[currentQuestionIndex];
  const questionType = question?.question_type;
  const answerOptions =
    question && questionType === "multiple_choice"
      ? [
          question.option_a,
          question.option_b,
          question.option_c,
          question.option_d,
        ]
      : null;

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
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Card>
        <CardContent>
          <MathQuestionDisplay
            question={question?.question_text}
            questionNumber={currentQuestionIndex + 1}
          />
          {answerOptions ? (
            <QuizAnswerOptions options={answerOptions} />
          ) : (
            "upload essay answer"
          )}
        </CardContent>
      </Card>
      <QuizBottomNav />
    </Box>
  );
}
