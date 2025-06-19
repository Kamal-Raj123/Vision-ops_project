import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Terminal,
  Settings,
  Edit,
  RefreshCw,
  Copy,
  Eye,
  Package
} from 'lucide-react';
import { KubernetesNode } from '../types';
import { kubernetesService } from '../services/kubernetesService';
import toast from 'react-hot-toast';

interface NodeDetailsModalProps {
  nodeId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export default function NodeDetailsModal({ nodeId, onClose, onRefresh }: NodeDetailsModalProps) {
  const [node, setNode] = useState<KubernetesNode | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadNodeDetails();
    loadNodeMetrics();
  }, [nodeId]);

  const loadNodeDetails = async () => {
    try {
      const data = await kubernetesService.getNode(nodeId);
      setNode(data);
    } catch (error) {
      toast.error('Failed to load node details');
    } finally {
      setLoading(false);
    }
  };

  const loadNodeMetrics = async () => {
    try {
      const data = await kubernetesService.getNodeMetrics(nodeId);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load node metrics:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getConditionIcon = (status: string) => {
    switch (status) {
      case 'True':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'False':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading || !node) {
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Server },
    { id: 'conditions', label: 'Conditions', icon: Activity },
    { id: 'pods', label: 'Pods', icon: Package },
    { id: 'labels', label: 'Labels & Taints', icon: Settings },
    { id: 'system', label: 'System Info', icon: Terminal }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{node.name}</h2>
              <p className="text-gray-600">{node.role} • {node.version}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadNodeDetails();
                loadNodeMetrics();
              }}
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
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium capitalize ${
                        node.status === 'ready' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {node.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium text-gray-900">{node.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Architecture:</span>
                      <span className="font-medium text-gray-900">{node.architecture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">OS:</span>
                      <span className="font-medium text-gray-900">{node.os}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(node.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Addresses</h3>
                  <div className="space-y-3">
                    {node.addresses.map((addr, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600">{addr.type}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-gray-900">{addr.address}</span>
                          <button
                            onClick={() => copyToClipboard(addr.address)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Cpu className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{node.usage.cpu}%</p>
                    <p className="text-sm text-gray-600">CPU Usage</p>
                    <p className="text-xs text-gray-500 mt-1">{node.allocatable.cpu} available</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MemoryStick className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{node.usage.memory}%</p>
                    <p className="text-sm text-gray-600">Memory Usage</p>
                    <p className="text-xs text-gray-500 mt-1">{node.allocatable.memory} available</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <HardDrive className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{node.usage.storage}%</p>
                    <p className="text-sm text-gray-600">Storage Usage</p>
                    <p className="text-xs text-gray-500 mt-1">{node.allocatable.storage} available</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{node.usage.pods}</p>
                    <p className="text-sm text-gray-600">Running Pods</p>
                    <p className="text-xs text-gray-500 mt-1">{node.capacity.pods} capacity</p>
                  </div>
                </div>
              </div>

              {/* Capacity vs Allocatable */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Capacity</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-600">Resource</th>
                        <th className="text-left py-2 text-gray-600">Capacity</th>
                        <th className="text-left py-2 text-gray-600">Allocatable</th>
                        <th className="text-left py-2 text-gray-600">Usage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">CPU</td>
                        <td className="py-2">{node.capacity.cpu}</td>
                        <td className="py-2">{node.allocatable.cpu}</td>
                        <td className="py-2">{node.usage.cpu}%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">Memory</td>
                        <td className="py-2">{node.capacity.memory}</td>
                        <td className="py-2">{node.allocatable.memory}</td>
                        <td className="py-2">{node.usage.memory}%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">Storage</td>
                        <td className="py-2">{node.capacity.storage}</td>
                        <td className="py-2">{node.allocatable.storage}</td>
                        <td className="py-2">{node.usage.storage}%</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Pods</td>
                        <td className="py-2">{node.capacity.pods}</td>
                        <td className="py-2">{node.allocatable.pods}</td>
                        <td className="py-2">{node.usage.pods}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Node Conditions</h3>
              {node.conditions.map((condition, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getConditionIcon(condition.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{condition.type}</h4>
                        <p className="text-sm text-gray-600 mt-1">{condition.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Reason: {condition.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        condition.status === 'True' ? 'bg-emerald-100 text-emerald-800' :
                        condition.status === 'False' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {condition.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(condition.lastTransition).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pods' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Running Pods ({node.pods.length})</h3>
              {node.pods.length > 0 ? (
                <div className="space-y-3">
                  {node.pods.map((pod, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{pod.name}</h4>
                          <p className="text-sm text-gray-600">Namespace: {pod.namespace}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            pod.status === 'Running' ? 'bg-emerald-100 text-emerald-800' :
                            pod.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {pod.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Restarts: {pod.restarts} • Age: {pod.age}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No pods running on this node</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="space-y-6">
              {/* Labels */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Labels</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(node.labels).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <span className="font-mono text-sm text-gray-700">{key}</span>
                        <span className="font-mono text-sm text-gray-900">{value || '<none>'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Taints */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Taints</h3>
                {node.taints.length > 0 ? (
                  <div className="space-y-3">
                    {node.taints.map((taint, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm text-gray-900">{taint.key}</p>
                            {taint.value && (
                              <p className="font-mono text-xs text-gray-600 mt-1">Value: {taint.value}</p>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            {taint.effect}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No taints configured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Node Info</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Machine ID:</span>
                      <span className="font-mono text-sm text-gray-900">{node.nodeInfo.machineID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">System UUID:</span>
                      <span className="font-mono text-sm text-gray-900">{node.nodeInfo.systemUUID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boot ID:</span>
                      <span className="font-mono text-sm text-gray-900">{node.nodeInfo.bootID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kernel Version:</span>
                      <span className="font-mono text-sm text-gray-900">{node.nodeInfo.kernelVersion}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Kubernetes Components</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kubelet:</span>
                      <span className="font-mono text-sm text-gray-900">{node.nodeInfo.kubeletVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kube Proxy:</span>
                      <span className="font-mono text-sm text-gray-900">{node.nodeInfo.kubeProxyVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Container Runtime:</span>
                      <span className="font-mono text-sm text-gray-900">{node.nodeInfo.containerRuntimeVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">OS Image:</span>
                      <span className="font-mono text-sm text-gray-900">{node.nodeInfo.osImage}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Metrics */}
              {metrics && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Network Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Network className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatBytes(metrics.network.rxBytes)}</p>
                      <p className="text-sm text-gray-600">Bytes Received</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Network className="w-8 h-8 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatBytes(metrics.network.txBytes)}</p>
                      <p className="text-sm text-gray-600">Bytes Transmitted</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}