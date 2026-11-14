/**
 * Теми фону: класична аврора + основні кольори в галереї.
 * Нескінченні варіації створюються на льоту з пошукового запиту
 * (назви кольорів, їхні комбінації, hex-коди, числа відтінку, довільні слова).
 */

export interface BackgroundTheme {
  /** Стабільний ідентифікатор (для порівняння та збереження). */
  id: string;
  name: string;
  /** Кольори чотирьох аврора-плям (hsla-рядки). */
  blobs: [string, string, string, string];
  /** Кольоровий тон декоративної сітки (hue). */
  gridHue: number;
}

const BLOB_ALPHA = 0.15;
const ACCENT_ALPHA = 0.1;

function hsla(hue: number, saturation: number, lightness: number, alpha: number): string {
  return `hsla(${((hue % 360) + 360) % 360}, ${saturation}%, ${lightness}%, ${alpha})`;
}

function normalizeHue(hue: number): number {
  return ((Math.round(hue) % 360) + 360) % 360;
}

/** Класична тема — точно поточний вигляд сайту. */
export const CLASSIC_THEME: BackgroundTheme = {
  id: 'classic',
  name: 'Класична аврора',
  blobs: [
    hsla(199, 89, 48, BLOB_ALPHA),   // sky-500
    hsla(239, 84, 67, BLOB_ALPHA),   // indigo-500
    hsla(262, 83, 58, BLOB_ALPHA),   // violet-600
    hsla(172, 66, 50, ACCENT_ALPHA), // teal-400
  ],
  gridHue: 239,
};

/** Збирає тему з двох відтінків: primary — головна пляма, secondary — друга + сітка. */
export function themeFromHues(primary: number, secondary: number, name?: string): BackgroundTheme {
  const p = normalizeHue(primary);
  const s = normalizeHue(secondary);
  return {
    id: `hue-${p}-${s}`,
    name: name ?? `${hueName(p)} × ${hueName(s)}`,
    blobs: [
      hsla(p, 85, 60, BLOB_ALPHA),
      hsla(s, 80, 62, BLOB_ALPHA),
      hsla(s + 25, 85, 55, BLOB_ALPHA),
      hsla(p + 180, 70, 55, ACCENT_ALPHA),
    ],
    gridHue: s,
  };
}

/** Основні кольори галереї: чисті відтінки з контрастним акцентом. */
const MAIN_HUES: Array<[number, string]> = [
  [0, 'Червоний'],
  [25, 'Помаранчевий'],
  [50, 'Золотий'],
  [90, 'Лаймовий'],
  [130, 'Зелений'],
  [165, 'Смарагдовий'],
  [185, 'Бірюзовий'],
  [205, 'Блакитний'],
  [235, 'Синій'],
  [265, 'Бузковий'],
  [295, 'Пурпуровий'],
  [330, 'Рожевий'],
];

export const MAIN_THEMES: BackgroundTheme[] = [
  ...MAIN_HUES.map(([hue, name]) => themeFromHues(hue, normalizeHue(hue + 20), name)),
];

/** Словник назв і синонімів → hue (для пошуку). */
const HUE_VOCABULARY: Record<string, number> = {
  'червоний': 0, 'красн': 0, 'red': 0, 'кармин': 0, 'алий': 0,
  'помаранч': 25, 'orange': 25, 'мандарин': 25, 'апельсин': 25,
  'золот': 50, 'жовт': 50, 'yellow': 50, 'сонячн': 50, 'янтар': 50, 'медов': 50,
  'лайм': 90, 'lime': 90, 'кислотн': 90,
  'зелен': 130, 'green': 130, 'трав': 130, 'листя': 130,
  'смарагд': 165, 'емеральд': 165, 'хвойн': 165,
  'бірюз': 185, 'teal': 185, 'морськ': 185, 'аква': 185, 'aqua': 185, 'мятн': 185,
  'блакит': 205, 'sky': 205, 'небесн': 205, 'криштал': 205,
  'син': 235, 'blue': 235, 'океан': 235, 'ультрамарин': 235,
  'бузок': 265, 'бузков': 265, 'indigo': 265, 'індиг': 265, 'лаванд': 265, 'фіолет': 265, 'violet': 265, 'purple': 265,
  'пурпур': 295, 'магент': 295, 'magenta': 295, 'виноград': 295,
  'рожев': 330, 'pink': 330, 'малин': 330, 'фуксія': 330, 'фукси': 330, 'полум': 25,
  'білий': 210, 'white': 210, 'срібн': 210, 'сивий': 210,
  'чорний': 260, 'black': 260, 'нічн': 260, 'темн': 260,
};

function hueName(hue: number): string {
  const normalized = normalizeHue(hue);
  let best = MAIN_HUES[0];
  let bestDistance = 360;
  for (const [candidate, name] of MAIN_HUES) {
    const distance = Math.abs(candidate - normalized);
    const wrapped = Math.min(distance, 360 - distance);
    if (wrapped < bestDistance) {
      bestDistance = wrapped;
      best = [candidate, name];
    }
  }
  return best[1];
}

function normalizeQuery(text: string): string {
  return text.toLowerCase().replace(/[''`ʼ]/g, '').replace(/\s+/g, ' ').trim();
}

/** Шукає hue у словнику за будь-яким фрагментом назви. */
function matchVocabulary(text: string): number | null {
  const normalized = normalizeQuery(text);
  if (!normalized) return null;
  // Спершу точні/довгі збіги, потім префікси.
  const entries = Object.entries(HUE_VOCABULARY).sort((a, b) => b[0].length - a[0].length);
  for (const [pattern, hue] of entries) {
    if (normalized.includes(pattern)) return hue;
  }
  return null;
}

/** hex (#ff00aa) → hue. */
function matchHex(text: string): number | null {
  const cleaned = text.replace(/^#/, '').trim();
  if (!/^[0-9a-f]{6}$/i.test(cleaned)) return null;
  const red = parseInt(cleaned.slice(0, 2), 16) / 255;
  const green = parseInt(cleaned.slice(2, 4), 16) / 255;
  const blue = parseInt(cleaned.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  if (max === min) return 210; // сірий → нейтральний блакитний
  const delta = max - min;
  let hue = 0;
  if (max === red) hue = ((green - blue) / delta) * 60;
  else if (max === green) hue = 120 + ((blue - red) / delta) * 60;
  else hue = 240 + ((red - green) / delta) * 60;
  return normalizeHue(hue);
}

/** Число 0-359 → hue. */
function matchNumber(text: string): number | null {
  const cleaned = text.trim();
  if (!/^\d{1,3}$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return value <= 359 ? value : null;
}

/** Детермінований хеш рядка → два відтінки. Будь-яке слово = власна тема. */
function hashHues(text: string): [number, number] {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const primary = Math.abs(hash) % 360;
  const secondary = Math.abs(Math.imul(hash >>> 8, 2654435761)) % 360;
  return [primary, secondary];
}

const COMBO_SEPARATORS = /[×xX*+/,]|\sі\s|\sand\s|\sз\s/;

/**
 * Перетворює пошуковий запит на список тем (1-2 шт.).
 * Працює для чого завгодно: «бузковий», «синій і золото», «#ff00aa», «270»,
 * а якщо нічого не впізнано — слово хешується у власну унікальну тему.
 */
export function findThemes(query: string): BackgroundTheme[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  // Комбінація двох кольорів через роздільник.
  const parts = normalized.split(COMBO_SEPARATORS).filter((part) => part.trim().length > 0);
  if (parts.length >= 2) {
    const first = matchVocabulary(parts[0]) ?? matchHex(parts[0]) ?? matchNumber(parts[0]);
    const second = matchVocabulary(parts[1]) ?? matchHex(parts[1]) ?? matchNumber(parts[1]);
    if (first !== null && second !== null) {
      return [themeFromHues(first, second, `${hueName(first)} × ${hueName(second)}`)];
    }
  }

  const single = matchVocabulary(normalized) ?? matchHex(normalized) ?? matchNumber(normalized);
  if (single !== null) {
    const base = themeFromHues(single, normalizeHue(single + 20), hueName(single));
    const complementary = themeFromHues(single, normalizeHue(single + 160), `${hueName(single)} контраст`);
    return [base, complementary];
  }

  // Нічого не впізнано → детермінована тема з самого слова (нескінченність).
  const [primary, secondary] = hashHues(normalized);
  return [themeFromHues(primary, secondary, `Тема «${query.trim()}»`)];
}

const STORAGE_KEY = 'blackboard-ai:background';

function isValidTheme(value: unknown): value is BackgroundTheme {
  if (typeof value !== 'object' || value === null) return false;
  const theme = value as BackgroundTheme;
  return (
    typeof theme.id === 'string' &&
    typeof theme.name === 'string' &&
    Array.isArray(theme.blobs) &&
    theme.blobs.length === 4 &&
    theme.blobs.every((color) => typeof color === 'string') &&
    typeof theme.gridHue === 'number'
  );
}

/** Читає збережений вибір; пошкоджені дані тихо відкочуються на класичну. */
export function loadBackgroundTheme(): BackgroundTheme {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return CLASSIC_THEME;
    const parsed = JSON.parse(raw) as unknown;
    if (isValidTheme(parsed)) return parsed;
    if (typeof parsed === 'string') {
      // Стара схема (id із попередньої версії) — зіставимо з основними.
      const matched = MAIN_THEMES.find((theme) => theme.id === parsed);
      if (matched) return matched;
    }
    return CLASSIC_THEME;
  } catch {
    return CLASSIC_THEME;
  }
}

export function saveBackgroundTheme(theme: BackgroundTheme): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

/** Випадкова тема з необмеженого простору відтінків. */
export function randomBackgroundTheme(currentId: string): BackgroundTheme {
  const primary = Math.floor(Math.random() * 360);
  const secondary = Math.floor(Math.random() * 360);
  const theme = themeFromHues(primary, secondary, `${hueName(primary)} × ${hueName(secondary)}`);
  return theme.id === currentId ? themeFromHues(secondary, primary, theme.name) : theme;
}
