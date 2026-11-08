import {
  Award,
  BookOpenCheck,
  BrainCircuit,
  CalendarCheck,
  CalendarDays,
  Crown,
  Dices,
  Flame,
  Gauge,
  Globe2,
  GraduationCap,
  Hourglass,
  Layers,
  Medal,
  Moon,
  Mountain,
  Repeat,
  Rocket,
  Sparkles,
  Star,
  Sunrise,
  Swords,
  Target,
  Timer,
  Trophy,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  accuracyPercent,
  consecutiveDays,
  maxDailyAnswered,
  type Progress,
} from '@/lib/progressStorage';

export type Rarity = 'bronze' | 'silver' | 'gold';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Візуальний рівень рідкості. */
  rarity: Rarity;
  unlocked: boolean;
}

const RARITY_LABELS: Record<Rarity, string> = {
  bronze: 'Бронзова',
  silver: 'Срібна',
  gold: 'Золота',
};

export function rarityLabel(rarity: Rarity): string {
  return RARITY_LABELS[rarity];
}

export function getAchievements(progress: Progress): Achievement[] {
  const subjectsStarted = Object.values(progress.bySubject).filter((item) => item && item.answered > 0).length;
  const accuracy = accuracyPercent(progress.correct, progress.answered);
  const dayStreak = consecutiveDays(progress.activeDays);

  const definitions: Achievement[] = [
    // ─── Стартові (бронза) ────────────────────────────────────
    {
      id: 'first-lesson',
      title: 'Перший крок',
      description: 'Заверши перше заняття',
      icon: Rocket,
      rarity: 'bronze',
      unlocked: progress.lessonsCompleted >= 1,
    },
    {
      id: 'diligent-10',
      title: 'Старанний учень',
      description: 'Виконай 10 завдань',
      icon: Dices,
      rarity: 'bronze',
      unlocked: progress.answered >= 10,
    },
    {
      id: 'streak-3',
      title: 'На хвилі',
      description: 'Три правильні відповіді поспіль',
      icon: Flame,
      rarity: 'bronze',
      unlocked: progress.bestStreak >= 3,
    },
    {
      id: 'days-3',
      title: 'Планомірність',
      description: 'Займайся 3 дні поспіль',
      icon: CalendarCheck,
      rarity: 'bronze',
      unlocked: dayStreak >= 3,
    },

    // ─── Середні (срібло) ─────────────────────────────────────
    {
      id: 'streak-5',
      title: 'Неспинний',
      description: 'П’ять правильних відповідей поспіль',
      icon: Zap,
      rarity: 'silver',
      unlocked: progress.bestStreak >= 5,
    },
    {
      id: 'points-100',
      title: 'Сотка',
      description: 'Набери 100 балів',
      icon: Star,
      rarity: 'silver',
      unlocked: progress.totalPoints >= 100,
    },
    {
      id: 'sharp-shooter',
      title: 'Снайпер',
      description: 'Точність 90% і більше на 10 відповідях',
      icon: Target,
      rarity: 'silver',
      unlocked: progress.answered >= 10 && accuracy >= 90,
    },
    {
      id: 'explorer',
      title: 'Дослідник',
      description: 'Почни навчання з п’яти предметів',
      icon: Award,
      rarity: 'silver',
      unlocked: subjectsStarted >= 5,
    },
    {
      id: 'diligent-25',
      title: 'Мандрівник знань',
      description: 'Виконай 25 завдань',
      icon: Globe2,
      rarity: 'silver',
      unlocked: progress.answered >= 25,
    },
    {
      id: 'perfect-lesson',
      title: 'Ідеальне заняття',
      description: 'Заверши заняття без жодної помилки',
      icon: Repeat,
      rarity: 'silver',
      unlocked: progress.perfectLessons >= 1,
    },
    {
      id: 'lightning',
      title: 'Блискавка',
      description: 'П’ять правильних відповідей по 15 секунд кожна за одне заняття',
      icon: Gauge,
      rarity: 'silver',
      unlocked: progress.bestQuickRound >= 5,
    },
    {
      id: 'hard-5',
      title: 'На піднесенні',
      description: 'П’ять правильних відповідей на складному рівні',
      icon: Layers,
      rarity: 'silver',
      unlocked: progress.hardCorrect >= 5,
    },
    {
      id: 'time-30',
      title: 'Глибоке занурення',
      description: 'Проведи 30 хвилин за виконанням завдань',
      icon: Hourglass,
      rarity: 'silver',
      unlocked: progress.totalSeconds >= 1800,
    },
    {
      id: 'days-10',
      title: 'Сталевий графік',
      description: 'Займайся протягом 10 окремих днів',
      icon: CalendarDays,
      rarity: 'silver',
      unlocked: progress.activeDays.length >= 10,
    },
    {
      id: 'night-owl',
      title: 'Нічний дослідник',
      description: 'Виконай 10 завдань після 22:00',
      icon: Moon,
      rarity: 'silver',
      unlocked: progress.nightAnswers >= 10,
    },
    {
      id: 'early-bird',
      title: 'Жайворонок',
      description: 'Виконай 5 завдань до 8:00 ранку',
      icon: Sunrise,
      rarity: 'silver',
      unlocked: progress.dawnAnswers >= 5,
    },
    {
      id: 'fast-day',
      title: 'Швидкий розум',
      description: 'Виконай 20 завдань за один день',
      icon: Wind,
      rarity: 'silver',
      unlocked: maxDailyAnswered(progress.dailyAnswered) >= 20,
    },

    // ─── Рідкісні (золото) ────────────────────────────────────
    {
      id: 'diligent-50',
      title: 'Майстер знань',
      description: 'Виконай 50 завдань',
      icon: BookOpenCheck,
      rarity: 'gold',
      unlocked: progress.answered >= 50,
    },
    {
      id: 'streak-10',
      title: 'Незламний розум',
      description: 'Десять правильних відповідей поспіль',
      icon: Swords,
      rarity: 'gold',
      unlocked: progress.bestStreak >= 10,
    },
    {
      id: 'perfect-5',
      title: 'Серія вдосконалень',
      description: 'Заверши 5 занять без жодної помилки',
      icon: Sparkles,
      rarity: 'gold',
      unlocked: progress.perfectLessons >= 5,
    },
    {
      id: 'points-250',
      title: 'Золотий запас',
      description: 'Набери 250 балів',
      icon: Trophy,
      rarity: 'gold',
      unlocked: progress.totalPoints >= 250,
    },
    {
      id: 'hard-20',
      title: 'Ерудит',
      description: 'Двадцять правильних відповідей на складному рівні',
      icon: BrainCircuit,
      rarity: 'gold',
      unlocked: progress.hardCorrect >= 20,
    },
    {
      id: 'days-7',
      title: 'Нічого не забуваю',
      description: 'Займайся 7 днів поспіль',
      icon: Timer,
      rarity: 'gold',
      unlocked: dayStreak >= 7,
    },
    {
      id: 'subjects-10',
      title: 'Енциклопедист',
      description: 'Почни навчання з десяти різних предметів',
      icon: GraduationCap,
      rarity: 'gold',
      unlocked: subjectsStarted >= 10,
    },
    {
      id: 'marathon-120',
      title: 'Марафонець',
      description: 'Проведи 2 години за виконанням завдань',
      icon: Mountain,
      rarity: 'gold',
      unlocked: progress.totalSeconds >= 7200,
    },
    {
      id: 'olympian',
      title: 'Олімпієць',
      description: 'Точність 95% і більше на 30 відповідях',
      icon: Medal,
      rarity: 'gold',
      unlocked: progress.answered >= 30 && accuracy >= 95,
    },
    {
      id: 'diligent-100',
      title: 'Кавказький титан',
      description: 'Виконай 100 завдань',
      icon: GraduationCap,
      rarity: 'gold',
      unlocked: progress.answered >= 100,
    },
    {
      id: 'legend',
      title: 'Легенда',
      description: 'Набери 500 балів',
      icon: Crown,
      rarity: 'gold',
      unlocked: progress.totalPoints >= 500,
    },
    {
      id: 'absolute',
      title: 'Абсолютний чемпіон',
      description: 'Набери 1000 балів, подолавши всі вершини',
      icon: Mountain,
      rarity: 'gold',
      unlocked: progress.totalPoints >= 1000,
    },
  ];

  return definitions;
}
