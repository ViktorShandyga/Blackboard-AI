import { Award, Crown, Flame, Rocket, Star, Target, Zap, type LucideIcon } from 'lucide-react';
import { accuracyPercent, type Progress } from '@/lib/progressStorage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
}

export function getAchievements(progress: Progress): Achievement[] {
  const subjectsStarted = Object.values(progress.bySubject).filter((item) => item && item.answered > 0).length;
  const accuracy = accuracyPercent(progress.correct, progress.answered);

  const definitions: Achievement[] = [
    {
      id: 'first-lesson',
      title: 'Перший крок',
      description: 'Заверши перше заняття',
      icon: Rocket,
      unlocked: progress.lessonsCompleted >= 1,
    },
    {
      id: 'streak-3',
      title: 'На хвилі',
      description: 'Три правильні відповіді поспіль',
      icon: Flame,
      unlocked: progress.bestStreak >= 3,
    },
    {
      id: 'streak-5',
      title: 'Неспинний',
      description: 'П’ять правильних відповідей поспіль',
      icon: Zap,
      unlocked: progress.bestStreak >= 5,
    },
    {
      id: 'points-100',
      title: 'Сотка',
      description: 'Набери 100 балів',
      icon: Star,
      unlocked: progress.totalPoints >= 100,
    },
    {
      id: 'sharp-shooter',
      title: 'Снайпер',
      description: 'Точність 90% і більше на 10 відповідях',
      icon: Target,
      unlocked: progress.answered >= 10 && accuracy >= 90,
    },
    {
      id: 'explorer',
      title: 'Дослідник',
      description: 'Почни навчання з п’яти предметів',
      icon: Award,
      unlocked: subjectsStarted >= 5,
    },
    {
      id: 'legend',
      title: 'Легенда',
      description: 'Набери 500 балів',
      icon: Crown,
      unlocked: progress.totalPoints >= 500,
    },
  ];

  return definitions;
}
