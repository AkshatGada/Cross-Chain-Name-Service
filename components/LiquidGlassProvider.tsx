'use client';

import React, { createContext, useContext, useState, useEffect, Suspense, lazy } from 'react';

// Lazy load the LiquidGlass component for performance
const LiquidGlass = lazy(() => import('liquid-glass-react'));

interface LiquidGlassContextType {
  isLiquidGlassMode: boolean;
  toggleLiquidGlass: () => void;
  LiquidGlassComponent: React.ComponentType<any>;
}

const LiquidGlassContext = createContext<LiquidGlassContextType | undefined>(undefined);

export const useLiquidGlass = () => {
  const context = useContext(LiquidGlassContext);
  if (context === undefined) {
    throw new Error('useLiquidGlass must be used within a LiquidGlassProvider');
  }
  return context;
};

export const LiquidGlassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiquidGlassMode, setIsLiquidGlassMode] = useState(false);

  const toggleLiquidGlass = () => {
    setIsLiquidGlassMode(prev => !prev);
  };

  // Apply independence effects when liquid glass mode is toggled
  useEffect(() => {
    const eggnsApp = document.querySelector('.eggns-app');
    if (!eggnsApp) return;

    if (isLiquidGlassMode) {
      // Make completely independent
      eggnsApp.classList.add('liquid-glass');
      
      // Ensure maximum viewport capture
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      // Hide any potential parent containers
      const parentElements = document.querySelectorAll('body > *:not(.eggns-app)');
      parentElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
      
      // Ensure app is at the very top of rendering stack
      (eggnsApp as HTMLElement).style.zIndex = '999999';
      (eggnsApp as HTMLElement).style.position = 'fixed';
      (eggnsApp as HTMLElement).style.inset = '0';
      (eggnsApp as HTMLElement).style.isolation = 'isolate';
      
    } else {
      // Restore normal behavior
      eggnsApp.classList.remove('liquid-glass');
      
      // Restore scrolling
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      
      // Show parent elements again
      const parentElements = document.querySelectorAll('body > *:not(.eggns-app)');
      parentElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
      
      // Reset z-index to normal level
      (eggnsApp as HTMLElement).style.zIndex = '99999';
    }

    // Cleanup function
    return () => {
      if (isLiquidGlassMode) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        const parentElements = document.querySelectorAll('body > *:not(.eggns-app)');
        parentElements.forEach(el => {
          (el as HTMLElement).style.display = '';
        });
      }
    };
  }, [isLiquidGlassMode]);

  // Wrapper component for LiquidGlass with enhanced independence
  const LiquidGlassComponent: React.FC<any> = ({ children: glassChildren, ...props }) => {
    if (!isLiquidGlassMode) {
      return glassChildren;
    }

    return (
      <Suspense fallback={<div className="opacity-0">{glassChildren}</div>}>
        <LiquidGlass 
          {...props}
          style={{
            isolation: 'isolate',
            position: 'relative',
            zIndex: 'auto',
            ...props.style
          }}
        >
          {glassChildren}
        </LiquidGlass>
      </Suspense>
    );
  };

  return (
    <LiquidGlassContext.Provider value={{ 
      isLiquidGlassMode, 
      toggleLiquidGlass, 
      LiquidGlassComponent 
    }}>
      {children}
    </LiquidGlassContext.Provider>
  );
}; 