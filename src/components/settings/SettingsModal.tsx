import { Activity, CheckCircle2, Eye, EyeOff, Loader2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { testConnection } from '@/lib/openrouter';
import { FREE_MODEL_OPTIONS } from '@/lib/openrouterModels';

interface SettingsModalProps {
  apiKey: string;
  model: string;
  onClose: () => void;
  onSave: (key: string) => void;
  onClear: () => void;
  onModelChange: (id: string) => void;
}

type ConnectionState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'ok'; reply: string }
  | { status: 'error'; message: string };

export function SettingsModal({ apiKey, model, onClose, onSave, onClear, onModelChange }: SettingsModalProps) {
  const [draft, setDraft] = useState(apiKey);
  const [visible, setVisible] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>({ status: 'idle' });

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const trimmed = draft.trim();
  const isTesting = connection.status === 'testing';

  const handleModelPick = (id: string) => {
    onModelChange(id);
    setConnection({ status: 'idle' });
  };

  const handleTest = async () => {
    setConnection({ status: 'testing' });
    const result = await testConnection(trimmed, model);
    setConnection(result.ok ? { status: 'ok', reply: result.reply } : { status: 'error', message: result.message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Закрити"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-canvas/70 backdrop-blur-md"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="glass-card relative max-h-[90vh] w-full max-w-md overflow-y-auto bg-card/80 p-6 shadow-glass-lg animate-pop-in"
      >
        <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">Модуль AI</p>
            <h2 id="settings-title" className="mt-1.5 font-display text-lg font-semibold">
              Налаштування
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-silver">
              Підключіть OpenRouter, щоб отримувати персональні пояснення від AI-наставника.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-silver transition-all duration-300 hover:rotate-90 hover:bg-white/[0.06] hover:text-ink"
            aria-label="Закрити"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label htmlFor="openrouter-key" className="mt-6 block text-sm font-medium">
          API-ключ OpenRouter
        </label>
        <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-canvas/80 transition-all duration-300 focus-within:border-sky-400/60 focus-within:shadow-[0_0_20px_-6px_rgba(56,189,248,0.6)]">
          <input
            id="openrouter-key"
            type={visible ? 'text' : 'password'}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setConnection({ status: 'idle' });
            }}
            placeholder="sk-or-..."
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent px-4 py-3 text-sm text-ink placeholder:text-silver/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="mr-2 rounded-lg p-2 text-silver transition-colors hover:bg-white/[0.06] hover:text-sky-300"
            aria-label={visible ? 'Приховати ключ' : 'Показати ключ'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-amber-200/80">
          Ключ зберігається у браузері, і JavaScript на сторінці може його прочитати. Не вводь ключ на чужих пристроях.
        </p>

        <div className="mt-6">
          <p className="text-sm font-medium">Модель AI</p>
          <div className="mt-2 grid gap-2">
            {FREE_MODEL_OPTIONS.map((option) => {
              const active = option.id === model;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleModelPick(option.id)}
                  aria-pressed={active}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                    active
                      ? 'border-sky-400/50 bg-sky-400/[0.08] shadow-[0_0_26px_-8px_rgba(56,189,248,0.8)]'
                      : 'border-white/10 bg-canvas/60 hover:border-sky-400/40 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink">{option.label}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-success">Безкоштовно</span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-silver">{option.hint}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-silver">
            Застосунок використовує лише безкоштовні моделі. Платні моделі не викликаються.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleTest}
            disabled={!trimmed || isTesting}
            className="btn-secondary w-full"
          >
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            {isTesting ? 'Перевіряємо модель...' : 'Перевірити підключення'}
          </button>
          {!trimmed ? <p className="mt-2 text-xs text-silver">Введи ключ, щоб перевірити підключення.</p> : null}
          {connection.status === 'ok' ? (
            <div role="status" className="mt-3 flex animate-fade-up items-start gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Підключення працює. Модель відповіла: «{connection.reply}»</p>
            </div>
          ) : null}
          {connection.status === 'error' ? (
            <div role="alert" className="mt-3 flex animate-fade-up items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{connection.message}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => {
              onClear();
              setDraft('');
              setConnection({ status: 'idle' });
            }}
            disabled={!apiKey}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-silver transition-colors hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
          >
            Видалити ключ
          </button>
          <button
            type="button"
            onClick={() => onSave(trimmed)}
            disabled={!trimmed}
            className="btn-primary"
          >
            Зберегти ключ
          </button>
        </div>
      </div>
    </div>
  );
}
