import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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