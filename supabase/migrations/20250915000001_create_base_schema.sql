-- Create base database schema for Recruitment Management System
-- Migration: 20250915000001_create_base_schema

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE stage_type AS ENUM ('passport', 'interview', 'medical', 'training', 'visa', 'deployment');
CREATE TYPE document_status_type AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE alert_type AS ENUM ('info', 'warning', 'error', 'success');
CREATE TYPE alert_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'flat')),
    commission_value DECIMAL(15,2) DEFAULT 0.00,
    agency_id VARCHAR(100),
    agency_country VARCHAR(100),
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receiving_companies table
CREATE TABLE IF NOT EXISTS public.receiving_companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    industry VARCHAR(100),
    license_number VARCHAR(100) UNIQUE,
    payment_type VARCHAR(50) DEFAULT 'candidate_funded' CHECK (payment_type IN ('employer_funded', 'candidate_funded', 'hybrid')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create positions table
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    position_name VARCHAR(255) NOT NULL,
    receiving_company_id UUID REFERENCES public.receiving_companies(id) ON DELETE SET NULL,
    work_country VARCHAR(100) NOT NULL,
    requested_headcount INTEGER DEFAULT 1,
    salary DECIMAL(15,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    input_fee DECIMAL(15,2) DEFAULT 0,
    input_fee_currency VARCHAR(10) DEFAULT 'UGX',
    markup_agency DECIMAL(15,2) DEFAULT 0,
    markup_company DECIMAL(15,2) DEFAULT 0,
    final_fee DECIMAL(15,2),
    contract_period INTEGER DEFAULT 24,
    probation_period INTEGER DEFAULT 3,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 65,
    accommodation BOOLEAN DEFAULT false,
    food BOOLEAN DEFAULT false,
    air_ticket BOOLEAN DEFAULT false,
    transport BOOLEAN DEFAULT false,
    medical_insurance BOOLEAN DEFAULT false,
    employment_visa BOOLEAN DEFAULT false,
    working_hours VARCHAR(100),
    payment_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nationality VARCHAR(100),
    passport_number VARCHAR(100),
    next_of_kin_name VARCHAR(255),
    next_of_kin_phone VARCHAR(50),
    education_level VARCHAR(100),
    work_experience TEXT,
    skills TEXT,
    notes TEXT,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    receiving_company_id UUID REFERENCES public.receiving_companies(id) ON DELETE SET NULL,
    position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    stage stage_type DEFAULT 'passport',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stage_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    doc_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    status document_status_type DEFAULT 'pending',
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
    position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    receiving_company_id UUID REFERENCES public.receiving_companies(id) ON DELETE SET NULL,
    stage stage_type,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'UGX',
    payment_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    payment_date DATE,
    due_date DATE,
    description TEXT,
    reference_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    alert_type alert_type DEFAULT 'info',
    priority alert_priority DEFAULT 'medium',
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stage_configs table
CREATE TABLE IF NOT EXISTS public.stage_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stage stage_type NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    description TEXT,
    required_documents TEXT[],
    estimated_cost DECIMAL(15,2),
    estimated_duration_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stage_history table
CREATE TABLE IF NOT EXISTS public.stage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    from_stage stage_type,
    to_stage stage_type NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_candidates_agent_id ON public.candidates(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON public.candidates(receiving_company_id) WHERE receiving_company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_position_id ON public.candidates(position_id) WHERE position_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_candidate_id ON public.documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON public.documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_payments_candidate_id ON public.payments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_payments_stage ON public.payments(stage);
CREATE INDEX IF NOT EXISTS idx_positions_receiving_company_id ON public.positions(receiving_company_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_candidate_id ON public.stage_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_from_stage ON public.stage_history(from_stage);
CREATE INDEX IF NOT EXISTS idx_stage_history_to_stage ON public.stage_history(to_stage);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_alerts_target_user ON public.alerts(target_user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status) WHERE is_active = true;

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
        VALUES (NEW.id, OLD.stage, NEW.stage, NEW.updated_at::text::uuid);
        
        NEW.stage_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_agents_modtime BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_receiving_companies_modtime BEFORE UPDATE ON public.receiving_companies FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_positions_modtime BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_candidates_modtime BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_alerts_modtime BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_stage_configs_modtime BEFORE UPDATE ON public.stage_configs FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_system_settings_modtime BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create trigger for stage change tracking
CREATE TRIGGER track_candidate_stage_change
BEFORE UPDATE OF stage ON public.candidates
FOR EACH ROW EXECUTE FUNCTION log_stage_change();
