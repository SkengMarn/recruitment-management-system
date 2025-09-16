-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for candidates table
CREATE INDEX IF NOT EXISTS idx_candidates_agent_id ON public.candidates(agent_id);
CREATE INDEX IF NOT EXISTS idx_candidates_receiving_company_id ON public.candidates(receiving_company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_candidates_updated_at ON public.candidates(updated_at);
CREATE INDEX IF NOT EXISTS idx_candidates_full_name ON public.candidates USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidates_passport_number ON public.candidates(passport_number) WHERE passport_number IS NOT NULL;
