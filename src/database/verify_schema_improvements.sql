-- Verification Script for Schema Improvements
-- Check that all enums, tables, functions, and indexes were created correctly

-- =============================================================================
-- 1. CHECK ENUM TYPES
-- =============================================================================

-- List all custom enum types
SELECT 
  t.typname as enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_role', 'access_level', 'payment_stage', 'alert_type', 'stage_type', 'document_status_type', 'alert_priority')
GROUP BY t.typname
ORDER BY t.typname;

-- =============================================================================
-- 2. CHECK NEW TABLES
-- =============================================================================

-- Verify permissions table exists with correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'permissions'
ORDER BY ordinal_position;

-- Verify stage_requirements table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'stage_requirements'
ORDER BY ordinal_position;

-- =============================================================================
-- 3. CHECK PROFILE TABLE MODIFICATIONS
-- =============================================================================

-- Check if employer_id and agency_id columns were added to profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('employer_id', 'agency_id');

-- =============================================================================
-- 4. CHECK INDEXES
-- =============================================================================

-- List all indexes on new tables and audit_logs
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (
    tablename IN ('permissions', 'stage_requirements') 
    OR (tablename = 'audit_logs' AND indexname LIKE 'idx_audit_logs_%')
  )
ORDER BY tablename, indexname;

-- =============================================================================
-- 5. CHECK FUNCTIONS
-- =============================================================================

-- Verify access control functions exist
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('user_has_access', 'setup_default_permissions', 'enforce_payment_consistency')
ORDER BY routine_name;

-- =============================================================================
-- 6. CHECK TRIGGERS
-- =============================================================================

-- Verify payment consistency trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'trg_payment_consistency';

-- =============================================================================
-- 7. CHECK FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Check foreign key constraints on new columns
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND (
    (tc.table_name = 'profiles' AND kcu.column_name IN ('employer_id', 'agency_id'))
    OR tc.table_name IN ('permissions', 'stage_requirements')
  )
ORDER BY tc.table_name, tc.constraint_name;

-- =============================================================================
-- 8. SUMMARY REPORT
-- =============================================================================

-- Count of records in new tables
SELECT 'permissions' as table_name, COUNT(*) as record_count FROM public.permissions
UNION ALL
SELECT 'stage_requirements' as table_name, COUNT(*) as record_count FROM public.stage_requirements;

-- Test the user_has_access function (should return false for non-existent user)
SELECT user_has_access('00000000-0000-0000-0000-000000000000'::uuid, 'candidates', 'read'::access_level) as test_access_function;
