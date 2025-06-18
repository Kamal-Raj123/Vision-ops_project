import React from 'react';
import { Heart, Code, Zap } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">VisionOps</h3>
                <p className="text-sm text-gray-400">DevSecOps Platform</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              A comprehensive DevSecOps platform designed to streamline CI/CD pipelines, 
              enhance security scanning, and monitor infrastructure with real-time insights 
              and AI-powered recommendations.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>and</span>
              <Code className="w-4 h-4 text-blue-400" />
              <span>by</span>
              <span className="text-blue-400 font-semibold">Kamal Raj</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CI/CD Pipelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Scanner</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Monitoring</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Assistant</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} VisionOps DevSecOps Platform. All rights reserved.
            </div>
            <div className="text-sm text-gray-400">
              Developed by <span className="text-blue-400 font-semibold">Kamal Raj</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}