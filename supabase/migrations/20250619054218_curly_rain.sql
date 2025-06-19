/*
  # Monitoring and Infrastructure Schema

  1. New Tables
    - `infrastructure_nodes` - Kubernetes nodes and infrastructure components
    - `monitoring_metrics` - System and application metrics
    - `monitoring_alerts` - Alert definitions and instances
    - `alert_notifications` - Alert notification history
    - `system_events` - System events and audit logs
    - `performance_baselines` - Performance baseline data

  2. Security
    - Enable RLS on all tables
    - Team-based access control
    - Audit logging for monitoring events

  3. Features
    - Infrastructure monitoring
    - Real-time metrics collection
    - Alert management
    - Performance tracking
    - Event logging
*/

-- Create infrastructure nodes table
CREATE TABLE IF NOT EXISTS infrastructure_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  node_type text NOT NULL CHECK (node_type IN ('kubernetes', 'docker', 'vm', 'physical', 'cloud')),
  role text NOT NULL CHECK (role IN ('control-plane', 'worker', 'database', 'cache', 'load-balancer', 'storage')),
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN ('ready', 'not-ready', 'deploying', 'terminating', 'error', 'unknown')),
  version text,
  os_info jsonb DEFAULT '{}',
  hardware_info jsonb DEFAULT '{}',
  capacity jsonb DEFAULT '{}',
  allocatable jsonb DEFAULT '{}',
  current_usage jsonb DEFAULT '{}',
  labels jsonb DEFAULT '{}',
  annotations jsonb DEFAULT '{}',
  taints jsonb DEFAULT '[]',
  conditions jsonb DEFAULT '[]',
  network_info jsonb DEFAULT '{}',
  last_heartbeat timestamptz,
  team_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create monitoring metrics table
CREATE TABLE IF NOT EXISTS monitoring_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary')),
  source_type text NOT NULL CHECK (source_type IN ('node', 'pod', 'service', 'application', 'custom')),
  source_id text NOT NULL,
  labels jsonb DEFAULT '{}',
  value decimal NOT NULL,
  unit text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  team_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now()
);

-- Create monitoring alerts table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  alert_type text NOT NULL CHECK (alert_type IN ('threshold', 'anomaly', 'composite', 'heartbeat')),
  severity text NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  conditions jsonb NOT NULL DEFAULT '{}',
  thresholds jsonb DEFAULT '{}',
  evaluation_interval integer DEFAULT 60,
  notification_channels jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  team_id uuid REFERENCES teams(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create alert instances table
CREATE TABLE IF NOT EXISTS alert_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES monitoring_alerts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'firing' CHECK (status IN ('firing', 'resolved', 'acknowledged', 'silenced')),
  severity text NOT NULL,
  message text NOT NULL,
  labels jsonb DEFAULT '{}',
  annotations jsonb DEFAULT '{}',
  source_data jsonb DEFAULT '{}',
  fired_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES profiles(id),
  team_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now()
);

-- Create alert notifications table
CREATE TABLE IF NOT EXISTS alert_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_instance_id uuid REFERENCES alert_instances(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'slack', 'webhook', 'sms', 'push')),
  recipient text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  message_content text,
  response_data jsonb DEFAULT '{}',
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create system events table
CREATE TABLE IF NOT EXISTS system_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_category text NOT NULL CHECK (event_category IN ('security', 'deployment', 'infrastructure', 'user', 'system')),
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('critical', 'warning', 'info', 'debug')),
  title text NOT NULL,
  description text,
  source_type text NOT NULL,
  source_id text,
  user_id uuid REFERENCES profiles(id),
  metadata jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  team_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now()
);

-- Create performance baselines table
CREATE TABLE IF NOT EXISTS performance_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  source_type text NOT NULL,
  source_id text NOT NULL,
  baseline_type text NOT NULL CHECK (baseline_type IN ('daily', 'weekly', 'monthly', 'custom')),
  statistical_data jsonb NOT NULL DEFAULT '{}',
  confidence_interval jsonb DEFAULT '{}',
  sample_size integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  team_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE infrastructure_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_baselines ENABLE ROW LEVEL SECURITY;

-- Infrastructure nodes policies
CREATE POLICY "Team members can read team infrastructure"
  ON infrastructure_nodes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = infrastructure_nodes.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "DevOps and admins can manage infrastructure"
  ON infrastructure_nodes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'devops')
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = infrastructure_nodes.team_id AND p.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
    )
  );

-- Monitoring metrics policies
CREATE POLICY "Team members can read team metrics"
  ON monitoring_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = monitoring_metrics.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert metrics"
  ON monitoring_metrics FOR INSERT
  TO authenticated
  USING (true);

-- Monitoring alerts policies
CREATE POLICY "Team members can read team alerts"
  ON monitoring_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = monitoring_alerts.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "DevOps and admins can manage alerts"
  ON monitoring_alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'devops')
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = monitoring_alerts.team_id AND p.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
    )
  );

-- Alert instances policies
CREATE POLICY "Team members can read team alert instances"
  ON alert_instances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = alert_instances.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can acknowledge alerts"
  ON alert_instances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = alert_instances.team_id AND p.user_id = auth.uid()
    )
  );

-- System events policies
CREATE POLICY "Team members can read team events"
  ON system_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = system_events.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert events"
  ON system_events FOR INSERT
  TO authenticated
  USING (true);

-- Performance baselines policies
CREATE POLICY "Team members can read team baselines"
  ON performance_baselines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = performance_baselines.team_id AND p.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_infrastructure_nodes_team_id ON infrastructure_nodes(team_id);
CREATE INDEX IF NOT EXISTS idx_infrastructure_nodes_status ON infrastructure_nodes(status);
CREATE INDEX IF NOT EXISTS idx_infrastructure_nodes_type_role ON infrastructure_nodes(node_type, role);

CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_name_timestamp ON monitoring_metrics(metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_source ON monitoring_metrics(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_team_id ON monitoring_metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_timestamp ON monitoring_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_team_id ON monitoring_alerts(team_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_active ON monitoring_alerts(is_active);

CREATE INDEX IF NOT EXISTS idx_alert_instances_alert_id ON alert_instances(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_instances_status ON alert_instances(status);
CREATE INDEX IF NOT EXISTS idx_alert_instances_team_id ON alert_instances(team_id);
CREATE INDEX IF NOT EXISTS idx_alert_instances_fired_at ON alert_instances(fired_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_notifications_instance_id ON alert_notifications(alert_instance_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_status ON alert_notifications(status);

CREATE INDEX IF NOT EXISTS idx_system_events_category ON system_events(event_category);
CREATE INDEX IF NOT EXISTS idx_system_events_team_id ON system_events(team_id);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_events_source ON system_events(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_performance_baselines_metric ON performance_baselines(metric_name, source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_performance_baselines_team_id ON performance_baselines(team_id);

-- Add updated_at triggers
CREATE TRIGGER update_infrastructure_nodes_updated_at
  BEFORE UPDATE ON infrastructure_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_alerts_updated_at
  BEFORE UPDATE ON monitoring_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_baselines_updated_at
  BEFORE UPDATE ON performance_baselines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create system events
CREATE OR REPLACE FUNCTION create_system_event(
  p_event_type text,
  p_event_category text,
  p_severity text,
  p_title text,
  p_description text DEFAULT NULL,
  p_source_type text DEFAULT 'system',
  p_source_id text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_team_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO system_events (
    event_type, event_category, severity, title, description,
    source_type, source_id, user_id, metadata, team_id
  ) VALUES (
    p_event_type, p_event_category, p_severity, p_title, p_description,
    p_source_type, p_source_id, p_user_id, p_metadata, p_team_id
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;