import type { Track } from '@/lib/music';

const STORAGE_KEY = 'blackboard-ai:music-favorites';
const VOLUME_KEY = 'blackboard-ai:music-volume';

function isTrack(value: unknown): value is Track {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.streamUrl === 'string' &&
    typeof record.title === 'string'
  );
}

export function loadFavorites(): Track[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const tracks = parsed.filter(isTrack);
    if (tracks.length !== parsed.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    return tracks;
  } catch {
    return [];
  }
}

export function saveFavorites(tracks: Track[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch {
    // ignore quota errors
  }
}

export function loadVolume(): number {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    if (!raw) return 0.7;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0.7;
  } catch {
    return 0.7;
  }
}

export function saveVolume(volume: number): void {
  try {
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    // ignore
  }
}
