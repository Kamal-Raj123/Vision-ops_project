import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  GitBranch,
  Shield,
  Bell,
  Users,
  Database,
  Cloud,
  Key,
  Mail,
  Smartphone,
  Globe,
  Save,
  TestTube,
  RefreshCw,
  Check,
  X
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      slack: false,
      webhook: true,
      critical: true,
      deployment: true,
      security: true
    },
    integrations: {
      github: { connected: true, status: 'active' },
      jenkins: { connected: true, status: 'active' },
      docker: { connected: true, status: 'active' },
      kubernetes: { connected: false, status: 'pending' },
      slack: { connected: false, status: 'disconnected' },
      prometheus: { connected: true, status: 'active' }
    },
    security: {
      twoFactor: true,
      apiAccess: true,
      auditLogging: true,
      sessionTimeout: '24',
      passwordPolicy: 'strong'
    }
  });

  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: GitBranch },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'Users & Teams', icon: Users },
    { id: 'system', label: 'System', icon: SettingsIcon }
  ];

  const integrationServices = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Source code management and version control',
      icon: GitBranch,
      color: 'bg-gray-900',
      connected: settings.integrations.github.connected
    },
    {
      id: 'jenkins',
      name: 'Jenkins',
      description: 'Continuous integration and deployment',
      icon: RefreshCw,
      color: 'bg-blue-600',
      connected: settings.integrations.jenkins.connected
    },
    {
      id: 'docker',
      name: 'Docker Registry',
      description: 'Container image registry',
      icon: Database,
      color: 'bg-blue-500',
      connected: settings.integrations.docker.connected
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      description: 'Container orchestration platform',
      icon: Cloud,
      color: 'bg-purple-600',
      connected: settings.integrations.kubernetes.connected
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and alerts',
      icon: Mail,
      color: 'bg-green-600',
      connected: settings.integrations.slack.connected
    },
    {
      id: 'prometheus',
      name: 'Prometheus',
      description: 'Monitoring and alerting toolkit',
      icon: TestTube,
      color: 'bg-orange-600',
      connected: settings.integrations.prometheus.connected
    }
  ];

  const handleToggleIntegration = (serviceId: string) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [serviceId]: {
          ...prev.integrations[serviceId as keyof typeof prev.integrations],
          connected: !prev.integrations[serviceId as keyof typeof prev.integrations].connected
        }
      }
    }));
  };

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Integrations</h2>
        <p className="text-gray-600">Connect and manage external services for your DevSecOps pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationServices.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  <div className="flex items-center space-x-2 mt-3">
                    <div className={`w-2 h-2 rounded-full ${
                      service.connected ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      service.connected ? 'text-emerald-600' : 'text-gray-500'
                    }`}>
                      {service.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleIntegration(service.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  service.connected
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {service.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Configure how and when you receive alerts and notifications</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
            { key: 'slack', label: 'Slack Integration', icon: Mail, description: 'Send alerts to Slack channels' },
            { key: 'webhook', label: 'Webhook Alerts', icon: Globe, description: 'Send notifications to custom endpoints' }
          ].map((channel) => (
            <div key={channel.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <channel.icon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{channel.label}</p>
                  <p className="text-sm text-gray-600">{channel.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[channel.key as keyof typeof settings.notifications]}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      [channel.key]: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Types</h3>
        <div className="space-y-4">
          {[
            { key: 'critical', label: 'Critical Alerts', description: 'System failures and security breaches' },
            { key: 'deployment', label: 'Deployment Status', description: 'Pipeline completion and failures' },
            { key: 'security', label: 'Security Alerts', description: 'Vulnerability scans and security issues' }
          ].map((alertType) => (
            <div key={alertType.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{alertType.label}</p>
                <p className="text-sm text-gray-600">{alertType.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[alertType.key as keyof typeof settings.notifications]}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      [alertType.key]: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h2>
        <p className="text-gray-600">Manage authentication, authorization, and security policies</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, twoFactor: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">API Access Control</p>
                <p className="text-sm text-gray-600">Manage API keys and access permissions</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.apiAccess}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, apiAccess: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (hours)
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, sessionTimeout: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">1 hour</option>
              <option value="8">8 hours</option>
              <option value="24">24 hours</option>
              <option value="168">1 week</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Policy
            </label>
            <select
              value={settings.security.passwordPolicy}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, passwordPolicy: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="basic">Basic (8+ characters)</option>
              <option value="strong">Strong (12+ chars, mixed case, numbers, symbols)</option>
              <option value="enterprise">Enterprise (16+ chars, complexity requirements)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Users & Teams</h2>
          <p className="text-gray-600">Manage user access and team permissions</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Users className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { name: 'Kamalraj', email: 'techey.kamal@gmail.com', role: 'Admin', status: 'Active' },
            { name: 'Karthick', email: 'karthick@example.com', role: 'Devops', status: 'Active' },
            { name: 'Kalai', email: 'kalai@example.com', role: 'DevOps', status: 'Active' },
            { name: 'Praveen', email: 'sarah@example.com', role: 'SecOps', status: 'Active' }
          ].map((user, index) => (
            <div key={index} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user.role}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  user.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <SettingsIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">System Configuration</h2>
        <p className="text-gray-600">General system settings and maintenance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Platform Version</span>
              <span className="font-mono text-gray-900">v2.1.3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-emerald-600 font-medium">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-gray-900">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Storage Used</span>
              <span className="text-gray-900">67.8 GB / 100 GB</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-gray-600" />
                <span className="font-medium">System Update</span>
              </div>
              <span className="text-sm text-gray-600">Check for updates</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Backup Now</span>
              </div>
              <span className="text-sm text-gray-600">Create manual backup</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <TestTube className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Health Check</span>
              </div>
              <span className="text-sm text-gray-600">Run system diagnostics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'integrations':
        return renderIntegrationsTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'users':
        return renderUsersTab();
      case 'system':
        return renderSystemTab();
      default:
        return renderIntegrationsTab();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your DevSecOps platform preferences and integrations</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex space-x-8">
        {/* Tabs */}
        <div className="w-64">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}