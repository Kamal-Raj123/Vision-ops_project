import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Square,
  RefreshCw,
  Download,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Terminal,
  Package,
  GitBranch,
  Calendar,
  Timer,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import { Pipeline, PipelineStage, pipelineService } from '../services/pipelineService';
import toast from 'react-hot-toast';

interface PipelineDetailsProps {
  pipeline: Pipeline;
  onBack: () => void;
  onRefresh: () => void;
}

export default function PipelineDetails({ pipeline, onBack, onRefresh }: PipelineDetailsProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(true);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(pipeline.status === 'running');

  useEffect(() => {
    loadArtifacts();
    
    if (autoRefresh && pipeline.status === 'running') {
      const interval = setInterval(() => {
        onRefresh();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [pipeline.status, autoRefresh]);

  const loadArtifacts = async () => {
    try {
      const data = await pipelineService.getPipelineArtifacts(pipeline.id);
      setArtifacts(data);
    } catch (error) {
      console.error('Failed to load artifacts:', error);
    }
  };

  const handleRunPipeline = async () => {
    try {
      const result = await pipelineService.runPipeline(pipeline.id);
      toast.success(result.message);
      setAutoRefresh(true);
      onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStopPipeline = async () => {
    try {
      const result = await pipelineService.stopPipeline(pipeline.id);
      toast.success(result.message);
      setAutoRefresh(false);
      onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusIcons = {
    pending: Clock,
    running: RefreshCw,
    success: CheckCircle,
    failed: XCircle,
    skipped: AlertTriangle
  };

  const statusColors = {
    pending: 'text-gray-500 bg-gray-100',
    running: 'text-blue-500 bg-blue-100',
    success: 'text-emerald-500 bg-emerald-100',
    failed: 'text-red-500 bg-red-100',
    skipped: 'text-yellow-500 bg-yellow-100'
  };

  const getStageProgress = () => {
    const completed = pipeline.stages.filter(s => s.status === 'success').length;
    return Math.round((completed / pipeline.stages.length) * 100);
  };

  const selectedStageData = selectedStage 
    ? pipeline.stages.find(s => s.id === selectedStage)
    : null;

  const displayLogs = selectedStageData?.logs || pipeline.logs;

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pipeline.name}</h1>
            <p className="text-gray-600">{pipeline.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>

          {pipeline.status === 'running' ? (
            <button
              onClick={handleStopPipeline}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop Pipeline</span>
            </button>
          ) : (
            <button
              onClick={handleRunPipeline}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Run Pipeline</span>
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColors[pipeline.status]}`}>
              {React.createElement(statusIcons[pipeline.status] || Clock, {
                className: `w-6 h-6 ${pipeline.status === 'running' ? 'animate-spin' : ''}`
              })}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pipeline Status</h2>
              <p className="text-gray-600 capitalize">{pipeline.status}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-2xl font-bold text-gray-900">{getStageProgress()}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Repository: {pipeline.repository.split('/').pop()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Branch: {pipeline.branch}</span>
          </div>
          {pipeline.lastRun && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Started: {new Date(pipeline.lastRun).toLocaleString()}
              </span>
            </div>
          )}
          {pipeline.duration && (
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Duration: {pipeline.duration}</span>
            </div>
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              pipeline.status === 'success' ? 'bg-emerald-500' :
              pipeline.status === 'failed' ? 'bg-red-500' :
              pipeline.status === 'running' ? 'bg-blue-500' :
              'bg-gray-400'
            }`}
            style={{ width: `${getStageProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stages */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stages</h3>
            <div className="space-y-3">
              {pipeline.stages.map((stage, index) => {
                const StageIcon = statusIcons[stage.status];
                const isSelected = selectedStage === stage.id;
                
                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">
                            {index + 1}
                          </span>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors[stage.status]}`}>
                            <StageIcon className={`w-4 h-4 ${stage.status === 'running' ? 'animate-spin' : ''}`} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{stage.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{stage.status}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {stage.duration && (
                          <p className="text-sm font-medium text-gray-900">{stage.duration}</p>
                        )}
                        {stage.status === 'running' && (
                          <p className="text-sm text-blue-600">Running...</p>
                        )}
                      </div>
                    </div>

                    {/* Stage Commands Preview */}
                    {stage.commands && stage.commands.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Commands:</p>
                        <div className="space-y-1">
                          {stage.commands.slice(0, 2).map((command, idx) => (
                            <code key={idx} className="text-xs text-gray-800 block font-mono">
                              {command}
                            </code>
                          ))}
                          {stage.commands.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{stage.commands.length - 2} more commands
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  {selectedStageData ? `${selectedStageData.name} Logs` : 'Pipeline Logs'}
                </h3>
              </div>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                {showLogs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {showLogs && (
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2 font-mono text-sm">
                  {displayLogs.length > 0 ? (
                    displayLogs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          log.level === 'error' ? 'bg-red-100 text-red-800' :
                          log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          log.level === 'success' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-gray-900 flex-1">{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No logs available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Artifacts */}
          {artifacts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Build Artifacts</h3>
              </div>
              <div className="space-y-3">
                {artifacts.map((artifact) => (
                  <div key={artifact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{artifact.name}</p>
                      <p className="text-sm text-gray-500">{artifact.size}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Pipeline Metrics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Runs</span>
                <span className="font-semibold">{pipeline.metrics.totalRuns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold">{pipeline.metrics.successRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Duration</span>
                <span className="font-semibold">{pipeline.metrics.averageDuration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deploy Frequency</span>
                <span className="font-semibold">{pipeline.metrics.deploymentFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lead Time</span>
                <span className="font-semibold">{pipeline.metrics.leadTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MTTR</span>
                <span className="font-semibold">{pipeline.metrics.mttr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}