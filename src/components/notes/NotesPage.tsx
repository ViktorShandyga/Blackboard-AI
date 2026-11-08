import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, FileText, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { SUBJECTS } from '@/data/lessons';
import { createNote, deleteNote, loadNotes, updateNote } from '@/lib/notes';
import type { NoteDraft, StudyNote } from '@/types/notes';

const EMPTY_DRAFT: NoteDraft = { subjectId: '', subjectName: 'Без предмета', title: '', content: '' };

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

interface NotesPageProps {
  onBack: () => void;
}

export function NotesPage({ onBack }: NotesPageProps) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadNotes()
      .then(setNotes)
      .catch(() => setErrorMessage('Не вдалося завантажити конспекти. Спробуйте ще раз.'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('uk');
    if (!normalizedQuery) return notes;
    return notes.filter((note) => `${note.title} ${note.content} ${note.subjectName}`.toLocaleLowerCase('uk').includes(normalizedQuery));
  }, [notes, query]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrorMessage(null);
  };

  const openEdit = (note: StudyNote) => {
    setEditingId(note.id);
    setDraft({ subjectId: note.subjectId ?? '', subjectName: note.subjectName, title: note.title, content: note.content });
    setErrorMessage(null);
  };

  const closeEditor = () => {
    if (!isSaving) setDraft(null);
  };

  const handleSubjectChange = (subjectId: string) => {
    const subject = SUBJECTS.find((item) => item.id === subjectId);
    setDraft((current) => current ? { ...current, subjectId, subjectName: subject?.name ?? 'Без предмета' } : current);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || draft.title.trim() === '' || draft.content.trim() === '') return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const saved = editingId ? await updateNote(editingId, draft) : await createNote(draft);
      setNotes((current) => {
        const next = current.filter((note) => note.id !== saved.id);
        return [saved, ...next];
      });
      setDraft(null);
    } catch {
      setErrorMessage('Не вдалося зберегти конспект. Перевірте з’єднання та спробуйте ще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (note: StudyNote) => {
    if (!window.confirm(`Видалити конспект «${note.title}»?`)) return;
    setErrorMessage(null);
    try {
      await deleteNote(note.id);
      setNotes((current) => current.filter((item) => item.id !== note.id));
      if (editingId === note.id) setDraft(null);
    } catch {
      setErrorMessage('Не вдалося видалити конспект. Спробуйте ще раз.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button type="button" onClick={onBack} className="mb-4 text-sm text-silver transition-colors hover:text-sky-300">← До навчання</button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">Особистий простір</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Мої конспекти</h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-silver">Зберігай важливі пояснення, формули та власні думки в одному місці.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary shrink-0"><Plus className="h-4 w-4" />Створити конспект</button>
      </section>

      {errorMessage ? <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{errorMessage}</div> : null}

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-silver" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Пошук у конспектах..." aria-label="Пошук у конспектах" className="field py-3.5 pl-11" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-label="Завантаження конспектів">
          {[0, 1].map((key) => (
            <div key={key} className="glass-card flex animate-fade-up flex-col gap-4 p-5" style={{ animationDelay: `${key * 120}ms` }}>
              <div className="h-3 w-20 animate-pulse rounded-full bg-white/[0.07]" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/[0.09]" />
              <div className="space-y-2.5">
                <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-11/12 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-4/6 animate-pulse rounded-full bg-white/[0.06]" />
              </div>
              <div className="mt-auto h-3 w-24 animate-pulse rounded-full bg-white/[0.05]" />
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && filteredNotes.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300"><BookOpen className="h-6 w-6" /></span>
          <h2 className="mt-5 text-lg font-semibold">{query ? 'Нічого не знайдено' : 'Тут з’являться твої конспекти'}</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-silver">{query ? 'Спробуй змінити пошуковий запит.' : 'Створи перший конспект, щоб зберегти важливі знання.'}</p>
          {!query ? <button type="button" onClick={openCreate} className="btn-secondary mt-6"><Plus className="h-4 w-4" />Створити конспект</button> : null}
        </div>
      ) : null}
      {!isLoading && filteredNotes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredNotes.map((note, noteIndex) => (
            <motion.article
              layout
              key={note.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(noteIndex * 0.05, 0.4), duration: 0.4, ease: 'easeOut' }}
              className="glass-card group relative flex min-h-48 flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:shadow-[0_20px_50px_-16px_rgba(99,102,241,0.4)]"
            >
              <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl opacity-40 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">{note.subjectName}</span>
                  <h2 className="mt-2 line-clamp-2 text-lg font-semibold">{note.title}</h2>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/20 to-violet-400/10 text-sky-300 ring-1 ring-sky-400/20 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <FileText className="h-4 w-4" />
                </span>
              </div>
              <p className="relative mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-silver">{note.content}</p>
              <div className="relative mt-auto flex items-center justify-between gap-3 pt-5">
                <span className="text-xs tabular-nums text-silver/70">Оновлено {formatDate(note.updatedAt)}</span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => openEdit(note)} className="icon-button h-8 w-8" aria-label={`Редагувати ${note.title}`}><Pencil className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => void handleDelete(note)} className="icon-button h-8 w-8 text-silver hover:border-danger/50 hover:text-danger" aria-label={`Видалити ${note.title}`}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {draft ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" aria-label="Закрити редактор" onClick={closeEditor} className="absolute inset-0 animate-fade-in bg-canvas/70 backdrop-blur-md" />
            <motion.form initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} onSubmit={(event) => void handleSave(event)} className="glass-card relative w-full max-w-2xl bg-card/80 p-6 shadow-glass-lg">
              <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300">Редактор</p><h2 className="mt-1 font-display text-xl font-semibold">{editingId ? 'Редагувати конспект' : 'Новий конспект'}</h2></div><button type="button" onClick={closeEditor} className="icon-button" aria-label="Закрити редактор"><X className="h-4 w-4" /></button></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_220px]"><div><label htmlFor="note-title" className="text-sm font-medium">Назва</label><input id="note-title" required maxLength={120} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Наприклад: Закон Ома" className="field mt-2 py-3" /></div><div><label htmlFor="note-subject" className="text-sm font-medium">Предмет</label><select id="note-subject" value={draft.subjectId} onChange={(event) => handleSubjectChange(event.target.value)} className="field mt-2 py-3 px-3"><option value="">Без предмета</option>{SUBJECTS.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div></div>
              <label htmlFor="note-content" className="mt-5 block text-sm font-medium">Текст конспекту</label><textarea id="note-content" required maxLength={20000} rows={12} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Запиши тут ключові думки, формули або приклади..." className="field mt-2 resize-y leading-relaxed" />
              <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={closeEditor} className="btn-secondary">Скасувати</button><button type="submit" disabled={isSaving || draft.title.trim() === '' || draft.content.trim() === ''} className="btn-primary">{isSaving ? 'Збереження...' : 'Зберегти конспект'}</button></div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
