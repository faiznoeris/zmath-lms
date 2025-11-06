import React from "react";
import { useCountdownTimer } from "use-countdown-timer";

interface CountdownTimerParams {
  timeLimitInSeconds: number;
}

const CountdownTimer = ({ timeLimitInSeconds }: CountdownTimerParams) => {
  const { countdown } = useCountdownTimer({
    timer: 1000 * timeLimitInSeconds,
    autostart: true,
  });

  return (
    <div>
      <div>{countdown}</div>
    </div>
  );
};

export default CountdownTimer;
