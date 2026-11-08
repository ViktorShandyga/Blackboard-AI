export interface StudyNote {
  id: string;
  subjectId: string | null;
  subjectName: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDraft {
  subjectId: string;
  subjectName: string;
  title: string;
  content: string;
}
