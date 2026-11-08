export type SubjectId =
  | 'math'
  | 'ukr-history'
  | 'ukr-language'
  | 'ukr-literature'
  | 'english'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'geography'
  | 'informatics'
  | 'world-history'
  | 'civics'
  | 'world-literature'
  | 'astronomy';

export type Level = 'easy' | 'medium' | 'hard';

export const QUESTION_COUNTS = [5, 10, 15, 20, 30] as const;
export type QuestionCount = (typeof QUESTION_COUNTS)[number];

export interface Question {
  id: string;
  difficulty: Level;
  prompt: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
}

export interface Topic {
  id: string;
  title: string;
  points: string[];
  example: string;
  questions: Question[];
}

export interface SubjectContent {
  id: SubjectId;
  name: string;
  description: string;
  topics: Topic[];
}

export type LessonFocus =
  | { kind: 'mix' }
  | { kind: 'topic'; topicId: string }
  | { kind: 'custom'; query: string };

export interface MaterialSection {
  title: string;
  points: string[];
  example: string;
}

export interface LessonTask {
  id: string;
  topicTitle: string;
  difficulty: Level;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LessonSession {
  subjectId: SubjectId;
  subjectName: string;
  focusTitle: string;
  level: Level;
  source: 'ai' | 'local';
  material: MaterialSection[];
  tasks: LessonTask[];
}

export interface TaskResult {
  taskId: string;
  selected: number;
  correct: boolean;
  seconds: number;
}
