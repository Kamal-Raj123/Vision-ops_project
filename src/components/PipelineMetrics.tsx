import React from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  Zap,
  GitBranch,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import { Pipeline } from '../services/pipelineService';

interface PipelineMetricsProps {
  pipelines: Pipeline[];
  onClose: () => void;
}

export default function PipelineMetrics({ pipelines, onClose }: PipelineMetricsProps) {
  const totalRuns = pipelines.reduce((sum, p) => sum + p.metrics.totalRuns, 0);
  const totalSuccessful = pipelines.reduce((sum, p) => 
    sum + Math.floor(p.metrics.totalRuns * (p.metrics.successRate / 100)), 0
  );
  const overallSuccessRate = totalRuns > 0 ? (totalSuccessful / totalRuns) * 100 : 0;

  const runningPipelines = pipelines.filter(p => p.status === 'running').length;
  const successfulPipelines = pipelines.filter(p => p.status === 'success').length;
  const failedPipelines = pipelines.filter(p => p.status === 'failed').length;

  // Generate mock trend data
  const generateTrendData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      deployments: Math.floor(Math.random() * 20) + 5,
      successRate: Math.random() * 20 + 80,
      avgDuration: Math.random() * 300 + 300 // seconds
    }));
  };

  const trendData = generateTrendData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pipeline Analytics</h2>
            <p className="text-gray-600">Comprehensive metrics and performance insights</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Pipelines</p>
                  <p className="text-2xl font-bold text-blue-900">{pipelines.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-900">{overallSuccessRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Runs</p>
                  <p className="text-2xl font-bold text-purple-900">{totalRuns}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700">Running Now</p>
                  <p className="text-2xl font-bold text-yellow-900">{runningPipelines}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Status Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700">Successful</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{successfulPipelines}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(successfulPipelines / pipelines.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Running</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{runningPipelines}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(runningPipelines / pipelines.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700">Failed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{failedPipelines}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(failedPipelines / pipelines.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Duration</span>
                  <span className="font-semibold text-gray-900">6m 45s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Deployment Frequency</span>
                  <span className="font-semibold text-gray-900">8.5 per day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lead Time</span>
                  <span className="font-semibold text-gray-900">2.1 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">MTTR</span>
                  <span className="font-semibold text-gray-900">18 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Change Failure Rate</span>
                  <span className="font-semibold text-gray-900">5.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Pipeline Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Pipeline</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total Runs</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Success Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Frequency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Run</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map((pipeline) => (
                    <tr key={pipeline.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{pipeline.name}</p>
                          <p className="text-sm text-gray-500">{pipeline.repository.split('/').pop()}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{pipeline.metrics.totalRuns}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            pipeline.metrics.successRate >= 90 ? 'text-emerald-600' :
                            pipeline.metrics.successRate >= 75 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {pipeline.metrics.successRate.toFixed(1)}%
                          </span>
                          {pipeline.metrics.successRate >= 90 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{pipeline.metrics.averageDuration}</td>
                      <td className="py-3 px-4 text-gray-900">{pipeline.metrics.deploymentFrequency}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {pipeline.lastRun ? new Date(pipeline.lastRun).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trend Chart Placeholder */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Trends (Last 30 Days)</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Trend chart visualization would be displayed here</p>
                <p className="text-sm text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}