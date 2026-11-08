import type { Level, SubjectId, TaskResult } from '@/types/learning';

const PROGRESS_STORAGE_KEY = 'blackboard-ai:progress';

export interface SubjectProgress {
  answered: number;
  correct: number;
}

export interface Progress {
  totalPoints: number;
  lessonsCompleted: number;
  answered: number;
  correct: number;
  bestStreak: number;
  bySubject: Partial<Record<SubjectId, SubjectProgress>>;
  /** Achievement id -> ISO date stamp when it was first unlocked. */
  unlockedAchievements: Record<string, string>;
  /** 'YYYY-MM-DD' days on which at least one task was answered. */
  activeDays: string[];
  /** 'YYYY-MM-DD' -> number of tasks answered that day. */
  dailyAnswered: Record<string, number>;
  /** Lessons finished with zero mistakes. */
  perfectLessons: number;
  /** Total time spent answering tasks, in seconds. */
  totalSeconds: number;
  /** Correct answers on the hard level. */
  hardCorrect: number;
  /** Best count of correct answers each answered in 15 seconds or less, within one lesson. */
  bestQuickRound: number;
  /** Tasks answered after 22:00 or before 05:00. */
  nightAnswers: number;
  /** Tasks answered between 05:00 and 08:00. */
  dawnAnswers: number;
}

export const POINTS_PER_CORRECT = 10;
const DAY_MS = 86_400_000;

export const EMPTY_PROGRESS: Progress = {
  totalPoints: 0,
  lessonsCompleted: 0,
  answered: 0,
  correct: 0,
  bestStreak: 0,
  bySubject: {},
  unlockedAchievements: {},
  activeDays: [],
  dailyAnswered: {},
  perfectLessons: 0,
  totalSeconds: 0,
  hardCorrect: 0,
  bestQuickRound: 0,
  nightAnswers: 0,
  dawnAnswers: 0,
};

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { ...EMPTY_PROGRESS, ...parsed, bySubject: parsed.bySubject ?? {} };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: Progress): void {
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export interface TaskTimingInput {
  id: string;
  difficulty: Level;
}

export function recordLesson(
  progress: Progress,
  subjectId: SubjectId,
  results: TaskResult[],
  tasks: TaskTimingInput[] = [],
): Progress {
  const correct = results.filter((r) => r.correct).length;
  const subject = progress.bySubject[subjectId] ?? { answered: 0, correct: 0 };
  const today = dateKey();
  const hour = new Date().getHours();

  const hardTasks = new Set(tasks.filter((task) => task.difficulty === 'hard').map((task) => task.id));
  const quickRound = results.filter((result) => result.correct && result.seconds <= 15).length;

  const nextDailyAnswered = { ...progress.dailyAnswered };
  nextDailyAnswered[today] = (nextDailyAnswered[today] ?? 0) + results.length;

  const nextActiveDays = progress.activeDays.includes(today)
    ? progress.activeDays
    : [...progress.activeDays, today].sort();

  return {
    totalPoints: progress.totalPoints + correct * POINTS_PER_CORRECT,
    lessonsCompleted: progress.lessonsCompleted + 1,
    answered: progress.answered + results.length,
    correct: progress.correct + correct,
    bestStreak: Math.max(progress.bestStreak, longestStreak(results)),
    bySubject: {
      ...progress.bySubject,
      [subjectId]: {
        answered: subject.answered + results.length,
        correct: subject.correct + correct,
      },
    },
    unlockedAchievements: progress.unlockedAchievements,
    activeDays: results.length > 0 ? nextActiveDays : progress.activeDays,
    dailyAnswered: nextDailyAnswered,
    perfectLessons:
      results.length > 0 && results.every((result) => result.correct)
        ? progress.perfectLessons + 1
        : progress.perfectLessons,
    totalSeconds: progress.totalSeconds + results.reduce((sum, result) => sum + result.seconds, 0),
    hardCorrect:
      progress.hardCorrect + results.filter((result) => result.correct && hardTasks.has(result.taskId)).length,
    bestQuickRound: Math.max(progress.bestQuickRound, quickRound),
    nightAnswers: progress.nightAnswers + (hour >= 22 || hour < 5 ? results.length : 0),
    dawnAnswers: progress.dawnAnswers + (hour >= 5 && hour < 8 ? results.length : 0),
  };
}

/** Local calendar day as 'YYYY-MM-DD'. */
export function dateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Longest run of consecutive study days ending today or yesterday. */
export function consecutiveDays(activeDays: string[]): number {
  if (activeDays.length === 0) return 0;
  const days = new Set(activeDays);
  const todayStart = new Date().setHours(0, 0, 0, 0);
  let cursorMs = days.has(dateKey(new Date(todayStart))) ? todayStart : todayStart - DAY_MS;
  let streak = 0;
  while (days.has(dateKey(new Date(cursorMs)))) {
    streak += 1;
    cursorMs -= DAY_MS;
  }
  return streak;
}

export function maxDailyAnswered(dailyAnswered: Record<string, number>): number {
  return Object.values(dailyAnswered).reduce((best, count) => Math.max(best, count), 0);
}

export function longestStreak(results: TaskResult[]): number {
  let best = 0;
  let run = 0;
  for (const result of results) {
    run = result.correct ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

export function accuracyPercent(correct: number, answered: number): number {
  return answered === 0 ? 0 : Math.round((correct / answered) * 100);
}
