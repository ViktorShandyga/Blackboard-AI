import { useEffect, useRef, type MutableRefObject } from 'react';
import type { VoiceStatus } from '@/hooks/useVoiceTutor';

interface VoiceOrbProps {
  status: VoiceStatus;
  /** Рівень мікрофона 0..1, оновлюється мотивом поза React. */
  voiceLevelRef: MutableRefObject<number>;
}

export function VoiceOrb({ status, voiceLevelRef }: VoiceOrbProps) {
  const coreRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const ringARef = useRef<HTMLDivElement>(null);
  const ringBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let eased = 0;

    const tick = (time: number) => {
      const seconds = time / 1000;
      let level: number;
      if (status === 'speaking') {
        level = 0.45 + 0.28 * Math.abs(Math.sin(seconds * 2.6)) + 0.12 * Math.abs(Math.sin(seconds * 4.3 + 1.2));
      } else if (status === 'listening') {
        level = voiceLevelRef.current;
      } else if (status === 'thinking') {
        level = 0.3 + 0.1 * Math.sin(seconds * 3);
      } else {
        level = 0.07 + 0.05 * Math.sin(seconds * 1.4);
      }

      eased += (level - eased) * 0.16;

      const core = coreRef.current;
      const halo = haloRef.current;
      const ringA = ringARef.current;
      const ringB = ringBRef.current;

      if (core) core.style.transform = `scale(${(1 + eased * 0.42).toFixed(3)})`;
      if (halo) {
        halo.style.transform = `scale(${(1 + eased * 0.85).toFixed(3)})`;
        halo.style.opacity = (0.3 + eased * 0.55).toFixed(2);
      }
      if (ringA) ringA.style.transform = `rotate(${((seconds * 24) % 360).toFixed(1)}deg) scale(${(1 + eased * 0.22).toFixed(3)})`;
      if (ringB) ringB.style.transform = `rotate(${(-seconds * 38) % 360}deg) scale(${(1 + eased * 0.34).toFixed(3)})`;

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [status, voiceLevelRef]);

  return (
    <div className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60">
      {/* Зовнішнє сяйво, розмір залежить від гучності голосу */}
      <div
        ref={haloRef}
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/35 via-indigo-500/25 to-violet-600/35 blur-3xl"
      />
      {/* Градієнтна хвиля-кільце */}
      <div
        ref={ringARef}
        aria-hidden="true"
        className="absolute inset-1 rounded-full border border-sky-400/25 [border-style:dashed]"
      />
      <div
        ref={ringBRef}
        aria-hidden="true"
        className="absolute -inset-3 rounded-full border border-violet-400/15"
      />
      {/* Ядро сфери */}
      <div
        ref={coreRef}
        className="absolute inset-9 flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 shadow-[0_0_60px_-12px_rgba(99,102,241,0.9),inset_0_2px_10px_rgba(255,255,255,0.35)]"
      >
        <span aria-hidden="true" className="absolute left-[20%] top-[14%] h-5 w-9 rounded-full bg-white/25 blur-md" />
        <span
          className={`relative flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-500 ${
            status === 'speaking' ? 'bg-white/20' : 'bg-white/10'
          }`}
        >
          <span className="absolute inset-0 rounded-full border border-white/25" />
          <span className="relative flex items-end gap-[3px]" aria-hidden="true">
            {[0.55, 0.85, 1, 0.7, 0.45].map((factor, index) => (
              <span
                key={index}
                className="w-[3px] rounded-full bg-white/90 transition-[height] duration-300"
                style={{
                  height: `${8 + factor * (status === 'speaking' || status === 'listening' ? 20 : 6)}px`,
                  transitionDelay: `${index * 40}ms`,
                }}
              />
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
