import express from 'express';
import { logger } from '../utils/logger.js';
import { io } from '../index.js';

const router = express.Router();

// Mock monitoring data
let metrics = {
  system: {
    cpu: { value: 67, status: 'warning', history: [] },
    memory: { value: 45, status: 'healthy', history: [] },
    disk: { value: 89, status: 'critical', history: [] },
    network: { value: 12.3, status: 'healthy', history: [] }
  },
  application: {
    responseTime: { value: 245, status: 'healthy', history: [] },
    throughput: { value: 1234, status: 'healthy', history: [] },
    errorRate: { value: 0.12, status: 'healthy', history: [] },
    activeUsers: { value: 156, status: 'healthy', history: [] }
  },
  kubernetes: {
    nodes: [
      { name: 'master-1', status: 'healthy', cpu: 23, memory: 67, role: 'control-plane' },
      { name: 'worker-1', status: 'healthy', cpu: 45, memory: 72, role: 'worker' },
      { name: 'worker-2', status: 'warning', cpu: 89, memory: 94, role: 'worker' },
      { name: 'worker-3', status: 'healthy', cpu: 34, memory: 58, role: 'worker' }
    ],
    pods: {
      running: 24,
      pending: 2,
      failed: 1,
      succeeded: 156
    },
    services: {
      active: 12,
      inactive: 0
    }
  }
};

// Initialize metric history
function initializeMetricHistory() {
  const now = Date.now();
  const points = 50;
  
  Object.keys(metrics.system).forEach(key => {
    metrics.system[key].history = Array.from({ length: points }, (_, i) => ({
      timestamp: new Date(now - (points - i) * 60000).toISOString(),
      value: metrics.system[key].value + (Math.random() - 0.5) * 20
    }));
  });

  Object.keys(metrics.application).forEach(key => {
    metrics.application[key].history = Array.from({ length: points }, (_, i) => ({
      timestamp: new Date(now - (points - i) * 60000).toISOString(),
      value: metrics.application[key].value + (Math.random() - 0.5) * (metrics.application[key].value * 0.3)
    }));
  });
}

initializeMetricHistory();

// Mock alerts
let alerts = [
  {
    id: '1',
    severity: 'critical',
    title: 'High Memory Usage on worker-2',
    description: 'Memory usage has exceeded 90% threshold for the past 10 minutes',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'active',
    source: 'kubernetes',
    node: 'worker-2'
  },
  {
    id: '2',
    severity: 'warning',
    title: 'API Response Time Degradation',
    description: 'Average response time increased by 25% in the last hour',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'active',
    source: 'application'
  },
  {
    id: '3',
    severity: 'info',
    title: 'Deployment Successful',
    description: 'Application v2.1.3 has been successfully deployed to production',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'resolved',
    source: 'deployment'
  }
];

// Get all metrics
router.get('/metrics', (req, res) => {
  try {
    const { category, timeRange = '1h' } = req.query;
    
    let responseData = metrics;
    
    if (category) {
      responseData = { [category]: metrics[category] };
    }

    // Add summary statistics
    const summary = {
      healthyServices: Object.values(metrics.system).filter(m => m.status === 'healthy').length,
      warningServices: Object.values(metrics.system).filter(m => m.status === 'warning').length,
      criticalServices: Object.values(metrics.system).filter(m => m.status === 'critical').length,
      totalAlerts: alerts.filter(a => a.status === 'active').length,
      uptime: '99.9%',
      lastUpdated: new Date().toISOString()
    };

    res.json({
      metrics: responseData,
      summary,
      timeRange
    });
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get specific metric history
router.get('/metrics/:category/:metric', (req, res) => {
  try {
    const { category, metric } = req.params;
    const { timeRange = '1h' } = req.query;

    if (!metrics[category] || !metrics[category][metric]) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    const metricData = metrics[category][metric];
    
    res.json({
      metric: {
        name: metric,
        category,
        current: metricData.value,
        status: metricData.status,
        history: metricData.history,
        unit: getMetricUnit(category, metric)
      },
      timeRange
    });
  } catch (error) {
    logger.error('Error fetching metric history:', error);
    res.status(500).json({ error: 'Failed to fetch metric history' });
  }
});

// Get alerts
router.get('/alerts', (req, res) => {
  try {
    const { status, severity } = req.query;
    
    let filteredAlerts = alerts;
    
    if (status && status !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.status === status);
    }
    
    if (severity && severity !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.severity === severity);
    }

    const summary = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length
    };

    res.json({
      alerts: filteredAlerts,
      summary
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Acknowledge alert
router.patch('/alerts/:id/acknowledge', (req, res) => {
  try {
    const alert = alerts.find(a => a.id === req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = req.user.email;
    alert.acknowledgedAt = new Date().toISOString();

    // Emit real-time update
    io.emit('alert:acknowledged', alert);

    logger.info(`Alert acknowledged: ${alert.id} by ${req.user.email}`);

    res.json(alert);
  } catch (error) {
    logger.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Resolve alert
router.patch('/alerts/:id/resolve', (req, res) => {
  try {
    const { resolution } = req.body;
    const alert = alerts.find(a => a.id === req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alert.status = 'resolved';
    alert.resolvedBy = req.user.email;
    alert.resolvedAt = new Date().toISOString();
    alert.resolution = resolution;

    // Emit real-time update
    io.emit('alert:resolved', alert);

    logger.info(`Alert resolved: ${alert.id} by ${req.user.email}`);

    res.json(alert);
  } catch (error) {
    logger.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Get system health
router.get('/health', (req, res) => {
  try {
    const health = {
      overall: 'healthy',
      components: {
        database: { status: 'healthy', responseTime: '12ms' },
        redis: { status: 'healthy', responseTime: '3ms' },
        kubernetes: { status: 'warning', responseTime: '45ms' },
        monitoring: { status: 'healthy', responseTime: '8ms' }
      },
      uptime: process.uptime(),
      version: '2.1.3',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    // Determine overall health
    const componentStatuses = Object.values(health.components).map(c => c.status);
    if (componentStatuses.includes('critical')) {
      health.overall = 'critical';
    } else if (componentStatuses.includes('warning')) {
      health.overall = 'warning';
    }

    res.json(health);
  } catch (error) {
    logger.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

// Get performance metrics
router.get('/performance', (req, res) => {
  try {
    const performance = {
      api: {
        averageResponseTime: 245,
        requestsPerSecond: 1234,
        errorRate: 0.12,
        p95ResponseTime: 450,
        p99ResponseTime: 890
      },
      database: {
        averageQueryTime: 23,
        connectionsActive: 45,
        connectionsMax: 100,
        slowQueries: 3
      },
      cache: {
        hitRate: 94.5,
        missRate: 5.5,
        evictions: 12,
        memoryUsage: 67
      },
      trends: generatePerformanceTrends()
    };

    res.json(performance);
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Helper function to get metric units
function getMetricUnit(category, metric) {
  const units = {
    system: {
      cpu: '%',
      memory: '%',
      disk: '%',
      network: 'MB/s'
    },
    application: {
      responseTime: 'ms',
      throughput: 'req/s',
      errorRate: '%',
      activeUsers: 'users'
    }
  };

  return units[category]?.[metric] || '';
}

// Generate performance trend data
function generatePerformanceTrends() {
  const now = Date.now();
  const points = 24; // 24 hours
  
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(now - (points - i) * 60 * 60 * 1000).toISOString(),
    responseTime: 200 + Math.random() * 100,
    throughput: 1000 + Math.random() * 500,
    errorRate: Math.random() * 0.5,
    cpuUsage: 50 + Math.random() * 30,
    memoryUsage: 40 + Math.random() * 20
  }));
}

// Real-time metric updates
setInterval(() => {
  // Update system metrics
  Object.keys(metrics.system).forEach(key => {
    const metric = metrics.system[key];
    const change = (Math.random() - 0.5) * 10;
    metric.value = Math.max(0, Math.min(100, metric.value + change));
    
    // Update status based on value
    if (key === 'cpu' || key === 'memory' || key === 'disk') {
      if (metric.value > 90) metric.status = 'critical';
      else if (metric.value > 75) metric.status = 'warning';
      else metric.status = 'healthy';
    }

    // Add to history
    metric.history.push({
      timestamp: new Date().toISOString(),
      value: metric.value
    });

    // Keep only last 50 points
    if (metric.history.length > 50) {
      metric.history.shift();
    }
  });

  // Update application metrics
  Object.keys(metrics.application).forEach(key => {
    const metric = metrics.application[key];
    const changePercent = (Math.random() - 0.5) * 0.1; // ±5% change
    metric.value = Math.max(0, metric.value * (1 + changePercent));

    // Add to history
    metric.history.push({
      timestamp: new Date().toISOString(),
      value: metric.value
    });

    // Keep only last 50 points
    if (metric.history.length > 50) {
      metric.history.shift();
    }
  });

  // Emit real-time updates
  io.emit('metrics:updated', {
    system: metrics.system,
    application: metrics.application,
    timestamp: new Date().toISOString()
  });

}, 30000); // Update every 30 seconds

export default router;