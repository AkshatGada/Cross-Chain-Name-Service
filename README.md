## Cross-Chain Name Service Design Pattern

## 1. What is EggNS?

EggNS is an **educational cross-chain name service** that demonstrates how to register names on one blockchain and seamlessly bridge them to another using Agglayer's Unified Bridge.

### Core Capabilities

| Feature | Description | Example |
|---------|-------------|---------|
| **Cross-Chain Registration** | Register names on source chain, materialize on destination | `alice.egg` on Sepolia → Cardona |
| **Unified View** | Single interface across multiple blockchains | View all your names from one dashboard |
| **Bridge Integration** | Agglayer LxLy implementation | Automatic message encoding & execution |

---

## 2. Table of Contents

1. [Application Architecture](#3-application-architecture)
2. [Project Structure](#4-project-structure)
3. [Service Layer Components](#5-service-layer-components)
4. [Smart Contract Integration](#6-smart-contract-integration)
5. [Bridge Implementation](#7-bridge-implementation)
6. [Component Architecture](#8-component-architecture)
7. [Hooks & State Management](#9-hooks--state-management)
8. [Testing Strategy](#10-testing-strategy)
9. [Configuration & Security](#11-configuration--security)
10. [Implementation Guide](#12-implementation-guide)

---

## 3. Application Architecture

### Flow Process

> User Journey: Register → Bridge → Verify
>
> 1. Check Availability - Ensure name is available
> 2. Register on Source - Submit transaction to Sepolia
> 3. Bridge Message - Send via Agglayer LxLy to Cardona
> 4. Verify Destination - Confirm name exists on target chain

---

## 5. Service Layer Components

### 5.1 Registration Service
**File**: `services/name-registration-service.ts`

**Purpose**: Complete registration workflow orchestration

#### Process Flow
```
1. ✅ Check Availability
2. 🔐 Create Signer  
3. 📤 Submit Transaction
4. ⏳ Wait for Confirmation
5. ✔️ Verify Success
```

---

### 5.2 Bridge Service
**File**: `services/bridge-service.ts`

**Purpose**: Agglayer LxLy integration

#### Bridge Workflow
```
Name + Owner → ABI Encode → Agglayer LxLy → Destination Execution
```

**Core Functions**:
- `encodeDestinationCall()` - Convert function to bytecode
- `submitBridgeMessage()` - Send via Agglayer LxLy
- `trackBridgeStatus()` - Monitor execution

Technical Detail: Uses `receiveBridgedName(name, owner)` as the destination function

---

### 5.3 Multi-Chain Service
**File**: `services/multi-chain-name-service.ts`

**Purpose**: Unified cross-chain data view

#### Parallel Query Strategy
```
Sepolia Query ──┐
               ├─→ Merge & Deduplicate → Unified Results
Cardona Query ──┘
```

---

### 5.4 Browser Registration Service
**File**: `services/browser-registration-service.ts`

**Purpose**: Client-side integration wrapper

Provides a clean interface between frontend components and backend services for a seamless user experience.

---

## 6. Smart Contract Integration

### 6.1 EggRegistry Contract Design
**Files**: `contracts/EggRegistry.sol`, `contracts/EggNSRegistryMinimal.sol`

#### Core Functions
| Function | Purpose | Access |
|----------|---------|--------|
| `registerName(name)` | Direct user registration | External |
| `receiveBridgedName(name, owner)` | Bridge message handler | External (bridge) |
| `getNameData(name)` | Query ownership | View |

#### State Management
```solidity
mapping(string => address) nameToOwner;    // name → owner
mapping(address => string[]) ownerToNames; // owner → names[]
```

### 6.2 ABI Integration Pattern
**Files**: `abis/EggRegistry.json`, `abis/EggNSRegistry.json`

Minimal ABI example:
```json
{
  "name": "registerName",
  "inputs": [{"name": "name", "type": "string"}]
}
```

---

## 7. Bridge Implementation

### 7.1 Agglayer LxLy Integration Strategy
**File**: `services/utils/lxly-utils.ts`

#### Message Encoding Process
```
1. Function Name: "receiveBridgedName"
2. Parameters: [name: string, owner: address]
3. ABI Encoding: Convert to bytecode
4. Bridge Payload: Ready for cross-chain transport
```

#### Execution Flow
| Phase | Location | Action |
|-------|----------|--------|
| Encode | Source Chain | Create function call bytecode |
| Submit | Bridge Layer | Send via Agglayer LxLy |
| Execute | Destination | Automatic function execution |

### 7.2 Bridge Service Architecture
```typescript
// Clean interface
bridgeNameToDestination(name, owner) → { transactionHash }
```

Key Responsibilities:
- ABI encoding for destination calls
- Agglayer LxLy client interaction
- Gas management for bridge operations
- Transaction tracking & monitoring

---

## 8. Component Architecture

### 8.1 Core UI Components
| Component | File | Purpose |
|-----------|------|---------|
| EggNSHeader | `components/EggNSHeader.tsx` | Navigation & branding |
| EggNSHomepage | `components/EggNSHomepage.tsx` | Landing page |
| EggNSDashboard | `components/EggNSDashborad.tsx` | Main dashboard |

### 8.2 Name Registry Components
**Directory**: `components/NameRegistry/`

| Component | Purpose |
|-----------|---------|
| `NameLookup.tsx` | Search & find names |
| `NameRegistration.tsx` | Register new names |
| `CrossChainNameTransfer.tsx` | Bridge names across chains |
| `CrossChainNameVerifier.tsx` | Verify cross-chain names |
| `BridgeNameToChain.tsx` | Bridge interface |

### 8.3 Bridge Monitoring Components
**Directory**: `components/Bridge/`

| Component | Purpose |
|-----------|---------|
| `BridgeStatus.tsx` | Track bridge operations |
| `TransactionMonitor.tsx` | Monitor transaction status |

### 8.4 UI Utilities
**Directory**: `components/ui/`

Common UI components like `NameCard.tsx`, `ChainBadge.tsx`, `LoadingSkeleton.tsx` for consistent user experience.

---

## 9. Hooks & State Management

### 9.1 Custom Hooks Overview
**Directory**: `hooks/`

| Hook | File | Purpose |
|------|------|---------|
| useEggNS | `useEggNS.ts` | Main EggNS functionality |
| useNameRegistration | `useNameRegistration.ts` | Registration flow |
| useMultiChainNames | `useMultiChainNames.ts` | Cross-chain data |
| useCredentials | `useCredentials.ts` | User credentials |
| useReducedMotion | `useReducedMotion.ts` | Accessibility |

#### Hook Architecture Pattern
```typescript
// Clean hook interface
const { register, bridge, verify } = useEggNS();
```

Benefits:
- Encapsulate complex logic
- Reusable across components
- Centralized state management
- Optimized re-renders

---

