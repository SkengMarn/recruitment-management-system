-- Audit logging system for Recruitment Management System

-- Create audit schema if not exists
CREATE SCHEMA IF NOT EXISTS audit;

-- Create enum for operation types
CREATE TYPE audit.operation_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- Main audit log table
CREATE TABLE IF NOT EXISTS audit.logs (
    id BIGSERIAL PRIMARY KEY,
    schema_name TEXT NOT NULL,
    table_name TEXT NOT NULL,
    operation audit.operation_type NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    query TEXT,
    client_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit.logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit.logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit.logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_by ON audit.logs(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit.logs(record_id);

-- Function to log changes
CREATE OR REPLACE FUNCTION audit.if_modified_func()
RETURNS TRIGGER AS $$
DECLARE
    audit_row audit.logs;
    include_values BOOLEAN;
    log_diffs BOOLEAN;
    h_old_data JSONB;
    h_new_data JSONB;
    excluded_cols TEXT[] = ARRAY['created_at', 'updated_at', 'last_login'];
BEGIN
    -- Create partitions for the next 12 months
    FOR i IN 0..11 LOOP
        partition_start := DATE_TRUNC('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        partition_end := partition_start + '1 month';
        partition_name := 'audit_logs_' || TO_CHAR(partition_start, 'YYYY_MM');
        
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_tables 
            WHERE schemaname = 'audit' 
            AND tablename = partition_name
        ) THEN
            EXECUTE format('
                CREATE TABLE audit.%I 
                PARTITION OF audit.logs 
                FOR VALUES FROM (%L) TO (%L)
            ', partition_name, partition_start, partition_end);
            
            -- Create indexes on each partition
            EXECUTE format('
                CREATE INDEX idx_%s_table ON audit.%I (table_name);
                CREATE INDEX idx_%s_timestamp ON audit.%I (action_tstamp);
                CREATE INDEX idx_%s_user ON audit.%I (user_id);
                CREATE INDEX idx_%s_record ON audit.%I (record_id) WHERE record_id IS NOT NULL;
                CREATE INDEX idx_%s_entity ON audit.%I USING GIN (entity_type gin_trgm_ops);
            ', 
                partition_name, partition_name,
                partition_name, partition_name,
                partition_name, partition_name,
                partition_name, partition_name,
                partition_name, partition_name
            );
        END IF;
    END LOOP;
END
$$;

-- Create a function to automatically manage partitions
CREATE OR REPLACE FUNCTION audit.manage_audit_partitions()
RETURNS TRIGGER AS $$
DECLARE
    partition_start DATE;
    partition_end DATE;
    partition_name TEXT;
    drop_date DATE;
    drop_partition_name TEXT;
BEGIN
    -- Create new partition for next month if it doesn't exist
    partition_start := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_end := partition_start + INTERVAL '1 month';
    partition_name := 'audit_logs_' || TO_CHAR(partition_start, 'YYYY_MM');
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'audit' 
        AND tablename = partition_name
    ) THEN
        EXECUTE format('
            CREATE TABLE audit.%I 
            PARTITION OF audit.logs 
            FOR VALUES FROM (%L) TO (%L)
        ', partition_name, partition_start, partition_end);
        
        -- Create indexes on the new partition
        EXECUTE format('
            CREATE INDEX idx_%s_table ON audit.%I (table_name);
            CREATE INDEX idx_%s_timestamp ON audit.%I (action_tstamp);
            CREATE INDEX idx_%s_user ON audit.%I (user_id);
            CREATE INDEX idx_%s_record ON audit.%I (record_id) WHERE record_id IS NOT NULL;
            CREATE INDEX idx_%s_entity ON audit.%I USING GIN (entity_type gin_trgm_ops);
        ', 
            partition_name, partition_name,
            partition_name, partition_name,
            partition_name, partition_name,
            partition_name, partition_name,
            partition_name, partition_name
        );
        
        RAISE NOTICE 'Created new audit log partition: %', partition_name;
    END IF;
    
    -- Drop old partitions (older than 1 year)
    drop_date := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 year');
    drop_partition_name := 'audit_logs_' || TO_CHAR(drop_date, 'YYYY_MM');
    
    IF EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'audit' 
        AND tablename = drop_partition_name
    ) THEN
        EXECUTE format('DROP TABLE IF EXISTS audit.%I', drop_partition_name);
        RAISE NOTICE 'Dropped old audit log partition: %', drop_partition_name;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a monthly scheduled job to manage partitions
CREATE OR REPLACE FUNCTION audit.schedule_partition_management()
RETURNS VOID AS $$
BEGIN
    -- Check if the job already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'audit' 
        AND p.proname = 'manage_audit_partitions'
    ) THEN
        -- Create a dummy trigger function that will be called by the scheduler
        CREATE OR REPLACE FUNCTION audit.manage_audit_partitions_trigger()
        RETURNS TRIGGER AS $$
        BEGIN
            PERFORM audit.manage_audit_partitions();
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create a dummy table to trigger the function
        CREATE TABLE IF NOT EXISTS audit.partition_management_trigger (
            id SERIAL PRIMARY KEY,
            last_updated TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Create a trigger that will be called by the scheduler
        CREATE TRIGGER trigger_manage_audit_partitions
        AFTER INSERT ON audit.partition_management_trigger
        FOR EACH STATEMENT
        EXECUTE FUNCTION audit.manage_audit_partitions_trigger();
        
        -- Schedule the job to run on the first day of each month
        PERFORM cron.schedule(
            'audit-partition-management',
            '0 0 1 * *', -- At 00:00 on day-of-month 1
            'INSERT INTO audit.partition_management_trigger DEFAULT VALUES;'
        );
        
        RAISE NOTICE 'Scheduled monthly audit partition management job';
    END IF;
    
    -- Run the management function immediately to ensure current month's partition exists
    PERFORM audit.manage_audit_partitions();
END;
$$ LANGUAGE plpgsql;

-- Enable the scheduled job
SELECT audit.schedule_partition_management();

-- Create a function to log changes to the audit table
CREATE OR REPLACE FUNCTION audit.log_change()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_client_ip INET;
    v_user_agent TEXT;
    v_app_name TEXT;
    v_tx_id BIGINT;
    v_old_data JSONB;
    v_new_data JSONB;
    v_changed_fields TEXT[];
    v_record_id UUID;
BEGIN
    -- Get the current user ID from JWT claims
    BEGIN
        v_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;
    
    -- Get client IP and user agent from request headers
    BEGIN
        v_client_ip := COALESCE(
            current_setting('request.header.x-real-ip', true)::INET,
            current_setting('request.header.x-forwarded-for', true)::INET,
            inet_client_addr()
        );
        v_user_agent := current_setting('request.header.user-agent', true);
        v_app_name := current_setting('application_name', true);
    EXCEPTION WHEN OTHERS THEN
        -- Ignore errors if settings are not available
        NULL;
    END;
    
    -- Get the current transaction ID
    v_tx_id := txid_current();
    
    -- Handle different operation types
    IF TG_OP = 'INSERT' THEN
        v_record_id := NEW.id;
        v_new_data := to_jsonb(NEW);
        v_old_data := NULL;
        v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_new_data));
    ELSIF TG_OP = 'UPDATE' THEN
        v_record_id := NEW.id;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        
        -- Find changed fields
        SELECT array_agg(key) INTO v_changed_fields
        FROM (
            SELECT key
            FROM jsonb_each_text(v_old_data) AS old_data
            FULL OUTER JOIN jsonb_each_text(v_new_data) AS new_data USING (key)
            WHERE old_data.value IS DISTINCT FROM new_data.value
        ) AS changed;
    ELSIF TG_OP = 'DELETE' THEN
        v_record_id := OLD.id;
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
        v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_old_data));
    END IF;
    
    -- Remove sensitive data
    v_old_data := v_old_data - ARRAY['password', 'refresh_token', 'email_change_token', 'reauthentication_token', 'encryption_key'];
    v_new_data := v_new_data - ARRAY['password', 'refresh_token', 'email_change_token', 'reauthentication_token', 'encryption_key'];
    
    -- Insert the audit record
    INSERT INTO audit.logs (
        schema_name,
        table_name,
        record_id,
        user_id,
        action,
        old_data,
        new_data,
        changed_fields,
        client_ip,
        user_agent,
        transaction_id,
        application_name
    ) VALUES (
        TG_TABLE_SCHEMA,
        TG_TABLE_NAME,
        v_record_id,
        v_user_id,
        SUBSTRING(TG_OP, 1, 1),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN v_old_data ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN v_new_data ELSE NULL END,
        v_changed_fields,
        v_client_ip,
        v_user_agent,
        v_tx_id,
        v_app_name
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create audit triggers on a table
CREATE OR REPLACE FUNCTION audit.enable_auditing(
    p_schema_name TEXT DEFAULT 'public',
    p_table_name TEXT
)
RETURNS VOID AS $$
DECLARE
    v_trigger_name TEXT;
BEGIN
    v_trigger_name := 'audit_trigger_' || p_table_name;
    
    -- Drop existing trigger if it exists
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I', 
                  v_trigger_name, p_schema_name, p_table_name);
    
    -- Create the trigger
    EXECUTE format('CREATE TRIGGER %I
                   AFTER INSERT OR UPDATE OR DELETE ON %I.%I
                   FOR EACH ROW EXECUTE FUNCTION audit.log_change()',
                  v_trigger_name, p_schema_name, p_table_name);
    
    RAISE NOTICE 'Enabled auditing on %.%', p_schema_name, p_table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to disable auditing on a table
CREATE OR REPLACE FUNCTION audit.disable_auditing(
    p_schema_name TEXT DEFAULT 'public',
    p_table_name TEXT
)
RETURNS VOID AS $$
DECLARE
    v_trigger_name TEXT;
BEGIN
    v_trigger_name := 'audit_trigger_' || p_table_name;
    
    -- Drop the trigger
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I', 
                  v_trigger_name, p_schema_name, p_table_name);
    
    RAISE NOTICE 'Disabled auditing on %.%', p_schema_name, p_table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable auditing on all tables in a schema
CREATE OR REPLACE FUNCTION audit.enable_auditing_for_schema(
    p_schema_name TEXT DEFAULT 'public',
    p_exclude_tables TEXT[] DEFAULT '{}'
)
RETURNS VOID AS $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = p_schema_name
        AND table_type = 'BASE TABLE'
        AND table_name != ALL(p_exclude_tables || ARRAY['schema_migrations', 'spatial_ref_sys'])
    LOOP
        EXECUTE format('SELECT audit.enable_auditing(%L, %L)', 
                      p_schema_name, t.table_name);
    END LOOP;
    
    RAISE NOTICE 'Enabled auditing on all tables in schema % (excluded: %)', 
                 p_schema_name, array_to_string(p_exclude_tables, ', ');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search audit logs with advanced filtering
CREATE OR REPLACE FUNCTION audit.search_logs(
    p_table_name TEXT DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_actions TEXT[] DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_changed_field TEXT DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    action_tstamp TIMESTAMPTZ,
    table_name TEXT,
    record_id UUID,
    user_id UUID,
    action TEXT,
    action_label TEXT,
    user_display_name TEXT,
    changed_fields TEXT[],
    old_data JSONB,
    new_data JSONB,
    client_ip INET,
    user_agent TEXT,
    application_name TEXT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY EXECUTE '
        WITH filtered_logs AS (
            SELECT 
                l.*,
                COUNT(*) OVER() AS full_count,
                p.raw_user_meta_data->>''full_name'' AS user_display_name
            FROM 
                audit.logs l
            LEFT JOIN 
                auth.users p ON l.user_id = p.id
            WHERE 
                ($1 IS NULL OR l.table_name = $1)
                AND ($2 IS NULL OR l.record_id = $2)
                AND ($3 IS NULL OR l.user_id = $3)
                AND ($4 IS NULL OR l.action = ANY($4::TEXT[]))
                AND ($5 IS NULL OR l.action_tstamp >= $5)
                AND ($6 IS NULL OR l.action_tstamp <= $6)
                AND ($7 IS NULL OR $7 = ANY(l.changed_fields))
                AND (
                    $8 IS NULL OR 
                    l.old_data::TEXT ILIKE ''%'' || $8 || ''%'' OR
                    l.new_data::TEXT ILIKE ''%'' || $8 || ''%'' OR
                    p.raw_user_meta_data->>''full_name'' ILIKE ''%'' || $8 || ''%''
                )
            ORDER BY 
                l.action_tstamp DESC
            LIMIT $9
            OFFSET $10
        )
        SELECT 
            l.id,
            l.action_tstamp,
            l.table_name,
            l.record_id,
            l.user_id,
            l.action,
            CASE 
                WHEN l.action = ''I'' THEN ''Created''
                WHEN l.action = ''U'' THEN ''Updated''
                WHEN l.action = ''D'' THEN ''Deleted''
                WHEN l.action = ''T'' THEN ''Truncated''
                ELSE l.action
            END AS action_label,
            COALESCE(l.user_display_name, l.user_id::TEXT) AS user_display_name,
            l.changed_fields,
            l.old_data,
            l.new_data,
            l.client_ip,
            l.user_agent,
            l.application_name,
            l.full_count
        FROM 
            filtered_logs l'
    USING 
        p_table_name, 
        p_record_id,
        p_user_id,
        p_actions,
        p_start_date, 
        p_end_date,
        p_changed_field,
        p_search_term,
        p_limit,
        p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the audit trail for a specific record
CREATE OR REPLACE FUNCTION audit.get_record_audit_trail(
    p_table_name TEXT,
    p_record_id UUID
)
RETURNS TABLE (
    id BIGINT,
    action_tstamp TIMESTAMPTZ,
    action TEXT,
    action_label TEXT,
    user_id UUID,
    user_display_name TEXT,
    changes JSONB,
    client_ip INET,
    user_agent TEXT,
    application_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH record_changes AS (
        SELECT 
            l.*,
            p.raw_user_meta_data->>'full_name' AS user_display_name
        FROM 
            audit.logs l
        LEFT JOIN 
            auth.users p ON l.user_id = p.id
        WHERE 
            l.table_name = p_table_name
            AND l.record_id = p_record_id
        ORDER BY 
            l.action_tstamp DESC
    )
    SELECT 
        r.id,
        r.action_tstamp,
        r.action,
        CASE 
            WHEN r.action = 'I' THEN 'Created'
            WHEN r.action = 'U' THEN 'Updated'
            WHEN r.action = 'D' THEN 'Deleted'
            WHEN r.action = 'T' THEN 'Truncated'
            ELSE r.action
        END AS action_label,
        r.user_id,
        COALESCE(r.user_display_name, r.user_id::TEXT) AS user_display_name,
        CASE 
            WHEN r.action = 'I' THEN r.new_data
            WHEN r.action = 'U' THEN (
                SELECT jsonb_object_agg(
                    key, 
                    jsonb_build_object(
                        'old_value', 
                        CASE 
                            WHEN jsonb_typeof(r.old_data->key) = 'object' 
                            THEN r.old_data->key 
                            ELSE to_jsonb(r.old_data->>key)
                        END,
                        'new_value',
                        CASE 
                            WHEN jsonb_typeof(r.new_data->key) = 'object' 
                            THEN r.new_data->key 
                            ELSE to_jsonb(r.new_data->>key)
                        END
                    )
                )
                FROM jsonb_object_keys(r.new_data) as key
                WHERE r.old_data->key IS DISTINCT FROM r.new_data->key
            )
            WHEN r.action = 'D' THEN r.old_data
            ELSE NULL
        END AS changes,
        r.client_ip,
        r.user_agent,
        r.application_name
    FROM 
        record_changes r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION audit.cleanup_audit_logs(
    p_older_than_months INTEGER DEFAULT 12
)
RETURNS BIGINT AS $$
DECLARE
    v_count BIGINT;
    v_drop_date DATE;
    v_partition_name TEXT;
    v_dropped_partitions TEXT[] := '{}';
    r RECORD;
BEGIN
    -- Drop partitions older than the retention period
    v_drop_date := DATE_TRUNC('month', CURRENT_DATE - (p_older_than_months || ' months')::INTERVAL);
    
    FOR r IN 
        SELECT partition_name
        FROM information_schema.tables 
        WHERE table_schema = 'audit'
        AND table_name LIKE 'audit_logs_%'
        AND table_name < 'audit_logs_' || TO_CHAR(v_drop_date, 'YYYY_MM')
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS audit.%I', r.partition_name);
        v_dropped_partitions := array_append(v_dropped_partitions, r.partition_name);
    END LOOP;
    
    -- Log the cleanup
    IF array_length(v_dropped_partitions, 1) > 0 THEN
        RAISE NOTICE 'Dropped % audit log partitions: %', 
                     array_length(v_dropped_partitions, 1),
                     array_to_string(v_dropped_partitions, ', ');
    END IF;
    
    -- Return the number of dropped partitions
    RETURN array_length(v_dropped_partitions, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION audit.get_audit_statistics(
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    action TEXT,
    action_label TEXT,
    table_name TEXT,
    record_count BIGINT,
    user_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (p_days_back || ' days')::INTERVAL,
            CURRENT_DATE,
            '1 day'::INTERVAL
        )::DATE AS date
    )
    SELECT 
        d.date,
        a.action,
        CASE 
            WHEN a.action = 'I' THEN 'Created'
            WHEN a.action = 'U' THEN 'Updated'
            WHEN a.action = 'D' THEN 'Deleted'
            WHEN a.action = 'T' THEN 'Truncated'
            ELSE a.action
        END AS action_label,
        COALESCE(a.table_name, 'All') AS table_name,
        COUNT(DISTINCT a.id) AS record_count,
        COUNT(DISTINCT a.user_id) FILTER (WHERE a.user_id IS NOT NULL) AS user_count
    FROM 
        date_series d
    LEFT JOIN 
        audit.logs a ON DATE(a.action_tstamp) = d.date
    GROUP BY 
        d.date, 
        ROLLUP(a.action, a.table_name)
    HAVING 
        a.action IS NOT NULL OR 
        (GROUPING(a.action) = 1 AND GROUPING(a.table_name) = 1)
    ORDER BY 
        d.date DESC, 
        a.action, 
        a.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable auditing on all tables in the public schema (excluding system tables)
SELECT audit.enable_auditing_for_schema('public', ARRAY['audit_logs', 'schema_migrations', 'spatial_ref_sys']);
