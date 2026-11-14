import { AnimatePresence, motion } from 'motion/react';
import { AudioLines, Mic, MicOff, Send, Square, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useVoiceTutor, type VoiceStatus } from '@/hooks/useVoiceTutor';
import type { LessonTask, MaterialSection } from '@/types/learning';

interface LessonVoiceOrbProps {
  apiKey: string;
  model: string;
  subjectName: string;
  focusTitle: string;
  material: MaterialSection[];
  /** Завдання, над яким учень працює зараз; оновлюється автоматично. */
  task: LessonTask | undefined;
  onOpenSettings: () => void;
}

const STATUS_DOT: Record<VoiceStatus, string> = {
  idle: 'bg-silver/70',
  listening: 'bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.9)]',
  thinking: 'bg-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.9)]',
  speaking: 'bg-success shadow-[0_0_10px_rgba(110,231,183,0.9)]',
};

const STATUS_LABEL: Record<VoiceStatus, string> = {
  idle: 'Очікування',
  listening: 'Слухаю',
  thinking: 'Думаю',
  speaking: 'Говорю',
};

export function LessonVoiceOrb({ apiKey, model, subjectName, focusTitle, material, task, onOpenSettings }: LessonVoiceOrbProps) {
  const [open, setOpen] = useState(false);
  const tutor = useVoiceTutor(apiKey, model, {
    // Сесійний діалог уроку: без збереження в localStorage, з темою заняття в контексті.
    storageKey: null,
    contextPrompt: () => {
      const lines = [`Предмет: ${subjectName}.`, `Тема заняття: ${focusTitle}.`];
      if (material.length > 0) {
        lines.push(`Конспект заняття: ${material.map((section) => `${section.title}: ${section.points.join('; ')}`).join(' | ')}`);
      }
      if (task) {
        lines.push(
          `Учень зараз працює над завданням з розділу «${task.topicTitle}»: «${task.prompt}».`,
          'ВАЖЛИВО: ніколи не розв\'язуй це конкретне завдання і не називай правильний варіант — лише пояснюй тему, поняття та метод, навідними підказками веди учня до самостійної відповіді.',
        );
      }
      return lines.join('\n');
    },
  });
  const coreRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Колбо «дихає»: реагує на голос у мікрофоні та на мовлення асистента.
  useEffect(() => {
    let raf = 0;
    const tick = (time: number) => {
      const el = coreRef.current;
      if (el) {
        const level =
          tutor.status === 'listening'
            ? tutor.voiceLevelRef.current
            : tutor.status === 'speaking'
              ? 0.5 + 0.25 * Math.abs(Math.sin(time / 260))
              : tutor.status === 'thinking'
                ? 0.35 + 0.1 * Math.sin(time / 300)
                : 0.1;
        el.style.transform = `scale(${(1 + level * 0.35).toFixed(3)})`;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [tutor.status, tutor.voiceLevelRef]);

  // Автопрокрутка діалогу.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [tutor.messages, tutor.interim]);

  const busy = tutor.status === 'thinking' || tutor.status === 'speaking';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input = inputRef.current;
    const text = input?.value ?? '';
    if (!text.trim()) return;
    tutor.sendMessage(text);
    if (input) input.value = '';
  };

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="glass-card relative flex max-h-[70vh] w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden shadow-glass-lg"
          >
            <div className="glass-edge" />
            <div className="relative flex items-start justify-between gap-2 border-b border-white/[0.06] p-4 pb-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                  <AudioLines className="h-3 w-3" />
                  Голосовий помічник
                </p>
                <p className="mt-1 truncate text-xs text-silver">
                  {subjectName} · {focusTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-silver transition-colors hover:bg-white/[0.06] hover:text-ink"
                aria-label="Сховати помічника"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {tutor.error ? (
              <div className="relative mx-4 mt-3 flex items-start gap-2 rounded-xl border border-danger/35 bg-danger/10 p-2.5 text-xs text-rose-200">
                <p className="flex-1 leading-snug">{tutor.error}</p>
                <button
                  type="button"
                  onClick={tutor.dismissError}
                  className="rounded-full p-0.5 text-rose-200/70 hover:text-ink"
                  aria-label="Приховати помилку"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}

            {apiKey ? null : (
              <div className="relative mx-4 mt-3 flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/[0.07] p-2.5 text-xs text-violet-100">
                <p className="flex-1 leading-snug text-silver">Для відповідей потрібен ключ OpenRouter.</p>
                <button type="button" onClick={onOpenSettings} className="btn-primary px-3 py-1.5 text-[10px]">
                  Додати
                </button>
              </div>
            )}

            <div ref={listRef} className="relative flex-1 space-y-2.5 overflow-y-auto p-4">
              {tutor.messages.length === 0 && !tutor.interim ? (
                <p className="py-4 text-center text-xs leading-relaxed text-silver">
                  Спроси про тему заняття — поясню простими словами. Готові відповіді на завдання не підказую.
                </p>
              ) : null}

              {tutor.messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 text-xs leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500/90 to-sky-500/85 text-white'
                        : 'rounded-2xl rounded-bl-sm border border-white/[0.08] bg-panel/70 text-ink/95'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {tutor.interim ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-dashed border-sky-400/25 bg-canvas/40 px-3 py-2 text-xs italic text-silver">
                    {tutor.interim}
                    <span className="ml-1 inline-block h-3 w-[2px] animate-pulse rounded-full bg-sky-400 align-middle" />
                  </div>
                </div>
              ) : null}

              {tutor.status === 'thinking' ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/[0.08] bg-panel/70 px-3 py-2.5">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300"
                        style={{ animationDelay: `${index * 140}ms` }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative border-t border-white/[0.06] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={`badge px-2 py-0.5 text-[10px] ${tutor.status === 'idle' ? 'border-white/[0.08] bg-white/[0.04] text-silver' : 'border-sky-400/30 bg-sky-400/10 text-sky-200'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[tutor.status]}`} />
                  {STATUS_LABEL[tutor.status]}
                </span>
                <div className="flex items-center gap-1.5">
                  {tutor.micEnabled ? (
                    <button
                      type="button"
                      onClick={tutor.stopMic}
                      className="icon-button h-8 w-8 border-sky-400/40 text-sky-200"
                      aria-label="Вимкнути мікрофон"
                    >
                      <MicOff className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={tutor.startMic}
                      disabled={busy}
                      className="icon-button h-8 w-8"
                      aria-label="Увімкнути мікрофон"
                    >
                      <Mic className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={tutor.stopSpeaking}
                    disabled={!busy}
                    className="icon-button h-8 w-8"
                    aria-label="Зупинити відповідь"
                  >
                    <Square className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={tutor.clearHistory}
                    className="icon-button h-8 w-8"
                    aria-label="Очистити діалог"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="field flex-1 px-3 py-2 text-xs"
                  placeholder="Запитай про тему…"
                  autoComplete="off"
                  disabled={tutor.status === 'speaking'}
                />
                <button type="submit" className="icon-button h-9 w-9 shrink-0 border-sky-400/40 text-sky-300" aria-label="Надіслати">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Літаюче коло */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {tutor.status !== 'idle' && !open ? (
            <motion.span
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="badge border-white/[0.08] bg-card/85 text-silver backdrop-blur-xl"
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[tutor.status]}`} />
              {STATUS_LABEL[tutor.status]}
            </motion.span>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? 'Сховати голосового помічника' : 'Відкрити голосового помічника'}
          aria-expanded={open}
          className="relative h-14 w-14 rounded-full shadow-glow-violet transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <span
            ref={coreRef}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 shadow-[0_10px_36px_-8px_rgba(99,102,241,0.9),inset_0_2px_8px_rgba(255,255,255,0.3)]"
          >
            <AudioLines className="h-5 w-5 text-white" />
          </span>
          <span
            aria-hidden="true"
            className={`absolute -inset-1 rounded-full border border-sky-400/40 ${tutor.status === 'listening' ? 'animate-ping' : ''}`}
          />
          <span
            aria-hidden="true"
            className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-canvas ${STATUS_DOT[tutor.status]}`}
          />
        </button>
      </div>
    </div>
  );
}
