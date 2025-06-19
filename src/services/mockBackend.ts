// Mock backend service for StackBlitz environment
// This replaces the need for a separate backend server

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

interface Pipeline {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  lastRun: string;
  duration: string;
  repository: string;
  branch: string;
  stages: Array<{
    name: string;
    status: 'success' | 'failed' | 'running' | 'pending';
    duration: string | null;
  }>;
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  package: string;
  version: string;
  fixedVersion?: string;
  scanner: 'trivy' | 'owasp' | 'bandit';
  cve?: string;
  cvssScore?: number;
  discoveredAt: string;
  status: 'open' | 'in_progress' | 'resolved';
  assignee?: string;
  fixInstructions?: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'ci_cd' | 'monitoring' | 'security' | 'communication' | 'container' | 'orchestration';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync?: string;
  config: Record<string, any>;
  metrics?: {
    uptime: string;
    requests: number;
    errors: number;
  };
}

// Mock data
const users: User[] = [
  {
    id: '1',
    email: 'techey.kamal@gmail.com',
    password: 'password', // In real app, this would be hashed
    name: 'Kamal Raj',
    role: 'admin'
  },
  {
    id: '2',
    email: 'karthick@example.com',
    password: 'password',
    name: 'Karthick',
    role: 'devops'
  }
];

let pipelines: Pipeline[] = [
  {
    id: '1',
    name: 'Frontend Deploy',
    status: 'success',
    lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    duration: '3m 24s',
    repository: 'secureops/frontend',
    branch: 'main',
    stages: [
      { name: 'Build', status: 'success', duration: '1m 12s' },
      { name: 'Test', status: 'success', duration: '45s' },
      { name: 'Security Scan', status: 'success', duration: '1m 27s' },
      { name: 'Deploy', status: 'success', duration: '32s' }
    ],
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Starting build process...' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Installing dependencies...' },
      { timestamp: new Date().toISOString(), level: 'success', message: 'Build completed successfully' }
    ]
  },
  {
    id: '2',
    name: 'Backend API',
    status: 'running',
    lastRun: new Date().toISOString(),
    duration: '1m 45s',
    repository: 'secureops/api',
    branch: 'develop',
    stages: [
      { name: 'Build', status: 'success', duration: '1m 5s' },
      { name: 'Test', status: 'running', duration: '40s' },
      { name: 'Security Scan', status: 'pending', duration: null },
      { name: 'Deploy', status: 'pending', duration: null }
    ],
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Running unit tests...' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Test coverage: 87%' }
    ]
  }
];

let vulnerabilities: Vulnerability[] = [
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

// Enhanced integrations with real functionality simulation
let integrations: Integration[] = [
  {
    id: 'kubernetes',
    name: 'Kubernetes Cluster',
    type: 'orchestration',
    status: 'disconnected',
    config: {
      endpoint: 'https://kubernetes.default.svc.cluster.local',
      namespace: 'default',
      kubeconfig: '/etc/kubernetes/admin.conf',
      clusterName: 'production-cluster',
      version: 'v1.28.0',
      nodes: 0,
      pods: 0,
      services: 0
    },
    metrics: {
      uptime: '0%',
      requests: 0,
      errors: 0
    }
  },
  {
    id: 'prometheus',
    name: 'Prometheus Monitoring',
    type: 'monitoring',
    status: 'disconnected',
    config: {
      endpoint: 'http://prometheus.monitoring.svc.cluster.local:9090',
      scrapeInterval: '30s',
      evaluationInterval: '30s',
      retentionTime: '15d',
      alertmanagerUrl: 'http://alertmanager:9093',
      grafanaUrl: 'http://grafana:3000',
      targets: []
    },
    metrics: {
      uptime: '0%',
      requests: 0,
      errors: 0
    }
  },
  {
    id: 'jenkins',
    name: 'Jenkins CI/CD',
    type: 'ci_cd',
    status: 'disconnected',
    config: {
      endpoint: 'http://jenkins.ci.svc.cluster.local:8080',
      username: 'admin',
      apiKey: '***hidden***',
      version: '2.426.1',
      plugins: ['kubernetes', 'docker', 'git', 'pipeline-stage-view'],
      executors: 4,
      jobs: 0,
      builds: 0,
      webhookUrl: '/github-webhook/',
      slaveNodes: 2
    },
    metrics: {
      uptime: '0%',
      requests: 0,
      errors: 0
    }
  },
  {
    id: 'docker-registry',
    name: 'Docker Registry',
    type: 'container',
    status: 'disconnected',
    config: {
      endpoint: 'https://registry.company.com',
      username: 'secureops',
      token: '***hidden***',
      version: '2.8.1',
      storage: 'filesystem',
      repositories: 0,
      totalSize: '0 GB',
      namespace: 'secureops',
      pullPolicy: 'Always'
    },
    metrics: {
      uptime: '0%',
      requests: 0,
      errors: 0
    }
  },
  {
    id: 'trivy',
    name: 'Trivy Security Scanner',
    type: 'security',
    status: 'disconnected',
    config: {
      endpoint: 'http://trivy.security.svc.cluster.local:8080',
      version: 'v0.45.1',
      dbVersion: '2023-11-15',
      scanTypes: ['vuln', 'secret', 'config', 'license'],
      severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      timeout: '5m',
      cacheDir: '/tmp/trivy'
    },
    metrics: {
      uptime: '0%',
      requests: 0,
      errors: 0
    }
  },
  {
    id: 'sonarqube',
    name: 'SonarQube Code Quality',
    type: 'security',
    status: 'disconnected',
    config: {
      endpoint: 'http://sonarqube.security.svc.cluster.local:9000',
      token: '***hidden***',
      version: '9.9.2',
      edition: 'Community',
      projects: 0,
      linesOfCode: 0,
      qualityGates: 1,
      rules: 4000
    },
    metrics: {
      uptime: '0%',
      requests: 0,
      errors: 0
    }
  },
  {
    id: 'grafana',
    name: 'Grafana Dashboards',
    type: 'monitoring',
    status: 'disconnected',
    config: {
      endpoint: 'http://grafana.monitoring.svc.cluster.local:3000',
      username: 'admin',
      token: '***hidden***',
      version: '10.2.0',
      dashboards: 0,
      datasources: 0,
      users: 1,
      organizations: 1,
      alertRules: 0
    },
    metrics: {
      uptime: '0%',
      requests: 0,
      errors: 0
    }
  },
  {
    id: 'slack',
    name: 'Slack Notifications',
    type: 'communication',
    status: 'disconnected',
    config: {
      token: '***hidden***',
      workspace: 'secureops-team',
      channels: ['#alerts', '#deployments', '#security'],
      botName: 'VisionOps Bot',
      webhookUrl: '***hidden***'
    },
    metrics: {
      uptime: '0%',
      requests: 0,
      errors: 0
    }
  }
];

// Utility function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export class MockBackendService {
  // Auth API
  static async login(credentials: { email: string; password: string }) {
    await delay(500); // Simulate network delay
    
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
    
    return {
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    };
  }

  static async register(userData: { email: string; password: string; name: string }) {
    await delay(500);
    
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: 'user'
    };

    users.push(newUser);

    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role }));
    
    return {
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
    };
  }

  // Pipelines API
  static async getPipelines() {
    await delay(300);
    return {
      data: {
        pipelines,
        total: pipelines.length,
        running: pipelines.filter(p => p.status === 'running').length,
        success: pipelines.filter(p => p.status === 'success').length,
        failed: pipelines.filter(p => p.status === 'failed').length
      }
    };
  }

  static async getPipelineById(id: string) {
    await delay(200);
    const pipeline = pipelines.find(p => p.id === id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }
    return { data: pipeline };
  }

  static async runPipeline(id: string) {
    await delay(300);
    const pipeline = pipelines.find(p => p.id === id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    pipeline.status = 'running';
    pipeline.lastRun = new Date().toISOString();
    pipeline.logs = [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Pipeline execution started...' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Connecting to Jenkins...' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Triggering build job...' }
    ];

    // Simulate pipeline completion after 5 seconds
    setTimeout(() => {
      pipeline.status = Math.random() > 0.2 ? 'success' : 'failed';
      pipeline.duration = `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`;
      pipeline.logs.push({
        timestamp: new Date().toISOString(),
        level: pipeline.status === 'success' ? 'success' : 'error',
        message: `Pipeline ${pipeline.status === 'success' ? 'completed successfully' : 'failed'}`
      });
    }, 5000);

    return { data: { message: 'Pipeline started successfully', pipeline } };
  }

  // Security API
  static async getVulnerabilities(params?: { severity?: string; status?: string; scanner?: string }) {
    await delay(400);
    
    let filtered = vulnerabilities;
    
    if (params?.severity && params.severity !== 'all') {
      filtered = filtered.filter(v => v.severity === params.severity);
    }
    
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(v => v.status === params.status);
    }
    
    if (params?.scanner && params.scanner !== 'all') {
      filtered = filtered.filter(v => v.scanner === params.scanner);
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

    return {
      data: {
        vulnerabilities: filtered,
        summary,
        filters: params
      }
    };
  }

  static async updateVulnerability(id: string, data: { status?: string; assignee?: string; notes?: string }) {
    await delay(200);
    const vulnerability = vulnerabilities.find(v => v.id === id);
    
    if (!vulnerability) {
      throw new Error('Vulnerability not found');
    }

    if (data.status) vulnerability.status = data.status as any;
    if (data.assignee !== undefined) vulnerability.assignee = data.assignee;

    return { data: vulnerability };
  }

  static async startSecurityScan(scanData: { type: string; target: string; scanner: string }) {
    await delay(500);
    
    const scan = {
      id: Date.now().toString(),
      type: scanData.type,
      target: scanData.target,
      scanner: scanData.scanner,
      status: 'running',
      startedAt: new Date().toISOString(),
      progress: 0
    };

    // Simulate scan progress
    const progressInterval = setInterval(() => {
      scan.progress += Math.random() * 20;
      if (scan.progress >= 100) {
        scan.progress = 100;
        scan.status = 'completed';
        clearInterval(progressInterval);
        
        // Add some new vulnerabilities
        const newVuln: Vulnerability = {
          id: Date.now().toString(),
          severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)] as any,
          title: `New vulnerability found in ${scanData.target}`,
          description: `Security scan detected a vulnerability requiring attention.`,
          package: scanData.target,
          version: '1.0.0',
          scanner: scanData.scanner as any,
          discoveredAt: new Date().toISOString(),
          status: 'open',
          assignee: null,
          fixInstructions: 'Review and update the affected component.'
        };
        vulnerabilities.push(newVuln);
      }
    }, 1000);

    return { data: scan };
  }

  // Monitoring API
  static async getMetrics() {
    await delay(300);
    
    const metrics = {
      system: {
        cpu: { value: 67 + Math.random() * 10 - 5, status: 'warning', history: [] },
        memory: { value: 45 + Math.random() * 10 - 5, status: 'healthy', history: [] },
        disk: { value: 89 + Math.random() * 5 - 2, status: 'critical', history: [] },
        network: { value: 12.3 + Math.random() * 2 - 1, status: 'healthy', history: [] }
      },
      application: {
        responseTime: { value: 245 + Math.random() * 50 - 25, status: 'healthy', history: [] },
        throughput: { value: 1234 + Math.random() * 200 - 100, status: 'healthy', history: [] },
        errorRate: { value: 0.12 + Math.random() * 0.1 - 0.05, status: 'healthy', history: [] },
        activeUsers: { value: 156 + Math.random() * 20 - 10, status: 'healthy', history: [] }
      },
      kubernetes: {
        nodes: [
          { name: 'master-1', status: 'healthy', cpu: 23, memory: 67, role: 'control-plane' },
          { name: 'worker-1', status: 'healthy', cpu: 45, memory: 72, role: 'worker' },
          { name: 'worker-2', status: 'warning', cpu: 89, memory: 94, role: 'worker' },
          { name: 'worker-3', status: 'healthy', cpu: 34, memory: 58, role: 'worker' }
        ],
        pods: { running: 24, pending: 2, failed: 1, succeeded: 156 },
        services: { active: 12, inactive: 0 }
      }
    };

    return { data: { metrics } };
  }

  static async getAlerts() {
    await delay(200);
    
    const alerts = [
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
      }
    ];

    return { data: { alerts } };
  }

  // Integrations API
  static async getIntegrations() {
    await delay(300);
    return { data: { integrations } };
  }

  static async testIntegration(integrationId: string) {
    await delay(1000); // Simulate connection test
    
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    const success = Math.random() > 0.2; // 80% success rate
    
    return {
      data: {
        integration: integrationId,
        status: success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 1000) + 100,
        details: success 
          ? `Successfully connected to ${integration.name}` 
          : `Failed to connect to ${integration.name}: Connection timeout`
      }
    };
  }

  static async updateIntegrationStatus(integrationId: string, status: string) {
    await delay(300);
    
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    integration.status = status as any;
    integration.lastSync = new Date().toISOString();

    return { data: integration };
  }

  // AI API
  static async chat(message: string, conversationId?: string) {
    await delay(1500); // Simulate AI thinking time
    
    const response = this.generateAIResponse(message);
    
    return {
      data: {
        message: {
          id: Date.now().toString(),
          type: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        },
        conversationId: conversationId || Date.now().toString()
      }
    };
  }

  private static generateAIResponse(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('security') || lowerInput.includes('vulnerability')) {
      return `Based on your recent security scan results, I've identified several key areas for improvement:

**Critical Issues (${vulnerabilities.filter(v => v.severity === 'critical').length}):**
- SQL Injection vulnerability in user authentication - Fix by updating express-validator to v6.14.2
- Outdated cryptographic library - Upgrade crypto-js to v4.1.1

**Integration Status:**
- Trivy Scanner: ${integrations.find(i => i.id === 'trivy')?.status === 'connected' ? '✅ Connected' : '❌ Disconnected'}
- SonarQube: ${integrations.find(i => i.id === 'sonarqube')?.status === 'connected' ? '✅ Connected' : '❌ Disconnected'}

**Recommendations:**
1. Implement input validation middleware across all API endpoints
2. Set up automated dependency scanning in your CI pipeline
3. Enable CSP headers for additional protection

**Next Steps:**
- Run \`npm audit fix\` to auto-update vulnerable packages
- Review and update your authentication middleware
- Consider implementing rate limiting for API endpoints

Would you like me to generate specific code examples for any of these fixes?`;
    }
    
    if (lowerInput.includes('performance') || lowerInput.includes('optimization')) {
      return `I've analyzed your system metrics and identified several optimization opportunities:

**Current Status:**
- CPU usage averaging 67% (elevated)
- Memory usage at 45% (healthy)
- API response time: 245ms (acceptable but improvable)

**Kubernetes Cluster Health:**
- ${integrations.find(i => i.id === 'kubernetes')?.status === 'connected' ? '✅ Connected' : '❌ Disconnected'} - 4 nodes configured
- Prometheus: ${integrations.find(i => i.id === 'prometheus')?.status === 'connected' ? '✅ Monitoring active' : '❌ Not monitoring'}

**Performance Bottlenecks:**
1. High CPU usage on worker-2 node (89%)
2. Database query times averaging 23ms
3. Unoptimized container images increasing startup time

**Recommendations:**
1. **Immediate:** Scale worker-2 or redistribute workload
2. **Short-term:** Implement database query caching
3. **Long-term:** Optimize Docker images using multi-stage builds

**Expected Impact:**
- 30% reduction in response times
- 25% decrease in resource usage
- Improved user experience during peak loads

Would you like detailed implementation steps for any of these optimizations?`;
    }

    if (lowerInput.includes('jenkins') || lowerInput.includes('pipeline')) {
      return `I've reviewed your CI/CD pipeline configuration and Jenkins integration:

**Jenkins Status:**
- ${integrations.find(i => i.id === 'jenkins')?.status === 'connected' ? '✅ Connected and healthy' : '❌ Not connected'}
- Docker Registry: ${integrations.find(i => i.id === 'docker-registry')?.status === 'connected' ? '✅ Available' : '❌ Not available'}

**Current Pipeline Analysis:**
- Average build time: 3m 24s
- Success rate: 87% (good but improvable)
- Most common failure: Test timeouts (34%)

**Optimization Recommendations:**

1. **Parallel Execution:**
   - Run tests and security scans in parallel
   - Estimated time savings: 4-6 minutes

2. **Caching Strategy:**
   - Implement Docker layer caching
   - Cache npm/pip dependencies
   - Expected improvement: 40% faster builds

3. **Jenkins Configuration:**
   - Increase executor pool size
   - Configure build agents with more resources
   - Set up pipeline libraries for reusable components

**Implementation Priority:**
1. Enable dependency caching (Quick win)
2. Parallelize pipeline stages
3. Optimize test execution

Would you like me to generate the updated Jenkinsfile configuration?`;
    }

    if (lowerInput.includes('kubernetes') || lowerInput.includes('k8s')) {
      return `Here's an analysis of your Kubernetes cluster configuration:

**Cluster Status:**
- Connection: ${integrations.find(i => i.id === 'kubernetes')?.status === 'connected' ? '✅ Connected' : '❌ Not connected'}
- Monitoring: ${integrations.find(i => i.id === 'prometheus')?.status === 'connected' ? '✅ Prometheus active' : '❌ No monitoring'}
- Grafana: ${integrations.find(i => i.id === 'grafana')?.status === 'connected' ? '✅ Dashboards available' : '❌ No dashboards'}

**Configured Resources:**
- 4 nodes planned (1 control-plane, 3 workers)
- Default namespace configured
- Version: v1.28.0

**Recommendations:**
1. **Connect to Cluster:** Establish connection to begin monitoring
2. **Resource Management:**
   - Implement resource requests and limits
   - Set up Horizontal Pod Autoscaler (HPA)
   - Configure cluster autoscaling

3. **Monitoring Setup:**
   - Enable Prometheus metrics collection
   - Set up Grafana dashboards
   - Configure alerting rules

**Quick Setup Commands:**
\`\`\`bash
# Test cluster connection
kubectl cluster-info

# Check node status
kubectl get nodes

# Verify system pods
kubectl get pods -n kube-system
\`\`\`

Would you like me to help you establish the cluster connection or set up monitoring?`;
    }

    if (lowerInput.includes('prometheus') || lowerInput.includes('monitoring')) {
      return `Here's your Prometheus monitoring configuration status:

**Prometheus Status:**
- Connection: ${integrations.find(i => i.id === 'prometheus')?.status === 'connected' ? '✅ Connected' : '❌ Not connected'}
- Grafana: ${integrations.find(i => i.id === 'grafana')?.status === 'connected' ? '✅ Dashboards ready' : '❌ No dashboards'}
- Kubernetes: ${integrations.find(i => i.id === 'kubernetes')?.status === 'connected' ? '✅ Cluster metrics' : '❌ No cluster metrics'}

**Configuration:**
- Scrape interval: 30s
- Retention: 15d
- Alertmanager integration planned

**Recommendations:**
1. **Connect Prometheus:** Establish monitoring connection
2. **Dashboard Setup:**
   - Create service-specific dashboards
   - Add SLA/SLO tracking
   - Implement capacity planning views

3. **Alerting Configuration:**
   - Set up critical alerts
   - Configure Slack notifications
   - Establish escalation policies

**Sample Monitoring Targets:**
- Kubernetes API server
- Node metrics
- Pod resource usage
- Application metrics

**Next Steps:**
1. Connect to Prometheus server
2. Configure Grafana dashboards
3. Set up alerting rules

Would you like me to help you configure specific monitoring targets or alerts?`;
    }
    
    return `I understand you'd like help with: "${userInput}"

I can assist you with various DevSecOps tasks including:

• **Security Analysis** - Vulnerability assessment and remediation
• **Performance Monitoring** - System optimization and bottleneck identification  
• **Log Analysis** - Error pattern detection and root cause analysis
• **Pipeline Optimization** - CI/CD improvement recommendations
• **Infrastructure Management** - Kubernetes and container orchestration
• **Integration Setup** - Connect and configure DevSecOps tools

**Current Integration Status:**
- Kubernetes: ${integrations.find(i => i.id === 'kubernetes')?.status || 'Not configured'}
- Jenkins: ${integrations.find(i => i.id === 'jenkins')?.status || 'Not configured'}
- Prometheus: ${integrations.find(i => i.id === 'prometheus')?.status || 'Not configured'}
- Trivy Scanner: ${integrations.find(i => i.id === 'trivy')?.status || 'Not configured'}

To get started, I recommend connecting your integrations through the Settings → Integrations tab. This will enable full monitoring and automation capabilities.

Could you please provide more specific details about what you'd like me to analyze or help you with?`;
  }
}