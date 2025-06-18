import express from 'express';
import { logger } from '../utils/logger.js';
import { io } from '../index.js';

const router = express.Router();

// Mock vulnerability data
let vulnerabilities = [
  {
    id: '1',
    severity: 'critical',
    title: 'SQL Injection vulnerability in user authentication',
    description: 'Improper input validation allows SQL injection attacks through the login form. This vulnerability could allow attackers to bypass authentication and access sensitive data.',
    package: 'express-validator',
    version: '6.10.0',
    fixedVersion: '6.14.2',
    scanner: 'owasp',
    cve: 'CVE-2023-1234',
    cvssScore: 9.8,
    discoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    assignee: null,
    fixInstructions: 'Update express-validator to version 6.14.2 or later. Implement proper input sanitization and parameterized queries.'
  },
  {
    id: '2',
    severity: 'high',
    title: 'Outdated cryptographic library with known vulnerabilities',
    description: 'The crypto-js library version in use contains deprecated cryptographic functions that are vulnerable to timing attacks.',
    package: 'crypto-js',
    version: '3.1.2',
    fixedVersion: '4.1.1',
    scanner: 'trivy',
    cve: 'CVE-2023-5678',
    cvssScore: 7.5,
    discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    assignee: 'karthick@example.com',
    fixInstructions: 'Upgrade crypto-js to version 4.1.1. Review all cryptographic implementations for proper usage.'
  },
  {
    id: '3',
    severity: 'medium',
    title: 'Hardcoded credentials detected in configuration files',
    description: 'API keys and database credentials found in plaintext within configuration files.',
    package: 'config.py',
    version: 'N/A',
    scanner: 'bandit',
    cve: null,
    cvssScore: 5.3,
    discoveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    assignee: null,
    fixInstructions: 'Move all sensitive credentials to environment variables or secure vault systems.'
  }
];

// Mock scan results
let scanResults = [
  {
    id: '1',
    type: 'container',
    target: 'nginx:1.20',
    scanner: 'trivy',
    status: 'completed',
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    vulnerabilities: {
      critical: 2,
      high: 5,
      medium: 12,
      low: 8
    }
  },
  {
    id: '2',
    type: 'code',
    target: 'src/',
    scanner: 'bandit',
    status: 'running',
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    completedAt: null,
    vulnerabilities: null
  }
];

// Get all vulnerabilities
router.get('/vulnerabilities', (req, res) => {
  try {
    const { severity, status, scanner } = req.query;
    
    let filtered = vulnerabilities;
    
    if (severity && severity !== 'all') {
      filtered = filtered.filter(v => v.severity === severity);
    }
    
    if (status && status !== 'all') {
      filtered = filtered.filter(v => v.status === status);
    }
    
    if (scanner && scanner !== 'all') {
      filtered = filtered.filter(v => v.scanner === scanner);
    }

    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      open: vulnerabilities.filter(v => v.status === 'open').length,
      inProgress: vulnerabilities.filter(v => v.status === 'in_progress').length,
      resolved: vulnerabilities.filter(v => v.status === 'resolved').length
    };

    res.json({
      vulnerabilities: filtered,
      summary,
      filters: { severity, status, scanner }
    });
  } catch (error) {
    logger.error('Error fetching vulnerabilities:', error);
    res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
  }
});

// Get vulnerability by ID
router.get('/vulnerabilities/:id', (req, res) => {
  try {
    const vulnerability = vulnerabilities.find(v => v.id === req.params.id);
    if (!vulnerability) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    res.json(vulnerability);
  } catch (error) {
    logger.error('Error fetching vulnerability:', error);
    res.status(500).json({ error: 'Failed to fetch vulnerability' });
  }
});

// Update vulnerability status
router.patch('/vulnerabilities/:id', (req, res) => {
  try {
    const { status, assignee, notes } = req.body;
    const vulnerability = vulnerabilities.find(v => v.id === req.params.id);
    
    if (!vulnerability) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }

    if (status) vulnerability.status = status;
    if (assignee !== undefined) vulnerability.assignee = assignee;
    if (notes) vulnerability.notes = notes;
    
    vulnerability.updatedAt = new Date().toISOString();
    vulnerability.updatedBy = req.user.email;

    // Emit real-time update
    io.emit('vulnerability:updated', vulnerability);

    logger.info(`Vulnerability updated: ${vulnerability.id} by ${req.user.email}`);

    res.json(vulnerability);
  } catch (error) {
    logger.error('Error updating vulnerability:', error);
    res.status(500).json({ error: 'Failed to update vulnerability' });
  }
});

// Start security scan
router.post('/scan', (req, res) => {
  try {
    const { type, target, scanner } = req.body;

    if (!type || !target || !scanner) {
      return res.status(400).json({
        error: 'Missing required fields: type, target, scanner'
      });
    }

    const newScan = {
      id: Date.now().toString(),
      type,
      target,
      scanner,
      status: 'running',
      startedAt: new Date().toISOString(),
      completedAt: null,
      vulnerabilities: null,
      initiatedBy: req.user.email
    };

    scanResults.push(newScan);

    // Simulate scan execution
    simulateSecurityScan(newScan);

    // Emit real-time update
    io.emit('scan:started', newScan);

    logger.info(`Security scan started: ${scanner} on ${target} by ${req.user.email}`);

    res.status(201).json(newScan);
  } catch (error) {
    logger.error('Error starting security scan:', error);
    res.status(500).json({ error: 'Failed to start security scan' });
  }
});

// Get scan results
router.get('/scans', (req, res) => {
  try {
    res.json({
      scans: scanResults,
      active: scanResults.filter(s => s.status === 'running').length,
      completed: scanResults.filter(s => s.status === 'completed').length,
      failed: scanResults.filter(s => s.status === 'failed').length
    });
  } catch (error) {
    logger.error('Error fetching scan results:', error);
    res.status(500).json({ error: 'Failed to fetch scan results' });
  }
});

// Get security metrics
router.get('/metrics', (req, res) => {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentVulns = vulnerabilities.filter(v => 
      new Date(v.discoveredAt) >= last30Days
    );

    const metrics = {
      totalVulnerabilities: vulnerabilities.length,
      criticalVulnerabilities: vulnerabilities.filter(v => v.severity === 'critical').length,
      resolvedThisMonth: vulnerabilities.filter(v => 
        v.status === 'resolved' && new Date(v.updatedAt || v.discoveredAt) >= last30Days
      ).length,
      averageResolutionTime: '4.2 days', // Mock data
      securityScore: Math.max(0, 100 - (vulnerabilities.filter(v => v.status === 'open').length * 5)),
      scanFrequency: {
        daily: scanResults.filter(s => 
          new Date(s.startedAt) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
        ).length,
        weekly: scanResults.filter(s => 
          new Date(s.startedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        monthly: scanResults.filter(s => 
          new Date(s.startedAt) >= last30Days
        ).length
      },
      trendData: generateSecurityTrendData()
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching security metrics:', error);
    res.status(500).json({ error: 'Failed to fetch security metrics' });
  }
});

// Generate security report
router.get('/report', (req, res) => {
  try {
    const { format = 'json', timeRange = '30d' } = req.query;
    
    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalVulnerabilities: vulnerabilities.length,
        byStatus: {
          open: vulnerabilities.filter(v => v.status === 'open').length,
          inProgress: vulnerabilities.filter(v => v.status === 'in_progress').length,
          resolved: vulnerabilities.filter(v => v.status === 'resolved').length
        },
        bySeverity: {
          critical: vulnerabilities.filter(v => v.severity === 'critical').length,
          high: vulnerabilities.filter(v => v.severity === 'high').length,
          medium: vulnerabilities.filter(v => v.severity === 'medium').length,
          low: vulnerabilities.filter(v => v.severity === 'low').length
        }
      },
      vulnerabilities: vulnerabilities,
      recommendations: [
        'Prioritize fixing critical vulnerabilities within 24 hours',
        'Implement automated security scanning in CI/CD pipeline',
        'Regular security training for development team',
        'Establish vulnerability disclosure policy'
      ]
    };

    res.json(report);
  } catch (error) {
    logger.error('Error generating security report:', error);
    res.status(500).json({ error: 'Failed to generate security report' });
  }
});

// Simulate security scan execution
function simulateSecurityScan(scan) {
  const duration = Math.random() * 60000 + 30000; // 30-90 seconds

  setTimeout(() => {
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      scan.status = 'completed';
      scan.completedAt = new Date().toISOString();
      scan.vulnerabilities = {
        critical: Math.floor(Math.random() * 3),
        high: Math.floor(Math.random() * 8),
        medium: Math.floor(Math.random() * 15),
        low: Math.floor(Math.random() * 20)
      };

      // Add some new vulnerabilities based on scan results
      if (scan.vulnerabilities.critical > 0) {
        const newVuln = {
          id: Date.now().toString(),
          severity: 'critical',
          title: `Critical vulnerability found in ${scan.target}`,
          description: `Security scan detected a critical vulnerability requiring immediate attention.`,
          package: scan.target,
          version: '1.0.0',
          scanner: scan.scanner,
          discoveredAt: new Date().toISOString(),
          status: 'open',
          assignee: null,
          scanId: scan.id
        };
        vulnerabilities.push(newVuln);
      }

      io.emit('scan:completed', scan);
    } else {
      scan.status = 'failed';
      scan.completedAt = new Date().toISOString();
      scan.error = 'Scan failed due to network timeout';
      
      io.emit('scan:failed', scan);
    }

    logger.info(`Security scan ${scan.status}: ${scan.scanner} on ${scan.target}`);
  }, duration);
}

// Generate mock trend data
function generateSecurityTrendData() {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      vulnerabilities: Math.floor(Math.random() * 10) + 5,
      resolved: Math.floor(Math.random() * 8) + 2,
      scans: Math.floor(Math.random() * 5) + 1
    });
  }
  
  return data;
}

export default router;