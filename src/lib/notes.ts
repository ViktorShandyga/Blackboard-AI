import { supabase } from '@/lib/supabase';
import type { NoteDraft, StudyNote } from '@/types/notes';

interface StudyNoteRow {
  id: string;
  subject_id: string | null;
  subject_name: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function mapNote(row: StudyNoteRow): StudyNote {
  return {
    id: row.id,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadNotes(): Promise<StudyNote[]> {
  const { data, error } = await supabase
    .from('study_notes')
    .select('id, subject_id, subject_name, title, content, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as StudyNoteRow[]).map(mapNote);
}

export async function createNote(draft: NoteDraft): Promise<StudyNote> {
  const { data, error } = await supabase
    .from('study_notes')
    .insert({
      subject_id: draft.subjectId || null,
      subject_name: draft.subjectName,
      title: draft.title.trim(),
      content: draft.content.trim(),
    })
    .select('id, subject_id, subject_name, title, content, created_at, updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Конспект не створено');
  return mapNote(data as StudyNoteRow);
}

export async function updateNote(id: string, draft: NoteDraft): Promise<StudyNote> {
  const { data, error } = await supabase
    .from('study_notes')
    .update({
      subject_id: draft.subjectId || null,
      subject_name: draft.subjectName,
      title: draft.title.trim(),
      content: draft.content.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, subject_id, subject_name, title, content, created_at, updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Конспект не знайдено');
  return mapNote(data as StudyNoteRow);
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('study_notes').delete().eq('id', id);
  if (error) throw error;
}
