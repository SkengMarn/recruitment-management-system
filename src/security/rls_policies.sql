-- Row Level Security (RLS) Policies for Recruitment Management System

-- Create roles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'manager') THEN
        CREATE ROLE manager;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin WITH BYPASSRLS;
    END IF;
END
$$;

-- Grant basic permissions to roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, manager, admin;
GRANT USAGE ON SCHEMA auth TO authenticated, manager, admin;

-- Grant permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to managers
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO manager;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin, manager;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin, manager;

-- Enable RLS on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- JWT claim helper functions
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '')::TEXT;
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT auth.role() = 'admin';
$$;

-- Helper function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT auth.role() = 'manager' OR auth.role() = 'admin';
$$;

-- Helper function to check if user is agent
CREATE OR REPLACE FUNCTION is_agent()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agents 
    WHERE id = auth.uid()
  ) OR is_manager();
$$;

-- Helper function to get current user's agent_id
CREATE OR REPLACE FUNCTION current_agent_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT id FROM public.agents 
  WHERE id = auth.uid() 
  LIMIT 1;
$$;

-- Policies for agents table
CREATE POLICY "Agents are viewable by authenticated users"
  ON public.agents FOR SELECT
  USING (auth.role() IN ('authenticated', 'admin', 'manager'));

CREATE POLICY "Agents can be inserted by admin only"
  ON public.agents FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Agents can update their own profile"
  ON public.agents FOR UPDATE
  USING (id = auth.uid() OR is_admin());

-- Policies for alerts table
CREATE POLICY "Alerts are viewable by assigned user, admin, or manager"
  ON public.alerts FOR SELECT
  USING (
    is_admin() OR 
    is_manager() OR 
    assigned_to = auth.uid() OR 
    candidate_id IN (SELECT id FROM public.candidates WHERE agent_id = current_agent_id())
  );

CREATE POLICY "Alerts can be created by admin or manager"
  ON public.alerts FOR INSERT
  WITH CHECK (is_manager());

CREATE POLICY "Alerts can be updated by assigned user, admin, or manager"
  ON public.alerts FOR UPDATE
  USING (assigned_to = auth.uid() OR is_manager());

-- Policies for audit_logs table
CREATE POLICY "Audit logs are viewable by admin and manager"
  ON public.audit_logs FOR SELECT
  USING (is_manager());

-- Policies for candidates table
CREATE POLICY "Candidates are viewable by their agent, admin, or manager"
  ON public.candidates FOR SELECT
  USING (
    is_manager() OR 
    agent_id = current_agent_id() OR
    candidate_user_id = auth.uid()
  );

CREATE POLICY "Candidates can be inserted by agents, admin, or manager"
  ON public.candidates FOR INSERT
  WITH CHECK (is_agent() OR is_manager());

CREATE POLICY "Candidates can be updated by their agent, admin, or manager"
  ON public.candidates FOR UPDATE
  USING (
    is_manager() OR 
    agent_id = current_agent_id() OR
    candidate_user_id = auth.uid()
  );

-- Policies for documents table
CREATE POLICY "Documents are viewable by candidate, their agent, admin, or manager"
  ON public.documents FOR SELECT
  USING (
    is_manager() OR
    candidate_id IN (
      SELECT id FROM public.candidates 
      WHERE agent_id = current_agent_id() 
      OR candidate_user_id = auth.uid()
    )
  );

CREATE POLICY "Documents can be uploaded by candidate, their agent, admin, or manager"
  ON public.documents FOR INSERT
  WITH CHECK (
    is_manager() OR
    candidate_id IN (
      SELECT id FROM public.candidates 
      WHERE agent_id = current_agent_id() 
      OR candidate_user_id = auth.uid()
    )
  );

-- Policies for leads table
CREATE POLICY "Leads are viewable by all authenticated users"
  ON public.leads FOR SELECT
  USING (true);

CREATE POLICY "Leads can be created by anyone"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Leads can be updated by admin or manager"
  ON public.leads FOR UPDATE
  USING (is_manager());

-- Policies for payments table
CREATE POLICY "Payments are viewable by admin, manager, or related agent"
  ON public.payments FOR SELECT
  USING (
    is_manager() OR
    candidate_id IN (
      SELECT id FROM public.candidates 
      WHERE agent_id = current_agent_id()
    )
  );

CREATE POLICY "Payments can be created by admin or manager"
  ON public.payments FOR INSERT
  WITH CHECK (is_manager());

-- Policies for positions table
CREATE POLICY "Positions are viewable by all authenticated users"
  ON public.positions FOR SELECT
  USING (true);

CREATE POLICY "Positions can be managed by admin or manager"
  ON public.positions FOR ALL
  USING (is_manager());

-- Policies for profiles table
CREATE POLICY "Profiles are viewable by the user, admin, or manager"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR is_manager());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin());

-- Policies for receiving_companies table
CREATE POLICY "Companies are viewable by all authenticated users"
  ON public.receiving_companies FOR SELECT
  USING (true);

CREATE POLICY "Companies can be managed by admin or manager"
  ON public.receiving_companies FOR ALL
  USING (is_manager());

-- Policies for stage_configs table
CREATE POLICY "Stage configs are viewable by all authenticated users"
  ON public.stage_configs FOR SELECT
  USING (true);

CREATE POLICY "Stage configs can be managed by admin"
  ON public.stage_configs FOR ALL
  USING (is_admin());

-- Policies for stage_history table
CREATE POLICY "Stage history is viewable by admin, manager, or related agent"
  ON public.stage_history FOR SELECT
  USING (
    is_manager() OR
    candidate_id IN (
      SELECT id FROM public.candidates 
      WHERE agent_id = current_agent_id()
      OR candidate_user_id = auth.uid()
    )
  );

-- Policies for system_settings table
CREATE POLICY "System settings are viewable by admin and manager"
  ON public.system_settings FOR SELECT
  USING (is_manager());

CREATE POLICY "System settings can be updated by admin only"
  ON public.system_settings FOR UPDATE
  USING (is_admin());

-- Function to set created_by and updated_by fields
CREATE OR REPLACE FUNCTION public.handle_created_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log changes to audit_logs
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_record_id UUID;
  v_table_name TEXT;
  v_action TEXT;
  v_user_id UUID;
  v_columns TEXT[] := ARRAY['password', 'refresh_token', 'email_change_token', 'reauthentication_token'];
  v_key TEXT;
  v_value JSONB;
BEGIN
  v_table_name := TG_TABLE_NAME;
  v_action := TG_OP;
  v_user_id := auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_record_id := NEW.id;
    v_old_data := '{}';
    
    -- Remove sensitive data from new_data
    SELECT jsonb_object_agg(key, value) INTO v_new_data
    FROM jsonb_each(to_jsonb(NEW))
    WHERE key != ALL(v_columns);
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_record_id := NEW.id;
    
    -- Remove sensitive data from old_data
    SELECT jsonb_object_agg(key, value) INTO v_old_data
    FROM jsonb_each(to_jsonb(OLD))
    WHERE key != ALL(v_columns);
    
    -- Remove sensitive data from new_data
    SELECT jsonb_object_agg(key, value) INTO v_new_data
    FROM jsonb_each(to_jsonb(NEW))
    WHERE key != ALL(v_columns);
    
    -- Only log if there are actual changes
    IF v_old_data = v_new_data THEN
      RETURN NEW;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id;
    
    -- Remove sensitive data from old_data
    SELECT jsonb_object_agg(key, value) INTO v_old_data
    FROM jsonb_each(to_jsonb(OLD))
    WHERE key != ALL(v_columns);
    
    v_new_data := '{}';
  END IF;
  
  -- Insert into audit_logs
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  ) VALUES (
    v_table_name,
    v_record_id,
    v_action,
    CASE WHEN v_old_data = '{}'::jsonb THEN NULL ELSE v_old_data END,
    CASE WHEN v_new_data = '{}'::jsonb THEN NULL ELSE v_new_data END,
    v_user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
