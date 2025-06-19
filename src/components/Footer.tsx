import React from 'react';
import { Heart, Code } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-4 mt-auto border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm text-gray-400">
            © {currentYear} VisionOps DevSecOps Platform. All rights reserved.
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Engineered with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>and</span>
            <Code className="w-4 h-4 text-blue-400" />
            <span>by</span>
            <span className="text-blue-400 font-bold">Kamal Raj</span>
          </div>
        </div>
      </div>
    </footer>
  );
}