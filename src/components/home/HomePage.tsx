import { AchievementsPanel } from '@/components/home/AchievementsPanel';
import { LampIllustration } from '@/components/home/LampIllustration';
import { LessonSetup } from '@/components/home/LessonSetup';
import { SubjectGrid } from '@/components/home/SubjectGrid';
import { TopicSearch } from '@/components/home/TopicSearch';
import { SUBJECTS } from '@/data/lessons';
import type { Progress, SubjectProgress } from '@/lib/progressStorage';
import type { LessonFocus, Level, QuestionCount, SubjectContent, SubjectId } from '@/types/learning';
import { Layers, Sparkles, WifiOff } from 'lucide-react';

interface HomePageProps {
  selectedSubject: SubjectContent | undefined;
  progressBySubject: Partial<Record<SubjectId, SubjectProgress>>;
  progress: Progress;
  focus: LessonFocus;
  level: Level;
  questionCount: QuestionCount;
  isLoading: boolean;
  onSelectSubject: (id: SubjectId) => void;
  onFocusChange: (focus: LessonFocus) => void;
  onLevelChange: (level: Level) => void;
  onQuestionCountChange: (count: QuestionCount) => void;
  onStart: () => void;
  onSelectTopic: (subjectId: SubjectId, topicId: string) => void;
  onCustomTopic: (query: string) => void;
}

export function HomePage({
  selectedSubject,
  progressBySubject,
  progress,
  focus,
  level,
  questionCount,
  isLoading,
  onSelectSubject,
  onFocusChange,
  onLevelChange,
  onQuestionCountChange,
  onStart,
  onSelectTopic,
  onCustomTopic,
}: HomePageProps) {
  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="flex flex-col items-center gap-10 text-center lg:flex-row lg:justify-between lg:gap-6 lg:text-left">
        <div className="max-w-2xl animate-fade-up space-y-5">
          <span className="badge border-sky-400/25 bg-sky-400/[0.08] uppercase tracking-[0.25em] text-sky-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(110,231,183,0.9)]" />
            </span>
            Blackboard AI
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient">Знання без меж.</span>
            <span className="block text-ink">Навчайся у власному темпі</span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-silver sm:text-lg lg:mx-0">
            Обери предмет, розберися зі складними темами та перевір себе за допомогою AI —
            з персональним наставником, що пояснює кожне завдання.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            {[
              { icon: Layers, label: '14 предметів' },
              { icon: Sparkles, label: 'AI-пояснення до кожної відповіді' },
              { icon: WifiOff, label: 'Працює навіть офлайн' },
            ].map((chip) => (
              <span
                key={chip.label}
                className="badge border-white/[0.08] bg-white/[0.04] text-silver shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <chip.icon className="h-3.5 w-3.5 text-sky-300" />
                {chip.label}
              </span>
            ))}
          </div>
        </div>
        {selectedSubject ? null : <LampIllustration />}
      </section>

      <section className={`grid gap-6 ${selectedSubject ? 'lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start' : ''}`}>
        <div className="space-y-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-silver">Оберіть предмет</h2>
          <TopicSearch onSelect={(suggestion) => onSelectTopic(suggestion.subjectId, suggestion.topicId)} />
          <SubjectGrid
            subjects={SUBJECTS}
            selectedId={selectedSubject?.id ?? null}
            progressBySubject={progressBySubject}
            onSelect={onSelectSubject}
          />
        </div>

        {selectedSubject ? (
          <div className="lg:sticky lg:top-24">
            <LessonSetup
              subject={selectedSubject}
              focus={focus}
              level={level}
              questionCount={questionCount}
              isLoading={isLoading}
              onFocusChange={onFocusChange}
              onLevelChange={onLevelChange}
              onQuestionCountChange={onQuestionCountChange}
              onStart={onStart}
              onCustomTopic={onCustomTopic}
            />
          </div>
        ) : null}
      </section>

      <AchievementsPanel progress={progress} />
    </div>
  );
}
