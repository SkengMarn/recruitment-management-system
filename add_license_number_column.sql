-- Add license_number column to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);

-- Create storage bucket for profile pictures with proper permissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile_pictures',
  'profile_pictures', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for profile_pictures bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'profile_pictures_select',
  'profile_pictures',
  'Allow public read access',
  'true',
  'true',
  'SELECT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'profile_pictures_insert',
  'profile_pictures', 
  'Allow authenticated users to upload',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'INSERT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'profile_pictures_update',
  'profile_pictures',
  'Allow authenticated users to update',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'UPDATE'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'profile_pictures_delete',
  'profile_pictures',
  'Allow authenticated users to delete',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'DELETE'
) ON CONFLICT (id) DO NOTHING;
