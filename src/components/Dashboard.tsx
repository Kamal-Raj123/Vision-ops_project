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
  RefreshCw
} from 'lucide-react';
import { useDashboard } from '../hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { data, loading, error } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const statusIcons = {
    success: CheckCircle,
    failed: XCircle,
    running: Clock,
    pending: Clock
  };

  const statusColors = {
    success: 'text-emerald-500',
    failed: 'text-red-500',
    running: 'text-blue-500',
    pending: 'text-yellow-500'
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger a refresh of dashboard data
    setTimeout(() => setRefreshing(false), 1000);
  };

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
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-red-700 mb-4">Unable to connect to the backend server.</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pipelineStats = data?.pipelines?.[0] || { total: 0, successful: 0 };
  const vulnCounts = data?.vulnerabilities?.reduce((acc: any, curr: any) => {
    acc[curr.severity] = curr.count;
    return acc;
  }, {}) || {};

  const criticalVulns = vulnCounts.critical || 0;
  const highVulns = vulnCounts.high || 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your DevSecOps pipeline health and security posture</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Pipelines</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pipelineStats.total}</p>
              <p className="text-sm text-emerald-600 mt-1">
                {pipelineStats.successful}/{pipelineStats.total} successful
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Vulnerabilities</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{criticalVulns}</p>
              <p className="text-sm text-gray-500 mt-1">{highVulns} high severity</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">87%</p>
              <p className="text-sm text-emerald-600 mt-1">+5% from last week</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">Warning</p>
              <p className="text-sm text-gray-500 mt-1">High CPU usage</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Pipelines</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {data?.recentPipelines?.map((pipeline: any) => {
              const StatusIcon = statusIcons[pipeline.status as keyof typeof statusIcons];
              return (
                <div key={pipeline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-5 h-5 ${statusColors[pipeline.status as keyof typeof statusColors]}`} />
                    <div>
                      <p className="font-medium text-gray-900">{pipeline.name}</p>
                      <p className="text-sm text-gray-500">{pipeline.repository}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {pipeline.duration ? `${Math.floor(pipeline.duration / 60)}m ${pipeline.duration % 60}s` : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pipeline.last_run ? formatDistanceToNow(new Date(pipeline.last_run), { addSuffix: true }) : 'Never'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Security Alerts</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {data?.recentVulns?.slice(0, 4).map((vuln: any) => {
              const severityColors = {
                critical: 'bg-red-100 text-red-800',
                high: 'bg-orange-100 text-orange-800',
                medium: 'bg-yellow-100 text-yellow-800',
                low: 'bg-gray-100 text-gray-800'
              };
              
              return (
                <div key={vuln.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{vuln.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{vuln.package}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityColors[vuln.severity as keyof typeof severityColors]}`}>
                      {vuln.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}