import React, { useState } from 'react';
import {
  X,
  Bell,
  Target,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Database,
  Globe,
  Server,
  Activity,
  Users,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';

interface CreateAlertModalProps {
  services: any[];
  onClose: () => void;
  onCreate: (alertConfig: any) => void;
}

export default function CreateAlertModal({ services, onClose, onCreate }: CreateAlertModalProps) {
  const [alertConfig, setAlertConfig] = useState({
    name: '',
    description: '',
    service: '',
    metric: '',
    condition: 'above',
    threshold: '',
    duration: '5m',
    severity: 'warning',
    notifications: {
      email: true,
      slack: false,
      webhook: false
    },
    recipients: [''],
    autoResolve: true
  });

  const metricOptions = {
    system: [
      { value: 'cpu', label: 'CPU Usage', icon: Cpu, unit: '%' },
      { value: 'memory', label: 'Memory Usage', icon: MemoryStick, unit: '%' },
      { value: 'disk', label: 'Disk Usage', icon: HardDrive, unit: '%' },
      { value: 'network', label: 'Network I/O', icon: Network, unit: 'MB/s' }
    ],
    database: [
      { value: 'db_connections', label: 'Database Connections', icon: Database, unit: 'count' },
      { value: 'db_query_time', label: 'Query Response Time', icon: Clock, unit: 'ms' },
      { value: 'db_errors', label: 'Database Errors', icon: Activity, unit: 'count' }
    ],
    application: [
      { value: 'response_time', label: 'API Response Time', icon: Globe, unit: 'ms' },
      { value: 'error_rate', label: 'Error Rate', icon: Activity, unit: '%' },
      { value: 'throughput', label: 'Throughput', icon: Activity, unit: 'req/s' },
      { value: 'active_users', label: 'Active Users', icon: Users, unit: 'count' }
    ],
    kubernetes: [
      { value: 'pod_restarts', label: 'Pod Restarts', icon: Server, unit: 'count' },
      { value: 'node_cpu', label: 'Node CPU', icon: Cpu, unit: '%' },
      { value: 'node_memory', label: 'Node Memory', icon: MemoryStick, unit: '%' }
    ]
  };

  const conditionOptions = [
    { value: 'above', label: 'Above' },
    { value: 'below', label: 'Below' },
    { value: 'equal', label: 'Equal to' },
    { value: 'not_equal', label: 'Not equal to' }
  ];

  const durationOptions = [
    { value: '1m', label: '1 minute' },
    { value: '5m', label: '5 minutes' },
    { value: '15m', label: '15 minutes' },
    { value: '30m', label: '30 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' }
  ];

  const severityOptions = [
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
    { value: 'warning', label: 'Warning', color: 'text-yellow-600' },
    { value: 'info', label: 'Info', color: 'text-blue-600' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setAlertConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setAlertConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const addRecipient = () => {
    setAlertConfig(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setAlertConfig(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? value : r)
    }));
  };

  const removeRecipient = (index: number) => {
    setAlertConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    onCreate(alertConfig);
  };

  const getServiceCategory = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.category || 'system';
  };

  const getMetricUnit = () => {
    const category = getServiceCategory(alertConfig.service);
    const metric = metricOptions[category]?.find(m => m.value === alertConfig.metric);
    return metric?.unit || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Alert Rule</h2>
            <p className="text-gray-600">Configure monitoring alerts for your infrastructure</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alert Name</label>
                  <input
                    type="text"
                    value={alertConfig.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="High CPU Usage Alert"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={alertConfig.severity}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {severityOptions.map(option => (
                      <option key={option.value} value={option.value} className={option.color}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={alertConfig.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Alert when CPU usage is too high"
                />
              </div>
            </div>

            {/* Condition Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Condition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <select
                    value={alertConfig.service}
                    onChange={(e) => handleInputChange('service', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
                  <select
                    value={alertConfig.metric}
                    onChange={(e) => handleInputChange('metric', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!alertConfig.service}
                  >
                    <option value="">Select a metric</option>
                    {alertConfig.service && metricOptions[getServiceCategory(alertConfig.service)]?.map(metric => (
                      <option key={metric.value} value={metric.value}>
                        {metric.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    value={alertConfig.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {conditionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Threshold</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={alertConfig.threshold}
                      onChange={(e) => handleInputChange('threshold', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="80"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                      {getMetricUnit()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    value={alertConfig.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-3 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alertConfig.notifications.email}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alertConfig.notifications.slack}
                    onChange={(e) => handleNestedInputChange('notifications', 'slack', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Slack notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alertConfig.notifications.webhook}
                    onChange={(e) => handleNestedInputChange('notifications', 'webhook', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Webhook notifications</span>
                </label>
              </div>

              {alertConfig.notifications.email && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Email Recipients</label>
                    <button
                      onClick={addRecipient}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Recipient</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {alertConfig.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="email"
                          value={recipient}
                          onChange={(e) => updateRecipient(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="email@example.com"
                        />
                        {alertConfig.recipients.length > 1 && (
                          <button
                            onClick={() => removeRecipient(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auto-resolution */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={alertConfig.autoResolve}
                  onChange={(e) => handleInputChange('autoResolve', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-resolve when condition is no longer met</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!alertConfig.name || !alertConfig.service || !alertConfig.metric || !alertConfig.threshold}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Create Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
}