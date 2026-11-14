import { motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import { GraduationCap, Loader2, Play, Shuffle, Sparkles } from 'lucide-react';
import { AiThinking } from '@/components/common/AiThinking';
import { LEVEL_LABELS } from '@/lib/localLesson';
import { QUESTION_COUNTS, type LessonFocus, type Level, type QuestionCount, type SubjectContent } from '@/types/learning';

const LEVELS: Level[] = ['easy', 'medium', 'hard'];

interface LessonSetupProps {
  subject: SubjectContent;
  focus: LessonFocus;
  level: Level;
  questionCount: QuestionCount;
  isLoading: boolean;
  onFocusChange: (focus: LessonFocus) => void;
  onLevelChange: (level: Level) => void;
  onQuestionCountChange: (count: QuestionCount) => void;
  /** Екзаменаційний режим: таймер, без конспекту й підказок, ×2 бали. */
  exam: boolean;
  onExamChange: (exam: boolean) => void;
  onStart: () => void;
  onCustomTopic: (query: string) => void;
}

const CHIP_BASE =
  'relative isolate rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] sm:text-sm';
const CHIP_IDLE = 'border-white/10 bg-canvas/60 text-silver hover:border-sky-400/50 hover:bg-sky-400/[0.06] hover:text-ink';
const CHIP_ACTIVE = 'border-transparent font-semibold text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.9)]';
const PILL_SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const;

export function LessonSetup({
  subject,
  focus,
  level,
  questionCount,
  isLoading,
  onFocusChange,
  onLevelChange,
  onQuestionCountChange,
  exam,
  onExamChange,
  onStart,
  onCustomTopic,
}: LessonSetupProps) {
  const [customQuery, setCustomQuery] = useState('');
  const isMix = focus.kind === 'mix';

  const handleCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = customQuery.trim();
    if (query !== '') onCustomTopic(query);
  };

  const focusOptions: Array<{ key: string; active: boolean; onPick: () => void; label: string; icon?: boolean }> = [
    { key: 'mix', active: isMix, onPick: () => onFocusChange({ kind: 'mix' }), label: 'Навчальний мікс', icon: true },
    ...subject.topics.map((topic) => ({
      key: topic.id,
      active: focus.kind === 'topic' && focus.topicId === topic.id,
      onPick: () => onFocusChange({ kind: 'topic', topicId: topic.id }),
      label: topic.title,
    })),
  ];

  return (
    <section className="glass-card relative animate-fade-up overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl animate-aurora" />
      <div className="pointer-events-none absolute -left-16 top-1/2 h-36 w-36 rounded-full bg-sky-500/15 blur-3xl animate-aurora [animation-delay:-7s]" />
      <div className="glass-edge" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">Обраний предмет</p>
        <h2 className="mt-1.5 text-xl font-semibold">{subject.name}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-silver">{subject.description}</p>
      </div>

      <div className="relative mt-6">
        <p className="text-sm font-medium">Тема заняття</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {focusOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={option.onPick}
              aria-pressed={option.active}
              className={`flex items-center gap-2 ${CHIP_BASE} ${option.active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {option.active ? (
                <motion.span
                  layoutId="focus-pill"
                  transition={PILL_SPRING}
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500"
                />
              ) : null}
              {option.icon ? <Shuffle className="h-3.5 w-3.5" /> : null}
              {option.label}
            </button>
          ))}
        </div>
        {isMix ? (
          <p className="mt-3 text-xs text-silver">Наставник підбере по одному завданню з різних розділів предмета.</p>
        ) : null}
      </div>

      <form onSubmit={handleCustomSubmit} className="relative mt-6 space-y-2">
        <p className="text-sm font-medium">Своя тема</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={customQuery}
            maxLength={200}
            onChange={(event) => setCustomQuery(event.target.value)}
            placeholder="Наприклад: закон Ома для ланцюга з двома резисторами"
            aria-label="Своя тема для навчання"
            className="field min-w-0 flex-1 py-3"
          />
          <button
            type="submit"
            disabled={isLoading || customQuery.trim() === ''}
            className="btn-secondary shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            Вивчити з AI
          </button>
        </div>
        <p className="text-xs text-silver">Потрібен ключ OpenRouter. AI складе матеріал і завдання саме для твого запиту.</p>
      </form>

      <div className="relative mt-6">
        <p className="text-sm font-medium">Рівень складності</p>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-canvas/60 p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]">
          {LEVELS.map((item) => {
            const active = level === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onLevelChange(item)}
                aria-pressed={active}
                className={`relative isolate rounded-xl py-2 text-sm font-medium transition-colors duration-300 ${
                  active ? 'text-white' : 'text-silver hover:text-ink'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="level-pill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500/80 to-violet-500/80 shadow-[0_0_18px_-4px_rgba(139,92,246,0.8)]"
                  />
                ) : null}
                {LEVEL_LABELS[item]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-6">
        <p className="text-sm font-medium">Кількість запитань</p>
        <div className="mt-3 grid grid-cols-5 gap-1 rounded-2xl border border-white/10 bg-canvas/60 p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]">
          {QUESTION_COUNTS.map((item) => {
            const active = questionCount === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onQuestionCountChange(item)}
                aria-pressed={active}
                className={`relative isolate rounded-xl py-2 text-sm font-medium tabular-nums transition-colors duration-300 ${
                  active ? 'text-white' : 'text-silver hover:text-ink'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="count-pill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-sky-500/80 to-indigo-500/80 shadow-[0_0_18px_-4px_rgba(56,189,248,0.8)]"
                  />
                ) : null}
                {item}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-silver">
          Без ключа OpenRouter доступно до 8 завдань на предмет (4 у вибраній темі). Для більших тестів потрібен ключ.
        </p>
      </div>

      {/* Екзаменаційний режим */}
      <button
        type="button"
        onClick={() => onExamChange(!exam)}
        aria-pressed={exam}
        className={`relative mt-6 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
          exam
            ? 'border-danger/45 bg-danger/[0.07] shadow-[0_0_24px_-8px_rgba(244,63,94,0.4)]'
            : 'border-white/10 bg-canvas/60 hover:border-white/20'
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors duration-300 ${
            exam ? 'bg-danger/15 text-rose-200 ring-danger/40' : 'bg-white/[0.06] text-silver ring-white/10'
          }`}
        >
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Екзаменаційний режим</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-silver">
            60 с на завдання, без конспекту, калькулятора й помічника. Подвійні бали.
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`relative h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors duration-300 ${exam ? 'bg-danger/70' : 'bg-white/10'}`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${exam ? 'translate-x-4' : ''}`}
          />
        </span>
      </button>

      {isLoading ? (
        <div className="relative mt-6 animate-fade-up rounded-xl border border-sky-400/20 bg-canvas/60 p-4 text-sky-100">
          <AiThinking />
          <motion.div
            className="mt-3 h-1 overflow-hidden rounded-full bg-panel"
            initial={false}
          >
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-sky-400 to-violet-400"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      ) : null}

      <button type="button" onClick={onStart} disabled={isLoading} className="btn-primary group relative mt-8 w-full">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        {isLoading ? 'AI-наставник готує заняття...' : exam ? 'Розпочати екзамен' : 'Розпочати навчання'}
      </button>
    </section>
  );
}
