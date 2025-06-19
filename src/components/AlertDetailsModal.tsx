import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  MessageSquare,
  Bell,
  Target
} from 'lucide-react';
import { monitoringService } from '../services/monitoringService';

interface AlertDetailsModalProps {
  alertId: string;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string, resolution: string) => void;
}

export default function AlertDetailsModal({ 
  alertId, 
  onClose, 
  onAcknowledge, 
  onResolve 
}: AlertDetailsModalProps) {
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAlertDetails();
  }, [alertId]);

  const loadAlertDetails = async () => {
    try {
      const data = await monitoringService.getAlertDetails(alertId);
      setAlert(data);
    } catch (error) {
      console.error('Failed to load alert details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = () => {
    if (resolution.trim()) {
      onResolve(alertId, resolution);
      onClose();
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: AlertTriangle },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp }
  ];

  if (loading || !alert) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getSeverityColor(alert.severity)}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{alert.title}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">{alert.service}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              {alert.status === 'active' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onAcknowledge(alertId)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Acknowledge Alert
                    </button>
                    <button
                      onClick={() => setActiveTab('resolve')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Resolve Alert
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{alert.description}</p>
              </div>

              {/* Alert Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Alert Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Service:</span>
                      <span className="font-medium text-blue-900">{alert.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Severity:</span>
                      <span className="font-medium text-blue-900 capitalize">{alert.severity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Status:</span>
                      <span className="font-medium text-blue-900 capitalize">{alert.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Duration:</span>
                      <span className="font-medium text-blue-900">{alert.duration || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">Metric Details</h4>
                  {alert.metrics ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Current Value:</span>
                        <span className="font-medium text-purple-900">{alert.metrics.current}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Threshold:</span>
                        <span className="font-medium text-purple-900">{alert.metrics.threshold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Condition:</span>
                        <span className="font-medium text-purple-900">{alert.metrics.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Duration:</span>
                        <span className="font-medium text-purple-900">{alert.metrics.duration}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-purple-700">No metric data available</p>
                  )}
                </div>
              </div>

              {/* Resolution */}
              {alert.status === 'active' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Resolve Alert</h3>
                  <div className="space-y-3">
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe how this alert was resolved..."
                    />
                    <button
                      onClick={handleResolve}
                      disabled={!resolution.trim()}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Alert Timeline</h3>
              <div className="space-y-4">
                {alert.timeline?.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.type === 'triggered' ? 'bg-red-100' :
                      event.type === 'acknowledged' ? 'bg-yellow-100' :
                      event.type === 'resolved' ? 'bg-emerald-100' :
                      'bg-gray-100'
                    }`}>
                      {event.type === 'triggered' ? <Bell className="w-4 h-4 text-red-600" /> :
                       event.type === 'acknowledged' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                       event.type === 'resolved' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                       <Activity className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{event.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {event.user && (
                          <>
                            <span className="text-sm text-gray-500">{event.user}</span>
                            <span className="text-sm text-gray-400">•</span>
                          </>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No timeline events available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Related Metrics</h3>
              {alert.relatedMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {alert.relatedMetrics.map((metric, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        <span className="text-sm text-gray-500">{metric.unit}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium text-gray-900">{metric.current}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average:</span>
                          <span className="font-medium text-gray-900">{metric.average}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trend:</span>
                          <div className={`flex items-center space-x-1 ${
                            metric.trend > 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                            {metric.trend > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="font-medium">{Math.abs(metric.trend)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No related metrics available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}