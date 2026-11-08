import { Check, Lightbulb } from 'lucide-react';
import type { MaterialSection } from '@/types/learning';

interface MaterialCardProps {
  sections: MaterialSection[];
}

export function MaterialCard({ sections }: MaterialCardProps) {
  return (
    <section className="glass-card relative space-y-6 overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl animate-aurora" />
      <div className="glass-edge" />
      <div className="relative flex items-center gap-2 font-display text-sm font-semibold text-sky-300">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/25">
          <Lightbulb className="h-4 w-4" />
        </span>
        Конспект заняття
      </div>
      {sections.map((section) => (
        <div key={section.title} className="relative space-y-4">
          <h3 className="text-lg font-semibold leading-snug text-ink">{section.title}</h3>
          <ul className="space-y-2.5">
            {section.points.map((point) => (
              <li key={point} className="group flex gap-3 text-sm leading-relaxed text-ink/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/25 to-indigo-500/25 text-sky-300 ring-1 ring-sky-400/30 transition-all duration-300 group-hover:scale-110">
                  <Check className="h-3 w-3" />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.12] to-sky-500/[0.06] p-4 backdrop-blur-md">
            <span className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-violet-400/20 blur-2xl" />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Приклад</p>
            <p className="relative mt-2 text-sm leading-relaxed text-ink/90">{section.example}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
