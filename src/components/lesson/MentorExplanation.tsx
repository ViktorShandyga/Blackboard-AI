import { motion } from 'motion/react';
import { Bot, CheckCircle2, XCircle } from 'lucide-react';
import { POINTS_PER_CORRECT } from '@/lib/progressStorage';

interface MentorExplanationProps {
  isCorrect: boolean;
  explanation: string;
  correctAnswer: string;
}

export function MentorExplanation({ isCorrect, explanation, correctAnswer }: MentorExplanationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div
        className={`rounded-2xl border p-5 backdrop-blur-md transition-colors duration-500 ${
          isCorrect ? 'border-success/25 bg-success/[0.06] shadow-[0_0_30px_-12px_rgba(110,231,183,0.5)]' : 'border-danger/25 bg-danger/[0.05] shadow-[0_0_30px_-12px_rgba(251,113,133,0.5)]'
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {isCorrect ? (
            <span className="badge border-success/40 bg-success/10 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="badge border-danger/40 bg-danger/10 text-danger">
              <XCircle className="h-3.5 w-3.5" />
            </span>
          )}
          <span>
            {isCorrect ? `Ти розніс це завдання! Нараховано +${POINTS_PER_CORRECT} XP.` : 'Спробуй ще раз наступного разу!'}
          </span>
        </div>
        <div className="mt-4 flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/25 to-violet-400/25 text-sky-200 ring-1 ring-sky-400/30 shadow-glow-sky">
            <Bot className="h-4 w-4" />
          </span>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">AI-наставник пояснює</p>
            {!isCorrect ? (
              <p className="text-sm font-medium text-ink">Правильна відповідь: {correctAnswer}</p>
            ) : null}
            <p className="text-sm leading-relaxed text-ink/80">{explanation}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
