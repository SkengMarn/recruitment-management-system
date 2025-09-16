-- Fix RLS Policy Infinite Recursion Issue
-- Run this in your Supabase SQL Editor to fix the policies

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.agents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.receiving_companies;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.candidates;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.documents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.payments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.profiles;

-- Disable RLS temporarily to avoid recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- For development/testing, allow all operations for authenticated users

-- Profiles table - simple policy without recursion
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_policy" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated');

-- Agents table
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents_policy" ON public.agents
    FOR ALL USING (auth.role() = 'authenticated');

-- Receiving companies table
ALTER TABLE public.receiving_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "receiving_companies_policy" ON public.receiving_companies
    FOR ALL USING (auth.role() = 'authenticated');

-- Candidates table
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidates_policy" ON public.candidates
    FOR ALL USING (auth.role() = 'authenticated');

-- Documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_policy" ON public.documents
    FOR ALL USING (auth.role() = 'authenticated');

-- Payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_policy" ON public.payments
    FOR ALL USING (auth.role() = 'authenticated');

-- Audit logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_policy" ON public.audit_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: If you want to completely disable RLS for development
-- Uncomment the lines below instead of the policies above

/*
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
*/
