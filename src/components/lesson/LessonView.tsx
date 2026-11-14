import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Bot, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { AiCompanion } from '@/components/lesson/AiCompanion';
import { CalculatorGate } from '@/components/lesson/CalculatorGate';
import { LessonVoiceOrb } from '@/components/lesson/LessonVoiceOrb';
import { LessonProgress } from '@/components/lesson/LessonProgress';
import { MaterialCard } from '@/components/lesson/MaterialCard';
import { StreakBadge } from '@/components/lesson/StreakBadge';
import { TaskCard } from '@/components/lesson/TaskCard';
import { useElapsedSeconds } from '@/hooks/useElapsedSeconds';
import type { LessonSession, TaskResult } from '@/types/learning';

interface LessonViewProps {
  session: LessonSession;
  onExit: () => void;
  onFinish: (results: TaskResult[]) => void;
  /** Опційний XP-калькулятор (math/physics): передається з App. */
  calculator?: {
    totalPoints: number;
    onActivate: () => boolean;
  };
  /** Літаючий голосовий помічник: доступний у будь-якому занятті. */
  voice?: {
    apiKey: string;
    model: string;
    onOpenSettings: () => void;
  };
}

function trailingStreak(results: TaskResult[]): number {
  let run = 0;
  for (let index = results.length - 1; index >= 0 && results[index].correct; index -= 1) {
    run += 1;
  }
  return run;
}

function companionMessage(lastResult: TaskResult | undefined, streak: number): string {
  if (!lastResult) {
    return streak >= 3 ? `Серія ${streak}! Так тримати!` : 'Читай конспект і вперед. Я поруч!';
  }
  if (!lastResult.correct) return 'Нічого страшного, розберемо це разом!';
  return streak >= 3 ? `Оце рівень! Серія ${streak} поспіль.` : 'Ти розніс це завдання!';
}

export function LessonView({ session, onExit, onFinish, calculator, voice }: LessonViewProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<TaskResult[]>([]);
  // Замок відкривається один раз на заняття: далі кнопка активації одразу на місці.
  const [calcUnlocked, setCalcUnlocked] = useState(false);

  const task = session.tasks[index];
  const total = session.tasks.length;
  const isLast = index === total - 1;
  const answered = selected !== null;
  const seconds = useElapsedSeconds(task?.id ?? 'empty-lesson', !answered && task !== undefined);
  const streak = trailingStreak(results);
  const lastResult = results[results.length - 1];

  if (!task) {
    return (
      <section className="glass-card mx-auto max-w-xl space-y-4 p-6 text-center sm:p-8">
        <h1 className="text-xl font-semibold">Не вдалося відкрити завдання</h1>
        <p className="text-sm leading-relaxed text-silver">
          Для цього заняття не знайдено запитань. Поверніться назад і спробуйте іншу тему.
        </p>
        <button type="button" onClick={onExit} className="btn-primary">
          Повернутися до вибору предмета
        </button>
      </section>
    );
  }

  const handleSelect = (option: number) => {
    if (answered) return;
    setSelected(option);
    setResults((previous) => [
      ...previous,
      { taskId: task.id, selected: option, correct: option === task.correct, seconds },
    ]);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish(results);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] py-1.5 pl-2 pr-4 text-sm text-silver backdrop-blur-md transition-all duration-300 hover:-translate-x-0.5 hover:border-sky-400/40 hover:text-sky-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Завершити заняття
          </button>
          <div className="flex items-center gap-2">
            <StreakBadge streak={streak} />
            <span className="badge border-sky-400/25 bg-sky-400/[0.08] text-sky-200">
              {session.source === 'ai' ? <Bot className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {session.source === 'ai' ? 'AI-наставник' : 'Автономний режим'}
            </span>
          </div>
        </div>

        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-silver/80">
          {session.subjectName} · {session.focusTitle}
        </p>
        <LessonProgress total={total} current={index} results={results} />
        <AiCompanion message={companionMessage(answered ? lastResult : undefined, streak)} />
      </div>

      <MaterialCard sections={session.material} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={task.id}
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -48 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <TaskCard
            task={task}
            position={index + 1}
            total={total}
            selected={selected}
            seconds={seconds}
            onSelect={handleSelect}
          />
        </motion.div>
      </AnimatePresence>

      {answered ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex justify-end"
        >
          <button type="button" onClick={handleNext} className="btn-primary group">
            {isLast ? 'Переглянути результати' : 'Наступне завдання'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      ) : null}

      {calculator && (calcUnlocked || seconds >= 15) ? (
        // Замок + 15 с — лише на першому завданні заняття; далі кнопка одразу.
        // Ключ = id завдання: XP-активація скидається на кожному новому завданні.
        <CalculatorGate
          key={task.id}
          totalPoints={calculator.totalPoints}
          onActivate={calculator.onActivate}
          locked={!calcUnlocked}
          onUnlocked={() => setCalcUnlocked(true)}
        />
      ) : null}

      {voice ? (
        <LessonVoiceOrb
          apiKey={voice.apiKey}
          model={voice.model}
          subjectName={session.subjectName}
          focusTitle={session.focusTitle}
          material={session.material}
          task={task}
          onOpenSettings={voice.onOpenSettings}
        />
      ) : null}
    </div>
  );
}
