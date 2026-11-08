import { SUBJECTS } from '@/data/lessons';
import type { SubjectId } from '@/types/learning';

export interface TopicSuggestion {
  subjectId: SubjectId;
  subjectName: string;
  topicId: string;
  title: string;
}

const ALL_TOPICS: TopicSuggestion[] = SUBJECTS.flatMap((subject) =>
  subject.topics.map((topic) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    topicId: topic.id,
    title: topic.title,
  })),
);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function searchTopics(query: string, limit = 6): TopicSuggestion[] {
  const needle = normalize(query);
  if (needle === '') return [];
  return ALL_TOPICS.filter(
    (item) => normalize(item.title).includes(needle) || normalize(item.subjectName).includes(needle),
  ).slice(0, limit);
}
