import React from 'react';
import { ChainInfo } from '../../types/names';
import { useTheme } from '../ThemeProvider';
import { useLiquidGlass } from '../LiquidGlassProvider';

interface ChainBadgeProps {
  chain: ChainInfo;
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
  className?: string;
}

export const ChainBadge: React.FC<ChainBadgeProps> = ({
  chain,
  size = 'md',
  showFullName = false,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const { isLiquidGlassMode, LiquidGlassComponent } = useLiquidGlass();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const badgeContent = (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300 ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${chain.color}20`,
        borderColor: chain.color,
        color: chain.color,
        border: `1px solid ${chain.color}40`
      }}
    >
      {/* Chain color indicator */}
      <span 
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: chain.color }}
      />
      
      {/* Chain name */}
      <span className="font-semibold">
        {showFullName ? chain.name : chain.shortName}
      </span>
    </span>
  );

  if (isLiquidGlassMode) {
    return (
      <LiquidGlassComponent
        displacementScale={60}
        blurAmount={0.2}
        saturation={110}
        aberrationIntensity={1}
        elasticity={0.2}
        cornerRadius={20}
        mode="standard"
        overLight={!isDarkMode}
      >
        {badgeContent}
      </LiquidGlassComponent>
    );
  }

  return badgeContent;
};

interface MultiChainBadgeProps {
  chains: ChainInfo[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  showFullNames?: boolean;
  className?: string;
}

export const MultiChainBadge: React.FC<MultiChainBadgeProps> = ({
  chains,
  maxVisible = 2,
  size = 'md',
  showFullNames = false,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const { isLiquidGlassMode, LiquidGlassComponent } = useLiquidGlass();

  if (chains.length === 0) return null;

  // Show cross-chain badge if name exists on multiple chains
  if (chains.length > 1) {
    const crossChainBadge = (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300 ${
        size === 'sm' ? 'px-2 py-1 text-xs' : 
        size === 'md' ? 'px-3 py-1.5 text-sm' : 
        'px-4 py-2 text-base'
      } ${className}`}
      style={{
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderColor: '#a855f7',
        color: '#a855f7',
        border: '1px solid rgba(168, 85, 247, 0.3)'
      }}>
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
        <span className="font-semibold">Cross-Chain</span>
        <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {chains.length}
        </span>
      </span>
    );

    if (isLiquidGlassMode) {
      return (
        <LiquidGlassComponent
          displacementScale={60}
          blurAmount={0.2}
          saturation={110}
          aberrationIntensity={1}
          elasticity={0.2}
          cornerRadius={20}
          mode="standard"
          overLight={!isDarkMode}
        >
          {crossChainBadge}
        </LiquidGlassComponent>
      );
    }

    return crossChainBadge;
  }

  // Show single chain badge
  return (
    <ChainBadge 
      chain={chains[0]} 
      size={size} 
      showFullName={showFullNames}
      className={className}
    />
  );
};

export default ChainBadge; 