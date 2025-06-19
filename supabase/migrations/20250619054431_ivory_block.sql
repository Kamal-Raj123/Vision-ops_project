/*
  # Views and Helper Functions

  1. Views
    - Dashboard summary views
    - Security metrics views
    - Pipeline performance views
    - Infrastructure health views

  2. Functions
    - Metric calculation functions
    - Report generation functions
    - Data aggregation helpers

  3. Purpose
    - Simplify complex queries
    - Provide consistent data access
    - Enable efficient reporting
*/

-- Create view for dashboard summary
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  -- Pipeline metrics
  COUNT(DISTINCT p.id) as total_pipelines,
  COUNT(DISTINCT CASE WHEN pr.status = 'running' THEN pr.id END) as running_pipelines,
  COUNT(DISTINCT CASE WHEN pr.status = 'success' THEN pr.id END) as successful_runs_today,
  COUNT(DISTINCT CASE WHEN pr.status = 'failed' THEN pr.id END) as failed_runs_today,
  -- Security metrics
  COUNT(DISTINCT CASE WHEN v.severity = 'critical' AND v.status = 'open' THEN v.id END) as critical_vulnerabilities,
  COUNT(DISTINCT CASE WHEN v.severity = 'high' AND v.status = 'open' THEN v.id END) as high_vulnerabilities,
  COUNT(DISTINCT CASE WHEN v.status = 'resolved' AND v.resolved_at > CURRENT_DATE THEN v.id END) as vulnerabilities_resolved_today,
  -- Infrastructure metrics
  COUNT(DISTINCT CASE WHEN inf.status = 'ready' THEN inf.id END) as healthy_nodes,
  COUNT(DISTINCT CASE WHEN inf.status != 'ready' THEN inf.id END) as unhealthy_nodes,
  -- Alert metrics
  COUNT(DISTINCT CASE WHEN ai.status = 'firing' THEN ai.id END) as active_alerts,
  COUNT(DISTINCT CASE WHEN ai.status = 'firing' AND ai.severity = 'critical' THEN ai.id END) as critical_alerts
FROM teams t
LEFT JOIN pipelines p ON p.team_id = t.id
LEFT JOIN pipeline_runs pr ON pr.pipeline_id = p.id AND pr.created_at > CURRENT_DATE
LEFT JOIN vulnerabilities v ON v.team_id = t.id
LEFT JOIN infrastructure_nodes inf ON inf.team_id = t.id
LEFT JOIN alert_instances ai ON ai.team_id = t.id AND ai.created_at > CURRENT_DATE - INTERVAL '1 day'
GROUP BY t.id, t.name;

-- Create view for security metrics
CREATE OR REPLACE VIEW security_metrics AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  COUNT(CASE WHEN v.severity = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN v.severity = 'high' THEN 1 END) as high_count,
  COUNT(CASE WHEN v.severity = 'medium' THEN 1 END) as medium_count,
  COUNT(CASE WHEN v.severity = 'low' THEN 1 END) as low_count,
  COUNT(CASE WHEN v.status = 'open' THEN 1 END) as open_count,
  COUNT(CASE WHEN v.status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN v.status = 'resolved' THEN 1 END) as resolved_count,
  AVG(CASE WHEN v.status = 'resolved' AND v.resolved_at IS NOT NULL 
       THEN EXTRACT(EPOCH FROM (v.resolved_at - v.first_detected))/86400 END) as avg_resolution_days,
  COUNT(CASE WHEN v.first_detected > CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_this_week,
  COUNT(CASE WHEN v.resolved_at > CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as resolved_this_week
FROM teams t
LEFT JOIN vulnerabilities v ON v.team_id = t.id
GROUP BY t.id, t.name;

-- Create view for pipeline performance
CREATE OR REPLACE VIEW pipeline_performance AS
SELECT 
  p.id as pipeline_id,
  p.name as pipeline_name,
  p.team_id,
  COUNT(pr.id) as total_runs,
  COUNT(CASE WHEN pr.status = 'success' THEN 1 END) as successful_runs,
  COUNT(CASE WHEN pr.status = 'failed' THEN 1 END) as failed_runs,
  ROUND(
    (COUNT(CASE WHEN pr.status = 'success' THEN 1 END)::decimal / NULLIF(COUNT(pr.id), 0)) * 100, 
    2
  ) as success_rate,
  AVG(pr.duration_seconds) as avg_duration_seconds,
  MAX(pr.created_at) as last_run_at,
  COUNT(CASE WHEN pr.created_at > CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as runs_this_week,
  COUNT(CASE WHEN pr.created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as runs_this_month
FROM pipelines p
LEFT JOIN pipeline_runs pr ON pr.pipeline_id = p.id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.team_id;

-- Create view for infrastructure health
CREATE OR REPLACE VIEW infrastructure_health AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  COUNT(inf.id) as total_nodes,
  COUNT(CASE WHEN inf.status = 'ready' THEN 1 END) as ready_nodes,
  COUNT(CASE WHEN inf.status = 'not-ready' THEN 1 END) as not_ready_nodes,
  COUNT(CASE WHEN inf.status = 'error' THEN 1 END) as error_nodes,
  AVG((inf.current_usage->>'cpu')::numeric) as avg_cpu_usage,
  AVG((inf.current_usage->>'memory')::numeric) as avg_memory_usage,
  AVG((inf.current_usage->>'storage')::numeric) as avg_storage_usage,
  COUNT(CASE WHEN (inf.current_usage->>'cpu')::numeric > 80 THEN 1 END) as high_cpu_nodes,
  COUNT(CASE WHEN (inf.current_usage->>'memory')::numeric > 80 THEN 1 END) as high_memory_nodes
FROM teams t
LEFT JOIN infrastructure_nodes inf ON inf.team_id = t.id
GROUP BY t.id, t.name;

-- Function to calculate security score
CREATE OR REPLACE FUNCTION calculate_security_score(team_uuid uuid)
RETURNS decimal AS $$
DECLARE
  critical_count integer;
  high_count integer;
  medium_count integer;
  low_count integer;
  total_count integer;
  base_score decimal := 100;
  security_score decimal;
BEGIN
  SELECT 
    COUNT(CASE WHEN severity = 'critical' AND status = 'open' THEN 1 END),
    COUNT(CASE WHEN severity = 'high' AND status = 'open' THEN 1 END),
    COUNT(CASE WHEN severity = 'medium' AND status = 'open' THEN 1 END),
    COUNT(CASE WHEN severity = 'low' AND status = 'open' THEN 1 END),
    COUNT(CASE WHEN status = 'open' THEN 1 END)
  INTO critical_count, high_count, medium_count, low_count, total_count
  FROM vulnerabilities 
  WHERE team_id = team_uuid;
  
  -- Calculate score based on severity weights
  security_score := base_score - 
    (critical_count * 20) - 
    (high_count * 10) - 
    (medium_count * 5) - 
    (low_count * 2);
  
  -- Ensure score doesn't go below 0
  security_score := GREATEST(security_score, 0);
  
  RETURN ROUND(security_score, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to get pipeline metrics for a team
CREATE OR REPLACE FUNCTION get_pipeline_metrics(team_uuid uuid, days_back integer DEFAULT 30)
RETURNS TABLE(
  total_pipelines bigint,
  total_runs bigint,
  successful_runs bigint,
  failed_runs bigint,
  success_rate decimal,
  avg_duration_minutes decimal,
  deployments_this_period bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id) as total_pipelines,
    COUNT(pr.id) as total_runs,
    COUNT(CASE WHEN pr.status = 'success' THEN 1 END) as successful_runs,
    COUNT(CASE WHEN pr.status = 'failed' THEN 1 END) as failed_runs,
    ROUND(
      (COUNT(CASE WHEN pr.status = 'success' THEN 1 END)::decimal / NULLIF(COUNT(pr.id), 0)) * 100, 
      2
    ) as success_rate,
    ROUND(AVG(pr.duration_seconds) / 60.0, 2) as avg_duration_minutes,
    COUNT(CASE WHEN pr.status = 'success' AND pr.created_at > CURRENT_DATE - INTERVAL '1 day' * days_back THEN 1 END) as deployments_this_period
  FROM pipelines p
  LEFT JOIN pipeline_runs pr ON pr.pipeline_id = p.id 
    AND pr.created_at > CURRENT_DATE - INTERVAL '1 day' * days_back
  WHERE p.team_id = team_uuid AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent system events
CREATE OR REPLACE FUNCTION get_recent_events(team_uuid uuid, limit_count integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  event_type text,
  event_category text,
  severity text,
  title text,
  description text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id,
    se.event_type,
    se.event_category,
    se.severity,
    se.title,
    se.description,
    se.created_at
  FROM system_events se
  WHERE se.team_id = team_uuid
  ORDER BY se.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get vulnerability trends
CREATE OR REPLACE FUNCTION get_vulnerability_trends(team_uuid uuid, days_back integer DEFAULT 30)
RETURNS TABLE(
  date date,
  new_vulnerabilities bigint,
  resolved_vulnerabilities bigint,
  total_open bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '1 day' * days_back,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date as date
  ),
  daily_new AS (
    SELECT 
      v.first_detected::date as date,
      COUNT(*) as new_count
    FROM vulnerabilities v
    WHERE v.team_id = team_uuid 
      AND v.first_detected >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY v.first_detected::date
  ),
  daily_resolved AS (
    SELECT 
      v.resolved_at::date as date,
      COUNT(*) as resolved_count
    FROM vulnerabilities v
    WHERE v.team_id = team_uuid 
      AND v.resolved_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
      AND v.status = 'resolved'
    GROUP BY v.resolved_at::date
  )
  SELECT 
    ds.date,
    COALESCE(dn.new_count, 0) as new_vulnerabilities,
    COALESCE(dr.resolved_count, 0) as resolved_vulnerabilities,
    (
      SELECT COUNT(*)
      FROM vulnerabilities v2
      WHERE v2.team_id = team_uuid 
        AND v2.first_detected::date <= ds.date
        AND (v2.resolved_at IS NULL OR v2.resolved_at::date > ds.date)
        AND v2.status = 'open'
    ) as total_open
  FROM date_series ds
  LEFT JOIN daily_new dn ON dn.date = ds.date
  LEFT JOIN daily_resolved dr ON dr.date = ds.date
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql;

-- Create indexes on views for better performance
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_team_severity_status ON vulnerabilities(team_id, severity, status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline_created ON pipeline_runs(pipeline_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_infrastructure_nodes_team_status ON infrastructure_nodes(team_id, status);
CREATE INDEX IF NOT EXISTS idx_system_events_team_created ON system_events(team_id, created_at DESC);