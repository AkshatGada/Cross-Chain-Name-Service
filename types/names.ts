export interface NameRecord {
    name: string;
    owner: string;
    resolvedAddress: string;
    expirationTime: string;
    isActive: boolean;
    contentHash: string;
    networkId: number;
    originNetwork?: number;
    isBridged?: boolean;
  }
  
  export interface NameRegistrationParams {
    name: string;
    resolvedAddress: string;
    contentHash?: string;
    fee: string;
    networkId: number;
  }
  
  export interface CrossChainNameParams {
    name: string;
    resolvedAddress: string;
    contentHash?: string;
    fee: string;
    sourceNetworkId: number;
    destinationNetworkId: number;
    forceUpdateGlobalExitRoot?: boolean;
  }

  export interface BridgeNameParams {
    name: string;
    sourceNetworkId: number;
    destinationNetworkId: number;
  }

  export interface CrossChainNameTransferParams {
    name: string;
    newOwner: string;
    sourceNetworkId: number;
    destinationNetworkId: number;
  }

  export interface BridgeClaimParams {
    bridgeTransactionHash: string;
    sourceNetworkId: number;
    destinationNetworkId: number;
  }

  export interface NameChainPresence {
    [networkId: number]: {
      exists: boolean;
      owner?: string;
      isBridged?: boolean;
      originNetwork?: number;
    };
  }
  
  export interface NameSearchResult {
    name: string;
    isAvailable: boolean;
    owner?: string;
    expirationTime?: string;
    networks: number[];
    chainPresence?: NameChainPresence;
  }
  
  export interface NameTransferParams {
    name: string;
    newOwner: string;
    networkId: number;
  }
  
  export interface NameRenewalParams {
    name: string;
    renewalFee: string;
    networkId: number;
  }

  export interface CrossChainOperation {
    operationType: 'register' | 'bridge' | 'transfer';
    name: string;
    sourceNetwork: number;
    destinationNetwork: number;
    bridgeTransactionHash?: string;
    status: 'pending' | 'bridged' | 'claimed' | 'completed' | 'failed';
    timestamp: number;
  }
  
  // New types for multi-chain name retrieval
  export interface ChainInfo {
    chainId: number;
    name: string;
    rpcUrl: string;
    fallbackRpcUrls: string[];
    contractAddress: string;
    color: string;
    shortName: string;
  }

  export interface EggName {
    name: string;
    owner: string;
    chains: ChainInfo[];
    isExpired: boolean;
    expiryDate?: Date;
    avatar?: string;
    records: {
      address?: string;
      email?: string;
      website?: string;
    };
  }

  export interface ChainNameData {
    chainId: number;
    names: string[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  }

  export interface MultiChainNameState {
    chains: Record<number, ChainNameData>;
    mergedNames: EggName[];
    isLoading: boolean;
    hasError: boolean;
    lastRefresh: number | null;
    connectedAddress: string | null;
  }

  export interface MultiChainNameActions {
    fetchNames: (address: string) => Promise<void>;
    refreshNames: () => Promise<void>;
    clearData: () => void;
  }
  