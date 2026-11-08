import type { SubjectId, TaskResult } from '@/types/learning';

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
}

export const POINTS_PER_CORRECT = 10;

export const EMPTY_PROGRESS: Progress = {
  totalPoints: 0,
  lessonsCompleted: 0,
  answered: 0,
  correct: 0,
  bestStreak: 0,
  bySubject: {},
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

export function recordLesson(
  progress: Progress,
  subjectId: SubjectId,
  results: TaskResult[],
): Progress {
  const correct = results.filter((r) => r.correct).length;
  const subject = progress.bySubject[subjectId] ?? { answered: 0, correct: 0 };

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
  };
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
