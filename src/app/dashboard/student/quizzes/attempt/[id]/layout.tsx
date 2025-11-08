"use client";

import React from "react";
import { Box } from "@mui/material";
import { QuizHeader, QuizSidebar } from "@/src/components";

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
