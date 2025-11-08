import React from "react";
import { Box, Typography } from "@mui/material";
import { useCountdownTimer } from "use-countdown-timer";
import {
  formatCountdownTime,
  saveQuizAttemptState,
} from "@/src/utils/quizHelpers";
import { updateQuizAttemptState } from "@/src/services/quiz.service";
import { useQuizStore } from "@/src/stores";

const SYNC_INTERVAL_SECONDS = 30;

interface CountdownTimerParams {
  timeLimitInSeconds: number;
}

const CountdownTimer = ({ timeLimitInSeconds }: CountdownTimerParams) => {
  const startTimerInMs = 1000 * timeLimitInSeconds;
  const { quiz, currentQuestionIndex } = useQuizStore();
  const { countdown } = useCountdownTimer({
    timer: startTimerInMs,
    autostart: true,
  });

  const lastSyncedSecond = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!quiz) return;

    const timeRemaining = Math.floor(countdown / 1000);
    const currentQuestion = quiz.questions[currentQuestionIndex];

    if (!currentQuestion) return;

    // Send attempt state update to supabase every 30 seconds
    if (
      timeRemaining >= 0 &&
      timeRemaining % SYNC_INTERVAL_SECONDS === 0 &&
      lastSyncedSecond.current !== timeRemaining
    ) {
      lastSyncedSecond.current = timeRemaining;
      updateQuizAttemptState(
        quiz.id,
        currentQuestion.id,
        timeRemaining,
        new Date()
      );
    }

    saveQuizAttemptState(quiz.id, timeRemaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const getDangerStyles = () => {
    if (countdown <= startTimerInMs * 0.25) {
      return {
        color: "black",
        background: "orange",
        borderRadius: 2,
      };
    }
    if (countdown <= startTimerInMs * 0.15) {
      return {
        color: "black",
        background: "red",
        borderRadius: 2,
        fontWeight: "bold",
      };
    }
    return {};
  };

  return (
    <Box>
      <Typography
        variant="h6"
        component="div"
        sx={{ minWidth: "70px", textAlign: "center", ...getDangerStyles() }}
      >
        {formatCountdownTime(countdown)}
      </Typography>
    </Box>
  );
};

export default CountdownTimer;
