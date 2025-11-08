import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useQuizStore } from "@/src/stores";
import CountdownTimer from "../CountdownTimer";

const QuizHeader = () => {
  const { quiz, timeRemaining, sessionId } = useQuizStore();
  const quizTitle = quiz?.title;
  const quizTimeLimit = quiz?.time_limit_minutes;
  const initialTimeRef = React.useRef<number | null>(null);

  // Use timeRemaining from store if available (resumed session), otherwise use full time limit
  const timeLimitInSeconds = timeRemaining !== null 
    ? timeRemaining 
    : (quizTimeLimit ? quizTimeLimit * 60 : null);

  // Capture the initial time on first render only
  if (initialTimeRef.current === null && timeLimitInSeconds !== null) {
    initialTimeRef.current = timeLimitInSeconds;
  }

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
      {initialTimeRef.current !== null ? (
        <CountdownTimer 
          key={sessionId || 'default'}
          timeLimitInSeconds={initialTimeRef.current} 
        />
      ) : (
        <CircularProgress size={25} />
      )}
    </Box>
  );
};

export default QuizHeader;
