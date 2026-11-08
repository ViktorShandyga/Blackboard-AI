import { AnimatePresence, motion } from 'motion/react';
import { Search } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { searchTopics, type TopicSuggestion } from '@/lib/topicSearch';

interface TopicSearchProps {
  onSelect: (suggestion: TopicSuggestion) => void;
}

export function TopicSearch({ onSelect }: TopicSearchProps) {
  const [query, setQuery] = useState('');
  const hasQuery = query.trim() !== '';
  const suggestions = searchTopics(query);

  const handlePick = (suggestion: TopicSuggestion) => {
    onSelect(suggestion);
    setQuery('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') setQuery('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-silver" />
        <input
          type="search"
          value={query}
          maxLength={200}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Знайди тему: наприклад, «Закон Ома» або «Козацтво»"
          aria-label="Пошук теми"
          className="field py-3.5 pl-11"
        />
      </div>

      <AnimatePresence>
        {hasQuery ? (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <li key={`${suggestion.subjectId}-${suggestion.topicId}`}>
                  <button
                    type="button"
                    onClick={() => handlePick(suggestion)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-sky-400/10"
                  >
                    <span className="text-ink">{suggestion.title}</span>
                    <span className="shrink-0 text-xs text-silver">{suggestion.subjectName}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm leading-relaxed text-silver">
                Такої теми в базі немає. Обери предмет і введи її у полі «Своя тема».
              </li>
            )}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
