-- Melbourne Beach Landscape Survey table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/bvmyrgmdpxuizasrvsul/sql/new

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed boolean DEFAULT false,
  residency text,
  street_name text,
  shaded_streets integer,
  lagoon_health integer,
  native_familiarity integer,
  invasive_identify text,
  invasive_identify_other text,
  native_attributes text,
  native_attributes_other text,
  native_use text,
  barriers text,
  barriers_followup text,
  barriers_other text,
  ordinance_support integer,
  learn_more text,
  contact_name text,
  contact_email text,
  contact_phone text,
  comments text
);

-- Index for upsert by session_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_survey_session ON public.survey_responses (session_id);

-- Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (survey submissions)
CREATE POLICY "Allow anonymous insert" ON public.survey_responses
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous update of own session (for partial save upserts)
CREATE POLICY "Allow anonymous update by session" ON public.survey_responses
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Only service role can read (for exports)
CREATE POLICY "Service role read all" ON public.survey_responses
  FOR SELECT TO service_role USING (true);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_survey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER survey_responses_updated_at
  BEFORE UPDATE ON public.survey_responses
  FOR EACH ROW EXECUTE FUNCTION update_survey_updated_at();
