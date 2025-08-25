import { useState, useEffect, useCallback } from 'react';
import { eggnsNameService } from '../services/name-service';
import { 
  NameRecord, 
  NameRegistrationParams, 
  CrossChainNameParams,
  CrossChainNameTransferParams,
  BridgeClaimParams,
  NameSearchResult,
  CrossChainOperation
} from '../types/names';

export const useEggNS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [crossChainOperations, setCrossChainOperations] = useState<CrossChainOperation[]>([]);

  // Initialize the service
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        await eggnsNameService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize EggNS service:', error);
        setError('Failed to initialize service');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      initializeService();
    }
  }, [isInitialized]);

  const registerName = useCallback(async (params: NameRegistrationParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await eggnsNameService.registerName(params);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to register name';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerAndBridgeName = useCallback(async (params: CrossChainNameParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add to cross-chain operations tracking
      const operation: CrossChainOperation = {
        operationType: 'register',
        name: params.name,
        sourceNetwork: params.sourceNetworkId,
        destinationNetwork: params.destinationNetworkId,
        status: 'pending',
        timestamp: Date.now()
      };
      setCrossChainOperations(prev => [operation, ...prev]);
      
      const result = await eggnsNameService.registerAndBridgeName(params);
      
      // Update operation with bridge transaction hash
      setCrossChainOperations(prev => 
        prev.map(op => 
          op === operation 
            ? { ...op, bridgeTransactionHash: result.bridgeTransactionHash, status: 'bridged' }
            : op
        )
      );
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to register and bridge name';
      setError(errorMessage);
      
      // Update operation status to failed
      setCrossChainOperations(prev => 
        prev.map(op => 
          op.timestamp === Date.now() 
            ? { ...op, status: 'failed' }
            : op
        )
      );
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transferNameCrossChain = useCallback(async (params: CrossChainNameTransferParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add to cross-chain operations tracking
      const operation: CrossChainOperation = {
        operationType: 'transfer',
        name: params.name,
        sourceNetwork: params.sourceNetworkId,
        destinationNetwork: params.destinationNetworkId,
        status: 'pending',
        timestamp: Date.now()
      };
      setCrossChainOperations(prev => [operation, ...prev]);
      
      const result = await eggnsNameService.transferNameCrossChain(
        params.name,
        params.newOwner,
        params.sourceNetworkId,
        params.destinationNetworkId
      );
      
      // Update operation status
      setCrossChainOperations(prev => 
        prev.map(op => 
          op === operation 
            ? { ...op, bridgeTransactionHash: result.transactionHash, status: 'bridged' }
            : op
        )
      );
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to transfer name cross-chain';
      setError(errorMessage);
      
      // Update operation status to failed
      setCrossChainOperations(prev => 
        prev.map(op => 
          op.operationType === 'transfer' && op.name === params.name
            ? { ...op, status: 'failed' }
            : op
        )
      );
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimCrossChainMessage = useCallback(async (params: BridgeClaimParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await eggnsNameService.claimCrossChainMessage(
        params.bridgeTransactionHash,
        params.sourceNetworkId,
        params.destinationNetworkId
      );
      
      // Update operation status to claimed
      setCrossChainOperations(prev => 
        prev.map(op => 
          op.bridgeTransactionHash === params.bridgeTransactionHash
            ? { ...op, status: 'claimed' }
            : op
        )
      );
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to claim cross-chain message';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const waitForBridgeCompletion = useCallback(async (
    bridgeTransactionHash: string,
    sourceNetworkId: number,
    timeoutMs?: number
  ): Promise<boolean> => {
    try {
      setError(null);
      return await eggnsNameService.waitForBridgeCompletion(
        bridgeTransactionHash,
        sourceNetworkId,
        timeoutMs
      );
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to wait for bridge completion';
      setError(errorMessage);
      return false;
    }
  }, []);

  const resolveName = useCallback(async (name: string, networkId: number): Promise<NameRecord | null> => {
    try {
      setError(null);
      return await eggnsNameService.resolveName(name, networkId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to resolve name';
      setError(errorMessage);
      return null;
    }
  }, []);

  const searchName = useCallback(async (name: string): Promise<NameSearchResult> => {
    try {
      setError(null);
      
      const networks = [0, 1]; // Sepolia and Cardona
      const results = await Promise.all(
        networks.map(networkId => eggnsNameService.resolveName(name, networkId))
      );

      const availableNetworks: number[] = [];
      let owner: string | undefined;
      let expirationTime: string | undefined;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result === null) {
          availableNetworks.push(networks[i]);
        } else {
          owner = result.owner;
          expirationTime = result.expirationTime;
        }
      }

      return {
        name,
        isAvailable: availableNetworks.length > 0,
        owner,
        expirationTime,
        networks: availableNetworks
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to search name';
      setError(errorMessage);
      return {
        name,
        isAvailable: false,
        networks: []
      };
    }
  }, []);

  const getOwnerNames = useCallback(async (owner: string, networkId: number): Promise<string[]> => {
    try {
      setError(null);
      return await eggnsNameService.getOwnerNames(owner, networkId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get owner names';
      setError(errorMessage);
      return [];
    }
  }, []);

  const transferName = useCallback(async (name: string, newOwner: string, networkId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await eggnsNameService.transferName(name, newOwner, networkId);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to transfer name';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renewName = useCallback(async (name: string, networkId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const renewalFee = await eggnsNameService.getRenewalFee(networkId);
      const result = await eggnsNameService.renewName(name, networkId, renewalFee);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to renew name';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkNameAvailability = useCallback(async (name: string, networkId: number): Promise<boolean> => {
    try {
      setError(null);
      return await eggnsNameService.checkNameAvailability(name, networkId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to check name availability';
      setError(errorMessage);
      return false;
    }
  }, []);

  const getRegistrationFee = useCallback(async (networkId: number): Promise<string> => {
    try {
      setError(null);
      return await eggnsNameService.getRegistrationFee(networkId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get registration fee';
      setError(errorMessage);
      return '1000000000000000'; // 0.001 ETH fallback
    }
  }, []);

  const getRenewalFee = useCallback(async (networkId: number): Promise<string> => {
    try {
      setError(null);
      return await eggnsNameService.getRenewalFee(networkId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get renewal fee';
      setError(errorMessage);
      return '500000000000000'; // 0.0005 ETH fallback
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCrossChainOperations = useCallback(() => {
    setCrossChainOperations([]);
  }, []);

  return {
    // State
    isLoading,
    error,
    isInitialized,
    crossChainOperations,

    // Actions
    registerName,
    registerAndBridgeName,
    transferNameCrossChain,
    claimCrossChainMessage,
    waitForBridgeCompletion,
    resolveName,
    searchName,
    getOwnerNames,
    transferName,
    renewName,
    checkNameAvailability,
    getRegistrationFee,
    getRenewalFee,
    clearError,
    clearCrossChainOperations
  };
};
