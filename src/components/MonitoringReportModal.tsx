import React, { useState } from 'react';
import {
  X,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  CheckCircle,
  AlertTriangle,
  Server,
  Database,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';

interface MonitoringReportModalProps {
  metrics: any;
  alerts: any[];
  services: any[];
  infrastructure: any;
  onClose: () => void;
}

export default function MonitoringReportModal({ 
  metrics, 
  alerts, 
  services, 
  infrastructure, 
  onClose 
}: MonitoringReportModalProps) {
  const [reportConfig, setReportConfig] = useState({
    format: 'pdf',
    timeRange: '7d',
    includeAlerts: true,
    includePerformance: true,
    includeInfrastructure: true,
    includeServices: true,
    includeRecommendations: true
  });

  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      // In a real implementation, this would trigger a download
      const blob = new Blob(['Mock Monitoring Report Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monitoring-report-${new Date().toISOString().split('T')[0]}.${reportConfig.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    }, 3000);
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF Report', description: 'Comprehensive PDF document' },
    { value: 'html', label: 'HTML Report', description: 'Interactive web report' },
    { value: 'json', label: 'JSON Data', description: 'Raw data export' },
    { value: 'csv', label: 'CSV Export', description: 'Spreadsheet format' }
  ];

  const timeRanges = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monitoring Report Generator</h2>
            <p className="text-gray-600">Generate comprehensive monitoring reports and analytics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
                
                {/* Format Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Report Format</label>
                  <div className="grid grid-cols-1 gap-3">
                    {formatOptions.map((format) => (
                      <div
                        key={format.value}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          reportConfig.format === format.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setReportConfig(prev => ({ ...prev, format: format.value }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{format.label}</h4>
                            <p className="text-sm text-gray-600">{format.description}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            reportConfig.format === format.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {reportConfig.format === format.value && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                  <select
                    value={reportConfig.timeRange}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, timeRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {timeRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Report Sections */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Include Sections</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeAlerts}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeAlerts: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Alerts & Incidents</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reportConfig.includePerformance}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includePerformance: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Performance Metrics</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeInfrastructure}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeInfrastructure: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Infrastructure Status</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeServices}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeServices: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Service Health</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeRecommendations}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Recommendations</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
                
                {/* System Overview Preview */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    System Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{Math.round(metrics?.system.cpu.value || 0)}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <MemoryStick className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">{Math.round(metrics?.system.memory.value || 0)}%</p>
                    </div>
                  </div>
                </div>

                {/* Alerts Preview */}
                {reportConfig.includeAlerts && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Alerts Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Critical Alerts</span>
                        <span className="text-sm font-medium text-red-600">
                          {alerts.filter(a => a.severity === 'critical').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Warning Alerts</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {alerts.filter(a => a.severity === 'warning').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Info Alerts</span>
                        <span className="text-sm font-medium text-blue-600">
                          {alerts.filter(a => a.severity === 'info').length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Services Preview */}
                {reportConfig.includeServices && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Service Health
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Healthy Services</span>
                        <span className="text-sm font-medium text-emerald-600">
                          {services.filter(s => s.status === 'healthy').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Degraded Services</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {services.filter(s => s.status === 'warning').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Critical Services</span>
                        <span className="text-sm font-medium text-red-600">
                          {services.filter(s => s.status === 'critical').length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Metadata */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Report Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Generated:</span>
                      <span className="text-blue-900">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Time Range:</span>
                      <span className="text-blue-900">{timeRanges.find(r => r.value === reportConfig.timeRange)?.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Format:</span>
                      <span className="text-blue-900 uppercase">{reportConfig.format}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Sections:</span>
                      <span className="text-blue-900">{
                        [
                          reportConfig.includeAlerts && 'Alerts',
                          reportConfig.includePerformance && 'Performance',
                          reportConfig.includeInfrastructure && 'Infrastructure',
                          reportConfig.includeServices && 'Services',
                          reportConfig.includeRecommendations && 'Recommendations'
                        ].filter(Boolean).join(', ')
                      }</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}