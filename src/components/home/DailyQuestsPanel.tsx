import { motion } from 'motion/react';
import { CalendarClock, CheckCircle2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDailyQuests, minutesUntilMidnight } from '@/lib/dailyQuests';
import type { Progress } from '@/lib/progressStorage';

interface DailyQuestsPanelProps {
  progress: Progress;
}

function formatResetCountdown(totalMinutes: number): string {
  if (totalMinutes <= 0) return 'зараз';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} хв`;
  return `${hours} год ${minutes} хв`;
}

export function DailyQuestsPanel({ progress }: DailyQuestsPanelProps) {
  const quests = getDailyQuests(progress);
  const [minutesLeft, setMinutesLeft] = useState(() => minutesUntilMidnight());

  useEffect(() => {
    const id = window.setInterval(() => setMinutesLeft(minutesUntilMidnight()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const completedCount = quests.filter((quest) => quest.claimed).length;

  return (
    <section className="glass-card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl animate-aurora" />
      <div className="glass-edge" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">
            <Sparkles className="h-3 w-3" />
            Щоденні завдання
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold">Цілі на сьогодні</h2>
        </div>
        <span className="badge border-white/[0.08] bg-white/[0.04] tabular-nums text-silver">
          <CalendarClock className="h-3 w-3" />
          {completedCount}/{quests.length} виконано · оновлення через {formatResetCountdown(minutesLeft)}
        </span>
      </div>

      <ul className="relative mt-5 grid gap-3 sm:grid-cols-3">
        {quests.map((quest, index) => {
          const Icon = quest.icon;
          const done = quest.completed;
          return (
            <motion.li
              key={quest.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
              className={`relative flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                done
                  ? 'border-success/25 bg-success/[0.05] shadow-[0_0_24px_-10px_rgba(110,231,183,0.6)]'
                  : 'border-white/[0.07] bg-canvas/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors duration-300 ${
                    done
                      ? 'bg-gradient-to-br from-success/30 to-teal-400/10 text-success ring-success/40'
                      : 'bg-gradient-to-br from-sky-400/25 to-violet-400/15 text-sky-200 ring-sky-400/35'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold leading-tight">{quest.title}</p>
                  <p className="mt-1 text-xs leading-snug text-silver">{quest.description}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="flex items-center justify-between text-xs">
                  <span className="tabular-nums text-silver">
                    {quest.value}/{quest.target}
                  </span>
                  {done ? (
                    <span className="badge border-success/40 bg-success/10 tabular-nums text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      +{quest.reward} балів
                    </span>
                  ) : (
                    <span className="badge border-violet-400/25 bg-violet-400/10 tabular-nums text-violet-200">
                      +{quest.reward} балів
                    </span>
                  )}
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-canvas/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                  <motion.span
                    className={`block h-full rounded-full transition-all duration-700 ${
                      done
                        ? 'bg-gradient-to-r from-success/80 to-teal-400 shadow-[0_0_12px_rgba(110,231,183,0.7)]'
                        : 'bg-gradient-to-r from-sky-400 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                    }`}
                    initial={false}
                    animate={{ width: `${quest.percent}%` }}
                  />
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
