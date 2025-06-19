import React, { useState } from 'react';
import {
  X,
  Server,
  Plus,
  Trash2,
  Settings,
  Shield,
  Zap
} from 'lucide-react';
import { NodeDeploymentConfig } from '../types';
import { kubernetesService } from '../services/kubernetesService';
import toast from 'react-hot-toast';

interface CreateNodeModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateNodeModal({ onClose, onCreated }: CreateNodeModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<NodeDeploymentConfig>({
    nodeType: 'worker',
    instanceType: 'medium',
    count: 1,
    zone: 'us-west-2a',
    labels: {},
    taints: [],
    autoScaling: {
      enabled: false,
      minNodes: 1,
      maxNodes: 5,
      targetCPU: 70,
      targetMemory: 80
    }
  });

  const [labels, setLabels] = useState([{ key: '', value: '' }]);
  const [taints, setTaints] = useState([{ key: '', value: '', effect: 'NoSchedule' as const }]);

  const instanceTypes = [
    { value: 'small', label: 'Small (2 CPU, 8GB RAM)', cpu: '2', memory: '8GB', storage: '50GB' },
    { value: 'medium', label: 'Medium (4 CPU, 16GB RAM)', cpu: '4', memory: '16GB', storage: '100GB' },
    { value: 'large', label: 'Large (8 CPU, 32GB RAM)', cpu: '8', memory: '32GB', storage: '200GB' },
    { value: 'xlarge', label: 'X-Large (16 CPU, 64GB RAM)', cpu: '16', memory: '64GB', storage: '400GB' }
  ];

  const zones = [
    'us-west-2a',
    'us-west-2b',
    'us-west-2c',
    'us-east-1a',
    'us-east-1b',
    'us-east-1c',
    'eu-west-1a',
    'eu-west-1b',
    'eu-west-1c'
  ];

  const taintEffects = ['NoSchedule', 'PreferNoSchedule', 'NoExecute'] as const;

  const handleInputChange = (field: keyof NodeDeploymentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoScalingChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      autoScaling: { ...prev.autoScaling, [field]: value }
    }));
  };

  const addLabel = () => {
    setLabels(prev => [...prev, { key: '', value: '' }]);
  };

  const updateLabel = (index: number, field: 'key' | 'value', value: string) => {
    setLabels(prev => prev.map((label, i) => 
      i === index ? { ...label, [field]: value } : label
    ));
  };

  const removeLabel = (index: number) => {
    setLabels(prev => prev.filter((_, i) => i !== index));
  };

  const addTaint = () => {
    setTaints(prev => [...prev, { key: '', value: '', effect: 'NoSchedule' }]);
  };

  const updateTaint = (index: number, field: string, value: any) => {
    setTaints(prev => prev.map((taint, i) => 
      i === index ? { ...taint, [field]: value } : taint
    ));
  };

  const removeTaint = (index: number) => {
    setTaints(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare labels
      const nodeLabels = labels.reduce((acc, label) => {
        if (label.key && label.value) {
          acc[label.key] = label.value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Prepare taints
      const nodeTaints = taints.filter(taint => taint.key).map(taint => ({
        key: taint.key,
        value: taint.value || undefined,
        effect: taint.effect
      }));

      const deploymentConfig = {
        ...config,
        labels: nodeLabels,
        taints: nodeTaints
      };

      const result = await kubernetesService.deployNode(deploymentConfig);
      
      if (result.success) {
        toast.success(result.message);
        onCreated();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to deploy node');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Node Type</label>
            <select
              value={config.nodeType}
              onChange={(e) => handleInputChange('nodeType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="worker">Worker Node</option>
              <option value="control-plane">Control Plane Node</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instance Type</label>
            <select
              value={config.instanceType}
              onChange={(e) => handleInputChange('instanceType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {instanceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Node Count</label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.count}
              onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability Zone</label>
            <select
              value={config.zone}
              onChange={(e) => handleInputChange('zone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Instance Type Details */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">Selected Instance Specifications</h4>
          {(() => {
            const selectedType = instanceTypes.find(t => t.value === config.instanceType);
            return selectedType ? (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">CPU:</span>
                  <span className="font-medium text-blue-900 ml-2">{selectedType.cpu}</span>
                </div>
                <div>
                  <span className="text-blue-700">Memory:</span>
                  <span className="font-medium text-blue-900 ml-2">{selectedType.memory}</span>
                </div>
                <div>
                  <span className="text-blue-700">Storage:</span>
                  <span className="font-medium text-blue-900 ml-2">{selectedType.storage}</span>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Labels & Taints</h3>
        
        {/* Labels */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Node Labels</label>
            <button
              onClick={addLabel}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Label</span>
            </button>
          </div>
          <div className="space-y-2">
            {labels.map((label, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={label.key}
                  onChange={(e) => updateLabel(index, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Label key (e.g., workload)"
                />
                <input
                  type="text"
                  value={label.value}
                  onChange={(e) => updateLabel(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Label value (e.g., database)"
                />
                {labels.length > 1 && (
                  <button
                    onClick={() => removeLabel(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Taints */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Node Taints</label>
            <button
              onClick={addTaint}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Taint</span>
            </button>
          </div>
          <div className="space-y-2">
            {taints.map((taint, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={taint.key}
                  onChange={(e) => updateTaint(index, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Taint key (e.g., dedicated)"
                />
                <input
                  type="text"
                  value={taint.value}
                  onChange={(e) => updateTaint(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Taint value (optional)"
                />
                <select
                  value={taint.effect}
                  onChange={(e) => updateTaint(index, 'effect', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {taintEffects.map(effect => (
                    <option key={effect} value={effect}>{effect}</option>
                  ))}
                </select>
                {taints.length > 1 && (
                  <button
                    onClick={() => removeTaint(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto Scaling (Optional)</h3>
        
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.autoScaling.enabled}
              onChange={(e) => handleAutoScalingChange('enabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable auto scaling for this node group</span>
          </label>
        </div>

        {config.autoScaling.enabled && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Nodes</label>
                <input
                  type="number"
                  min="1"
                  value={config.autoScaling.minNodes}
                  onChange={(e) => handleAutoScalingChange('minNodes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Nodes</label>
                <input
                  type="number"
                  min="1"
                  value={config.autoScaling.maxNodes}
                  onChange={(e) => handleAutoScalingChange('maxNodes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target CPU (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.autoScaling.targetCPU}
                  onChange={(e) => handleAutoScalingChange('targetCPU', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Memory (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.autoScaling.targetMemory}
                  onChange={(e) => handleAutoScalingChange('targetMemory', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deployment Summary */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="font-medium text-blue-900 mb-4">Deployment Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Node Type:</span>
            <span className="font-medium text-blue-900 capitalize">{config.nodeType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Instance Type:</span>
            <span className="font-medium text-blue-900">{config.instanceType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Count:</span>
            <span className="font-medium text-blue-900">{config.count} node(s)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Zone:</span>
            <span className="font-medium text-blue-900">{config.zone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Labels:</span>
            <span className="font-medium text-blue-900">
              {labels.filter(l => l.key && l.value).length} configured
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Taints:</span>
            <span className="font-medium text-blue-900">
              {taints.filter(t => t.key).length} configured
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Auto Scaling:</span>
            <span className="font-medium text-blue-900">
              {config.autoScaling.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deploy New Node</h2>
            <p className="text-gray-600">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {step > 1 ? 'Previous' : 'Cancel'}
          </button>
          
          <div className="flex items-center space-x-3">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4" />
                    <span>Deploy Node</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}