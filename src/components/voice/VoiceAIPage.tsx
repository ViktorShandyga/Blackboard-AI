import {
  AudioLines,
  Languages,
  Mic,
  MicOff,
  Send,
  Square,
  Trash2,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { isSpeechSupported, useVoiceTutor, type VoiceLanguage, type VoiceStatus } from '@/hooks/useVoiceTutor';
import { VoiceOrb } from '@/components/voice/VoiceOrb';

interface VoiceAIPageProps {
  apiKey: string;
  model: string;
  onOpenSettings: () => void;
}

const STATUS_META: Record<VoiceStatus, { label: string; dot: string; text: string }> = {
  idle: { label: 'Очікування', dot: 'bg-silver/70', text: 'text-silver' },
  listening: { label: 'Слухаю', dot: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]', text: 'text-sky-300' },
  thinking: { label: 'Думаю', dot: 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]', text: 'text-violet-300' },
  speaking: { label: 'Говорю', dot: 'bg-success shadow-[0_0_10px_rgba(110,231,183,0.9)]', text: 'text-success' },
};

const LANG_OPTIONS: { id: VoiceLanguage; label: string }[] = [
  { id: 'uk', label: 'Українська' },
  { id: 'en', label: 'English' },
];

const SUGGESTIONS = [
  'Поясни простими словами, що таке квадратні рівняння',
  'Дай підказку: з чого почати розв\'язувати задачу на рух',
  'Проведи зі мною мінітест з фізики за 8 клас',
  'Explain photosynthesis in simple words',
];

const RATE_MARKS = ['0.5×', '0.75×', '1×', '1.25×', '1.5×'];

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function SettingRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex shrink-0 items-center gap-2 text-sm text-silver">
        <Icon className="h-4 w-4 text-sky-300" />
        {label}
      </span>
      {children}
    </div>
  );
}

export function VoiceAIPage({ apiKey, model, onOpenSettings }: VoiceAIPageProps) {
  const tutor = useVoiceTutor(apiKey, model);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const supported = isSpeechSupported();

  const meta = STATUS_META[tutor.status];
  const busy = tutor.status === 'thinking' || tutor.status === 'speaking';

  // Автопрокрутка чату вниз при нових повідомленнях.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [tutor.messages, tutor.interim]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input = inputRef.current;
    const text = input?.value ?? '';
    if (!text.trim()) return;
    tutor.sendMessage(text);
    if (input) input.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Заголовок і статус */}
      <section className="glass-card relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-sky-500/15 blur-3xl animate-aurora" />
        <div className="glass-edge" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">
              <AudioLines className="h-3 w-3" />
              Blackboard Voice AI
            </p>
            <h1 className="mt-1 font-display text-xl font-semibold sm:text-2xl">Голосовий репетитор</h1>
            <p className="mt-1 text-sm text-silver">
              Говори з викладачем у реальному часі — пояснення, підказки та усні мінітести.
            </p>
          </div>
          <span className={`badge border-white/[0.08] bg-white/[0.04] ${meta.text}`}>
            <span className="relative flex h-2 w-2">
              {tutor.status !== 'idle' ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              ) : null}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
            </span>
            {meta.label}
          </span>
        </div>

        {tutor.error ? (
          <div className="relative mt-4 flex items-start gap-3 rounded-2xl border border-danger/35 bg-danger/10 p-3.5 text-sm text-rose-200">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-danger shadow-[0_0_10px_rgba(251,113,133,0.9)]" />
            <p className="flex-1 leading-snug">{tutor.error}</p>
            <button
              type="button"
              onClick={tutor.dismissError}
              className="rounded-full p-1 text-rose-200/70 transition-colors hover:bg-white/10 hover:text-ink"
              aria-label="Приховати помилку"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {apiKey ? null : (
          <div className="relative mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-violet-400/30 bg-violet-400/[0.07] p-3.5 text-sm text-violet-100">
            <p className="flex-1 leading-snug text-silver">
              Асистент вже тебе чує, але для відповідей потрібен ключ OpenRouter — так само, як для AI-завдань.
            </p>
            <button type="button" onClick={onOpenSettings} className="btn-primary px-4 py-2 text-xs">
              Додати ключ
            </button>
          </div>
        )}

        {supported ? null : (
          <div className="relative mt-4 rounded-2xl border border-danger/35 bg-danger/10 p-3.5 text-sm text-rose-200">
            Цей браузер не підтримує розпізнавання мовлення. Голосовий режим працює в Chrome та Edge.
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
        {/* Сфера + керування + налаштування */}
        <div className="glass-card relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl animate-aurora" />
          <div className="glass-edge" />
          <div className="relative select-none" onClick={() => tutor.status === 'speaking' && tutor.stopSpeaking()}>
            <VoiceOrb status={tutor.status} voiceLevelRef={tutor.voiceLevelRef} />
            <p className="mt-4 text-center text-sm text-silver">
              {tutor.status === 'speaking' ? 'Тапни по сфері, щоб перервати' : meta.label}
            </p>
          </div>

          {/* Живий розпізнаний текст */}
          <p aria-live="polite" className="relative mt-3 min-h-[3.2rem] rounded-2xl border border-white/[0.06] bg-canvas/50 px-4 py-2.5 text-sm italic text-silver">
            {tutor.interim || 'Ти на паузі — скажи щось…'}
          </p>

          <div className="relative mt-5 flex flex-wrap items-center gap-2.5">
            {tutor.micEnabled ? (
              <button type="button" onClick={tutor.stopMic} className="btn-secondary flex-1 border-sky-400/40 text-sky-200">
                <MicOff className="h-4 w-4" />
                Вимкнути мікрофон
              </button>
            ) : (
              <button
                type="button"
                onClick={tutor.startMic}
                disabled={busy}
                className="btn-primary flex-1"
              >
                <Mic className="h-4 w-4" />
                Увімкнути мікрофон
              </button>
            )}
            <button
              type="button"
              onClick={tutor.stopSpeaking}
              disabled={!busy}
              className="btn-secondary"
              aria-label="Зупинити відповідь"
            >
              <Square className="h-4 w-4" />
              <span className="hidden sm:inline">Зупинити</span>
              <span className="sm:hidden">Стоп</span>
            </button>
            <button
              type="button"
              onClick={tutor.clearHistory}
              className="btn-secondary border-rose-300/20 text-rose-200/80 hover:border-rose-300/40 hover:text-rose-200"
              aria-label="Очистити історію"
            >
              <Trash2 className="h-4 w-4" />
              Очистити
            </button>
          </div>

          <div className="relative mt-6 space-y-4 border-t border-white/[0.06] pt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex shrink-0 items-center gap-2 text-sm text-silver">
                <Languages className="h-4 w-4 text-sky-300" />
                Мова
              </span>
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-canvas/70 p-0.5">
                {LANG_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => tutor.updateSettings({ language: option.id })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                      tutor.settings.language === option.id
                        ? 'bg-gradient-to-r from-indigo-500/80 to-violet-500/80 text-white shadow-glow-violet'
                        : 'text-silver hover:text-ink'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SettingRow icon={Volume2} label="Гучність">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={tutor.settings.volume}
                  onChange={(event) => tutor.updateSettings({ volume: Number(event.target.value) })}
                  className="h-1.5 w-36 cursor-pointer appearance-none rounded-full bg-white/10 accent-sky-400 sm:w-40"
                  aria-label="Гучність мовлення"
                />
              </SettingRow>
              <span className="mt-1.5 block text-right text-[10px] tabular-nums text-silver">
                {Math.round(tutor.settings.volume * 100)}%
              </span>
            </div>

            <div>
              <SettingRow icon={AudioLines} label="Швидкість мовлення">
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.25}
                  value={tutor.settings.rate}
                  onChange={(event) => tutor.updateSettings({ rate: Number(event.target.value) })}
                  className="h-1.5 w-36 cursor-pointer appearance-none rounded-full bg-white/10 accent-sky-400 sm:w-40"
                  aria-label="Швидкість мовлення"
                />
              </SettingRow>
              <span className="mt-1.5 flex justify-between px-0.5 text-right text-[10px] tabular-nums text-silver/70">
                {RATE_MARKS.map((mark) => (
                  <span key={mark}>{mark}</span>
                ))}
              </span>
            </div>
          </div>

          {model ? (
            <p className="relative mt-4 text-center text-[11px] text-silver/60">
              Модель відповіді: <span className="text-silver">{model}</span>
            </p>
          ) : null}
        </div>

        {/* Чат */}
        <div className="glass-card relative flex flex-col overflow-hidden p-5 sm:p-6">
          <div className="glass-edge" />
          <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-silver">Розмова з викладачем</h2>
            <span className="badge border-white/[0.08] bg-white/[0.04] tabular-nums text-silver">
              {tutor.messages.length} повідомлень
            </span>
          </div>

          <div ref={listRef} className="relative mt-4 max-h-[52vh] min-h-[240px] flex-1 space-y-4 overflow-y-auto pr-1 lg:max-h-[62vh]">
            {tutor.messages.length === 0 && !tutor.interim ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 to-violet-400/15 text-sky-200 ring-1 ring-sky-400/35">
                  <Mic className="h-5 w-5" />
                </span>
                <p className="max-w-xs text-sm text-silver">
                  Натисни «Увімкнути мікрофон» і просто скажи, чим допомогти. Або почни з підказок:
                </p>
                <div className="flex max-w-sm flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => tutor.sendMessage(suggestion)}
                      className="badge border-white/[0.08] bg-white/[0.04] text-left text-silver transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/40 hover:text-sky-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {tutor.messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-1 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-[0_10px_30px_-14px_rgba(0,0,0,0.8)] sm:max-w-[75%] ${
                    message.role === 'user'
                      ? 'rounded-3xl rounded-br-lg bg-gradient-to-br from-indigo-500/90 to-sky-500/85 text-white'
                      : 'rounded-3xl rounded-bl-lg border border-white/[0.08] bg-panel/70 text-ink/95'
                  }`}
                >
                  {message.text}
                </div>
                <span className="px-1 text-[10px] uppercase tracking-wider text-silver/50">
                  {message.role === 'user' ? 'Ти' : 'Blackboard Voice AI'} · {formatTime(message.at)} · {message.lang.toUpperCase()}
                </span>
              </div>
            ))}

            {tutor.interim ? (
              <div className="flex flex-col items-start gap-1">
                <div className="max-w-[85%] rounded-3xl rounded-bl-lg border border-sky-400/25 border-dashed bg-canvas/40 px-4 py-2.5 text-sm italic leading-relaxed text-silver sm:max-w-[75%]">
                  {tutor.interim}
                  <span className="ml-1 inline-block h-3.5 w-[2px] animate-pulse rounded-full bg-sky-400 align-middle" />
                </div>
                <span className="px-1 text-[10px] uppercase tracking-wider text-silver/50">розпізнаю…</span>
              </div>
            ) : null}

            {tutor.status === 'thinking' ? (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg border border-white/[0.08] bg-panel/70 px-4 py-3">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300"
                      style={{ animationDelay: `${index * 140}ms` }}
                    />
                  ))}
                </div>
                <span className="px-1 text-[10px] uppercase tracking-wider text-silver/50">викладач думає…</span>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="relative mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
            <input
              ref={inputRef}
              type="text"
              className="field flex-1 py-3"
              placeholder="Або напиши запитання текстом…"
              autoComplete="off"
              disabled={tutor.status === 'speaking'}
            />
            <button type="submit" className="icon-button h-11 w-11 shrink-0 border-sky-400/40 text-sky-300" aria-label="Надіслати">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
