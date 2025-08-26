## Cross-Chain Name Service Design Pattern ( WIP )

> **Note — WIP:** The repository includes all main component files and core modules; however, full end-to-end integration and the local AggSandbox integration are still pending and will be completed soon.

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
2. [Service Layer Components](#4-service-layer-components)
3. [Smart Contract Integration](#5-smart-contract-integration)
4. [Bridge Implementation](#6-bridge-implementation)
5. [Component Architecture](#7-component-architecture)
6. [Hooks & State Management](#8-hooks--state-management)
7. [Testing Strategy](#9-testing-strategy)
8. [Configuration & Security](#10-configuration--security)
9. [Implementation Guide](#11-implementation-guide)

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

## 4. Service Layer Components

### 4.1 Registration Service
**File**: `services/name-registration-service.ts`

**Purpose**: Complete registration workflow orchestration

#### Process Flow
```
1. Check Availability
2. Create Signer
3. Submit Transaction
4. Wait for Confirmation
5. Verify Success
```

---

### 4.2 Bridge Service
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

### 4.3 Multi-Chain Service
**File**: `services/multi-chain-name-service.ts`

**Purpose**: Unified cross-chain data view

#### Parallel Query Strategy
```
Sepolia Query ──┐
               ├─→ Merge & Deduplicate → Unified Results
Cardona Query ──┘
```

---

### 4.4 Browser Registration Service
**File**: `services/browser-registration-service.ts`

**Purpose**: Client-side integration wrapper

Provides a clean interface between frontend components and backend services for a seamless user experience.

---

## 5. Smart Contract Integration

### 5.1 EggRegistry Contract Design
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

### 5.2 ABI Integration Pattern
**Files**: `abis/EggRegistry.json`, `abis/EggNSRegistry.json`

Minimal ABI example:
```json
{
  "name": "registerName",
  "inputs": [{"name": "name", "type": "string"}]
}
```

---

## 6. Bridge Implementation

### 6.1 Agglayer LxLy Integration Strategy
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

### 6.2 Bridge Service Architecture
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

## 7. Component Architecture

### 7.1 Core UI Components
| Component | File | Purpose |
|-----------|------|---------|
| EggNSHeader | `components/EggNSHeader.tsx` | Navigation & branding |
| EggNSHomepage | `components/EggNSHomepage.tsx` | Landing page |
| EggNSDashboard | `components/EggNSDashborad.tsx` | Main dashboard |

### 7.2 Name Registry Components
**Directory**: `components/NameRegistry/`

| Component | Purpose |
|-----------|---------|
| `NameLookup.tsx` | Search & find names |
| `NameRegistration.tsx` | Register new names |
| `CrossChainNameTransfer.tsx` | Bridge names across chains |
| `CrossChainNameVerifier.tsx` | Verify cross-chain names |
| `BridgeNameToChain.tsx` | Bridge interface |

### 7.3 Bridge Monitoring Components
**Directory**: `components/Bridge/`

| Component | Purpose |
|-----------|---------|
| `BridgeStatus.tsx` | Track bridge operations |
| `TransactionMonitor.tsx` | Monitor transaction status |

### 7.4 UI Utilities
**Directory**: `components/ui/`

Common UI components like `NameCard.tsx`, `ChainBadge.tsx`, `LoadingSkeleton.tsx` for consistent user experience.

---

## 8. Hooks & State Management

### 8.1 Custom Hooks Overview
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



