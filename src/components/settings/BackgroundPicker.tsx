import { Dices, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  CLASSIC_THEME,
  MAIN_THEMES,
  findThemes,
  randomBackgroundTheme,
  type BackgroundTheme,
} from '@/lib/backgroundThemes';

interface BackgroundPickerProps {
  /** Поточна вибрана тема. */
  current: BackgroundTheme;
  onSelect: (theme: BackgroundTheme) => void;
  onClose: () => void;
}

/** Мініатюрне прев'ю теми: чотири аврора-плями на темній підкладці. */
function ThemeSwatch({ theme }: { theme: BackgroundTheme }) {
  const [a, b, c, d] = theme.blobs;
  return (
    <span aria-hidden="true" className="relative block h-12 w-full overflow-hidden rounded-lg bg-canvas ring-1 ring-white/[0.08]">
      <span className="absolute left-1 top-1 h-7 w-7 rounded-full blur-[6px]" style={{ backgroundColor: a.replace(/[\d.]+\)$/, '0.55)') }} />
      <span className="absolute right-2 top-0 h-8 w-8 rounded-full blur-[6px]" style={{ backgroundColor: b.replace(/[\d.]+\)$/, '0.5)') }} />
      <span className="absolute bottom-0 right-6 h-6 w-8 rounded-full blur-[6px]" style={{ backgroundColor: c.replace(/[\d.]+\)$/, '0.5)') }} />
      <span className="absolute bottom-1 left-4 h-4 w-4 rounded-full blur-[5px]" style={{ backgroundColor: d.replace(/[\d.]+\)$/, '0.55)') }} />
      <span
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(hsla(${theme.gridHue}, 90%, 65%, 0.16) 1px, transparent 1px), linear-gradient(90deg, hsla(${theme.gridHue}, 90%, 65%, 0.16) 1px, transparent 1px)`,
          backgroundSize: '9px 9px',
        }}
      />
    </span>
  );
}

interface ThemeCardProps {
  theme: BackgroundTheme;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group rounded-xl border p-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${
        isSelected
          ? 'border-sky-400/70 bg-sky-400/[0.08] shadow-glow-sky'
          : 'border-white/[0.07] bg-white/[0.02] hover:border-sky-400/40'
      }`}
      aria-label={isSelected ? `${theme.name} — обрано` : `Обрати тему ${theme.name}`}
      aria-pressed={isSelected}
    >
      <ThemeSwatch theme={theme} />
      <span className="mt-1.5 block truncate text-[10px] font-medium text-silver transition-colors group-hover:text-ink">
        {theme.name}
      </span>
    </button>
  );
}

export function BackgroundPicker({ current, onSelect, onClose }: BackgroundPickerProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const found = useMemo(() => (query.trim() ? findThemes(query) : []), [query]);

  const surprise = () => onSelect(randomBackgroundTheme(current.id));

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
        aria-labelledby="background-title"
        className="glass-card relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden bg-card/80 p-5 shadow-glass-lg animate-pop-in"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="background-title" className="text-base font-semibold">
              Тема фону
            </h2>
            <p className="mt-1 text-xs text-silver">
              Основні кольори — тут, а нескінченні варіації шукай: «бузковий», «синій і золото», «#ff00aa», «270» чи будь-яке слово.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-silver transition-colors hover:bg-white/[0.06] hover:text-ink"
            aria-label="Закрити вибір теми"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-silver" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Шукай: море, #7c3aed, 270, лаванда × мідь…"
              className="field w-full py-2 pl-9 pr-3 text-xs"
              autoComplete="off"
            />
          </div>
          <button type="button" onClick={surprise} className="icon-button h-9 w-9 shrink-0 border-violet-400/40 text-violet-200" aria-label="Випадкова тема">
            <Dices className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {found.length > 0 ? (
            <section className="mb-4" aria-label="Знайдені теми">
              <p className="mb-2 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-silver/70">
                Знайдене
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {found.map((theme) => (
                  <ThemeCard key={theme.id} theme={theme} isSelected={theme.id === current.id} onSelect={() => onSelect(theme)} />
                ))}
              </div>
            </section>
          ) : null}

          <section aria-label="Основні кольори">
            <p className="mb-2 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-silver/70">
              Основні
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              <ThemeCard theme={CLASSIC_THEME} isSelected={CLASSIC_THEME.id === current.id} onSelect={() => onSelect(CLASSIC_THEME)} />
              {MAIN_THEMES.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} isSelected={theme.id === current.id} onSelect={() => onSelect(theme)} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
