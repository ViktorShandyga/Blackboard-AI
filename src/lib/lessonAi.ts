import { requestChatCompletion, type ChatMessage } from '@/lib/openrouter';
import type {
  LessonFocus,
  LessonSession,
  LessonTask,
  Level,
  MaterialSection,
  SubjectContent,
} from '@/types/learning';

const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  easy: 'легкий рівень: базові поняття, прості приклади, короткі формулювання для учня 5-7 класу',
  medium: 'середній рівень: типові шкільні завдання, які потребують застосування знань',
  hard: 'складний рівень: завдання з кількома кроками або глибшим розумінням, але без виходу за межі шкільної програми',
};

const SYSTEM_PROMPT = `Ти - AI-наставник на платформі «Blackboard AI». Пояснюєш шкільні предмети українською мовою простими словами.
Відповідай ЛИШЕ валідним JSON без markdown-обгортки, без пояснень поза JSON.`;

class InvalidLessonError extends Error {}

function buildUserPrompt(subject: SubjectContent, focus: LessonFocus, level: Level, count: number): string {
  const topicLine =
    focus.kind === 'mix'
      ? `Склади ${count} завдань з різних розділів: ${subject.topics.map((t) => t.title).join('; ')}. У полі topicTitle вказуй назву розділу.`
      : focus.kind === 'custom'
        ? `Тема заняття (вільний запит учня): «${focus.query}». Зрозумій, що саме він має на увазі, навіть якщо формулювання нестандартне чи довге. Розглянь саме цю тему або питання; якщо запит занадто широкий, обери найважливіші аспекти. Усі ${count} завдання стосуються лише цієї теми.`
        : `Тема заняття: «${subject.topics.find((t) => t.id === focus.topicId)?.title ?? ''}». Усі ${count} завдання стосуються лише цієї теми.`;

  return `Предмет: ${subject.name}.
${topicLine}
Рівень складності: ${LEVEL_DESCRIPTIONS[level]}.

Поверни JSON такої структури:
{
  "material": [{ "title": "назва розділу або теми", "points": ["3 ключові поняття простою мовою"], "example": "один короткий приклад" }],
  "tasks": [
    {
      "topicTitle": "назва теми",
      "difficulty": "easy|medium|hard",
      "prompt": "текст завдання",
      "options": ["варіант A", "варіант B", "варіант C", "варіант D"],
      "correct": 0,
      "explanation": "пояснення правильної відповіді для учня, 2-3 речення"
    }
  ]
}
Рівно ${count} завдань, рівно 4 варіанти відповіді в кожному, "correct" - індекс правильного варіанта від 0 до 3. Правильна відповідь має бути лише одна.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim() !== '');
}

function parseMaterial(value: unknown): MaterialSection[] {
  if (!Array.isArray(value)) throw new InvalidLessonError('Invalid material');
  return value.map((section) => {
    if (!isRecord(section) || typeof section.title !== 'string' || !isStringArray(section.points) || typeof section.example !== 'string') {
      throw new InvalidLessonError('Invalid material section');
    }
    return { title: section.title, points: section.points, example: section.example };
  });
}

function parseTasks(value: unknown, level: Level, focusTitle: string, count: number): LessonTask[] {
  if (!Array.isArray(value) || value.length !== count) throw new InvalidLessonError('Invalid tasks count');
  return value.map((task, index) => {
    if (
      !isRecord(task) ||
      typeof task.prompt !== 'string' ||
      !isStringArray(task.options) ||
      task.options.length !== 4 ||
      typeof task.correct !== 'number' ||
      !Number.isInteger(task.correct) ||
      task.correct < 0 ||
      task.correct > 3 ||
      typeof task.explanation !== 'string' ||
      task.difficulty !== level
    ) {
      throw new InvalidLessonError('Invalid task');
    }
    return {
      id: `ai-${Date.now()}-${index}`,
      topicTitle: typeof task.topicTitle === 'string' && task.topicTitle ? task.topicTitle : focusTitle,
      difficulty: level,
      prompt: task.prompt,
      options: task.options,
      correct: task.correct,
      explanation: task.explanation,
    };
  });
}

function extractJson(raw: string): unknown {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) throw new InvalidLessonError('No JSON in AI response');
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new InvalidLessonError('Invalid JSON in AI response');
  }
}

export async function generateAiLesson(
  apiKey: string,
  model: string,
  subject: SubjectContent,
  focus: LessonFocus,
  level: Level,
  count: number,
  signal?: AbortSignal,
): Promise<LessonSession> {
  const focusTitle =
    focus.kind === 'mix'
      ? 'Навчальний мікс'
      : focus.kind === 'custom'
        ? focus.query
        : (subject.topics.find((t) => t.id === focus.topicId)?.title ?? subject.name);

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(subject, focus, level, count) },
  ];

  let lastValidationError: InvalidLessonError | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const attemptMessages =
      attempt === 0
        ? messages
        : [
            ...messages,
            {
              role: 'user' as const,
              content: `Попередня відповідь не пройшла перевірку. Сформуй JSON заново: рівно ${count} завдань, і кожне має мати difficulty строго "${level}". Не змінюй ці параметри.`,
            },
          ];
    try {
      const raw = await requestChatCompletion(apiKey, model, attemptMessages, signal);
      const parsed = extractJson(raw);
      if (!isRecord(parsed)) throw new InvalidLessonError('AI response is not an object');
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        focusTitle,
        level,
        source: 'ai',
        material: parseMaterial(parsed.material),
        tasks: parseTasks(parsed.tasks, level, focusTitle, count),
      };
    } catch (error) {
      if (!(error instanceof InvalidLessonError)) throw error;
      lastValidationError = error;
    }
  }
  throw lastValidationError ?? new InvalidLessonError('AI response failed validation');
}
