import { animate } from 'motion/react';
import { useEffect, useRef } from 'react';

interface CountUpProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export function CountUp({ value, suffix = '', duration = 1.2 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(previous.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (current) => {
        node.textContent = `${Math.round(current)}${suffix}`;
      },
      onComplete: () => {
        previous.current = value;
      },
    });
    return () => controls.stop();
  }, [value, suffix, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      0{suffix}
    </span>
  );
}
