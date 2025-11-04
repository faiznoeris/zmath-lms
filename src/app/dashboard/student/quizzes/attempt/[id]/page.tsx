"use client";
import React from "react";
import { Box, Typography, Card, Alert } from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";

export default function QuizAttemptPage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Card elevation={2} sx={{ p: 4, textAlign: "center" }}>
        <QuizIcon sx={{ fontSize: 80, color: "warning.main", mb: 2 }} />
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Quiz Attempt Page
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          This page will be implemented later. It will allow students to take the quiz
          and submit their answers.
        </Alert>
      </Card>
    </Box>
  );
}
