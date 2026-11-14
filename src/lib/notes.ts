import type { NoteDraft, StudyNote } from '@/types/notes';

/** Конспекти зберігаються локально в браузері (localStorage), без зовнішньої бази. */
const NOTES_STORAGE_KEY = 'blackboard-ai:notes';

function loadAll(): StudyNote[] {
  try {
    const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (note): note is StudyNote =>
        typeof note?.id === 'string' &&
        typeof note?.subjectName === 'string' &&
        typeof note?.title === 'string' &&
        typeof note?.content === 'string' &&
        typeof note?.createdAt === 'string' &&
        typeof note?.updatedAt === 'string',
    );
  } catch {
    return [];
  }
}

function saveAll(notes: StudyNote[]): void {
  window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function sortByUpdatedDesc(notes: StudyNote[]): StudyNote[] {
  return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function loadNotes(): Promise<StudyNote[]> {
  return sortByUpdatedDesc(loadAll());
}

export async function createNote(draft: NoteDraft): Promise<StudyNote> {
  const now = new Date().toISOString();
  const note: StudyNote = {
    id: `note-${now}-${Math.random().toString(36).slice(2, 8)}`,
    subjectId: draft.subjectId || null,
    subjectName: draft.subjectName,
    title: draft.title.trim(),
    content: draft.content.trim(),
    createdAt: now,
    updatedAt: now,
  };
  saveAll([note, ...loadAll()]);
  return note;
}

export async function updateNote(id: string, draft: NoteDraft): Promise<StudyNote> {
  const notes = loadAll();
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) throw new Error('Конспект не знайдено');
  const updated: StudyNote = {
    ...notes[index],
    subjectId: draft.subjectId || null,
    subjectName: draft.subjectName,
    title: draft.title.trim(),
    content: draft.content.trim(),
    updatedAt: new Date().toISOString(),
  };
  notes[index] = updated;
  saveAll(notes);
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  saveAll(loadAll().filter((note) => note.id !== id));
}
