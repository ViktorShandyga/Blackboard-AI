export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  streamUrl: string;
  durationMs: number;
  genre: string;
}

interface AudiusUser {
  name: string;
}

interface AudiusTrack {
  id: string;
  title: string;
  user: AudiusUser;
  artwork?: Record<string, string>;
  genre?: string;
  duration?: number;
  is_streamable?: boolean;
}

interface AudiusSearchResponse {
  data: AudiusTrack[];
}

const APP_NAME = 'BlackboardAI';
let cachedHost: string | null = null;

async function getHost(signal?: AbortSignal): Promise<string> {
  if (cachedHost) return cachedHost;
  const response = await fetch('https://api.audius.co', { signal });
  if (!response.ok) throw new Error('Audius host endpoint unavailable');
  const data = (await response.json()) as { data: string[] };
  const hosts = Array.isArray(data.data) ? data.data : [];
  if (hosts.length === 0) throw new Error('No Audius hosts available');
  cachedHost = hosts[Math.floor(Math.random() * hosts.length)];
  return cachedHost;
}

function pickArtwork(artwork: Record<string, string> | undefined): string {
  if (!artwork) return '';
  return artwork['480x480'] ?? artwork['150x150'] ?? artwork['1000x1000'] ?? '';
}

function toTrack(track: AudiusTrack, host: string): Track | null {
  if (track.is_streamable === false) return null;
  const durationSeconds = typeof track.duration === 'number' ? track.duration : 0;
  return {
    id: track.id,
    title: track.title,
    artist: track.user?.name ?? 'Невідомий виконавець',
    album: track.genre ?? 'Невідомий жанр',
    artworkUrl: pickArtwork(track.artwork),
    streamUrl: `${host}/v1/tracks/${track.id}/stream?app_name=${APP_NAME}`,
    durationMs: durationSeconds * 1000,
    genre: track.genre ?? '',
  };
}

export async function searchTracks(query: string, signal?: AbortSignal): Promise<Track[]> {
  const trimmed = query.trim();
  if (trimmed === '') return [];
  const host = await getHost(signal);
  const url = `${host}/v1/tracks/search?query=${encodeURIComponent(trimmed)}&app_name=${APP_NAME}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Audius search failed (status ${response.status})`);
  const data = (await response.json()) as AudiusSearchResponse;
  const tracks = Array.isArray(data.data) ? data.data : [];
  return tracks
    .map((track) => toTrack(track, host))
    .filter((track): track is Track => track !== null);
}
