'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Spotlight } from './ui/spotlight';
import { TextGenerateEffect } from './ui/text-generate-effect';
import { FloatingNav } from './ui/floating-navbar';
import { useReducedMotion as useReducedMotionHook } from '../hooks/useReducedMotion';
import { useTheme } from './ThemeProvider';
import { useLiquidGlass } from './LiquidGlassProvider';
import { useNameRegistration } from '../hooks/useNameRegistration';
import EggNSHeader from './EggNSHeader';

const EggNSHomepage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [registrationName, setRegistrationName] = useState('');
  const prefersReducedMotion = useReducedMotionHook();
  const { isDarkMode } = useTheme();
  const { isLiquidGlassMode, LiquidGlassComponent } = useLiquidGlass();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Registration hook
  const { state: registrationState, registerName, checkAvailability, reset } = useNameRegistration();

  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />,
    },
    {
      name: "My Names",
      link: "#",
      icon: <User className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Apply theme and liquid glass classes to the eggns-app container
    const eggnsApp = document.querySelector('.eggns-app');
    if (eggnsApp) {
      // Remove all classes first
      eggnsApp.classList.remove('dark', 'light', 'liquid-glass');
      
      // Add theme class
      if (isDarkMode) {
        eggnsApp.classList.add('dark');
      } else {
        eggnsApp.classList.add('light');
      }
      
      // Add liquid glass class
      if (isLiquidGlassMode) {
        eggnsApp.classList.add('liquid-glass');
      }
    }
  }, [isDarkMode, isLiquidGlassMode]);

  const animationProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  // Handle name registration
  const handleRegistration = async () => {
    if (!registrationName.trim()) {
      return;
    }
    
    try {
      const result = await registerName(registrationName);
      if (result.success) {
        console.log('🎉 Registration successful!', result);
        // The UI will automatically update based on registrationState
      } else {
        console.error('❌ Registration failed:', result.error);
        // The UI will show the error from registrationState
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <motion.div
          className="text-4xl"
          animate={prefersReducedMotion ? {} : { rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          🥚
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen w-full relative overflow-hidden transition-all duration-500 ease-in-out ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white' 
          : 'bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 text-gray-900'
      }`}
      style={!isDarkMode ? { backgroundColor: '#FAFAFA' } : {}}
    >
      {/* Liquid Glass Gradient Overlays */}
      <AnimatePresence>
        {isLiquidGlassMode && (
          <>
            {/* Left Gradient Overlay */}
            <motion.div
              className={`gradient-overlay-left ${isDarkMode ? '' : 'light'}`}
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            />
            
            {/* Right Gradient Overlay */}
            <motion.div
              className={`gradient-overlay-right ${isDarkMode ? '' : 'light'}`}
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            />
            
            {/* Radial Overlays */}
            <motion.div
              className="radial-overlay-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
            
            <motion.div
              className="radial-overlay-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            
            {/* Dark Base Overlay */}
            <motion.div
              className={`dark-base-overlay ${isDarkMode ? '' : 'light'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Spotlight Background Effects */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill={isDarkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)"}
      />
      <Spotlight
        className="-top-40 right-0 md:right-60 md:-top-20"
        fill={isDarkMode ? "rgba(147, 51, 234, 0.15)" : "rgba(147, 51, 234, 0.06)"}
      />
      
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950' 
          : 'bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100'
      }`}></div>
      
      {/* Floating Navigation with Liquid Glass */}
      <div className="relative z-30">
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
          <FloatingNav 
            navItems={navItems} 
            className={`theme-transition ${
              isLiquidGlassMode 
                ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                : isDarkMode 
                  ? 'bg-black/20 backdrop-blur-md border border-white/[0.1]' 
                  : 'bg-white/60 backdrop-blur-md border border-gray-300/50 shadow-lg'
            }`}
          />
        </LiquidGlassComponent>
      </div>
      
      {/* Header - Positioned above overlays */}
      <div className="relative z-40">
        <EggNSHeader currentPage="home" showSearch={false} />
      </div>

      {/* Main Content - Positioned above overlays */}
      <main className="relative z-40 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Animated Main Heading */}
          <motion.div 
            className={`text-center transition-colors duration-200 ease ${
              isLiquidGlassMode 
                ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                : isDarkMode ? 'text-white' : ''
            }`}
            style={!isDarkMode && !isLiquidGlassMode ? { color: '#1A1A1A' } : {}}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className={`text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-semibold text-center transition-all duration-200 ease focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 ${
              isLiquidGlassMode 
                ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                : isDarkMode ? 'text-white' : ''
            }`}
            style={!isDarkMode && !isLiquidGlassMode ? { color: '#1A1A1A', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' } : {}}
            tabIndex={0}
            >
              Your <span style={{ color: '#0071F7' }}>Agglayer</span> Name
            </h1>
          </motion.div>

          {/* Animated Subtitle */}
          <motion.p 
            className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto font-light transition-colors duration-200 ease ${
              isLiquidGlassMode 
                ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                : isDarkMode ? 'text-gray-400' : ''
            }`}
            style={!isDarkMode && !isLiquidGlassMode ? { 
              color: '#4A5568', 
              lineHeight: '1.5',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '30px'
            } : { lineHeight: '1.5' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Your Name across all Aggregated chains 
          </motion.p>

          {/* Main Registration Form */}
          <motion.div 
            className="relative max-w-xl mx-auto mb-12"
            style={{ marginBottom: '8rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* Registration Card */}
            <LiquidGlassComponent
              displacementScale={150}
              blurAmount={0.8}
              saturation={180}
              aberrationIntensity={3}
              elasticity={0.5}
              cornerRadius={24}
              mode="standard"
              overLight={!isDarkMode}
              mouseContainer={containerRef}
            >
              <div className={`p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
                isLiquidGlassMode 
                  ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight border-white/20`
                  : isDarkMode 
                    ? 'bg-gray-800/40 border-gray-700/50 shadow-2xl' 
                    : 'bg-white/60 border-gray-200/50 shadow-2xl'
              }`}
              style={!isDarkMode && !isLiquidGlassMode ? {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(229, 231, 235, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
              } : {}}
              >
                {/* Input Field */}
            <LiquidGlassComponent
              displacementScale={100}
              blurAmount={0.5}
              saturation={140}
              aberrationIntensity={2}
              elasticity={0.35}
                  cornerRadius={20}
              mode="polar"
              overLight={!isDarkMode}
              mouseContainer={containerRef}
            >
                  <div className="relative mb-6">
                <input
                  type="text"
                      value={registrationName}
                      onChange={(e) => setRegistrationName(e.target.value)}
                      placeholder="Register your name"
                  className={`w-full px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-200 ease theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 hover:shadow-md ${
                    isLiquidGlassMode 
                      ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight liquid-glass-text ${isDarkMode ? '' : 'light'} placeholder:opacity-70`
                      : isDarkMode 
                            ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder:text-gray-400 hover:bg-gray-700/70 focus:bg-gray-700/70 focus:border-blue-500/50' 
                            : 'border border-gray-300/50 text-gray-900 hover:border-gray-400/50 focus:border-blue-500 bg-white/70'
                  }`}
                  style={!isDarkMode && !isLiquidGlassMode ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(229, 231, 235, 0.4)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '16px'
                  } : {}}
                  onFocus={(e) => {
                    if (!isDarkMode && !isLiquidGlassMode) {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                          e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!isDarkMode && !isLiquidGlassMode) {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                          e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                />
                <style jsx>{`
                  input::placeholder {
                    color: ${!isDarkMode && !isLiquidGlassMode ? '#6B7280' : ''} !important;
                    opacity: 1 !important;
                  }
                `}</style>
              </div>
            </LiquidGlassComponent>

                {/* Register Name Button */}
                <div className="flex justify-center mt-6">
                  <motion.button
                    type="button"
                    onClick={handleRegistration}
                    disabled={registrationState.isLoading || !registrationName.trim()}
                    className={`min-w-[260px] max-w-[400px] w-full md:w-1/2 py-4 rounded-2xl text-2xl font-semibold transition-all duration-200 ease theme-transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 shadow-md flex items-center justify-center ${
                      isLiquidGlassMode 
                        ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight liquid-glass-text ${isDarkMode ? '' : 'light'}`
                      : isDarkMode 
                          ? 'bg-blue-700/80 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  style={!isDarkMode && !isLiquidGlassMode ? {
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: '24px',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
                    } : {}}
                  >
                    {registrationState.isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="text-xl md:text-2xl lg:text-3xl font-semibold"
                          style={!isDarkMode && !isLiquidGlassMode ? {
                            color: '#1A1A1A',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          } : {}}
                        >
                          Registering your .egg domain...
                        </span>
                      </div>
                    ) : (
                  <span className="text-2xl md:text-3xl lg:text-4xl font-semibold flex items-center justify-center w-full text-center"
                    style={!isDarkMode && !isLiquidGlassMode ? {
                      color: '#1A1A1A',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    } : {}}
                  >
                        Register name
                  </span>
                    )}
                  </motion.button>
                </div>
              </div>
            </LiquidGlassComponent>
            
            {/* Registration Status & Progress */}
            <AnimatePresence>
              {(registrationState.isLoading || registrationState.result || registrationState.error) && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <LiquidGlassComponent
                    displacementScale={100}
                    blurAmount={0.4}
                    saturation={140}
                    aberrationIntensity={2}
                    elasticity={0.3}
                    cornerRadius={16}
                    mode="standard"
                    overLight={!isDarkMode}
                    mouseContainer={containerRef}
                  >
                    <div className={`p-4 rounded-2xl backdrop-blur-lg border transition-all duration-300 ${
                      isLiquidGlassMode 
                        ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight border-white/20`
                        : isDarkMode 
                          ? 'bg-gray-800/40 border-gray-700/50' 
                          : 'bg-white/60 border-gray-200/50'
                    }`}>
                      
                      {/* Loading State */}
                      {registrationState.isLoading && (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          <div className="flex-1">
                            <div className={`font-medium ${
                              isLiquidGlassMode 
                                ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                                : isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {registrationState.currentStep}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className={`mt-2 w-full bg-gray-200 rounded-full h-2 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${registrationState.progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                              />
                            </div>
                            
                            <div className={`text-sm mt-1 ${
                              isLiquidGlassMode 
                                ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {registrationState.progress}% complete
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Success State */}
                      {registrationState.result?.success && !registrationState.isLoading && (
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div className="flex-1">
                            <div className={`font-medium ${
                              isLiquidGlassMode 
                                ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                                : isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Registration Successful!
                            </div>
                            <div className={`text-sm mt-1 ${
                              isLiquidGlassMode 
                                ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Name "{registrationState.result.name}" has been registered and bridged to Cardona.
                            </div>
                            {registrationState.result.transactionHash && (
                              <div className={`text-xs mt-2 font-mono ${
                                isLiquidGlassMode 
                                  ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                                  : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                TX: {registrationState.result.transactionHash.slice(0, 10)}...{registrationState.result.transactionHash.slice(-8)}
                              </div>
                            )}
                            <button
                              onClick={reset}
                              className={`mt-3 px-3 py-1 rounded-lg text-sm transition-colors ${
                                isDarkMode 
                                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              Register Another Name
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Error State */}
                      {(registrationState.error || (registrationState.result && !registrationState.result.success)) && !registrationState.isLoading && (
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <div className={`font-medium ${
                              isLiquidGlassMode 
                                ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
                                : isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Registration Failed
                            </div>
                            <div className={`text-sm mt-1 ${
                              isLiquidGlassMode 
                                ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {registrationState.error || registrationState.result?.message}
                            </div>
                            <button
                              onClick={reset}
                              className={`mt-3 px-3 py-1 rounded-lg text-sm transition-colors ${
                                isDarkMode 
                                  ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      )}
                      
                    </div>
                  </LiquidGlassComponent>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <motion.div 
          className={`absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl transition-colors duration-500 ${
            isDarkMode ? 'bg-blue-500/10' : 'bg-blue-400/8'
          }`}
          animate={prefersReducedMotion ? {} : { 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${
            isDarkMode ? 'bg-purple-500/10' : 'bg-purple-400/6'
          }`}
          animate={prefersReducedMotion ? {} : { 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -60, 0],
            y: [0, 40, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2 
          }}
        />
        <motion.div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl transition-colors duration-500 ${
            isDarkMode ? 'bg-green-500/5' : 'bg-green-400/4'
          }`}
          animate={prefersReducedMotion ? {} : { 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 4 
          }}
        />
      </div>

      {/* Floating Info Card at Bottom Center */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
        <div className="max-w-md w-full px-4">
          <LiquidGlassComponent
            displacementScale={80}
            blurAmount={0.3}
            saturation={120}
            aberrationIntensity={1.5}
            elasticity={0.25}
            cornerRadius={20}
            mode="standard"
            overLight={!isDarkMode}
          >
            <div className={`rounded-2xl px-8 py-6 flex items-center justify-center text-xl font-semibold shadow-md border transition-colors duration-300 pointer-events-auto ${
              isLiquidGlassMode
                ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
                : isDarkMode
                  ? 'bg-gray-800/60 border-gray-700 text-white'
                  : 'bg-white/80 border-gray-200 text-gray-900'
            }`}
            >
              <span className="text-2xl mr-2">🥚</span> get your .egg domains
            </div>
          </LiquidGlassComponent>
        </div>
      </div>
    </div>
  );
};

export default EggNSHomepage; 