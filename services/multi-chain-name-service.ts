import { ethers } from 'ethers';
import { ChainInfo, ChainNameData, EggName } from '../types/names';
import EggRegistryABI from '../abis/EggRegistry.json';

// Extract just the ABI array from the JSON object
const ABI = (EggRegistryABI as any).abi;

// Chain configurations
export const SUPPORTED_CHAINS: Record<number, ChainInfo> = {
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://eth-sepolia.public.blastapi.io',
    fallbackRpcUrls: [
      'https://sepolia.gateway.tenderly.co',
      'https://gateway.tenderly.co/public/sepolia',
      'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
    ],
    contractAddress: '0xF47dECE12C67d803161BA10D6e75374f86Eca721',
    color: '#3B82F6', // Blue
    shortName: 'SEP'
  },
  2442: {
    chainId: 2442,
    name: 'Cardona',
    rpcUrl: 'https://rpc.cardona.zkevm-rpc.com',
    fallbackRpcUrls: [
      'https://polygon-zkevm-cardona.blockpi.network/v1/rpc/public',
      'https://rpc.ankr.com/polygon_zkevm_cardona'
    ],
    contractAddress: '0x61e56B1Adc03eBB8F1a4492A04ecE7677764e17a',
    color: '#10B981', // Green
    shortName: 'CAR'
  }
};

export class MultiChainNameService {
  private providers: Record<number, ethers.Provider> = {};
  private contracts: Record<number, ethers.Contract> = {};
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.initializeProviders();
  }

  private async initializeProviders(): Promise<void> {
    for (const [chainId, chainInfo] of Object.entries(SUPPORTED_CHAINS)) {
      const numericChainId = parseInt(chainId);
      
      try {
        // Try primary RPC first
        let provider = new ethers.JsonRpcProvider(chainInfo.rpcUrl);
        
        // Test the provider
        await this.testProvider(provider);
        
        this.providers[numericChainId] = provider;
        this.contracts[numericChainId] = new ethers.Contract(
          chainInfo.contractAddress,
          ABI,
          provider
        );
        
        console.log(`✅ Initialized ${chainInfo.name} provider`);
      } catch (error) {
        console.warn(`❌ Primary RPC failed for ${chainInfo.name}, trying fallbacks...`);
        
        // Try fallback RPCs
        let connected = false;
        for (const fallbackUrl of chainInfo.fallbackRpcUrls) {
          try {
            const fallbackProvider = new ethers.JsonRpcProvider(fallbackUrl);
            await this.testProvider(fallbackProvider);
            
            this.providers[numericChainId] = fallbackProvider;
            this.contracts[numericChainId] = new ethers.Contract(
              chainInfo.contractAddress,
              ABI,
              fallbackProvider
            );
            
            console.log(`✅ Connected to ${chainInfo.name} via fallback: ${fallbackUrl}`);
            connected = true;
            break;
          } catch (fallbackError) {
            console.warn(`❌ Fallback RPC failed for ${chainInfo.name}: ${fallbackUrl}`);
            continue;
          }
        }
        
        if (!connected) {
          console.error(`❌ All RPCs failed for ${chainInfo.name}`);
        }
      }
    }
  }

  private async testProvider(provider: ethers.Provider): Promise<void> {
    // Test provider connectivity with a simple call
    await provider.getBlockNumber();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    chainId: number,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ ${operationName} failed for chain ${chainId} (attempt ${attempt}/${this.retryAttempts}):`, error);
        
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }

  async fetchNamesFromChain(address: string, chainId: number): Promise<string[]> {
    const chainInfo = SUPPORTED_CHAINS[chainId];
    if (!chainInfo) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const contract = this.contracts[chainId];
    if (!contract) {
      throw new Error(`Contract not initialized for chain ${chainInfo.name}`);
    }

    // Validate and normalize the address
    let normalizedAddress: string;
    try {
      normalizedAddress = ethers.getAddress(address);
    } catch (error) {
      throw new Error(`Invalid address format: ${address}`);
    }

    return this.retryOperation(async () => {
      console.log(`�� Fetching names for ${normalizedAddress} from ${chainInfo.name}...`);
      
      // Call getOwnerNames function from the contract
      const names = await contract.getOwnerNames(normalizedAddress);
      
      console.log(`✅ Found ${names.length} names on ${chainInfo.name}:`, names);
      return names;
    }, chainId, `fetchNamesFromChain(${chainInfo.name})`);
  }

  async fetchNamesFromAllChains(address: string): Promise<Record<number, ChainNameData>> {
    const results: Record<number, ChainNameData> = {};
    const timestamp = Date.now();

    // Initialize all chain data
    for (const chainId of Object.keys(SUPPORTED_CHAINS).map(Number)) {
      results[chainId] = {
        chainId,
        names: [],
        loading: true,
        error: null,
        lastFetched: null
      };
    }

    // Fetch from all chains concurrently
    const promises = Object.keys(SUPPORTED_CHAINS).map(async (chainIdStr) => {
      const chainId = parseInt(chainIdStr);
      const chainInfo = SUPPORTED_CHAINS[chainId];
      
      try {
        const names = await this.fetchNamesFromChain(address, chainId);
        results[chainId] = {
          chainId,
          names,
          loading: false,
          error: null,
          lastFetched: timestamp
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to fetch names from ${chainInfo.name}:`, error);
        results[chainId] = {
          chainId,
          names: [],
          loading: false,
          error: errorMessage,
          lastFetched: null
        };
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  mergeNamesFromChains(chainData: Record<number, ChainNameData>): EggName[] {
    const nameMap: Record<string, EggName> = {};

    // Process names from each chain
    for (const [chainIdStr, data] of Object.entries(chainData)) {
      const chainId = parseInt(chainIdStr);
      const chainInfo = SUPPORTED_CHAINS[chainId];
      
      if (!chainInfo || data.error || data.names.length === 0) {
        continue;
      }

      for (const name of data.names) {
        if (nameMap[name]) {
          // Name exists on multiple chains - add this chain to the list
          nameMap[name].chains.push(chainInfo);
        } else {
          // New name - create entry
          nameMap[name] = {
            name,
            owner: '', // We'll need to get this from contract if needed
            chains: [chainInfo],
            isExpired: false, // We'll need to determine this based on expiry logic
            records: {}
          };
        }
      }
    }

    // Convert to array and sort
    return Object.values(nameMap).sort((a, b) => a.name.localeCompare(b.name));
  }

  async checkNameOnChain(name: string, chainId: number): Promise<{
    exists: boolean;
    owner?: string;
    available?: boolean;
  }> {
    const chainInfo = SUPPORTED_CHAINS[chainId];
    if (!chainInfo) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const contract = this.contracts[chainId];
    if (!contract) {
      throw new Error(`Contract not initialized for chain ${chainInfo.name}`);
    }

    return this.retryOperation(async () => {
      const [owner, exists] = await contract.getNameData(name);
      const available = await contract.isNameAvailable(name);
      
      return {
        exists,
        owner: exists ? owner : undefined,
        available
      };
    }, chainId, `checkNameOnChain(${chainInfo.name})`);
  }

  getChainInfo(chainId: number): ChainInfo | undefined {
    return SUPPORTED_CHAINS[chainId];
  }

  getSupportedChains(): ChainInfo[] {
    return Object.values(SUPPORTED_CHAINS);
  }

  async isServiceHealthy(): Promise<Record<number, boolean>> {
    const healthStatus: Record<number, boolean> = {};
    
    const promises = Object.keys(SUPPORTED_CHAINS).map(async (chainIdStr) => {
      const chainId = parseInt(chainIdStr);
      try {
        const provider = this.providers[chainId];
        if (provider) {
          await provider.getBlockNumber();
          healthStatus[chainId] = true;
        } else {
          healthStatus[chainId] = false;
        }
      } catch (error) {
        healthStatus[chainId] = false;
      }
    });

    await Promise.allSettled(promises);
    return healthStatus;
  }
}

// Export a singleton instance
export const multiChainNameService = new MultiChainNameService(); 