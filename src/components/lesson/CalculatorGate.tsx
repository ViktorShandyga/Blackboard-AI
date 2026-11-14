import { AnimatePresence, motion } from 'motion/react';
import { Calculator, Lock, LockOpen, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CalculatorPanel } from '@/components/lesson/CalculatorPanel';
import { CALCULATOR_XP_COST } from '@/lib/calculator';

interface CalculatorGateProps {
  totalPoints: number;
  /** Списує XP; повертає false, якщо не вдалося. */
  onActivate: () => boolean;
  /** true — спершу показуємо замок із церемонією відкриття; false — кнопка одразу доступна. */
  locked: boolean;
  /** Викликається після завершення анімації відкриття замка. */
  onUnlocked: () => void;
}

/** Тривалість «епічної» анімації відкриття замка, мс. */
const UNLOCK_SEQUENCE_MS = 1600;

/** Іскри, що розлітаються під час відкриття замка. */
const SPARKS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2;
  return {
    id: index,
    x: Math.cos(angle) * 46,
    y: Math.sin(angle) * 46,
    delay: 0.45 + (index % 3) * 0.08,
  };
});

export function CalculatorGate({ totalPoints, onActivate, locked, onUnlocked }: CalculatorGateProps) {
  const [phase, setPhase] = useState<'locked' | 'unlocking' | 'ready'>(locked ? 'locked' : 'ready');
  const [open, setOpen] = useState(false);
  const affordable = totalPoints >= CALCULATOR_XP_COST;

  // onUnlocked у ref: LessonView перерендерюється щосекунди (таймер завдання),
  // і нова ідентичність пропа не повинна перезапускати таймер анімації.
  const onUnlockedRef = useRef(onUnlocked);
  onUnlockedRef.current = onUnlocked;

  // Після анімації відкриття — передаємо розблокування на рівень заняття.
  useEffect(() => {
    if (phase !== 'unlocking') return;
    const timer = window.setTimeout(() => {
      onUnlockedRef.current();
      setPhase('ready');
    }, UNLOCK_SEQUENCE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const handleActivate = () => {
    if (!affordable) return;
    if (onActivate()) setOpen(true);
  };

  return (
    <div className="fixed right-3 top-1/2 z-40 -translate-y-1/2">
      <AnimatePresence mode="wait">
        {phase === 'locked' ? (
          // ── Мале повідомлення з замком: плавний виїзд збоку ──
          <motion.button
            key="locked"
            type="button"
            onClick={() => setPhase('unlocking')}
            initial={{ opacity: 0, x: 64, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="group relative flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-card/85 py-2 pl-2.5 pr-4 shadow-glass backdrop-blur-xl transition-colors duration-300 hover:border-sky-400/45"
            aria-label="Калькулятор під замком — натисни, щоб відкрити"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 transition-colors duration-300 group-hover:bg-sky-400/[0.12] group-hover:ring-sky-400/40">
              <Lock className="h-4 w-4 text-silver transition-colors duration-300 group-hover:text-sky-300" />
            </span>
            <span className="text-xs font-medium text-silver transition-colors duration-300 group-hover:text-ink">
              Калькулятор
            </span>
            <span className="badge border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] tabular-nums text-violet-200">
              {CALCULATOR_XP_COST} XP
            </span>
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-sky-400/30"
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.button>
        ) : null}

        {phase === 'unlocking' ? (
          // ── Епічна анімація відкриття замка ──
          <motion.div
            key="unlocking"
            className="relative flex h-12 items-center justify-center"
            initial={{ opacity: 0.9 }}
            animate={{
              scale: [1, 1.16, 1.06, 1.02],
              x: [0, -4, 4, -2, 0],
            }}
            transition={{ duration: UNLOCK_SEQUENCE_MS / 1000, ease: 'easeInOut' }}
          >
            {/* Хвилі-ударні кільця */}
            {[0, 0.28].map((delay) => (
              <motion.span
                key={delay}
                aria-hidden="true"
                className={`absolute h-12 w-12 rounded-full border-2 ${delay === 0 ? 'border-sky-400/70' : 'border-violet-400/60'}`}
                initial={{ scale: 0.6, opacity: 0.85 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 1.1, delay, ease: 'easeOut' }}
              />
            ))}
            {/* Іскри */}
            {SPARKS.map((spark) => (
              <motion.span
                key={spark.id}
                aria-hidden="true"
                className="absolute h-1 w-1 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.95)]"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: spark.x, y: spark.y, opacity: [0, 1, 0] }}
                transition={{ duration: 0.7, delay: spark.delay, ease: 'easeOut' }}
              />
            ))}
            {/* Сам замок: шеклдок відкривається */}
            <motion.span
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/35 via-indigo-500/25 to-violet-500/30 ring-1 ring-sky-400/50 shadow-glow-sky"
              animate={{ rotate: [0, -8, 0], boxShadow: ['0 0 20px -6px rgba(56,189,248,0.5)', '0 0 42px -4px rgba(139,92,246,0.9)', '0 0 20px -6px rgba(56,189,248,0.5)'] }}
              transition={{ duration: UNLOCK_SEQUENCE_MS / 1000 }}
            >
              <motion.span
                className="absolute flex items-center justify-center"
                animate={{ opacity: [1, 1, 0, 0], rotate: [0, 0, -40, -40], scale: [1, 1, 0.7, 0.7] }}
                transition={{ duration: 0.9, times: [0, 0.4, 0.55, 1] }}
              >
                <Lock className="h-5 w-5 text-silver" />
              </motion.span>
              <motion.span
                className="absolute flex items-center justify-center"
                animate={{ opacity: [0, 0, 1, 1], scale: [0.6, 0.6, 1.25, 1], rotate: [-40, -40, 0, 0] }}
                transition={{ duration: 0.9, times: [0, 0.4, 0.55, 1], ease: 'easeOut' }}
              >
                <LockOpen className="h-5 w-5 text-sky-200" />
              </motion.span>
              <motion.span
                aria-hidden="true"
                className="absolute -right-1 -top-1 text-yellow-300"
                animate={{ opacity: [0, 0, 1, 0], scale: [0.4, 0.4, 1.15, 0.9], rotate: [0, 0, 25, 10] }}
                transition={{ duration: 1.1, times: [0, 0.55, 0.75, 1] }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.span>
            </motion.span>
          </motion.div>
        ) : null}

        {phase === 'ready' ? (
          // ── Кнопка активації: плавна поява ──
          <motion.button
            key="ready"
            type="button"
            onClick={handleActivate}
            initial={{ opacity: 0, x: 48, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className={`group flex flex-col items-center gap-2.5 rounded-2xl border bg-card/85 px-2.5 py-4 shadow-glass backdrop-blur-xl transition-colors duration-300 ${
              affordable
                ? 'border-sky-400/35 hover:border-sky-400/70 hover:shadow-glow-sky'
                : 'cursor-not-allowed border-white/[0.08] opacity-60'
            }`}
            aria-label={
              affordable
                ? `Активувати калькулятор на це завдання за ${CALCULATOR_XP_COST} XP`
                : `Калькулятор коштує ${CALCULATOR_XP_COST} XP на одне завдання — не вистачає балів`
            }
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition-all duration-300 ${
                affordable
                  ? 'bg-gradient-to-br from-sky-400/30 to-violet-500/20 text-sky-200 ring-sky-400/40 group-hover:rotate-6'
                  : 'bg-white/[0.05] text-silver/60 ring-white/10'
              }`}
            >
              <Calculator className="h-4 w-4" />
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-silver"
              style={{ writingMode: 'vertical-rl' }}
            >
              Активувати калькулятор
            </span>
            <span
              className={`badge px-2 py-0.5 text-[10px] tabular-nums ${
                affordable
                  ? 'border-violet-400/30 bg-violet-400/10 text-violet-200'
                  : 'border-white/[0.08] bg-white/[0.04] text-silver/60'
              }`}
            >
              {CALCULATOR_XP_COST} XP
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ opacity: 0, x: 48, y: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: '-50%', scale: 1 }}
            exit={{ opacity: 0, x: 48, y: '-50%', scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed right-16 top-1/2 z-40 w-[min(280px,calc(100vw-5.5rem))]"
          >
            <CalculatorPanel onClose={() => setOpen(false)} />
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
