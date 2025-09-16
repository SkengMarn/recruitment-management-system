-- Recruitment Management System Database Schema
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable RLS (Row Level Security) and performance settings
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';

-- Create extension for UUID generation and other utilities
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create enum types for better data integrity
CREATE TYPE stage_type AS ENUM ('passport', 'interview', 'medical', 'training', 'visa', 'deployed', 'completed');
CREATE TYPE document_status_type AS ENUM ('pending', 'verified', 'rejected');

-- Create tables
CREATE TABLE IF NOT EXISTS public.agents (
    id SERIAL PRIMARY KEY,
    agency_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.receiving_companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    industry VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    nationality VARCHAR(100),
    passport_number VARCHAR(100),
    agent_id INTEGER REFERENCES public.agents(id) ON DELETE SET NULL,
    receiving_company_id INTEGER REFERENCES public.receiving_companies(id) ON DELETE SET NULL,
    stage stage_type DEFAULT 'passport',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stage_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', 
            COALESCE(full_name, '') || ' ' ||
            COALESCE(email, '') || ' ' ||
            COALESCE(phone, '') || ' ' ||
            COALESCE(passport_number, '')
        )
    ) STORED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_candidates_agent_id ON public.candidates(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON public.candidates(receiving_company_id) WHERE receiving_company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_search ON public.candidates USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to track stage changes
CREATE OR REPLACE FUNCTION log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stage <> OLD.stage THEN
        INSERT INTO public.stage_history (candidate_id, from_stage, to_stage, changed_by)
        VALUES (NEW.id, OLD.stage, NEW.stage, current_user);
        
        NEW.stage_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for candidates table
CREATE TRIGGER update_candidates_modtime
BEFORE UPDATE ON public.candidates
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER track_candidate_stage_change
BEFORE UPDATE OF stage ON public.candidates
FOR EACH ROW EXECUTE FUNCTION log_stage_change();

-- Create materialized view for dashboard metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.recruitment_metrics AS
SELECT 
    COUNT(*) FILTER (WHERE is_active = true) AS active_candidates,
    COUNT(*) FILTER (WHERE stage = 'passport') AS passport_stage,
    COUNT(*) FILTER (WHERE stage = 'interview') AS interview_stage,
    COUNT(*) FILTER (WHERE stage = 'medical') AS medical_stage,
    COUNT(*) FILTER (WHERE stage = 'training') AS training_stage,
    COUNT(*) FILTER (WHERE stage = 'visa') AS visa_stage,
    COUNT(*) FILTER (WHERE stage = 'deployment') AS deployed,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_last_30_days,
    AVG(EXTRACT(EPOCH FROM (stage_updated_at - created_at)) / 86400) FILTER (WHERE stage = 'deployment') AS avg_days_to_deployment
FROM public.candidates;

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_recruitment_metrics()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.recruitment_metrics;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
CREATE TRIGGER refresh_recruitment_metrics_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.candidates
FOR EACH STATEMENT EXECUTE FUNCTION refresh_recruitment_metrics();

-- Create table for document management with enhanced features
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES public.candidates(id),
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES public.candidates(id),
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_agent_id ON public.candidates(agent_id);
CREATE INDEX IF NOT EXISTS idx_candidates_receiving_company_id ON public.candidates(receiving_company_id);
CREATE INDEX IF NOT EXISTS idx_documents_candidate_id ON public.documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_payments_candidate_id ON public.payments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);

-- Enable RLS on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.agents
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.receiving_companies
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.candidates
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.documents
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.payments
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.audit_logs
    FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data
INSERT INTO public.agents (agency_name, contact_person, email, phone) VALUES
('Global Recruitment Agency', 'John Smith', 'john@globalrecruitment.com', '+1-555-0101'),
('International Staffing Solutions', 'Sarah Johnson', 'sarah@intlstaffing.com', '+1-555-0102'),
('Elite Talent Partners', 'Michael Brown', 'michael@elitetalent.com', '+1-555-0103')
ON CONFLICT DO NOTHING;

INSERT INTO public.receiving_companies (company_name, contact_person, email, phone, industry) VALUES
('Tech Solutions Inc', 'David Wilson', 'david@techsolutions.com', '+1-555-0201', 'Technology'),
('Healthcare Plus', 'Lisa Davis', 'lisa@healthcareplus.com', '+1-555-0202', 'Healthcare'),
('Manufacturing Corp', 'Robert Miller', 'robert@manufacturingcorp.com', '+1-555-0203', 'Manufacturing')
ON CONFLICT DO NOTHING;

INSERT INTO public.candidates (full_name, email, phone, nationality, passport_number, agent_id, receiving_company_id, stage) VALUES
('Alice Johnson', 'alice.johnson@email.com', '+1-555-1001', 'American', 'US123456789', 1, 1, 'passport'),
('Bob Smith', 'bob.smith@email.com', '+1-555-1002', 'Canadian', 'CA987654321', 2, 2, 'medical'),
('Carol Davis', 'carol.davis@email.com', '+1-555-1003', 'British', 'UK456789123', 1, 3, 'visa')
ON CONFLICT DO NOTHING;
