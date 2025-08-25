import React from 'react';
import { useTheme } from '../ThemeProvider';
import { useLiquidGlass } from '../LiquidGlassProvider';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className={`animate-pulse rounded-md ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      } ${className}`}
    />
  );
};

interface NameCardSkeletonProps {
  className?: string;
}

export const NameCardSkeleton: React.FC<NameCardSkeletonProps> = ({ 
  className = '' 
}) => {
  const { isDarkMode } = useTheme();
  const { isLiquidGlassMode, LiquidGlassComponent } = useLiquidGlass();

  const skeletonContent = (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${
      isLiquidGlassMode 
        ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
        : isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
    } ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Records section */}
      <div className="mb-4">
        <Skeleton className="h-4 w-16 mb-2" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-opacity-20 border-gray-300">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLiquidGlassMode) {
    return (
      <LiquidGlassComponent
        displacementScale={100}
        blurAmount={0.4}
        saturation={130}
        aberrationIntensity={1.5}
        elasticity={0.3}
        cornerRadius={16}
        mode="polar"
        overLight={!isDarkMode}
      >
        {skeletonContent}
      </LiquidGlassComponent>
    );
  }

  return skeletonContent;
};

interface NameGridSkeletonProps {
  count?: number;
  className?: string;
}

export const NameGridSkeleton: React.FC<NameGridSkeletonProps> = ({ 
  count = 6, 
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <NameCardSkeleton key={index} />
      ))}
    </div>
  );
};

interface ChainStatusSkeletonProps {
  className?: string;
}

export const ChainStatusSkeleton: React.FC<ChainStatusSkeletonProps> = ({ 
  className = '' 
}) => {
  const { isDarkMode } = useTheme();
  const { isLiquidGlassMode, LiquidGlassComponent } = useLiquidGlass();

  const skeletonContent = (
    <div className={`p-4 rounded-lg border transition-all duration-300 ${
      isLiquidGlassMode 
        ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
        : isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
    } ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  );

  if (isLiquidGlassMode) {
    return (
      <LiquidGlassComponent
        displacementScale={80}
        blurAmount={0.3}
        saturation={120}
        aberrationIntensity={1.5}
        elasticity={0.25}
        cornerRadius={12}
        mode="standard"
        overLight={!isDarkMode}
      >
        {skeletonContent}
      </LiquidGlassComponent>
    );
  }

  return skeletonContent;
};

export default {
  Skeleton,
  NameCardSkeleton,
  NameGridSkeleton,
  ChainStatusSkeleton
}; 