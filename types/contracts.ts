export interface ContractConfig {
    address: string;
    abi: any[];
    networkId: number;
  }
  
  export interface BridgeTransaction {
    transactionHash: string;
    receipt: any;
    sourceNetworkId: number;
    destinationNetworkId: number;
    destinationAddress: string;
    status: BridgeStatus;
    timestamp: number;
    callData?: string;
    amount?: string;
    token?: string;
  }
  
  export enum BridgeStatus {
    PENDING = 'pending',
    READY_TO_CLAIM = 'ready_to_claim',
    COMPLETED = 'completed',
    FAILED = 'failed'
  }
  
  export interface ClaimParams {
    bridgeTransactionHash: string;
    sourceNetworkId: number;
    destinationNetworkId: number;
  }
  
  export interface NetworkInfo {
    id: number;
    name: string;
    rpcUrl: string;
    bridgeAddress: string;
    registryAddress: string;
    credentialAddress: string;
    isTestnet: boolean;
  }
  
  export interface TransactionStatus {
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    gasUsed?: string;
    gasPrice?: string;
    blockNumber?: number;
    timestamp?: number;
  }
  