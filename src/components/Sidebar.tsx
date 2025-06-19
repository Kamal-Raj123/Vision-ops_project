import React from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Shield, 
  Activity, 
  MessageSquare, 
  Settings,
  Zap,
  User,
  Server
} from 'lucide-react';
import { NavItem } from '../types';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
  { id: 'kubernetes', label: 'Kubernetes Nodes', icon: 'Server', path: '/kubernetes' },
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
  Settings,
  Server
};

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user } = useAuthStore();

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white flex flex-col h-full shadow-2xl">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VisionOps</h1>
            <p className="text-sm text-blue-300">DevSecOps Platform</p>
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:transform hover:scale-105'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeView === item.id ? 'text-white' : 'group-hover:text-blue-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl border border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-blue-300 truncate capitalize">{user?.role || 'Member'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}