import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { LEVEL_LABELS } from '@/lib/localLesson';
import { formatSeconds } from '@/lib/format';
import { CelebrationBurst } from '@/components/lesson/CelebrationBurst';
import { MentorExplanation } from '@/components/lesson/MentorExplanation';
import type { LessonTask } from '@/types/learning';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

interface TaskCardProps {
  task: LessonTask;
  position: number;
  total: number;
  selected: number | null;
  seconds: number;
  onSelect: (index: number) => void;
}

function optionClasses(index: number, correct: number, selected: number | null): string {
  if (selected === null) {
    return 'border-white/10 bg-canvas/50 hover:-translate-y-0.5 hover:border-sky-400/50 hover:bg-sky-400/5 hover:shadow-[0_0_22px_-6px_rgba(56,189,248,0.6)]';
  }
  if (index === correct) {
    return 'border-success/60 bg-success/10 text-ink shadow-[0_0_20px_-6px_rgba(110,231,183,0.6)]';
  }
  if (index === selected) {
    return 'border-danger/60 bg-danger/10 text-ink';
  }
  return 'border-white/5 bg-canvas/40 text-silver opacity-60';
}

export function TaskCard({ task, position, total, selected, seconds, onSelect }: TaskCardProps) {
  const answered = selected !== null;
  const isCorrect = selected === task.correct;

  return (
    <section className="glass-card relative overflow-hidden p-5 sm:p-7">
      <div className="glass-edge" />
      {answered && isCorrect ? <CelebrationBurst /> : null}

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-display font-semibold">
            Завдання {position} з {total}
          </span>
          <span className="badge border-violet-400/25 bg-violet-400/10 text-violet-200">
            {LEVEL_LABELS[task.difficulty]}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-canvas/60 px-3 py-1 text-sm tabular-nums text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
          <motion.span
            animate={answered ? { rotate: 0 } : { rotate: [0, -12, 12, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex"
          >
            <Clock className="h-3.5 w-3.5" />
          </motion.span>
          {formatSeconds(seconds)}
        </div>
      </div>

      <p className="relative mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-silver/80">{task.topicTitle}</p>
      <h3 className="relative mt-3 text-lg font-semibold leading-snug sm:text-xl">{task.prompt}</h3>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {task.options.map((option, index) => {
          const isWrongPick = answered && index === selected && !isCorrect;
          return (
            <motion.button
              key={`${task.id}-${index}`}
              type="button"
              disabled={answered}
              onClick={() => onSelect(index)}
              whileTap={answered ? undefined : { scale: 0.97 }}
              animate={isWrongPick ? { x: [0, -10, 10, -7, 7, -3, 0] } : { x: 0 }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              style={{ animationDelay: `${120 + index * 70}ms` }}
              className={`group flex animate-fade-up items-center gap-3 rounded-2xl border p-4 text-left text-sm leading-snug transition-all duration-300 disabled:cursor-default ${optionClasses(index, task.correct, selected)}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-sky-400/20 to-violet-400/10 font-display text-xs font-semibold text-sky-300 transition-all duration-300 group-hover:border-sky-400/40 group-hover:text-sky-200">
                {OPTION_LETTERS[index]}
              </span>
              <span>{option}</span>
            </motion.button>
          );
        })}
      </div>

      {answered ? (
        <div className="mt-6">
          <MentorExplanation
            isCorrect={isCorrect}
            explanation={task.explanation}
            correctAnswer={`${OPTION_LETTERS[task.correct]}. ${task.options[task.correct]}`}
          />
        </div>
      ) : null}
    </section>
  );
}
