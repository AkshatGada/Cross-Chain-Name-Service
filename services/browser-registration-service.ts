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

export class BrowserRegistrationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/register-name';
  }

  /**
   * Step 1: Check if name is available on Sepolia
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

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          step: 'check_availability'
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to check availability');
      }

      console.log(`✅ Name "${name}" availability: ${data.available}`);
      
      return {
        available: data.available,
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
   * Step 2: Register name on Sepolia
   */
  async registerNameOnSepolia(name: string): Promise<NameRegistrationResult> {
    try {
      console.log(`📝 Registering name "${name}" on Sepolia...`);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          step: 'register_sepolia'
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          message: data.error || "Failed to register name on Sepolia",
          step: "sepolia_registration",
          error: data.error
        };
      }

      console.log('✅ Name registered successfully on Sepolia!');
      console.log(`📝 Transaction Hash: ${data.transactionHash}`);
      
      return {
        success: true,
        message: "Name registered successfully on Sepolia",
        transactionHash: data.transactionHash,
        name: data.name,
        owner: data.owner,
        step: "sepolia_registration"
      };

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
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          step: 'get_name_data'
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get name data');
      }

      console.log(`✅ Name data retrieved:`, {
        owner: data.owner,
        exists: data.exists
      });

      return {
        owner: data.owner,
        exists: data.exists
      };

    } catch (error: any) {
      console.error('❌ Failed to get name data from Sepolia:', error);
      return null;
    }
  }

  /**
   * Step 4: Execute bridgeAndCall to send receiveBridgedName to Cardona
   */
  async executeBridgeAndCall(name: string, owner: string): Promise<NameRegistrationResult> {
    try {
      console.log(`🌉 Executing bridgeAndCall to Cardona...`);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          owner,
          step: 'bridge_to_cardona'
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          message: data.error || "Failed to bridge name to Cardona",
          step: "bridge_to_cardona",
          error: data.error
        };
      }

      console.log(`🎉 SUCCESS! Bridge Transaction Hash: ${data.transactionHash}`);

      return {
        success: true,
        message: "Name successfully bridged to Cardona",
        transactionHash: data.transactionHash,
        name: data.name,
        owner: data.owner,
        step: "bridge_to_cardona"
      };

    } catch (error: any) {
      console.error('❌ Bridge and call failed:', error);
      return {
        success: false,
        message: "Failed to bridge name to Cardona",
        step: "bridge_to_cardona",
        error: error.message
      };
    }
  }

  /**
   * Main registration flow - orchestrates all steps
   */
  async registerName(name: string): Promise<NameRegistrationResult> {
    try {
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

      // Step 4: Bridge to Cardona
      console.log('\n📋 Step 4: Bridging name to Cardona...');
      const bridgeResult = await this.executeBridgeAndCall(name, nameData.owner);
      if (!bridgeResult.success) {
        return bridgeResult;
      }

      console.log('\n🎉 Name registration completed successfully!');
      console.log(`📋 Name: ${name}`);
      console.log(`📋 Owner: ${nameData.owner}`);
      console.log(`📋 Sepolia TX: ${sepoliaResult.transactionHash}`);
      console.log(`📋 Bridge TX: ${bridgeResult.transactionHash}`);
      console.log('\n⏰ Note: Cross-chain execution takes ~10-20 minutes');

      return {
        success: true,
        message: "Name registered and bridged successfully",
        transactionHash: bridgeResult.transactionHash,
        name: name,
        owner: nameData.owner,
        step: "completed"
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
}

// Export singleton instance
export const browserRegistrationService = new BrowserRegistrationService(); 