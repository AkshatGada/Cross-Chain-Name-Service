import { useState, useEffect, useCallback, useRef } from 'react';
import { multiChainNameService } from '../services/multi-chain-name-service';
import { MultiChainNameState, MultiChainNameActions, ChainNameData, EggName } from '../types/names';

const REFRESH_INTERVAL = 30000; // 30 seconds
const CACHE_DURATION = 60000; // 1 minute

export const useMultiChainNames = (
  connectedAddress?: string,
  autoRefresh: boolean = true
): MultiChainNameState & MultiChainNameActions => {
  const [state, setState] = useState<MultiChainNameState>({
    chains: {},
    mergedNames: [],
    isLoading: false,
    hasError: false,
    lastRefresh: null,
    connectedAddress: null
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<{ address: string; timestamp: number } | null>(null);

  // Clear refresh interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Clear data when address changes
  const clearData = useCallback(() => {
    setState({
      chains: {},
      mergedNames: [],
      isLoading: false,
      hasError: false,
      lastRefresh: null,
      connectedAddress: null
    });
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Fetch names from all chains
  const fetchNames = useCallback(async (address: string) => {
    if (!address) {
      clearData();
      return;
    }

    // Check cache to avoid unnecessary requests
    const now = Date.now();
    if (
      lastFetchRef.current?.address === address &&
      now - lastFetchRef.current.timestamp < CACHE_DURATION
    ) {
      console.log('📋 Using cached data for', address);
      return;
    }

    console.log('🔄 Fetching names for address:', address);

    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      connectedAddress: address
    }));

    try {
      // Fetch from all chains
      const chainData = await multiChainNameService.fetchNamesFromAllChains(address);
      
      // Merge names from all chains
      const mergedNames = multiChainNameService.mergeNamesFromChains(chainData);
      
      // Check if any chain had errors
      const hasError = Object.values(chainData).some(data => data.error !== null);
      
      setState(prev => ({
        ...prev,
        chains: chainData,
        mergedNames,
        isLoading: false,
        hasError,
        lastRefresh: now,
        connectedAddress: address
      }));

      // Update cache
      lastFetchRef.current = { address, timestamp: now };
      
      console.log(`✅ Fetched ${mergedNames.length} unique names across all chains`);
      
    } catch (error) {
      console.error('❌ Failed to fetch names:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        lastRefresh: now
      }));
    }
  }, [clearData]);

  // Refresh current data
  const refreshNames = useCallback(async () => {
    if (state.connectedAddress) {
      // Force refresh by clearing cache
      lastFetchRef.current = null;
      await fetchNames(state.connectedAddress);
    }
  }, [state.connectedAddress, fetchNames]);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && connectedAddress && !refreshIntervalRef.current) {
      refreshIntervalRef.current = setInterval(() => {
        if (state.connectedAddress && !state.isLoading) {
          console.log('🔄 Auto-refreshing names...');
          refreshNames();
        }
      }, REFRESH_INTERVAL);
    }

    if (!autoRefresh && refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, connectedAddress, state.connectedAddress, state.isLoading, refreshNames]);

  // Fetch names when address changes
  useEffect(() => {
    if (connectedAddress && connectedAddress !== state.connectedAddress) {
      fetchNames(connectedAddress);
    } else if (!connectedAddress && state.connectedAddress) {
      clearData();
    }
  }, [connectedAddress, state.connectedAddress, fetchNames, clearData]);

  return {
    ...state,
    fetchNames,
    refreshNames,
    clearData
  };
};

// Additional hook for checking individual name availability across chains
export const useNameChecker = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<Record<number, {
    exists: boolean;
    owner?: string;
    available?: boolean;
    error?: string;
  }>>({});

  const checkName = useCallback(async (name: string) => {
    if (!name) {
      setResults({});
      return;
    }

    setChecking(true);
    const newResults: typeof results = {};

    const promises = multiChainNameService.getSupportedChains().map(async (chainInfo) => {
      try {
        const result = await multiChainNameService.checkNameOnChain(name, chainInfo.chainId);
        newResults[chainInfo.chainId] = result;
      } catch (error) {
        newResults[chainInfo.chainId] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    await Promise.allSettled(promises);
    setResults(newResults);
    setChecking(false);
  }, []);

  const clearResults = useCallback(() => {
    setResults({});
  }, []);

  return {
    checking,
    results,
    checkName,
    clearResults
  };
};

// Hook for service health monitoring
export const useServiceHealth = () => {
  const [healthStatus, setHealthStatus] = useState<Record<number, boolean>>({});
  const [lastCheck, setLastCheck] = useState<number | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const status = await multiChainNameService.isServiceHealthy();
      setHealthStatus(status);
      setLastCheck(Date.now());
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    healthStatus,
    lastCheck,
    checkHealth
  };
}; 