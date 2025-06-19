import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Play,
  Download,
  Eye,
  GitBranch,
  Package,
  Bug,
  Zap,
  Clock,
  RefreshCw,
  Settings,
  Target,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ExternalLink,
  Copy,
  MoreVertical,
  Pause,
  RotateCcw,
  Database,
  Globe,
  Code,
  Server
} from 'lucide-react';
import { securityService } from '../services/securityService';
import VulnerabilityDetailsModal from './VulnerabilityDetailsModal';
import SecurityScanModal from './SecurityScanModal';
import SecurityReportModal from './SecurityReportModal';
import toast from 'react-hot-toast';

export default function SecurityScanner() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [scanners, setScanners] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVulnerability, setSelectedVulnerability] = useState<string | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    scanner: 'all',
    search: ''
  });

  useEffect(() => {
    loadSecurityData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const [vulnRes, scansRes, scannersRes, metricsRes] = await Promise.all([
        securityService.getVulnerabilities(filters),
        securityService.getScans(),
        securityService.getScanners(),
        securityService.getMetrics()
      ]);

      setVulnerabilities(vulnRes.vulnerabilities);
      setScans(scansRes.scans);
      setScanners(scannersRes.scanners);
      setMetrics(metricsRes);
    } catch (error) {
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartScan = async (scanConfig: any) => {
    try {
      const result = await securityService.startScan(scanConfig);
      toast.success(`${scanConfig.scanner} scan started successfully`);
      setShowScanModal(false);
      loadSecurityData();
    } catch (error) {
      toast.error('Failed to start security scan');
    }
  };

  const handleStopScan = async (scanId: string) => {
    try {
      await securityService.stopScan(scanId);
      toast.success('Scan stopped successfully');
      loadSecurityData();
    } catch (error) {
      toast.error('Failed to stop scan');
    }
  };

  const handleUpdateVulnerability = async (id: string, updates: any) => {
    try {
      await securityService.updateVulnerability(id, updates);
      toast.success('Vulnerability updated successfully');
      loadSecurityData();
    } catch (error) {
      toast.error('Failed to update vulnerability');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSeverity = filters.severity === 'all' || vuln.severity === filters.severity;
    const matchesStatus = filters.status === 'all' || vuln.status === filters.status;
    const matchesScanner = filters.scanner === 'all' || vuln.scanner === filters.scanner;
    const matchesSearch = vuln.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         vuln.package.toLowerCase().includes(filters.search.toLowerCase()) ||
                         vuln.cve?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSeverity && matchesStatus && matchesScanner && matchesSearch;
  });

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    false_positive: 'bg-gray-100 text-gray-800'
  };

  const scannerIcons = {
    trivy: Package,
    owasp: Shield,
    bandit: Bug,
    snyk: Zap,
    sonarqube: Code,
    clair: Database,
    anchore: Server
  };

  const getScannerIcon = (scanner: string) => {
    return scannerIcons[scanner] || Shield;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return RefreshCw;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'stopped': return Pause;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Security Scan Monitoring</h1>
          <p className="text-gray-600 text-lg">Comprehensive vulnerability scanning and security monitoring across your infrastructure</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Security Report</span>
          </button>
          <button
            onClick={() => setShowScanModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start Scan</span>
          </button>
          <button
            onClick={loadSecurityData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Security Overview Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{metrics.critical}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {metrics.criticalTrend > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              )}
              <span className={metrics.criticalTrend > 0 ? 'text-red-600' : 'text-emerald-600'}>
                {Math.abs(metrics.criticalTrend)}% from last week
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.high}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {metrics.highTrend > 0 ? (
                <TrendingUp className="w-4 h-4 text-orange-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              )}
              <span className={metrics.highTrend > 0 ? 'text-orange-600' : 'text-emerald-600'}>
                {Math.abs(metrics.highTrend)}% from last week
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-emerald-600">{metrics.securityScore}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600">+{metrics.scoreImprovement}% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Scans</p>
                <p className="text-2xl font-bold text-blue-600">{scans.filter(s => s.status === 'running').length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{scans.filter(s => s.status === 'completed').length} completed today</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.resolved}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <span className="text-gray-600">Avg resolution: {metrics.avgResolutionTime}</span>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Status */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Security Scanners</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live monitoring</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scanners.map((scanner) => {
            const ScannerIcon = getScannerIcon(scanner.type);
            return (
              <div key={scanner.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    scanner.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'
                  }`}>
                    <ScannerIcon className={`w-5 h-5 ${
                      scanner.status === 'active' ? 'text-emerald-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{scanner.name}</h3>
                    <p className="text-sm text-gray-500">{scanner.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Scan</span>
                    <span className="text-gray-900">{scanner.lastScan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Targets</span>
                    <span className="text-gray-900">{scanner.targets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      scanner.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      scanner.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {scanner.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Scans */}
      {scans.filter(s => s.status === 'running').length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Active Scans</h2>
            <span className="text-sm text-gray-600">
              {scans.filter(s => s.status === 'running').length} running
            </span>
          </div>
          <div className="space-y-4">
            {scans.filter(s => s.status === 'running').map((scan) => {
              const ScannerIcon = getScannerIcon(scan.scanner);
              return (
                <div key={scan.id} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ScannerIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{scan.name}</h3>
                        <p className="text-sm text-gray-600">{scan.target}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-blue-900">{scan.progress}%</span>
                      <button
                        onClick={() => handleStopScan(scan.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scan.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                    <span>Started: {new Date(scan.startedAt).toLocaleTimeString()}</span>
                    <span>ETA: {scan.eta}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vulnerabilities, CVEs, packages..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.scanner}
              onChange={(e) => handleFilterChange('scanner', e.target.value)}
            >
              <option value="all">All Scanners</option>
              {scanners.map(scanner => (
                <option key={scanner.id} value={scanner.type}>{scanner.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Showing {filteredVulnerabilities.length} of {vulnerabilities.length} vulnerabilities
            </span>
          </div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Vulnerability Details</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredVulnerabilities.map((vuln) => {
            const ScannerIcon = getScannerIcon(vuln.scanner);
            return (
              <div key={vuln.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${severityColors[vuln.severity]}`}>
                        {vuln.severity.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ScannerIcon className="w-4 h-4" />
                        <span>{vuln.scanner.toUpperCase()}</span>
                      </div>
                      {vuln.cve && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">CVE:</span>
                          <span className="text-xs font-mono text-blue-600">{vuln.cve}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(vuln.cve)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[vuln.status]}`}>
                        {vuln.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{vuln.title}</h3>
                    <p className="text-gray-600 mb-3 text-sm">{vuln.description}</p>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Package:</span>
                        <span className="font-mono text-gray-900">{vuln.package}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">Version:</span>
                        <span className="font-mono text-gray-900">{vuln.version}</span>
                      </div>
                      {vuln.fixedVersion && (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">Fixed in:</span>
                          <span className="font-mono text-emerald-600">{vuln.fixedVersion}</span>
                        </div>
                      )}
                      {vuln.cvssScore && (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">CVSS:</span>
                          <span className={`font-semibold ${
                            vuln.cvssScore >= 9 ? 'text-red-600' :
                            vuln.cvssScore >= 7 ? 'text-orange-600' :
                            vuln.cvssScore >= 4 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {vuln.cvssScore}
                          </span>
                        </div>
                      )}
                    </div>
                    {vuln.assignee && (
                      <div className="flex items-center space-x-2 mt-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Assigned to:</span>
                        <span className="text-sm font-medium text-gray-900">{vuln.assignee}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedVulnerability(vuln.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Scan History */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Scan History</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {scans.slice(0, 5).map((scan) => {
            const ScannerIcon = getScannerIcon(scan.scanner);
            const StatusIcon = getStatusIcon(scan.status);
            return (
              <div key={scan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ScannerIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{scan.name}</p>
                    <p className="text-sm text-gray-600">{scan.target}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{scan.duration}</p>
                    <p className="text-xs text-gray-500">{new Date(scan.completedAt || scan.startedAt).toLocaleString()}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    scan.status === 'completed' ? 'bg-emerald-100' :
                    scan.status === 'failed' ? 'bg-red-100' :
                    scan.status === 'running' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <StatusIcon className={`w-3 h-3 ${
                      scan.status === 'completed' ? 'text-emerald-600' :
                      scan.status === 'failed' ? 'text-red-600' :
                      scan.status === 'running' ? 'text-blue-600 animate-spin' :
                      'text-gray-600'
                    }`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {selectedVulnerability && (
        <VulnerabilityDetailsModal
          vulnerabilityId={selectedVulnerability}
          onClose={() => setSelectedVulnerability(null)}
          onUpdate={handleUpdateVulnerability}
        />
      )}

      {showScanModal && (
        <SecurityScanModal
          scanners={scanners}
          onClose={() => setShowScanModal(false)}
          onStartScan={handleStartScan}
        />
      )}

      {showReportModal && (
        <SecurityReportModal
          vulnerabilities={vulnerabilities}
          metrics={metrics}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}