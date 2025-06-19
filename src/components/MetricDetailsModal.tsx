import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { monitoringService } from '../services/monitoringService';

interface MetricDetailsModalProps {
  metricId: string;
  timeRange: string;
  onClose: () => void;
}

export default function MetricDetailsModal({ metricId, timeRange, onClose }: MetricDetailsModalProps) {
  const [metricData, setMetricData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('chart');

  useEffect(() => {
    loadMetricDetails();
  }, [metricId, timeRange]);

  const loadMetricDetails = async () => {
    try {
      const data = await monitoringService.getMetricDetails(metricId, timeRange);
      setMetricData(data);
    } catch (error) {
      console.error('Failed to load metric details:', error);
    } finally {
      setLoading(false);
    }
  };

  const views = [
    { id: 'chart', label: 'Time Series', icon: LineChart },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'alerts', label: 'Alert Rules', icon: AlertTriangle }
  ];

  if (loading || !metricData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{metricData.name} Details</h2>
            <p className="text-gray-600">{metricData.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadMetricDetails}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === view.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <view.icon className="w-4 h-4" />
                <span>{view.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {selectedView === 'chart' && (
            <div className="space-y-6">
              {/* Current Value */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Current Value</h3>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {metricData.currentValue} {metricData.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${
                      metricData.trend > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {metricData.trend > 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      <span className="font-semibold">{Math.abs(metricData.trend)}%</span>
                    </div>
                    <p className="text-sm text-blue-700">vs previous period</p>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Time Series Chart</h4>
                <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would be displayed here</p>
                    <p className="text-sm text-gray-400">Integration with charting library needed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 rounded-xl p-6">
                  <h4 className="font-semibold text-emerald-900 mb-2">Average</h4>
                  <p className="text-2xl font-bold text-emerald-900">
                    {metricData.statistics.average} {metricData.unit}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Maximum</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {metricData.statistics.maximum} {metricData.unit}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="font-semibold text-purple-900 mb-2">Minimum</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {metricData.statistics.minimum} {metricData.unit}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Statistical Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">95th Percentile</span>
                      <span className="font-medium">{metricData.statistics.p95} {metricData.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">99th Percentile</span>
                      <span className="font-medium">{metricData.statistics.p99} {metricData.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standard Deviation</span>
                      <span className="font-medium">{metricData.statistics.stdDev} {metricData.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Points</span>
                      <span className="font-medium">{metricData.statistics.dataPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Range</span>
                      <span className="font-medium">{timeRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">{new Date(metricData.lastUpdated).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Alert Rules</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Alert Rule
                </button>
              </div>

              {metricData.alertRules && metricData.alertRules.length > 0 ? (
                <div className="space-y-4">
                  {metricData.alertRules.map((rule, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rule.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Condition:</span>
                          <span className="ml-2 font-medium">{rule.condition}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Threshold:</span>
                          <span className="ml-2 font-medium">{rule.threshold} {metricData.unit}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Severity:</span>
                          <span className={`ml-2 font-medium ${
                            rule.severity === 'critical' ? 'text-red-600' :
                            rule.severity === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {rule.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Alert Rules</h3>
                  <p className="text-gray-600">Create alert rules to get notified when this metric exceeds thresholds.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}