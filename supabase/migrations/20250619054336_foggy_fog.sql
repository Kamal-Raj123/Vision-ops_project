/*
  # Sample Data for Development and Testing

  1. Sample Data
    - Default teams and users
    - Sample pipelines and configurations
    - Mock vulnerabilities and scans
    - Sample infrastructure nodes
    - Integration configurations

  2. Purpose
    - Provide realistic test data
    - Enable immediate platform testing
    - Demonstrate all features
*/

-- Insert sample teams
INSERT INTO teams (id, name, description, settings) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Platform Team', 'Core platform development and operations', '{"notifications": {"slack": "#platform"}}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Security Team', 'Security operations and compliance', '{"notifications": {"slack": "#security"}}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Frontend Team', 'Frontend application development', '{"notifications": {"slack": "#frontend"}}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample profiles (these will be linked to auth.users when users sign up)
INSERT INTO profiles (id, user_id, email, full_name, role, department, preferences) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', 'admin@company.com', 'System Administrator', 'admin', 'IT Operations', '{"theme": "dark", "notifications": true}'),
  ('650e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000002', 'devops@company.com', 'DevOps Engineer', 'devops', 'Platform Engineering', '{"theme": "light", "notifications": true}'),
  ('650e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000003', 'security@company.com', 'Security Analyst', 'security', 'Security Operations', '{"theme": "dark", "notifications": true}')
ON CONFLICT (email) DO NOTHING;

-- Insert team memberships
INSERT INTO team_members (team_id, user_id, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'member')
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Insert sample security scanners
INSERT INTO security_scanners (id, name, type, scanner_tool, version, configuration, is_active) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Trivy Container Scanner', 'container', 'trivy', 'v0.45.1', '{"timeout": 600, "severity": ["CRITICAL", "HIGH"]}', true),
  ('750e8400-e29b-41d4-a716-446655440002', 'OWASP ZAP', 'dast', 'owasp-zap', '2.14.0', '{"spider_timeout": 300, "scan_timeout": 1800}', true),
  ('750e8400-e29b-41d4-a716-446655440003', 'Bandit Python Scanner', 'sast', 'bandit', '1.7.5', '{"confidence": "medium", "severity": "medium"}', true),
  ('750e8400-e29b-41d4-a716-446655440004', 'Snyk Vulnerability Scanner', 'dependency', 'snyk', '1.1200.0', '{"fail_on": "upgradable", "severity_threshold": "medium"}', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample pipelines
INSERT INTO pipelines (id, name, description, repository_url, branch, trigger_type, configuration, team_id, created_by) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'Frontend Application', 'React TypeScript application with comprehensive testing', 'https://github.com/company/frontend-app', 'main', 'webhook', 
   '{"buildTool": "npm", "testFramework": "jest", "deployTarget": "kubernetes"}', 
   '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002'),
  ('850e8400-e29b-41d4-a716-446655440002', 'Backend API Service', 'Node.js Express API with database integration', 'https://github.com/company/backend-api', 'develop', 'webhook',
   '{"buildTool": "npm", "testFramework": "jest", "deployTarget": "kubernetes"}',
   '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'),
  ('850e8400-e29b-41d4-a716-446655440003', 'Security Scanning Pipeline', 'Automated security scanning for all repositories', 'https://github.com/company/security-scans', 'main', 'schedule',
   '{"buildTool": "make", "testFramework": "custom", "deployTarget": "none"}',
   '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample pipeline stages
INSERT INTO pipeline_stages (id, pipeline_id, name, stage_order, commands, timeout_minutes) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Source Checkout', 1, '{"git clone $REPO_URL", "git checkout $BRANCH"}', 5),
  ('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'Install Dependencies', 2, '{"npm ci", "npm audit --audit-level moderate"}', 10),
  ('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 'Build Application', 3, '{"npm run build", "npm run test"}', 15),
  ('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440001', 'Security Scan', 4, '{"trivy fs .", "npm audit --audit-level high"}', 20),
  ('950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440001', 'Deploy to Staging', 5, '{"kubectl apply -f k8s/staging/", "kubectl rollout status deployment/frontend-app"}', 10)
ON CONFLICT (id) DO NOTHING;

-- Insert sample infrastructure nodes
INSERT INTO infrastructure_nodes (id, name, node_type, role, status, version, capacity, current_usage, team_id) VALUES
  ('a50e8400-e29b-41d4-a716-446655440001', 'k8s-master-1', 'kubernetes', 'control-plane', 'ready', 'v1.28.2', 
   '{"cpu": "4", "memory": "16Gi", "storage": "100Gi", "pods": 110}',
   '{"cpu": 23, "memory": 67, "storage": 45, "pods": 12}',
   '550e8400-e29b-41d4-a716-446655440001'),
  ('a50e8400-e29b-41d4-a716-446655440002', 'k8s-worker-1', 'kubernetes', 'worker', 'ready', 'v1.28.2',
   '{"cpu": "8", "memory": "32Gi", "storage": "200Gi", "pods": 110}',
   '{"cpu": 45, "memory": 72, "storage": 38, "pods": 24}',
   '550e8400-e29b-41d4-a716-446655440001'),
  ('a50e8400-e29b-41d4-a716-446655440003', 'k8s-worker-2', 'kubernetes', 'worker', 'ready', 'v1.28.2',
   '{"cpu": "8", "memory": "32Gi", "storage": "200Gi", "pods": 110}',
   '{"cpu": 89, "memory": 94, "storage": 67, "pods": 45}',
   '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample integrations
INSERT INTO integrations (id, name, integration_type, service_name, status, endpoint_url, version, team_id, created_by) VALUES
  ('b50e8400-e29b-41d4-a716-446655440001', 'Jenkins CI/CD', 'ci_cd', 'jenkins', 'connected', 'https://jenkins.company.com', '2.426.1', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'),
  ('b50e8400-e29b-41d4-a716-446655440002', 'Prometheus Monitoring', 'monitoring', 'prometheus', 'connected', 'http://prometheus:9090', '2.47.0', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'),
  ('b50e8400-e29b-41d4-a716-446655440003', 'Kubernetes Cluster', 'orchestration', 'kubernetes', 'connected', 'https://k8s-api.company.com', 'v1.28.2', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'),
  ('b50e8400-e29b-41d4-a716-446655440004', 'Slack Notifications', 'communication', 'slack', 'connected', 'https://hooks.slack.com/services/...', 'API v1', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample vulnerabilities
INSERT INTO vulnerabilities (id, title, description, severity, cvss_score, cve_id, package_name, package_version, fixed_version, status, team_id) VALUES
  ('c50e8400-e29b-41d4-a716-446655440001', 'SQL Injection vulnerability in user authentication', 'Improper input validation allows SQL injection attacks through the login form', 'critical', 9.8, 'CVE-2023-1234', 'express-validator', '6.10.0', '6.14.2', 'open', '550e8400-e29b-41d4-a716-446655440003'),
  ('c50e8400-e29b-41d4-a716-446655440002', 'Outdated cryptographic library with known vulnerabilities', 'The crypto-js library version contains deprecated cryptographic functions', 'high', 7.5, 'CVE-2023-5678', 'crypto-js', '3.1.2', '4.1.1', 'in_progress', '550e8400-e29b-41d4-a716-446655440003'),
  ('c50e8400-e29b-41d4-a716-446655440003', 'Hardcoded credentials detected in configuration files', 'API keys and database credentials found in plaintext', 'medium', 5.3, NULL, 'config.py', 'N/A', NULL, 'open', '550e8400-e29b-41d4-a716-446655440002'),
  ('c50e8400-e29b-41d4-a716-446655440004', 'Missing security headers in web application', 'HTTP security headers not configured properly', 'low', 3.1, NULL, 'nginx.conf', 'N/A', NULL, 'resolved', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample monitoring alerts
INSERT INTO monitoring_alerts (id, name, description, alert_type, severity, conditions, team_id, created_by) VALUES
  ('d50e8400-e29b-41d4-a716-446655440001', 'High CPU Usage', 'Alert when CPU usage exceeds 80% for 5 minutes', 'threshold', 'warning', '{"metric": "cpu_usage", "operator": ">", "threshold": 80, "duration": "5m"}', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'),
  ('d50e8400-e29b-41d4-a716-446655440002', 'Memory Usage Critical', 'Alert when memory usage exceeds 90%', 'threshold', 'critical', '{"metric": "memory_usage", "operator": ">", "threshold": 90, "duration": "1m"}', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'),
  ('d50e8400-e29b-41d4-a716-446655440003', 'Pod Restart Rate High', 'Alert when pod restart rate is abnormal', 'anomaly', 'warning', '{"metric": "pod_restarts", "baseline": "weekly", "deviation": 2}', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Insert sample system events
INSERT INTO system_events (id, event_type, event_category, severity, title, description, source_type, team_id) VALUES
  ('e50e8400-e29b-41d4-a716-446655440001', 'deployment_success', 'deployment', 'info', 'Frontend Application Deployed', 'Successfully deployed frontend-app v1.2.3 to production', 'pipeline', '550e8400-e29b-41d4-a716-446655440003'),
  ('e50e8400-e29b-41d4-a716-446655440002', 'vulnerability_detected', 'security', 'critical', 'Critical Vulnerability Detected', 'SQL injection vulnerability found in authentication module', 'security_scan', '550e8400-e29b-41d4-a716-446655440002'),
  ('e50e8400-e29b-41d4-a716-446655440003', 'node_added', 'infrastructure', 'info', 'New Kubernetes Node Added', 'Worker node k8s-worker-3 successfully joined the cluster', 'kubernetes', '550e8400-e29b-41d4-a716-446655440001'),
  ('e50e8400-e29b-41d4-a716-446655440004', 'alert_triggered', 'infrastructure', 'warning', 'High Memory Usage Alert', 'Memory usage on worker-2 exceeded 90% threshold', 'monitoring', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;