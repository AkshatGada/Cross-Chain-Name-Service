import { LxLyClient } from '@maticnetwork/lxlyjs';
import { ethers } from 'ethers';
import { getLxLyClient, getNetworkName, tokens } from './utils/lxly-utils';
import { BridgeTransaction, BridgeStatus, ClaimParams } from '../types/contracts';

export class EggNSBridgeService {
  private lxlyClient: LxLyClient | null = null;

  async initialize(): Promise<void> {
    try {
      this.lxlyClient = await getLxLyClient();
      console.log('EggNS Bridge Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EggNS Bridge Service:', error);
      throw error;
    }
  }

  async bridgeMessage(
    sourceNetworkId: number,
    destinationNetworkId: number,
    destinationAddress: string,
    forceUpdateGlobalExitRoot: boolean,
    metadata: string
  ): Promise<BridgeTransaction> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      console.log(
        `Bridging message from ${getNetworkName(sourceNetworkId)} to ${getNetworkName(destinationNetworkId)}`
      );

      const result = await this.lxlyClient.bridges[sourceNetworkId].bridgeMessage(
        destinationNetworkId,
        destinationAddress,
        forceUpdateGlobalExitRoot,
        metadata
      );

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Message bridged successfully. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt,
        sourceNetworkId,
        destinationNetworkId,
        destinationAddress,
        status: BridgeStatus.PENDING,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to bridge message:', error);
      throw error;
    }
  }

  async bridgeAndCall(
    sourceNetworkId: number,
    destinationNetworkId: number,
    callAddress: string,
    fallbackAddress: string,
    callData: string,
    forceUpdateGlobalExitRoot: boolean,
    amount: string = '0x0',
    token: string = '0x0000000000000000000000000000000000000000'
  ): Promise<BridgeTransaction> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      console.log(
        `Bridging and calling from ${getNetworkName(sourceNetworkId)} to ${getNetworkName(destinationNetworkId)}`
      );

      let result;
      if (this.lxlyClient.client.network === 'testnet') {
        result = await this.lxlyClient.bridgeExtensions[sourceNetworkId].bridgeAndCall(
          token,
          amount,
          destinationNetworkId,
          callAddress,
          fallbackAddress,
          callData,
          forceUpdateGlobalExitRoot,
          '0x0' // permitData is optional for testnet
        );
      } else {
        result = await this.lxlyClient.bridgeExtensions[sourceNetworkId].bridgeAndCall(
          token,
          amount,
          destinationNetworkId,
          callAddress,
          fallbackAddress,
          callData,
          forceUpdateGlobalExitRoot
        );
      }

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Bridge and call executed successfully. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt,
        sourceNetworkId,
        destinationNetworkId,
        destinationAddress: callAddress,
        status: BridgeStatus.PENDING,
        timestamp: Date.now(),
        callData
      };
    } catch (error) {
      console.error('Failed to execute bridge and call:', error);
      throw error;
    }
  }

  async claimMessage(params: ClaimParams): Promise<BridgeTransaction> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      console.log(`Building claim payload for transaction: ${params.bridgeTransactionHash}`);

      const payload = await this.lxlyClient.bridgeUtil.buildPayloadForClaim(
        params.bridgeTransactionHash,
        params.sourceNetworkId
      );

      console.log('Payload built successfully, executing claim...');

      const result = await this.lxlyClient.bridges[params.destinationNetworkId].claimMessage(
        payload.smtProof,
        payload.smtProofRollup,
        BigInt(payload.globalIndex),
        payload.mainnetExitRoot,
        payload.rollupExitRoot,
        payload.originNetwork,
        payload.originTokenAddress,
        payload.destinationNetwork,
        payload.destinationAddress,
        payload.amount,
        payload.metadata
      );

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Message claimed successfully. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt,
        sourceNetworkId: params.sourceNetworkId,
        destinationNetworkId: params.destinationNetworkId,
        destinationAddress: payload.destinationAddress,
        status: BridgeStatus.COMPLETED,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to claim message:', error);
      throw error;
    }
  }

  async claimAsset(
    bridgeTransactionHash: string,
    sourceNetworkId: number,
    destinationNetworkId: number,
    tokenAddress?: string
  ): Promise<BridgeTransaction> {
    if (!this.lxlyClient) {
      throw new Error('Service not initialized');
    }

    try {
      console.log(`Claiming asset for transaction: ${bridgeTransactionHash}`);

      const token = this.lxlyClient.erc20(
        tokenAddress || tokens[destinationNetworkId].ether,
        destinationNetworkId
      );

      const result = await token.claimAsset(bridgeTransactionHash, sourceNetworkId, {
        returnTransaction: false
      });

      const transactionHash = await result.getTransactionHash();
      const receipt = await result.getReceipt();

      console.log(`Asset claimed successfully. TX Hash: ${transactionHash}`);

      return {
        transactionHash,
        receipt,
        sourceNetworkId,
        destinationNetworkId,
        destinationAddress: '', // Will be filled from receipt
        status: BridgeStatus.COMPLETED,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to claim asset:', error);
      throw error;
    }
  }

  async getBridgeTransactionStatus(
    transactionHash: string,
    sourceNetworkId: number
  ): Promise<BridgeStatus> {
    try {
      // This would typically query the bridge API or check on-chain status
      // For now, we'll implement a basic status check
      console.log(`Checking status for transaction: ${transactionHash}`);
      
      // In a real implementation, you would:
      // 1. Query the bridge API for transaction status
      // 2. Check if the global exit root has been updated
      // 3. Verify if the transaction can be claimed
      
      return BridgeStatus.PENDING;
    } catch (error) {
      console.error('Failed to get bridge transaction status:', error);
      return BridgeStatus.FAILED;
    }
  }

  async waitForGlobalExitRootUpdate(
    transactionHash: string,
    sourceNetworkId: number,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.getBridgeTransactionStatus(transactionHash, sourceNetworkId);
        
        if (status === BridgeStatus.READY_TO_CLAIM || status === BridgeStatus.COMPLETED) {
          return true;
        }
        
        if (status === BridgeStatus.FAILED) {
          return false;
        }
        
        // Wait 10 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        console.error('Error checking global exit root update:', error);
      }
    }
    
    return false;
  }

  async encodeCallData(
    contractABI: any[],
    functionName: string,
    parameters: any[]
  ): Promise<string> {
    try {
      const iface = new ethers.utils.Interface(contractABI);
      return iface.encodeFunctionData(functionName, parameters);
    } catch (error) {
      console.error('Failed to encode call data:', error);
      throw error;
    }
  }

  async estimateBridgeFee(
    sourceNetworkId: number,
    destinationNetworkId: number
  ): Promise<string> {
    // This is a placeholder implementation
    // In a real scenario, you'd query the bridge for dynamic fees
    const baseFee = '100000000000000'; // 0.0001 ETH
    return baseFee;
  }
}

export const eggnsBridgeService = new EggNSBridgeService();
