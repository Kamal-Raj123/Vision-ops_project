import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PipelineBuilder from './components/PipelineBuilder';
import SecurityScanner from './components/SecurityScanner';
import Monitoring from './components/Monitoring';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

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
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>
    </div>
  );
}

export default App;