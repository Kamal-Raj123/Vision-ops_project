import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Users,
  Clock
} from 'lucide-react';

interface SecurityReportModalProps {
  vulnerabilities: any[];
  metrics: any;
  onClose: () => void;
}

export default function SecurityReportModal({ vulnerabilities, metrics, onClose }: SecurityReportModalProps) {
  const [reportConfig, setReportConfig] = useState({
    format: 'pdf',
    timeRange: '30d',
    includeResolved: false,
    includeTrends: true,
    includeRecommendations: true,
    sections: {
      executive: true,
      vulnerabilities: true,
      trends: true,
      compliance: true,
      recommendations: true
    }
  });

  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      // In a real implementation, this would trigger a download
      const blob = new Blob(['Mock Security Report Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.${reportConfig.format}`;
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
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const getVulnerabilityStats = () => {
    const total = vulnerabilities.length;
    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;
    const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
    const low = vulnerabilities.filter(v => v.severity === 'low').length;
    const resolved = vulnerabilities.filter(v => v.status === 'resolved').length;
    
    return { total, critical, high, medium, low, resolved };
  };

  const stats = getVulnerabilityStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Security Report Generator</h2>
            <p className="text-gray-600">Generate comprehensive security reports and analytics</p>
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
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Include Sections</label>
                  <div className="space-y-3">
                    {Object.entries({
                      executive: 'Executive Summary',
                      vulnerabilities: 'Vulnerability Details',
                      trends: 'Security Trends',
                      compliance: 'Compliance Status',
                      recommendations: 'Recommendations'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={reportConfig.sections[key]}
                          onChange={(e) => setReportConfig(prev => ({
                            ...prev,
                            sections: { ...prev.sections, [key]: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Additional Options</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeResolved}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeResolved: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include resolved vulnerabilities</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeTrends}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeTrends: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include trend analysis</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reportConfig.includeRecommendations}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include AI recommendations</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
                
                {/* Executive Summary Preview */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Executive Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Security Score</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{metrics?.securityScore || 87}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Critical Issues</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                    </div>
                  </div>
                </div>

                {/* Vulnerability Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <PieChart className="w-4 h-4 mr-2" />
                    Vulnerability Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Critical</span>
                      <span className="text-sm font-medium text-red-600">{stats.critical}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">High</span>
                      <span className="text-sm font-medium text-orange-600">{stats.high}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Medium</span>
                      <span className="text-sm font-medium text-yellow-600">{stats.medium}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Low</span>
                      <span className="text-sm font-medium text-gray-600">{stats.low}</span>
                    </div>
                  </div>
                </div>

                {/* Trends Preview */}
                {reportConfig.includeTrends && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Security Trends
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Vulnerabilities Resolved</span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-600">+15%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Mean Time to Resolution</span>
                        <div className="flex items-center space-x-1">
                          <TrendingDown className="w-3 h-3 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-600">-2.3 days</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Security Score</span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-600">+5%</span>
                        </div>
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
                      <span className="text-blue-700">Total Vulnerabilities:</span>
                      <span className="text-blue-900">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Format:</span>
                      <span className="text-blue-900 uppercase">{reportConfig.format}</span>
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