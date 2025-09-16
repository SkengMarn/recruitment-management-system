-- Create materialized views for frequently accessed data

-- 1. Candidate Stage Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_candidate_stage_summary AS
SELECT 
    c.stage,
    COUNT(*) as total_candidates,
    COUNT(CASE WHEN c.is_active = true THEN 1 END) as active_candidates,
    AVG(EXTRACT(EPOCH FROM (NOW() - c.created_at))/86400)::integer as avg_days_in_stage,
    MAX(c.updated_at) as last_updated
FROM public.candidates c
GROUP BY c.stage;

-- 2. Agent Performance View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_agent_performance AS
SELECT 
    a.id as agent_id,
    a.agency_name,
    COUNT(DISTINCT c.id) as total_candidates,
    COUNT(DISTINCT CASE WHEN c.stage = 'travelled' THEN c.id END) as successful_placements,
    COALESCE(SUM(p.amount), 0) as total_revenue,
    COUNT(DISTINCT CASE WHEN c.is_active = false THEN c.id END) as archived_candidates,
    MAX(c.updated_at) as last_activity
FROM public.agents a
LEFT JOIN public.candidates c ON a.id = c.agent_id
LEFT JOIN public.payments p ON c.id = p.candidate_id
GROUP BY a.id, a.agency_name;

-- 3. Document Status View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_document_status AS
SELECT 
    c.id as candidate_id,
    c.full_name,
    COUNT(d.id) as total_documents,
    COUNT(CASE WHEN d.is_verified = true THEN 1 END) as verified_documents,
    COUNT(CASE WHEN d.expiry_date < NOW() THEN 1 END) as expired_documents,
    COUNT(CASE WHEN d.doc_type = 'passport' AND d.is_verified = true THEN 1 END) as has_valid_passport,
    COUNT(CASE WHEN d.doc_type = 'medical' AND d.is_verified = true AND d.expiry_date > NOW() THEN 1 END) as has_valid_medical
FROM public.candidates c
LEFT JOIN public.documents d ON c.id = d.candidate_id
GROUP BY c.id, c.full_name;

-- 4. Financial Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_financial_summary AS
SELECT 
    DATE_TRUNC('month', p.paid_at) as month,
    COUNT(DISTINCT p.candidate_id) as candidates_billed,
    SUM(p.amount) as total_revenue,
    COUNT(DISTINCT p.id) as total_transactions,
    AVG(p.amount) as avg_transaction_amount
FROM public.payments p
GROUP BY DATE_TRUNC('month', p.paid_at)
ORDER BY month DESC;

-- 5. Position Status View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_position_status AS
SELECT 
    p.id as position_id,
    p.position_name,
    rc.company_name,
    p.work_country,
    p.requested_headcount,
    COUNT(DISTINCT c.id) as filled_positions,
    CASE 
        WHEN p.requested_headcount > COUNT(DISTINCT c.id) 
        THEN p.requested_headcount - COUNT(DISTINCT c.id)
        ELSE 0 
    END as remaining_positions,
    p.salary,
    p.salary_currency,
    p.contract_period,
    p.is_active,
    p.created_at,
    p.updated_at
FROM public.positions p
JOIN public.receiving_companies rc ON p.receiving_company_id = rc.id
LEFT JOIN public.candidates c ON 
    p.id::text = TRIM(c.position)
    AND c.is_active = true
WHERE p.is_active = true
GROUP BY 
    p.id, 
    p.position_name, 
    rc.company_name, 
    p.work_country, 
    p.requested_headcount, 
    p.salary, 
    p.salary_currency, 
    p.contract_period,
    p.is_active,
    p.created_at,
    p.updated_at;

-- Create refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.mv_candidate_stage_summary;
    REFRESH MATERIALIZED VIEW public.mv_agent_performance;
    REFRESH MATERIALIZED VIEW public.mv_document_status;
    REFRESH MATERIALIZED VIEW public.mv_financial_summary;
    REFRESH MATERIALIZED VIEW public.mv_position_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes on materialized views
CREATE INDEX IF NOT EXISTS idx_mv_candidate_stage ON public.mv_candidate_stage_summary(stage);
CREATE INDEX IF NOT EXISTS idx_mv_agent_perf ON public.mv_agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_mv_doc_status ON public.mv_document_status(candidate_id);
CREATE INDEX IF NOT EXISTS idx_mv_financial_month ON public.mv_financial_summary(month);
CREATE INDEX IF NOT EXISTS idx_mv_position_status ON public.mv_position_status(position_id);
