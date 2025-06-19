import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Settings,
  Activity,
  TestTube,
  Zap,
  Server,
  Shield,
  GitBranch,
  MessageSquare,
  Package,
  Eye,
  RefreshCw
} from 'lucide-react';
import { IntegrationConfig, TestResult } from '../services/integrationService';

interface IntegrationCardProps {
  integration: IntegrationConfig;
  onTest: (id: string) => Promise<TestResult>;
  onConfigure: (id: string) => void;
  onDeploy: (id: string) => Promise<any>;
  onViewMetrics: (id: string) => void;
}

const typeIcons = {
  ci_cd: GitBranch,
  monitoring: Activity,
  security: Shield,
  communication: MessageSquare,
  container: Package,
  orchestration: Server
};

const statusColors = {
  connected: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  disconnected: 'bg-gray-100 text-gray-800 border-gray-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  configuring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  testing: 'bg-blue-100 text-blue-800 border-blue-200'
};

const statusIcons = {
  connected: CheckCircle,
  disconnected: XCircle,
  error: AlertTriangle,
  configuring: Clock,
  testing: RefreshCw
};

export default function IntegrationCard({ 
  integration, 
  onTest, 
  onConfigure, 
  onDeploy, 
  onViewMetrics 
}: IntegrationCardProps) {
  const [testing, setTesting] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const TypeIcon = typeIcons[integration.type];
  const StatusIcon = statusIcons[integration.status];
  const isConnected = integration.status === 'connected';

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTest(integration.id);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        responseTime: 0,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await onDeploy(integration.id);
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isConnected ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            <TypeIcon className={`w-6 h-6 ${isConnected ? 'text-emerald-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{integration.name}</h3>
            <p className="text-sm text-gray-600 capitalize mb-2">
              {integration.type.replace('_', ' ')} • {integration.config.version || 'Latest'}
            </p>
            <div className="flex items-center space-x-2">
              <StatusIcon className={`w-4 h-4 ${
                integration.status === 'testing' ? 'animate-spin' : ''
              } ${
                isConnected ? 'text-emerald-500' : 
                integration.status === 'error' ? 'text-red-500' : 
                'text-gray-400'
              }`} />
              <span className={`text-sm font-medium px-3 py-1 rounded-full border ${statusColors[integration.status]}`}>
                {integration.status === 'configuring' ? 'Deploying...' : integration.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint */}
      {integration.endpoint && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Endpoint</p>
          <p className="text-sm font-mono text-gray-900 break-all">{integration.endpoint}</p>
        </div>
      )}

      {/* Metrics */}
      {integration.metrics && isConnected && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-emerald-50 rounded-xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-900">{integration.metrics.uptime}</p>
            <p className="text-xs text-emerald-600">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-900">{integration.metrics.requests?.toLocaleString()}</p>
            <p className="text-xs text-emerald-600">Requests</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-900">{integration.metrics.errors}</p>
            <p className="text-xs text-emerald-600">Errors</p>
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
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <p className={`text-sm font-medium ${
              testResult.success ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </p>
          </div>
          <p className="text-xs text-gray-600">
            Response time: {testResult.responseTime}ms
          </p>
          {testResult.details && (
            <div className="mt-2 text-xs text-gray-600">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Configuration Preview */}
      {isConnected && integration.config && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Configuration</h4>
          <div className="space-y-1">
            {Object.entries(integration.config).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-blue-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                </span>
                <span className="text-blue-900 font-mono">
                  {typeof value === 'string' && value.includes('***') ? value : 
                   typeof value === 'string' && value.length > 20 ? `${value.substring(0, 20)}...` : 
                   String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleTest}
          disabled={testing || integration.status === 'configuring'}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {testing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4" />
              <span>Test</span>
            </>
          )}
        </button>

        {!isConnected ? (
          <button
            onClick={handleDeploy}
            disabled={deploying || integration.status === 'configuring'}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {deploying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Deploy</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => onViewMetrics(integration.id)}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-xl font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Metrics</span>
          </button>
        )}
      </div>

      <div className="mt-2">
        <button
          onClick={() => onConfigure(integration.id)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Configure</span>
        </button>
      </div>

      {/* Last Sync */}
      {integration.metrics?.lastSync && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last sync: {new Date(integration.metrics.lastSync).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}