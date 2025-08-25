import { useState, useEffect, useCallback } from 'react';
import { eggnsCredentialService } from '../services/credential-service';
import { 
  Credential, 
  CredentialIssuanceParams, 
  CrossChainCredentialParams,
  CredentialVerificationResult 
} from '../types/credentials';

export const useCredentials = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the service
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        await eggnsCredentialService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize credential service:', error);
        setError('Failed to initialize service');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      initializeService();
    }
  }, [isInitialized]);

  const issueCredential = useCallback(async (params: CredentialIssuanceParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await eggnsCredentialService.issueCredential(params);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to issue credential';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const issueAndBridgeCredential = useCallback(async (params: CrossChainCredentialParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await eggnsCredentialService.issueAndBridgeCredential(params);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to issue and bridge credential';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCredential = useCallback(async (
    tokenId: string, 
    networkId: number, 
    issuerAddress: string
  ): Promise<CredentialVerificationResult> => {
    try {
      setError(null);
      return await eggnsCredentialService.verifyCredential(tokenId, networkId, issuerAddress);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to verify credential';
      setError(errorMessage);
      return {
        isValid: false,
        reason: errorMessage,
        timestamp: Date.now()
      };
    }
  }, []);

  const getCredentialDetails = useCallback(async (tokenId: string, networkId: number): Promise<Credential | null> => {
    try {
      setError(null);
      return await eggnsCredentialService.getCredentialDetails(tokenId, networkId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get credential details';
      setError(errorMessage);
      return null;
    }
  }, []);

  const getCredentialsByHolder = useCallback(async (holder: string, networkId: number): Promise<Credential[]> => {
    try {
      setError(null);
      return await eggnsCredentialService.getCredentialsByHolder(holder, networkId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get credentials by holder';
      setError(errorMessage);
      return [];
    }
  }, []);

  const getCredentialsByType = useCallback(async (credentialType: string, networkId: number): Promise<Credential[]> => {
    try {
      setError(null);
      return await eggnsCredentialService.getCredentialsByType(credentialType, networkId);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get credentials by type';
      setError(errorMessage);
      return [];
    }
  }, []);

  const revokeCredential = useCallback(async (tokenId: string, networkId: number, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await eggnsCredentialService.revokeCredential(tokenId, networkId, reason);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to revoke credential';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    isInitialized,

    // Actions
    issueCredential,
    issueAndBridgeCredential,
    verifyCredential,
    getCredentialDetails,
    getCredentialsByHolder,
    getCredentialsByType,
    revokeCredential,
    clearError
  };
};
