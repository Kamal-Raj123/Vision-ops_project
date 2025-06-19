import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { integrationService } from '../services/integrationService';

interface IntegrationMetricsProps {
  integrationId: string;
  integrationName: string;
  onClose: () => void;
}

export default function IntegrationMetrics({ 
  integrationId, 
  integrationName, 
  onClose 
}: IntegrationMetricsProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [integrationId]);

  const loadMetrics = async () => {
    try {
      setError(null);
      const data = await integrationService.getIntegrationMetrics(integrationId);
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderKubernetesMetrics = () => (
    <div className="space-y-6">
      {/* Cluster Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Server className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Nodes</h4>
          </div>
          <p className="text-2xl font-bold text-blue-900">{metrics.nodes.ready}/{metrics.nodes.total}</p>
          <p className="text-sm text-blue-600">Ready / Total</p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900">Pods</h4>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{metrics.pods.running}</p>
          <p className="text-sm text-emerald-600">Running</p>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Services</h4>
          </div>
          <p className="text-2xl font-bold text-purple-900">{metrics.services}</p>
          <p className="text-sm text-purple-600">Active</p>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Cluster Resource Usage</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.nodes.cpu}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.nodes.cpu}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MemoryStick className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.nodes.memory}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.nodes.memory}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pod Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Pod Status</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{metrics.pods.running}</p>
            <p className="text-sm text-emerald-700">Running</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{metrics.pods.pending}</p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{metrics.pods.failed}</p>
            <p className="text-sm text-red-700">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrometheusMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Targets</h4>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600">{metrics.targets.up}</p>
              <p className="text-xs text-emerald-700">Up</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-600">{metrics.targets.down}</p>
              <p className="text-xs text-red-700">Down</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Queries</h4>
          <p className="text-2xl font-bold text-purple-900">{metrics.queries.toLocaleString()}</p>
          <p className="text-sm text-purple-600">Total queries</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Active Alerts</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{metrics.alerts.firing}</p>
            <p className="text-sm text-red-700">Firing</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{metrics.alerts.pending}</p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJenkinsMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Jobs</h4>
          <p className="text-2xl font-bold text-blue-900">{metrics.jobs.total}</p>
          <p className="text-sm text-blue-600">Total jobs</p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4">
          <h4 className="font-semibold text-emerald-900 mb-2">Running</h4>
          <p className="text-2xl font-bold text-emerald-900">{metrics.jobs.running}</p>
          <p className="text-sm text-emerald-600">Active builds</p>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Queue</h4>
          <p className="text-2xl font-bold text-yellow-900">{metrics.jobs.queued}</p>
          <p className="text-sm text-yellow-600">Waiting</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Build Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{metrics.builds.successful}</p>
            <p className="text-sm text-emerald-700">Successful</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{metrics.builds.failed}</p>
            <p className="text-sm text-red-700">Failed</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">{metrics.builds.aborted}</p>
            <p className="text-sm text-gray-700">Aborted</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Executor Usage</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Executors</span>
          <span className="text-sm font-semibold text-gray-900">
            {metrics.executors.busy}/{metrics.executors.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(metrics.executors.busy / metrics.executors.total) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const renderDefaultMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4">
          <h4 className="font-semibold text-emerald-900 mb-2">Status</h4>
          <p className="text-lg font-bold text-emerald-900">{metrics.status}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Uptime</h4>
          <p className="text-lg font-bold text-blue-900">{metrics.uptime}</p>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Requests</h4>
          <p className="text-lg font-bold text-purple-900">{metrics.requests?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  const renderMetrics = () => {
    if (!metrics) return null;

    switch (integrationId) {
      case 'kubernetes':
        return renderKubernetesMetrics();
      case 'prometheus':
        return renderPrometheusMetrics();
      case 'jenkins':
        return renderJenkinsMetrics();
      default:
        return renderDefaultMetrics();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{integrationName} Metrics</h2>
            <p className="text-gray-600">Real-time performance and health metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading metrics...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Failed to load metrics</p>
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={loadMetrics}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            renderMetrics()
          )}
        </div>
      </div>
    </div>
  );
}