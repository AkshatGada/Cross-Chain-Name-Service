import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load configuration for Node.js environment
let getLxLyClient: any;
let tokens: any;
let configuration: any;

try {
  // These imports work in Node.js environment
  const utils = require('../utils/utils_lxly.js');
  getLxLyClient = utils.getLxLyClient;
  tokens = utils.tokens;
  configuration = utils.configuration;
} catch (error) {
  console.log('⚠️  LxLy utilities not available in browser environment');
}

// Load EggRegistry ABI
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EggRegistryABI = JSON.parse(readFileSync(join(__dirname, '..', 'abis', 'EggRegistry.json'), 'utf8')).abi;

// Forwarder address for Cardona
const FORWARDER_CARDONA = "0x1EA46058beD1767B70E7d92d3c6E14C6a7E633EB";

// Registry configuration (updated for payable EggRegistry contracts)
const REGISTRY_CONFIG = {
  sepolia: {
    registry: '0xF47dECE12C67d803161BA10D6e75374f86Eca721', // EggRegistry payable
    networkId: 0,
    rpc: 'https://sepolia.infura.io/v3/9e98b9b70d284c56a6e6c7e64d4b5b9c'
  },
  cardona: {
    registry: '0x61e56B1Adc03eBB8F1a4492A04ecE7677764e17a', // EggRegistry payable
    networkId: 1,
    rpc: 'https://rpc.cardona.zkevm-rpc.com'
  }
};

export interface NameRegistrationResult {
  success: boolean;
  message: string;
  transactionHash?: string;
  name?: string;
  owner?: string;
  step?: string;
  error?: string;
  forwarderUsed?: boolean;
  registryAddress?: string;
  forwarderAddress?: string;
}

export interface NameAvailabilityResult {
  available: boolean;
  name: string;
  error?: string;
}

export class NameRegistrationService {
  private sepoliaProvider: ethers.JsonRpcProvider;
  private cardonaProvider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;

  constructor() {
    this.sepoliaProvider = new ethers.JsonRpcProvider(REGISTRY_CONFIG.sepolia.rpc);
    this.cardonaProvider = new ethers.JsonRpcProvider(REGISTRY_CONFIG.cardona.rpc);
  }

  /**
   * Initialize the service with a private key or wallet
   */
  async initialize(privateKey?: string): Promise<void> {
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.sepoliaProvider);
    } else {
      // For browser environment, we'll use a hardcoded private key from env
      // In production, this should be handled differently
      const envPrivateKey = 'c54698db0aca65242f49e5e84485d859c0fa41ee7a075d741eaa811da4b441c9'; // From .env.local
      if (!envPrivateKey) {
        throw new Error("Private key not found. Please connect your wallet.");
      }
      this.signer = new ethers.Wallet(envPrivateKey, this.sepoliaProvider);
      console.log(`🔑 Using wallet address: ${this.signer.address}`);
    }
  }

  /**
   * Initialize with a connected wallet signer (for browser use)
   */
  async initializeWithSigner(signer: ethers.Signer): Promise<void> {
    // For browser use with connected wallet
    this.signer = signer as ethers.Wallet;
    console.log(`🔑 Initialized with connected wallet`);
  }

  /**
   * Step 1: Check if name is available on Sepolia
   * Uses isNameAvailable function from the contract
   */
  async checkNameAvailability(name: string): Promise<NameAvailabilityResult> {
    try {
      console.log(`🔍 Checking availability for name: "${name}"`);
      
      // Validate name format
      if (!this.isValidNameFormat(name)) {
        return {
          available: false,
          name,
          error: "Invalid name format. Use only alphanumeric characters, 3-32 length."
        };
      }

      // Create contract instance
      const registryContract = new ethers.Contract(
        REGISTRY_CONFIG.sepolia.registry,
        EggRegistryABI,
        this.sepoliaProvider
      );

      // Check availability on Sepolia
      const isAvailable = await registryContract.isNameAvailable(name);
      
      console.log(`✅ Name "${name}" availability: ${isAvailable}`);
      
      return {
        available: isAvailable,
        name
      };

    } catch (error: any) {
      console.error('❌ Error checking name availability:', error);
      return {
        available: false,
        name,
        error: error.message
      };
    }
  }

  /**
   * Step 2: Register name on Sepolia using registerName function
   */
  async registerNameOnSepolia(name: string): Promise<NameRegistrationResult> {
    try {
      if (!this.signer) {
        throw new Error("Service not initialized. Please call initialize() first.");
      }

      console.log(`📝 Registering name "${name}" on Sepolia...`);

      // Create contract instance with signer
      const registryContract = new ethers.Contract(
        REGISTRY_CONFIG.sepolia.registry,
        EggRegistryABI,
        this.signer
      );

      // Double-check availability
      const isAvailable = await registryContract.isNameAvailable(name);
      if (!isAvailable) {
        return {
          success: false,
          message: "Name is not available",
          step: "availability_check",
          error: "Name already taken or invalid"
        };
      }

      // Register the name
      console.log('🚀 Calling registerName function...');
      const tx = await registryContract.registerName(name, {
        gasLimit: 500000
      });

      console.log(`📝 Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log('✅ Name registered successfully on Sepolia!');
        
        // Parse the NameRegistered event
        const events = receipt.logs.filter((log: any) => {
          try {
            const parsed = registryContract.interface.parseLog(log);
            return parsed && parsed.name === 'NameRegistered';
          } catch {
            return false;
          }
        });

        let eventData = null;
        if (events.length > 0) {
          const event = registryContract.interface.parseLog(events[0]);
          if (event && event.args) {
            eventData = {
              name: event.args.name,
              owner: event.args.owner,
              isBridged: event.args.isBridged
            };
            console.log(`🎉 NameRegistered event:`, eventData);
          }
        }

        return {
          success: true,
          message: "Name registered successfully on Sepolia",
          transactionHash: tx.hash,
          name: name,
          owner: this.signer.address,
          step: "sepolia_registration"
        };

      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('❌ Failed to register name on Sepolia:', error);
      return {
        success: false,
        message: "Failed to register name on Sepolia",
        step: "sepolia_registration",
        error: error.message
      };
    }
  }

  /**
   * Step 3: Get name data from Sepolia for verification
   */
  async getNameDataFromSepolia(name: string): Promise<{owner: string; exists: boolean} | null> {
    try {
      console.log(`🔍 Getting name data for "${name}" from Sepolia...`);
      
      const registryContract = new ethers.Contract(
        REGISTRY_CONFIG.sepolia.registry,
        EggRegistryABI,
        this.sepoliaProvider
      );

      const nameData = await registryContract.getNameData(name);
      
      if (!nameData.exists) {
        throw new Error('Name does not exist on Sepolia');
      }

      if (nameData.owner === ethers.ZeroAddress) {
        throw new Error('Name has zero address as owner');
      }

      console.log(`✅ Name data retrieved:`, {
        owner: nameData.owner,
        exists: nameData.exists
      });

      return {
        owner: nameData.owner,
        exists: nameData.exists
      };

    } catch (error: any) {
      console.error('❌ Failed to get name data from Sepolia:', error);
      return null;
    }
  }

  /**
   * Step 4: Execute bridgeAndCall to send name through forwarder to Cardona
   */
  async executeBridgeAndCall(name: string, owner: string): Promise<NameRegistrationResult> {
    try {
      if (!this.signer) {
        throw new Error("Service not initialized. Please call initialize() first.");
      }

      console.log('\n🌉 Executing bridgeAndCall through Cardona Forwarder...');

      // Verify forwarder is deployed
      console.log('🔍 Verifying forwarder deployment...');
      const forwarderCode = await this.cardonaProvider.getCode(FORWARDER_CARDONA);
      if (forwarderCode.length <= 44) {
        throw new Error('Forwarder contract not deployed or invalid');
      }
      console.log('✅ Forwarder contract verified');

      // Initialize LxLy client
      console.log('🔧 Initializing LxLy client for forwarder bridge...');
      const client = await getLxLyClient();
      console.log('✅ LxLy client initialized');

      // Pre-check if name already exists on Cardona registry (not forwarder)
      console.log('🔍 Pre-checking if name exists on Cardona registry...');
      const cardonaRegistryContract = new ethers.Contract(
        REGISTRY_CONFIG.cardona.registry,
        EggRegistryABI,
        this.cardonaProvider
      );

      const existingData = await cardonaRegistryContract.getNameData(name);
      if (existingData.exists) {
        return {
          success: false,
          message: "Name already exists on Cardona",
          step: "cardona_check",
          error: "Name already registered on destination chain"
        };
      }
      console.log(`✅ Name "${name}" is available on Cardona registry`);

      // Encode the function call (unchanged - forwarder pipes it through)
      const iface = new ethers.Interface(EggRegistryABI);
      const calldata = iface.encodeFunctionData("receiveBridgedName", [name, owner]);

      // Set up bridge parameters - NOW USING FORWARDER AS DESTINATION
      const sourceNetworkId = REGISTRY_CONFIG.sepolia.networkId;
      const destinationNetworkId = REGISTRY_CONFIG.cardona.networkId;
      const destinationAddress = FORWARDER_CARDONA; // 🎯 NOW USING FORWARDER, NOT REGISTRY DIRECTLY
      const forceUpdateGlobalExitRoot = true;

      const nativeTokenAddress = tokens[sourceNetworkId].ether;
      const bridgeAmount = ethers.parseEther("0.001").toString(); // 0.001 ETH for execution (as per test)
      const permitData = "0x";

      console.log(`🎯 Bridge And Call Configuration (Through Forwarder):`);
      console.log(`   Source Network: ${sourceNetworkId} (Sepolia)`);
      console.log(`   Destination Network: ${destinationNetworkId} (Cardona)`);
      console.log(`   🔄 Forwarder Address: ${destinationAddress}`);
      console.log(`   🎯 Final Registry: ${REGISTRY_CONFIG.cardona.registry}`);
      console.log(`   📍 Route: Sepolia → Cardona Forwarder → Cardona Registry`);
      console.log(`   Bridge Amount: ${ethers.formatEther(bridgeAmount)} ETH`);
      console.log(`   Function: receiveBridgedName("${name}", "${owner}")`);
      console.log(`   💡 Forwarder consumes ~5k gas, leaving ~100k for receiveBridgedName`);

      // Get current nonce
      const currentNonce = await this.sepoliaProvider.getTransactionCount(this.signer.address, "latest");

      // Execute bridgeAndCall with 5M gas limit through forwarder
      const txOptions = {
        nonce: currentNonce,
        gasLimit: 5000000, // Keep 5M gas limit for cross-chain execution safety
        value: bridgeAmount // 0.001 ETH
      };

      console.log('🚀 Executing bridgeAndCall through forwarder (5M gas limit)...');
      console.log(`📋 Transaction options:`, txOptions);
      console.log(`💡 msg.value (${ethers.formatEther(bridgeAmount)} ETH) for payable execution`);
      console.log(`🔥 Gas limit 5M for cross-chain execution through forwarder`);
      console.log(`✅ Expected gas usage: ~40-110k (forwarder route + registry call)`);

      const result = await client.bridgeExtensions[sourceNetworkId].bridgeAndCall(
        nativeTokenAddress,
        bridgeAmount,
        destinationNetworkId,
        destinationAddress, // This is now the forwarder address
        owner, // fallback address
        calldata,
        forceUpdateGlobalExitRoot,
        permitData,
        txOptions
      );

      const txHash = await result.getTransactionHash();
      console.log(`🎉 SUCCESS! Transaction sent through Cardona Forwarder!`);
      console.log(`📝 Transaction Hash: ${txHash}`);

      // Wait for confirmation
      const receipt = await result.getReceipt();
      console.log(`✅ Bridge transaction confirmed!`);
      console.log(`⛽ Gas used: ${receipt.gasUsed} / ${txOptions.gasLimit} (${((Number(receipt.gasUsed) / txOptions.gasLimit) * 100).toFixed(1)}%)`);

      console.log('\n🎉 Bridge and call completed successfully through forwarder!');
      console.log(`💡 The forwarder should forward receiveBridgedName("${name}", "${owner}") to registry`);
      console.log(`🔗 Check Cardona registry at: ${REGISTRY_CONFIG.cardona.registry}`);
      console.log(`🔄 Route: Forwarder ${FORWARDER_CARDONA} → Registry ${REGISTRY_CONFIG.cardona.registry}`);
      console.log(`🔍 Wait ~10-20 minutes then verify by calling getNameData("${name}") on registry`);
      console.log(`🚀 Forwarder route provides better gas efficiency!`);

      return {
        success: true,
        message: "Name bridged successfully through forwarder",
        transactionHash: txHash,
        name: name,
        owner: owner,
        step: "bridge_complete",
        forwarderUsed: true,
        registryAddress: REGISTRY_CONFIG.cardona.registry,
        forwarderAddress: FORWARDER_CARDONA
      };

    } catch (error: any) {
      console.error('❌ Failed to bridge name to Cardona through forwarder:', error);
      
      let errorMessage = "Failed to bridge name to Cardona";
      
      if (error.message.includes('out of gas') || error.message.includes('gas')) {
        errorMessage = "Insufficient gas for forwarder bridge execution";
      } else if (error.message.includes('execution reverted') || error.message.includes('exists')) {
        errorMessage = "Bridge execution reverted on Cardona";
      }

      return {
        success: false,
        message: errorMessage,
        step: "bridge_execution",
        error: error.message
      };
    }
  }

  /**
   * Main registration flow - orchestrates all steps
   */
  async registerName(name: string, privateKey?: string): Promise<NameRegistrationResult> {
    try {
      // Initialize if needed
      if (!this.signer) {
        await this.initialize(privateKey);
      }

      console.log(`🥚 Starting EggNS name registration for: "${name}"`);
      console.log('============================================');

      // Step 1: Check availability
      console.log('\n📋 Step 1: Checking name availability...');
      const availability = await this.checkNameAvailability(name);
      if (!availability.available) {
        return {
          success: false,
          message: availability.error || "Name is not available",
          step: "availability_check",
          error: availability.error
        };
      }

      // Step 2: Register on Sepolia
      console.log('\n📋 Step 2: Registering name on Sepolia...');
      const sepoliaResult = await this.registerNameOnSepolia(name);
      if (!sepoliaResult.success) {
        return sepoliaResult;
      }

      // Step 3: Get name data for verification
      console.log('\n📋 Step 3: Getting name data from Sepolia...');
      const nameData = await this.getNameDataFromSepolia(name);
      if (!nameData) {
        return {
          success: false,
          message: "Failed to retrieve name data from Sepolia",
          step: "data_verification",
          error: "Could not verify registration"
        };
      }

      // Step 4: Bridge to Cardona through forwarder
      console.log('\n📋 Step 4: Bridging name to Cardona through forwarder...');
      const bridgeResult = await this.executeBridgeAndCall(name, nameData.owner);
      if (!bridgeResult.success) {
        return bridgeResult;
      }

      console.log('\n🎉 Name registration completed successfully through forwarder!');
      console.log(`📋 Name: ${name}`);
      console.log(`📋 Owner: ${nameData.owner}`);
      console.log(`📋 Sepolia TX: ${sepoliaResult.transactionHash}`);
      console.log(`📋 Bridge TX: ${bridgeResult.transactionHash}`);
      console.log(`🔄 Forwarder: ${FORWARDER_CARDONA}`);
      console.log(`🎯 Registry: ${REGISTRY_CONFIG.cardona.registry}`);
      console.log('\n⏰ Note: Cross-chain execution takes ~10-20 minutes');

      return {
        success: true,
        message: "Name registered and bridged successfully through forwarder",
        transactionHash: bridgeResult.transactionHash,
        name: name,
        owner: nameData.owner,
        step: "completed",
        forwarderUsed: true,
        registryAddress: REGISTRY_CONFIG.cardona.registry,
        forwarderAddress: FORWARDER_CARDONA
      };

    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      return {
        success: false,
        message: "Registration failed",
        step: "unknown",
        error: error.message
      };
    }
  }

  /**
   * Validate name format (alphanumeric only, 3-32 characters)
   */
  private isValidNameFormat(name: string): boolean {
    if (!name || name.length < 3 || name.length > 32) {
      return false;
    }

    // Check alphanumeric only
    const validPattern = /^[a-zA-Z0-9]+$/;
    return validPattern.test(name);
  }

  /**
   * Verify name on Cardona (for later checking)
   */
  async verifyNameOnCardona(name: string): Promise<{exists: boolean; owner?: string; error?: string}> {
    try {
      const cardonaRegistryContract = new ethers.Contract(
        REGISTRY_CONFIG.cardona.registry,
        EggRegistryABI,
        this.cardonaProvider
      );

      const nameData = await cardonaRegistryContract.getNameData(name);
      
      return {
        exists: nameData.exists,
        owner: nameData.exists ? nameData.owner : undefined
      };

    } catch (error: any) {
      return {
        exists: false,
        error: error.message
      };
    }
  }
}

// Export a singleton instance
export const nameRegistrationService = new NameRegistrationService(); 