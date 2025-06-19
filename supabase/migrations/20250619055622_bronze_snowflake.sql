/*
  # Dashboard and Analytics Views

  1. Views Created
    - `dashboard_summary` - Team-level dashboard metrics
    - `security_metrics` - Security vulnerability analytics
    - `pipeline_performance` - Pipeline success rates and performance
    - `monitoring_health` - System monitoring and health metrics

  2. Functions Created
    - `calculate_security_score()` - Calculate team security score
    - `get_pipeline_metrics()` - Get pipeline performance metrics
    - `get_recent_events()` - Get recent system events
    - `get_vulnerability_trends()` - Get vulnerability trend data

  3. Performance Indexes
    - Optimized indexes for dashboard queries
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
  -- Integration metrics (using integrations table)
  COUNT(DISTINCT CASE WHEN i.status = 'connected' THEN i.id END) as healthy_integrations,
  COUNT(DISTINCT CASE WHEN i.status != 'connected' THEN i.id END) as unhealthy_integrations,
  -- Alert metrics (using compliance_reports as proxy for alerts)
  COUNT(DISTINCT CASE WHEN cr.status = 'draft' THEN cr.id END) as active_reports,
  COUNT(DISTINCT CASE WHEN cr.status = 'published' THEN cr.id END) as published_reports
FROM teams t
LEFT JOIN pipelines p ON p.team_id = t.id
LEFT JOIN pipeline_runs pr ON pr.pipeline_id = p.id AND pr.created_at > CURRENT_DATE
LEFT JOIN vulnerabilities v ON v.team_id = t.id
LEFT JOIN integrations i ON i.team_id = t.id
LEFT JOIN compliance_reports cr ON cr.team_id = t.id AND cr.created_at > CURRENT_DATE - INTERVAL '1 day'
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

-- Create view for monitoring health (using integrations and security scans)
CREATE OR REPLACE VIEW monitoring_health AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  COUNT(i.id) as total_integrations,
  COUNT(CASE WHEN i.status = 'connected' THEN 1 END) as connected_integrations,
  COUNT(CASE WHEN i.status = 'disconnected' THEN 1 END) as disconnected_integrations,
  COUNT(CASE WHEN i.status = 'error' THEN 1 END) as error_integrations,
  COUNT(CASE WHEN i.health_status = 'healthy' THEN 1 END) as healthy_services,
  COUNT(CASE WHEN i.health_status = 'degraded' THEN 1 END) as degraded_services,
  COUNT(CASE WHEN i.health_status = 'unhealthy' THEN 1 END) as unhealthy_services,
  COUNT(CASE WHEN ss.status = 'completed' AND ss.created_at > CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as recent_scans,
  COUNT(CASE WHEN ss.status = 'running' THEN 1 END) as running_scans
FROM teams t
LEFT JOIN integrations i ON i.team_id = t.id
LEFT JOIN security_scans ss ON ss.team_id = t.id
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

-- Function to get recent system events (using pipeline logs and security scans)
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
  (
    -- Pipeline events
    SELECT 
      pr.id,
      'pipeline'::text as event_type,
      'deployment'::text as event_category,
      CASE 
        WHEN pr.status = 'failed' THEN 'high'
        WHEN pr.status = 'success' THEN 'info'
        ELSE 'medium'
      END as severity,
      CONCAT('Pipeline ', p.name, ' ', pr.status) as title,
      CONCAT('Pipeline run #', pr.run_number, ' ', pr.status) as description,
      pr.created_at
    FROM pipeline_runs pr
    JOIN pipelines p ON p.id = pr.pipeline_id
    WHERE p.team_id = team_uuid
    
    UNION ALL
    
    -- Security scan events
    SELECT 
      ss.id,
      'security'::text as event_type,
      'scan'::text as event_category,
      CASE 
        WHEN ss.status = 'failed' THEN 'high'
        WHEN ss.status = 'completed' THEN 'info'
        ELSE 'medium'
      END as severity,
      CONCAT('Security scan ', ss.status) as title,
      CONCAT('Scan of type ', ss.scan_type, ' ', ss.status) as description,
      ss.created_at
    FROM security_scans ss
    WHERE ss.team_id = team_uuid
    
    UNION ALL
    
    -- Vulnerability events
    SELECT 
      v.id,
      'vulnerability'::text as event_type,
      'security'::text as event_category,
      v.severity as severity,
      v.title,
      v.description,
      v.created_at
    FROM vulnerabilities v
    WHERE v.team_id = team_uuid
      AND v.created_at > CURRENT_DATE - INTERVAL '7 days'
  )
  ORDER BY created_at DESC
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

-- Function to get integration health metrics
CREATE OR REPLACE FUNCTION get_integration_health(team_uuid uuid)
RETURNS TABLE(
  integration_type text,
  total_count bigint,
  connected_count bigint,
  healthy_count bigint,
  error_count bigint,
  last_health_check timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.integration_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN i.status = 'connected' THEN 1 END) as connected_count,
    COUNT(CASE WHEN i.health_status = 'healthy' THEN 1 END) as healthy_count,
    COUNT(CASE WHEN i.status = 'error' THEN 1 END) as error_count,
    MAX(i.last_health_check) as last_health_check
  FROM integrations i
  WHERE i.team_id = team_uuid
  GROUP BY i.integration_type;
END;
$$ LANGUAGE plpgsql;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_team_severity_status ON vulnerabilities(team_id, severity, status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_team_dates ON vulnerabilities(team_id, first_detected, resolved_at);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline_created ON pipeline_runs(pipeline_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_team_status ON pipeline_runs(created_at DESC) WHERE status IN ('success', 'failed');
CREATE INDEX IF NOT EXISTS idx_integrations_team_status ON integrations(team_id, status, health_status);
CREATE INDEX IF NOT EXISTS idx_security_scans_team_created ON security_scans(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_team_status ON compliance_reports(team_id, status, created_at);

-- Create composite indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_dashboard ON vulnerabilities(team_id, status, severity, first_detected, resolved_at);
CREATE INDEX IF NOT EXISTS idx_pipelines_dashboard ON pipelines(team_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_dashboard ON pipeline_runs(pipeline_id, status, created_at);