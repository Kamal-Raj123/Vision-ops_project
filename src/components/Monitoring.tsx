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
  RefreshCw
} from 'lucide-react';
import { useMetrics } from '../hooks/useApi';

export default function Monitoring() {
  const { metrics, loading, refetch } = useMetrics();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const timeRanges = [
    { value: '5m', label: '5 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' }
  ];

  const handleTimeRangeChange = async (range: string) => {
    setSelectedTimeRange(range);
    await refetch(range);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch(selectedTimeRange);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-500 bg-emerald-100';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100';
      case 'critical':
        return 'text-red-500 bg-red-100';
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
      default:
        return Clock;
    }
  };

  const renderMiniChart = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (point.value / maxValue) * 100;
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

  const clusterNodes = [
    { name: 'master-1', status: 'healthy', cpu: '23%', memory: '67%', role: 'control-plane' },
    { name: 'worker-1', status: 'healthy', cpu: '45%', memory: '72%', role: 'worker' },
    { name: 'worker-2', status: 'warning', cpu: '89%', memory: '94%', role: 'worker' },
    { name: 'worker-3', status: 'healthy', cpu: '34%', memory: '58%', role: 'worker' }
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
          <p className="text-gray-600">Real-time infrastructure and application performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedTimeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric: any) => {
          const StatusIcon = getStatusIcon(metric.status);
          return (
            <div
              key={metric.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all hover:shadow-md ${
                selectedMetric === metric.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(metric.status)}`}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </div>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {metric.value}{metric.unit}
                </p>
              </div>
              <div className={`${getStatusColor(metric.status).replace('bg-', 'text-')}`}>
                {renderMiniChart(metric.data)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kubernetes Cluster Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Kubernetes Cluster</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">4 nodes active</span>
            </div>
          </div>
          <div className="space-y-4">
            {clusterNodes.map((node) => {
              const StatusIcon = getStatusIcon(node.status);
              return (
                <div key={node.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(node.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{node.name}</p>
                        <p className="text-xs text-gray-500">{node.role}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(node.status)}`}>
                      {node.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">CPU: {node.cpu}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Memory: {node.memory}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance Overview</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View Details</button>
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
                <p className="text-lg font-semibold text-gray-900">245ms</p>
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
                <p className="text-lg font-semibold text-gray-900">1,234</p>
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
                <p className="text-lg font-semibold text-gray-900">0.12%</p>
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
                <p className="text-lg font-semibold text-gray-900">23ms</p>
                <div className="flex items-center text-emerald-600 text-sm">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span>-5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">High Memory Usage on worker-2</p>
              <p className="text-sm text-gray-600 mt-1">Memory usage has exceeded 90% threshold for the past 10 minutes</p>
              <p className="text-xs text-gray-500 mt-2">2 minutes ago</p>
            </div>
            <button className="text-red-600 hover:text-red-700 font-medium text-sm">Acknowledge</button>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">API Response Time Degradation</p>
              <p className="text-sm text-gray-600 mt-1">Average response time increased by 25% in the last hour</p>
              <p className="text-xs text-gray-500 mt-2">15 minutes ago</p>
            </div>
            <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">Investigate</button>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Deployment Successful</p>
              <p className="text-sm text-gray-600 mt-1">Application v2.1.3 has been successfully deployed to production</p>
              <p className="text-xs text-gray-500 mt-2">1 hour ago</p>
            </div>
            <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}