import React from 'react';
import { 
  TrendingUp, 
  Shield, 
  GitBranch, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { mockPipelines, mockVulnerabilities, mockMetrics } from '../utils/mockData';

export default function Dashboard() {
  const totalPipelines = mockPipelines.length;
  const successfulPipelines = mockPipelines.filter(p => p.status === 'success').length;
  const criticalVulns = mockVulnerabilities.filter(v => v.severity === 'critical').length;
  const highVulns = mockVulnerabilities.filter(v => v.severity === 'high').length;

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

  return (
    <div className="p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your DevSecOps pipeline health and security posture</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Pipelines</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPipelines}</p>
              <p className="text-sm text-emerald-600 mt-1">
                {successfulPipelines}/{totalPipelines} successful
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
            {mockPipelines.map((pipeline) => {
              const StatusIcon = statusIcons[pipeline.status];
              return (
                <div key={pipeline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-5 h-5 ${statusColors[pipeline.status]}`} />
                    <div>
                      <p className="font-medium text-gray-900">{pipeline.name}</p>
                      <p className="text-sm text-gray-500">{pipeline.repository}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{pipeline.duration}</p>
                    <p className="text-xs text-gray-500">{pipeline.lastRun}</p>
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
            {mockVulnerabilities.slice(0, 4).map((vuln) => {
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityColors[vuln.severity]}`}>
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