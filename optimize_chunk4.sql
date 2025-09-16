-- Additional optimization script for Recruitment Management System
-- This script adds advanced indexing and query optimizations

-- 1. Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_candidates_stage_active ON public.candidates(stage, is_active);
CREATE INDEX IF NOT EXISTS idx_positions_active_country ON public.positions(is_active, work_country);
CREATE INDEX IF NOT EXISTS idx_documents_candidate_verified ON public.documents(candidate_id, is_verified);

-- 2. Add indexes for text search on important fields
CREATE INDEX IF NOT EXISTS idx_candidates_email_gin ON public.candidates USING gin (email gin_trgm_ops) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_phone_gin ON public.candidates USING gin (phone gin_trgm_ops) WHERE phone IS NOT NULL;

-- 3. Optimize payment-related queries
CREATE INDEX IF NOT EXISTS idx_payments_candidate_stage ON public.payments(candidate_id, stage, paid_at);
CREATE INDEX IF NOT EXISTS idx_payments_date_range ON public.payments(paid_at) WHERE paid_at IS NOT NULL;

-- 4. Add function-based indexes for case-insensitive searches
CREATE INDEX IF NOT EXISTS idx_candidates_lower_full_name ON public.candidates (LOWER(full_name));
CREATE INDEX IF NOT EXISTS idx_agents_lower_agency_name ON public.agents (LOWER(agency_name));

-- 5. Add index for position name search (using varchar_pattern_ops for better prefix matching)
CREATE INDEX IF NOT EXISTS idx_positions_position_name ON public.positions (position_name varchar_pattern_ops);

-- 6. Analyze tables to update statistics
ANALYZE public.agents;
ANALYZE public.candidates;
ANALYZE public.documents;
ANALYZE public.payments;
ANALYZE public.positions;
ANALYZE public.receiving_companies;

-- 7. Create a function to refresh all materialized views with CONCURRENTLY option
CREATE OR REPLACE FUNCTION refresh_materialized_views_concurrently()
RETURNS void AS $$
BEGIN
    -- Check if each view exists before refreshing
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_candidate_stage_summary') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_candidate_stage_summary;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_agent_performance') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_agent_performance;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_document_status') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_document_status;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_financial_summary') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_financial_summary;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_position_status') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_position_status;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error refreshing materialized views: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Add indexes on materialized views for common query patterns
CREATE INDEX IF NOT EXISTS idx_mv_position_status_country ON public.mv_position_status(work_country);
CREATE INDEX IF NOT EXISTS idx_mv_position_status_company ON public.mv_position_status(company_name);
CREATE INDEX IF NOT EXISTS idx_mv_agent_performance_agency ON public.mv_agent_performance(agency_name);

-- 9. Add a function to get candidate stage history with performance improvements
CREATE OR REPLACE FUNCTION get_candidate_stage_history(p_candidate_id UUID)
RETURNS TABLE (
    from_stage TEXT,
    to_stage TEXT,
    changed_at TIMESTAMPTZ,
    changed_by TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.from_stage::TEXT,
        sh.to_stage::TEXT,
        sh.updated_at as changed_at,
        COALESCE(p.full_name, 'System') as changed_by
    FROM public.stage_history sh
    LEFT JOIN public.profiles p ON sh.updated_by = p.id
    WHERE sh.candidate_id = p_candidate_id
    ORDER BY sh.updated_at DESC;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in get_candidate_stage_history: %', SQLERRM;
    RETURN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 10. Create a function to find similar candidates (for duplicate checking)
CREATE OR REPLACE FUNCTION find_similar_candidates(
    p_full_name TEXT,
    p_passport_number TEXT DEFAULT NULL,
    p_nin_number TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    passport_number TEXT,
    nin_number TEXT,
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.full_name,
        c.passport_number,
        c.nin_number,
        GREATEST(
            similarity(COALESCE(c.full_name, ''), COALESCE(p_full_name, '')),
            CASE WHEN p_passport_number IS NOT NULL AND c.passport_number IS NOT NULL 
                 THEN similarity(c.passport_number, p_passport_number) 
                 ELSE 0 
            END,
            CASE WHEN p_nin_number IS NOT NULL AND c.nin_number IS NOT NULL 
                 THEN similarity(c.nin_number, p_nin_number) 
                 ELSE 0 
            END
        ) as similarity_score
    FROM public.candidates c
    WHERE 
        (p_full_name IS NOT NULL AND c.full_name % p_full_name)
        OR (p_passport_number IS NOT NULL AND c.passport_number IS NOT NULL AND c.passport_number % p_passport_number)
        OR (p_nin_number IS NOT NULL AND c.nin_number IS NOT NULL AND c.nin_number % p_nin_number)
    ORDER BY similarity_score DESC
    LIMIT 10; -- Limit results to top 10 matches
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in find_similar_candidates: %', SQLERRM;
    RETURN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 11. Add a function to get position statistics
CREATE OR REPLACE FUNCTION get_position_statistics()
RETURNS TABLE (
    position_id UUID,
    position_name TEXT,
    company_name TEXT,
    work_country TEXT,
    requested_headcount INTEGER,
    filled_positions BIGINT,
    remaining_positions BIGINT,
    salary NUMERIC,
    salary_currency TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as position_id,
        p.position_name,
        COALESCE(rc.company_name, 'Unknown') as company_name,
        p.work_country,
        p.requested_headcount,
        COUNT(DISTINCT c.id) as filled_positions,
        GREATEST(0, p.requested_headcount - COUNT(DISTINCT c.id)) as remaining_positions,
        p.salary,
        p.salary_currency,
        p.is_active
    FROM public.positions p
    LEFT JOIN public.receiving_companies rc ON p.receiving_company_id = rc.id
    LEFT JOIN public.candidates c ON p.id::text = TRIM(c.position) AND c.is_active = true
    GROUP BY 
        p.id, p.position_name, rc.company_name, p.work_country, 
        p.requested_headcount, p.salary, p.salary_currency, p.is_active
    ORDER BY 
        COALESCE(rc.company_name, 'Unknown'), 
        p.position_name;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in get_position_statistics: %', SQLERRM;
    RETURN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
