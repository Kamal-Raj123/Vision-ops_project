/*
  # Security Scanning and Vulnerability Management Schema

  1. New Tables
    - `security_scanners` - Available security scanning tools
    - `security_scans` - Individual scan executions
    - `vulnerabilities` - Discovered vulnerabilities
    - `vulnerability_fixes` - Fix tracking and remediation
    - `security_policies` - Security policies and compliance rules
    - `compliance_reports` - Compliance status and reports

  2. Security
    - Enable RLS on all tables
    - Role-based access for security data
    - Audit logging for security events

  3. Features
    - Multi-scanner support
    - Vulnerability lifecycle management
    - Compliance tracking
    - Risk assessment and prioritization
*/

-- Create security scanners table
CREATE TABLE IF NOT EXISTS security_scanners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('sast', 'dast', 'container', 'dependency', 'infrastructure')),
  scanner_tool text NOT NULL,
  version text,
  configuration jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create security scans table
CREATE TABLE IF NOT EXISTS security_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id uuid REFERENCES security_scanners(id),
  name text NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('repository', 'container', 'url', 'file')),
  target_identifier text NOT NULL,
  scan_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  configuration jsonb DEFAULT '{}',
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  triggered_by uuid REFERENCES profiles(id),
  team_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now()
);

-- Create vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES security_scans(id),
  external_id text,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  cvss_score decimal(3,1),
  cve_id text,
  cwe_id text,
  package_name text,
  package_version text,
  fixed_version text,
  file_path text,
  line_number integer,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'false_positive', 'accepted_risk')),
  priority text DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  assigned_to uuid REFERENCES profiles(id),
  due_date timestamptz,
  first_detected timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}',
  team_id uuid REFERENCES teams(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vulnerability fixes table
CREATE TABLE IF NOT EXISTS vulnerability_fixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vulnerability_id uuid REFERENCES vulnerabilities(id) ON DELETE CASCADE,
  fix_type text NOT NULL CHECK (fix_type IN ('patch', 'upgrade', 'configuration', 'code_change', 'workaround')),
  description text NOT NULL,
  instructions text,
  pull_request_url text,
  verification_steps text,
  applied_by uuid REFERENCES profiles(id),
  applied_at timestamptz,
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'applied', 'verified', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create security policies table
CREATE TABLE IF NOT EXISTS security_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  policy_type text NOT NULL CHECK (policy_type IN ('vulnerability', 'compliance', 'access', 'scanning')),
  rules jsonb NOT NULL DEFAULT '{}',
  severity_thresholds jsonb DEFAULT '{}',
  enforcement_level text NOT NULL DEFAULT 'warning' CHECK (enforcement_level IN ('disabled', 'warning', 'blocking')),
  team_id uuid REFERENCES teams(id),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create compliance reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  framework text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('assessment', 'audit', 'certification')),
  scope jsonb DEFAULT '{}',
  findings jsonb DEFAULT '{}',
  recommendations jsonb DEFAULT '{}',
  compliance_score decimal(5,2),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published')),
  generated_by uuid REFERENCES profiles(id),
  reviewed_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  team_id uuid REFERENCES teams(id),
  report_period_start timestamptz,
  report_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE security_scanners ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerability_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

-- Security scanners policies (admin and security roles only)
CREATE POLICY "Security and admin can manage scanners"
  ON security_scanners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'security')
    )
  );

CREATE POLICY "Team members can read scanners"
  ON security_scanners FOR SELECT
  TO authenticated
  USING (true);

-- Security scans policies
CREATE POLICY "Team members can read team scans"
  ON security_scans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = security_scans.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Security and devops can manage scans"
  ON security_scans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'security', 'devops')
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = security_scans.team_id AND p.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
    )
  );

-- Vulnerabilities policies
CREATE POLICY "Team members can read team vulnerabilities"
  ON vulnerabilities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = vulnerabilities.team_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Assigned users can update vulnerabilities"
  ON vulnerabilities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = vulnerabilities.assigned_to AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'security')
    )
  );

-- Vulnerability fixes policies
CREATE POLICY "Team members can read vulnerability fixes"
  ON vulnerability_fixes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vulnerabilities v
      JOIN team_members tm ON tm.team_id = v.team_id
      JOIN profiles p ON p.id = tm.user_id
      WHERE v.id = vulnerability_fixes.vulnerability_id AND p.user_id = auth.uid()
    )
  );

-- Security policies policies
CREATE POLICY "Team members can read team security policies"
  ON security_policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = security_policies.team_id AND p.user_id = auth.uid()
    )
  );

-- Compliance reports policies
CREATE POLICY "Team members can read team compliance reports"
  ON compliance_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.team_id = compliance_reports.team_id AND p.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_scans_team_id ON security_scans(team_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_status ON security_scans(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_team_id ON vulnerabilities(team_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_assigned_to ON vulnerabilities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_vulnerability_fixes_vulnerability_id ON vulnerability_fixes(vulnerability_id);
CREATE INDEX IF NOT EXISTS idx_security_policies_team_id ON security_policies(team_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_team_id ON compliance_reports(team_id);

-- Add updated_at triggers
CREATE TRIGGER update_vulnerabilities_updated_at
  BEFORE UPDATE ON vulnerabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_policies_updated_at
  BEFORE UPDATE ON security_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_reports_updated_at
  BEFORE UPDATE ON compliance_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();