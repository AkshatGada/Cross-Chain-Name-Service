'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  Search, 
  Info, 
  RefreshCw, 
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { useLiquidGlass } from '../components/LiquidGlassProvider';
import EggNSHeader from '../components/EggNSHeader';
import { useMultiChainNames, useServiceHealth } from '../hooks/useMultiChainNames';
import { NameCard } from '../components/ui/NameCard';
import { NameGridSkeleton, ChainStatusSkeleton } from '../components/ui/LoadingSkeleton';
import { ChainBadge, MultiChainBadge } from '../components/ui/ChainBadge';
import { SUPPORTED_CHAINS } from '../services/multi-chain-name-service';

const MyNamesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHealthStatus, setShowHealthStatus] = useState(false);
  
  const { isDarkMode } = useTheme();
  const { isLiquidGlassMode, LiquidGlassComponent } = useLiquidGlass();

  // Get the actual connected wallet address from Wagmi
  const { address: connectedAddress, isConnected } = useAccount();

  // Multi-chain names hook with real connected address
  const {
    chains,
    mergedNames,
    isLoading,
    hasError,
    lastRefresh,
    fetchNames,
    refreshNames,
    clearData
  } = useMultiChainNames(connectedAddress, true);

  // Service health monitoring
  const { healthStatus, checkHealth } = useServiceHealth();

  const filteredNames = mergedNames.filter(name =>
    name.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastRefresh = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  const getTotalNameCount = () => {
    return Object.values(chains).reduce((total, chain) => total + chain.names.length, 0);
  };

  const getHealthyChainCount = () => {
    return Object.values(healthStatus).filter(Boolean).length;
  };

  const isRefreshing = isLoading && mergedNames.length === 0;
  const totalChains = Object.keys(SUPPORTED_CHAINS).length;
  const connectedChains = healthStatus ? 
    Object.values(healthStatus).filter(status => status === true).length : 0;

  // Auto health check
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!isConnected || !connectedAddress) {
      return;
    }
    
    await refreshNames();
    await checkHealth();
  };

  // Show wallet connection prompt if not connected
  if (!isConnected || !connectedAddress) {
    return (
      <div className="min-h-screen">
        <EggNSHeader />
        <div className="container mx-auto px-4 pt-32">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Names</h1>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-16 rounded-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50' 
                : 'bg-white/50 border border-gray-200/50'
            }`}
          >
            <div className="max-w-md mx-auto">
              <WifiOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-500 mb-6">
                Please connect your wallet to view your .egg domains across all chains.
              </p>
              <div className="text-sm text-gray-400">
                We'll check both Sepolia and Cardona networks for your registered names.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <EggNSHeader currentPage="names" />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Page Title & Status */}
        <div className="flex items-center justify-between mb-8">
        <motion.h1 
            className={`text-4xl font-bold transition-colors duration-300 ${
            isLiquidGlassMode 
              ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
              : isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Names
        </motion.h1>

          {/* Status & Actions */}
        <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
            {/* Chain Health Indicator */}
            <LiquidGlassComponent
              displacementScale={60}
              blurAmount={0.2}
              saturation={110}
              aberrationIntensity={1}
              elasticity={0.2}
              cornerRadius={8}
              mode="standard"
              overLight={!isDarkMode}
            >
              <button
                onClick={() => setShowHealthStatus(!showHealthStatus)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                    : isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {getHealthyChainCount() === Object.keys(SUPPORTED_CHAINS).length ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className={`${
                  isLiquidGlassMode 
                    ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                    : ''
                }`}>
                  {getHealthyChainCount()}/{Object.keys(SUPPORTED_CHAINS).length}
                </span>
              </button>
            </LiquidGlassComponent>

            {/* Refresh Button */}
            <LiquidGlassComponent
              displacementScale={60}
              blurAmount={0.2}
              saturation={110}
              aberrationIntensity={1}
              elasticity={0.2}
              cornerRadius={8}
              mode="standard"
              overLight={!isDarkMode}
            >
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                    : isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className={`${
                    isLiquidGlassMode 
                      ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                      : ''
                  }`}>
                  Refresh
                  </span>
                </button>
            </LiquidGlassComponent>
          </motion.div>
        </div>

        {/* Chain Health Status Panel */}
        <AnimatePresence>
          {showHealthStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(SUPPORTED_CHAINS).map((chain) => {
                  const chainData = chains[chain.chainId];
                  const isHealthy = healthStatus[chain.chainId];
                  
                  return (
            <LiquidGlassComponent
                      key={chain.chainId}
              displacementScale={80}
              blurAmount={0.3}
              saturation={120}
              aberrationIntensity={1.5}
              elasticity={0.25}
              cornerRadius={12}
              mode="standard"
              overLight={!isDarkMode}
            >
                      <div className={`p-4 rounded-lg border transition-all duration-300 ${
                isLiquidGlassMode 
                  ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                  : isDarkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${chain.color}20`, border: `2px solid ${chain.color}` }}
                            >
                              <span className="text-xs font-bold" style={{ color: chain.color }}>
                                {chain.shortName}
                              </span>
                            </div>
                            <div>
                              <div className={`font-medium ${
                                isLiquidGlassMode 
                                  ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                                  : isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {chain.name}
                              </div>
                              <div className={`text-sm ${
                                isLiquidGlassMode 
                                  ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                                  : isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                                {chainData?.names.length || 0} names
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {chainData?.loading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                            ) : chainData?.error ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : isHealthy ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        
                        {chainData?.error && (
                          <div className="mt-2 text-xs text-red-500 truncate">
                            {chainData.error}
                          </div>
                        )}
                      </div>
            </LiquidGlassComponent>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Stats */}
        {!isLoading && mergedNames.length > 0 && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <LiquidGlassComponent
              displacementScale={80}
              blurAmount={0.3}
              saturation={120}
              aberrationIntensity={1.5}
              elasticity={0.25}
              cornerRadius={16}
              mode="standard"
              overLight={!isDarkMode}
            >
              <div className={`p-4 rounded-lg border transition-colors duration-300 ${
                isLiquidGlassMode 
                  ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                  : isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className={`text-2xl font-bold ${
                        isLiquidGlassMode 
                          ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {mergedNames.length}
                      </div>
                      <div className={`text-sm ${
                        isLiquidGlassMode 
                          ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                          : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Unique Names
                      </div>
                    </div>
                    
                    <div>
                      <div className={`text-2xl font-bold ${
                        isLiquidGlassMode 
                          ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {getTotalNameCount()}
                      </div>
                      <div className={`text-sm ${
                        isLiquidGlassMode 
                          ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                          : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Records
                      </div>
                    </div>
                    
                    <div>
                      <div className={`text-2xl font-bold ${
                        isLiquidGlassMode 
                          ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {mergedNames.filter(name => name.chains.length > 1).length}
                      </div>
                      <div className={`text-sm ${
                        isLiquidGlassMode 
                          ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                          : isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                        Cross-Chain
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm ${
                      isLiquidGlassMode 
                        ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>Last updated: {formatLastRefresh(lastRefresh)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlassComponent>
          </motion.div>
        )}

        {/* Filter Section */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <LiquidGlassComponent
              displacementScale={100}
              blurAmount={0.5}
              saturation={140}
              aberrationIntensity={2}
              elasticity={0.35}
              cornerRadius={16}
              mode="polar"
              overLight={!isDarkMode}
            >
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search names..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isLiquidGlassMode 
                      ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight liquid-glass-text ${isDarkMode ? '' : 'light'} placeholder:opacity-70`
                      : isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:bg-gray-700 focus:border-blue-500/50' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500'
                  }`}
                />
              </div>
            </LiquidGlassComponent>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <NameGridSkeleton count={6} />
            </div>
          )}

          {/* Error State */}
          {!isLoading && hasError && mergedNames.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-red-400' : 'text-red-500'
                }`} />
                <h3 className={`text-xl font-medium mb-2 transition-colors duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                    : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Failed to load names
                </h3>
                <p className={`mb-4 transition-colors duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  There was an error connecting to the blockchain networks. Please try again.
                </p>
                <button
                  onClick={handleRefresh}
                  className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Try Again
                </button>
              </motion.div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && filteredNames.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className={`text-xl font-medium mb-2 transition-colors duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                    : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No names found for this address
                </h3>
                <p className={`transition-colors duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'You don\'t own any .egg domains yet'}
                </p>
                {connectedAddress && (
                  <p className={`text-sm mt-2 font-mono ${
                    isLiquidGlassMode 
                      ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                      : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Checked address: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                  </p>
                )}
              </motion.div>
            </div>
          )}

          {/* Names Grid */}
          {!isLoading && filteredNames.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNames.map((name) => (
                <NameCard 
                  key={name.name} 
                  name={name}
                  onClick={() => {
                    // Handle name click - could open details modal
                    console.log('Clicked name:', name.name);
                  }}
                />
              ))}
            </div>
          )}

          {/* Information Card */}
          {!isLoading && (
            <LiquidGlassComponent
              displacementScale={80}
              blurAmount={0.3}
              saturation={120}
              aberrationIntensity={1.5}
              elasticity={0.25}
              cornerRadius={16}
              mode="standard"
              overLight={!isDarkMode}
            >
              <motion.div 
                className={`rounded-lg p-4 flex items-start gap-3 transition-colors duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                    : isDarkMode 
                      ? 'bg-blue-900/20 border border-blue-800' 
                      : 'bg-blue-50 border border-blue-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 ${
                  isLiquidGlassMode 
                    ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                    : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 transition-colors duration-300 ${
                    isLiquidGlassMode 
                      ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                      : isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Multi-Chain Name System
                  </h4>
                  <p className={`text-sm transition-colors duration-300 ${
                    isLiquidGlassMode 
                      ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                      : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Names are fetched from both Sepolia and Cardona networks simultaneously. Cross-chain names appear with special badges.
                    Data refreshes automatically every 30 seconds.
                  </p>
                </div>
              </motion.div>
            </LiquidGlassComponent>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default MyNamesPage; 