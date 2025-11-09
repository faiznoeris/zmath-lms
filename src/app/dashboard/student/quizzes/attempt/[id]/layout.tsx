"use client";

import React from "react";
import { Box } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { QuizHeader, QuizSidebar } from "@/src/components";
import { useQuizStore } from "@/src/stores";
import {
  updateQuizAttemptState,
  MarkQuizSubmitted,
  createQuizResult,
} from "@/src/services/quiz.service";
import { loadQuizAttemptState } from "@/src/utils/quizHelpers";

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { quiz, sessionId, userAnswers, resetQuizState } = useQuizStore();
  const hasAutoSubmitted = React.useRef(false);

  // Auto-submit when timer reaches 0
  const handleTimeExpired = React.useCallback(async () => {
    if (hasAutoSubmitted.current || !quiz || !quiz.questions) return;
    hasAutoSubmitted.current = true;

    const latestAttemptState = loadQuizAttemptState(sessionId);
    const timeRemainingInSeconds = latestAttemptState?.timeRemaining || 0;

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

    try {
      // Update quiz state
      await updateQuizAttemptState(statesToUpdate);

      // Mark as submitted
      const quizIds = statesToUpdate.map(item => ({
        quiz_id: item.quiz_id,
        question_id: item.question_id,
      }));

      await MarkQuizSubmitted(quizIds);

      // Create result entry
      const resultCreation = await createQuizResult(quizId);

      // Clear quiz state from localStorage
      resetQuizState();

      // Redirect to result page
      if (resultCreation.success && resultCreation.data?.id) {
        router.push(`/dashboard/student/quizzes/result/${resultCreation.data.id}`);
      } else {
        router.push(`/dashboard/student/quizzes/result/${quizId}`);
      }
    } catch (error) {
      console.error("Error in auto-submit:", error);
      
      // Clear quiz state even on error
      resetQuizState();
      
      alert("Waktu habis! Kuis akan diserahkan secara otomatis.");
      router.push(`/dashboard/student/quizzes/result/${quizId}`);
    }
  }, [quiz, sessionId, userAnswers, quizId, router, resetQuizState]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <QuizHeader onTimeExpired={handleTimeExpired} />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <QuizSidebar />
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            p: 3
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
