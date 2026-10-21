-- Migration: Add chosen_subjects to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS chosen_subjects TEXT[] DEFAULT '{}'::TEXT[];

-- Update RLS policy to allow users to update their own chosen_subjects as well as display_name
DROP POLICY IF EXISTS "Users can update their own display name" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Users cannot elevate their own role
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

