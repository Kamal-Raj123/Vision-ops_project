import React from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Shield, 
  Activity, 
  MessageSquare, 
  Settings,
  Zap,
  LogOut,
  User
} from 'lucide-react';
import { NavItem } from '../types';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
  { id: 'pipelines', label: 'CI/CD Pipelines', icon: 'GitBranch', path: '/pipelines' },
  { id: 'security', label: 'Security Scan', icon: 'Shield', path: '/security' },
  { id: 'monitoring', label: 'Monitoring', icon: 'Activity', path: '/monitoring' },
  { id: 'assistant', label: 'AI Assistant', icon: 'MessageSquare', path: '/assistant' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' }
];

const iconMap = {
  LayoutDashboard,
  GitBranch,
  Shield,
  Activity,
  MessageSquare,
  Settings
};

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuthStore();

  const handleSignOut = () => {
    logout();
    toast.success('Successfully signed out');
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VisionOps</h1>
            <p className="text-sm text-gray-400">DevSecOps Platform</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeView === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800 space-y-3">
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role || 'Member'}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}