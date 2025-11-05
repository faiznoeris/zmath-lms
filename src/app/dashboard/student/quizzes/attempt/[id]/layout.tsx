"use client";

import React from "react";
import { Box } from "@mui/material";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { QuizHeader, QuizSidebar } from "@/src/app/components";
import { fetchQuizQuestionApi } from "@/src/services/quiz.service";

export default function QuizLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  const { id: questionsId } = useParams();

  // Fetch quiz question
  const {
    data: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuery({
    queryKey: ["questions", questionsId],
    queryFn: () => {
      if (typeof questionsId !== "string") {
        return Promise.reject(new Error("Invalid ID"));
      }
      return fetchQuizQuestionApi(questionsId);
    },
    enabled: !!questionsId,
  });

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
