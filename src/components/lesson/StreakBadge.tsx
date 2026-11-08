import { AnimatePresence, motion } from 'motion/react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const isHot = streak >= 3;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-500 ${
        isHot
          ? 'border-orange-300/40 bg-orange-300/10 text-orange-100 shadow-[0_0_18px_-6px_rgba(253,186,116,0.8)]'
          : 'border-white/10 bg-canvas/60 text-silver'
      }`}
      aria-label={`Серія правильних відповідей: ${streak}`}
    >
      <motion.span
        key={streak}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 14 }}
        className="flex"
      >
        <Flame className={`h-3.5 w-3.5 ${isHot ? 'text-orange-300' : 'text-silver'}`} />
      </motion.span>
      <span>Серія</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={streak}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="tabular-nums font-semibold"
        >
          {streak}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
