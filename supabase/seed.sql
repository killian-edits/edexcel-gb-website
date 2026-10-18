-- BoundaryPulse: Development Seed Data
-- ⚠️ SAMPLE DATA ONLY: All boundary entries are illustrative and explicitly labeled as sample datasets.
-- Never use in production without verifying against Pearson Edexcel official publications.

INSERT INTO public.subjects (code, version, title, qualification, tiers, status, source_url, source_notes)
VALUES 
  ('4MA1', '2017', 'Mathematics A', 'International GCSE', ARRAY['foundation', 'higher'], 'verified', 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/mathematics-a-2016.html', 'Sample data for development'),
  ('4CH1', '2017', 'Chemistry', 'International GCSE', NULL, 'verified', 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/chemistry-2017.html', 'Sample data for development'),
  ('4PH1', '2017', 'Physics', 'International GCSE', NULL, 'verified', NULL, 'Sample data for development')
ON CONFLICT (code, version) DO NOTHING;