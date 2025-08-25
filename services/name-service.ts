import { LxLyClient } from '@maticnetwork/lxlyjs';
import { getLxLyClient, getEggNSRegistryAddress, getNetworkName } from './utils/lxly-utils';
import { NameRecord, NameRegistrationParams, BridgeNameParams } from '../types/names';
import EggNSRegistryABI from '../abis/EggNSRegistry.json';

export class EggNSNameService {
  private lxlyClient: LxLyClient | null = null;
  private readonly registryABI = EggNSRegistryABI;

  async initialize(): Promise<void> {
    try {
      this.lxlyClient = await getLxLyClient();
      console.log('EggNS Name Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EggNS Name Service:', error);
      throw error;
    }
  }

  // Register name ONLY on current chain
  async registerName(params: NameRegistrationParams): Promise<{
    transactionHash: string;
    receipt: any;
  }> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const registryAddress = getEggNSRegistryAddress(params.networkId);
      if (!registryAddress) {
        throw new Error(`Registry address not found for network ${params.networkId}`);
      }

      const contract = this.lxlyClient.contract(
        this.registryABI,
        registryAddress,
        params.networkId
      );

      console.log(`Registering name "${params.name}" on ${getNetworkName(params.networkId)} only`);

      const result = await contract.registerName(
        params.name,
        params.resolvedAddress,
        params.contentHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        {
          value: params.fee,
          gasLimit: 300000
        }
      );

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Name registered successfully on ${getNetworkName(params.networkId)}. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt
      };
    } catch (error) {
      console.error('Failed to register name:', error);
      throw error;
    }
  }

  // NEW: Bridge existing name using lxly.js
  async bridgeNameToChain(params: BridgeNameParams): Promise<{
    transactionHash: string;
    receipt: any;
  }> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const sourceRegistryAddress = getEggNSRegistryAddress(params.sourceNetworkId);
      const destinationRegistryAddress = getEggNSRegistryAddress(params.destinationNetworkId);

      if (!sourceRegistryAddress || !destinationRegistryAddress) {
        throw new Error('Registry addresses not found for specified networks');
      }

      // Step 1: Get the name record from source chain
      console.log(`Getting name record for "${params.name}" from ${getNetworkName(params.sourceNetworkId)}`);
      const nameRecord = await this.getNameRecord(params.name, params.sourceNetworkId);
      
      if (!nameRecord) {
        throw new Error(`Name "${params.name}" not found on source network`);
      }

      if (nameRecord.isBridged) {
        throw new Error('Cannot bridge a bridged name');
      }

      // Step 2: Prepare the call data for createBridgedName on destination chain
      const destinationContract = this.lxlyClient.contract(
        this.registryABI,
        destinationRegistryAddress,
        params.destinationNetworkId
      );

      const callData = await destinationContract.encodeAbi("createBridgedName", [
        nameRecord.name,
        nameRecord.owner,
        nameRecord.resolvedAddress,
        nameRecord.expirationTime,
        nameRecord.contentHash,
        params.sourceNetworkId
      ]);

      console.log(`Bridging name "${params.name}" from ${getNetworkName(params.sourceNetworkId)} to ${getNetworkName(params.destinationNetworkId)}`);

      // Step 3: Use lxly.js bridgeMessage to send the call
      let result;
      if (this.lxlyClient.client.network === "testnet") {
        console.log("Using testnet bridge");
        result = await this.lxlyClient.bridges[params.sourceNetworkId].bridgeMessage(
          params.destinationNetworkId,
          destinationRegistryAddress,
          true, // forceUpdateGlobalExitRoot
          callData
        );
      } else {
        console.log("Using mainnet bridge");
        result = await this.lxlyClient.bridges[params.sourceNetworkId].bridgeMessage(
          params.destinationNetworkId,
          destinationRegistryAddress,
          true, // forceUpdateGlobalExitRoot
          callData
        );
      }

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Name bridged successfully. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt
      };
    } catch (error) {
      console.error('Failed to bridge name:', error);
      throw error;
    }
  }

  // Alternative bridging method using bridgeAndCall (if you need to send ETH)
  async bridgeNameWithValue(params: BridgeNameParams & { amount: string; token: string }): Promise<{
    transactionHash: string;
    receipt: any;
  }> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const sourceRegistryAddress = getEggNSRegistryAddress(params.sourceNetworkId);
      const destinationRegistryAddress = getEggNSRegistryAddress(params.destinationNetworkId);

      if (!sourceRegistryAddress || !destinationRegistryAddress) {
        throw new Error('Registry addresses not found for specified networks');
      }

      // Get the name record from source chain
      const nameRecord = await this.getNameRecord(params.name, params.sourceNetworkId);
      
      if (!nameRecord) {
        throw new Error(`Name "${params.name}" not found on source network`);
      }

      if (nameRecord.isBridged) {
        throw new Error('Cannot bridge a bridged name');
      }

      // Prepare the call data for createBridgedName on destination chain
      const destinationContract = this.lxlyClient.contract(
        this.registryABI,
        destinationRegistryAddress,
        params.destinationNetworkId
      );

      const callData = await destinationContract.encodeAbi("createBridgedName", [
        nameRecord.name,
        nameRecord.owner,
        nameRecord.resolvedAddress,
        nameRecord.expirationTime,
        nameRecord.contentHash,
        params.sourceNetworkId
      ]);

      console.log(`Bridging name "${params.name}" with value from ${getNetworkName(params.sourceNetworkId)} to ${getNetworkName(params.destinationNetworkId)}`);

      // Use bridgeAndCall to send both value and call
      let result;
      if (this.lxlyClient.client.network === "testnet") {
        result = await this.lxlyClient.bridgeExtensions[params.sourceNetworkId].bridgeAndCall(
          params.token,
          params.amount,
          params.destinationNetworkId,
          destinationRegistryAddress,
          destinationRegistryAddress, // fallbackAddress (same as call address)
          callData,
          true, // forceUpdateGlobalExitRoot
          "0x0" // permitData (optional)
        );
      } else {
        result = await this.lxlyClient.bridgeExtensions[params.sourceNetworkId].bridgeAndCall(
          params.token,
          params.amount,
          params.destinationNetworkId,
          destinationRegistryAddress,
          destinationRegistryAddress, // fallbackAddress
          callData,
          true // forceUpdateGlobalExitRoot
        );
      }

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Name bridged with value successfully. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt
      };
    } catch (error) {
      console.error('Failed to bridge name with value:', error);
      throw error;
    }
  }

  // Check which chains a name exists on
  async getNameChainPresence(name: string): Promise<{
    [networkId: number]: {
      exists: boolean;
      owner?: string;
      isBridged?: boolean;
      originNetwork?: number;
    };
  }> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    const networks = [0, 1]; // Sepolia and Cardona
    const presence: any = {};

    try {
      const promises = networks.map(async (networkId) => {
        try {
          const nameRecord = await this.resolveName(name, networkId);
          return {
            networkId,
            exists: nameRecord !== null,
            owner: nameRecord?.owner,
            isBridged: nameRecord?.isBridged,
            originNetwork: nameRecord?.originNetwork
          };
        } catch (error) {
          return {
            networkId,
            exists: false
          };
        }
      });

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        presence[result.networkId] = {
          exists: result.exists,
          owner: result.owner,
          isBridged: result.isBridged,
          originNetwork: result.originNetwork
        };
      });

      return presence;
    } catch (error) {
      console.error('Failed to check name chain presence:', error);
      return {};
    }
  }

  async resolveName(name: string, networkId: number): Promise<NameRecord | null> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const registryAddress = getEggNSRegistryAddress(networkId);
      if (!registryAddress) {
        throw new Error(`Registry address not found for network ${networkId}`);
      }

      const contract = this.lxlyClient.contract(
        this.registryABI,
        registryAddress,
        networkId
      );

      console.log(`Resolving name "${name}" on ${getNetworkName(networkId)}`);

      const result = await contract.resolveName(name);

      if (!result || result[0] === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return {
        name,
        owner: result[0],
        resolvedAddress: result[1],
        expirationTime: result[2].toString(),
        isActive: result[3],
        contentHash: result[4],
        originNetwork: result[5],
        isBridged: result[6],
        networkId
      };
    } catch (error) {
      console.error('Failed to resolve name:', error);
      return null;
    }
  }

  // Get full name record (including internal fields)
  async getNameRecord(name: string, networkId: number): Promise<NameRecord | null> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const registryAddress = getEggNSRegistryAddress(networkId);
      if (!registryAddress) {
        throw new Error(`Registry address not found for network ${networkId}`);
      }

      const contract = this.lxlyClient.contract(
        this.registryABI,
        registryAddress,
        networkId
      );

      const result = await contract.getNameRecord(name);

      if (!result || result.owner === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return {
        name,
        owner: result.owner,
        resolvedAddress: result.resolvedAddress,
        expirationTime: result.expirationTime.toString(),
        isActive: result.isActive,
        contentHash: result.contentHash,
        originNetwork: result.originNetwork,
        isBridged: result.isBridged,
        networkId
      };
    } catch (error) {
      console.error('Failed to get name record:', error);
      return null;
    }
  }

  async getOwnerNames(owner: string, networkId: number): Promise<string[]> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const registryAddress = getEggNSRegistryAddress(networkId);
      if (!registryAddress) {
        throw new Error(`Registry address not found for network ${networkId}`);
      }

      const contract = this.lxlyClient.contract(
        this.registryABI,
        registryAddress,
        networkId
      );

      const names = await contract.getOwnerNames(owner);
      return names || [];
    } catch (error) {
      console.error('Failed to get owner names:', error);
      return [];
    }
  }

  async transferName(
    name: string,
    newOwner: string,
    networkId: number
  ): Promise<{
    transactionHash: string;
    receipt: any;
  }> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const registryAddress = getEggNSRegistryAddress(networkId);
      if (!registryAddress) {
        throw new Error(`Registry address not found for network ${networkId}`);
      }

      const contract = this.lxlyClient.contract(
        this.registryABI,
        registryAddress,
        networkId
      );

      console.log(`Transferring name "${name}" to ${newOwner} on ${getNetworkName(networkId)}`);

      const result = await contract.transferName(name, newOwner, {
        gasLimit: 200000
      });

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Name transferred successfully. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt
      };
    } catch (error) {
      console.error('Failed to transfer name:', error);
      throw error;
    }
  }

  async renewName(
    name: string,
    networkId: number,
    renewalFee: string
  ): Promise<{
    transactionHash: string;
    receipt: any;
  }> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const registryAddress = getEggNSRegistryAddress(networkId);
      if (!registryAddress) {
        throw new Error(`Registry address not found for network ${networkId}`);
      }

      const contract = this.lxlyClient.contract(
        this.registryABI,
        registryAddress,
        networkId
      );

      console.log(`Renewing name "${name}" on ${getNetworkName(networkId)}`);

      const result = await contract.renewName(name, {
        value: renewalFee,
        gasLimit: 200000
      });

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Name renewed successfully. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt
      };
    } catch (error) {
      console.error('Failed to renew name:', error);
      throw error;
    }
  }

  async checkNameAvailability(name: string, networkId: number): Promise<boolean> {
    try {
      const result = await this.resolveName(name, networkId);
      return result === null;
    } catch (error) {
      console.error('Failed to check name availability:', error);
      return false;
    }
  }

  async getRegistrationFee(networkId: number): Promise<string> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const registryAddress = getEggNSRegistryAddress(networkId);
      if (!registryAddress) {
        throw new Error(`Registry address not found for network ${networkId}`);
      }

      const contract = this.lxlyClient.contract(
        this.registryABI,
        registryAddress,
        networkId
      );

      const fee = await contract.registrationFee();
      return fee.toString();
    } catch (error) {
      console.error('Failed to get registration fee:', error);
      return '1000000000000000'; // 0.001 ETH as fallback
    }
  }

  async getRenewalFee(networkId: number): Promise<string> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      const registryAddress = getEggNSRegistryAddress(networkId);
      if (!registryAddress) {
        throw new Error(`Registry address not found for network ${networkId}`);
      }

      const contract = this.lxlyClient.contract(
        this.registryABI,
        registryAddress,
        networkId
      );

      const fee = await contract.renewalFee();
      return fee.toString();
    } catch (error) {
      console.error('Failed to get renewal fee:', error);
      return '500000000000000'; // 0.0005 ETH as fallback
    }
  }
}

export const eggnsNameService = new EggNSNameService();
