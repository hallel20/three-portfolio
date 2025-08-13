'use client';

import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  Mail, 
  Settings, 
  Palette,
  Volume2,
  VolumeX,
  Gauge
} from 'lucide-react';
import { useUIStore, usePortfolioStore } from '@/lib/store';
import { categoryLabels } from '@/lib/constants';

export function Navigation3D() {
  const { 
    isMenuOpen, 
    toggleMenu, 
    theme, 
    setTheme, 
    soundEnabled, 
    toggleSound,
    performanceMode,
    togglePerformanceMode 
  } = useUIStore();
  
  const { filter, setFilter } = usePortfolioStore();

  const categories = [
    { key: 'all', label: 'All Projects' },
    { key: 'web-development', label: categoryLabels['web-development'] },
    { key: 'mobile-app', label: categoryLabels['mobile-app'] },
    { key: 'backend-api', label: categoryLabels['backend-api'] },
    { key: 'open-source', label: categoryLabels['open-source'] },
  ];

  return (
    <>
      {/* Menu Toggle Button */}
      <Button
        onClick={toggleMenu}
        className="fixed top-6 right-6 z-50 bg-black/80 border border-gray-700 text-white hover:bg-gray-800"
        size="icon"
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed top-20 right-6 z-40 bg-black/90 backdrop-blur-md border border-gray-700 rounded-lg p-4 min-w-[250px]">
          {/* Main Navigation */}
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Navigation
            </h3>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
              <User className="w-4 h-4 mr-2" />
              About
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>

          {/* Project Filters */}
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Filter Projects
            </h3>
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={filter === category.key ? "default" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => setFilter(category.key)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Settings */}
          <div className="space-y-2 border-t border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Settings
            </h3>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Palette className="w-4 h-4 mr-2" />
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={toggleSound}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 mr-2" />
              ) : (
                <VolumeX className="w-4 h-4 mr-2" />
              )}
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={togglePerformanceMode}
            >
              <Gauge className="w-4 h-4 mr-2" />
              {performanceMode ? 'Quality Mode' : 'Performance Mode'}
            </Button>
          </div>
        </div>
      )}

      {/* Overlay to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20"
          onClick={toggleMenu}
        />
      )}
    </>
  );
}