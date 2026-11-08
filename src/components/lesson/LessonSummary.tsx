import { motion } from 'motion/react';
import { CheckCircle2, RotateCcw, Trophy, XCircle, Target, Layers } from 'lucide-react';
import { CountUp } from '@/components/common/CountUp';
import { AiCompanion } from '@/components/lesson/AiCompanion';
import { accuracyPercent, POINTS_PER_CORRECT } from '@/lib/progressStorage';
import { masteryLabel } from '@/lib/format';
import type { LessonSession, TaskResult } from '@/types/learning';

interface LessonSummaryProps {
  session: LessonSession;
  results: TaskResult[];
  isLoading: boolean;
  onRetry: () => void;
  onChooseAnother: () => void;
}

function summaryHeadline(accuracy: number): string {
  if (accuracy >= 90) return 'Оце рівень!';
  if (accuracy >= 60) return 'Файний результат!';
  return 'Не здавайся, ти вже на шляху';
}

export function LessonSummary({ session, results, isLoading, onRetry, onChooseAnother }: LessonSummaryProps) {
  const correctCount = results.filter((result) => result.correct).length;
  const accuracy = accuracyPercent(correctCount, results.length);
  const points = correctCount * POINTS_PER_CORRECT;

  const stats = [
    { icon: Target, label: 'Точність', value: accuracy, suffix: '%', tone: 'text-sky-300' },
    { icon: Trophy, label: 'Отримано балів', value: points, suffix: '', tone: 'text-violet-300' },
    { icon: Layers, label: 'Правильних', value: correctCount, suffix: ` з ${results.length}`, tone: 'text-teal-300' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="glass-card relative overflow-hidden p-6 text-center sm:p-8">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-silver">
            {session.subjectName} · {session.focusTitle}
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-2xl font-semibold sm:text-3xl"
          >
            {summaryHeadline(accuracy)}
          </motion.h2>
          <p className="mt-2 text-sm text-sky-300">{masteryLabel(accuracy)} засвоєння теми</p>

          <div className="relative mx-auto mt-6 h-3 max-w-md overflow-hidden rounded-full bg-canvas/80">
            <motion.div
              className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-sky-400 via-sky-300 to-violet-400 shadow-[0_0_18px_rgba(56,189,248,0.7)]"
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <span className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.1, duration: 0.45, ease: 'easeOut' }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-white/[0.08] bg-canvas/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-glow-sky"
              >
                <stat.icon className={`mx-auto h-4 w-4 ${stat.tone}`} />
                <p className="mt-2.5 font-display text-2xl font-bold tabular-nums">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-silver">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-3 p-5 sm:p-6">
        <h3 className="text-sm font-medium">Огляд завдань</h3>
        <ul className="divide-y divide-white/5">
          {session.tasks.map((task, index) => {
            const result = results[index];
            const isCorrect = result?.correct ?? false;
            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.35 }}
                className="flex items-start gap-3 py-3"
              >
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                )}
                <span className="text-sm leading-relaxed text-ink/90">{task.prompt}</span>
              </motion.li>
            );
          })}
        </ul>
      </section>

      <AiCompanion
        message={accuracy >= 90 ? 'Ти розніс це заняття! Повторимо з новими питаннями?' : 'Гарна робота. Новий раунд добре закріпить матеріал!'}
      />

      <div className="flex animate-fade-up flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={onRetry} disabled={isLoading} className="btn-primary">
          <RotateCcw className="h-4 w-4" />
          Пройти ще раз з новими питаннями
        </button>
        <button type="button" onClick={onChooseAnother} className="btn-secondary">
          Обрати іншу тему
        </button>
      </div>
    </div>
  );
}
