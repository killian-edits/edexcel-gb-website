-- BoundaryPulse: Database Schema & Row Level Security Policies
-- Designed for PostgreSQL & Supabase

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own display name" 
ON public.profiles FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Users cannot elevate their own role
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  qualification TEXT NOT NULL,
  tiers TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'unverified', 'verified', 'retired')),
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(code, version)
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published verified subjects viewable by everyone" 
ON public.subjects FOR SELECT USING (status = 'verified');

CREATE POLICY "Admins can manage subjects" 
ON public.subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Subject Components Table
CREATE TABLE IF NOT EXISTS public.subject_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  component_code TEXT NOT NULL,
  component_name TEXT NOT NULL,
  max_raw_marks INTEGER NOT NULL CHECK (max_raw_marks > 0),
  duration TEXT,
  weighting_percent NUMERIC(5,2),
  scaling_factor NUMERIC(6,3),
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'unverified', 'verified', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(subject_id, component_code)
);

ALTER TABLE public.subject_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified subject components viewable by everyone" 
ON public.subject_components FOR SELECT USING (status = 'verified');

CREATE POLICY "Admins can manage subject components" 
ON public.subject_components FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Grade Boundaries Table
CREATE TABLE IF NOT EXISTS public.grade_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  series TEXT NOT NULL,
  series_type TEXT NOT NULL CHECK (series_type IN ('june', 'january')),
  year INTEGER NOT NULL,
  tier TEXT CHECK (tier IN ('foundation', 'higher')),
  variant TEXT,
  component_code TEXT,
  thresholds JSONB NOT NULL,
  max_mark INTEGER NOT NULL CHECK (max_mark > 0),
  source TEXT NOT NULL,
  publication_date DATE,
  verification_status TEXT NOT NULL DEFAULT 'draft' CHECK (verification_status IN ('draft', 'unverified', 'verified', 'retired')),
  data_version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.grade_boundaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published verified grade boundaries viewable by everyone" 
ON public.grade_boundaries FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Admins can manage grade boundaries" 
ON public.grade_boundaries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Saved Candidate Calculations Table
CREATE TABLE IF NOT EXISTS public.saved_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_code TEXT NOT NULL,
  subject_title TEXT NOT NULL,
  series TEXT NOT NULL,
  tier TEXT,
  variant TEXT,
  input_marks JSONB NOT NULL,
  result_grade TEXT,
  result_total INTEGER,
  result_max_total INTEGER,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('prediction', 'target_plan')),
  calculation_model_version TEXT NOT NULL,
  is_mock_result BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own calculations" 
ON public.saved_calculations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own calculations" 
ON public.saved_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own calculations" 
ON public.saved_calculations FOR DELETE USING (auth.uid() = user_id);

