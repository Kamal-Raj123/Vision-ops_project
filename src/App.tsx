import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useWebSocket } from './hooks/useWebSocket';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import KubernetesNodes from './components/KubernetesNodes';
import PipelineBuilder from './components/PipelineBuilder';
import SecurityScanner from './components/SecurityScanner';
import Monitoring from './components/Monitoring';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Footer from './components/Footer';

function App() {
  const { isAuthenticated, user, setLoading } = useAuthStore();
  const [activeView, setActiveView] = React.useState('dashboard');
  
  // Initialize WebSocket connection
  useWebSocket();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token && !isAuthenticated) {
      // Verify token with backend
      setLoading(false);
    }
  }, [isAuthenticated, setLoading]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'kubernetes':
        return <KubernetesNodes />;
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
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {renderView()}
          </div>
          <Footer />
        </div>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </>
  );
}

export default App;