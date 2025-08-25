import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Clock, User, ExternalLink } from 'lucide-react';
import { EggName } from '../../types/names';
import { MultiChainBadge } from './ChainBadge';
import { useTheme } from '../ThemeProvider';
import { useLiquidGlass } from '../LiquidGlassProvider';

interface NameCardProps {
  name: EggName;
  onClick?: () => void;
  className?: string;
}

export const NameCard: React.FC<NameCardProps> = ({
  name,
  onClick,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const { isLiquidGlassMode, LiquidGlassComponent } = useLiquidGlass();

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const cardContent = (
    <div 
      className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-lg group ${
        isLiquidGlassMode 
          ? `liquid-glass-bg ${isDarkMode ? '' : 'light'} liquid-glass-inner-highlight`
          : isDarkMode 
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600' 
            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      } ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-bold transition-colors duration-300 ${
            isLiquidGlassMode 
              ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
              : isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {name.name}
          </h3>
          
          {name.owner && (
            <div className={`flex items-center gap-2 mt-1 transition-colors duration-300 ${
              isLiquidGlassMode 
                ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <User className="w-3 h-3" />
              <span className="text-sm font-mono">
                {formatAddress(name.owner)}
              </span>
            </div>
          )}
        </div>

        {/* Chain badges */}
        <div className="flex flex-col items-end gap-2">
          <MultiChainBadge 
            chains={name.chains} 
            size="sm" 
            showFullNames={false}
          />
          
          {name.isExpired && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
              Expired
            </span>
          )}
        </div>
      </div>

      {/* Records section */}
      {(name.records.address || name.records.email || name.records.website) && (
        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
            isLiquidGlassMode 
              ? `liquid-glass-text ${isDarkMode ? '' : 'light'}`
              : isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Records
          </h4>
          
          <div className="space-y-1">
            {name.records.address && (
              <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                isLiquidGlassMode 
                  ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                  : isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Globe className="w-3 h-3" />
                <span className="font-mono">{formatAddress(name.records.address)}</span>
              </div>
            )}
            
            {name.records.email && (
              <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                isLiquidGlassMode 
                  ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                  : isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span>✉️</span>
                <span>{name.records.email}</span>
              </div>
            )}
            
            {name.records.website && (
              <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                isLiquidGlassMode 
                  ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                  : isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">{name.records.website}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chain details */}
      <div className="pt-4 border-t border-opacity-20 border-gray-300">
        <div className="flex items-center justify-between">
          <div className={`text-sm transition-colors duration-300 ${
            isLiquidGlassMode 
              ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
              : isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Available on {name.chains.length} chain{name.chains.length > 1 ? 's' : ''}
          </div>
          
          {name.expiryDate && (
            <div className={`flex items-center gap-1 text-sm transition-colors duration-300 ${
              isLiquidGlassMode 
                ? `liquid-glass-text-secondary ${isDarkMode ? '' : 'light'}`
                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Clock className="w-3 h-3" />
              <span>Expires {name.expiryDate.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLiquidGlassMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
          {cardContent}
        </LiquidGlassComponent>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {cardContent}
    </motion.div>
  );
};

export default NameCard; 