import React, { useState, useEffect } from 'react';
import {
  Server,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Network,
  Terminal,
  Edit,
  Shield,
  Zap,
  Download,
  Upload,
  MoreVertical
} from 'lucide-react';
import { KubernetesNode, NodeDeploymentConfig } from '../types';
import { kubernetesService } from '../services/kubernetesService';
import NodeDetailsModal from './NodeDetailsModal';
import CreateNodeModal from './CreateNodeModal';
import toast from 'react-hot-toast';

export default function KubernetesNodes() {
  const [nodes, setNodes] = useState<KubernetesNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ready' | 'not-ready' | 'control-plane' | 'worker'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [clusterInfo, setClusterInfo] = useState<any>(null);

  useEffect(() => {
    loadNodes();
    loadClusterInfo();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadNodes();
      loadClusterInfo();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNodes = async () => {
    try {
      const data = await kubernetesService.getAllNodes();
      setNodes(data);
    } catch (error) {
      toast.error('Failed to load nodes');
    } finally {
      setLoading(false);
    }
  };

  const loadClusterInfo = async () => {
    try {
      const info = await kubernetesService.getClusterInfo();
      setClusterInfo(info);
    } catch (error) {
      console.error('Failed to load cluster info:', error);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm('Are you sure you want to delete this node? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await kubernetesService.deleteNode(nodeId);
      if (result.success) {
        toast.success(result.message);
        loadNodes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete node');
    }
  };

  const handleDrainNode = async (nodeId: string) => {
    try {
      const result = await kubernetesService.drainNode(nodeId);
      if (result.success) {
        toast.success(result.message);
        loadNodes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to drain node');
    }
  };

  const handleCordonNode = async (nodeId: string) => {
    try {
      const result = await kubernetesService.cordonNode(nodeId);
      if (result.success) {
        toast.success(result.message);
        loadNodes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to cordon node');
    }
  };

  const handleUncordonNode = async (nodeId: string) => {
    try {
      const result = await kubernetesService.uncordonNode(nodeId);
      if (result.success) {
        toast.success(result.message);
        loadNodes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to uncordon node');
    }
  };

  const statusIcons = {
    ready: CheckCircle,
    'not-ready': XCircle,
    deploying: Clock,
    terminating: AlertTriangle,
    error: XCircle
  };

  const statusColors = {
    ready: 'text-emerald-500 bg-emerald-100',
    'not-ready': 'text-red-500 bg-red-100',
    deploying: 'text-blue-500 bg-blue-100',
    terminating: 'text-yellow-500 bg-yellow-100',
    error: 'text-red-500 bg-red-100'
  };

  const filteredNodes = nodes.filter(node => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'ready' && node.status === 'ready') ||
      (filter === 'not-ready' && node.status !== 'ready') ||
      (filter === 'control-plane' && node.role === 'control-plane') ||
      (filter === 'worker' && node.role === 'worker');
    
    const matchesSearch = 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.addresses.some(addr => addr.address.includes(searchTerm));
    
    return matchesFilter && matchesSearch;
  });

  const getResourceUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const isNodeSchedulable = (node: KubernetesNode) => {
    return !node.taints.some(taint => taint.key === 'node.kubernetes.io/unschedulable');
  };

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Kubernetes Nodes</h1>
          <p className="text-gray-600 text-lg">Manage and monitor your Kubernetes cluster nodes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadNodes}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Node</span>
          </button>
        </div>
      </div>

      {/* Cluster Overview */}
      {clusterInfo && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Server className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Nodes</p>
                <p className="text-2xl font-bold text-gray-900">{clusterInfo.nodes.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ready Nodes</p>
                <p className="text-2xl font-bold text-gray-900">{clusterInfo.nodes.ready}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Running Pods</p>
                <p className="text-2xl font-bold text-gray-900">{clusterInfo.pods.running}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold text-gray-900">{clusterInfo.services}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Version</p>
                <p className="text-lg font-bold text-gray-900">{clusterInfo.version}</p>
              </div>
            </div>
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
                placeholder="Search nodes..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All Nodes</option>
              <option value="ready">Ready</option>
              <option value="not-ready">Not Ready</option>
              <option value="control-plane">Control Plane</option>
              <option value="worker">Worker</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Showing {filteredNodes.length} of {nodes.length} nodes
            </span>
          </div>
        </div>
      </div>

      {/* Nodes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading nodes...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNodes.map((node) => {
            const StatusIcon = statusIcons[node.status] || Clock;
            const isSchedulable = isNodeSchedulable(node);
            
            return (
              <div
                key={node.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
              >
                {/* Node Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColors[node.status]}`}>
                      <StatusIcon className={`w-6 h-6 ${node.status === 'deploying' ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{node.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[node.status]}`}>
                          {node.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          node.role === 'control-plane' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {node.role}
                        </span>
                        {!isSchedulable && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Unschedulable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Node Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium text-gray-900">{node.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Instance:</span>
                    <span className="font-medium text-gray-900">{node.labels['node.kubernetes.io/instance-type'] || 'unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pods:</span>
                    <span className="font-medium text-gray-900">{node.usage.pods}/{node.capacity.pods}</span>
                  </div>
                </div>

                {/* Resource Usage */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">CPU</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{node.usage.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getResourceUsageColor(node.usage.cpu)}`}
                        style={{ width: `${node.usage.cpu}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <MemoryStick className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Memory</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{node.usage.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getResourceUsageColor(node.usage.memory)}`}
                        style={{ width: `${node.usage.memory}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Storage</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{node.usage.storage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getResourceUsageColor(node.usage.storage)}`}
                        style={{ width: `${node.usage.storage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Node Addresses */}
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Network</p>
                  {node.addresses.slice(0, 2).map((addr, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{addr.type}:</span>
                      <span className="font-mono text-gray-900">{addr.address}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedNode(node.id)}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </button>

                  {node.status === 'ready' ? (
                    isSchedulable ? (
                      <button
                        onClick={() => handleCordonNode(node.id)}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-xl transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Cordon</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUncordonNode(node.id)}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>Uncordon</span>
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Manage</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => handleDrainNode(node.id)}
                    disabled={node.status !== 'ready'}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-xl transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <Download className="w-4 h-4" />
                    <span>Drain</span>
                  </button>

                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    disabled={node.status === 'terminating'}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Last Heartbeat */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last heartbeat: {new Date(node.lastHeartbeat).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedNode && (
        <NodeDetailsModal
          nodeId={selectedNode}
          onClose={() => setSelectedNode(null)}
          onRefresh={loadNodes}
        />
      )}

      {showCreateModal && (
        <CreateNodeModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadNodes();
          }}
        />
      )}
    </div>
  );
}