-- Migration: Add principal details and users array to agents table
-- This allows agencies to have principal information and track associated users

-- Add principal details to agents table
ALTER TABLE public.agents
  ADD COLUMN principal_name text NOT NULL DEFAULT 'N/A',
  ADD COLUMN principal_contact text NOT NULL DEFAULT 'N/A';

-- Add users array column to store user UUIDs associated with this agency
ALTER TABLE public.agents
  ADD COLUMN users uuid[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.agents.principal_name IS 'Name of the agency principal/owner';
COMMENT ON COLUMN public.agents.principal_contact IS 'Contact information for the agency principal';
COMMENT ON COLUMN public.agents.users IS 'Array of user UUIDs who are associated with this agency (agency_owner, agency_staff)';

-- Create index on users array for efficient lookups
CREATE INDEX idx_agents_users ON public.agents USING GIN (users);

-- Create function to add user to agency
CREATE OR REPLACE FUNCTION add_user_to_agency(agency_id uuid, user_id uuid)
RETURNS void AS $$
BEGIN
  -- Add user to agency's users array if not already present
  UPDATE public.agents 
  SET users = array_append(users, user_id)
  WHERE id = agency_id 
    AND NOT (user_id = ANY(users));
END;
$$ LANGUAGE plpgsql;

-- Create function to remove user from agency
CREATE OR REPLACE FUNCTION remove_user_from_agency(agency_id uuid, user_id uuid)
RETURNS void AS $$
BEGIN
  -- Remove user from agency's users array
  UPDATE public.agents 
  SET users = array_remove(users, user_id)
  WHERE id = agency_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get users for an agency
CREATE OR REPLACE FUNCTION get_agency_users(agency_id uuid)
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at
  FROM public.profiles p
  JOIN public.agents a ON p.id = ANY(a.users)
  WHERE a.id = agency_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get agency for a user
CREATE OR REPLACE FUNCTION get_user_agency(user_id uuid)
RETURNS TABLE(
  agency_id uuid,
  agency_name text,
  principal_name text,
  principal_contact text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.agency_name,
    a.principal_name,
    a.principal_contact
  FROM public.agents a
  WHERE user_id = ANY(a.users);
END;
$$ LANGUAGE plpgsql;
