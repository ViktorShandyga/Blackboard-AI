import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Trophy } from 'lucide-react';
import { rarityLabel, type Achievement, type Rarity } from '@/lib/achievements';

const RARITY_STYLES: Record<Rarity, { tile: string; text: string; halo: string }> = {
  bronze: {
    tile: 'from-amber-500/60 via-orange-400/30 to-amber-700/20 ring-amber-400/50',
    text: 'text-amber-300',
    halo: 'bg-amber-400/20',
  },
  silver: {
    tile: 'from-slate-300/60 via-slate-400/25 to-slate-600/20 ring-slate-300/50',
    text: 'text-slate-300',
    halo: 'bg-slate-300/20',
  },
  gold: {
    tile: 'from-yellow-300/70 via-amber-400/35 to-orange-500/20 ring-yellow-300/50',
    text: 'text-yellow-300',
    halo: 'bg-yellow-300/25',
  },
};

interface AchievementToastProps {
  toasts: Achievement[];
  onDismiss: (id: string) => void;
}

export function AchievementToast({ toasts, onDismiss }: AchievementToastProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex max-h-[80vh] flex-col items-end gap-3 overflow-hidden"
    >
      <AnimatePresence>
        {toasts.map((achievement) => {
          const styles = RARITY_STYLES[achievement.rarity];
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={() => onDismiss(achievement.id)}
              className="glass-card pointer-events-auto relative flex w-[min(340px,calc(100vw-2rem))] cursor-pointer items-center gap-4 overflow-hidden p-4 shadow-glass-lg"
            >
              <span aria-hidden="true" className={`pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl ${styles.halo} animate-glow-pulse`} />
              <motion.span
                initial={{ rotate: -30, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white ring-1 ${styles.tile}`}
              >
                <Icon className="h-5 w-5" />
                <Sparkles className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 text-white/90" />
              </motion.span>
              <div className="relative min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                  <Trophy className="h-3 w-3" />
                  Нове досягнення
                </p>
                <p className="mt-0.5 truncate font-display text-sm font-semibold text-ink">{achievement.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-silver">{achievement.description}</p>
                <p className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${styles.text}`}>
                  {rarityLabel(achievement.rarity)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
