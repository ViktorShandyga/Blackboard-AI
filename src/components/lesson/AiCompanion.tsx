import { AnimatePresence, motion } from 'motion/react';
import { Bot } from 'lucide-react';

interface AiCompanionProps {
  message: string;
}

export function AiCompanion({ message }: AiCompanionProps) {
  return (
    <div className="flex items-center gap-3">
      <motion.span
        aria-hidden="true"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-white shadow-glow-sky"
      >
        <Bot className="h-5 w-5" />
      </motion.span>
      <div className="glass-card relative min-w-0 flex-1 !rounded-3xl !rounded-tl-md px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">AI-друг</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-0.5 text-sm font-medium text-ink"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
