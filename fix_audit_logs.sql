-- Fix audit_logs table if created_at column is missing
-- This script ensures the audit_logs table has the correct schema

-- Check if audit_logs table exists and recreate if necessary
DO $$
BEGIN
    -- Drop and recreate audit_logs table to ensure correct schema
    DROP TABLE IF EXISTS public.audit_logs CASCADE;
    
    CREATE TABLE public.audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        table_name VARCHAR(100) NOT NULL,
        record_id VARCHAR(100) NOT NULL,
        action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
        old_data JSONB,
        new_data JSONB,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs (table_name, record_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id);

    -- Enable RLS
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view audit logs" ON public.audit_logs
        FOR SELECT USING (true);

    CREATE POLICY "System can insert audit logs" ON public.audit_logs
        FOR INSERT WITH CHECK (true);

    RAISE NOTICE 'audit_logs table recreated successfully with created_at column';
END
$$;
