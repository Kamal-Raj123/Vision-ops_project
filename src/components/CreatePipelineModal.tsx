import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Settings,
  Shield,
  Bell,
  Plus,
  Trash2
} from 'lucide-react';
import { pipelineService, Pipeline, PipelineStage } from '../services/pipelineService';
import toast from 'react-hot-toast';

interface CreatePipelineModalProps {
  onClose: () => void;
  onCreated: (pipeline: Pipeline) => void;
}

export default function CreatePipelineModal({ onClose, onCreated }: CreatePipelineModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repository: '',
    branch: 'main',
    trigger: 'manual' as 'manual' | 'webhook' | 'schedule' | 'pr',
    buildTool: 'npm' as 'npm' | 'maven' | 'gradle' | 'docker' | 'make',
    testFramework: 'jest' as 'jest' | 'junit' | 'pytest' | 'mocha' | 'cypress',
    deployTarget: 'kubernetes' as 'kubernetes' | 'docker' | 'aws' | 'azure' | 'gcp',
    environment: {} as Record<string, string>,
    notifications: {
      slack: '',
      email: [] as string[],
      webhook: ''
    },
    security: {
      enableScanning: true,
      scanners: ['trivy'] as string[],
      failOnCritical: true
    }
  });

  const [stages, setStages] = useState<Partial<PipelineStage>[]>([
    { name: 'Source Checkout', commands: ['git clone $REPO_URL', 'git checkout $BRANCH'] },
    { name: 'Install Dependencies', commands: ['npm ci'] },
    { name: 'Build', commands: ['npm run build'] },
    { name: 'Test', commands: ['npm test'] },
    { name: 'Deploy', commands: ['kubectl apply -f k8s/'] }
  ]);

  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [emailList, setEmailList] = useState(['']);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const addStage = () => {
    setStages(prev => [...prev, { name: '', commands: [''] }]);
  };

  const removeStage = (index: number) => {
    setStages(prev => prev.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, field: string, value: any) => {
    setStages(prev => prev.map((stage, i) => 
      i === index ? { ...stage, [field]: value } : stage
    ));
  };

  const addCommand = (stageIndex: number) => {
    setStages(prev => prev.map((stage, i) => 
      i === stageIndex 
        ? { ...stage, commands: [...(stage.commands || []), ''] }
        : stage
    ));
  };

  const updateCommand = (stageIndex: number, commandIndex: number, value: string) => {
    setStages(prev => prev.map((stage, i) => 
      i === stageIndex 
        ? { 
            ...stage, 
            commands: stage.commands?.map((cmd, j) => j === commandIndex ? value : cmd) 
          }
        : stage
    ));
  };

  const removeCommand = (stageIndex: number, commandIndex: number) => {
    setStages(prev => prev.map((stage, i) => 
      i === stageIndex 
        ? { 
            ...stage, 
            commands: stage.commands?.filter((_, j) => j !== commandIndex) 
          }
        : stage
    ));
  };

  const addEnvVar = () => {
    setEnvVars(prev => [...prev, { key: '', value: '' }]);
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    setEnvVars(prev => prev.map((env, i) => 
      i === index ? { ...env, [field]: value } : env
    ));
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(prev => prev.filter((_, i) => i !== index));
  };

  const addEmail = () => {
    setEmailList(prev => [...prev, '']);
  };

  const updateEmail = (index: number, value: string) => {
    setEmailList(prev => prev.map((email, i) => i === index ? value : email));
  };

  const removeEmail = (index: number) => {
    setEmailList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Prepare environment variables
      const environment = envVars.reduce((acc, env) => {
        if (env.key && env.value) {
          acc[env.key] = env.value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Prepare email notifications
      const emails = emailList.filter(email => email.trim());

      // Create pipeline stages
      const pipelineStages: PipelineStage[] = stages.map((stage, index) => ({
        id: `stage-${index}`,
        name: stage.name || `Stage ${index + 1}`,
        status: 'pending',
        logs: [],
        commands: stage.commands?.filter(cmd => cmd.trim()) || []
      }));

      const pipelineData = {
        name: formData.name,
        description: formData.description,
        repository: formData.repository,
        branch: formData.branch,
        trigger: formData.trigger,
        stages: pipelineStages,
        config: {
          buildTool: formData.buildTool,
          testFramework: formData.testFramework,
          deployTarget: formData.deployTarget,
          environment,
          notifications: {
            slack: formData.notifications.slack || undefined,
            email: emails.length > 0 ? emails : undefined,
            webhook: formData.notifications.webhook || undefined
          },
          security: formData.security
        }
      };

      const pipeline = await pipelineService.createPipeline(pipelineData);
      onCreated(pipeline);
      toast.success('Pipeline created successfully!');
    } catch (error) {
      toast.error('Failed to create pipeline');
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Pipeline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Repository URL</label>
            <input
              type="text"
              value={formData.repository}
              onChange={(e) => handleInputChange('repository', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://github.com/company/repo"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Describe what this pipeline does..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
            <input
              type="text"
              value={formData.branch}
              onChange={(e) => handleInputChange('branch', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
            <select
              value={formData.trigger}
              onChange={(e) => handleInputChange('trigger', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="manual">Manual</option>
              <option value="webhook">Webhook</option>
              <option value="schedule">Schedule</option>
              <option value="pr">Pull Request</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Build Tool</label>
            <select
              value={formData.buildTool}
              onChange={(e) => handleInputChange('buildTool', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="npm">NPM</option>
              <option value="maven">Maven</option>
              <option value="gradle">Gradle</option>
              <option value="docker">Docker</option>
              <option value="make">Make</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Stages</h3>
        <button
          onClick={addStage}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stage</span>
        </button>
      </div>

      <div className="space-y-4">
        {stages.map((stage, stageIndex) => (
          <div key={stageIndex} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={stage.name || ''}
                onChange={(e) => updateStage(stageIndex, 'name', e.target.value)}
                className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder={`Stage ${stageIndex + 1} Name`}
              />
              {stages.length > 1 && (
                <button
                  onClick={() => removeStage(stageIndex)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Commands</label>
              {stage.commands?.map((command, commandIndex) => (
                <div key={commandIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => updateCommand(stageIndex, commandIndex, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter command..."
                  />
                  <button
                    onClick={() => addCommand(stageIndex)}
                    className="p-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {stage.commands && stage.commands.length > 1 && (
                    <button
                      onClick={() => removeCommand(stageIndex, commandIndex)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
      
      {/* Environment Variables */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Environment Variables</label>
          <button
            onClick={addEnvVar}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Variable</span>
          </button>
        </div>
        <div className="space-y-2">
          {envVars.map((env, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={env.key}
                onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Variable name"
              />
              <input
                type="text"
                value={env.value}
                onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Variable value"
              />
              {envVars.length > 1 && (
                <button
                  onClick={() => removeEnvVar(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test Framework and Deploy Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Framework</label>
          <select
            value={formData.testFramework}
            onChange={(e) => handleInputChange('testFramework', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="jest">Jest</option>
            <option value="junit">JUnit</option>
            <option value="pytest">PyTest</option>
            <option value="mocha">Mocha</option>
            <option value="cypress">Cypress</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deploy Target</label>
          <select
            value={formData.deployTarget}
            onChange={(e) => handleInputChange('deployTarget', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="kubernetes">Kubernetes</option>
            <option value="docker">Docker</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="gcp">Google Cloud</option>
          </select>
        </div>
      </div>

      {/* Security Settings */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Security Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.security.enableScanning}
              onChange={(e) => handleNestedInputChange('security', 'enableScanning', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable security scanning</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.security.failOnCritical}
              onChange={(e) => handleNestedInputChange('security', 'failOnCritical', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Fail pipeline on critical vulnerabilities</span>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slack Channel</label>
            <input
              type="text"
              value={formData.notifications.slack}
              onChange={(e) => handleNestedInputChange('notifications', 'slack', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#deployments"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
              <button
                onClick={addEmail}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Email</span>
              </button>
            </div>
            <div className="space-y-2">
              {emailList.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@company.com"
                  />
                  {emailList.length > 1 && (
                    <button
                      onClick={() => removeEmail(index)}
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
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Pipeline</h2>
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
                disabled={!formData.name || !formData.repository}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.repository}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
              >
                Create Pipeline
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}