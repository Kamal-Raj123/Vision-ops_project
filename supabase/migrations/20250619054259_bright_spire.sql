/*
  # Integrations and External Services Schema

  1. New Tables
    - `integrations` - External service integrations
    - `integration_configs` - Integration configuration settings
    - `integration_logs` - Integration activity logs
    - `webhooks` - Webhook endpoints and configurations
    - `webhook_deliveries` - Webhook delivery attempts and status
    - `api_keys` - API key management for integrations

  2. Security
    - Enable RLS on all tables
    - Encrypted storage for sensitive data
    - Audit logging for integration activities

  3. Features
    - Multi-service integration support
    - Webhook management
    - API key lifecycle management
    - Integration health monitoring
*/

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  integration_type text NOT NULL CHECK (integration_type IN ('ci_cd', 'monitoring', 'security', 'communication', 'container', 'orchestration', 'cloud')),
  service_name text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'configuring', 'testing')),
  endpoint_url text,
  version text,
  capabilities text[] DEFAULT '{}',
  health_check_config jsonb DEFAULT '{}',
  last_health_check timestamptz,
  health_status text DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  team_id uuid REFERENCES teams(id),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create integration configs table
CREATE TABLE IF NOT EXISTS integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  config_key text NOT NULL,
  config_value text, -- Encrypted for sensitive values
  is_sensitive boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(integration_id, config_key)
);

-- Create integration logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  log_level text NOT NULL DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error')),
  event_type text NOT NULL,
  message text NOT NULL,
  request_data jsonb DEFAULT '{}',
  response_data jsonb DEFAULT '{}',
  duration_ms integer,
  status_code integer,
  error_details text,
  created_at timestamptz DEFAULT now()
);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  secret text, -- Encrypted
  events text[] NOT NULL DEFAULT '{}',
  headers jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  retry_config jsonb DEFAULT '{"max_retries": 3, "retry_delay": 5}',
  team_id uuid REFERENCES teams(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create webhook deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  http_status_code integer,
  response_body text,
  response_headers jsonb DEFAULT '{}',
  attempt_count integer DEFAULT 0,
  next_retry_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_hash text NOT NULL, -- Hashed API key
  key_prefix text NOT NULL, -- First few characters for identification
  permissions text[] DEFAULT '{}',
  scopes text[] DEFAULT '{}',
  expires_at timestamptz,
  last_used_at timestamptz,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  team_id uuid REFERENCES teams(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Integrations policies
CREATE POLICY "Team members can read team integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = integrations.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and DevOps can manage integrations"
  ON integrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'devops')
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = integrations.team_id AND p.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
    )
  );

-- Integration configs policies
CREATE POLICY "Team members can read non-sensitive configs"
  ON integration_configs FOR SELECT
  TO authenticated
  USING (
    NOT is_sensitive AND
    EXISTS (
      SELECT 1 FROM integrations i
      JOIN team_members tm ON tm.team_id = i.team_id
      JOIN profiles p ON p.id = tm.user_id
      WHERE i.id = integration_configs.integration_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all configs"
  ON integration_configs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM integrations i
      JOIN team_members tm ON tm.team_id = i.team_id
      JOIN profiles p ON p.id = tm.user_id
      WHERE i.id = integration_configs.integration_id AND p.user_id = auth.uid() AND tm.role = 'owner'
    )
  );

-- Integration logs policies
CREATE POLICY "Team members can read integration logs"
  ON integration_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM integrations i
      JOIN team_members tm ON tm.team_id = i.team_id
      JOIN profiles p ON p.id = tm.user_id
      WHERE i.id = integration_logs.integration_id AND p.user_id = auth.uid()
    )
  );

-- Webhooks policies
CREATE POLICY "Team members can read team webhooks"
  ON webhooks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = webhooks.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage webhooks"
  ON webhooks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'devops')
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = webhooks.team_id AND p.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
    )
  );

-- Webhook deliveries policies
CREATE POLICY "Team members can read webhook deliveries"
  ON webhook_deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM webhooks w
      JOIN team_members tm ON tm.team_id = w.team_id
      JOIN profiles p ON p.id = tm.user_id
      WHERE w.id = webhook_deliveries.webhook_id AND p.user_id = auth.uid()
    )
  );

-- API keys policies
CREATE POLICY "Team members can read team API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = api_keys.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage API keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'devops')
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = api_keys.team_id AND p.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_team_id ON integrations(team_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type_status ON integrations(integration_type, status);
CREATE INDEX IF NOT EXISTS idx_integration_configs_integration_id ON integration_configs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_team_id ON webhooks(team_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_team_id ON api_keys(team_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);

-- Add updated_at triggers
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log integration events
CREATE OR REPLACE FUNCTION log_integration_event(
  p_integration_id uuid,
  p_log_level text,
  p_event_type text,
  p_message text,
  p_request_data jsonb DEFAULT '{}',
  p_response_data jsonb DEFAULT '{}',
  p_duration_ms integer DEFAULT NULL,
  p_status_code integer DEFAULT NULL,
  p_error_details text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO integration_logs (
    integration_id, log_level, event_type, message,
    request_data, response_data, duration_ms, status_code, error_details
  ) VALUES (
    p_integration_id, p_log_level, p_event_type, p_message,
    p_request_data, p_response_data, p_duration_ms, p_status_code, p_error_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to queue webhook delivery
CREATE OR REPLACE FUNCTION queue_webhook_delivery(
  p_webhook_id uuid,
  p_event_type text,
  p_payload jsonb
)
RETURNS uuid AS $$
DECLARE
  delivery_id uuid;
BEGIN
  INSERT INTO webhook_deliveries (
    webhook_id, event_type, payload, status
  ) VALUES (
    p_webhook_id, p_event_type, p_payload, 'pending'
  ) RETURNING id INTO delivery_id;
  
  RETURN delivery_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;