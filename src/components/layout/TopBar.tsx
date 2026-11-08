import { AudioLines, BookMarked, Lightbulb, Music, Settings, Trophy } from 'lucide-react';
import { CountUp } from '@/components/common/CountUp';

interface TopBarProps {
  totalPoints: number;
  isConnected: boolean;
  isMusicPlaying: boolean;
  onHome: () => void;
  onOpenSettings: () => void;
  onOpenNotes: () => void;
  onOpenMusic: () => void;
  onOpenVoice: () => void;
}

export function TopBar({ totalPoints, isConnected, isMusicPlaying, onHome, onOpenSettings, onOpenNotes, onOpenMusic, onOpenVoice }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
      <div className="relative mx-auto h-16 max-w-6xl rounded-2xl border border-white/[0.08] bg-canvas/75 px-3 shadow-glass backdrop-blur-2xl sm:px-4">
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-10 -bottom-px h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
        <span aria-hidden="true" className="pointer-events-none absolute -inset-x-4 -top-10 h-20 bg-gradient-to-b from-indigo-500/10 to-transparent blur-2xl" />
        <div className="relative flex h-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={onHome}
          className="group flex min-w-0 items-center gap-3 rounded-xl transition-opacity hover:opacity-90"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-white shadow-glow-sky transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6">
            <Lightbulb className="h-5 w-5" />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 via-white/25 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </span>
          <span className="flex min-w-0 flex-col text-left leading-tight">
            <span className="truncate font-display text-sm font-semibold tracking-tight">Blackboard AI</span>
            <span className="hidden items-center gap-1.5 text-[11px] text-silver sm:flex">
              <span className="relative flex h-2 w-2">
                {isConnected ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                ) : null}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isConnected ? 'bg-success shadow-[0_0_8px_rgba(110,231,183,0.9)]' : 'bg-silver/70'
                  }`}
                />
              </span>
              {isConnected ? 'AI-наставник підключено' : 'Автономний режим'}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div
            className="group flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-sm shadow-glow-violet transition-transform duration-300 hover:scale-105"
            aria-label={`Бали: ${totalPoints}`}
          >
            <Trophy className="h-4 w-4 text-violet-300 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            <span className="font-semibold tabular-nums">
              <CountUp value={totalPoints} />
            </span>
            <span className="hidden text-silver sm:inline">балів</span>
          </div>
          <button
            type="button"
            onClick={onOpenVoice}
            className="icon-button h-9 w-9"
            aria-label="Голосовий AI"
          >
            <AudioLines className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onOpenMusic}
            className={`icon-button relative h-9 w-9 ${isMusicPlaying ? 'border-sky-400/60 text-sky-300 shadow-glow-sky' : ''}`}
            aria-label="Музичний плеєр"
          >
            <Music className="h-4 w-4" />
            {isMusicPlaying ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onOpenNotes}
            className="icon-button h-9 w-9"
            aria-label="Мої конспекти"
          >
            <BookMarked className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="icon-button h-9 w-9"
            aria-label="Налаштування"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
        </div>
      </div>
    </header>
  );
}
