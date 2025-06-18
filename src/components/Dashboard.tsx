import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Shield, 
  GitBranch, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  Server,
  Users,
  Eye
} from 'lucide-react';
import { MockBackendService } from '../services/mockBackend';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsRes, pipelinesRes, vulnRes, alertsRes] = await Promise.all([
        MockBackendService.getMetrics(),
        MockBackendService.getPipelines(),
        MockBackendService.getVulnerabilities(),
        MockBackendService.getAlerts()
      ]);

      setMetrics(metricsRes.data.metrics);
      setPipelines(pipelinesRes.data.pipelines);
      setVulnerabilities(vulnRes.data.vulnerabilities);
      setAlerts(alertsRes.data.alerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusIcons = {
    success: CheckCircle,
    failed: XCircle,
    running: Clock,
    pending: Clock
  };

  const statusColors = {
    success: 'text-emerald-500 bg-emerald-100',
    failed: 'text-red-500 bg-red-100',
    running: 'text-blue-500 bg-blue-100',
    pending: 'text-yellow-500 bg-yellow-100'
  };

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalPipelines = pipelines.length;
  const successfulPipelines = pipelines.filter(p => p.status === 'success').length;
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 text-lg">Monitor your DevSecOps pipeline health and security posture</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Pipelines</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPipelines}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                <p className="text-sm text-emerald-600 font-medium">
                  {successfulPipelines}/{totalPipelines} successful
                </p>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GitBranch className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Vulnerabilities</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{criticalVulns}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <p className="text-sm text-orange-600 font-medium">{highVulns} high severity</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">87%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                <p className="text-sm text-emerald-600 font-medium">+5% from last week</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{activeAlerts}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <p className="text-sm text-gray-500 font-medium">Requires attention</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      {metrics && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live monitoring</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(metrics.system).map(([key, metric]: [string, any]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 capitalize">{key}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    metric.status === 'healthy' ? 'bg-emerald-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(metric.value)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Pipelines</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
          <div className="space-y-4">
            {pipelines.slice(0, 4).map((pipeline) => {
              const StatusIcon = statusIcons[pipeline.status];
              return (
                <div key={pipeline.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors[pipeline.status]}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{pipeline.name}</p>
                      <p className="text-sm text-gray-500">{pipeline.repository}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{pipeline.duration}</p>
                    <p className="text-xs text-gray-500">{new Date(pipeline.lastRun).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Security Alerts</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
          <div className="space-y-4">
            {vulnerabilities.slice(0, 4).map((vuln) => (
              <div key={vuln.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{vuln.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{vuln.package}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityColors[vuln.severity]}`}>
                    {vuln.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Integration Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { name: 'Jenkins', status: 'connected', uptime: '99.8%' },
            { name: 'Prometheus', status: 'connected', uptime: '99.9%' },
            { name: 'Kubernetes', status: 'connected', uptime: '99.5%' },
            { name: 'Trivy', status: 'connected', uptime: '98.7%' },
            { name: 'GitHub', status: 'connected', uptime: '99.9%' }
          ].map((integration) => (
            <div key={integration.name} className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium text-gray-900">{integration.name}</p>
              <p className="text-xs text-gray-500">{integration.uptime} uptime</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}