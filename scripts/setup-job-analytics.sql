-- Setup script for job analytics materialized view and refresh system

-- First, create the refresh function
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

-- Create the materialized view (if not exists)
DROP MATERIALIZED VIEW IF EXISTS public.job_analytics;

CREATE MATERIALIZED VIEW public.job_analytics AS
WITH candidate_base AS (
  SELECT
    c.id AS candidate_id,
    c.full_name,
    c.stage,
    c.stage_updated_at,
    c.created_at,
    c.updated_at,
    c.is_active,
    c.agent_id,
    c.receiving_company_id,
    COALESCE(p.position_name, c.position, 'Unknown Position') AS position_text,
    NULL::uuid AS position_id -- placeholder since candidates table has no FK to positions
  FROM public.candidates c
  LEFT JOIN public.positions p ON p.id::text = c.position
),
placement_counts AS (
  SELECT
    cb.receiving_company_id,
    COALESCE(cb.position_id, NULL) AS position_id,
    cb.position_text,
    cb.stage,
    COUNT(cb.candidate_id) AS candidate_count
  FROM candidate_base cb
  GROUP BY cb.receiving_company_id, COALESCE(cb.position_id, NULL), cb.position_text, cb.stage
),
document_counts AS (
  SELECT
    cb.candidate_id,
    COUNT(d.id) FILTER (WHERE d.is_verified) AS verified_docs,
    COUNT(d.id) FILTER (WHERE NOT d.is_verified) AS unverified_docs
  FROM candidate_base cb
  LEFT JOIN public.documents d ON d.candidate_id = cb.candidate_id
  GROUP BY cb.candidate_id
),
payment_summaries AS (
  SELECT
    cb.candidate_id,
    jsonb_object_agg(
      COALESCE(p.stage::text, 'unknown'),
      p.total_amount
    ) AS payments_by_stage
  FROM candidate_base cb
  LEFT JOIN (
    SELECT candidate_id, stage, SUM(amount) AS total_amount
    FROM public.payments
    GROUP BY candidate_id, stage
  ) p ON p.candidate_id = cb.candidate_id
  GROUP BY cb.candidate_id
),
stage_metrics_raw AS (
  SELECT
    cb.receiving_company_id,
    COALESCE(cb.position_id, NULL) AS position_id,
    cb.position_text,
    sh.to_stage,
    AVG(sh.days_in_previous_stage) AS avg_days,
    SUM(sh.cost) AS total_cost
  FROM public.stage_history sh
  JOIN candidate_base cb ON cb.candidate_id = sh.candidate_id
  GROUP BY cb.receiving_company_id, COALESCE(cb.position_id, NULL), cb.position_text, sh.to_stage
),
stage_metrics AS (
  SELECT
    receiving_company_id,
    position_id,
    position_text,
    jsonb_object_agg(
      COALESCE(to_stage::text, 'unknown'),
      avg_days
    ) AS avg_days_by_stage,
    jsonb_object_agg(
      COALESCE(to_stage::text, 'unknown'),
      total_cost
    ) AS cost_by_stage
  FROM stage_metrics_raw
  GROUP BY receiving_company_id, position_id, position_text
)
SELECT
  rc.company_name,
  rc.country,
  COALESCE(cb.position_id, NULL) AS position_id,
  cb.position_text,
  cb.stage,
  COUNT(DISTINCT cb.candidate_id) AS total_candidates,
  SUM(CASE WHEN cb.is_active THEN 1 ELSE 0 END) AS active_candidates,
  COALESCE(SUM(dc.verified_docs), 0) AS total_verified_documents,
  COALESCE(SUM(dc.unverified_docs), 0) AS total_unverified_documents,
  jsonb_object_agg(
    cb.candidate_id,
    ps.payments_by_stage
  ) FILTER (WHERE ps.payments_by_stage IS NOT NULL) AS candidate_payments,
  sm.avg_days_by_stage,
  sm.cost_by_stage,
  NOW() AS snapshot_at
FROM candidate_base cb
LEFT JOIN public.receiving_companies rc ON rc.id = cb.receiving_company_id
LEFT JOIN document_counts dc ON dc.candidate_id = cb.candidate_id
LEFT JOIN payment_summaries ps ON ps.candidate_id = cb.candidate_id
LEFT JOIN stage_metrics sm 
       ON sm.receiving_company_id = cb.receiving_company_id
      AND COALESCE(sm.position_id, NULL) IS NOT DISTINCT FROM COALESCE(cb.position_id, NULL)
      AND sm.position_text = cb.position_text
GROUP BY rc.company_name, rc.country, COALESCE(cb.position_id, NULL), cb.position_text, cb.stage, sm.avg_days_by_stage, sm.cost_by_stage;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_job_analytics_company ON job_analytics(company_name);
CREATE INDEX IF NOT EXISTS idx_job_analytics_stage ON job_analytics(stage);
CREATE INDEX IF NOT EXISTS idx_job_analytics_snapshot ON job_analytics(snapshot_at);

-- Initial refresh
SELECT refresh_materialized_view('job_analytics');

-- Optional: Set up automatic refresh via pg_cron (uncomment if pg_cron is available)
-- SELECT cron.schedule('refresh-job-analytics', '0 * * * *', 'SELECT refresh_materialized_view(''job_analytics'');');

COMMENT ON MATERIALIZED VIEW job_analytics IS 'Comprehensive analytics view combining candidate, payment, document, and stage data for business intelligence';
COMMENT ON FUNCTION refresh_materialized_view(text) IS 'Refreshes a materialized view and logs the event to audit_logs';
