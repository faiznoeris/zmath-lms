import React from "react";
import { Box, Typography } from "@mui/material";
import { useQuizStore } from "@/src/stores";
import CountdownTimer from "../CountdownTimer";

const QuizHeader = () => {
  const { quiz } = useQuizStore();
  const quizTimeLimitInSeconds = quiz?.time_limit_minutes * 60;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "solid #0000001f thin",
        p: 3,
      }}
    >
      <Typography>Kategori Soal: AWDAWDAWD</Typography>
      <CountdownTimer timeLimitInSeconds={quizTimeLimitInSeconds} />
    </Box>
  );
};

export default QuizHeader;
