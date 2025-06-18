import { MockBackendService } from './mockBackend';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Check if we're in StackBlitz environment
const isStackBlitz = window.location.hostname.includes('stackblitz') || 
                    window.location.hostname.includes('webcontainer') ||
                    !navigator.onLine;

// Mock API response structure
const createMockResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {}
});

// Create axios-like interface for mock backend
const mockApi = {
  get: async (url: string, config?: any) => {
    const params = config?.params || {};
    
    if (url === '/pipelines') {
      return MockBackendService.getPipelines();
    }
    if (url.startsWith('/pipelines/') && url.endsWith('/logs')) {
      const id = url.split('/')[2];
      const pipeline = await MockBackendService.getPipelineById(id);
      return createMockResponse({
        logs: pipeline.data.logs,
        pipeline: { id: pipeline.data.id, name: pipeline.data.name, status: pipeline.data.status }
      });
    }
    if (url.startsWith('/pipelines/')) {
      const id = url.split('/')[2];
      return MockBackendService.getPipelineById(id);
    }
    if (url === '/security/vulnerabilities') {
      return MockBackendService.getVulnerabilities(params);
    }
    if (url === '/monitoring/metrics') {
      return MockBackendService.getMetrics();
    }
    if (url === '/monitoring/alerts') {
      return MockBackendService.getAlerts();
    }
    if (url === '/monitoring/health') {
      return createMockResponse({
        overall: 'healthy',
        components: {
          database: { status: 'healthy', responseTime: '12ms' },
          redis: { status: 'healthy', responseTime: '3ms' },
          kubernetes: { status: 'warning', responseTime: '45ms' },
          monitoring: { status: 'healthy', responseTime: '8ms' }
        },
        uptime: Math.floor(Math.random() * 86400),
        version: '2.1.3',
        environment: 'development',
        timestamp: new Date().toISOString()
      });
    }
    
    throw new Error(`Mock API: Unhandled GET ${url}`);
  },
  
  post: async (url: string, data?: any) => {
    if (url === '/auth/login') {
      return MockBackendService.login(data);
    }
    if (url === '/auth/register') {
      return MockBackendService.register(data);
    }
    if (url.includes('/run')) {
      const id = url.split('/')[2];
      return MockBackendService.runPipeline(id);
    }
    if (url === '/ai/chat') {
      return MockBackendService.chat(data.message, data.conversationId);
    }
    
    throw new Error(`Mock API: Unhandled POST ${url}`);
  },
  
  patch: async (url: string, data?: any) => {
    if (url.startsWith('/security/vulnerabilities/')) {
      const id = url.split('/')[3];
      return MockBackendService.updateVulnerability(id, data);
    }
    
    throw new Error(`Mock API: Unhandled PATCH ${url}`);
  },
  
  put: async (url: string, data?: any) => {
    throw new Error(`Mock API: Unhandled PUT ${url}`);
  }
};

// Use mock API in StackBlitz, real API otherwise
const api = isStackBlitz ? mockApi : (() => {
  const axios = require('axios');
  
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle errors
  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
})();

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Pipelines API
export const pipelinesAPI = {
  getAll: () =>
    api.get('/pipelines'),
  
  getById: (id: string) =>
    api.get(`/pipelines/${id}`),
  
  create: (pipeline: { name: string; repository: string; branch: string }) =>
    api.post('/pipelines', pipeline),
  
  run: (id: string) =>
    api.post(`/pipelines/${id}/run`),
  
  stop: (id: string) =>
    api.post(`/pipelines/${id}/stop`),
  
  getLogs: (id: string) =>
    api.get(`/pipelines/${id}/logs`),
};

// Security API
export const securityAPI = {
  getVulnerabilities: (params?: { severity?: string; status?: string; scanner?: string }) =>
    api.get('/security/vulnerabilities', { params }),
  
  getVulnerabilityById: (id: string) =>
    api.get(`/security/vulnerabilities/${id}`),
  
  updateVulnerability: (id: string, data: { status?: string; assignee?: string; notes?: string }) =>
    api.patch(`/security/vulnerabilities/${id}`, data),
  
  startScan: (scanData: { type: string; target: string; scanner: string }) =>
    api.post('/security/scan', scanData),
  
  getScans: () =>
    api.get('/security/scans'),
  
  getMetrics: () =>
    api.get('/security/metrics'),
  
  getReport: (params?: { format?: string; timeRange?: string }) =>
    api.get('/security/report', { params }),
};

// Monitoring API
export const monitoringAPI = {
  getMetrics: (params?: { category?: string; timeRange?: string }) =>
    api.get('/monitoring/metrics', { params }),
  
  getMetricHistory: (category: string, metric: string, timeRange?: string) =>
    api.get(`/monitoring/metrics/${category}/${metric}`, { params: { timeRange } }),
  
  getAlerts: (params?: { status?: string; severity?: string }) =>
    api.get('/monitoring/alerts', { params }),
  
  acknowledgeAlert: (id: string) =>
    api.patch(`/monitoring/alerts/${id}/acknowledge`),
  
  resolveAlert: (id: string, resolution: string) =>
    api.patch(`/monitoring/alerts/${id}/resolve`, { resolution }),
  
  getHealth: () =>
    api.get('/monitoring/health'),
  
  getPerformance: () =>
    api.get('/monitoring/performance'),
};

// AI API
export const aiAPI = {
  chat: (message: string, conversationId?: string) =>
    api.post('/ai/chat', { message, conversationId }),
  
  getConversations: () =>
    api.get('/ai/conversations'),
  
  getConversation: (id: string) =>
    api.get(`/ai/conversations/${id}`),
  
  analyzeLogs: (logs: any[], timeRange?: string) =>
    api.post('/ai/analyze/logs', { logs, timeRange }),
  
  analyzeSecurity: (vulnerabilities: any[], timeRange?: string) =>
    api.post('/ai/analyze/security', { vulnerabilities, timeRange }),
  
  analyzePerformance: (metrics: any[], timeRange?: string) =>
    api.post('/ai/analyze/performance', { metrics, timeRange }),
};

// Settings API
export const settingsAPI = {
  getAll: () =>
    api.get('/settings'),
  
  getCategory: (category: string) =>
    api.get(`/settings/${category}`),
  
  updateSystem: (category: string, settings: any) =>
    api.put(`/settings/system/${category}`, settings),
  
  updateUser: (settings: any) =>
    api.put('/settings/user', settings),
  
  testIntegration: (service: string) =>
    api.post(`/settings/integrations/${service}/test`),
  
  configureIntegration: (service: string, config: any) =>
    api.post(`/settings/integrations/${service}/configure`, { config }),
  
  disconnectIntegration: (service: string) =>
    api.post(`/settings/integrations/${service}/disconnect`),
  
  getSystemStatus: () =>
    api.get('/settings/system/status'),
  
  exportSettings: () =>
    api.get('/settings/export'),
};

export default api;