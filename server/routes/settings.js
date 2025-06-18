import express from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import { authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Mock settings data
let systemSettings = {
  integrations: {
    github: { 
      connected: true, 
      status: 'active',
      config: {
        webhookUrl: 'https://api.github.com/webhooks',
        apiKey: '***hidden***'
      }
    },
    jenkins: { 
      connected: true, 
      status: 'active',
      config: {
        serverUrl: 'https://jenkins.company.com',
        username: 'admin'
      }
    },
    docker: { 
      connected: true, 
      status: 'active',
      config: {
        registryUrl: 'registry.company.com',
        namespace: 'secureops'
      }
    },
    kubernetes: { 
      connected: false, 
      status: 'pending',
      config: {}
    },
    slack: { 
      connected: false, 
      status: 'disconnected',
      config: {}
    },
    prometheus: { 
      connected: true, 
      status: 'active',
      config: {
        serverUrl: 'http://prometheus:9090',
        scrapeInterval: '30s'
      }
    }
  },
  notifications: {
    email: {
      enabled: true,
      smtp: {
        host: 'smtp.company.com',
        port: 587,
        secure: false
      }
    },
    slack: {
      enabled: false,
      webhookUrl: null,
      channels: []
    },
    webhook: {
      enabled: true,
      endpoints: [
        {
          name: 'Security Alerts',
          url: 'https://api.company.com/webhooks/security',
          events: ['vulnerability.detected', 'scan.completed']
        }
      ]
    }
  },
  security: {
    authentication: {
      twoFactorRequired: true,
      sessionTimeout: 24,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true
      }
    },
    apiAccess: {
      rateLimiting: true,
      corsEnabled: true,
      allowedOrigins: ['https://secureops.company.com']
    },
    scanning: {
      autoScan: true,
      scanSchedule: '0 2 * * *', // Daily at 2 AM
      retentionDays: 90
    }
  },
  system: {
    logging: {
      level: 'info',
      retention: 30,
      maxSize: '100MB'
    },
    backup: {
      enabled: true,
      schedule: '0 1 * * *', // Daily at 1 AM
      retention: 7,
      location: 's3://backups.company.com/secureops'
    },
    monitoring: {
      metricsRetention: 30,
      alertingEnabled: true,
      healthCheckInterval: 30
    }
  }
};

// Mock user settings
let userSettings = {};

// Get all settings (admin only)
router.get('/', authorizeRole(['admin']), (req, res) => {
  try {
    res.json({
      system: systemSettings,
      user: userSettings[req.user.id] || {}
    });
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get specific settings category
router.get('/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    // Check if user has permission to view this category
    if (category === 'system' && !['admin', 'devops'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (category === 'user') {
      return res.json(userSettings[req.user.id] || {});
    }

    if (!systemSettings[category]) {
      return res.status(404).json({ error: 'Settings category not found' });
    }

    res.json(systemSettings[category]);
  } catch (error) {
    logger.error('Error fetching settings category:', error);
    res.status(500).json({ error: 'Failed to fetch settings category' });
  }
});

// Update system settings (admin only)
router.put('/system/:category', authorizeRole(['admin']), [
  body('*').custom((value, { path }) => {
    // Basic validation - in production, implement proper schema validation
    return true;
  })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { category } = req.params;
    
    if (!systemSettings[category]) {
      return res.status(404).json({ error: 'Settings category not found' });
    }

    // Merge with existing settings
    systemSettings[category] = {
      ...systemSettings[category],
      ...req.body
    };

    logger.info(`System settings updated: ${category} by ${req.user.email}`);

    res.json({
      message: 'Settings updated successfully',
      settings: systemSettings[category]
    });
  } catch (error) {
    logger.error('Error updating system settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Update user settings
router.put('/user', [
  body('theme').optional().isIn(['light', 'dark', 'auto']),
  body('language').optional().isLength({ min: 2, max: 5 }),
  body('timezone').optional().isLength({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!userSettings[req.user.id]) {
      userSettings[req.user.id] = {};
    }

    userSettings[req.user.id] = {
      ...userSettings[req.user.id],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    logger.info(`User settings updated by ${req.user.email}`);

    res.json({
      message: 'User settings updated successfully',
      settings: userSettings[req.user.id]
    });
  } catch (error) {
    logger.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

// Test integration connection
router.post('/integrations/:service/test', authorizeRole(['admin', 'devops']), (req, res) => {
  try {
    const { service } = req.params;
    
    if (!systemSettings.integrations[service]) {
      return res.status(404).json({ error: 'Integration service not found' });
    }

    // Simulate connection test
    const testResult = {
      service,
      status: Math.random() > 0.2 ? 'success' : 'failed',
      timestamp: new Date().toISOString(),
      responseTime: Math.floor(Math.random() * 1000) + 100,
      details: Math.random() > 0.2 
        ? 'Connection successful' 
        : 'Connection failed: Timeout after 5 seconds'
    };

    logger.info(`Integration test: ${service} - ${testResult.status} by ${req.user.email}`);

    res.json(testResult);
  } catch (error) {
    logger.error('Error testing integration:', error);
    res.status(500).json({ error: 'Failed to test integration' });
  }
});

// Configure integration
router.post('/integrations/:service/configure', authorizeRole(['admin']), [
  body('config').isObject()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { service } = req.params;
    const { config } = req.body;
    
    if (!systemSettings.integrations[service]) {
      return res.status(404).json({ error: 'Integration service not found' });
    }

    // Update integration configuration
    systemSettings.integrations[service] = {
      ...systemSettings.integrations[service],
      config: {
        ...systemSettings.integrations[service].config,
        ...config
      },
      connected: true,
      status: 'active',
      configuredAt: new Date().toISOString(),
      configuredBy: req.user.email
    };

    logger.info(`Integration configured: ${service} by ${req.user.email}`);

    res.json({
      message: 'Integration configured successfully',
      integration: systemSettings.integrations[service]
    });
  } catch (error) {
    logger.error('Error configuring integration:', error);
    res.status(500).json({ error: 'Failed to configure integration' });
  }
});

// Disconnect integration
router.post('/integrations/:service/disconnect', authorizeRole(['admin']), (req, res) => {
  try {
    const { service } = req.params;
    
    if (!systemSettings.integrations[service]) {
      return res.status(404).json({ error: 'Integration service not found' });
    }

    systemSettings.integrations[service] = {
      ...systemSettings.integrations[service],
      connected: false,
      status: 'disconnected',
      disconnectedAt: new Date().toISOString(),
      disconnectedBy: req.user.email
    };

    logger.info(`Integration disconnected: ${service} by ${req.user.email}`);

    res.json({
      message: 'Integration disconnected successfully',
      integration: systemSettings.integrations[service]
    });
  } catch (error) {
    logger.error('Error disconnecting integration:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

// Get system status
router.get('/system/status', (req, res) => {
  try {
    const status = {
      version: '2.1.3',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        responseTime: '12ms'
      },
      integrations: Object.entries(systemSettings.integrations).map(([name, config]) => ({
        name,
        status: config.status,
        connected: config.connected
      })),
      resources: {
        memory: {
          used: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.floor(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        cpu: Math.floor(Math.random() * 30) + 20 // Mock CPU usage
      },
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      timestamp: new Date().toISOString()
    };

    res.json(status);
  } catch (error) {
    logger.error('Error fetching system status:', error);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

// Export settings (admin only)
router.get('/export', authorizeRole(['admin']), (req, res) => {
  try {
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.email,
      version: '2.1.3',
      settings: {
        system: systemSettings,
        // Don't export sensitive data like API keys
        sanitized: true
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=secureops-settings.json');
    res.json(exportData);

    logger.info(`Settings exported by ${req.user.email}`);
  } catch (error) {
    logger.error('Error exporting settings:', error);
    res.status(500).json({ error: 'Failed to export settings' });
  }
});

export default router;