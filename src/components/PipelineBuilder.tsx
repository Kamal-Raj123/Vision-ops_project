import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Play, 
  Square,
  RotateCcw, 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  Eye,
  Download,
  AlertTriangle,
  Activity,
  Zap,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Target,
  Timer,
  TrendingUp
} from 'lucide-react';
import { pipelineService, Pipeline, PipelineStage } from '../services/pipelineService';
import PipelineDetails from './PipelineDetails';
import PipelineMetrics from './PipelineMetrics';
import CreatePipelineModal from './CreatePipelineModal';
import toast from 'react-hot-toast';

export default function PipelineBuilder() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'success' | 'failed' | 'idle'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [overallMetrics, setOverallMetrics] = useState<any>(null);

  useEffect(() => {
    loadPipelines();
    loadOverallMetrics();
    
    // Auto-refresh every 5 seconds for running pipelines
    const interval = setInterval(() => {
      if (pipelines.some(p => p.status === 'running')) {
        loadPipelines();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadPipelines = async () => {
    try {
      const data = await pipelineService.getAllPipelines();
      setPipelines(data);
    } catch (error) {
      toast.error('Failed to load pipelines');
    } finally {
      setLoading(false);
    }
  };

  const loadOverallMetrics = async () => {
    try {
      const metrics = await pipelineService.getPipelineMetrics();
      setOverallMetrics(metrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleRunPipeline = async (pipelineId: string) => {
    try {
      const result = await pipelineService.runPipeline(pipelineId);
      toast.success(result.message);
      loadPipelines();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStopPipeline = async (pipelineId: string) => {
    try {
      const result = await pipelineService.stopPipeline(pipelineId);
      toast.success(result.message);
      loadPipelines();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusIcons = {
    idle: Clock,
    running: RefreshCw,
    success: CheckCircle,
    failed: XCircle,
    cancelled: AlertTriangle
  };

  const statusColors = {
    idle: 'text-gray-500 bg-gray-100',
    running: 'text-blue-500 bg-blue-100',
    success: 'text-emerald-500 bg-emerald-100',
    failed: 'text-red-500 bg-red-100',
    cancelled: 'text-yellow-500 bg-yellow-100'
  };

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesFilter = filter === 'all' || pipeline.status === filter;
    const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pipeline.repository.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStageProgress = (stages: PipelineStage[]) => {
    const completed = stages.filter(s => s.status === 'success').length;
    return Math.round((completed / stages.length) * 100);
  };

  if (selectedPipeline) {
    const pipeline = pipelines.find(p => p.id === selectedPipeline);
    if (pipeline) {
      return (
        <PipelineDetails
          pipeline={pipeline}
          onBack={() => setSelectedPipeline(null)}
          onRefresh={loadPipelines}
        />
      );
    }
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CI/CD Pipelines</h1>
          <p className="text-gray-600 text-lg">Manage and monitor your deployment pipelines with real-time execution</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMetrics(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Pipeline</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      {overallMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipelines</p>
                <p className="text-2xl font-bold text-gray-900">{overallMetrics.totalPipelines}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Running Now</p>
                <p className="text-2xl font-bold text-gray-900">{overallMetrics.runningPipelines}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{overallMetrics.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Timer className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{overallMetrics.averageDuration}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Deployments Today</p>
                <p className="text-2xl font-bold text-gray-900">{overallMetrics.deploymentsToday}</p>
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
                placeholder="Search pipelines..."
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
              <option value="all">All Pipelines</option>
              <option value="running">Running</option>
              <option value="success">Successful</option>
              <option value="failed">Failed</option>
              <option value="idle">Idle</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Showing {filteredPipelines.length} of {pipelines.length} pipelines
            </span>
            <button
              onClick={loadPipelines}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading pipelines...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPipelines.map((pipeline) => {
            const StatusIcon = statusIcons[pipeline.status];
            const progress = getStageProgress(pipeline.stages);
            const isRunning = pipeline.status === 'running';
            
            return (
              <div 
                key={pipeline.id} 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{pipeline.name}</h3>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors[pipeline.status]}`}>
                        <StatusIcon className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[pipeline.status]}`}>
                        {pipeline.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{pipeline.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{pipeline.repository.split('/').pop()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span>{pipeline.branch}</span>
                      </div>
                      {pipeline.lastRun && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Last run: {new Date(pipeline.lastRun).toLocaleString()}</span>
                        </div>
                      )}
                      {pipeline.duration && (
                        <div className="flex items-center space-x-1">
                          <Timer className="w-4 h-4" />
                          <span>{pipeline.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedPipeline(pipeline.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {isRunning ? (
                      <button
                        onClick={() => handleStopPipeline(pipeline.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-colors"
                      >
                        <Square className="w-4 h-4" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRunPipeline(pipeline.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>Run</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Pipeline Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Pipeline Progress</span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        pipeline.status === 'success' ? 'bg-emerald-500' :
                        pipeline.status === 'failed' ? 'bg-red-500' :
                        pipeline.status === 'running' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stages Preview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {pipeline.stages.slice(0, 5).map((stage, index) => {
                    const StageIcon = statusIcons[stage.status] || Clock;
                    return (
                      <div 
                        key={stage.id}
                        className={`p-3 rounded-xl border text-center ${
                          stage.status === 'success' ? 'bg-emerald-50 border-emerald-200' :
                          stage.status === 'failed' ? 'bg-red-50 border-red-200' :
                          stage.status === 'running' ? 'bg-blue-50 border-blue-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <StageIcon className={`w-4 h-4 mx-auto mb-1 ${
                          stage.status === 'success' ? 'text-emerald-600' :
                          stage.status === 'failed' ? 'text-red-600' :
                          stage.status === 'running' ? 'text-blue-600 animate-spin' :
                          'text-gray-400'
                        }`} />
                        <p className="text-xs font-medium text-gray-700 truncate">{stage.name}</p>
                        {stage.duration && (
                          <p className="text-xs text-gray-500">{stage.duration}</p>
                        )}
                      </div>
                    );
                  })}
                  {pipeline.stages.length > 5 && (
                    <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-center">
                      <span className="text-xs text-gray-500">+{pipeline.stages.length - 5} more</span>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{pipeline.metrics.totalRuns}</p>
                      <p className="text-xs text-gray-500">Total Runs</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{pipeline.metrics.successRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Success Rate</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{pipeline.metrics.averageDuration}</p>
                      <p className="text-xs text-gray-500">Avg Duration</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{pipeline.metrics.deploymentFrequency}</p>
                      <p className="text-xs text-gray-500">Frequency</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showMetrics && (
        <PipelineMetrics
          pipelines={pipelines}
          onClose={() => setShowMetrics(false)}
        />
      )}

      {showCreateModal && (
        <CreatePipelineModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(pipeline) => {
            setPipelines(prev => [...prev, pipeline]);
            setShowCreateModal(false);
            toast.success('Pipeline created successfully!');
          }}
        />
      )}
    </div>
  );
}