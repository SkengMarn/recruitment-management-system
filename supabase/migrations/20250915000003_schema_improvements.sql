-- Schema Improvements Migration
-- Adds flexible access control, enum extensions, and data integrity

-- =============================================================================
-- 1. CONDITIONAL ENUM CREATION
-- =============================================================================

-- Create new enums only if they don't exist
DO $$
BEGIN
  -- User roles enum (expand beyond current 3 roles)
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'admin', 
      'staff', 
      'agency_owner', 
      'agency_staff', 
      'employer', 
      'employer_staff', 
      'candidate'
    );
  END IF;

  -- Access levels for permissions
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_level') THEN
    CREATE TYPE access_level AS ENUM ('none', 'read', 'write', 'delete', 'approve');
  END IF;

  -- Payment stages
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_stage') THEN
    CREATE TYPE payment_stage AS ENUM (
      'registration_fee', 
      'training_fee', 
      'placement_fee', 
      'commission', 
      'refund'
    );
  END IF;
END$$;

-- Extend existing enums safely
DO $$
BEGIN
  -- Extend alert_type
  BEGIN
    ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'system';
    ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'payment_due';
    ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'stage_delay';
    ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'document_expiry';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  -- Extend stage_type
  BEGIN
    ALTER TYPE stage_type ADD VALUE IF NOT EXISTS 'deployment_ready';
    ALTER TYPE stage_type ADD VALUE IF NOT EXISTS 'deployed';
    ALTER TYPE stage_type ADD VALUE IF NOT EXISTS 'rejected';
    ALTER TYPE stage_type ADD VALUE IF NOT EXISTS 'cancelled';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END$$;

-- =============================================================================
-- 2. ACCESS CONTROL SYSTEM
-- =============================================================================

-- Add agency/employer linking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.receiving_companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  access_level access_level NOT NULL DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON public.permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);

-- =============================================================================
-- 3. DATA INTEGRITY
-- =============================================================================

-- Audit logs indexing
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id);

-- Payment consistency trigger
CREATE OR REPLACE FUNCTION enforce_payment_consistency()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position_id IS NOT NULL AND NEW.receiving_company_id IS NOT NULL THEN
    PERFORM 1
    FROM public.positions p
    WHERE p.id = NEW.position_id 
    AND p.receiving_company_id = NEW.receiving_company_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Payment receiving_company_id must match the company from the linked position';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_consistency ON public.payments;
CREATE TRIGGER trg_payment_consistency
  BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_payment_consistency();

-- =============================================================================
-- 4. STAGE REQUIREMENTS NORMALIZATION
-- =============================================================================

-- Create normalized stage requirements table
CREATE TABLE IF NOT EXISTS public.stage_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.stage_configs(id) ON DELETE CASCADE,
  requirement_key TEXT NOT NULL,
  requirement_value TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stage_id, requirement_key)
);

CREATE INDEX IF NOT EXISTS idx_stage_requirements_stage_id ON public.stage_requirements(stage_id);

-- =============================================================================
-- 5. ACCESS CONTROL FUNCTIONS
-- =============================================================================

-- Function to check user access
CREATE OR REPLACE FUNCTION user_has_access(
  p_user_id UUID,
  p_module TEXT,
  p_required_level access_level
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_access access_level;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Admin has access to everything
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permissions
  SELECT access_level INTO user_access
  FROM public.permissions
  WHERE user_id = p_user_id AND module = p_module;
  
  -- If no specific permission, deny access
  IF user_access IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user's access level meets requirement
  RETURN CASE
    WHEN p_required_level = 'none' THEN TRUE
    WHEN p_required_level = 'read' THEN user_access IN ('read', 'write', 'delete', 'approve')
    WHEN p_required_level = 'write' THEN user_access IN ('write', 'delete', 'approve')
    WHEN p_required_level = 'delete' THEN user_access IN ('delete', 'approve')
    WHEN p_required_level = 'approve' THEN user_access = 'approve'
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to setup default permissions
CREATE OR REPLACE FUNCTION setup_default_permissions(p_user_id UUID, p_role TEXT)
RETURNS VOID AS $$
BEGIN
  -- Clear existing permissions
  DELETE FROM public.permissions WHERE user_id = p_user_id;
  
  -- Set permissions based on role
  CASE p_role
    WHEN 'staff' THEN
      INSERT INTO public.permissions (user_id, module, access_level) VALUES
      (p_user_id, 'candidates', 'write'),
      (p_user_id, 'agents', 'write'),
      (p_user_id, 'employers', 'write'),
      (p_user_id, 'positions', 'write'),
      (p_user_id, 'payments', 'read'),
      (p_user_id, 'documents', 'write'),
      (p_user_id, 'reports', 'read');
    
    WHEN 'agency_owner' THEN
      INSERT INTO public.permissions (user_id, module, access_level) VALUES
      (p_user_id, 'candidates', 'write'),
      (p_user_id, 'agents', 'read'),
      (p_user_id, 'employers', 'read'),
      (p_user_id, 'positions', 'read'),
      (p_user_id, 'payments', 'read'),
      (p_user_id, 'documents', 'write'),
      (p_user_id, 'reports', 'read');
    
    WHEN 'agency_staff' THEN
      INSERT INTO public.permissions (user_id, module, access_level) VALUES
      (p_user_id, 'candidates', 'write'),
      (p_user_id, 'documents', 'write'),
      (p_user_id, 'reports', 'read');
    
    WHEN 'employer' THEN
      INSERT INTO public.permissions (user_id, module, access_level) VALUES
      (p_user_id, 'candidates', 'read'),
      (p_user_id, 'positions', 'write'),
      (p_user_id, 'payments', 'read'),
      (p_user_id, 'reports', 'read');
    
    WHEN 'employer_staff' THEN
      INSERT INTO public.permissions (user_id, module, access_level) VALUES
      (p_user_id, 'candidates', 'read'),
      (p_user_id, 'positions', 'read'),
      (p_user_id, 'reports', 'read');
    
    WHEN 'candidate' THEN
      INSERT INTO public.permissions (user_id, module, access_level) VALUES
      (p_user_id, 'candidates', 'read'),
      (p_user_id, 'documents', 'read');
    
    ELSE
      NULL; -- No permissions for unknown roles
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. COMMENTS
-- =============================================================================

COMMENT ON TABLE public.permissions IS 'Granular access control for users by module';
COMMENT ON COLUMN public.permissions.module IS 'Module name: candidates, agents, employers, positions, payments, documents, reports';
COMMENT ON COLUMN public.permissions.access_level IS 'Access level: none, read, write, delete, approve';
COMMENT ON FUNCTION user_has_access(UUID, TEXT, access_level) IS 'Check if user has required access level for a module';
COMMENT ON FUNCTION setup_default_permissions(UUID, TEXT) IS 'Set default permissions for new user based on role';
