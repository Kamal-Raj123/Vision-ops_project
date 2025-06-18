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
      { timestamp: new Date().toISOString(), level: 'info', message: 'Pipeline execution started...' }
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

**Critical Issues (2):**
- SQL Injection vulnerability in user authentication - Fix by updating express-validator to v6.14.2
- Outdated cryptographic library - Upgrade crypto-js to v4.1.1

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
    
    return `I understand you'd like help with: "${userInput}"

I can assist you with various DevSecOps tasks including:

• **Security Analysis** - Vulnerability assessment and remediation
• **Performance Monitoring** - System optimization and bottleneck identification  
• **Log Analysis** - Error pattern detection and root cause analysis
• **Pipeline Optimization** - CI/CD improvement recommendations
• **Infrastructure Insights** - Resource usage and scaling recommendations

Could you please provide more specific details about what you'd like me to analyze or help you with?`;
  }
}