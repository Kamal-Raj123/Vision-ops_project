import React, { useState, useEffect } from 'react';
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
  X,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  LogOut,
  User
} from 'lucide-react';
import { MockBackendService } from '../services/mockBackend';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const { user, logout } = useAuthStore();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      slack: false,
      webhook: true,
      critical: true,
      deployment: true,
      security: true
    },
    security: {
      twoFactor: true,
      apiAccess: true,
      auditLogging: true,
      sessionTimeout: '24',
      passwordPolicy: 'strong'
    }
  });

  useEffect(() => {
    if (activeTab === 'integrations') {
      loadIntegrations();
    }
  }, [activeTab]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const response = await MockBackendService.getIntegrations();
      setIntegrations(response.data.integrations);
    } catch (error) {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async (integrationId: string) => {
    setTestingIntegration(integrationId);
    try {
      const response = await MockBackendService.testIntegration(integrationId);
      if (response.data.status === 'success') {
        toast.success(`${integrationId} connection successful`);
      } else {
        toast.error(`${integrationId} connection failed`);
      }
    } catch (error) {
      toast.error(`Failed to test ${integrationId} connection`);
    } finally {
      setTestingIntegration(null);
    }
  };

  const toggleIntegration = async (integrationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'connected' ? 'disconnected' : 'connected';
    try {
      await MockBackendService.updateIntegrationStatus(integrationId, newStatus);
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: newStatus }
            : integration
        )
      );
      toast.success(`${integrationId} ${newStatus === 'connected' ? 'connected' : 'disconnected'}`);
    } catch (error) {
      toast.error(`Failed to update ${integrationId} status`);
    }
  };

  const handleSignOut = () => {
    logout();
    toast.success('Successfully signed out');
  };

  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: GitBranch },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'Users & Teams', icon: Users },
    { id: 'account', label: 'Account', icon: User },
    { id: 'system', label: 'System', icon: SettingsIcon }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'disconnected':
        return <X className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'configuring':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'configuring':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'ci_cd':
        return GitBranch;
      case 'monitoring':
        return Activity;
      case 'security':
        return Shield;
      case 'communication':
        return Mail;
      default:
        return Database;
    }
  };

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Integrations</h2>
        <p className="text-gray-600">Connect and manage external services for your DevSecOps pipeline</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const Icon = getIntegrationIcon(integration.type);
            const isConnected = integration.status === 'connected';
            
            return (
              <div key={integration.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isConnected ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${isConnected ? 'text-emerald-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{integration.type.replace('_', ' ')}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusIcon(integration.status)}
                        <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integration Metrics */}
                {integration.metrics && isConnected && (
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{integration.metrics.uptime}</p>
                      <p className="text-xs text-gray-500">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{integration.metrics.requests.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Requests</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{integration.metrics.errors}</p>
                      <p className="text-xs text-gray-500">Errors</p>
                    </div>
                  </div>
                )}

                {/* Last Sync */}
                {integration.lastSync && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => testIntegration(integration.id)}
                    disabled={testingIntegration === integration.id}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {testingIntegration === integration.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4" />
                        <span>Test</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => toggleIntegration(integration.id, integration.status)}
                    className={`flex-1 px-3 py-2 rounded-xl font-medium transition-colors ${
                      isConnected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                {/* Configuration Details */}
                {isConnected && integration.config && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Configuration</h4>
                    <div className="space-y-1">
                      {Object.entries(integration.config).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                          <span className="text-gray-900 font-mono">
                            {typeof value === 'string' && value.includes('***') ? value : 
                             typeof value === 'string' && value.length > 20 ? `${value.substring(0, 20)}...` : 
                             String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-600">Manage your account preferences and security settings</p>
      </div>

      {/* User Profile */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{user?.name}</h4>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-blue-600 capitalize font-medium">{user?.role} Account</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={user?.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
            </div>
            <span className="text-blue-600">→</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
              Enabled
            </span>
          </button>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5 text-red-600 group-hover:rotate-12 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Sign Out</p>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
            </div>
            <span className="text-red-600">→</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Configure how and when you receive alerts and notifications</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
            { key: 'slack', label: 'Slack Integration', icon: Mail, description: 'Send alerts to Slack channels' },
            { key: 'webhook', label: 'Webhook Alerts', icon: Globe, description: 'Send notifications to custom endpoints' }
          ].map((channel) => (
            <div key={channel.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
        <p className="text-gray-600">Manage authentication, authorization, and security policies</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Users & Teams</h2>
          <p className="text-gray-600">Manage user access and team permissions</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
          <Users className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { name: 'Kamal Raj', email: 'techey.kamal@gmail.com', role: 'Admin', status: 'Active' },
            { name: 'Karthick', email: 'karthick@example.com', role: 'DevOps', status: 'Active' },
            { name: 'Kalai', email: 'kalai@example.com', role: 'DevOps', status: 'Active' },
            { name: 'Praveen', email: 'praveen@example.com', role: 'SecOps', status: 'Active' }
          ].map((user, index) => (
            <div key={index} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Configuration</h2>
        <p className="text-gray-600">General system settings and maintenance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-gray-600" />
                <span className="font-medium">System Update</span>
              </div>
              <span className="text-sm text-gray-600">Check for updates</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Backup Now</span>
              </div>
              <span className="text-sm text-gray-600">Create manual backup</span>
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
      case 'account':
        return renderAccountTab();
      case 'system':
        return renderSystemTab();
      default:
        return renderIntegrationsTab();
    }
  };

  const saveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 text-lg">Configure your DevSecOps platform preferences and integrations</p>
        </div>
        <button 
          onClick={saveSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors shadow-lg"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex space-x-8">
        {/* Enhanced Tabs */}
        <div className="w-72">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 font-medium shadow-lg border border-blue-200'
                    : 'text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
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