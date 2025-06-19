import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Network,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  RefreshCw,
  Settings,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Bell,
  Shield,
  Package,
  GitBranch,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Plus,
  X
} from 'lucide-react';
import { monitoringService } from '../services/monitoringService';
import MetricDetailsModal from './MetricDetailsModal';
import AlertDetailsModal from './AlertDetailsModal';
import CreateAlertModal from './CreateAlertModal';
import MonitoringReportModal from './MonitoringReportModal';
import toast from 'react-hot-toast';

export default function Monitoring() {
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [infrastructure, setInfrastructure] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    service: 'all',
    search: ''
  });

  useEffect(() => {
    loadMonitoringData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadMonitoringData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedTimeRange, autoRefresh]);

  const loadMonitoringData = async () => {
    try {
      const [metricsRes, alertsRes, servicesRes, infraRes, perfRes] = await Promise.all([
        monitoringService.getMetrics(selectedTimeRange),
        monitoringService.getAlerts(filters),
        monitoringService.getServices(),
        monitoringService.getInfrastructure(),
        monitoringService.getPerformanceMetrics()
      ]);

      setMetrics(metricsRes.metrics);
      setAlerts(alertsRes.alerts);
      setServices(servicesRes.services);
      setInfrastructure(infraRes);
      setPerformance(perfRes);
    } catch (error) {
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await monitoringService.acknowledgeAlert(alertId);
      toast.success('Alert acknowledged');
      loadMonitoringData();
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolveAlert = async (alertId: string, resolution: string) => {
    try {
      await monitoringService.resolveAlert(alertId, resolution);
      toast.success('Alert resolved');
      loadMonitoringData();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const handleCreateAlert = async (alertConfig: any) => {
    try {
      await monitoringService.createAlert(alertConfig);
      toast.success('Alert rule created successfully');
      setShowCreateAlert(false);
      loadMonitoringData();
    } catch (error) {
      toast.error('Failed to create alert rule');
    }
  };

  const timeRanges = [
    { value: '5m', label: '5 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-500 bg-emerald-100';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100';
      case 'critical':
        return 'text-red-500 bg-red-100';
      case 'unknown':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return AlertTriangle;
      case 'unknown':
        return Clock;
      default:
        return Clock;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderMiniChart = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((point.value - minValue) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filters.severity === 'all' || alert.severity === filters.severity;
    const matchesStatus = filters.status === 'all' || alert.status === filters.status;
    const matchesService = filters.service === 'all' || alert.service === filters.service;
    const matchesSearch = alert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         alert.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSeverity && matchesStatus && matchesService && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">System Monitoring</h1>
          <p className="text-gray-600 text-lg">Real-time infrastructure and application performance monitoring with advanced analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
              autoRefresh 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
          </button>
          <select
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateAlert(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Create Alert</span>
          </button>
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </button>
          <button
            onClick={loadMonitoringData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Cpu className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.system.cpu.value)}%</p>
              </div>
            </div>
            <div className={`text-blue-600 ${getStatusColor(metrics.system.cpu.status).replace('bg-', 'text-').replace('text-', '')}`}>
              {renderMiniChart(metrics.system.cpu.history)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <MemoryStick className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.system.memory.value)}%</p>
              </div>
            </div>
            <div className="text-emerald-600">
              {renderMiniChart(metrics.system.memory.history)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.system.disk.value)}%</p>
              </div>
            </div>
            <div className="text-purple-600">
              {renderMiniChart(metrics.system.disk.history)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Network className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Network I/O</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.system.network.value.toFixed(1)} MB/s</p>
              </div>
            </div>
            <div className="text-yellow-600">
              {renderMiniChart(metrics.system.network.history)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => a.status === 'active').length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <span className="text-gray-600">{alerts.filter(a => a.severity === 'critical').length} critical</span>
            </div>
          </div>
        </div>
      )}

      {/* Infrastructure Status */}
      {infrastructure && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Infrastructure Status</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live monitoring</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kubernetes Cluster */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Kubernetes Cluster</h3>
                  <p className="text-sm text-blue-600">{infrastructure.kubernetes.nodes.ready}/{infrastructure.kubernetes.nodes.total} nodes ready</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">Pods Running</p>
                  <p className="text-xl font-bold text-blue-900">{infrastructure.kubernetes.pods.running}</p>
                </div>
                <div>
                  <p className="text-blue-700">Services</p>
                  <p className="text-xl font-bold text-blue-900">{infrastructure.kubernetes.services}</p>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">Database Cluster</h3>
                  <p className="text-sm text-emerald-600">{infrastructure.database.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-emerald-700">Connections</p>
                  <p className="text-xl font-bold text-emerald-900">{infrastructure.database.connections}</p>
                </div>
                <div>
                  <p className="text-emerald-700">Query Time</p>
                  <p className="text-xl font-bold text-emerald-900">{infrastructure.database.avgQueryTime}ms</p>
                </div>
              </div>
            </div>

            {/* Load Balancer */}
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Load Balancer</h3>
                  <p className="text-sm text-purple-600">{infrastructure.loadBalancer.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-700">Requests/sec</p>
                  <p className="text-xl font-bold text-purple-900">{infrastructure.loadBalancer.requestsPerSec}</p>
                </div>
                <div>
                  <p className="text-purple-700">Response Time</p>
                  <p className="text-xl font-bold text-purple-900">{infrastructure.loadBalancer.responseTime}ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Status */}
      {services && services.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Service Health</h2>
            <span className="text-sm text-gray-600">
              {services.filter(s => s.status === 'healthy').length}/{services.length} services healthy
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={service.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(service.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.type}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="text-gray-900">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response</span>
                      <span className="text-gray-900">{service.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {performance && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Application Performance</h2>
              <button
                onClick={() => setSelectedMetric('performance')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Response Time</p>
                    <p className="text-sm text-gray-500">Average API response</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{performance.api.responseTime}ms</p>
                  <div className="flex items-center text-emerald-600 text-sm">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    <span>-12%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Throughput</p>
                    <p className="text-sm text-gray-500">Requests per second</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{performance.api.throughput}</p>
                  <div className="flex items-center text-emerald-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+8%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Error Rate</p>
                    <p className="text-sm text-gray-500">Failed requests</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{performance.api.errorRate}%</p>
                  <div className="flex items-center text-red-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+0.03%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Database Queries</p>
                    <p className="text-sm text-gray-500">Average query time</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{performance.database.queryTime}ms</p>
                  <div className="flex items-center text-emerald-600 text-sm">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    <span>-5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Resource Utilization</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium">View Trends</button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(metrics?.system.cpu.value || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (metrics?.system.cpu.value || 0) > 80 ? 'bg-red-500' :
                      (metrics?.system.cpu.value || 0) > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${metrics?.system.cpu.value || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(metrics?.system.memory.value || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (metrics?.system.memory.value || 0) > 80 ? 'bg-red-500' :
                      (metrics?.system.memory.value || 0) > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${metrics?.system.memory.value || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(metrics?.system.disk.value || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (metrics?.system.disk.value || 0) > 80 ? 'bg-red-500' :
                      (metrics?.system.disk.value || 0) > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${metrics?.system.disk.value || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Network I/O</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{metrics?.system.network.value.toFixed(1) || 0} MB/s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((metrics?.system.network.value || 0) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Alerts & Notifications</h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {filteredAlerts.length} of {alerts.length} alerts
              </span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
          </div>

          {/* Alert Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.slice(0, 10).map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">{alert.service}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                    <p className="text-gray-600 mb-3 text-sm">{alert.description}</p>
                    {alert.metrics && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Current: {alert.metrics.current}</span>
                        <span>Threshold: {alert.metrics.threshold}</span>
                        <span>Duration: {alert.metrics.duration}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {alert.status === 'active' && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => handleResolveAlert(alert.id, 'Resolved manually')}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
              <p className="text-gray-600">All systems are running smoothly. Great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedMetric && (
        <MetricDetailsModal
          metricId={selectedMetric}
          timeRange={selectedTimeRange}
          onClose={() => setSelectedMetric(null)}
        />
      )}

      {selectedAlert && (
        <AlertDetailsModal
          alertId={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
        />
      )}

      {showCreateAlert && (
        <CreateAlertModal
          services={services}
          onClose={() => setShowCreateAlert(false)}
          onCreate={handleCreateAlert}
        />
      )}

      {showReport && (
        <MonitoringReportModal
          metrics={metrics}
          alerts={alerts}
          services={services}
          infrastructure={infrastructure}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}