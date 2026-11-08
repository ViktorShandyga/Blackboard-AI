import { AnimatePresence, motion } from 'motion/react';
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Search,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { searchTracks, type Track } from '@/lib/music';
import type { MusicPlayerActions, MusicPlayerState, RepeatMode } from '@/hooks/useMusicPlayer';

interface MusicPlayerProps extends MusicPlayerState, MusicPlayerActions {
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function repeatIcon(mode: RepeatMode) {
  if (mode === 'one') return <Repeat1 className="h-4 w-4" />;
  return <Repeat className="h-4 w-4" />;
}

function volumeIcon(volume: number, isMuted: boolean) {
  if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />;
  if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
  return <Volume2 className="h-4 w-4" />;
}

export function MusicPlayer(props: MusicPlayerProps) {
  const {
    isOpen,
    onClose,
    queue,
    current,
    index,
    isPlaying,
    progressMs,
    durationMs,
    volume,
    isMuted,
    repeat,
    favorites,
    setQueue,
    selectIndex,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    cycleRepeat,
    toggleFavorite,
    isFavorite,
    playFavorite,
    streamError,
    dismissStreamError,
  } = props;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [view, setView] = useState<'search' | 'queue' | 'favorites'>('search');

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed === '') return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const tracks = await searchTracks(trimmed);
      setResults(tracks);
      if (tracks.length === 0) setSearchError('Нічого не знайдено. Спробуй інший запит.');
    } catch {
      setSearchError('Не вдалося виконати пошук. Перевір з\'єднання та спробуй ще раз.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlayTrack = (track: Track, list: Track[], startIndex: number) => {
    setQueue(list, startIndex);
  };

  const progressPercent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;
  const currentIsFavorite = current ? isFavorite(current) : false;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end justify-end p-3 sm:p-6"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-canvas/70 backdrop-blur-sm" />
          <motion.div
            initial={{ x: 40, opacity: 0, scale: 0.96 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 40, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex h-[min(560px,85vh)] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-card/80 shadow-glass-lg backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl animate-aurora" />
            <div className="pointer-events-none absolute -bottom-20 right-0 h-44 w-64 rounded-full bg-violet-500/20 blur-3xl animate-aurora [animation-delay:-9s]" />

            <div className="glass-edge" />
            <div className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-white shadow-glow-sky">
                  <ListMusic className="h-4 w-4" />
                </span>
                <span className="font-display text-sm font-semibold">Музичний плеєр</span>
              </div>
              <button type="button" onClick={onClose} className="icon-button h-8 w-8" aria-label="Закрити плеєр">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative px-4 pt-4">
              {streamError ? (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                  <span className="flex-1">{streamError}</span>
                  <div className="flex shrink-0 gap-1.5">
                    {queue.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => { dismissStreamError(); next(); }}
                        className="rounded-md bg-danger/20 px-2 py-0.5 font-medium text-danger transition-colors hover:bg-danger/30"
                      >
                        Наступний
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={dismissStreamError}
                      className="rounded-md bg-white/10 px-2 py-0.5 font-medium text-silver transition-colors hover:bg-white/20"
                    >
                      Закрити
                    </button>
                  </div>
                </div>
              ) : null}
              {current ? (
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-panel shadow-glow-sky ring-1 ring-white/10">
                    {current.artworkUrl ? (
                      <img
                        src={current.artworkUrl}
                        alt={current.album}
                        className={`h-full w-full object-cover transition-transform duration-700 ${isPlaying ? 'animate-none' : ''}`}
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">{current.title}</p>
                    <p className="mt-0.5 truncate text-xs text-silver">{current.artist}</p>
                    <p className="mt-0.5 truncate text-xs text-silver/70">{current.album}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(current)}
                    aria-label={currentIsFavorite ? 'Видалити з обраних' : 'Додати до обраних'}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors duration-300 ${
                        currentIsFavorite ? 'fill-danger text-danger' : 'text-silver hover:text-danger'
                      }`}
                    />
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-white/5 bg-panel/40 px-3 py-4 text-center text-xs text-silver">
                  Обери композицію, щоб почати слухати
                </div>
              )}
            </div>

            <div className="relative px-4 pt-3">
              <div className="group relative h-1.5 cursor-pointer rounded-full bg-canvas/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const ratio = (event.clientX - rect.left) / rect.width;
                seek(Math.min(Math.max(ratio, 0), 1) * durationMs);
              }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="pointer-events-none absolute -top-1 h-3.5 w-3.5 rounded-full bg-white opacity-0 shadow-glow-sky transition-opacity duration-300 group-hover:opacity-100"
                  style={{ left: `calc(${progressPercent}% - 7px)` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] tabular-nums text-silver">
                <span>{formatTime(progressMs)}</span>
                <span>{formatTime(durationMs)}</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center gap-2 px-4 py-3">
              <button
                type="button"
                onClick={cycleRepeat}
                aria-label="Режим повтору"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 ${
                  repeat !== 'off' ? 'text-sky-300' : 'text-silver hover:text-ink'
                }`}
              >
                {repeatIcon(repeat)}
              </button>
              <button
                type="button"
                onClick={previous}
                disabled={!current}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-silver transition-all duration-300 hover:scale-110 hover:text-ink disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Попередній трек"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                disabled={!current}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-white shadow-[0_0_26px_-4px_rgba(99,102,241,0.95)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_34px_-4px_rgba(139,92,246,0.95)] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                aria-label={isPlaying ? 'Пауза' : 'Відтворити'}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!current}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-silver transition-all duration-300 hover:scale-110 hover:text-ink disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Наступний трек"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-silver transition-all duration-300 hover:text-ink"
                >
                  {volumeIcon(volume, isMuted)}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  aria-label="Гучність"
                  className="h-1 w-16 cursor-pointer accent-sky-400"
                />
              </div>
            </div>

            <div className="relative flex gap-1 border-b border-white/5 px-3">
              {(['search', 'queue', 'favorites'] as const).map((tab) => {
                const labels = { search: 'Пошук', queue: 'Черга', favorites: 'Обрані' } as const;
                const count = tab === 'queue' ? queue.length : tab === 'favorites' ? favorites.length : null;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setView(tab)}
                    className={`relative px-3 py-2 text-xs font-medium transition-colors duration-300 ${
                      view === tab ? 'text-ink' : 'text-silver hover:text-ink'
                    }`}
                  >
                    {labels[tab]}
                    {count !== null && count > 0 ? <span className="ml-1 text-sky-300">{count}</span> : null}
                    {view === tab ? (
                      <motion.span
                        layoutId="music-tab"
                        className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {view === 'search' ? (
                <div className="space-y-3">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-silver" />
                      <input
                        type="text"
                        value={query}
                        maxLength={120}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Назва пісні або виконавець"
                        aria-label="Пошук музики"
                        className="field pl-9"
                      />
                    </div>
                    <button type="submit" disabled={isSearching} className="btn-secondary px-4 py-2 text-xs">
                      {isSearching ? 'Шукаю...' : 'Знайти'}
                    </button>
                  </form>

                  {searchError ? (
                    <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                      {searchError}
                    </p>
                  ) : null}

                  <ul className="space-y-1.5">
                    {results.map((track) => {
                      const active = current?.id === track.id;
                      const fav = isFavorite(track);
                      return (
                        <li key={track.id}>
                          <div
                            className={`flex items-center gap-2.5 rounded-lg border px-2 py-1.5 transition-all duration-300 ${
                              active
                                ? 'border-sky-400/40 bg-sky-400/10'
                                : 'border-transparent hover:border-white/10 hover:bg-panel/50'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handlePlayTrack(track, results, results.indexOf(track))}
                              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                            >
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-panel">
                                {track.artworkUrl ? (
                                  <img src={track.artworkUrl} alt={track.album} className="h-full w-full object-cover" loading="lazy" />
                                ) : null}
                                {active && isPlaying ? (
                                  <span className="absolute inset-0 flex items-center justify-center bg-canvas/60">
                                    <span className="flex items-end gap-0.5">
                                      <span className="h-2 w-0.5 animate-[drift_0.8s_ease-in-out_infinite] bg-sky-300" />
                                      <span className="h-3 w-0.5 animate-[drift_0.8s_ease-in-out_infinite] [animation-delay:-0.2s] bg-sky-300" />
                                      <span className="h-2.5 w-0.5 animate-[drift_0.8s_ease-in-out_infinite] [animation-delay:-0.4s] bg-sky-300" />
                                    </span>
                                  </span>
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-ink">{track.title}</p>
                                <p className="truncate text-[11px] text-silver">{track.artist}</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleFavorite(track)}
                              aria-label={fav ? 'Видалити з обраних' : 'Додати до обраних'}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-300 hover:scale-110"
                            >
                              <Heart className={`h-3.5 w-3.5 ${fav ? 'fill-danger text-danger' : 'text-silver hover:text-danger'}`} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {view === 'queue' ? (
                <ul className="space-y-1.5">
                  {queue.length === 0 ? (
                    <li className="px-2 py-6 text-center text-xs text-silver">Черга порожня</li>
                  ) : (
                    queue.map((track, trackIndex) => {
                      const active = trackIndex === index;
                      return (
                        <li key={`${track.id}-${trackIndex}`}>
                          <button
                            type="button"
                            onClick={() => selectIndex(trackIndex)}
                            className={`flex w-full items-center gap-2.5 rounded-lg border px-2 py-1.5 text-left transition-all duration-300 ${
                              active ? 'border-sky-400/40 bg-sky-400/10' : 'border-transparent hover:bg-panel/50'
                            }`}
                          >
                            <span className={`w-4 text-xs tabular-nums ${active ? 'text-sky-300' : 'text-silver'}`}>
                              {trackIndex + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-ink">{track.title}</p>
                              <p className="truncate text-[11px] text-silver">{track.artist}</p>
                            </div>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              ) : null}

              {view === 'favorites' ? (
                <ul className="space-y-1.5">
                  {favorites.length === 0 ? (
                    <li className="px-2 py-6 text-center text-xs text-silver">Обраних композицій немає</li>
                  ) : (
                    favorites.map((track) => {
                      const active = current?.id === track.id;
                      return (
                        <li key={track.id}>
                          <div
                            className={`flex items-center gap-2.5 rounded-lg border px-2 py-1.5 transition-all duration-300 ${
                              active ? 'border-sky-400/40 bg-sky-400/10' : 'border-transparent hover:bg-panel/50'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => playFavorite(track)}
                              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                            >
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-panel">
                                {track.artworkUrl ? (
                                  <img src={track.artworkUrl} alt={track.album} className="h-full w-full object-cover" loading="lazy" />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-ink">{track.title}</p>
                                <p className="truncate text-[11px] text-silver">{track.artist}</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleFavorite(track)}
                              aria-label="Видалити з обраних"
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-silver transition-all duration-300 hover:scale-110 hover:text-danger"
                            >
                              <Heart className="h-3.5 w-3.5 fill-danger text-danger" />
                            </button>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
