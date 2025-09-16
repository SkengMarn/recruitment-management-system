-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh the specified materialized view
  EXECUTE format('REFRESH MATERIALIZED VIEW %I', view_name);
  
  -- Log the refresh event
  INSERT INTO audit_logs (
    table_name,
    action,
    new_data,
    timestamp
  ) VALUES (
    view_name,
    'REFRESH',
    jsonb_build_object(
      'refreshed_at', NOW(),
      'view_name', view_name
    ),
    NOW()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION refresh_materialized_view(text) TO authenticated;

-- Create a scheduled job to refresh every hour (if pg_cron is available)
-- SELECT cron.schedule('refresh-job-analytics', '0 * * * *', 'SELECT refresh_materialized_view(''job_analytics'');');

-- Alternative: Create a trigger to refresh on data changes (more resource intensive)
-- This would refresh the view whenever candidates, payments, or documents are modified
