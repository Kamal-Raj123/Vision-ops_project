import { MockBackendService } from './mockBackend';

export interface Metric {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentValue: number;
  trend: number;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  history: Array<{ timestamp: string; value: number }>;
  statistics: {
    average: number;
    maximum: number;
    minimum: number;
    p95: number;
    p99: number;
    stdDev: number;
    dataPoints: number;
  };
  lastUpdated: string;
  alertRules?: Array<{
    id: string;
    name: string;
    description: string;
    condition: string;
    threshold: number;
    duration: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'active' | 'inactive';
  }>;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  service: string;
  source: string;
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  duration?: string;
  metrics?: {
    current: string;
    threshold: string;
    condition: string;
    duration: string;
  };
  timeline?: Array<{
    type: string;
    description: string;
    user?: string;
    timestamp: string;
  }>;
  relatedMetrics?: Array<{
    name: string;
    current: number;
    average: number;
    trend: number;
    unit: string;
  }>;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: string;
  responseTime: number;
  lastCheck: string;
  metrics: Record<string, number>;
}

export interface Infrastructure {
  kubernetes: {
    status: string;
    nodes: {
      total: number;
      ready: number;
    };
    pods: {
      total: number;
      running: number;
      pending: number;
      failed: number;
    };
    services: number;
  };
  database: {
    status: string;
    connections: number;
    avgQueryTime: number;
    uptime: string;
  };
  loadBalancer: {
    status: string;
    requestsPerSec: number;
    responseTime: number;
    connections: number;
  };
}

export interface PerformanceMetrics {
  api: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  database: {
    queryTime: number;
    connections: number;
    slowQueries: number;
    throughput: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    latency: number;
    evictions: number;
  };
}

class MonitoringService {
  private metrics: Map<string, any> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private services: Map<string, Service> = new Map();
  private infrastructure: Infrastructure | null = null;
  private performance: PerformanceMetrics | null = null;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize system metrics
    const now = Date.now();
    const points = 50;
    
    const systemMetrics = {
      system: {
        cpu: { 
          value: 67 + Math.random() * 10 - 5, 
          status: 'warning', 
          history: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(now - (points - i) * 60000).toISOString(),
            value: 60 + Math.random() * 20
          }))
        },
        memory: { 
          value: 45 + Math.random() * 10 - 5, 
          status: 'healthy', 
          history: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(now - (points - i) * 60000).toISOString(),
            value: 40 + Math.random() * 15
          }))
        },
        disk: { 
          value: 89 + Math.random() * 5 - 2, 
          status: 'critical', 
          history: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(now - (points - i) * 60000).toISOString(),
            value: 85 + Math.random() * 10
          }))
        },
        network: { 
          value: 12.3 + Math.random() * 2 - 1, 
          status: 'healthy', 
          history: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(now - (points - i) * 60000).toISOString(),
            value: 10 + Math.random() * 5
          }))
        }
      },
      application: {
        responseTime: { 
          value: 245 + Math.random() * 50 - 25, 
          status: 'healthy', 
          history: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(now - (points - i) * 60000).toISOString(),
            value: 230 + Math.random() * 50
          }))
        },
        throughput: { 
          value: 1234 + Math.random() * 200 - 100, 
          status: 'healthy', 
          history: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(now - (points - i) * 60000).toISOString(),
            value: 1200 + Math.random() * 300
          }))
        },
        errorRate: { 
          value: 0.12 + Math.random() * 0.1 - 0.05, 
          status: 'healthy', 
          history: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(now - (points - i) * 60000).toISOString(),
            value: 0.1 + Math.random() * 0.15
          }))
        },
        activeUsers: { 
          value: 156 + Math.random() * 20 - 10, 
          status: 'healthy', 
          history: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(now - (points - i) * 60000).toISOString(),
            value: 150 + Math.random() * 30
          }))
        }
      }
    };

    this.metrics.set('system', systemMetrics);

    // Initialize alerts
    const defaultAlerts: Alert[] = [
      {
        id: 'alert-1',
        title: 'High Memory Usage on worker-2',
        description: 'Memory usage has exceeded 90% threshold for the past 10 minutes',
        severity: 'critical',
        service: 'kubernetes',
        source: 'kubernetes',
        status: 'active',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        metrics: {
          current: '94%',
          threshold: '90%',
          condition: 'above',
          duration: '10 minutes'
        },
        timeline: [
          {
            type: 'triggered',
            description: 'Alert triggered: Memory usage exceeded 90%',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          }
        ],
        relatedMetrics: [
          {
            name: 'Memory Usage',
            current: 94,
            average: 85,
            trend: 12,
            unit: '%'
          },
          {
            name: 'CPU Usage',
            current: 89,
            average: 75,
            trend: 8,
            unit: '%'
          }
        ]
      },
      {
        id: 'alert-2',
        title: 'API Response Time Degradation',
        description: 'Average response time increased by 25% in the last hour',
        severity: 'warning',
        service: 'api-gateway',
        source: 'application',
        status: 'active',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        metrics: {
          current: '245ms',
          threshold: '200ms',
          condition: 'above',
          duration: '15 minutes'
        },
        timeline: [
          {
            type: 'triggered',
            description: 'Alert triggered: Response time exceeded 200ms',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          }
        ],
        relatedMetrics: [
          {
            name: 'Response Time',
            current: 245,
            average: 180,
            trend: 25,
            unit: 'ms'
          },
          {
            name: 'Throughput',
            current: 1234,
            average: 1500,
            trend: -15,
            unit: 'req/s'
          }
        ]
      },
      {
        id: 'alert-3',
        title: 'Deployment Successful',
        description: 'Application v2.1.3 has been successfully deployed to production',
        severity: 'info',
        service: 'ci-cd',
        source: 'deployment',
        status: 'resolved',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            type: 'triggered',
            description: 'Deployment started',
            timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString()
          },
          {
            type: 'resolved',
            description: 'Deployment completed successfully',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'alert-4',
        title: 'Database Connection Pool Saturation',
        description: 'Database connection pool utilization reached 95%',
        severity: 'warning',
        service: 'database',
        source: 'database',
        status: 'acknowledged',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        acknowledgedBy: 'admin@example.com',
        metrics: {
          current: '95%',
          threshold: '90%',
          condition: 'above',
          duration: '5 minutes'
        },
        timeline: [
          {
            type: 'triggered',
            description: 'Alert triggered: Connection pool utilization exceeded 90%',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            type: 'acknowledged',
            description: 'Alert acknowledged by admin@example.com',
            user: 'admin@example.com',
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
          }
        ],
        relatedMetrics: [
          {
            name: 'Connection Pool Usage',
            current: 95,
            average: 80,
            trend: 15,
            unit: '%'
          },
          {
            name: 'Query Time',
            current: 45,
            average: 25,
            trend: 20,
            unit: 'ms'
          }
        ]
      }
    ];

    defaultAlerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });

    // Initialize services
    const defaultServices: Service[] = [
      {
        id: 'api-gateway',
        name: 'API Gateway',
        type: 'api',
        category: 'application',
        status: 'healthy',
        uptime: '99.98%',
        responseTime: 45,
        lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        metrics: {
          requestsPerSecond: 1234,
          errorRate: 0.12,
          p95ResponseTime: 120
        }
      },
      {
        id: 'auth-service',
        name: 'Authentication Service',
        type: 'microservice',
        category: 'application',
        status: 'healthy',
        uptime: '99.95%',
        responseTime: 32,
        lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        metrics: {
          requestsPerSecond: 567,
          errorRate: 0.05,
          p95ResponseTime: 85
        }
      },
      {
        id: 'database',
        name: 'PostgreSQL Database',
        type: 'database',
        category: 'database',
        status: 'warning',
        uptime: '99.99%',
        responseTime: 12,
        lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        metrics: {
          connections: 45,
          queriesPerSecond: 789,
          slowQueries: 3
        }
      },
      {
        id: 'redis-cache',
        name: 'Redis Cache',
        type: 'cache',
        category: 'database',
        status: 'healthy',
        uptime: '100.00%',
        responseTime: 2,
        lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        metrics: {
          hitRate: 94.5,
          missRate: 5.5,
          evictions: 12
        }
      },
      {
        id: 'kubernetes',
        name: 'Kubernetes Cluster',
        type: 'orchestration',
        category: 'infrastructure',
        status: 'warning',
        uptime: '99.95%',
        responseTime: 78,
        lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        metrics: {
          nodes: 4,
          pods: 45,
          deployments: 12
        }
      },
      {
        id: 'ci-cd',
        name: 'CI/CD Pipeline',
        type: 'pipeline',
        category: 'infrastructure',
        status: 'healthy',
        uptime: '99.90%',
        responseTime: 56,
        lastCheck: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        metrics: {
          builds: 156,
          successRate: 94.2,
          avgDuration: 512
        }
      },
      {
        id: 'frontend-app',
        name: 'Frontend Application',
        type: 'web',
        category: 'application',
        status: 'healthy',
        uptime: '99.97%',
        responseTime: 89,
        lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        metrics: {
          pageLoads: 5678,
          errorRate: 0.08,
          avgLoadTime: 1.2
        }
      },
      {
        id: 'storage-service',
        name: 'Object Storage',
        type: 'storage',
        category: 'infrastructure',
        status: 'healthy',
        uptime: '100.00%',
        responseTime: 67,
        lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        metrics: {
          totalSize: 1256,
          objects: 45678,
          readOps: 2345
        }
      }
    ];

    defaultServices.forEach(service => {
      this.services.set(service.id, service);
    });

    // Initialize infrastructure
    this.infrastructure = {
      kubernetes: {
        status: 'warning',
        nodes: {
          total: 4,
          ready: 3
        },
        pods: {
          total: 45,
          running: 42,
          pending: 2,
          failed: 1
        },
        services: 12
      },
      database: {
        status: 'healthy',
        connections: 45,
        avgQueryTime: 12,
        uptime: '45 days'
      },
      loadBalancer: {
        status: 'healthy',
        requestsPerSec: 1234,
        responseTime: 45,
        connections: 567
      }
    };

    // Initialize performance metrics
    this.performance = {
      api: {
        responseTime: 245,
        throughput: 1234,
        errorRate: 0.12,
        p95ResponseTime: 450,
        p99ResponseTime: 890
      },
      database: {
        queryTime: 23,
        connections: 45,
        slowQueries: 3,
        throughput: 789
      },
      cache: {
        hitRate: 94.5,
        missRate: 5.5,
        latency: 2,
        evictions: 12
      }
    };
  }

  async getMetrics(timeRange: string = '1h'): Promise<{ metrics: any }> {
    await this.delay(300);
    
    // Update metrics with some random variation
    const systemMetrics = this.metrics.get('system');
    
    Object.keys(systemMetrics.system).forEach(key => {
      const metric = systemMetrics.system[key];
      const change = (Math.random() - 0.5) * 10;
      
      if (key === 'network') {
        metric.value = Math.max(0, metric.value + change / 5);
      } else {
        metric.value = Math.max(0, Math.min(100, metric.value + change));
      }
      
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

    Object.keys(systemMetrics.application).forEach(key => {
      const metric = systemMetrics.application[key];
      const changePercent = (Math.random() - 0.5) * 0.1; // ±5% change
      
      if (key === 'errorRate') {
        metric.value = Math.max(0, metric.value * (1 + changePercent));
        if (metric.value > 0.5) metric.status = 'critical';
        else if (metric.value > 0.2) metric.status = 'warning';
        else metric.status = 'healthy';
      } else {
        metric.value = Math.max(0, metric.value * (1 + changePercent));
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

    return { metrics: systemMetrics };
  }

  async getAlerts(filters?: any): Promise<{ alerts: Alert[] }> {
    await this.delay(200);
    
    let filtered = Array.from(this.alerts.values());
    
    if (filters?.severity && filters.severity !== 'all') {
      filtered = filtered.filter(a => a.severity === filters.severity);
    }
    
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    
    if (filters?.service && filters.service !== 'all') {
      filtered = filtered.filter(a => a.service === filters.service);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(search) || 
        a.description.toLowerCase().includes(search)
      );
    }

    // Sort by timestamp (newest first) and then by severity
    filtered.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const statusOrder = { active: 0, acknowledged: 1, resolved: 2 };
      
      if (a.status !== b.status) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      if (a.severity !== b.severity) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return { alerts: filtered };
  }

  async getAlertDetails(id: string): Promise<Alert> {
    await this.delay(200);
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new Error('Alert not found');
    }
    return alert;
  }

  async acknowledgeAlert(id: string): Promise<void> {
    await this.delay(300);
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = 'current-user@example.com';

    // Add to timeline
    if (!alert.timeline) {
      alert.timeline = [];
    }
    
    alert.timeline.push({
      type: 'acknowledged',
      description: 'Alert acknowledged by current-user@example.com',
      user: 'current-user@example.com',
      timestamp: new Date().toISOString()
    });
  }

  async resolveAlert(id: string, resolution: string): Promise<void> {
    await this.delay(300);
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = 'current-user@example.com';
    alert.resolution = resolution;

    // Add to timeline
    if (!alert.timeline) {
      alert.timeline = [];
    }
    
    alert.timeline.push({
      type: 'resolved',
      description: `Alert resolved: ${resolution}`,
      user: 'current-user@example.com',
      timestamp: new Date().toISOString()
    });
  }

  async createAlert(config: any): Promise<Alert> {
    await this.delay(500);
    
    const id = `alert-${Date.now()}`;
    const alert: Alert = {
      id,
      title: config.name,
      description: config.description,
      severity: config.severity,
      service: config.service,
      source: 'manual',
      status: 'active',
      timestamp: new Date().toISOString(),
      metrics: {
        current: 'N/A',
        threshold: config.threshold + (config.metric.includes('time') ? 'ms' : '%'),
        condition: config.condition,
        duration: config.duration
      },
      timeline: [
        {
          type: 'triggered',
          description: 'Alert rule created manually',
          user: 'current-user@example.com',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.alerts.set(id, alert);
    return alert;
  }

  async getServices(): Promise<{ services: Service[] }> {
    await this.delay(200);
    return { services: Array.from(this.services.values()) };
  }

  async getInfrastructure(): Promise<Infrastructure> {
    await this.delay(300);
    return this.infrastructure;
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    await this.delay(200);
    return this.performance;
  }

  async getMetricDetails(metricId: string, timeRange: string): Promise<Metric> {
    await this.delay(400);
    
    // Generate detailed metric data based on the metric ID
    let metricData: Metric;
    
    if (metricId === 'performance') {
      metricData = {
        id: 'performance',
        name: 'API Response Time',
        description: 'Average response time for API requests',
        category: 'application',
        unit: 'ms',
        currentValue: this.performance.api.responseTime,
        trend: -12,
        status: 'healthy',
        history: Array.from({ length: 50 }, (_, i) => ({
          timestamp: new Date(Date.now() - (49 - i) * 60000).toISOString(),
          value: 200 + Math.random() * 100
        })),
        statistics: {
          average: 245,
          maximum: 890,
          minimum: 120,
          p95: 450,
          p99: 890,
          stdDev: 75,
          dataPoints: 1440
        },
        lastUpdated: new Date().toISOString(),
        alertRules: [
          {
            id: 'rule-1',
            name: 'High Response Time',
            description: 'Alert when API response time exceeds 500ms for 5 minutes',
            condition: 'above',
            threshold: 500,
            duration: '5m',
            severity: 'warning',
            status: 'active'
          },
          {
            id: 'rule-2',
            name: 'Critical Response Time',
            description: 'Alert when API response time exceeds 1000ms for 2 minutes',
            condition: 'above',
            threshold: 1000,
            duration: '2m',
            severity: 'critical',
            status: 'active'
          }
        ]
      };
    } else {
      // Default to CPU metric if not found
      const systemMetrics = this.metrics.get('system');
      metricData = {
        id: 'cpu',
        name: 'CPU Usage',
        description: 'System CPU utilization percentage',
        category: 'system',
        unit: '%',
        currentValue: systemMetrics.system.cpu.value,
        trend: 5,
        status: systemMetrics.system.cpu.status,
        history: systemMetrics.system.cpu.history,
        statistics: {
          average: 65.3,
          maximum: 92.1,
          minimum: 32.5,
          p95: 85.2,
          p99: 90.5,
          stdDev: 12.3,
          dataPoints: 1440
        },
        lastUpdated: new Date().toISOString(),
        alertRules: [
          {
            id: 'rule-3',
            name: 'High CPU Usage',
            description: 'Alert when CPU usage exceeds 80% for 5 minutes',
            condition: 'above',
            threshold: 80,
            duration: '5m',
            severity: 'warning',
            status: 'active'
          },
          {
            id: 'rule-4',
            name: 'Critical CPU Usage',
            description: 'Alert when CPU usage exceeds 90% for 2 minutes',
            condition: 'above',
            threshold: 90,
            duration: '2m',
            severity: 'critical',
            status: 'active'
          }
        ]
      };
    }

    return metricData;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const monitoringService = new MonitoringService();