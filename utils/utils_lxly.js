// utils_lxly.js
// Utility to initialize lxly client against local aggsandbox
require('dotenv').config();
const path = require('path');
const { LxLyClient, use, setProofApi } = require('@maticnetwork/lxlyjs');
const { Web3ClientPlugin } = require('@maticnetwork/maticjs-web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const BN = require('bn.js');

use(Web3ClientPlugin);
// Point proof API to local AggKit by default; can override via PROOF_API env var
setProofApi(process.env.PROOF_API || 'http://127.0.0.1:5577');

const SCALING_FACTOR = new BN(10).pow(new BN(18));

const getLxLyClient = async () => {
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
        // L2 provider: use account 2 to allow claiming from destination
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

const tokens = {
  0: { ether: '0x0000000000000000000000000000000000000000', erc20: process.env.AGG_ERC20_L1 },
  1: { ether: '0x0000000000000000000000000000000000000000', erc20: process.env.AGG_ERC20_L2 },
};

module.exports = {
  SCALING_FACTOR,
  getLxLyClient,
  tokens,
}; 