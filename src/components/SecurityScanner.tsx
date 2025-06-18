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
  Clock
} from 'lucide-react';
import { useVulnerabilities } from '../hooks/useApi';

export default function SecurityScanner() {
  const { vulnerabilities, loading, runSecurityScan, refetch } = useVulnerabilities();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedScanner, setSelectedScanner] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);

  const filteredVulnerabilities = vulnerabilities.filter((vuln: any) => {
    const matchesSeverity = selectedSeverity === 'all' || vuln.severity === selectedSeverity;
    const matchesScanner = selectedScanner === 'all' || vuln.scanner === selectedScanner;
    const matchesSearch = vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vuln.package?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesScanner && matchesSearch;
  });

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const scannerIcons = {
    trivy: Package,
    owasp: Shield,
    bandit: Bug
  };

  const criticalCount = vulnerabilities.filter((v: any) => v.severity === 'critical').length;
  const highCount = vulnerabilities.filter((v: any) => v.severity === 'high').length;
  const mediumCount = vulnerabilities.filter((v: any) => v.severity === 'medium').length;
  const lowCount = vulnerabilities.filter((v: any) => v.severity === 'low').length;

  const handleRunScan = async (type: string, target: string) => {
    setScanning(true);
    try {
      await runSecurityScan(type, target);
      setTimeout(() => {
        refetch();
        setScanning(false);
      }, 10000); // Wait for scan to complete
    } catch (error) {
      console.error('Failed to run security scan:', error);
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Scanner</h1>
          <p className="text-gray-600">Comprehensive vulnerability scanning across your infrastructure</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleRunScan('trivy', 'all-containers')}
            disabled={scanning}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{scanning ? 'Scanning...' : 'Run Full Scan'}</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{criticalCount}</p>
              <p className="text-sm text-gray-500 mt-1">Immediate attention required</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{highCount}</p>
              <p className="text-sm text-gray-500 mt-1">Schedule for next sprint</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium Risk</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{mediumCount}</p>
              <p className="text-sm text-gray-500 mt-1">Monitor and plan fixes</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Risk</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{lowCount}</p>
              <p className="text-sm text-gray-500 mt-1">Address when convenient</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Trivy Scanner</h3>
              <p className="text-sm text-gray-500">Container & dependency scanning</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Scan</span>
              <span className="text-gray-900">2 hours ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Images Scanned</span>
              <span className="text-gray-900">42</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">OWASP ZAP</h3>
              <p className="text-sm text-gray-500">Web application security testing</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Scan</span>
              <span className="text-gray-900">1 day ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Endpoints Tested</span>
              <span className="text-gray-900">157</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Scheduled</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bandit</h3>
              <p className="text-sm text-gray-500">Python code security analysis</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Scan</span>
              <span className="text-gray-900">30 minutes ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Files Analyzed</span>
              <span className="text-gray-900">89</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vulnerabilities..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedScanner}
              onChange={(e) => setSelectedScanner(e.target.value)}
            >
              <option value="all">All Scanners</option>
              <option value="trivy">Trivy</option>
              <option value="owasp">OWASP ZAP</option>
              <option value="bandit">Bandit</option>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vulnerability Details</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredVulnerabilities.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Vulnerabilities Found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedSeverity !== 'all' || selectedScanner !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Your system appears to be secure. Run a security scan to check for new vulnerabilities.'
                }
              </p>
            </div>
          ) : (
            filteredVulnerabilities.map((vuln: any) => {
              const ScannerIcon = scannerIcons[vuln.scanner as keyof typeof scannerIcons] || Package;
              return (
                <div key={vuln.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${severityColors[vuln.severity as keyof typeof severityColors]}`}>
                          {vuln.severity.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <ScannerIcon className="w-4 h-4" />
                          <span>{vuln.scanner.toUpperCase()}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{vuln.title}</h3>
                      <p className="text-gray-600 mb-3 text-sm">{vuln.description}</p>
                      <div className="flex items-center space-x-6 text-sm">
                        {vuln.package && (
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Package:</span>
                            <span className="font-mono text-gray-900">{vuln.package}</span>
                          </div>
                        )}
                        {vuln.version && (
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-600">Version:</span>
                            <span className="font-mono text-gray-900">{vuln.version}</span>
                          </div>
                        )}
                        {vuln.fixed_version && (
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-600">Fixed in:</span>
                            <span className="font-mono text-emerald-600">{vuln.fixed_version}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                        Fix Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}