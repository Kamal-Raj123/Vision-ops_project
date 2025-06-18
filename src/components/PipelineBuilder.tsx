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
  Settings
} from 'lucide-react';
import { mockPipelines } from '../utils/mockData';

export default function PipelineBuilder() {
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CI/CD Pipelines</h1>
          <p className="text-gray-600">Manage and monitor your deployment pipelines</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Pipeline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Pipelines</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {mockPipelines.map((pipeline) => {
                const StatusIcon = statusIcons[pipeline.status];
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[pipeline.status]}`}>
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
                        <p className="text-sm font-medium text-gray-900">{pipeline.duration}</p>
                        <p className="text-xs text-gray-500">{pipeline.lastRun}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pipeline Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
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