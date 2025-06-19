import React, { useState } from 'react';
import {
  X,
  Play,
  Shield,
  Package,
  Bug,
  Code,
  Server,
  Database,
  Globe,
  Target,
  Settings,
  Clock,
  Zap
} from 'lucide-react';

interface SecurityScanModalProps {
  scanners: any[];
  onClose: () => void;
  onStartScan: (config: any) => void;
}

export default function SecurityScanModal({ scanners, onClose, onStartScan }: SecurityScanModalProps) {
  const [selectedScanner, setSelectedScanner] = useState('');
  const [scanConfig, setScanConfig] = useState({
    name: '',
    target: '',
    type: 'container',
    options: {
      severity: ['critical', 'high'],
      includeSecrets: true,
      includeLicenses: false,
      timeout: 30
    }
  });

  const scanTypes = [
    { value: 'container', label: 'Container Image', icon: Package, description: 'Scan Docker images for vulnerabilities' },
    { value: 'code', label: 'Source Code', icon: Code, description: 'Static analysis of source code' },
    { value: 'web', label: 'Web Application', icon: Globe, description: 'Dynamic web application security testing' },
    { value: 'infrastructure', label: 'Infrastructure', icon: Server, description: 'Infrastructure as Code scanning' },
    { value: 'database', label: 'Database', icon: Database, description: 'Database security assessment' }
  ];

  const severityOptions = [
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-gray-600' }
  ];

  const handleScannerChange = (scannerId: string) => {
    setSelectedScanner(scannerId);
    const scanner = scanners.find(s => s.id === scannerId);
    if (scanner) {
      setScanConfig(prev => ({
        ...prev,
        name: `${scanner.name} - ${new Date().toLocaleString()}`
      }));
    }
  };

  const handleStartScan = () => {
    if (!selectedScanner || !scanConfig.target) {
      return;
    }

    const scanner = scanners.find(s => s.id === selectedScanner);
    onStartScan({
      ...scanConfig,
      scanner: scanner.type,
      scannerId: selectedScanner
    });
  };

  const selectedScannerData = scanners.find(s => s.id === selectedScanner);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Start Security Scan</h2>
            <p className="text-gray-600">Configure and launch a comprehensive security scan</p>
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
          <div className="space-y-6">
            {/* Scanner Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Scanner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanners.filter(s => s.status === 'active').map((scanner) => {
                  const ScannerIcon = scanner.type === 'trivy' ? Package :
                                     scanner.type === 'owasp' ? Shield :
                                     scanner.type === 'bandit' ? Bug :
                                     scanner.type === 'snyk' ? Zap :
                                     scanner.type === 'sonarqube' ? Code :
                                     Shield;
                  
                  return (
                    <div
                      key={scanner.id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedScanner === scanner.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleScannerChange(scanner.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedScanner === scanner.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <ScannerIcon className={`w-5 h-5 ${
                            selectedScanner === scanner.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{scanner.name}</h4>
                          <p className="text-sm text-gray-600">{scanner.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scan Configuration */}
            {selectedScanner && (
              <>
                {/* Basic Configuration */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scan Name</label>
                      <input
                        type="text"
                        value={scanConfig.name}
                        onChange={(e) => setScanConfig(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter scan name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                      <input
                        type="text"
                        value={scanConfig.target}
                        onChange={(e) => setScanConfig(prev => ({ ...prev, target: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={
                          scanConfig.type === 'container' ? 'nginx:latest' :
                          scanConfig.type === 'code' ? '/path/to/source' :
                          scanConfig.type === 'web' ? 'https://example.com' :
                          'Target to scan'
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Scan Type */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {scanTypes.map((type) => {
                      const TypeIcon = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            scanConfig.type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setScanConfig(prev => ({ ...prev, type: type.value }))}
                        >
                          <div className="text-center">
                            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                              scanConfig.type === type.value ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <TypeIcon className={`w-6 h-6 ${
                                scanConfig.type === type.value ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{type.label}</h4>
                            <p className="text-xs text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Advanced Options */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Options</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    {/* Severity Levels */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Severity Levels</label>
                      <div className="flex flex-wrap gap-2">
                        {severityOptions.map((severity) => (
                          <label key={severity.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={scanConfig.options.severity.includes(severity.value)}
                              onChange={(e) => {
                                const newSeverity = e.target.checked
                                  ? [...scanConfig.options.severity, severity.value]
                                  : scanConfig.options.severity.filter(s => s !== severity.value);
                                setScanConfig(prev => ({
                                  ...prev,
                                  options: { ...prev.options, severity: newSeverity }
                                }));
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={`text-sm font-medium ${severity.color}`}>
                              {severity.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={scanConfig.options.includeSecrets}
                            onChange={(e) => setScanConfig(prev => ({
                              ...prev,
                              options: { ...prev.options, includeSecrets: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Include secret scanning</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={scanConfig.options.includeLicenses}
                            onChange={(e) => setScanConfig(prev => ({
                              ...prev,
                              options: { ...prev.options, includeLicenses: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Include license scanning</span>
                        </label>
                      </div>
                    </div>

                    {/* Timeout */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={scanConfig.options.timeout}
                        onChange={(e) => setScanConfig(prev => ({
                          ...prev,
                          options: { ...prev.options, timeout: parseInt(e.target.value) }
                        }))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Scanner Info */}
                {selectedScannerData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Scanner Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Version:</span>
                        <span className="ml-2 text-blue-900">{selectedScannerData.version || 'Latest'}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Last Update:</span>
                        <span className="ml-2 text-blue-900">{selectedScannerData.lastUpdate || 'Today'}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Database:</span>
                        <span className="ml-2 text-blue-900">{selectedScannerData.database || 'Up to date'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
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
            onClick={handleStartScan}
            disabled={!selectedScanner || !scanConfig.target || !scanConfig.name}
            className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
}