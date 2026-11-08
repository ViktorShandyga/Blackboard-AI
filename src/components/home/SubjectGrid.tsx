import {
  Atom,
  BookMarked,
  Calculator,
  Dna,
  FlaskConical,
  Feather,
  Landmark,
  Languages,
  Map,
  Monitor,
  PenLine,
  Scale,
  Scroll,
  Telescope,
  type LucideIcon,
} from 'lucide-react';
import type { SubjectContent, SubjectId } from '@/types/learning';
import type { SubjectProgress } from '@/lib/progressStorage';
import { accuracyPercent } from '@/lib/progressStorage';
import { TiltCard } from '@/components/common/TiltCard';

type Tone = 'sky' | 'violet' | 'teal';

const TONE_CLASSES: Record<Tone, { icon: string; active: string; bar: string; glow: string }> = {
  sky: {
    icon: 'from-sky-400/50 via-sky-500/20 to-indigo-600/10 text-sky-200 ring-sky-400/50',
    active: 'text-sky-300',
    bar: 'from-sky-400 to-indigo-400',
    glow: 'bg-sky-400/40',
  },
  violet: {
    icon: 'from-violet-400/50 via-violet-500/20 to-indigo-600/10 text-violet-200 ring-violet-400/50',
    active: 'text-violet-300',
    bar: 'from-violet-400 to-indigo-400',
    glow: 'bg-violet-400/40',
  },
  teal: {
    icon: 'from-teal-400/50 via-teal-500/20 to-sky-600/10 text-teal-200 ring-teal-400/50',
    active: 'text-teal-300',
    bar: 'from-teal-400 to-sky-400',
    glow: 'bg-teal-400/40',
  },
};

const SUBJECT_STYLES: Record<SubjectId, { icon: LucideIcon; tone: Tone }> = {
  math: { icon: Calculator, tone: 'sky' },
  'ukr-history': { icon: Landmark, tone: 'violet' },
  'ukr-language': { icon: PenLine, tone: 'teal' },
  'ukr-literature': { icon: BookMarked, tone: 'sky' },
  english: { icon: Languages, tone: 'violet' },
  physics: { icon: Atom, tone: 'teal' },
  chemistry: { icon: FlaskConical, tone: 'sky' },
  biology: { icon: Dna, tone: 'violet' },
  geography: { icon: Map, tone: 'teal' },
  informatics: { icon: Monitor, tone: 'sky' },
  'world-history': { icon: Scroll, tone: 'violet' },
  civics: { icon: Scale, tone: 'teal' },
  'world-literature': { icon: Feather, tone: 'sky' },
  astronomy: { icon: Telescope, tone: 'violet' },
};

interface SubjectGridProps {
  subjects: SubjectContent[];
  selectedId: SubjectId | null;
  progressBySubject: Partial<Record<SubjectId, SubjectProgress>>;
  onSelect: (id: SubjectId) => void;
}

export function SubjectGrid({ subjects, selectedId, progressBySubject, onSelect }: SubjectGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {subjects.map((subject, index) => {
        const { icon: Icon, tone } = SUBJECT_STYLES[subject.id];
        const toneClasses = TONE_CLASSES[tone];
        const progress = progressBySubject[subject.id];
        const mastery = progress ? accuracyPercent(progress.correct, progress.answered) : null;
        const isSelected = subject.id === selectedId;

        return (
          <TiltCard key={subject.id}>
            <button
              type="button"
              onClick={() => onSelect(subject.id)}
              aria-pressed={isSelected}
              style={{ animationDelay: `${index * 25}ms` }}
              className={`glass-card group relative flex h-full w-full animate-fade-up flex-col gap-3.5 overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:shadow-[0_20px_50px_-16px_rgba(99,102,241,0.45)] active:scale-[0.98] ${
                isSelected
                  ? 'border-sky-400/50 bg-sky-400/[0.06] shadow-[0_0_36px_-8px_rgba(56,189,248,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : ''
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-700 ${toneClasses.glow} ${
                  isSelected ? 'opacity-100' : 'opacity-30 group-hover:opacity-90'
                }`}
              />
              <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${toneClasses.icon}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="relative font-display text-sm font-semibold leading-snug text-ink">{subject.name}</span>
              {mastery !== null ? (
                <span className="relative mt-auto flex flex-col gap-1.5">
                  <span className="flex items-center justify-between text-[11px] text-silver">
                    <span className="uppercase tracking-wider">Засвоєння</span>
                    <span className={`tabular-nums font-semibold ${toneClasses.active}`}>{mastery}%</span>
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-canvas/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                    <span
                      className={`block h-full rounded-full bg-gradient-to-r ${toneClasses.bar} shadow-[0_0_12px_rgba(99,102,241,0.7)] transition-all duration-700`}
                      style={{ width: `${mastery}%` }}
                    />
                  </span>
                </span>
              ) : (
                <span className="relative mt-auto text-[11px] uppercase tracking-wider text-silver/70">Ще не розпочато</span>
              )}
            </button>
          </TiltCard>
        );
      })}
    </div>
  );
}
