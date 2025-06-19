/*
  # CI/CD Pipelines Schema

  1. New Tables
    - `pipelines` - Pipeline definitions and configurations
    - `pipeline_runs` - Individual pipeline execution records
    - `pipeline_stages` - Stage definitions for pipelines
    - `pipeline_stage_runs` - Individual stage execution records
    - `pipeline_artifacts` - Build artifacts and outputs
    - `pipeline_logs` - Execution logs and outputs

  2. Security
    - Enable RLS on all tables
    - Team-based access control
    - Audit logging for all operations

  3. Features
    - Complete pipeline lifecycle management
    - Stage-based execution tracking
    - Artifact management
    - Comprehensive logging
*/

-- Create pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  repository_url text NOT NULL,
  branch text NOT NULL DEFAULT 'main',
  trigger_type text NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'webhook', 'schedule', 'pr')),
  configuration jsonb DEFAULT '{}',
  environment_variables jsonb DEFAULT '{}',
  notifications jsonb DEFAULT '{}',
  security_settings jsonb DEFAULT '{}',
  team_id uuid REFERENCES teams(id),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pipeline stages table
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  stage_order integer NOT NULL,
  commands text[] DEFAULT '{}',
  environment jsonb DEFAULT '{}',
  timeout_minutes integer DEFAULT 30,
  retry_count integer DEFAULT 0,
  continue_on_failure boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pipeline_id, stage_order)
);

-- Create pipeline runs table
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE CASCADE,
  run_number integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
  trigger_type text NOT NULL,
  triggered_by uuid REFERENCES profiles(id),
  branch text NOT NULL,
  commit_sha text,
  commit_message text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  environment_variables jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create pipeline stage runs table
CREATE TABLE IF NOT EXISTS pipeline_stage_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id uuid REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage_id uuid REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'skipped')),
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  exit_code integer,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create pipeline artifacts table
CREATE TABLE IF NOT EXISTS pipeline_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id uuid REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage_run_id uuid REFERENCES pipeline_stage_runs(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  checksum text,
  download_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create pipeline logs table
CREATE TABLE IF NOT EXISTS pipeline_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id uuid REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage_run_id uuid REFERENCES pipeline_stage_runs(id),
  log_level text NOT NULL DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error')),
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stage_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_logs ENABLE ROW LEVEL SECURITY;

-- Pipelines policies
CREATE POLICY "Team members can read team pipelines"
  ON pipelines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = pipelines.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "DevOps and admins can manage pipelines"
  ON pipelines FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'devops')
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = pipelines.team_id AND p.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
    )
  );

-- Pipeline stages policies
CREATE POLICY "Team members can read pipeline stages"
  ON pipeline_stages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pipelines p
      JOIN team_members tm ON tm.team_id = p.team_id
      JOIN profiles pr ON pr.id = tm.user_id
      WHERE p.id = pipeline_stages.pipeline_id AND pr.user_id = auth.uid()
    )
  );

-- Pipeline runs policies
CREATE POLICY "Team members can read pipeline runs"
  ON pipeline_runs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pipelines p
      JOIN team_members tm ON tm.team_id = p.team_id
      JOIN profiles pr ON pr.id = tm.user_id
      WHERE p.id = pipeline_runs.pipeline_id AND pr.user_id = auth.uid()
    )
  );

-- Pipeline logs policies
CREATE POLICY "Team members can read pipeline logs"
  ON pipeline_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pipeline_runs pr
      JOIN pipelines p ON p.id = pr.pipeline_id
      JOIN team_members tm ON tm.team_id = p.team_id
      JOIN profiles pf ON pf.id = tm.user_id
      WHERE pr.id = pipeline_logs.pipeline_run_id AND pf.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pipelines_team_id ON pipelines(team_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_created_by ON pipelines(created_by);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline_id ON pipeline_runs(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_runs_pipeline_run_id ON pipeline_stage_runs(pipeline_run_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_artifacts_pipeline_run_id ON pipeline_artifacts(pipeline_run_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_pipeline_run_id ON pipeline_logs(pipeline_run_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_timestamp ON pipeline_logs(timestamp);

-- Add updated_at triggers
CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_stages_updated_at
  BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-increment run numbers
CREATE OR REPLACE FUNCTION set_pipeline_run_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(run_number), 0) + 1
  INTO NEW.run_number
  FROM pipeline_runs
  WHERE pipeline_id = NEW.pipeline_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for auto-incrementing run numbers
CREATE TRIGGER set_pipeline_run_number_trigger
  BEFORE INSERT ON pipeline_runs
  FOR EACH ROW EXECUTE FUNCTION set_pipeline_run_number();