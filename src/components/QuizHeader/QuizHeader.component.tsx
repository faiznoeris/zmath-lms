import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useQuizStore } from "@/src/stores";
import CountdownTimer from "../CountdownTimer";

const QuizHeader = () => {
  const { quiz, timeRemaining } = useQuizStore();
  const quizTitle = quiz?.title;
  const quizTimeLimit = quiz?.time_limit_minutes;

  // Use timeRemaining from store if available (resumed session), otherwise use full time limit
  const timeLimitInSeconds = timeRemaining !== null 
    ? timeRemaining 
    : (quizTimeLimit ? quizTimeLimit * 60 : null);

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
      {timeLimitInSeconds !== null ? (
        <CountdownTimer timeLimitInSeconds={timeLimitInSeconds} />
      ) : (
        <CircularProgress size={25} />
      )}
    </Box>
  );
};

export default QuizHeader;
