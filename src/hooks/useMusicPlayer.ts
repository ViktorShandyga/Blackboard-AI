import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadFavorites, loadVolume, saveFavorites, saveVolume } from '@/lib/favoritesStorage';
import type { Track } from '@/lib/music';

export type RepeatMode = 'off' | 'all' | 'one';

export interface MusicPlayerState {
  queue: Track[];
  current: Track | null;
  index: number;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  volume: number;
  isMuted: boolean;
  repeat: RepeatMode;
  favorites: Track[];
  streamError: string | null;
}

export interface MusicPlayerActions {
  setQueue: (tracks: Track[], startIndex?: number) => void;
  selectIndex: (index: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (ms: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  cycleRepeat: () => void;
  toggleFavorite: (track: Track) => void;
  isFavorite: (track: Track) => boolean;
  playFavorite: (track: Track) => void;
  dismissStreamError: () => void;
}

export function useMusicPlayer(): MusicPlayerState & MusicPlayerActions {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (audioRef.current === null && typeof window !== 'undefined') {
    audioRef.current = new Audio();
    audioRef.current.preload = 'metadata';
  }

  const [queue, setQueueState] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [volume, setVolumeState] = useState<number>(loadVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [favorites, setFavorites] = useState<Track[]>(loadFavorites);
  const [streamError, setStreamError] = useState<string | null>(null);

  const current = queue[index] ?? null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    saveVolume(volume);
  }, [volume]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const loadTrack = useCallback((track: Track | null) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (track === null) {
      audio.removeAttribute('src');
      audio.load();
      setProgressMs(0);
      setDurationMs(0);
      setIsPlaying(false);
      return;
    }
    audio.src = track.streamUrl;
    audio.load();
    setProgressMs(0);
    setDurationMs(track.durationMs);
    setStreamError(null);
  }, []);

  useEffect(() => {
    loadTrack(current);
  }, [current, loadTrack]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    void audio.play().then(() => {
      setIsPlaying(true);
      setStreamError(null);
    }).catch(() => {
      setIsPlaying(false);
      setStreamError(`Цей трек недоступний для повного відтворення. Спробуй іншу композицію з пошуку або обраних.`);
    });
  }, [current]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const setQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    const safeIndex = Math.min(Math.max(startIndex, 0), tracks.length - 1);
    setQueueState(tracks);
    setIndex(safeIndex);
  }, []);

  const selectIndex = useCallback((target: number) => {
    setIndex(target);
  }, []);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    if (index < queue.length - 1) {
      setIndex((value) => value + 1);
    } else if (repeat === 'all') {
      setIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [index, queue.length, repeat]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    if (index > 0) setIndex((value) => value - 1);
    else if (repeat === 'all') setIndex(queue.length - 1);
  }, [index, queue.length, repeat]);

  const seek = useCallback((ms: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = ms / 1000;
    setProgressMs(ms);
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(Math.max(value, 0), 1);
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((value) => !value), []);

  const cycleRepeat = useCallback(() => {
    setRepeat((mode) => (mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off'));
  }, []);

  const toggleFavorite = useCallback((track: Track) => {
    setFavorites((currentFavorites) => {
      const exists = currentFavorites.some((item) => item.id === track.id);
      return exists
        ? currentFavorites.filter((item) => item.id !== track.id)
        : [track, ...currentFavorites];
    });
  }, []);

  const isFavorite = useCallback(
    (track: Track) => favorites.some((item) => item.id === track.id),
    [favorites],
  );

  const playFavorite = useCallback(
    (track: Track) => {
      setQueue([track], 0);
    },
    [setQueue],
  );

  const dismissStreamError = useCallback(() => setStreamError(null), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => setProgressMs(audio.currentTime * 1000);
    const handleLoaded = () => {
      if (Number.isFinite(audio.duration)) setDurationMs(audio.duration * 1000);
    };
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        void audio.play().catch(() => setIsPlaying(false));
        return;
      }
      if (index < queue.length - 1) {
        setIndex((value) => value + 1);
      } else if (repeat === 'all') {
        setIndex(0);
      } else {
        setIsPlaying(false);
      }
    };
    const handleError = () => {
      setIsPlaying(false);
      setStreamError(`Джерело не дозволяє відтворити цю композицію повністю. Обери інший трек — більшість композицій на Audius доступні повністю.`);
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [index, queue.length, repeat]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
      }
    };
  }, []);

  return useMemo(
    () => ({
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
      streamError,
      setQueue,
      selectIndex,
      togglePlay,
      play,
      pause,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      cycleRepeat,
      toggleFavorite,
      isFavorite,
      playFavorite,
      dismissStreamError,
    }),
    [
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
      streamError,
      setQueue,
      selectIndex,
      togglePlay,
      play,
      pause,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      cycleRepeat,
      toggleFavorite,
      isFavorite,
      playFavorite,
      dismissStreamError,
    ],
  );
}
