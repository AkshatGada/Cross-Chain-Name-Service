import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { browserRegistrationService, NameRegistrationResult, NameAvailabilityResult } from '../services/browser-registration-service';

export interface RegistrationState {
  isLoading: boolean;
  isCheckingAvailability: boolean;
  isRegistering: boolean;
  currentStep: string;
  result: NameRegistrationResult | null;
  error: string | null;
  progress: number; // 0-100
}

export interface UseNameRegistrationReturn {
  state: RegistrationState;
  checkAvailability: (name: string) => Promise<NameAvailabilityResult>;
  registerName: (name: string) => Promise<NameRegistrationResult>;
  reset: () => void;
}

const REGISTRATION_STEPS = {
  'availability_check': { label: 'Checking availability', progress: 10 },
  'sepolia_registration': { label: 'Registering on Sepolia', progress: 30 },
  'data_verification': { label: 'Verifying registration', progress: 50 },
  'cardona_precheck': { label: 'Checking Cardona', progress: 70 },
  'bridge_to_cardona': { label: 'Bridging to Cardona', progress: 90 },
  'completed': { label: 'Registration completed', progress: 100 }
};

export function useNameRegistration(): UseNameRegistrationReturn {
  const { address: connectedAddress, isConnected } = useAccount();
  
  const [state, setState] = useState<RegistrationState>({
    isLoading: false,
    isCheckingAvailability: false,
    isRegistering: false,
    currentStep: '',
    result: null,
    error: null,
    progress: 0
  });

  const updateState = useCallback((updates: Partial<RegistrationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateProgress = useCallback((step: string) => {
    const stepInfo = REGISTRATION_STEPS[step as keyof typeof REGISTRATION_STEPS];
    if (stepInfo) {
      updateState({
        currentStep: stepInfo.label,
        progress: stepInfo.progress
      });
    }
  }, [updateState]);

  const checkAvailability = useCallback(async (name: string): Promise<NameAvailabilityResult> => {
    if (!name.trim()) {
      return {
        available: false,
        name,
        error: "Name cannot be empty"
      };
    }

    updateState({
      isCheckingAvailability: true,
      error: null
    });

    try {
      const result = await browserRegistrationService.checkNameAvailability(name);
      
      updateState({
        isCheckingAvailability: false,
        error: result.error || null
      });

      return result;
    } catch (error: any) {
      const errorResult = {
        available: false,
        name,
        error: error.message
      };

      updateState({
        isCheckingAvailability: false,
        error: error.message
      });

      return errorResult;
    }
  }, [updateState]);

  const registerName = useCallback(async (name: string): Promise<NameRegistrationResult> => {
    if (!isConnected || !connectedAddress) {
      const errorResult: NameRegistrationResult = {
        success: false,
        message: "Please connect your wallet first",
        error: "Wallet not connected"
      };
      
      updateState({
        error: "Please connect your wallet first",
        result: errorResult
      });
      
      return errorResult;
    }

    if (!name.trim()) {
      const errorResult: NameRegistrationResult = {
        success: false,
        message: "Name cannot be empty",
        error: "Invalid input"
      };
      
      updateState({
        error: "Name cannot be empty",
        result: errorResult
      });
      
      return errorResult;
    }

    // Reset state and start registration
    updateState({
      isLoading: true,
      isRegistering: true,
      error: null,
      result: null,
      progress: 0,
      currentStep: 'Starting registration...'
    });

    try {
      // Browser service doesn't need initialization
      // Create a custom registration flow with progress updates
      console.log(`🥚 Starting EggNS name registration for: "${name}"`);
      
      // Step 1: Check availability
      updateProgress('availability_check');
      const availability = await browserRegistrationService.checkNameAvailability(name);
      if (!availability.available) {
        const errorResult: NameRegistrationResult = {
          success: false,
          message: availability.error || "Name is not available",
          step: "availability_check",
          error: availability.error
        };
        
        updateState({
          isLoading: false,
          isRegistering: false,
          error: errorResult.message,
          result: errorResult
        });
        
        return errorResult;
      }

      // Step 2: Register on Sepolia
      updateProgress('sepolia_registration');
      const sepoliaResult = await browserRegistrationService.registerNameOnSepolia(name);
      if (!sepoliaResult.success) {
        updateState({
          isLoading: false,
          isRegistering: false,
          error: sepoliaResult.message,
          result: sepoliaResult
        });
        
        return sepoliaResult;
      }

      // Step 3: Get name data for verification
      updateProgress('data_verification');
      const nameData = await browserRegistrationService.getNameDataFromSepolia(name);
      if (!nameData) {
        const errorResult: NameRegistrationResult = {
          success: false,
          message: "Failed to retrieve name data from Sepolia",
          step: "data_verification",
          error: "Could not verify registration"
        };
        
        updateState({
          isLoading: false,
          isRegistering: false,
          error: errorResult.message,
          result: errorResult
        });
        
        return errorResult;
      }

      // Step 4: Bridge to Cardona
      updateProgress('bridge_to_cardona');
      const bridgeResult = await browserRegistrationService.executeBridgeAndCall(name, nameData.owner);
      if (!bridgeResult.success) {
        updateState({
          isLoading: false,
          isRegistering: false,
          error: bridgeResult.message,
          result: bridgeResult
        });
        
        return bridgeResult;
      }

      // Success!
      updateProgress('completed');
      const successResult: NameRegistrationResult = {
        success: true,
        message: "Name registered and bridged successfully",
        transactionHash: bridgeResult.transactionHash,
        name: name,
        owner: nameData.owner,
        step: "completed"
      };

      updateState({
        isLoading: false,
        isRegistering: false,
        error: null,
        result: successResult
      });

      console.log('\n🎉 Name registration completed successfully!');
      console.log(`📋 Name: ${name}`);
      console.log(`📋 Owner: ${nameData.owner}`);
      console.log(`📋 Sepolia TX: ${sepoliaResult.transactionHash}`);
      console.log(`📋 Bridge TX: ${bridgeResult.transactionHash}`);

      return successResult;

    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      const errorResult: NameRegistrationResult = {
        success: false,
        message: "Registration failed",
        step: "unknown",
        error: error.message
      };

      updateState({
        isLoading: false,
        isRegistering: false,
        error: error.message,
        result: errorResult
      });

      return errorResult;
    }
  }, [isConnected, connectedAddress, updateState, updateProgress]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isCheckingAvailability: false,
      isRegistering: false,
      currentStep: '',
      result: null,
      error: null,
      progress: 0
    });
  }, []);

  return {
    state,
    checkAvailability,
    registerName,
    reset
  };
} 