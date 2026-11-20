"use client";

import * as React from "react";

interface LiveElapsedTimerProps {
  sinceIso: string;
  initialNowMs: number;
  suffix?: string;
  className?: string;
}

/**
 * Isolated 1-second stopwatch display so parent KDS/POS/Ticket views
 * do not re-render every second.
 */
export function LiveElapsedTimer({
  sinceIso,
  initialNowMs,
  suffix = "",
  className = "",
}: LiveElapsedTimerProps) {
  const [nowMs, setNowMs] = React.useState(initialNowMs);

  React.useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const totalSec = Math.max(
    0,
    Math.floor((nowMs - new Date(sinceIso).getTime()) / 1000)
  );
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;

  return (
    <span className={`tabular-nums ${className}`}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      {suffix}
    </span>
  );
}
