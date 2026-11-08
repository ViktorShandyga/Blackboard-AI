import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { getAchievements } from '@/lib/achievements';
import type { Progress } from '@/lib/progressStorage';

interface AchievementsPanelProps {
  progress: Progress;
}

export function AchievementsPanel({ progress }: AchievementsPanelProps) {
  const achievements = getAchievements(progress);
  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  return (
    <section className="glass-card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl animate-aurora" />
      <div className="glass-edge" />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">Твої досягнення</p>
          <h2 className="mt-1 font-display text-lg font-semibold">Колекція бейджів</h2>
        </div>
        <span className="badge border-violet-400/25 bg-violet-400/10 tabular-nums text-violet-200">
          {unlockedCount} з {achievements.length} відкрито
        </span>
      </div>

      <ul className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <motion.li
              key={achievement.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
              whileHover={achievement.unlocked ? { y: -4, scale: 1.03 } : undefined}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${
              achievement.unlocked
                ? 'border-violet-400/25 bg-gradient-to-b from-violet-500/[0.12] to-sky-500/[0.05] shadow-[0_0_28px_-10px_rgba(139,92,246,0.8)]'
                : 'border-white/[0.05] bg-canvas/40'
            }`}
          >
              <span
                className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
                  achievement.unlocked
                    ? 'animate-float bg-gradient-to-br from-sky-400/30 via-indigo-400/20 to-violet-400/30 text-sky-200 ring-violet-400/50 shadow-glow-sky'
                    : 'bg-panel/60 text-silver/50 ring-white/5'
                }`}
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                {achievement.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
              </span>
              <span className={`text-sm font-medium ${achievement.unlocked ? 'text-ink' : 'text-silver'}`}>
                {achievement.title}
              </span>
              <span className="text-xs leading-snug text-silver">{achievement.description}</span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
