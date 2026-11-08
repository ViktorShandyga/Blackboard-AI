import { AlertTriangle, BookOpen, RotateCw } from 'lucide-react';

interface ErrorNoticeProps {
  message: string;
  onRetry: () => void;
  onOfflineStart: () => void;
  onDismiss: () => void;
}

export function ErrorNotice({ message, onRetry, onOfflineStart, onDismiss }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className="glass-card flex animate-fade-up flex-col gap-4 border-danger/25 bg-danger/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">Не вдалося підключитися до AI</p>
          <p className="mt-1 text-sm leading-relaxed text-silver">{message}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-3 py-2 text-sm text-silver transition-colors hover:text-ink"
        >
          Закрити
        </button>
        <button type="button" onClick={onRetry} className="btn-secondary">
          <RotateCw className="h-4 w-4" />
          Повторити запит
        </button>
        <button type="button" onClick={onOfflineStart} className="btn-secondary">
          <BookOpen className="h-4 w-4" />
          Перейти до автономного навчання
        </button>
      </div>
    </div>
  );
}
