import type {
  LessonFocus,
  LessonSession,
  LessonTask,
  Level,
  Question,
  SubjectContent,
  Topic,
} from '@/types/learning';

const LEVEL_RANK: Record<Level, number> = { easy: 0, medium: 1, hard: 2 };

export const LEVEL_LABELS: Record<Level, string> = {
  easy: 'Легкий',
  medium: 'Середній',
  hard: 'Складний',
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleOptions(options: string[], correct: number): { options: string[]; correct: number } {
  const order = shuffle(options.map((_, index) => index));
  return {
    options: order.map((index) => options[index]),
    correct: order.indexOf(correct),
  };
}

export function resolveTopics(subject: SubjectContent, focus: LessonFocus): Topic[] {
  if (focus.kind === 'mix') return subject.topics;
  if (focus.kind === 'custom') return [];
  return subject.topics.filter((topic) => topic.id === focus.topicId);
}

export function buildLocalLesson(
  subject: SubjectContent,
  focus: LessonFocus,
  level: Level,
  count: number,
  previousTaskIds: string[] = [],
): LessonSession | null {
  const topics = resolveTopics(subject, focus);
  if (topics.length === 0) return null;

  const target = LEVEL_RANK[level];
  const seen = new Set(previousTaskIds);

  const rankedByTopic = topics.map((topic) =>
    shuffle(topic.questions).sort((a, b) => {
      const scoreA = Math.abs(LEVEL_RANK[a.difficulty] - target) + (seen.has(a.id) ? 1.5 : 0);
      const scoreB = Math.abs(LEVEL_RANK[b.difficulty] - target) + (seen.has(b.id) ? 1.5 : 0);
      return scoreA - scoreB;
    }).map((question) => ({ topic, question })),
  );

  const picked: { topic: Topic; question: Question }[] = [];
  const topicOrder = shuffle(rankedByTopic.map((_, index) => index));
  for (let round = 0; picked.length < count && round < 4; round += 1) {
    for (const index of topicOrder) {
      const candidate = rankedByTopic[index][round];
      if (candidate && picked.length < count) picked.push(candidate);
    }
  }
  if (picked.length === 0) return null;

  const tasks: LessonTask[] = picked
    .sort((a, b) => LEVEL_RANK[a.question.difficulty] - LEVEL_RANK[b.question.difficulty])
    .map(({ topic, question }) => {
      const shuffled = shuffleOptions(question.options, question.correct);
      return {
        id: question.id,
        topicTitle: topic.title,
        difficulty: question.difficulty,
        prompt: question.prompt,
        options: shuffled.options,
        correct: shuffled.correct,
        explanation: question.explanation,
      };
    });

  const usedTopicIds = new Set(picked.map(({ topic }) => topic.id));
  const material = topics
    .filter((topic) => usedTopicIds.has(topic.id))
    .map((topic) => ({ title: topic.title, points: topic.points, example: topic.example }));

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    focusTitle: focus.kind === 'mix' ? 'Навчальний мікс' : topics[0].title,
    level,
    source: 'local',
    material,
    tasks,
  };
}
