import React from 'react';
import { Heart, Code, Zap, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8 mt-auto border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VisionOps
                </h3>
                <p className="text-sm text-blue-300">DevSecOps Platform</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              A comprehensive DevSecOps platform designed to streamline CI/CD pipelines, 
              enhance security scanning, and monitor infrastructure with real-time insights 
              and AI-powered recommendations.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>Crafted with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>and</span>
              <Code className="w-4 h-4 text-blue-400" />
              <span>by</span>
              <span className="text-blue-400 font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Kamal Raj
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-300">Platform</h4>
            <ul className="space-y-3 text-sm">
              {[
                'Dashboard',
                'CI/CD Pipelines',
                'Security Scanner',
                'Monitoring',
                'AI Assistant'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-300">Resources</h4>
            <ul className="space-y-3 text-sm">
              {[
                'Documentation',
                'API Reference',
                'Integrations',
                'Support',
                'Community'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} VisionOps DevSecOps Platform. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-400">
                Engineered by <span className="text-blue-400 font-bold">Kamal Raj</span>
              </div>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}