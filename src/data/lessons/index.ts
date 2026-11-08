import { astronomy } from '@/data/lessons/astronomy';
import { biology } from '@/data/lessons/biology';
import { chemistry } from '@/data/lessons/chemistry';
import { civics } from '@/data/lessons/civics';
import { english } from '@/data/lessons/english';
import { geography } from '@/data/lessons/geography';
import { informatics } from '@/data/lessons/informatics';
import { math } from '@/data/lessons/math';
import { physics } from '@/data/lessons/physics';
import { ukrHistory } from '@/data/lessons/ukr-history';
import { ukrLanguage } from '@/data/lessons/ukr-language';
import { ukrLiterature } from '@/data/lessons/ukr-literature';
import { worldHistory } from '@/data/lessons/world-history';
import { worldLiterature } from '@/data/lessons/world-literature';
import type { SubjectContent, SubjectId } from '@/types/learning';

export const SUBJECTS: SubjectContent[] = [
  math,
  ukrHistory,
  ukrLanguage,
  ukrLiterature,
  english,
  physics,
  chemistry,
  biology,
  geography,
  informatics,
  worldHistory,
  civics,
  worldLiterature,
  astronomy,
];

export function getSubject(id: SubjectId): SubjectContent | undefined {
  return SUBJECTS.find((subject) => subject.id === id);
}
