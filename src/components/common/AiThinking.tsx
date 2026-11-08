import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const THINKING_MESSAGES = [
  'Наставник читає конспект...',
  'Складає свіжі запитання...',
  'Перевіряє кожну відповідь...',
];

export function AiThinking() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((value) => (value + 1) % THINKING_MESSAGES.length), 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <span className="relative flex h-6 w-6 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full border border-sky-300/40 border-t-sky-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
        </motion.span>
        <Sparkles className="h-3 w-3 text-sky-200" />
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="text-sm"
        >
          {THINKING_MESSAGES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
