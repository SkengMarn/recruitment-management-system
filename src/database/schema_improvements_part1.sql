-- Schema Improvements Part 1: Core Enums and Tables
-- Safe to run - no complex functions

-- =============================================================================
-- 1. CONDITIONAL ENUM CREATION (Avoid "already exists" errors)
-- =============================================================================

-- Create missing enums only if they don't exist
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

  -- Payment stages (more specific than generic stages)
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

-- Add missing values to existing enums
DO $$
BEGIN
  -- Extend existing alert_type if needed
  BEGIN
    ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'system';
    ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'payment_due';
    ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'stage_delay';
    ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'document_expiry';
  EXCEPTION
    WHEN duplicate_object THEN NULL; -- Ignore if already exists
  END;

  -- Extend existing stage_type if needed
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
-- 2. FLEXIBLE ACCESS CONTROL SYSTEM
-- =============================================================================

-- Add agency/employer linking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.receiving_companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;

-- Create permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL, -- e.g. 'candidates', 'payments', 'positions', 'reports'
  access_level access_level NOT NULL DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module)
);

-- Create indexes for permissions
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON public.permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);

-- =============================================================================
-- 3. DATA INTEGRITY IMPROVEMENTS
-- =============================================================================

-- Add audit logs indexing for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id);

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stage_requirements_stage_id ON public.stage_requirements(stage_id);

-- Add comments
COMMENT ON TABLE public.permissions IS 'Granular access control for users by module';
COMMENT ON COLUMN public.permissions.module IS 'Module name: candidates, agents, employers, positions, payments, documents, reports';
COMMENT ON COLUMN public.permissions.access_level IS 'Access level: none, read, write, delete, approve';
