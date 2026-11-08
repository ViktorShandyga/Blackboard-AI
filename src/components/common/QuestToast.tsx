import { AnimatePresence, motion } from 'motion/react';
import { Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DailyQuestToast {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  reward: number;
}

interface QuestToastProps {
  toasts: DailyQuestToast[];
  onDismiss: (id: string) => void;
}

export function QuestToast({ toasts, onDismiss }: QuestToastProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 z-[70] flex max-h-[80vh] flex-col items-start gap-3 overflow-hidden"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toast.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={() => onDismiss(toast.id)}
              className="glass-card pointer-events-auto relative flex w-[min(320px,calc(100vw-2rem))] cursor-pointer items-center gap-4 overflow-hidden p-4 shadow-glass-lg"
            >
              <span aria-hidden="true" className="pointer-events-none absolute -left-8 -top-10 h-24 w-24 rounded-full bg-sky-400/15 blur-2xl animate-glow-pulse" />
              <motion.span
                initial={{ rotate: 30, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-success/40 via-teal-400/25 to-sky-500/20 text-success ring-1 ring-success/40"
              >
                <Icon className="h-5 w-5" />
              </motion.span>
              <div className="relative min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-300">
                  <Target className="h-3 w-3" />
                  Щоденне завдання виконано
                </p>
                <p className="mt-0.5 truncate font-display text-sm font-semibold text-ink">{toast.title}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-silver">
                  <span className="badge border-violet-400/30 bg-violet-400/10 tabular-nums text-violet-200">
                    +{toast.reward} балів
                  </span>
                  нараховано додатково
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
