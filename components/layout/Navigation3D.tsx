'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  Mail, 
  Settings, 
  Palette,
  Volume2,
  VolumeX,
  Gauge,
  Code,
  Filter,
  X,
  Menu,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import { categories } from '@/lib/constants';
import { usePortfolioStore, useUIStore } from '@/lib/store';

export default function Enhanced3DNavigation() {
  const { 
    isMenuOpen, 
    setAboutOpen, 
    setContactOpen,
    setProjectsOpen,
    toggleMenu, 
    theme, 
    setTheme, 
    soundEnabled, 
    toggleSound,
    performanceMode,
    togglePerformanceMode 
  } = useUIStore();
  
  const { filter, setFilter } = usePortfolioStore();
  const [currentSection, setCurrentSection] = useState('home');

  const navigationItems = [
    { 
      key: 'home', 
      label: 'Home', 
      icon: Home, 
      description: 'Welcome to my portfolio'
    },
    { 
      key: 'about', 
      label: 'About', 
      icon: User, 
      description: 'Learn more about me',
      onClick: () => setAboutOpen(true)
    },
    { 
      key: 'projects', 
      label: 'Projects', 
      icon: Code, 
      description: 'Explore my work',
      onClick: () => setProjectsOpen(true)
    },
    { 
      key: 'contact', 
      label: 'Contact', 
      icon: Mail, 
      description: 'Get in touch',
      onClick: () => setContactOpen(true)
    }
  ];

  const socialLinks = [
    { 
      name: 'GitHub', 
      icon: Github, 
      url: 'https://github.com', 
      color: 'hover:text-gray-400' 
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      url: 'https://linkedin.com', 
      color: 'hover:text-blue-400' 
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      url: 'https://twitter.com', 
      color: 'hover:text-cyan-400' 
    }
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        toggleMenu();
      }
      if (e.key === 'm' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleMenu();
      }
      if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        togglePerformanceMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMenuOpen, toggleMenu, togglePerformanceMode]);

  return (
    <>
      {/* Main Menu Toggle with Animation */}
      <button
        onClick={toggleMenu}
        className="fixed top-6 right-6 z-50 group"
        aria-label="Toggle navigation menu"
      >
        <div className="relative">
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          
          {/* Button */}
          <div className="relative bg-black/80 backdrop-blur-md border border-white/20 rounded-full p-3 hover:bg-black/90 transition-all duration-300 hover:scale-110">
            <div className="relative">
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-180" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Enhanced Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-end p-6 pt-20">
          <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Navigation</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-xs text-gray-400">Projects</div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">5+</div>
                  <div className="text-xs text-gray-400">Years Exp</div>
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Sections
              </h3>
              
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = currentSection === item.key;
                  
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setCurrentSection(item.key);
                        // Add your navigation logic here
                        item.onClick?.();
                      }}
                      className={`w-full group relative overflow-hidden rounded-lg p-3 transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`w-5 h-5 transition-colors ${
                            isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                          }`} />
                          <div className="text-left">
                            <div className={`font-medium ${
                              isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                            }`}>
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-gray-400">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Filters */}
            <div className="p-6 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Project Filters
              </h3>
              
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isActive = filter === category.key;
                  
                  return (
                    <button
                      key={category.key}
                      onClick={() => setFilter(category.key)}
                      className={`w-full group relative overflow-hidden rounded-lg p-3 transition-all duration-300 ${
                        isActive 
                          ? `bg-gradient-to-r ${category.color.replace('from-', 'from-').replace('to-', 'to-')}/20 border border-current/30` 
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-current' : 'text-gray-400 group-hover:text-white'
                          }`} />
                          <span className={`text-sm font-medium ${
                            isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {category.label}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings & Controls */}
            <div className="p-6 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Palette className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    <span className="text-gray-300 group-hover:text-white">Theme</span>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300">
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>
                
                <button
                  onClick={toggleSound}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    )}
                    <span className="text-gray-300 group-hover:text-white">Sound</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors ${
                    soundEnabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      soundEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
                  </div>
                </button>
                
                <button
                  onClick={togglePerformanceMode}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Gauge className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    <span className="text-gray-300 group-hover:text-white">Performance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {performanceMode ? 'High' : 'Quality'}
                    </span>
                    <div className={`w-8 h-4 rounded-full transition-colors ${
                      performanceMode ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        performanceMode ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Links & Actions */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Connect
                </h3>
                <div className="flex space-x-2">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${social.color}`}
                        title={social.name}
                      >
                        <IconComponent className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download CV</span>
                </button>
                
                <button className="w-full border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>View Live Demo</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 text-center">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Keyboard shortcuts: Ctrl+M (menu), Ctrl+P (performance)</div>
                <div>© 2024 Hallel Ojowuro. Built with Three.js & React</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={toggleMenu}
        />
      )}

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 z-40 space-y-3">
        {/* Performance Indicator */}
        <div className={`bg-black/80 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 ${
          performanceMode ? 'border-orange-500/50' : 'border-blue-500/50'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              performanceMode ? 'bg-orange-400' : 'bg-blue-400'
            } animate-pulse`}></div>
            <span className="text-xs text-gray-300">
              {performanceMode ? 'Performance' : 'Quality'} Mode
            </span>
          </div>
        </div>

        {/* 3D View Controls hint */}
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-gray-400">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>⌘M for menu</div>
        </div>
      </div>
    </>
  );
}