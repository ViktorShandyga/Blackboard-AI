import { useEffect, useRef, useState } from 'react';
import { Hourglass } from 'lucide-react';

interface ExamTimerProps {
  /** Загальний час екзамену в секундах. */
  totalSeconds: number;
  /** Викликається один раз, коли час вичерпано. */
  onExpire: () => void;
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/** Відліковий таймер екзамену: спокійний бейдж, що червоніє й пульсує на фініші. */
export function ExamTimer({ totalSeconds, onExpire }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const expiredRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining > 0 || expiredRef.current) return;
    expiredRef.current = true;
    onExpireRef.current();
  }, [remaining]);

  const urgent = remaining <= 30;
  const critical = remaining <= 10;

  return (
    <span
      role="timer"
      aria-label={`Залишилося часу: ${formatClock(remaining)}`}
      className={`badge tabular-nums transition-colors duration-500 ${
        critical
          ? 'border-danger/60 bg-danger/20 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.45)] animate-pulse'
          : urgent
            ? 'border-danger/40 bg-danger/10 text-rose-200'
            : 'border-sky-400/25 bg-sky-400/[0.08] text-sky-200'
      }`}
    >
      <Hourglass className={`h-3.5 w-3.5 ${urgent ? 'animate-pulse' : ''}`} />
      {formatClock(remaining)}
    </span>
  );
}
