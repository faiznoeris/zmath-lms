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
  const { quiz, sessionId, userAnswers, resetQuizState, setTimeRemaining } = useQuizStore();
  const { countdown } = useCountdownTimer({
    timer: startTimerInMs,
    autostart: true,
  });

  const lastSyncedSecond = React.useRef<number | null>(null);

  React.useEffect(() => {
    // Guard clause: Don't do anything if the quiz data isn't loaded yet.
    if (!quiz || !quiz.questions) return;

    const timeRemainingInSeconds = Math.floor(countdown / 1000);

    // Update the store with current time remaining (for localStorage persistence)
    setTimeRemaining(timeRemainingInSeconds);

    // Check if timer has reached 0
    if (timeRemainingInSeconds <= 0) {
      // Timer expired, clear the store
      resetQuizState();
      // You might want to auto-submit or redirect here
      return;
    }

    // Send bulk update to Supabase every 30 seconds
    if (
      timeRemainingInSeconds >= 0 &&
      timeRemainingInSeconds % SYNC_INTERVAL_SECONDS === 0 &&
      lastSyncedSecond.current !== timeRemainingInSeconds
    ) {
      lastSyncedSecond.current = timeRemainingInSeconds;

      // 2. Create an array of state objects, now including the answer.
      const statesToUpdate = quiz.questions.map(question => {
        // Find the answer for the current question in the userAnswers map
        const selectedAnswer = userAnswers[question.id];

        return {
          quiz_id: quiz.id,
          question_id: question.id,
          time_remaining: timeRemainingInSeconds,
          // Include the selected answer if it exists.
          // If it's undefined, it will be handled correctly by the upsert.
          selected_answer: selectedAnswer,
        };
      });

      // 3. Call the service function with the enriched array.
      updateQuizAttemptState(statesToUpdate);
    }

    // This part saves the timer to local storage, it can remain as is.
    if (sessionId) {
      saveQuizAttemptState(sessionId, timeRemainingInSeconds);
    }
    // 4. Add userAnswers to the dependency array
  }, [countdown, quiz, sessionId, userAnswers, resetQuizState, setTimeRemaining]);

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
