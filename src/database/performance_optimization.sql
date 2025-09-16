-- Database Performance Optimization Script for Recruitment Management System
-- This script creates indexes, constraints, and functions to optimize query performance

-- =============================================
-- 1. CREATE INDEXES FOR FREQUENTLY QUERIED COLUMNS
-- =============================================

-- Indexes for candidates table
CREATE INDEX IF NOT EXISTS idx_candidates_agent_id ON public.candidates(agent_id);
CREATE INDEX IF NOT EXISTS idx_candidates_receiving_company_id ON public.candidates(receiving_company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_candidates_updated_at ON public.candidates(updated_at);
CREATE INDEX IF NOT EXISTS idx_candidates_full_name ON public.candidates USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidates_passport_number ON public.candidates(passport_number) WHERE passport_number IS NOT NULL;

-- Indexes for agents table
CREATE INDEX IF NOT EXISTS idx_agents_agency_id ON public.agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_agency_name ON public.agents USING gin (agency_name gin_trgm_ops);

-- Indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_candidate_id ON public.documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON public.documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_verified ON public.documents(is_verified);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON public.documents(expiry_date);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_candidate_id ON public.payments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_payments_agent_id ON public.payments(agent_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Indexes for positions table
CREATE INDEX IF NOT EXISTS idx_positions_company_id ON public.positions(company_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_title ON public.positions USING gin (title gin_trgm_ops);

-- Indexes for stage_history table
CREATE INDEX IF NOT EXISTS idx_stage_history_candidate_id ON public.stage_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_from_stage ON public.stage_history(from_stage);
CREATE INDEX IF NOT EXISTS idx_stage_history_to_stage ON public.stage_history(to_stage);
CREATE INDEX IF NOT EXISTS idx_stage_history_created_at ON public.stage_history(created_at);

-- Indexes for alerts table
CREATE INDEX IF NOT EXISTS idx_alerts_candidate_id ON public.alerts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_alerts_agent_id ON public.alerts(agent_id);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON public.alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_candidates_metadata ON public.candidates USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_agents_metadata ON public.agents USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_documents_metadata ON public.documents USING gin (metadata);

-- =============================================
-- 2. CREATE PARTIAL INDEXES FOR COMMON FILTERS
-- =============================================

-- Partial index for active candidates
CREATE INDEX IF NOT EXISTS idx_candidates_active ON public.candidates(id) 
WHERE deleted_at IS NULL;

-- Partial index for pending documents
CREATE INDEX IF NOT EXISTS idx_documents_pending_verification ON public.documents(id) 
WHERE is_verified = false AND deleted_at IS NULL;

-- Partial index for overdue payments
CREATE INDEX IF NOT EXISTS idx_payments_overdue ON public.payments(id) 
WHERE status = 'overdue' AND deleted_at IS NULL;

-- =============================================
-- 3. ADD FOREIGN KEY CONSTRAINTS WITH INDEXES
-- =============================================

-- Add missing foreign key constraints if they don't exist
DO $$
BEGIN
    -- Candidates foreign keys
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'candidates_agent_id_fkey'
    ) THEN
        ALTER TABLE public.candidates 
        ADD CONSTRAINT candidates_agent_id_fkey 
        FOREIGN KEY (agent_id) REFERENCES public.agents(id) 
        ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'candidates_receiving_company_id_fkey'
    ) THEN
        ALTER TABLE public.candidates 
        ADD CONSTRAINT candidates_receiving_company_id_fkey 
        FOREIGN KEY (receiving_company_id) REFERENCES public.receiving_companies(id) 
        ON DELETE SET NULL;
    END IF;

    -- Documents foreign keys
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'documents_candidate_id_fkey'
    ) THEN
        ALTER TABLE public.documents 
        ADD CONSTRAINT documents_candidate_id_fkey 
        FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) 
        ON DELETE CASCADE;
    END IF;

    -- Payments foreign keys
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_candidate_id_fkey'
    ) THEN
        ALTER TABLE public.payments 
        ADD CONSTRAINT payments_candidate_id_fkey 
        FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) 
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_agent_id_fkey'
    ) THEN
        ALTER TABLE public.payments 
        ADD CONSTRAINT payments_agent_id_fkey 
        FOREIGN KEY (agent_id) REFERENCES public.agents(id) 
        ON DELETE SET NULL;
    END IF;
END
$$;

-- =============================================
-- 4. CREATE MATERIALIZED VIEWS FOR REPORTING
-- =============================================

-- Materialized view for candidate status dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_candidate_status AS
SELECT 
    c.stage,
    COUNT(*) as total_candidates,
    COUNT(DISTINCT c.agent_id) as active_agents,
    COUNT(DISTINCT c.receiving_company_id) as active_companies,
    AVG(EXTRACT(DAY FROM NOW() - c.created_at)) as avg_days_in_system
FROM 
    public.candidates c
WHERE 
    c.deleted_at IS NULL
GROUP BY 
    c.stage
WITH DATA;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_candidate_status_stage 
ON public.mv_candidate_status (stage);

-- Materialized view for agent performance
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_agent_performance AS
SELECT 
    a.id as agent_id,
    a.agency_name,
    a.commission_rate,
    COUNT(DISTINCT c.id) as total_candidates,
    COUNT(DISTINCT CASE WHEN c.stage = 'deployed' THEN c.id END) as deployed_candidates,
    COUNT(DISTINCT p.id) as total_payments,
    COALESCE(SUM(p.amount), 0) as total_revenue,
    COALESCE(SUM(p.amount) * a.commission_rate / 100, 0) as total_commission
FROM 
    public.agents a
LEFT JOIN 
    public.candidates c ON a.id = c.agent_id AND c.deleted_at IS NULL
LEFT JOIN 
    public.payments p ON c.id = p.candidate_id AND p.deleted_at IS NULL
WHERE 
    a.deleted_at IS NULL
GROUP BY 
    a.id, a.agency_name, a.commission_rate
WITH DATA;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_agent_performance_agent_id 
ON public.mv_agent_performance (agent_id);

-- Materialized view for document expiry tracking
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_document_expiry AS
SELECT 
    c.id as candidate_id,
    c.full_name,
    d.id as document_id,
    d.doc_type,
    d.expiry_date,
    d.is_verified,
    d.verified_at,
    d.verified_by,
    EXTRACT(DAY FROM d.expiry_date - NOW()) as days_until_expiry
FROM 
    public.candidates c
JOIN 
    public.documents d ON c.id = d.candidate_id
WHERE 
    d.deleted_at IS NULL
    AND d.expiry_date IS NOT NULL
    AND d.expiry_date <= (NOW() + INTERVAL '90 days')
    AND d.is_verified = true
WITH DATA;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_document_expiry_expiry_date 
ON public.mv_document_expiry (expiry_date);

-- =============================================
-- 5. CREATE FUNCTIONS FOR COMMON OPERATIONS
-- =============================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_candidate_status;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_agent_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_document_expiry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search candidates with flexible criteria
CREATE OR REPLACE FUNCTION public.search_candidates(
    p_search_term TEXT DEFAULT NULL,
    p_agent_id UUID DEFAULT NULL,
    p_company_id UUID DEFAULT NULL,
    p_stage TEXT DEFAULT NULL,
    p_has_documents BOOLEAN DEFAULT NULL,
    p_has_payments BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    stage TEXT,
    agent_id UUID,
    agent_name TEXT,
    company_id UUID,
    company_name TEXT,
    document_count BIGINT,
    payment_total NUMERIC,
    last_updated TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY EXECUTE '
        WITH filtered_candidates AS (
            SELECT 
                c.*,
                a.agency_name as agent_name,
                rc.company_name,
                COUNT(DISTINCT d.id) as document_count,
                COALESCE(SUM(p.amount), 0) as payment_total,
                COUNT(*) OVER() as full_count
            FROM 
                public.candidates c
            LEFT JOIN 
                public.agents a ON c.agent_id = a.id
            LEFT JOIN 
                public.receiving_companies rc ON c.receiving_company_id = rc.id
            LEFT JOIN 
                public.documents d ON c.id = d.candidate_id AND d.deleted_at IS NULL
            LEFT JOIN 
                public.payments p ON c.id = p.candidate_id AND p.deleted_at IS NULL
            WHERE 
                c.deleted_at IS NULL
                AND ($1 IS NULL OR 
                     c.full_name ILIKE ''%'' || $1 || ''%'' OR 
                     c.email ILIKE ''%'' || $1 || ''%'' OR 
                     c.phone ILIKE ''%'' || $1 || ''%'')
                AND ($2 IS NULL OR c.agent_id = $2)
                AND ($3 IS NULL OR c.receiving_company_id = $3)
                AND ($4 IS NULL OR c.stage = $4)
            GROUP BY 
                c.id, a.agency_name, rc.company_name
            HAVING 
                ($5 IS NULL OR 
                 ($5 = true AND COUNT(DISTINCT d.id) > 0) OR 
                 ($5 = false AND COUNT(DISTINCT d.id) = 0))
               AND
                ($6 IS NULL OR 
                 ($6 = true AND COUNT(DISTINCT p.id) > 0) OR 
                 ($6 = false AND COUNT(DISTINCT p.id) = 0))
            ORDER BY 
                c.updated_at DESC
            LIMIT $7
            OFFSET $8
        )
        SELECT 
            c.id,
            c.full_name,
            c.email,
            c.phone,
            c.stage::TEXT,
            c.agent_id,
            c.agent_name,
            c.receiving_company_id as company_id,
            c.company_name,
            c.document_count,
            c.payment_total,
            c.updated_at as last_updated,
            c.full_count
        FROM 
            filtered_candidates c'
    USING 
        p_search_term, p_agent_id, p_company_id, p_stage::TEXT, 
        p_has_documents, p_has_payments, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get candidate timeline
CREATE OR REPLACE FUNCTION public.get_candidate_timeline(
    p_candidate_id UUID
)
RETURNS TABLE (
    event_type TEXT,
    event_time TIMESTAMPTZ,
    event_data JSONB,
    event_source TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Stage changes
    SELECT 
        'stage_change' as event_type,
        sh.created_at as event_time,
        jsonb_build_object(
            'from_stage', sh.from_stage,
            'to_stage', sh.to_stage,
            'notes', sh.notes,
            'updated_by', u.raw_user_meta_data->>'full_name'
        ) as event_data,
        'stage_history' as event_source
    FROM 
        public.stage_history sh
    LEFT JOIN 
        auth.users u ON sh.updated_by = u.id
    WHERE 
        sh.candidate_id = p_candidate_id
    
    UNION ALL
    
    -- Document uploads
    SELECT 
        'document_upload' as event_type,
        d.uploaded_at as event_time,
        jsonb_build_object(
            'document_type', d.doc_type,
            'file_name', d.file_name,
            'is_verified', d.is_verified,
            'verified_by', verifier.raw_user_meta_data->>'full_name',
            'verified_at', d.verified_at,
            'expiry_date', d.expiry_date
        ) as event_data,
        'documents' as event_source
    FROM 
        public.documents d
    LEFT JOIN 
        auth.users verifier ON d.verified_by = verifier.id
    WHERE 
        d.candidate_id = p_candidate_id
        AND d.deleted_at IS NULL
    
    UNION ALL
    
    -- Payments
    SELECT 
        'payment' as event_type,
        p.payment_date as event_time,
        jsonb_build_object(
            'amount', p.amount,
            'currency', p.currency,
            'payment_method', p.payment_method,
            'status', p.status,
            'notes', p.notes,
            'recorded_by', u.raw_user_meta_data->>'full_name'
        ) as event_data,
        'payments' as event_source
    FROM 
        public.payments p
    LEFT JOIN 
        auth.users u ON p.recorded_by = u.id
    WHERE 
        p.candidate_id = p_candidate_id
        AND p.deleted_at IS NULL
    
    UNION ALL
    
    -- Alerts
    SELECT 
        'alert' as event_type,
        a.created_at as event_time,
        jsonb_build_object(
            'title', a.title,
            'message', a.message,
            'priority', a.priority,
            'status', a.status,
            'assigned_to', u.raw_user_meta_data->>'full_name'
        ) as event_data,
        'alerts' as event_source
    FROM 
        public.alerts a
    LEFT JOIN 
        auth.users u ON a.assigned_to = u.id
    WHERE 
        a.candidate_id = p_candidate_id
        AND a.deleted_at IS NULL
    
    ORDER BY 
        event_time DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================
-- 6. CREATE TRIGGERS FOR DATA INTEGRITY
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I', 
                      t.table_name, t.table_name);
        
        EXECUTE format('CREATE TRIGGER update_%s_updated_at
                      BEFORE UPDATE ON %I
                      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
                      t.table_name, t.table_name);
    END LOOP;
END;
$$;

-- Function to prevent deletion of referenced records
CREATE OR REPLACE FUNCTION public.prevent_referenced_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Check if there are any references to this record
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name != TG_TABLE_NAME
        ) THEN
            -- Dynamic check for references
            EXECUTE format('
                DO $$
                DECLARE
                    ref_count INTEGER;
                    ref_table TEXT;
                    ref_column TEXT;
                    ref_constraint TEXT;
                BEGIN
                    SELECT 
                        COUNT(*),
                        tc.table_name,
                        kcu.column_name,
                        tc.constraint_name
                    INTO 
                        ref_count,
                        ref_table,
                        ref_column,
                        ref_constraint
                    FROM 
                        information_schema.table_constraints AS tc 
                        JOIN information_schema.key_column_usage AS kcu
                          ON tc.constraint_name = kcu.constraint_name
                          AND tc.table_schema = kcu.table_schema
                        JOIN information_schema.constraint_column_usage AS ccu
                          ON ccu.constraint_name = tc.constraint_name
                          AND ccu.table_schema = tc.table_schema
                    WHERE 
                        ccu.table_name = %L
                        AND ccu.column_name = ''id''
                        AND tc.constraint_type = ''FOREIGN KEY''
                        AND tc.table_name != %L
                    GROUP BY 
                        tc.table_name, kcu.column_name, tc.constraint_name
                    HAVING 
                        COUNT(*) > 0
                    LIMIT 1;

                    IF FOUND THEN
                        RAISE EXCEPTION 
                            ''Cannot delete record from %.%: referenced by %.% (constraint %)'',
                            TG_TABLE_SCHEMA, TG_TABLE_NAME, 
                            TG_TABLE_SCHEMA, ref_table, 
                            ref_constraint
                        USING 
                            HINT = ''You must first delete or update the referencing records.'';
                    END IF;
                END
                $$;
            ', TG_TABLE_NAME, TG_TABLE_NAME);
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables to prevent deletion of referenced records
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('schema_migrations', 'spatial_ref_sys')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS prevent_referenced_deletion_%s ON %I', 
                      t.table_name, t.table_name);
        
        EXECUTE format('CREATE TRIGGER prevent_referenced_deletion_%s
                      BEFORE DELETE ON %I
                      FOR EACH ROW EXECUTE FUNCTION public.prevent_referenced_deletion()',
                      t.table_name, t.table_name);
    END LOOP;
END;
$$;

-- =============================================
-- 7. CREATE SCHEDULED JOBS FOR MAINTENANCE
-- =============================================

-- Function to refresh materialized views on a schedule
CREATE OR REPLACE FUNCTION public.schedule_materialized_view_refresh()
RETURNS VOID AS $$
BEGIN
    -- Schedule job to refresh materialized views every hour
    IF NOT EXISTS (
        SELECT 1 
        FROM cron.job 
        WHERE jobname = 'refresh_materialized_views'
    ) THEN
        PERFORM cron.schedule(
            'refresh_materialized_views',
            '0 * * * *',  -- Every hour at minute 0
            'SELECT public.refresh_materialized_views()'
        );
    END IF;
    
    -- Schedule job to analyze tables daily at 2 AM
    IF NOT EXISTS (
        SELECT 1 
        FROM cron.job 
        WHERE jobname = 'analyze_tables'
    ) THEN
        PERFORM cron.schedule(
            'analyze_tables',
            '0 2 * * *',  -- Daily at 2:00 AM
            'ANALYZE VERBOSE;'
        );
    END IF;
    
    -- Schedule job to clean up soft-deleted records older than 30 days
    IF NOT EXISTS (
        SELECT 1 
        FROM cron.job 
        WHERE jobname = 'cleanup_deleted_records'
    ) THEN
        PERFORM cron.schedule(
            'cleanup_deleted_records',
            '0 3 * * 0',  -- Every Sunday at 3:00 AM
            $$
            DO $$
            BEGIN
                -- Clean up soft-deleted candidates and related records
                DELETE FROM public.documents 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < (NOW() - INTERVAL '30 days');
                
                DELETE FROM public.payments 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < (NOW() - INTERVAL '30 days');
                
                DELETE FROM public.candidates 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < (NOW() - INTERVAL '30 days');
                
                -- Clean up other soft-deleted records
                DELETE FROM public.agents 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < (NOW() - INTERVAL '30 days');
                
                DELETE FROM public.receiving_companies 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < (NOW() - INTERVAL '30 days');
                
                DELETE FROM public.positions 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < (NOW() - INTERVAL '30 days');
                
                -- Clean up expired sessions
                DELETE FROM auth.sessions 
                WHERE expires_at < NOW();
            END
            $$;
            $$
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the scheduling function
SELECT public.schedule_materialized_view_refresh();

-- =============================================
-- 8. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions on functions to appropriate roles
GRANT EXECUTE ON FUNCTION public.search_candidates(TEXT, UUID, UUID, TEXT, BOOLEAN, BOOLEAN, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_candidate_timeline(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_materialized_views() TO manager, admin;

-- Grant select on materialized views to appropriate roles
GRANT SELECT ON public.mv_candidate_status TO authenticated;
GRANT SELECT ON public.mv_agent_performance TO manager, admin;
GRANT SELECT ON public.mv_document_expiry TO authenticated;

-- =============================================
-- 9. OPTIMIZE DATABASE SETTINGS
-- =============================================

-- Adjust PostgreSQL configuration for better performance
-- Note: These settings should be adjusted based on your server's available resources
ALTER SYSTEM SET shared_buffers = '4GB';  -- 25% of available RAM
ALTER SYSTEM SET effective_cache_size = '12GB';  -- 75% of available RAM
ALTER SYSTEM SET work_mem = '32MB';  -- Adjust based on number of concurrent users
ALTER SYSTEM SET maintenance_work_mem = '1GB';  -- For maintenance operations
ALTER SYSTEM SET random_page_cost = '1.1';  -- For SSDs
ALTER SYSTEM SET effective_io_concurrency = '200';  -- For SSDs
ALTER SYSTEM SET max_worker_processes = '8';  -- Adjust based on CPU cores
ALTER SYSTEM SET max_parallel_workers_per_gather = '4';  -- Adjust based on workload
ALTER SYSTEM SET max_parallel_workers = '8';  -- Adjust based on CPU cores

-- Reload configuration
SELECT pg_reload_conf();

-- =============================================
-- 10. CREATE DATABASE MAINTENANCE PROCEDURES
-- =============================================

-- Procedure to reindex database
CREATE OR REPLACE PROCEDURE public.reindex_database()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Reindex all tables in the public schema
    EXECUTE (
        SELECT 'REINDEX SCHEMA public;';
    );
    
    -- Analyze all tables
    ANALYZE VERBOSE;
    
    -- Update statistics
    VACUUM (ANALYZE);
END;
$$;

-- Procedure to check for long-running queries
CREATE OR REPLACE FUNCTION public.get_long_running_queries(threshold_seconds INTEGER DEFAULT 60)
RETURNS TABLE (
    pid INTEGER,
    duration INTERVAL,
    query TEXT,
    username TEXT,
    application_name TEXT,
    client_addr INET,
    backend_start TIMESTAMPTZ,
    state TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.pid,
        NOW() - p.query_start AS duration,
        p.query,
        p.usename AS username,
        p.application_name,
        p.client_addr,
        p.backend_start,
        p.state
    FROM 
        pg_stat_activity p
    WHERE 
        p.query_start < (NOW() - (threshold_seconds * INTERVAL '1 second'))
        AND p.pid != pg_backend_pid()
        AND p.state != 'idle'
    ORDER BY 
        duration DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure to terminate long-running queries
CREATE OR REPLACE PROCEDURE public.terminate_long_running_queries(threshold_seconds INTEGER DEFAULT 300)
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT pid 
        FROM pg_stat_activity 
        WHERE query_start < (NOW() - (threshold_seconds * INTERVAL '1 second'))
        AND pid != pg_backend_pid()
        AND state != 'idle'
    LOOP
        RAISE NOTICE 'Terminating long-running query with PID: %', r.pid;
        PERFORM pg_terminate_backend(r.pid);
    END LOOP;
END;
$$;

-- =============================================
-- 11. CREATE MONITORING VIEWS
-- =============================================

-- View for database size and table statistics
CREATE OR REPLACE VIEW public.vw_database_stats AS
SELECT 
    d.datname AS database_name,
    pg_size_pretty(pg_database_size(d.datname)) AS database_size,
    COUNT(t.tablename) AS table_count,
    pg_size_pretty(SUM(pg_total_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)))) AS total_table_size,
    pg_size_pretty(SUM(pg_indexes_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)))) AS total_index_size
FROM 
    pg_database d
CROSS JOIN 
    pg_tables t
WHERE 
    d.datname = current_database()
    AND t.schemaname = 'public'
GROUP BY 
    d.datname;

-- View for table statistics and bloat
CREATE OR REPLACE VIEW public.vw_table_stats AS
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    c.reltuples AS row_estimate,
    pg_size_pretty(pg_total_relation_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname))) AS total_size,
    pg_size_pretty(pg_relation_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname))) AS table_size,
    pg_size_pretty(pg_indexes_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname))) AS index_size,
    pg_size_pretty(COALESCE(pg_total_relation_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname)) - pg_relation_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname)) - pg_indexes_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname)), 0)) AS toast_size,
    c.relpages AS pages,
    c.relallvisible AS visible_pages,
    c.relfrozenxid AS frozen_xid,
    age(c.relfrozenxid) AS xid_age,
    c.reltuples / NULLIF(c.relpages, 0) AS rows_per_page,
    pg_stat_get_last_autovacuum_time(c.oid) AS last_autovacuum,
    pg_stat_get_last_autoanalyze_time(c.oid) AS last_autoanalyze,
    pg_stat_get_last_vacuum_time(c.oid) AS last_vacuum,
    pg_stat_get_last_analyze_time(c.oid) AS last_analyze
FROM
    pg_class c
LEFT JOIN 
    pg_namespace n ON n.oid = c.relnamespace
WHERE 
    c.relkind = 'r'
    AND n.nspname = 'public'
ORDER BY 
    pg_total_relation_size(quote_ident(n.nspname) || '.' || quote_ident(c.relname)) DESC;

-- View for index usage statistics
CREATE OR REPLACE VIEW public.vw_index_usage AS
SELECT
    t.schemaname AS schema_name,
    t.tablename AS table_name,
    c.reltuples AS row_estimate,
    pg_size_pretty(pg_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename))) AS table_size,
    ix.schemaname AS index_schema,
    ix.indexname AS index_name,
    pg_size_pretty(pg_relation_size(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname))) AS index_size,
    ix.indexdef AS index_definition,
    pg_stat_get_blocks_fetched(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)) - 
        pg_stat_get_blocks_hit(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)) AS table_blocks_read,
    pg_stat_get_blocks_fetched(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname)) - 
        pg_stat_get_blocks_hit(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname)) AS index_blocks_read,
    pg_stat_get_numscans(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname)) AS index_scans,
    pg_stat_get_tuples_returned(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname)) AS rows_returned,
    pg_stat_get_tuples_fetched(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname)) AS rows_fetched,
    pg_stat_get_tuples_inserted(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname)) AS rows_inserted,
    pg_stat_get_tuples_updated(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname)) AS rows_updated,
    pg_stat_get_tuples_deleted(quote_ident(ix.schemaname) || '.' || quote_ident(ix.indexname)) AS rows_deleted
FROM
    pg_tables t
LEFT JOIN 
    pg_class c ON c.relname = t.tablename
LEFT JOIN 
    pg_indexes ix ON ix.tablename = t.tablename
WHERE 
    t.schemaname = 'public'
    AND c.relkind = 'r'
ORDER BY 
    t.tablename, ix.indexname;

-- =============================================
-- 12. CREATE DATABASE MAINTENANCE SCRIPT
-- =============================================

-- Script to run regular maintenance tasks
CREATE OR REPLACE PROCEDURE public.run_maintenance()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Log maintenance start
    RAISE NOTICE 'Starting database maintenance at %', NOW();
    
    -- Update statistics
    RAISE NOTICE 'Updating database statistics...';
    ANALYZE VERBOSE;
    
    -- Vacuum tables that need it
    RAISE NOTICE 'Running VACUUM ANALYZE...';
    VACUUM (ANALYZE, VERBOSE);
    
    -- Reindex tables with high bloat
    RAISE NOTICE 'Reindexing tables with high bloat...';
    PERFORM public.reindex_database();
    
    -- Refresh materialized views
    RAISE NOTICE 'Refreshing materialized views...';
    PERFORM public.refresh_materialized_views();
    
    -- Log maintenance completion
    RAISE NOTICE 'Database maintenance completed at %', NOW();
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error during maintenance: %', SQLERRM;
END;
$$;

-- Create a function to schedule maintenance
CREATE OR REPLACE FUNCTION public.schedule_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Schedule weekly maintenance (Sunday at 1 AM)
    IF NOT EXISTS (
        SELECT 1 
        FROM cron.job 
        WHERE jobname = 'weekly_maintenance'
    ) THEN
        PERFORM cron.schedule(
            'weekly_maintenance',
            '0 1 * * 0',  -- Every Sunday at 1:00 AM
            'CALL public.run_maintenance()'
        );
        RAISE NOTICE 'Scheduled weekly maintenance job';
    END IF;
    
    -- Schedule daily statistics update (Daily at 2 AM)
    IF NOT EXISTS (
        SELECT 1 
        FROM cron.job 
        WHERE jobname = 'daily_statistics_update'
    ) THEN
        PERFORM cron.schedule(
            'daily_statistics_update',
            '0 2 * * *',  -- Daily at 2:00 AM
            'ANALYZE VERBOSE;'
        );
        RAISE NOTICE 'Scheduled daily statistics update job';
    END IF;
    
    -- Schedule hourly materialized view refresh (Every hour at minute 15)
    IF NOT EXISTS (
        SELECT 1 
        FROM cron.job 
        WHERE jobname = 'hourly_view_refresh'
    ) THEN
        PERFORM cron.schedule(
            'hourly_view_refresh',
            '15 * * * *',  -- Every hour at minute 15
            'SELECT public.refresh_materialized_views()'
        );
        RAISE NOTICE 'Scheduled hourly materialized view refresh job';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the scheduling function
SELECT public.schedule_maintenance();

-- =============================================
-- 13. CREATE DATABASE DOCUMENTATION VIEWS
-- =============================================

-- View for table documentation
CREATE OR REPLACE VIEW public.vw_table_documentation AS
SELECT
    t.table_schema,
    t.table_name,
    obj_description((t.table_schema || '.' || t.table_name)::regclass, 'pg_class') AS table_description,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    col_description((t.table_schema || '.' || t.table_name || '.' || c.column_name)::regclass, c.ordinal_position) AS column_description,
    (
        SELECT array_agg(constraint_type)
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = t.table_schema
        AND tc.table_name = t.table_name
        AND kcu.column_name = c.column_name
    ) AS constraints,
    (
        SELECT array_agg(
            jsonb_build_object(
                'constraint_name', tc.constraint_name,
                'constraint_type', tc.constraint_type,
                'foreign_table', ccu.table_schema || '.' || ccu.table_name,
                'foreign_column', ccu.column_name
            )
        )
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
            AND tc.table_schema = ccu.constraint_schema
        WHERE tc.table_schema = t.table_schema
        AND tc.table_name = t.table_name
        AND kcu.column_name = c.column_name
        AND tc.constraint_type = 'FOREIGN KEY'
    ) AS foreign_keys
FROM
    information_schema.tables t
JOIN
    information_schema.columns c
    ON t.table_schema = c.table_schema
    AND t.table_name = c.table_name
WHERE
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY
    t.table_schema,
    t.table_name,
    c.ordinal_position;

-- View for function documentation
CREATE OR REPLACE VIEW public.vw_function_documentation AS
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS function_arguments,
    t.typname AS return_type,
    pg_get_functiondef(p.oid) AS function_definition,
    obj_description(p.oid, 'pg_proc') AS function_description,
    l.lanname AS language,
    p.provolatile AS volatility,
    p.proisstrict AS is_strict,
    p.prosecdef AS is_security_definer,
    p.proleakproof AS is_leakproof,
    p.proiswindow AS is_window_function,
    p.proretset AS returns_set,
    p.procost AS estimated_cost,
    p.prorows AS estimated_rows
FROM
    pg_proc p
LEFT JOIN
    pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN
    pg_language l ON p.prolang = l.oid
LEFT JOIN
    pg_type t ON p.prorettype = t.oid
WHERE
    n.nspname = 'public'
    AND p.prokind = 'f'  -- Only functions (not procedures or aggregates)
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY
    n.nspname,
    p.proname;

-- =============================================
-- 14. FINAL SETUP
-- =============================================

-- Create a function to document the database
CREATE OR REPLACE FUNCTION public.generate_database_documentation()
RETURNS TABLE (
    object_type TEXT,
    object_name TEXT,
    object_definition TEXT,
    object_description TEXT,
    related_objects JSONB
) AS $$
BEGIN
    -- Tables and columns
    RETURN QUERY
    SELECT 
        'TABLE'::TEXT AS object_type,
        t.table_name AS object_name,
        NULL::TEXT AS object_definition,
        obj_description((t.table_schema || '.' || t.table_name)::regclass, 'pg_class') AS object_description,
        jsonb_build_object(
            'columns', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'column_name', c.column_name,
                        'data_type', c.data_type,
                        'is_nullable', c.is_nullable,
                        'column_default', c.column_default,
                        'description', col_description((t.table_schema || '.' || t.table_name || '.' || c.column_name)::regclass, c.ordinal_position)
                    )
                    ORDER BY c.ordinal_position
                )
                FROM information_schema.columns c
                WHERE c.table_schema = t.table_schema
                AND c.table_name = t.table_name
            ),
            'constraints', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'constraint_name', tc.constraint_name,
                        'constraint_type', tc.constraint_type,
                        'constraint_definition', pg_get_constraintdef(con.oid),
                        'referenced_table', ccu.table_schema || '.' || ccu.table_name,
                        'referenced_columns', ccu.column_name
                    )
                )
                FROM information_schema.table_constraints tc
                LEFT JOIN information_schema.constraint_column_usage ccu
                    ON tc.constraint_name = ccu.constraint_name
                    AND tc.table_schema = ccu.constraint_schema
                LEFT JOIN pg_constraint con
                    ON con.conname = tc.constraint_name
                WHERE tc.table_schema = t.table_schema
                AND tc.table_name = t.table_name
            )
        ) AS related_objects
    FROM 
        information_schema.tables t
    WHERE 
        t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
    
    UNION ALL
    
    -- Functions
    SELECT 
        'FUNCTION'::TEXT AS object_type,
        p.proname || '(' || pg_get_function_arguments(p.oid) || ')' AS object_name,
        pg_get_functiondef(p.oid) AS object_definition,
        obj_description(p.oid, 'pg_proc') AS object_description,
        jsonb_build_object(
            'return_type', t.typname,
            'language', l.lanname,
            'volatility', 
                CASE p.provolatile 
                    WHEN 'i' THEN 'IMMUTABLE' 
                    WHEN 's' THEN 'STABLE' 
                    WHEN 'v' THEN 'VOLATILE' 
                END,
            'security_definer', p.prosecdef,
            'estimated_cost', p.procost,
            'estimated_rows', p.prorows
        ) AS related_objects
    FROM 
        pg_proc p
    LEFT JOIN 
        pg_namespace n ON p.pronamespace = n.oid
    LEFT JOIN 
        pg_language l ON p.prolang = l.oid
    LEFT JOIN 
        pg_type t ON p.prorettype = t.oid
    WHERE 
        n.nspname = 'public'
        AND p.prokind = 'f'
    
    UNION ALL
    
    -- Views
    SELECT 
        'VIEW'::TEXT AS object_type,
        v.table_name AS object_name,
        v.view_definition AS object_definition,
        obj_description((v.table_schema || '.' || v.table_name)::regclass, 'pg_class') AS object_description,
        NULL::JSONB AS related_objects
    FROM 
        information_schema.views v
    WHERE 
        v.table_schema = 'public'
    
    ORDER BY 
        object_type,
        object_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant permissions on documentation views
GRANT SELECT ON public.vw_table_documentation TO authenticated;
GRANT SELECT ON public.vw_function_documentation TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_database_documentation() TO authenticated;

-- Notify completion
RAISE NOTICE 'Database performance optimization script completed successfully';

-- Create a function to check if all optimizations are in place
CREATE OR REPLACE FUNCTION public.check_optimization_status()
RETURNS TABLE (
    optimization_type TEXT,
    object_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check indexes
    RETURN QUERY
    SELECT 
        'INDEX'::TEXT AS optimization_type,
        schemaname || '.' || indexname AS object_name,
        'EXISTS'::TEXT AS status,
        indexdef AS details
    FROM 
        pg_indexes
    WHERE 
        schemaname = 'public'
        AND indexname LIKE 'idx_%'
    
    UNION ALL
    
    -- Check materialized views
    SELECT 
        'MATERIALIZED VIEW'::TEXT AS optimization_type,
        schemaname || '.' || matviewname AS object_name,
        'EXISTS'::TEXT AS status,
        'Size: ' || pg_size_pretty(pg_total_relation_size(schemaname || '.' || matviewname)) AS details
    FROM 
        pg_matviews
    WHERE 
        schemaname = 'public'
        AND matviewname LIKE 'mv_%'
    
    UNION ALL
    
    -- Check functions
    SELECT 
        'FUNCTION'::TEXT AS optimization_type,
        n.nspname || '.' || p.proname AS object_name,
        'EXISTS'::TEXT AS status,
        'Returns ' || t.typname AS details
    FROM 
        pg_proc p
    JOIN 
        pg_namespace n ON p.pronamespace = n.oid
    JOIN 
        pg_type t ON p.prorettype = t.oid
    WHERE 
        n.nspname = 'public'
        AND p.proname IN ('search_candidates', 'get_candidate_timeline', 'refresh_materialized_views')
    
    ORDER BY 
        optimization_type, 
        object_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Execute the optimization status check
SELECT * FROM public.check_optimization_status();
