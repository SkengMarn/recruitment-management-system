-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for agents table
CREATE INDEX IF NOT EXISTS idx_agents_agency_id ON public.agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agents_agency_name ON public.agents USING gin (agency_name gin_trgm_ops);

-- Indexes for alerts table
CREATE INDEX IF NOT EXISTS idx_alerts_candidate_id ON public.alerts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_alerts_alert_type ON public.alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON public.alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON public.alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON public.alerts(resolved);

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- Indexes for candidates table
CREATE INDEX IF NOT EXISTS idx_candidates_agent_id ON public.candidates(agent_id);
CREATE INDEX IF NOT EXISTS idx_candidates_receiving_company_id ON public.candidates(receiving_company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_full_name ON public.candidates USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidates_passport_number ON public.candidates(passport_number) WHERE passport_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_nin_number ON public.candidates(nin_number) WHERE nin_number IS NOT NULL;

-- Indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_candidate_id ON public.documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON public.documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_verified ON public.documents(is_verified);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON public.documents(expiry_date);

-- Indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_candidate_id ON public.payments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_payments_stage ON public.payments(stage);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);

-- Indexes for positions table
CREATE INDEX IF NOT EXISTS idx_positions_receiving_company_id ON public.positions(receiving_company_id);
CREATE INDEX IF NOT EXISTS idx_positions_is_active ON public.positions(is_active);
CREATE INDEX IF NOT EXISTS idx_positions_work_country ON public.positions(work_country);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Indexes for receiving_companies table
CREATE INDEX IF NOT EXISTS idx_receiving_companies_company_name ON public.receiving_companies USING gin (company_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_receiving_companies_country ON public.receiving_companies(country);
CREATE INDEX IF NOT EXISTS idx_receiving_companies_is_active ON public.receiving_companies(is_active);

-- Indexes for stage_history table
CREATE INDEX IF NOT EXISTS idx_stage_history_candidate_id ON public.stage_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_to_stage ON public.stage_history(to_stage);
CREATE INDEX IF NOT EXISTS idx_stage_history_updated_at ON public.stage_history(updated_at);
