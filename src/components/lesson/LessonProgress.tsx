import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import type { TaskResult } from '@/types/learning';

interface LessonProgressProps {
  total: number;
  current: number;
  results: TaskResult[];
}

type StepState = 'correct' | 'wrong' | 'current' | 'upcoming';

function stepState(index: number, current: number, results: TaskResult[]): StepState {
  const result = results[index];
  if (result) return result.correct ? 'correct' : 'wrong';
  return index === current ? 'current' : 'upcoming';
}

const NODE_CLASSES: Record<StepState, string> = {
  correct: 'border-success/60 bg-success/15 text-success shadow-[0_0_16px_-4px_rgba(110,231,183,0.7)]',
  wrong: 'border-danger/60 bg-danger/15 text-danger',
  current: 'border-sky-300 bg-sky-400/20 text-sky-200 shadow-[0_0_20px_-2px_rgba(56,189,248,0.9)] animate-glow-pulse',
  upcoming: 'border-white/10 bg-canvas/70 text-silver',
};

export function LessonProgress({ total, current, results }: LessonProgressProps) {
  const completed = results.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="glass-card space-y-4 p-4 sm:p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-silver">Прогрес заняття</span>
        <span className="font-semibold tabular-nums text-ink">{percent}%</span>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-canvas/80">
          <motion.div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-sky-400 via-sky-300 to-violet-400 shadow-[0_0_14px_rgba(56,189,248,0.7)]"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <span className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        <ol className="relative flex justify-between">
          {Array.from({ length: total }, (_, index) => {
            const state = stepState(index, current, results);
            return (
              <motion.li
                key={`${index}-${state}`}
                initial={state === 'upcoming' ? false : { scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                whileHover={{ scale: 1.12 }}
                title={`Завдання ${index + 1}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-500 ${NODE_CLASSES[state]}`}
              >
                {state === 'correct' ? <Check className="h-4 w-4" /> : null}
                {state === 'wrong' ? <X className="h-4 w-4" /> : null}
                {state === 'current' || state === 'upcoming' ? index + 1 : null}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
