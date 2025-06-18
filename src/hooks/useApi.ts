import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Don't redirect automatically, let the component handle it
    }
    return Promise.reject(error);
  }
);

export const useApi = () => {
  return api;
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setUser(user);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 3001.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return { user, login, logout, loading };
};

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
};

export const usePipelines = () => {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelines = async () => {
    try {
      const response = await api.get('/pipelines');
      setPipelines(response.data);
    } catch (error) {
      console.error('Failed to fetch pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async (id: string) => {
    try {
      await api.post(`/pipelines/${id}/run`);
      await fetchPipelines(); // Refresh data
    } catch (error) {
      console.error('Failed to run pipeline:', error);
    }
  };

  const createPipeline = async (pipelineData: any) => {
    try {
      await api.post('/pipelines', pipelineData);
      await fetchPipelines(); // Refresh data
    } catch (error) {
      console.error('Failed to create pipeline:', error);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  return { pipelines, loading, runPipeline, createPipeline, refetch: fetchPipelines };
};

export const useVulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVulnerabilities = async (filters = {}) => {
    try {
      const response = await api.get('/vulnerabilities', { params: filters });
      setVulnerabilities(response.data);
    } catch (error) {
      console.error('Failed to fetch vulnerabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async (type: string, target: string) => {
    try {
      const response = await api.post('/security/scan', { type, target });
      return response.data;
    } catch (error) {
      console.error('Failed to run security scan:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  return { vulnerabilities, loading, runSecurityScan, refetch: fetchVulnerabilities };
};

export const useMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async (timeRange = '1h') => {
    try {
      const response = await api.get('/metrics', { params: { range: timeRange } });
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, loading, refetch: fetchMetrics };
};

export const useAI = () => {
  const sendMessage = async (message: string) => {
    try {
      const response = await api.post('/ai/chat', { message });
      return response.data.response;
    } catch (error) {
      console.error('Failed to send AI message:', error);
      throw error;
    }
  };

  return { sendMessage };
};