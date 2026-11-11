-- Dota 2 Patch Tracker - Supabase SQL Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create patches table
CREATE TABLE IF NOT EXISTS public.patches (
    id TEXT PRIMARY KEY, -- e.g. "7.37e"
    patch_number TEXT NOT NULL UNIQUE,
    patch_name TEXT NOT NULL,
    patch_timestamp BIGINT NOT NULL,
    release_date TIMESTAMPTZ NOT NULL,
    summary TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for sorting patches chronologically
CREATE INDEX IF NOT EXISTS idx_patches_timestamp ON public.patches (patch_timestamp DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.patches ENABLE ROW LEVEL SECURITY;

-- 4. Policies:
-- Allow anyone (public/anonymous) to view patches
CREATE POLICY "Allow public read access on patches" 
ON public.patches 
FOR SELECT 
USING (true);

-- Allow service role to insert or update patches (used by API sync worker)
CREATE POLICY "Allow service role full access" 
ON public.patches 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 5. Daily Visits Counter Table
CREATE TABLE IF NOT EXISTS public.daily_visits (
    visit_date DATE PRIMARY KEY,
    visit_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.daily_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on daily_visits"
ON public.daily_visits FOR SELECT USING (true);

-- Atomic increment function (uses Malaysia timezone Asia/Kuala_Lumpur)
CREATE OR REPLACE FUNCTION public.increment_daily_visit()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    INSERT INTO public.daily_visits (visit_date, visit_count)
    VALUES ((NOW() AT TIME ZONE 'Asia/Kuala_Lumpur')::DATE, 1)
    ON CONFLICT (visit_date)
    DO UPDATE SET visit_count = daily_visits.visit_count + 1
    RETURNING visit_count INTO new_count;

    RETURN new_count;
END;
$$;
