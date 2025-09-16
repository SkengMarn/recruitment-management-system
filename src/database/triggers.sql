-- Triggers for automatic timestamps and audit logging

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at to all tables with that column
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
                      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
                      t.table_name, t.table_name);
    END LOOP;
END;
$$;

-- Create audit triggers for all tables
DO $$
DECLARE
    t record;
    excluded_tables text[] := '{schema_migrations, spatial_ref_sys, audit_logs}';
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name != ALL(excluded_tables)
    LOOP
        -- Drop existing trigger if it exists
        EXECUTE format('DROP TRIGGER IF EXISTS audit_%s_change ON %I', 
                      t.table_name, t.table_name);
        
        -- Create new trigger
        EXECUTE format('CREATE TRIGGER audit_%s_change
                      AFTER INSERT OR UPDATE OR DELETE ON %I
                      FOR EACH ROW EXECUTE FUNCTION log_audit_event()',
                      t.table_name, t.table_name);
    END LOOP;
END;
$$;

-- Special trigger for candidate stage changes
CREATE OR REPLACE FUNCTION log_candidate_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.stage != OLD.stage THEN
        INSERT INTO public.stage_history (
            candidate_id,
            from_stage,
            to_stage,
            updated_by
        ) VALUES (
            NEW.id,
            OLD.stage,
            NEW.stage,
            auth.uid()
        );
        
        -- Update stage_updated_at
        NEW.stage_updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for candidate stage changes
CREATE TRIGGER candidate_stage_change
BEFORE UPDATE ON public.candidates
FOR EACH ROW
WHEN (NEW.stage IS DISTINCT FROM OLD.stage)
EXECUTE FUNCTION log_candidate_stage_change();

-- Function to handle document verification
CREATE OR REPLACE FUNCTION handle_document_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_verified AND NOT OLD.is_verified THEN
        NEW.verified_by = auth.uid();
        NEW.verified_at = NOW();
        
        -- Create alert for document verification
        INSERT INTO public.alerts (
            candidate_id,
            alert_type,
            priority,
            title,
            message,
            assigned_to
        ) VALUES (
            NEW.candidate_id,
            'document_verified',
            'low',
            'Document Verified',
            'Document ' || NEW.doc_type || ' has been verified',
            (SELECT agent_id FROM public.candidates WHERE id = NEW.candidate_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for document verification
CREATE TRIGGER document_verification_trigger
BEFORE UPDATE ON public.documents
FOR EACH ROW
WHEN (NEW.is_verified IS DISTINCT FROM OLD.is_verified AND NEW.is_verified = true)
EXECUTE FUNCTION handle_document_verification();

-- Function to handle candidate stage completion alerts
CREATE OR REPLACE FUNCTION handle_stage_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_stage_config RECORD;
    v_next_stage TEXT;
    v_alert_message TEXT;
BEGIN
    -- Get stage configuration
    SELECT * INTO v_stage_config 
    FROM public.stage_configs 
    WHERE stage = NEW.stage;
    
    -- Determine next stage
    SELECT stage INTO v_next_stage
    FROM public.stage_configs
    WHERE sort_order = (SELECT sort_order + 1 
                       FROM public.stage_configs 
                       WHERE stage = NEW.stage)
    LIMIT 1;
    
    -- Create alert for stage completion
    IF v_stage_config.alert_on_completion THEN
        v_alert_message := 'Candidate ' || NEW.full_name || ' has completed the ' || 
                          v_stage_config.stage_name || ' stage.';
        
        IF v_next_stage IS NOT NULL THEN
            v_alert_message := v_alert_message || ' Next stage: ' || v_next_stage;
        END IF;
        
        INSERT INTO public.alerts (
            candidate_id,
            alert_type,
            priority,
            title,
            message,
            assigned_to
        ) VALUES (
            NEW.id,
            'stage_completed',
            'medium',
            'Stage Completed: ' || v_stage_config.stage_name,
            v_alert_message,
            NEW.agent_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for stage completion alerts
CREATE TRIGGER candidate_stage_completion_trigger
AFTER UPDATE OF stage ON public.candidates
FOR EACH ROW
WHEN (NEW.stage IS DISTINCT FROM OLD.stage)
EXECUTE FUNCTION handle_stage_completion();

-- Function to check document requirements before stage change
CREATE OR REPLACE FUNCTION check_document_requirements()
RETURNS TRIGGER AS $$
DECLARE
    v_required_docs TEXT[];
    v_missing_docs TEXT[] := '{}';
    v_doc RECORD;
BEGIN
    -- Get required documents for the new stage
    SELECT required_documents INTO v_required_docs
    FROM public.stage_configs
    WHERE stage = NEW.stage;
    
    -- Check if all required documents are present and verified
    IF v_required_docs IS NOT NULL AND array_length(v_required_docs, 1) > 0 THEN
        FOREACH v_doc IN ARRAY v_required_docs LOOP
            IF NOT EXISTS (
                SELECT 1 
                FROM public.documents 
                WHERE candidate_id = NEW.id 
                AND doc_type = v_doc
                AND is_verified = true
            ) THEN
                v_missing_docs := array_append(v_missing_docs, v_doc);
            END IF;
        END LOOP;
        
        IF array_length(v_missing_docs, 1) > 0 THEN
            RAISE EXCEPTION 'Cannot advance to stage %. Missing required documents: %', 
                NEW.stage, 
                array_to_string(v_missing_docs, ', ');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to check document requirements before stage change
CREATE TRIGGER check_documents_before_stage_change
BEFORE UPDATE OF stage ON public.candidates
FOR EACH ROW
WHEN (NEW.stage IS DISTINCT FROM OLD.stage)
EXECUTE FUNCTION check_document_requirements();
