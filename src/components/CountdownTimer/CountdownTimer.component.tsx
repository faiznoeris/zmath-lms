import React from "react";
import { Box, Typography } from "@mui/material";
import { useCountdownTimer } from "use-countdown-timer";
import {
  formatCountdownTime,
  saveQuizAttemptState,
} from "@/src/utils/quizHelpers";
import { useQuizStore } from "@/src/stores";

interface CountdownTimerParams {
  timeLimitInSeconds: number;
}

const CountdownTimer = ({ timeLimitInSeconds }: CountdownTimerParams) => {
  const { attemptId } = useQuizStore();
  const { countdown } = useCountdownTimer({
    timer: 1000 * timeLimitInSeconds,
    autostart: true,
  });

  React.useEffect(() => {
    saveQuizAttemptState(attemptId, countdown / 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  return (
    <Box>
      <Typography
        variant="h6"
        component="div"
        sx={{ minWidth: "70px", textAlign: "center" }}
      >
        {formatCountdownTime(countdown)}
      </Typography>
    </Box>
  );
};

export default CountdownTimer;
