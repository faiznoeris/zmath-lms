import React from "react";
import { Box, Typography } from "@mui/material";
import { useCountdownTimer } from "use-countdown-timer";
import { formatCountdownTime } from "@/src/utils/quizHelpers";

interface CountdownTimerParams {
  timeLimitInSeconds: number;
}

const CountdownTimer = ({ timeLimitInSeconds }: CountdownTimerParams) => {
  const { countdown } = useCountdownTimer({
    timer: 1000 * timeLimitInSeconds,
    autostart: true,
  });

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
