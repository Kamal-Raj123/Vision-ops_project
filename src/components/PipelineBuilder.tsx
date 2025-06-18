import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  AlertCircle
} from 'lucide-react';
import { usePipelines } from '../hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

export default function PipelineBuilder() {
  const { pipelines, loading, runPipeline, createPipeline } = usePipelines();
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPipeline, setNewPipeline] = useState({
    name: '',
    repository: '',
    branch: 'main',
    config: { stages: ['build', 'test', 'deploy'] }
  });

  const statusIcons = {
    success: CheckCircle,
    failed: XCircle,
    running: Clock,
    pending: Clock
  };

  const statusColors = {
    success: 'text-emerald-500 bg-emerald-100',
    failed: 'text-red-500 bg-red-100',
    running: 'text-blue-500 bg-blue-100',
    pending: 'text-yellow-500 bg-yellow-100'
  };

  const handleRunPipeline = async (id: string) => {
    try {
      await runPipeline(id);
    } catch (error) {
      console.error('Failed to run pipeline:', error);
    }
  };

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPipeline(newPipeline);
      setShowCreateForm(false);
      setNewPipeline({
        name: '',
        repository: '',
        branch: 'main',
        config: { stages: ['build', 'test', 'deploy'] }
      });
    } catch (error) {
      console.error('Failed to create pipeline:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CI/CD Pipelines</h1>
          <p className="text-gray-600">Manage and monitor your deployment pipelines</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Pipeline</span>
        </button>
      </div>

      {/* Create Pipeline Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Pipeline</h2>
            <form onSubmit={handleCreatePipeline} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pipeline Name
                </label>
                <input
                  type="text"
                  value={newPipeline.name}
                  onChange={(e) => setNewPipeline({ ...newPipeline, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Frontend Deploy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repository
                </label>
                <input
                  type="text"
                  value={newPipeline.repository}
                  onChange={(e) => setNewPipeline({ ...newPipeline, repository: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., secureops/frontend"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={newPipeline.branch}
                  onChange={(e) => setNewPipeline({ ...newPipeline, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="main"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Pipelines</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pipelines.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pipelines Found</h3>
                  <p className="text-gray-600 mb-4">Create your first pipeline to get started with CI/CD automation.</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Create Pipeline
                  </button>
                </div>
              ) : (
                pipelines.map((pipeline: any) => {
                  const StatusIcon = statusIcons[pipeline.status as keyof typeof statusIcons];
                  return (
                    <div 
                      key={pipeline.id} 
                      className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedPipeline === pipeline.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                      onClick={() => setSelectedPipeline(pipeline.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[pipeline.status as keyof typeof statusColors]}`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{pipeline.name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <GitBranch className="w-4 h-4" />
                                <span>{pipeline.repository}</span>
                              </div>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{pipeline.branch}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {pipeline.duration ? `${Math.floor(pipeline.duration / 60)}m ${pipeline.duration % 60}s` : '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pipeline.last_run ? formatDistanceToNow(new Date(pipeline.last_run), { addSuffix: true }) : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => selectedPipeline && handleRunPipeline(selectedPipeline)}
                disabled={!selectedPipeline}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Run Pipeline</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Pause className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Pause All</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Retry Failed</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Configure</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stages</h3>
            <div className="space-y-3">
              {['Build', 'Test', 'Security Scan', 'Deploy'].map((stage, index) => (
                <div key={stage} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{stage}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">GitHub</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jenkins</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Docker Registry</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kubernetes</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}