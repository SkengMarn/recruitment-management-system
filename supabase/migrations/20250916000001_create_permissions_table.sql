-- Create permissions table for granular user access control
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit', 'approve')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, module)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON public.permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own permissions"
  ON public.permissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all permissions"
  ON public.permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all permissions"
  ON public.permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE TRIGGER set_permissions_updated_at
    BEFORE UPDATE ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add audit logging trigger
CREATE TRIGGER permissions_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_audit_event();
