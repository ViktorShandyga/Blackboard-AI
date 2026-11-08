import { useEffect, useState } from 'react';

export function useElapsedSeconds(taskKey: string, running: boolean): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
  }, [taskKey]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running, taskKey]);

  return seconds;
}
