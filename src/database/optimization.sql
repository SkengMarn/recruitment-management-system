-- Database Optimization Script for Recruitment Management System

-- 1. Create missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidates_agent_id ON public.candidates(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_receiving_company_id ON public.candidates(receiving_company_id) WHERE receiving_company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_candidate_id ON public.documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON public.documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_payments_candidate_id ON public.payments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_payments_stage ON public.payments(stage);
CREATE INDEX IF NOT EXISTS idx_positions_receiving_company_id ON public.positions(receiving_company_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_candidate_id ON public.stage_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_from_stage ON public.stage_history(from_stage);
CREATE INDEX IF NOT EXISTS idx_stage_history_to_stage ON public.stage_history(to_stage);

-- 2. Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_data ON public.audit_logs USING GIN (old_data);
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_data ON public.audit_logs USING GIN (new_data);
CREATE INDEX IF NOT EXISTS idx_system_settings_setting_value ON public.system_settings USING GIN (setting_value);

-- 3. Create function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to track stage changes
CREATE OR REPLACE FUNCTION track_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stage <> OLD.stage THEN
        INSERT INTO public.stage_history (
            candidate_id, 
            from_stage, 
            to_stage, 
            updated_by,
            days_in_previous_stage
        )
        VALUES (
            NEW.id, 
            OLD.stage, 
            NEW.stage,
            auth.uid(),
            EXTRACT(DAY FROM (NOW() - NEW.stage_updated_at))
        );
        
        NEW.stage_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to calculate candidate age
CREATE OR REPLACE FUNCTION calculate_age(date_of_birth DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(NOW(), date_of_birth));
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Create materialized view for dashboard metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.dashboard_metrics AS
WITH 
stage_counts AS (
    SELECT 
        stage,
        COUNT(*) as count
    FROM 
        public.candidates
    WHERE 
        is_active = true
    GROUP BY 
        stage
),
agent_stats AS (
    SELECT 
        a.id as agent_id,
        a.agency_name,
        COUNT(c.id) as total_candidates,
        COUNT(c.id) FILTER (WHERE c.stage = 'deployment') as deployed_candidates,
        COALESCE(SUM(p.amount), 0) as total_revenue
    FROM 
        public.agents a
    LEFT JOIN 
        public.candidates c ON a.id = c.agent_id
    LEFT JOIN 
        public.payments p ON c.id = p.candidate_id
    WHERE 
        a.is_active = true
    GROUP BY 
        a.id, a.agency_name
)
SELECT 
    (SELECT COUNT(*) FROM public.candidates WHERE is_active = true) as total_candidates,
    (SELECT COUNT(*) FROM public.candidates WHERE is_active = true AND stage = 'deployment') as deployed_candidates,
    (SELECT COUNT(*) FROM public.agents WHERE is_active = true) as active_agents,
    (SELECT COUNT(*) FROM public.receiving_companies WHERE is_active = true) as active_companies,
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments) as total_revenue,
    (SELECT jsonb_object_agg(stage, count) FROM stage_counts) as stage_distribution,
    (SELECT jsonb_agg(jsonb_build_object(
        'agent_id', agent_id,
        'agency_name', agency_name,
        'total_candidates', total_candidates,
        'deployed_candidates', deployed_candidates,
        'success_rate', CASE WHEN total_candidates > 0 THEN ROUND((deployed_candidates::numeric / total_candidates) * 100, 2) ELSE 0 END,
        'total_revenue', total_revenue
    )) FROM agent_stats) as agent_performance;

-- 7. Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_metrics;
END;
$$ LANGUAGE plpgsql;

-- 8. Create scheduled job to refresh materialized views
SELECT cron.schedule(
    'refresh-dashboard-metrics',
    '*/15 * * * *',  -- Every 15 minutes
    'SELECT refresh_materialized_views()'
);

-- 9. Create function to search candidates with full-text search
CREATE OR REPLACE FUNCTION search_candidates(search_term TEXT)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    passport_number TEXT,
    stage TEXT,
    agent_name TEXT,
    company_name TEXT,
    relevance NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.full_name,
        c.passport_number,
        c.stage::TEXT,
        a.agency_name as agent_name,
        rc.company_name,
        ts_rank(
            to_tsvector('english', 
                COALESCE(c.full_name, '') || ' ' ||
                COALESCE(c.passport_number, '') || ' ' ||
                COALESCE(c.phone, '') || ' ' ||
                COALESCE(c.email, '') || ' ' ||
                COALESCE(a.agency_name, '') || ' ' ||
                COALESCE(rc.company_name, '')
            ),
            plainto_tsquery('english', search_term)
        ) as relevance
    FROM 
        public.candidates c
    LEFT JOIN 
        public.agents a ON c.agent_id = a.id
    LEFT JOIN 
        public.receiving_companies rc ON c.receiving_company_id = rc.id
    WHERE 
        to_tsvector('english', 
            COALESCE(c.full_name, '') || ' ' ||
            COALESCE(c.passport_number, '') || ' ' ||
            COALESCE(c.phone, '') || ' ' ||
            COALESCE(c.email, '') || ' ' ||
            COALESCE(a.agency_name, '') || ' ' ||
            COALESCE(rc.company_name, '')
        ) @@ plainto_tsquery('english', search_term)
    ORDER BY 
        relevance DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- 10. Create function to get candidate timeline
CREATE OR REPLACE FUNCTION get_candidate_timeline(candidate_id UUID)
RETURNS TABLE (
    event_type TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'stage_change' as event_type,
        sh.updated_at as event_date,
        CONCAT('Moved from ', sh.from_stage, ' to ', sh.to_stage) as description,
        jsonb_build_object(
            'from_stage', sh.from_stage,
            'to_stage', sh.to_stage,
            'updated_by', p.full_name,
            'days_in_previous_stage', sh.days_in_previous_stage,
            'cost', sh.cost,
            'notes', sh.notes
        ) as details
    FROM 
        public.stage_history sh
    LEFT JOIN 
        public.profiles p ON sh.updated_by = p.id
    WHERE 
        sh.candidate_id = $1
    
    UNION ALL
    
    SELECT 
        'document_upload' as event_type,
        d.uploaded_at as event_date,
        CONCAT('Document uploaded: ', d.doc_type) as description,
        jsonb_build_object(
            'document_type', d.doc_type,
            'file_name', d.doc_name,
            'verified', d.is_verified,
            'verified_by', p.full_name,
            'expiry_date', d.expiry_date
        ) as details
    FROM 
        public.documents d
    LEFT JOIN 
        public.profiles p ON d.verified_by = p.id
    WHERE 
        d.candidate_id = $1
    
    UNION ALL
    
    SELECT 
        'payment' as event_type,
        p.paid_at as event_date,
        CONCAT('Payment for stage: ', p.stage) as description,
        jsonb_build_object(
            'amount', p.amount,
            'currency', p.currency,
            'payment_method', p.payment_method,
            'reference_number', p.reference_number,
            'notes', p.notes,
            'paid_by', pr.full_name
        ) as details
    FROM 
        public.payments p
    LEFT JOIN 
        public.profiles pr ON p.paid_by = pr.id
    WHERE 
        p.candidate_id = $1
    
    ORDER BY 
        event_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;
