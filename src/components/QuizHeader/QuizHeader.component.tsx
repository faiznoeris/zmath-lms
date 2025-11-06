import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useQuizStore } from "@/src/stores";
import CountdownTimer from "../CountdownTimer";

const QuizHeader = () => {
  const { quiz } = useQuizStore();
  const quizTitle = quiz?.title;
  const quizTimeLimit = quiz?.time_limit_minutes;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "solid #0000001f thin",
        p: 3,
      }}
    >
      <Typography sx={{ fontWeight: "bold" }}>
        Kategori Soal: {quizTitle}
      </Typography>
      {quizTimeLimit ? (
        <CountdownTimer timeLimitInSeconds={quizTimeLimit * 60} />
      ) : (
        <CircularProgress size={25} />
      )}
    </Box>
  );
};

export default QuizHeader;
