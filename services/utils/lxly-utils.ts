// services/utils/lxly-utils.ts
import { LxLyClient, use, setProofApi } from '@maticnetwork/lxlyjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import BN from 'bn.js';
import dotenv from 'dotenv';

dotenv.config();

use(Web3ClientPlugin);

// Default to local AggKit proof API for local development
setProofApi(process.env.PROOF_API || 'http://127.0.0.1:5577');

export const SCALING_FACTOR = new BN(10).pow(new BN(18));

// Initialize an LxLy client configured for a local sandbox environment
export const getLxLyClient = async (): Promise<LxLyClient> => {
  const lxLyClient = new LxLyClient();

  await lxLyClient.init({
    log: true,
    network: 'local',
    providers: {
      0: {
        provider: new HDWalletProvider(
          [process.env.PRIVATE_KEY_1],
          process.env.RPC_1 || 'http://127.0.0.1:8545'
        ),
        configuration: {
          bridgeAddress: process.env.POLYGON_ZKEVM_BRIDGE_L1,
          bridgeExtensionAddress: process.env.BRIDGE_EXTENSION_L1,
          wrapperAddress: process.env.WRAPPER_L1 || undefined,
          isEIP1559Supported: true,
        },
        defaultConfig: {
          from: process.env.ACCOUNT_ADDRESS_1,
        },
      },
      1: {
        provider: new HDWalletProvider(
          [process.env.PRIVATE_KEY_2 || process.env.PRIVATE_KEY_1],
          process.env.RPC_2 || 'http://127.0.0.1:8546'
        ),
        configuration: {
          bridgeAddress: process.env.POLYGON_ZKEVM_BRIDGE_L2,
          bridgeExtensionAddress: process.env.BRIDGE_EXTENSION_L2,
          wrapperAddress: process.env.WRAPPER_L2 || undefined,
          isEIP1559Supported: true,
        },
        defaultConfig: {
          from: process.env.ACCOUNT_ADDRESS_2 || process.env.ACCOUNT_ADDRESS_1,
        },
      },
    },
  });

  return lxLyClient;
};

export const tokens = {
  0: { ether: '0x0000000000000000000000000000000000000000', erc20: process.env.AGG_ERC20_L1 },
  1: { ether: '0x0000000000000000000000000000000000000000', erc20: process.env.AGG_ERC20_L2 },
};

export { SCALING_FACTOR };
export default {
  SCALING_FACTOR,
  getLxLyClient,
  tokens,
};
