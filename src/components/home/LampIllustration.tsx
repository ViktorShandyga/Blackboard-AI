export function LampIllustration() {
  return (
    <div className="relative mx-auto h-56 w-56 sm:h-72 sm:w-72" aria-hidden="true">
      <div className="absolute inset-4 rounded-full bg-sky-400/25 blur-3xl animate-glow-pulse" />
      <div className="absolute inset-10 rounded-full bg-violet-400/20 blur-3xl animate-glow-pulse [animation-delay:2s]" />
      <svg viewBox="0 0 240 240" className="relative h-full w-full" fill="none">
        <defs>
          <radialGradient id="lamp-glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bulb-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="55%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>

        <circle cx="120" cy="96" r="92" fill="url(#lamp-glow)" />

        <path
          d="M120 30c-30 0-52 23-52 52 0 19 9 33 22 45 7 6 10 13 10 22v6h40v-6c0-9 3-16 10-22 13-12 22-26 22-45 0-29-22-52-52-52Z"
          fill="url(#bulb-fill)"
          stroke="#BAE6FD"
          strokeWidth="1.5"
        />
        <path d="M100 150h40" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
        <path d="M106 160h28" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
        <path d="M112 170h16" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
        <path d="M120 82v16M104 90l11 8M136 90l-11 8" stroke="#1E2A44" strokeWidth="2" strokeLinecap="round" />

        <path d="M120 176c-22-6-44-4-70 6v40c26-10 48-12 70-6 22-6 44-4 70 6v-40c-26-10-48-12-70-6Z" fill="#151D32" stroke="#38BDF8" strokeOpacity="0.5" strokeWidth="1.5" />
        <path d="M120 176v40" stroke="#38BDF8" strokeOpacity="0.5" strokeWidth="1.5" />
        <path d="M62 190c14-3 28-2 42 3M62 200c14-3 28-2 42 3M62 210c14-3 28-2 42 3" stroke="#94A3B8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M178 190c-14-3-28-2-42 3M178 200c-14-3-28-2-42 3M178 210c-14-3-28-2-42 3" stroke="#94A3B8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
