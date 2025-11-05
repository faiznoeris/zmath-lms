"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";

export default function QuizAttemptPage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <QuizIcon sx={{ fontSize: 80, color: "warning.main", mb: 2 }} />
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Quiz Attempt Page
      </Typography>
    </Box>
  );
}
