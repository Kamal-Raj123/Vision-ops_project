import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Server,
  Shield,
  GitBranch,
  Database,
  MessageSquare,
  Container,
  BarChart3,
  TestTube,
  ExternalLink,
  Cpu,
  HardDrive,
  Network,
  Users,
  FileText,
  Terminal
} from 'lucide-react';
import { integrationService, IntegrationConfig, TestResult } from '../services/integrationService';
import toast from 'react-hot-toast';

export default function IntegrationDashboard() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'ci_cd' | 'security' | 'communication'>('overview');

  useEffect(() => {
    loadIntegrations();
    // Run health checks every 30 seconds for connected integrations
    const interval = setInterval(runHealthChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadIntegrations = async () => {
    try {
      const allIntegrations = integrationService.getAllIntegrations();
      setIntegrations(allIntegrations);
    } catch (error) {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const runHealthChecks = async () => {
    try {
      const results = await integrationService.runHealthChecks();
      setTestResults(results);
      
      // Update integration statuses
      const updatedIntegrations = integrationService.getAllIntegrations();
      setIntegrations(updatedIntegrations);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const testIntegration = async (integrationId: string) => {
    setTestingIntegration(integrationId);
    try {
      const result = await integrationService.testConnection(integrationId);
      setTestResults(prev => new Map(prev.set(integrationId, result)));
      
      if (result.success) {
        toast.success(`${integrations.find(i => i.id === integrationId)?.name} connected successfully`);
      } else {
        toast.error(`${integrations.find(i => i.id === integrationId)?.name} connection failed`);
      }
      
      // Refresh integrations to get updated status
      await loadIntegrations();
    } catch (error) {
      toast.error(`Test failed: ${error}`);
    } finally {
      setTestingIntegration(null);
    }
  };

  const connectIntegration = async (integrationId: string) => {
    try {
      await integrationService.connectIntegration(integrationId);
      toast.success('Integration connected successfully');
      await loadIntegrations();
    } catch (error) {
      toast.error(`Connection failed: ${error}`);
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      await integrationService.disconnectIntegration(integrationId);
      toast.success('Integration disconnected');
      await loadIntegrations();
    } catch (error) {
      toast.error(`Disconnection failed: ${error}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'disconnected':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'configuring':
        return <Settings className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'testing':
        return <TestTube className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'configuring':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIntegrationIcon = (type: string, id: string) => {
    if (id === 'kubernetes') return Server;
    if (id === 'prometheus') return BarChart3;
    if (id === 'jenkins') return GitBranch;
    if (id === 'docker-registry') return Container;
    if (id === 'grafana') return Activity;
    if (id === 'trivy') return Shield;
    if (id === 'sonarqube') return FileText;
    if (id === 'slack') return MessageSquare;
    
    switch (type) {
      case 'orchestration':
        return Server;
      case 'monitoring':
        return Activity;
      case 'ci_cd':
        return GitBranch;
      case 'security':
        return Shield;
      case 'container':
        return Container;
      case 'communication':
        return MessageSquare;
      default:
        return Database;
    }
  };

  const getFilteredIntegrations = () => {
    if (activeTab === 'overview') return integrations;
    
    const typeMap = {
      monitoring: ['monitoring'],
      ci_cd: ['ci_cd'],
      security: ['security'],
      communication: ['communication']
    };
    
    return integrations.filter(integration => 
      typeMap[activeTab]?.includes(integration.type) || 
      (activeTab === 'monitoring' && ['orchestration', 'container'].includes(integration.type))
    );
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;
  const totalRequests = integrations.reduce((sum, i) => sum + (i.metrics?.requests || 0), 0);
  const totalErrors = integrations.reduce((sum, i) => sum + (i.metrics?.errors || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'monitoring', label: 'Monitoring', icon: BarChart3 },
    { id: 'ci_cd', label: 'CI/CD', icon: GitBranch },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'communication', label: 'Communication', icon: MessageSquare }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Integration Center</h1>
          <p className="text-gray-600 text-lg">Manage and monitor your DevSecOps tool integrations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runHealthChecks}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Health Check</span>
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors shadow-lg">
            <Zap className="w-5 h-5" />
            <span>Auto-Configure</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Services</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{connectedCount}</p>
              <p className="text-sm text-gray-500 mt-1">of {integrations.length} total</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Health Issues</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{errorCount}</p>
              <p className="text-sm text-gray-500 mt-1">require attention</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalRequests.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">across all services</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0.00'}%
              </p>
              <p className="text-sm text-gray-500 mt-1">{totalErrors} total errors</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Integration Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredIntegrations().map((integration) => {
              const Icon = getIntegrationIcon(integration.type, integration.id);
              const isConnected = integration.status === 'connected';
              const testResult = testResults.get(integration.id);
              
              return (
                <div
                  key={integration.id}
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    selectedIntegration === integration.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedIntegration(selectedIntegration === integration.id ? null : integration.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isConnected ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${isConnected ? 'text-emerald-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{integration.type.replace('_', ' ')}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusIcon(integration.status)}
                          <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getStatusColor(integration.status)}`}>
                            {integration.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {integration.endpoint && (
                      <button className="text-gray-400 hover:text-gray-600">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Metrics */}
                  {integration.metrics && isConnected && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{integration.metrics.uptime}</p>
                        <p className="text-xs text-gray-500">Uptime</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{integration.metrics.requests.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Requests</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{integration.metrics.errors}</p>
                        <p className="text-xs text-gray-500">Errors</p>
                      </div>
                    </div>
                  )}

                  {/* Test Result */}
                  {testResult && (
                    <div className={`mb-4 p-3 rounded-xl border ${
                      testResult.success 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {testResult.success ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          testResult.success ? 'text-emerald-800' : 'text-red-800'
                        }`}>
                          {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        testResult.success ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {testResult.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Response time: {testResult.responseTime}ms
                      </p>
                    </div>
                  )}

                  {/* Configuration Details */}
                  {selectedIntegration === integration.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration</h4>
                      <div className="space-y-2">
                        {Object.entries(integration.config).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </span>
                            <span className="text-gray-900 font-mono">
                              {typeof value === 'string' && value.includes('***') ? value : 
                               typeof value === 'string' && value.length > 20 ? `${value.substring(0, 20)}...` : 
                               typeof value === 'object' ? JSON.stringify(value).substring(0, 20) + '...' :
                               String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testIntegration(integration.id);
                      }}
                      disabled={testingIntegration === integration.id}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {testingIntegration === integration.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4" />
                          <span>Test</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        isConnected ? disconnectIntegration(integration.id) : connectIntegration(integration.id);
                      }}
                      className={`flex-1 px-3 py-2 rounded-xl font-medium transition-colors ${
                        isConnected
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const k8s = integrations.find(i => i.id === 'kubernetes');
              if (k8s?.status === 'connected') {
                toast.success('Kubernetes deployment initiated');
              } else {
                toast.error('Kubernetes not connected');
              }
            }}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <Server className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Deploy to K8s</p>
              <p className="text-sm text-gray-600">Deploy application to cluster</p>
            </div>
          </button>

          <button
            onClick={() => {
              const jenkins = integrations.find(i => i.id === 'jenkins');
              if (jenkins?.status === 'connected') {
                toast.success('Jenkins build triggered');
              } else {
                toast.error('Jenkins not connected');
              }
            }}
            className="flex items-center space-x-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            <GitBranch className="w-6 h-6 text-emerald-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Trigger Build</p>
              <p className="text-sm text-gray-600">Start CI/CD pipeline</p>
            </div>
          </div>

          <button
            onClick={() => {
              const trivy = integrations.find(i => i.id === 'trivy');
              if (trivy?.status === 'connected') {
                toast.success('Security scan initiated');
              } else {
                toast.error('Trivy scanner not connected');
              }
            }}
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <Shield className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Security Scan</p>
              <p className="text-sm text-gray-600">Run vulnerability scan</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}