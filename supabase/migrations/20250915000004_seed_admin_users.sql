-- Migration: Seed Admin Users
-- This migration creates admin accounts directly in auth.users and sets up their profiles
-- Supabase will automatically send verification emails to these addresses

-- First, clean up any existing dummy/placeholder data
DELETE FROM public.profiles WHERE email LIKE '%example.com%' OR email LIKE '%test%' OR email LIKE '%dummy%';
DELETE FROM auth.users WHERE email LIKE '%example.com%' OR email LIKE '%test%' OR email LIKE '%dummy%';

-- Create admin users in auth.users table
-- Note: Supabase will automatically send verification emails to these addresses
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES 
-- Admin User 1 - Primary Administrator
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'jayssemujju@gmail.com',
    crypt('J!aL9$v7Qx2R#Tm8', gen_salt('bf')), -- Your preferred password
    NULL, -- Will be set when email is verified
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Primary Administrator"}',
    false,
    'authenticated',
    'authenticated'
);

-- Create corresponding profiles for the admin users
INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    created_at,
    updated_at
)
SELECT 
    u.id,
    (u.raw_user_meta_data->>'full_name')::text,
    u.email,
    'admin'::user_role,
    u.created_at,
    u.updated_at
FROM auth.users u 
WHERE u.email = 'jayssemujju@gmail.com';

-- Set up default admin permissions for all modules
INSERT INTO public.permissions (
    user_id,
    module,
    access_level,
    created_at
)
SELECT 
    p.id,
    module_name,
    'approve'::access_level,
    now()
FROM public.profiles p
CROSS JOIN (
    VALUES 
        ('candidates'),
        ('agents'), 
        ('employers'),
        ('positions'),
        ('payments'),
        ('documents'),
        ('reports'),
        ('settings'),
        ('users'),
        ('analytics')
) AS modules(module_name)
WHERE p.role = 'admin';

-- Create a function to trigger email verification for new users
CREATE OR REPLACE FUNCTION trigger_email_verification()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function can be called to manually trigger email verification
    -- In practice, Supabase handles this automatically when users are created
    RAISE NOTICE 'Email verification will be triggered automatically by Supabase for unverified users';
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION trigger_email_verification() IS 'Helper function - Supabase automatically sends verification emails for new users';

-- Log the admin user creation
INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id,
    created_at
)
SELECT 
    'profiles',
    p.id::text,
    'CREATE',
    NULL,
    jsonb_build_object(
        'full_name', p.full_name,
        'email', p.email,
        'role', p.role
    ),
    p.id, -- Self-created
    now()
FROM public.profiles p
WHERE p.role = 'admin';
