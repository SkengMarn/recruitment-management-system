-- Jobs Module: Full CRUD operations and analytics for positions table
-- This module treats positions as jobs and provides comprehensive analytics

-- 1. Create job_analytics materialized view with comprehensive analytics
DROP MATERIALIZED VIEW IF EXISTS public.job_analytics CASCADE;

CREATE MATERIALIZED VIEW public.job_analytics AS
SELECT 
    -- Position Info
    p.id as position_id,
    p.position_name,
    p.receiving_company_id,
    COALESCE(rc.company_name, 'Unknown Company') as receiving_company_name,
    p.work_country,
    p.requested_headcount,
    p.salary,
    p.salary_currency,
    p.input_fee,
    p.input_fee_currency,
    p.contract_period,
    p.probation_period,
    p.min_age,
    p.max_age,
    -- Benefits as JSONB
    jsonb_build_object(
        'accommodation', COALESCE(p.accommodation, false),
        'food', COALESCE(p.food, false),
        'air_ticket', COALESCE(p.air_ticket, false),
        'transport', COALESCE(p.transport, false),
        'medical_insurance', COALESCE(p.medical_insurance, false),
        'employment_visa', COALESCE(p.employment_visa, false)
    ) as benefits,
    p.is_active,
    
    -- Candidate Pipeline
    COALESCE(candidate_stats.total_candidates, 0) as total_candidates,
    COALESCE(candidate_stats.active_candidates, 0) as active_candidates,
    COALESCE(candidate_stats.inactive_candidates, 0) as inactive_candidates,
    COALESCE(candidate_stats.candidates_by_stage, '{}'::jsonb) as candidates_by_stage,
    COALESCE(stage_stats.stage_avg_days, '{}'::jsonb) as stage_avg_days,
    COALESCE(stage_stats.stage_costs, '{}'::jsonb) as stage_costs,
    candidate_stats.latest_stage_update,
    
    -- Placements & Gaps
    COALESCE(candidate_stats.placements_count, 0) as placements_count,
    GREATEST(0, p.requested_headcount - COALESCE(candidate_stats.placements_count, 0)) as headcount_remaining,
    (COALESCE(candidate_stats.placements_count, 0) > p.requested_headcount) as overbooked,
    
    -- Agents & Contributions
    COALESCE(agent_stats.agents_count, 0) as agents_count,
    agent_stats.top_agent_id,
    agent_stats.top_agent_name,
    COALESCE(agent_stats.candidates_per_agent, '{}'::jsonb) as candidates_per_agent,
    
    -- Financials
    COALESCE(payment_stats.total_payments, 0) as total_payments,
    COALESCE(payment_stats.payments_by_stage, '{}'::jsonb) as payments_by_stage,
    (p.requested_headcount * COALESCE(p.input_fee, 0) - COALESCE(payment_stats.total_payments, 0)) as outstanding_input_fees,
    
    -- Audit/Updates
    GREATEST(
        p.updated_at,
        COALESCE(candidate_stats.latest_stage_update, p.updated_at),
        COALESCE(stage_stats.latest_stage_history_update, p.updated_at)
    ) as latest_update_at

FROM public.positions p
LEFT JOIN public.receiving_companies rc ON p.receiving_company_id = rc.id

-- Candidate statistics subquery
LEFT JOIN (
    SELECT 
        c.position,
        c.receiving_company_id,
        COUNT(*) as total_candidates,
        COUNT(*) FILTER (WHERE c.is_active = true) as active_candidates,
        COUNT(*) FILTER (WHERE c.is_active = false) as inactive_candidates,
        COUNT(*) FILTER (WHERE c.stage = 'deployed' AND c.is_active = true) as placements_count,
        MAX(c.stage_updated_at) as latest_stage_update,
        jsonb_object_agg(
            COALESCE(c.stage, 'unknown'), 
            COUNT(*) FILTER (WHERE c.stage IS NOT NULL)
        ) FILTER (WHERE c.stage IS NOT NULL) as candidates_by_stage
    FROM public.candidates c
    WHERE c.position IS NOT NULL AND c.receiving_company_id IS NOT NULL
    GROUP BY c.position, c.receiving_company_id
) candidate_stats ON p.position_name = candidate_stats.position 
                 AND p.receiving_company_id = candidate_stats.receiving_company_id

-- Stage history statistics subquery
LEFT JOIN (
    SELECT 
        c.position,
        c.receiving_company_id,
        jsonb_object_agg(
            sh.to_stage,
            ROUND(AVG(sh.days_in_previous_stage), 2)
        ) FILTER (WHERE sh.to_stage IS NOT NULL AND sh.days_in_previous_stage IS NOT NULL) as stage_avg_days,
        jsonb_object_agg(
            sh.to_stage,
            SUM(COALESCE(sh.cost, 0))
        ) FILTER (WHERE sh.to_stage IS NOT NULL) as stage_costs,
        MAX(sh.updated_at) as latest_stage_history_update
    FROM public.candidates c
    JOIN public.stage_history sh ON c.id = sh.candidate_id
    WHERE c.position IS NOT NULL AND c.receiving_company_id IS NOT NULL
    GROUP BY c.position, c.receiving_company_id
) stage_stats ON p.position_name = stage_stats.position 
              AND p.receiving_company_id = stage_stats.receiving_company_id

-- Agent statistics subquery
LEFT JOIN (
    SELECT 
        c.position,
        c.receiving_company_id,
        COUNT(DISTINCT c.agent_id) as agents_count,
        (
            SELECT a.id
            FROM public.candidates c2
            JOIN public.agents a ON c2.agent_id = a.id
            WHERE c2.position = c.position 
              AND c2.receiving_company_id = c.receiving_company_id
              AND c2.agent_id IS NOT NULL
            GROUP BY a.id
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ) as top_agent_id,
        (
            SELECT a.agency_name
            FROM public.candidates c2
            JOIN public.agents a ON c2.agent_id = a.id
            WHERE c2.position = c.position 
              AND c2.receiving_company_id = c.receiving_company_id
              AND c2.agent_id IS NOT NULL
            GROUP BY a.id, a.agency_name
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ) as top_agent_name,
        jsonb_object_agg(
            c.agent_id::text,
            COUNT(*)
        ) FILTER (WHERE c.agent_id IS NOT NULL) as candidates_per_agent
    FROM public.candidates c
    WHERE c.position IS NOT NULL 
      AND c.receiving_company_id IS NOT NULL
      AND c.agent_id IS NOT NULL
    GROUP BY c.position, c.receiving_company_id
) agent_stats ON p.position_name = agent_stats.position 
              AND p.receiving_company_id = agent_stats.receiving_company_id

-- Payment statistics subquery
LEFT JOIN (
    SELECT 
        c.position,
        c.receiving_company_id,
        SUM(pay.amount) as total_payments,
        jsonb_object_agg(
            pay.stage,
            SUM(pay.amount)
        ) FILTER (WHERE pay.stage IS NOT NULL) as payments_by_stage
    FROM public.candidates c
    JOIN public.payments pay ON c.id = pay.candidate_id
    WHERE c.position IS NOT NULL AND c.receiving_company_id IS NOT NULL
    GROUP BY c.position, c.receiving_company_id
) payment_stats ON p.position_name = payment_stats.position 
                AND p.receiving_company_id = payment_stats.receiving_company_id

ORDER BY p.created_at DESC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_analytics_position_id ON public.job_analytics(position_id);
CREATE INDEX IF NOT EXISTS idx_job_analytics_company_id ON public.job_analytics(receiving_company_id);
CREATE INDEX IF NOT EXISTS idx_job_analytics_work_country ON public.job_analytics(work_country);
CREATE INDEX IF NOT EXISTS idx_job_analytics_is_active ON public.job_analytics(is_active);
CREATE INDEX IF NOT EXISTS idx_job_analytics_position_name ON public.job_analytics USING gin (position_name gin_trgm_ops);

-- 2. Create function to refresh job analytics
CREATE OR REPLACE FUNCTION refresh_job_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.job_analytics;
    RAISE NOTICE 'Job analytics materialized view refreshed successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error refreshing job analytics: %', SQLERRM;
    -- Fallback to non-concurrent refresh
    REFRESH MATERIALIZED VIEW public.job_analytics;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Jobs CRUD functions

-- Get all jobs with filtering
CREATE OR REPLACE FUNCTION get_jobs(
    p_is_active boolean DEFAULT NULL,
    p_work_country text DEFAULT NULL,
    p_receiving_company_id uuid DEFAULT NULL,
    p_position_name_search text DEFAULT NULL,
    p_salary_min numeric DEFAULT NULL,
    p_salary_max numeric DEFAULT NULL,
    p_contract_period_min integer DEFAULT NULL,
    p_contract_period_max integer DEFAULT NULL,
    p_accommodation boolean DEFAULT NULL,
    p_food boolean DEFAULT NULL,
    p_air_ticket boolean DEFAULT NULL,
    p_transport boolean DEFAULT NULL,
    p_medical_insurance boolean DEFAULT NULL,
    p_employment_visa boolean DEFAULT NULL,
    p_limit integer DEFAULT 100,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    position_name text,
    receiving_company_id uuid,
    receiving_company_name text,
    work_country text,
    requested_headcount integer,
    salary numeric,
    salary_currency text,
    input_fee numeric,
    input_fee_currency text,
    contract_period integer,
    probation_period integer,
    min_age integer,
    max_age integer,
    accommodation boolean,
    food boolean,
    air_ticket boolean,
    transport boolean,
    medical_insurance boolean,
    employment_visa boolean,
    working_hours text,
    is_active boolean,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.position_name,
        p.receiving_company_id,
        COALESCE(rc.company_name, 'Unknown Company') as receiving_company_name,
        p.work_country,
        p.requested_headcount,
        p.salary,
        p.salary_currency,
        p.input_fee,
        p.input_fee_currency,
        p.contract_period,
        p.probation_period,
        p.min_age,
        p.max_age,
        p.accommodation,
        p.food,
        p.air_ticket,
        p.transport,
        p.medical_insurance,
        p.employment_visa,
        p.working_hours,
        p.is_active,
        p.created_at,
        p.updated_at
    FROM public.positions p
    LEFT JOIN public.receiving_companies rc ON p.receiving_company_id = rc.id
    WHERE 
        (p_is_active IS NULL OR p.is_active = p_is_active)
        AND (p_work_country IS NULL OR p.work_country ILIKE p_work_country)
        AND (p_receiving_company_id IS NULL OR p.receiving_company_id = p_receiving_company_id)
        AND (p_position_name_search IS NULL OR p.position_name ILIKE '%' || p_position_name_search || '%')
        AND (p_salary_min IS NULL OR p.salary >= p_salary_min)
        AND (p_salary_max IS NULL OR p.salary <= p_salary_max)
        AND (p_contract_period_min IS NULL OR p.contract_period >= p_contract_period_min)
        AND (p_contract_period_max IS NULL OR p.contract_period <= p_contract_period_max)
        AND (p_accommodation IS NULL OR p.accommodation = p_accommodation)
        AND (p_food IS NULL OR p.food = p_food)
        AND (p_air_ticket IS NULL OR p.air_ticket = p_air_ticket)
        AND (p_transport IS NULL OR p.transport = p_transport)
        AND (p_medical_insurance IS NULL OR p.medical_insurance = p_medical_insurance)
        AND (p_employment_visa IS NULL OR p.employment_visa = p_employment_visa)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Get single job by ID
CREATE OR REPLACE FUNCTION get_job_by_id(p_job_id uuid)
RETURNS TABLE (
    id uuid,
    position_name text,
    receiving_company_id uuid,
    receiving_company_name text,
    work_country text,
    requested_headcount integer,
    salary numeric,
    salary_currency text,
    input_fee numeric,
    input_fee_currency text,
    contract_period integer,
    probation_period integer,
    min_age integer,
    max_age integer,
    accommodation boolean,
    food boolean,
    air_ticket boolean,
    transport boolean,
    medical_insurance boolean,
    employment_visa boolean,
    working_hours text,
    is_active boolean,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.position_name,
        p.receiving_company_id,
        COALESCE(rc.company_name, 'Unknown Company') as receiving_company_name,
        p.work_country,
        p.requested_headcount,
        p.salary,
        p.salary_currency,
        p.input_fee,
        p.input_fee_currency,
        p.contract_period,
        p.probation_period,
        p.min_age,
        p.max_age,
        p.accommodation,
        p.food,
        p.air_ticket,
        p.transport,
        p.medical_insurance,
        p.employment_visa,
        p.working_hours,
        p.is_active,
        p.created_at,
        p.updated_at
    FROM public.positions p
    LEFT JOIN public.receiving_companies rc ON p.receiving_company_id = rc.id
    WHERE p.id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Create new job
CREATE OR REPLACE FUNCTION create_job(
    p_position_name text,
    p_receiving_company_id uuid,
    p_work_country text,
    p_requested_headcount integer,
    p_salary numeric DEFAULT NULL,
    p_salary_currency text DEFAULT 'USD',
    p_input_fee numeric DEFAULT NULL,
    p_input_fee_currency text DEFAULT 'UGX',
    p_contract_period integer DEFAULT 24,
    p_probation_period integer DEFAULT 3,
    p_min_age integer DEFAULT 18,
    p_max_age integer DEFAULT 65,
    p_accommodation boolean DEFAULT false,
    p_food boolean DEFAULT false,
    p_air_ticket boolean DEFAULT false,
    p_transport boolean DEFAULT false,
    p_medical_insurance boolean DEFAULT false,
    p_employment_visa boolean DEFAULT false,
    p_working_hours text DEFAULT '8 hours/day',
    p_is_active boolean DEFAULT true
)
RETURNS uuid AS $$
DECLARE
    new_job_id uuid;
BEGIN
    INSERT INTO public.positions (
        position_name,
        receiving_company_id,
        work_country,
        requested_headcount,
        salary,
        salary_currency,
        input_fee,
        input_fee_currency,
        contract_period,
        probation_period,
        min_age,
        max_age,
        accommodation,
        food,
        air_ticket,
        transport,
        medical_insurance,
        employment_visa,
        working_hours,
        is_active
    ) VALUES (
        p_position_name,
        p_receiving_company_id,
        p_work_country,
        p_requested_headcount,
        p_salary,
        p_salary_currency,
        p_input_fee,
        p_input_fee_currency,
        p_contract_period,
        p_probation_period,
        p_min_age,
        p_max_age,
        p_accommodation,
        p_food,
        p_air_ticket,
        p_transport,
        p_medical_insurance,
        p_employment_visa,
        p_working_hours,
        p_is_active
    ) RETURNING id INTO new_job_id;
    
    -- Refresh analytics after creating new job
    PERFORM refresh_job_analytics();
    
    RETURN new_job_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing job
CREATE OR REPLACE FUNCTION update_job(
    p_job_id uuid,
    p_position_name text DEFAULT NULL,
    p_receiving_company_id uuid DEFAULT NULL,
    p_work_country text DEFAULT NULL,
    p_requested_headcount integer DEFAULT NULL,
    p_salary numeric DEFAULT NULL,
    p_salary_currency text DEFAULT NULL,
    p_input_fee numeric DEFAULT NULL,
    p_input_fee_currency text DEFAULT NULL,
    p_contract_period integer DEFAULT NULL,
    p_probation_period integer DEFAULT NULL,
    p_min_age integer DEFAULT NULL,
    p_max_age integer DEFAULT NULL,
    p_accommodation boolean DEFAULT NULL,
    p_food boolean DEFAULT NULL,
    p_air_ticket boolean DEFAULT NULL,
    p_transport boolean DEFAULT NULL,
    p_medical_insurance boolean DEFAULT NULL,
    p_employment_visa boolean DEFAULT NULL,
    p_working_hours text DEFAULT NULL,
    p_is_active boolean DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    rows_affected integer;
BEGIN
    UPDATE public.positions SET
        position_name = COALESCE(p_position_name, position_name),
        receiving_company_id = COALESCE(p_receiving_company_id, receiving_company_id),
        work_country = COALESCE(p_work_country, work_country),
        requested_headcount = COALESCE(p_requested_headcount, requested_headcount),
        salary = COALESCE(p_salary, salary),
        salary_currency = COALESCE(p_salary_currency, salary_currency),
        input_fee = COALESCE(p_input_fee, input_fee),
        input_fee_currency = COALESCE(p_input_fee_currency, input_fee_currency),
        contract_period = COALESCE(p_contract_period, contract_period),
        probation_period = COALESCE(p_probation_period, probation_period),
        min_age = COALESCE(p_min_age, min_age),
        max_age = COALESCE(p_max_age, max_age),
        accommodation = COALESCE(p_accommodation, accommodation),
        food = COALESCE(p_food, food),
        air_ticket = COALESCE(p_air_ticket, air_ticket),
        transport = COALESCE(p_transport, transport),
        medical_insurance = COALESCE(p_medical_insurance, medical_insurance),
        employment_visa = COALESCE(p_employment_visa, employment_visa),
        working_hours = COALESCE(p_working_hours, working_hours),
        is_active = COALESCE(p_is_active, is_active),
        updated_at = NOW()
    WHERE id = p_job_id;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    IF rows_affected > 0 THEN
        -- Refresh analytics after updating job
        PERFORM refresh_job_analytics();
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Soft delete job (set is_active = false)
CREATE OR REPLACE FUNCTION delete_job(p_job_id uuid)
RETURNS boolean AS $$
DECLARE
    rows_affected integer;
BEGIN
    UPDATE public.positions SET
        is_active = false,
        updated_at = NOW()
    WHERE id = p_job_id;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    IF rows_affected > 0 THEN
        -- Refresh analytics after deleting job
        PERFORM refresh_job_analytics();
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Get job analytics
CREATE OR REPLACE FUNCTION get_job_analytics(
    p_position_id uuid DEFAULT NULL,
    p_is_active boolean DEFAULT NULL,
    p_work_country text DEFAULT NULL,
    p_receiving_company_id uuid DEFAULT NULL
)
RETURNS SETOF public.job_analytics AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.job_analytics
    WHERE 
        (p_position_id IS NULL OR position_id = p_position_id)
        AND (p_is_active IS NULL OR is_active = p_is_active)
        AND (p_work_country IS NULL OR work_country ILIKE p_work_country)
        AND (p_receiving_company_id IS NULL OR receiving_company_id = p_receiving_company_id)
    ORDER BY latest_update_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-refresh analytics on relevant changes
CREATE OR REPLACE FUNCTION trigger_refresh_job_analytics()
RETURNS trigger AS $$
BEGIN
    -- Schedule analytics refresh (async)
    PERFORM pg_notify('refresh_job_analytics', '');
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-refresh
DROP TRIGGER IF EXISTS trigger_positions_refresh_analytics ON public.positions;
CREATE TRIGGER trigger_positions_refresh_analytics
    AFTER INSERT OR UPDATE OR DELETE ON public.positions
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_job_analytics();

DROP TRIGGER IF EXISTS trigger_candidates_refresh_analytics ON public.candidates;
CREATE TRIGGER trigger_candidates_refresh_analytics
    AFTER INSERT OR UPDATE OR DELETE ON public.candidates
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_job_analytics();

DROP TRIGGER IF EXISTS trigger_payments_refresh_analytics ON public.payments;
CREATE TRIGGER trigger_payments_refresh_analytics
    AFTER INSERT OR UPDATE OR DELETE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_job_analytics();

-- Initial refresh of the materialized view
SELECT refresh_job_analytics();

-- Grant permissions
GRANT SELECT ON public.job_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION get_job_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_job_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION create_job TO authenticated;
GRANT EXECUTE ON FUNCTION update_job TO authenticated;
GRANT EXECUTE ON FUNCTION delete_job TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_job_analytics TO authenticated;
