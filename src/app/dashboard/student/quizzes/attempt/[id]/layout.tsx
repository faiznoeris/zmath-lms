"use client";

import React from "react";
import { Box } from "@mui/material";
import { useParams } from "next/navigation";
import { useQuizStore } from "@/src/stores";
import { useQuery } from "@tanstack/react-query";
import { QuizHeader, QuizSidebar } from "@/src/components";
import { fetchQuizWithQuestions } from "@/src/services/quiz.service";

export default function QuizLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  const { id: questionsId } = useParams();
  const { setQuiz } = useQuizStore();

  // Fetch quiz with question
  const { data: quizQuestionsData, error: quizQuestionsError } = useQuery({
    queryKey: ["questions", questionsId],
    queryFn: async () => {
      if (typeof questionsId !== "string") {
        return Promise.reject(new Error("Invalid ID"));
      }
      const result = await fetchQuizWithQuestions(questionsId);
      if (quizQuestionsError) throw new Error(result.error);

      return result.data;
    },
    enabled: !!questionsId,
  });

  React.useEffect(() => {
    if (!!quizQuestionsData) {
      setQuiz(quizQuestionsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizQuestionsData]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <QuizHeader />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <QuizSidebar />
        <Box component="main" sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
