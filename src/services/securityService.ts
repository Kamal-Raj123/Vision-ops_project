import { MockBackendService } from './mockBackend';

export interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  package: string;
  version: string;
  fixedVersion?: string;
  scanner: string;
  cve?: string;
  cwe?: string;
  cvssScore?: number;
  discoveredAt: string;
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  assignee?: string;
  notes?: string;
  path?: string;
  layer?: string;
  exploitAvailable?: boolean;
  references?: Array<{ title: string; url: string }>;
  fixInstructions?: string;
  workarounds?: Array<{ title: string; description: string }>;
  activity?: Array<{
    type: string;
    description: string;
    user: string;
    timestamp: string;
  }>;
}

export interface SecurityScan {
  id: string;
  name: string;
  scanner: string;
  target: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  progress: number;
  startedAt: string;
  completedAt?: string;
  duration?: string;
  eta?: string;
  vulnerabilities?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  options?: any;
}

export interface SecurityScanner {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  version?: string;
  lastScan?: string;
  lastUpdate?: string;
  database?: string;
  targets?: number;
}

export interface SecurityMetrics {
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
  securityScore: number;
  criticalTrend: number;
  highTrend: number;
  scoreImprovement: number;
  avgResolutionTime: string;
}

class SecurityService {
  private vulnerabilities: Map<string, Vulnerability> = new Map();
  private scans: Map<string, SecurityScan> = new Map();
  private scanners: Map<string, SecurityScanner> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize scanners
    const defaultScanners: SecurityScanner[] = [
      {
        id: 'trivy-1',
        name: 'Trivy Container Scanner',
        type: 'trivy',
        description: 'Container and filesystem vulnerability scanner',
        status: 'active',
        version: 'v0.45.1',
        lastScan: '5 minutes ago',
        lastUpdate: 'Today',
        database: 'Up to date',
        targets: 42
      },
      {
        id: 'owasp-zap-1',
        name: 'OWASP ZAP',
        type: 'owasp',
        description: 'Web application security testing',
        status: 'active',
        version: '2.14.0',
        lastScan: '2 hours ago',
        lastUpdate: 'Yesterday',
        database: 'Current',
        targets: 8
      },
      {
        id: 'bandit-1',
        name: 'Bandit Python Scanner',
        type: 'bandit',
        description: 'Python code security analysis',
        status: 'active',
        version: '1.7.5',
        lastScan: '30 minutes ago',
        lastUpdate: 'Today',
        database: 'N/A',
        targets: 15
      },
      {
        id: 'snyk-1',
        name: 'Snyk Vulnerability Scanner',
        type: 'snyk',
        description: 'Open source vulnerability scanning',
        status: 'active',
        version: '1.1200.0',
        lastScan: '1 hour ago',
        lastUpdate: 'Today',
        database: 'Latest',
        targets: 28
      },
      {
        id: 'sonarqube-1',
        name: 'SonarQube Code Quality',
        type: 'sonarqube',
        description: 'Static code analysis and security',
        status: 'active',
        version: '10.2.0',
        lastScan: '4 hours ago',
        lastUpdate: 'Today',
        database: 'Current',
        targets: 12
      }
    ];

    defaultScanners.forEach(scanner => {
      this.scanners.set(scanner.id, scanner);
    });

    // Initialize vulnerabilities
    const defaultVulnerabilities: Vulnerability[] = [
      {
        id: 'vuln-1',
        severity: 'critical',
        title: 'SQL Injection vulnerability in user authentication',
        description: 'Improper input validation allows SQL injection attacks through the login form. This vulnerability could allow attackers to bypass authentication and access sensitive data.',
        package: 'express-validator',
        version: '6.10.0',
        fixedVersion: '6.14.2',
        scanner: 'owasp',
        cve: 'CVE-2023-1234',
        cwe: 'CWE-89',
        cvssScore: 9.8,
        discoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        path: '/src/auth/login.js',
        exploitAvailable: true,
        references: [
          { title: 'CVE-2023-1234 Details', url: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-1234' },
          { title: 'Express Validator Security Advisory', url: 'https://github.com/express-validator/express-validator/security' }
        ],
        fixInstructions: `Update express-validator to version 6.14.2 or later:

npm update express-validator

Then implement proper input sanitization:

const { body, validationResult } = require('express-validator');

app.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Safe to proceed with login
});`,
        activity: [
          {
            type: 'created',
            description: 'Vulnerability discovered by OWASP ZAP scan',
            user: 'Security Scanner',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'vuln-2',
        title: 'Outdated cryptographic library with known vulnerabilities',
        description: 'The crypto-js library version in use contains deprecated cryptographic functions that are vulnerable to timing attacks.',
        package: 'crypto-js',
        version: '3.1.2',
        fixedVersion: '4.1.1',
        scanner: 'trivy',
        cve: 'CVE-2023-5678',
        cvssScore: 7.5,
        severity: 'high',
        discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        assignee: 'karthick@example.com',
        notes: 'Working on upgrade plan',
        path: '/package.json',
        references: [
          { title: 'Crypto-js Security Advisory', url: 'https://github.com/brix/crypto-js/security' }
        ],
        fixInstructions: 'Upgrade crypto-js to version 4.1.1. Review all cryptographic implementations for proper usage.',
        activity: [
          {
            type: 'created',
            description: 'Vulnerability discovered by Trivy scan',
            user: 'Security Scanner',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'assigned',
            description: 'Assigned to karthick@example.com',
            user: 'admin@company.com',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'status_change',
            description: 'Status changed to In Progress',
            user: 'karthick@example.com',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'vuln-3',
        title: 'Hardcoded credentials detected in configuration files',
        description: 'API keys and database credentials found in plaintext within configuration files.',
        package: 'config.py',
        version: 'N/A',
        scanner: 'bandit',
        severity: 'medium',
        cvssScore: 5.3,
        discoveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        path: '/config/database.py',
        fixInstructions: 'Move all sensitive credentials to environment variables or secure vault systems.',
        workarounds: [
          {
            title: 'Temporary Environment Variables',
            description: 'Move credentials to environment variables as a quick fix while implementing proper secret management.'
          }
        ],
        activity: [
          {
            type: 'created',
            description: 'Vulnerability discovered by Bandit scan',
            user: 'Security Scanner',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'vuln-4',
        title: 'Missing security headers in web application',
        description: 'HTTP security headers not configured properly, leaving the application vulnerable to various attacks.',
        package: 'nginx.conf',
        version: 'N/A',
        scanner: 'owasp',
        severity: 'low',
        cvssScore: 3.1,
        discoveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        assignee: 'devops@example.com',
        path: '/etc/nginx/nginx.conf',
        fixInstructions: 'Configure proper security headers in your web server configuration.',
        activity: [
          {
            type: 'created',
            description: 'Vulnerability discovered by OWASP ZAP scan',
            user: 'Security Scanner',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'assigned',
            description: 'Assigned to devops@example.com',
            user: 'admin@company.com',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'status_change',
            description: 'Status changed to Resolved',
            user: 'devops@example.com',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    ];

    defaultVulnerabilities.forEach(vuln => {
      this.vulnerabilities.set(vuln.id, vuln);
    });

    // Initialize some sample scans
    const defaultScans: SecurityScan[] = [
      {
        id: 'scan-1',
        name: 'Frontend Container Scan',
        scanner: 'trivy',
        target: 'nginx:latest',
        type: 'container',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        duration: '5m 12s',
        vulnerabilities: {
          critical: 1,
          high: 3,
          medium: 8,
          low: 12
        }
      },
      {
        id: 'scan-2',
        name: 'API Security Scan',
        scanner: 'owasp',
        target: 'https://api.company.com',
        type: 'web',
        status: 'running',
        progress: 67,
        startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        eta: '8 minutes'
      }
    ];

    defaultScans.forEach(scan => {
      this.scans.set(scan.id, scan);
    });
  }

  async getVulnerabilities(filters?: any): Promise<{ vulnerabilities: Vulnerability[]; summary: any }> {
    await this.delay(300);
    
    let filtered = Array.from(this.vulnerabilities.values());
    
    if (filters?.severity && filters.severity !== 'all') {
      filtered = filtered.filter(v => v.severity === filters.severity);
    }
    
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(v => v.status === filters.status);
    }
    
    if (filters?.scanner && filters.scanner !== 'all') {
      filtered = filtered.filter(v => v.scanner === filters.scanner);
    }

    const summary = {
      total: Array.from(this.vulnerabilities.values()).length,
      critical: Array.from(this.vulnerabilities.values()).filter(v => v.severity === 'critical').length,
      high: Array.from(this.vulnerabilities.values()).filter(v => v.severity === 'high').length,
      medium: Array.from(this.vulnerabilities.values()).filter(v => v.severity === 'medium').length,
      low: Array.from(this.vulnerabilities.values()).filter(v => v.severity === 'low').length,
      open: Array.from(this.vulnerabilities.values()).filter(v => v.status === 'open').length,
      inProgress: Array.from(this.vulnerabilities.values()).filter(v => v.status === 'in_progress').length,
      resolved: Array.from(this.vulnerabilities.values()).filter(v => v.status === 'resolved').length
    };

    return { vulnerabilities: filtered, summary };
  }

  async getVulnerabilityDetails(id: string): Promise<Vulnerability> {
    await this.delay(200);
    const vulnerability = this.vulnerabilities.get(id);
    if (!vulnerability) {
      throw new Error('Vulnerability not found');
    }
    return vulnerability;
  }

  async updateVulnerability(id: string, updates: Partial<Vulnerability>): Promise<Vulnerability> {
    await this.delay(300);
    const vulnerability = this.vulnerabilities.get(id);
    if (!vulnerability) {
      throw new Error('Vulnerability not found');
    }

    const updatedVulnerability = { ...vulnerability, ...updates };
    
    // Add activity entry
    if (updates.status && updates.status !== vulnerability.status) {
      const activity = updatedVulnerability.activity || [];
      activity.push({
        type: 'status_change',
        description: `Status changed from ${vulnerability.status} to ${updates.status}`,
        user: 'current-user@company.com',
        timestamp: new Date().toISOString()
      });
      updatedVulnerability.activity = activity;
    }

    if (updates.assignee && updates.assignee !== vulnerability.assignee) {
      const activity = updatedVulnerability.activity || [];
      activity.push({
        type: 'assigned',
        description: `Assigned to ${updates.assignee}`,
        user: 'current-user@company.com',
        timestamp: new Date().toISOString()
      });
      updatedVulnerability.activity = activity;
    }

    this.vulnerabilities.set(id, updatedVulnerability);
    return updatedVulnerability;
  }

  async getScans(): Promise<{ scans: SecurityScan[] }> {
    await this.delay(200);
    return { scans: Array.from(this.scans.values()) };
  }

  async getScanners(): Promise<{ scanners: SecurityScanner[] }> {
    await this.delay(200);
    return { scanners: Array.from(this.scanners.values()) };
  }

  async startScan(config: any): Promise<SecurityScan> {
    await this.delay(500);
    
    const scan: SecurityScan = {
      id: `scan-${Date.now()}`,
      name: config.name,
      scanner: config.scanner,
      target: config.target,
      type: config.type,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
      eta: '15 minutes',
      options: config.options
    };

    this.scans.set(scan.id, scan);

    // Simulate scan progress
    this.simulateScanProgress(scan.id);

    return scan;
  }

  async stopScan(id: string): Promise<void> {
    await this.delay(200);
    const scan = this.scans.get(id);
    if (scan) {
      scan.status = 'stopped';
      scan.completedAt = new Date().toISOString();
    }
  }

  async getMetrics(): Promise<SecurityMetrics> {
    await this.delay(300);
    
    const vulnerabilities = Array.from(this.vulnerabilities.values());
    
    return {
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      resolved: vulnerabilities.filter(v => v.status === 'resolved').length,
      securityScore: 87,
      criticalTrend: -2,
      highTrend: 1,
      scoreImprovement: 5,
      avgResolutionTime: '4.2 days'
    };
  }

  private simulateScanProgress(scanId: string) {
    const scan = this.scans.get(scanId);
    if (!scan) return;

    const progressInterval = setInterval(() => {
      if (scan.status !== 'running') {
        clearInterval(progressInterval);
        return;
      }

      scan.progress += Math.random() * 15 + 5;
      
      if (scan.progress >= 100) {
        scan.progress = 100;
        scan.status = Math.random() > 0.1 ? 'completed' : 'failed';
        scan.completedAt = new Date().toISOString();
        
        const startTime = new Date(scan.startedAt).getTime();
        const endTime = new Date().getTime();
        const durationMs = endTime - startTime;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        scan.duration = `${minutes}m ${seconds}s`;

        if (scan.status === 'completed') {
          scan.vulnerabilities = {
            critical: Math.floor(Math.random() * 3),
            high: Math.floor(Math.random() * 8),
            medium: Math.floor(Math.random() * 15),
            low: Math.floor(Math.random() * 25)
          };

          // Add some new vulnerabilities based on scan results
          if (scan.vulnerabilities.critical > 0) {
            this.addMockVulnerability(scan, 'critical');
          }
          if (scan.vulnerabilities.high > 0) {
            this.addMockVulnerability(scan, 'high');
          }
        }

        clearInterval(progressInterval);
      }
    }, 2000);
  }

  private addMockVulnerability(scan: SecurityScan, severity: 'critical' | 'high') {
    const vulnerability: Vulnerability = {
      id: `vuln-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      title: `${severity === 'critical' ? 'Critical' : 'High'} vulnerability found in ${scan.target}`,
      description: `Security scan detected a ${severity} vulnerability requiring immediate attention.`,
      package: scan.target,
      version: '1.0.0',
      scanner: scan.scanner,
      discoveredAt: new Date().toISOString(),
      status: 'open',
      fixInstructions: 'Review and update the affected component.',
      activity: [
        {
          type: 'created',
          description: `Vulnerability discovered by ${scan.scanner} scan`,
          user: 'Security Scanner',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.vulnerabilities.set(vulnerability.id, vulnerability);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const securityService = new SecurityService();