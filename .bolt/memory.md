# Project memory

## Product intent & audience

- **Blackboard AI: Твій цифровий репетитор** — single-page educational web app for Ukrainian secondary-school students to self-study 14 subjects (Математика, Історія України, Українська мова/література, Англійська мова, Фізика, Хімія, Біологія, Географія, Інформатика, Всесвітня історія, Громадянська освіта, Зарубіжна література, Астрономія).
- No backend; all persistence is local (localStorage). Points/progress follow the browser, not the user.

## Brand personality & voice

- Bilingual context: UI copy and learning content are in Ukrainian; code/developer-facing text is English.
- Tone: approachable mentor — "AI-наставник пояснює" — clear, plain-language explanations that adapt to subject and difficulty level.

## Visual design & UX direction

- Dark minimalist palette: bg `#09090b`, card `#18181b`, elements `#27272a`, accents `#a1a1aa`, white text.
- Vibe fuses modern edtech platform with professional AI assistant: smooth animations, hover effects, accessible interactive controls.
- Four UI states: **Empty State** (book/lightbulb illustration, headings "Знання без меж. Навчайся у власному темпі" / "Обери предмет…"), **Learning State** (conspect + 3 MCQ tasks A–D + timer + progress bar + AI explanation), **Error State** (inline notice, "Перейти до автономного навчання" CTA), and a summary/results screen (accuracy, points, mastery bar, retry with new questions).
- Answer feedback: correct = green, wrong = red; right answer = +10 pts.

## Decisions, constraints & rationale

- **Stack:** React + Vite + Tailwind CSS; single-page app, no backend.
- **AI:** OpenRouter optional — API key stored in localStorage; model `google/gemini-2.5-flash` (migrated from retired `google/gemini-2.0-flash-exp` which stopped working on OpenRouter). Falls back to built-in bank when no key or AI failure.
- **Local bank:** 2 topics × 4 questions per subject (limited offline variety); AI mode supplies more.
- **Lesson flow:** subject → topic or "Навчальний мікс" (3 tasks from mixed sections) → level (Легкий/Середній/Складний) → "Розпочати навчання".
- Build passes; type check passes. Live AI request not tested (no OpenRouter access from dev environment). Visual/animation correctness unverified (not opened in browser).

## Open questions & assumptions

- Persistence assumed localStorage-only; no cross-device sync by requirement.
- Local bank variety is small; may need expansion for offline reuse.
- Browser runtime/visual verification still pending.
- Live OpenRouter request with new model `google/gemini-2.5-flash` untested; user should verify with their API key.