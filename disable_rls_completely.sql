-- Disable RLS Completely for Development
-- Run this in your Supabase SQL Editor to fix the infinite recursion issue

-- Drop all existing policies first
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "agents_policy" ON public.agents;
DROP POLICY IF EXISTS "receiving_companies_policy" ON public.receiving_companies;
DROP POLICY IF EXISTS "candidates_policy" ON public.candidates;
DROP POLICY IF EXISTS "documents_policy" ON public.documents;
DROP POLICY IF EXISTS "payments_policy" ON public.payments;
DROP POLICY IF EXISTS "audit_logs_policy" ON public.audit_logs;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.agents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.receiving_companies;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.candidates;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.documents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.payments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.audit_logs;

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts DISABLE ROW LEVEL SECURITY;
