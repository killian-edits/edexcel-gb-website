-- ===================================================================
-- Migration 003: Past Papers Table & Storage Policies
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.past_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code TEXT NOT NULL,
  subject_title TEXT NOT NULL,
  qualification TEXT NOT NULL DEFAULT 'International GCSE',
  specification_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  session TEXT NOT NULL CHECK (session IN ('june', 'january', 'november')),
  paper_number TEXT NOT NULL,           -- e.g. "1", "2", "1R", "2R", "1F", "1H"
  paper_code TEXT NOT NULL,             -- e.g. "4MA1/1H", "4PH1/1P", "4CH1/1C"
  tier TEXT CHECK (tier IN ('foundation', 'higher', 'untiered')),
  question_paper_path TEXT,             -- Storage path in 'past_papers' bucket
  mark_scheme_path TEXT,                -- Storage path in 'past_papers' bucket
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(specification_code, year, session, paper_code)
);

-- Index for fast browsing and filtering
CREATE INDEX IF NOT EXISTS idx_past_papers_subject ON public.past_papers(subject_code);
CREATE INDEX IF NOT EXISTS idx_past_papers_year_session ON public.past_papers(year, session);
CREATE INDEX IF NOT EXISTS idx_past_papers_spec ON public.past_papers(specification_code);

-- Enable RLS
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;

-- Everyone (students and public visitors) can view past paper records
CREATE POLICY "Public past papers viewable by everyone" 
ON public.past_papers FOR SELECT USING (true);

-- Only admins can insert, update, or delete past papers
CREATE POLICY "Admins can manage past papers" 
ON public.past_papers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Storage bucket RLS policies for 'past_papers'
-- Public read access for past papers bucket
CREATE POLICY "Public Access to past_papers bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'past_papers');

-- Only admins can upload/modify past_papers in storage
CREATE POLICY "Admins can upload past papers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'past_papers' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update past papers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'past_papers' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete past papers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'past_papers' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

