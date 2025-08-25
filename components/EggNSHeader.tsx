'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Sun, Moon, Droplets } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useLiquidGlass } from './LiquidGlassProvider';
import { useReducedMotion as useReducedMotionHook } from '../hooks/useReducedMotion';

interface EggNSHeaderProps {
  currentPage?: 'home' | 'names';
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

const EggNSHeader: React.FC<EggNSHeaderProps> = ({ 
  currentPage = 'home',
  onSearch,
  searchPlaceholder = "Search for a name",
  showSearch = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isLiquidGlassMode, toggleLiquidGlass, LiquidGlassComponent } = useLiquidGlass();
  const prefersReducedMotion = useReducedMotionHook();
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'alice.egg',
    'bob.egg',
    'crypto.egg',
    'defi.egg',
    'web3.egg'
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    if (onSearch) {
      onSearch(value);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const navigateToPage = (page: string) => {
    if (page === 'home') {
      window.location.href = '/dashboard/examples/aggens-app';
    } else if (page === 'names') {
      window.location.href = '/dashboard/examples/aggens-app/names';
    }
  };

  return (
    <header
      ref={containerRef}
      className="relative z-10 p-6 max-w-6xl mx-auto"
    >
      {/* Main Header Row */}
      <div className="flex justify-between items-center mb-6">
        {/* Logo */}
        <motion.button 
          onClick={() => navigateToPage('home')}
          className="flex items-center space-x-1 cursor-pointer ml-0"
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div 
            className="text-5xl"
            animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🥚
          </motion.div>
          <span className="text-4xl font-extrabold" style={{ color: '#0071F7' }}>
            EggNS
          </span>
        </motion.button>
        
        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-6">
            <motion.button 
              onClick={() => navigateToPage('names')}
              className={`font-medium transition-all duration-200 ease focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 px-3 py-2 rounded-lg ${
                currentPage === 'names'
                  ? 'text-blue-400'
                  : isLiquidGlassMode 
                    ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={!isDarkMode && !isLiquidGlassMode ? {
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: currentPage === 'names' ? '#0071F7' : '#4A5568'
              } : {}}
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              My Names
            </motion.button>
          </nav>

          {/* Liquid Glass Toggle Button */}
          <motion.button
            onClick={toggleLiquidGlass}
            className={`p-3 rounded-full transition-all duration-200 ease theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 ${
              isLiquidGlassMode 
                ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                : isDarkMode 
                  ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            style={!isDarkMode && !isLiquidGlassMode ? {
              backgroundColor: '#F8F9FA',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            } : {}}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            animate={isLiquidGlassMode && !prefersReducedMotion ? { 
              scale: [1, 1.02, 1], 
              opacity: [0.8, 1, 0.8] 
            } : {}}
            transition={isLiquidGlassMode && !prefersReducedMotion ? { duration: 3, repeat: Infinity } : { duration: 0.2, ease: "easeOut" }}
          >
            <Droplets className={`w-4 h-4 ${
              isLiquidGlassMode 
                ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                : ''
            }`} />
          </motion.button>

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-all duration-200 ease theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 ${
              isLiquidGlassMode 
                ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                : isDarkMode 
                  ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            style={!isDarkMode && !isLiquidGlassMode ? {
              backgroundColor: '#F8F9FA',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            } : {}}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <motion.div
              className="icon-rotate"
              animate={prefersReducedMotion ? {} : { rotate: isDarkMode ? 0 : 180 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {isDarkMode ? 
                <Moon className={`w-4 h-4 ${
                  isLiquidGlassMode ? `liquid-glass-text ${isDarkMode ? '' : 'light'}` : ''
                }`} /> : 
                <Sun className={`w-4 h-4 ${
                  isLiquidGlassMode ? `liquid-glass-text ${isDarkMode ? '' : 'light'}` : ''
                }`} />
              }
            </motion.div>
          </motion.button>

          {/* Wallet Button */}
          <motion.button 
            className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg relative overflow-hidden transition-all duration-200 ease focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2"
            style={!isDarkMode ? {
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)'
            } : {}}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotateY: 10 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0"
              whileHover={prefersReducedMotion ? {} : { opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
            <span className="text-sm relative z-10">0x</span>
          </motion.button>
        </div>
      </div>

      {/* Only show the large search bar if NOT on the Names page */}
      {showSearch && currentPage !== 'names' && (
        <div className="relative max-w-2xl mx-auto">
          <form onSubmit={handleSearch}>
            <LiquidGlassComponent
              displacementScale={100}
              blurAmount={0.5}
              saturation={140}
              aberrationIntensity={2}
              elasticity={0.35}
              cornerRadius={32}
              mode="polar"
              overLight={!isDarkMode}
              mouseContainer={containerRef}
            >
              <motion.div
                className="relative"
                whileFocus={prefersReducedMotion ? {} : { scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Search className={`absolute left-8 top-1/2 transform -translate-y-1/2 h-6 w-6 z-10 transition-colors duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-16 pr-10 py-6 rounded-3xl text-xl font-medium transition-all duration-300 theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isLiquidGlassMode 
                      ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight liquid-glass-text ${isDarkMode ? '' : 'light'} placeholder:opacity-70`
                      : isDarkMode 
                        ? 'bg-gray-800/50 border border-gray-700/50 text-white placeholder:text-gray-400 hover:bg-gray-800/70 focus:bg-gray-800/70 focus:border-blue-500/50' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 hover:bg-white focus:bg-white focus:border-blue-500 shadow-lg'
                  }`}
                />
                {searchQuery && !searchQuery.endsWith('.egg') && (
                  <motion.div 
                    className={`absolute right-8 top-1/2 transform -translate-y-1/2 text-xl font-medium transition-colors duration-300 ${
                      isLiquidGlassMode 
                        ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    .egg
                  </motion.div>
                )}
              </motion.div>
            </LiquidGlassComponent>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <LiquidGlassComponent
                displacementScale={80}
                blurAmount={0.3}
                saturation={120}
                aberrationIntensity={1.5}
                elasticity={0.25}
                cornerRadius={24}
                mode="standard"
                overLight={!isDarkMode}
                mouseContainer={containerRef}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-full mt-3 w-full backdrop-blur-md rounded-2xl shadow-2xl z-20 theme-transition ${
                    isLiquidGlassMode 
                      ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                      : isDarkMode 
                        ? 'bg-gray-800/90 border border-gray-700/50' 
                        : 'bg-white/95 border border-gray-300 shadow-xl'
                  }`}
                >
                  {filteredSuggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion}
                      className={`px-8 py-4 cursor-pointer transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl text-lg theme-transition ${
                        isLiquidGlassMode 
                          ? `hover:bg-white/[0.12] liquid-glass-text ${isDarkMode ? '' : 'light'}`
                          : isDarkMode 
                            ? 'hover:bg-gray-700/50 text-white' 
                            : 'hover:bg-gray-50 text-gray-900'
                      }`}
                      onClick={() => selectSuggestion(suggestion)}
                      whileHover={prefersReducedMotion ? {} : { x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>{suggestion}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </LiquidGlassComponent>
            )}
          </form>
        </div>
      )}
    </header>
  );
};

export default EggNSHeader; 