import { Pipeline, Vulnerability, MonitoringMetric } from '../types';

export const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'Frontend Deploy',
    status: 'success',
    lastRun: '2 minutes ago',
    duration: '3m 24s',
    repository: 'secureops/frontend',
    branch: 'main'
  },
  {
    id: '2',
    name: 'Backend API',
    status: 'running',
    lastRun: 'Running now',
    duration: '1m 45s',
    repository: 'secureops/api',
    branch: 'develop'
  },
  {
    id: '3',
    name: 'Database Migration',
    status: 'failed',
    lastRun: '1 hour ago',
    duration: '45s',
    repository: 'secureops/db',
    branch: 'main'
  },
  {
    id: '4',
    name: 'Security Scan',
    status: 'pending',
    lastRun: 'Never',
    duration: '-',
    repository: 'secureops/security',
    branch: 'main'
  }
];

export const mockVulnerabilities: Vulnerability[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'SQL Injection vulnerability in user authentication',
    description: 'Improper input validation allows SQL injection attacks',
    package: 'express-validator',
    version: '6.10.0',
    fixedVersion: '6.14.2',
    scanner: 'owasp'
  },
  {
    id: '2',
    severity: 'high',
    title: 'Outdated cryptographic library',
    description: 'Using deprecated cryptographic functions',
    package: 'crypto-js',
    version: '3.1.2',
    fixedVersion: '4.1.1',
    scanner: 'trivy'
  },
  {
    id: '3',
    severity: 'medium',
    title: 'Hardcoded credentials in source code',
    description: 'API keys found in configuration files',
    package: 'config.py',
    version: 'N/A',
    scanner: 'bandit'
  },
  {
    id: '4',
    severity: 'low',
    title: 'Missing security headers',
    description: 'HTTP security headers not configured',
    package: 'nginx.conf',
    version: 'N/A',
    scanner: 'owasp'
  }
];

export const mockMetrics: MonitoringMetric[] = [
  {
    id: '1',
    name: 'CPU Usage',
    value: '67',
    unit: '%',
    status: 'warning',
    data: Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
      value: Math.random() * 100
    }))
  },
  {
    id: '2',
    name: 'Memory Usage',
    value: '45',
    unit: '%',
    status: 'healthy',
    data: Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
      value: Math.random() * 80
    }))
  },
  {
    id: '3',
    name: 'Network I/O',
    value: '12.3',
    unit: 'MB/s',
    status: 'healthy',
    data: Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
      value: Math.random() * 50
    }))
  },
  {
    id: '4',
    name: 'Disk Usage',
    value: '89',
    unit: '%',
    status: 'critical',
    data: Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
      value: 80 + Math.random() * 20
    }))
  }
];