import {
  Crosshair,
  Dumbbell,
  Globe2,
  ListChecks,
  Shuffle,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { dateKey, type Progress } from '@/lib/progressStorage';

export interface DailyQuestState {
  date: string;
  ids: string[];
  rewardsClaimed: string[];
}

interface DailyQuestDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  target: number;
  /** Додаткові бали за виконання. */
  reward: number;
  value: (progress: Progress) => number;
}

const QUEST_POOL: DailyQuestDefinition[] = [
  {
    id: 'today-answered-3',
    title: 'Перші вправи',
    description: 'Виконай 3 навчальні завдання',
    icon: ListChecks,
    target: 3,
    reward: 10,
    value: metricAnswered,
  },
  {
    id: 'today-correct-5',
    title: 'Влучність',
    description: 'Дай 5 правильних відповідей',
    icon: Crosshair,
    target: 5,
    reward: 12,
    value: metricCorrect,
  },
  {
    id: 'today-subjects-2',
    title: 'Два світи',
    description: 'Потренуйся з двох різних предметів',
    icon: Shuffle,
    target: 2,
    reward: 15,
    value: metricSubjects,
  },
  {
    id: 'today-correct-10',
    title: 'Снайпер дня',
    description: 'Дай 10 правильних відповідей',
    icon: Target,
    target: 10,
    reward: 20,
    value: metricCorrect,
  },
  {
    id: 'today-answered-20',
    title: 'Розминка',
    description: 'Виконай 20 завдань за день',
    icon: Dumbbell,
    target: 20,
    reward: 25,
    value: metricAnswered,
  },
  {
    id: 'today-subjects-3',
    title: 'Поліглот',
    description: 'Потренуйся з трьох різних предметів',
    icon: Globe2,
    target: 3,
    reward: 25,
    value: metricSubjects,
  },
];

function metricAnswered(progress: Progress): number {
  return progress.dailyAnswered[dateKey()] ?? 0;
}

function metricCorrect(progress: Progress): number {
  return progress.dailyCorrect[dateKey()] ?? 0;
}

function metricSubjects(progress: Progress): number {
  return progress.dailySubjects[dateKey()]?.length ?? 0;
}

function hashString(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — стабільний генератор, щоб обрані завдання не «стрибали» між відкриттями сторінки. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const DAILY_QUEST_COUNT = 3;

/** Детерміністично обирає 3 завдання для конкретної календарної дати. */
export function selectDailyQuestIds(date: string): string[] {
  const random = seededRandom(hashString(date));
  const pool = [...QUEST_POOL];
  const picked: string[] = [];
  while (picked.length < DAILY_QUEST_COUNT && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    const [chosen] = pool.splice(index, 1);
    picked.push(chosen.id);
  }
  return picked;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  target: number;
  reward: number;
  value: number;
  percent: number;
  completed: boolean;
  claimed: boolean;
}

function resolveState(progress: Progress): DailyQuestState {
  const today = dateKey();
  if (progress.dailyQuests?.date === today) return progress.dailyQuests;
  return { date: today, ids: selectDailyQuestIds(today), rewardsClaimed: [] };
}

export function getDailyQuests(progress: Progress): DailyQuest[] {
  const state = resolveState(progress);
  return state.ids
    .map((id) => QUEST_POOL.find((quest) => quest.id === id))
    .filter((quest): quest is DailyQuestDefinition => Boolean(quest))
    .map((quest) => {
      const value = Math.min(quest.value(progress), quest.target);
      const percent = Math.min(100, Math.round((value / quest.target) * 100));
      const completed = value >= quest.target;
      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        icon: quest.icon,
        target: quest.target,
        reward: quest.reward,
        value,
        percent,
        completed,
        claimed: state.rewardsClaimed.includes(quest.id),
      };
    });
}

export interface DailyQuestRewardResult {
  progress: Progress;
  /** Завдання, які щойно досягли цілі та отримали нагороду. */
  completed: DailyQuest[];
}

/** Зараховує бонусні бали за вперше виконані завдання дня. Викликається після оновлення прогресу. */
export function applyDailyQuestRewards(progress: Progress): DailyQuestRewardResult {
  const state = resolveState(progress);
  const completed = state.ids
    .map((id) => QUEST_POOL.find((quest) => quest.id === id))
    .filter((quest): quest is DailyQuestDefinition => Boolean(quest))
    .filter((quest) => quest.value(progress) >= quest.target && !state.rewardsClaimed.includes(quest.id))
    .map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      icon: quest.icon,
      target: quest.target,
      reward: quest.reward,
      value: quest.target,
      percent: 100,
      completed: true,
      claimed: false,
    }));

  if (completed.length === 0) return { progress, completed: [] };

  const bonus = completed.reduce((sum, quest) => sum + quest.reward, 0);
  const next: Progress = {
    ...progress,
    totalPoints: progress.totalPoints + bonus,
    dailyQuests: {
      ...state,
      rewardsClaimed: [...state.rewardsClaimed, ...completed.map((quest) => quest.id)],
    },
  };
  return { progress: next, completed };
}

/** Найближча кількість хвилин до півночі (оновлення списку завдань). */
export function minutesUntilMidnight(now: Date = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.round((midnight.getTime() - now.getTime()) / 60_000));
}
