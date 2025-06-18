export interface Pipeline {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  lastRun: string;
  duration: string;
  repository: string;
  branch: string;
}

export interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  package: string;
  version: string;
  fixedVersion?: string;
  scanner: 'trivy' | 'owasp' | 'bandit';
}

export interface MetricData {
  timestamp: string;
  value: number;
}

export interface MonitoringMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  data: MetricData[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}