/*
# Create persistent study notes

1. New Tables
- `study_notes` stores student-created notes for the Blackboard AI app.
- `id` is the generated unique identifier.
- `subject_id` stores the selected subject identifier when available.
- `subject_name` stores the visible subject name for reliable display.
- `title` stores the note title.
- `content` stores the note body.
- `created_at` and `updated_at` store note timestamps.

2. Security
- Row level security is enabled.
- This app has no sign-in screen, so anon and authenticated roles receive the CRUD permissions required by the frontend.
- Notes are intentionally shared within this single-tenant app because there is no account identity to scope them to.

3. Important Notes
- The table uses non-destructive creation and can be safely reapplied.
- The updated timestamp is maintained by the frontend to keep the client flow simple.
*/

CREATE TABLE IF NOT EXISTS public.study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text,
  subject_name text NOT NULL DEFAULT 'Без предмета',
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_notes TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_study_notes" ON public.study_notes;
CREATE POLICY "anon_select_study_notes" ON public.study_notes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_study_notes" ON public.study_notes;
CREATE POLICY "anon_insert_study_notes" ON public.study_notes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_study_notes" ON public.study_notes;
CREATE POLICY "anon_update_study_notes" ON public.study_notes
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_study_notes" ON public.study_notes;
CREATE POLICY "anon_delete_study_notes" ON public.study_notes
  FOR DELETE TO anon, authenticated USING (true);
