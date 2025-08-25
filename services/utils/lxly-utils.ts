import { LxLyClient, use, setProofApi } from '@maticnetwork/lxlyjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import BN from 'bn.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

use(Web3ClientPlugin);

// Configure proof API endpoint
const PROOF_API = 'https://api-gateway.polygon.technology/api/v3/proof/testnet';
setProofApi(PROOF_API);

export const SCALING_FACTOR = new BN(10).pow(new BN(18));

interface NetworkConfiguration {
  rpc: string;
  fallbackRpcs?: string[];
  bridgeAddress: string;
  bridgeExtensionAddress?: string;
  wrapperAddress?: string;
  isEIP1559Supported?: boolean;
  eggnsRegistryAddress?: string;
  eggnsCredentialAddress?: string;
}

interface NetworkConfigurations {
  [key: number]: NetworkConfiguration;
}

// Define fallback RPC endpoints in case the primary ones hit rate limits
const SEPOLIA_FALLBACKS = [
  "https://rpc.ankr.com/eth_sepolia",
  "https://ethereum-sepolia.publicnode.com",
  "https://sepolia.gateway.tenderly.co",
  "https://eth-sepolia.g.alchemy.com/v2/demo"
];

const CARDONA_FALLBACKS = [
  process.env.NETWORK_1_FALLBACK_RPC || "",
  "https://cardona-testnet.rpc.caldera.xyz/http"
];

const networkConfigurations: NetworkConfigurations = {
  0: { // Sepolia
    rpc: process.env.NETWORK_0_RPC || '',
    fallbackRpcs: SEPOLIA_FALLBACKS,
    bridgeAddress: process.env.NETWORK_0_BRIDGE || '',
    bridgeExtensionAddress: process.env.NETWORK_0_BRIDGE_EXTENSION || '',
    wrapperAddress: process.env.NETWORK_0_WRAPPER || '',
    isEIP1559Supported: true,
    eggnsRegistryAddress: process.env.NETWORK_0_EGGNS_REGISTRY || '',
    eggnsCredentialAddress: process.env.NETWORK_0_EGGNS_CREDENTIAL || ''
  },
  1: { // Cardona
    rpc: process.env.NETWORK_1_RPC || '',
    fallbackRpcs: CARDONA_FALLBACKS,
    bridgeAddress: process.env.NETWORK_1_BRIDGE || '',
    bridgeExtensionAddress: process.env.NETWORK_1_BRIDGE_EXTENSION || '',
    isEIP1559Supported: false,
    eggnsRegistryAddress: process.env.NETWORK_1_EGGNS_REGISTRY || '',
    eggnsCredentialAddress: process.env.NETWORK_1_EGGNS_CREDENTIAL || ''
  }
};

if (!process.env.USER1_PRIVATE_KEY) {
  throw new Error('USER1_PRIVATE_KEY is not set in .env.local');
}
if (!process.env.NETWORK_0_RPC || !process.env.NETWORK_1_RPC) {
  throw new Error('Network RPC URLs are not set in .env.local');
}
if (!process.env.NETWORK_0_BRIDGE || !process.env.NETWORK_1_BRIDGE) {
  throw new Error('Bridge addresses are not set in .env.local');
}
if (!process.env.NETWORK_0_BRIDGE_EXTENSION || !process.env.NETWORK_1_BRIDGE_EXTENSION) {
  throw new Error('Bridge extension addresses are not set in .env.local');
}

const privateKey = process.env.USER1_PRIVATE_KEY;
const tempProvider = new HDWalletProvider(privateKey, 'https://rpc.ankr.com/eth'); 
const userAddress = tempProvider.getAddress(0);
tempProvider.engine.stop(); // Clean up the provider

// Function to create a provider with automatic fallback in case of rate limiting
const createProviderWithFallback = (privateKey: string, rpcs: string[]) => {
  // Filter out empty RPCs
  const validRpcs = rpcs.filter(rpc => !!rpc);
  
  if (validRpcs.length === 0) {
    throw new Error("No valid RPC URLs provided");
  }
  
  console.log(`Creating provider with ${validRpcs.length} potential RPCs`);
  
  // Create a provider that will use the first RPC initially
  // HDWalletProvider doesn't support auto-switching RPCs, but this setup
  // at least gives us multiple options when initializing
  return new HDWalletProvider(
    [privateKey], 
    validRpcs[0]
  );
};

export const getLxLyClient = async (network = 'testnet'): Promise<LxLyClient> => {
  if (!privateKey) {
    throw new Error('Private key is not set');
  }

  console.log("Initializing LxLy client with RPC fallbacks...");
  
  // Combine primary and fallback RPCs for Sepolia
  const sepoliaRpcs = [
    networkConfigurations[0].rpc,
    ...(networkConfigurations[0].fallbackRpcs || [])
  ];
  
  // Combine primary and fallback RPCs for Cardona
  const cardonaRpcs = [
    networkConfigurations[1].rpc,
    ...(networkConfigurations[1].fallbackRpcs || [])
  ];
  
  // Create providers with fallback capability
  const sepoliaProvider = createProviderWithFallback(privateKey, sepoliaRpcs);
  const cardonaProvider = createProviderWithFallback(privateKey, cardonaRpcs);

  const lxLyClient = new LxLyClient();
  return await lxLyClient.init({
    log: true,
    network: network,
    providers: {
      0: { // Sepolia
        provider: sepoliaProvider,
        configuration: {
          bridgeAddress: networkConfigurations[0].bridgeAddress,
          bridgeExtensionAddress: networkConfigurations[0].bridgeExtensionAddress,
          wrapperAddress: networkConfigurations[0].wrapperAddress,
          isEIP1559Supported: networkConfigurations[0].isEIP1559Supported
        } as any, // Type assertion to bypass TypeScript error
        defaultConfig: {
          from: userAddress
        }
      },
      1: { // Cardona
        provider: cardonaProvider,
        configuration: {
          bridgeAddress: networkConfigurations[1].bridgeAddress,
          bridgeExtensionAddress: networkConfigurations[1].bridgeExtensionAddress,
          isEIP1559Supported: networkConfigurations[1].isEIP1559Supported
        } as any, // Type assertion to bypass TypeScript error
        defaultConfig: {
          from: userAddress
        }
      }
    }
  });
};

export const tokens = {
  0: { // Sepolia
    ether: "0x0000000000000000000000000000000000000000" 
  },
  1: { // Cardona
    ether: "0x0000000000000000000000000000000000000000" 
  }
};

export const configuration = networkConfigurations;
export const from = userAddress;
export const to = userAddress;
export { privateKey };

// EggNS specific utilities
export const getEggNSRegistryAddress = (networkId: number): string => {
  return networkConfigurations[networkId]?.eggnsRegistryAddress || '';
};

export const getEggNSCredentialAddress = (networkId: number): string => {
  return networkConfigurations[networkId]?.eggnsCredentialAddress || '';
};

export const getNetworkName = (networkId: number): string => {
  switch (networkId) {
    case 0: return 'Sepolia';
    case 1: return 'Cardona';
    default: return `Network ${networkId}`;
  }
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTransactionHash = (hash: string): string => {
  if (!hash) return '';
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};
