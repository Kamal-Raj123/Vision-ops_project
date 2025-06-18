import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PipelineBuilder from './components/PipelineBuilder';
import SecurityScanner from './components/SecurityScanner';
import Monitoring from './components/Monitoring';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import LoginForm from './components/LoginForm';
import RealTimeUpdates from './components/RealTimeUpdates';
import { useAuth } from './hooks/useApi';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { user, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsAuthenticated(!!user);
    }
  }, [user, loading]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handlePipelineUpdate = (data: any) => {
    console.log('Pipeline updated:', data);
    // You can add toast notifications here
  };

  const handleMetricsUpdate = (data: any) => {
    console.log('Metrics updated:', data);
    // Update metrics in real-time
  };

  const handleScanComplete = (data: any) => {
    console.log('Security scan completed:', data);
    // Show scan completion notification
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SecureOps Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'pipelines':
        return <PipelineBuilder />;
      case 'security':
        return <SecurityScanner />;
      case 'monitoring':
        return <Monitoring />;
      case 'assistant':
        return <AIAssistant />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <RealTimeUpdates
        onPipelineUpdate={handlePipelineUpdate}
        onMetricsUpdate={handleMetricsUpdate}
        onScanComplete={handleScanComplete}
      />
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>
    </div>
  );
}

export default App;