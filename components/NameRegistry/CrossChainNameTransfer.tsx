import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { useEggNS } from '../../hooks/useEggNS';
import { getNetworkName } from '../../services/utils/lxly-utils';

interface CrossChainNameTransferProps {
  onTransferComplete?: (name: string, transactionHash: string) => void;
}

export const CrossChainNameTransfer: React.FC<CrossChainNameTransferProps> = ({
  onTransferComplete
}) => {
  const { 
    transferNameCrossChain, 
    claimCrossChainMessage,
    waitForBridgeCompletion,
    resolveName,
    crossChainOperations,
    isLoading, 
    error 
  } = useEggNS();

  const [formData, setFormData] = useState({
    name: '',
    newOwner: '',
    sourceNetworkId: 0,
    destinationNetworkId: 1
  });
  
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<{
    name: string;
    transactionHash: string;
    bridgeTransactionHash?: string;
  } | null>(null);
  const [nameOwnership, setNameOwnership] = useState<{
    [networkId: number]: { owner: string; exists: boolean };
  }>({});
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(false);

  const networks = [
    { id: 0, name: 'Sepolia' },
    { id: 1, name: 'Cardona' }
  ];

  // Check name ownership when name changes
  useEffect(() => {
    const checkNameOwnership = async () => {
      if (!formData.name || formData.name.length < 3) {
        setNameOwnership({});
        return;
      }

      setIsCheckingOwnership(true);
      try {
        const promises = networks.map(async (network) => {
          const result = await resolveName(formData.name, network.id);
          return {
            networkId: network.id,
            owner: result?.owner || '',
            exists: result !== null && result.isActive
          };
        });

        const results = await Promise.all(promises);
        const ownershipMap = results.reduce((acc, result) => {
          acc[result.networkId] = {
            owner: result.owner,
            exists: result.exists
          };
          return acc;
        }, {} as typeof nameOwnership);

        setNameOwnership(ownershipMap);
      } catch (error) {
        console.error('Failed to check name ownership:', error);
      } finally {
        setIsCheckingOwnership(false);
      }
    };

    const debounceTimer = setTimeout(checkNameOwnership, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.name, resolveName]);

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      return 'Name must be at least 3 characters long';
    }
    if (!formData.newOwner || !formData.newOwner.match(/^0x[a-fA-F0-9]{40}$/)) {
      return 'Please enter a valid Ethereum address for new owner';
    }
    if (formData.sourceNetworkId === formData.destinationNetworkId) {
      return 'Source and destination networks must be different';
    }

    const sourceOwnership = nameOwnership[formData.sourceNetworkId];
    if (!sourceOwnership?.exists) {
      return `Name "${formData.name}" does not exist on ${getNetworkName(formData.sourceNetworkId)}`;
    }

    return null;
  };

  const handleTransfer = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsTransferring(true);
    setTransferSuccess(null);

    try {
      const result = await transferNameCrossChain({
        name: formData.name,
        newOwner: formData.newOwner,
        sourceNetworkId: formData.sourceNetworkId,
        destinationNetworkId: formData.destinationNetworkId
      });

      setTransferSuccess({
        name: formData.name,
        transactionHash: result.transactionHash,
        bridgeTransactionHash: result.transactionHash
      });

      if (onTransferComplete) {
        onTransferComplete(formData.name, result.transactionHash);
      }

      // Reset form
      setFormData({
        name: '',
        newOwner: '',
        sourceNetworkId: 0,
        destinationNetworkId: 1
      });

    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClaimMessage = async (bridgeTransactionHash: string) => {
    try {
      await claimCrossChainMessage({
        bridgeTransactionHash,
        sourceNetworkId: formData.sourceNetworkId,
        destinationNetworkId: formData.destinationNetworkId
      });
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  const getOwnershipStatus = (networkId: number) => {
    if (isCheckingOwnership) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    const ownership = nameOwnership[networkId];
    if (!ownership) return null;

    if (ownership.exists) {
      return (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm">
            Owned by: {ownership.owner.slice(0, 6)}...{ownership.owner.slice(-4)}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Not registered</span>
        </div>
      );
    }
  };

  const pendingOperations = crossChainOperations.filter(
    op => op.operationType === 'transfer' && (op.status === 'bridged' || op.status === 'pending')
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cross-Chain Name Transfer</CardTitle>
          <CardDescription>
            Transfer ownership of your registered name to another address across different networks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="myname"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
            />
            <div className="text-sm text-gray-500">
              Enter the name without .eggns extension
            </div>
          </div>

          {formData.name && (
            <div className="space-y-2">
              <Label>Ownership Status</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {networks.map((network) => (
                  <div key={network.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{network.name}</span>
                      {getOwnershipStatus(network.id)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newOwner">New Owner Address</Label>
            <Input
              id="newOwner"
              placeholder="0x..."
              value={formData.newOwner}
              onChange={(e) => setFormData({ ...formData, newOwner: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Network</Label>
              <Select
                value={formData.sourceNetworkId.toString()}
                onValueChange={(value) => 
                  setFormData({ ...formData, sourceNetworkId: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.id} value={network.id.toString()}>
                      {network.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destination Network</Label>
              <Select
                value={formData.destinationNetworkId.toString()}
                onValueChange={(value) => 
                  setFormData({ ...formData, destinationNetworkId: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.id} value={network.id.toString()}>
                      {network.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{getNetworkName(formData.sourceNetworkId)}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{getNetworkName(formData.destinationNetworkId)}</span>
            </div>
          </div>

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {transferSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-1">
                  <div>Name "{transferSuccess.name}" transferred successfully!</div>
                  <div className="flex items-center gap-2">
                    <span>Transaction:</span>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${transferSuccess.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {transferSuccess.transactionHash.slice(0, 10)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleTransfer}
            disabled={isTransferring || isLoading || !formData.name || !formData.newOwner}
            className="w-full"
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring Cross-Chain...
              </>
            ) : (
              'Transfer Name Cross-Chain'
            )}
          </Button>
        </CardContent>
      </Card>

      {pendingOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Cross-Chain Transfers</CardTitle>
            <CardDescription>
              Operations that may need to be claimed on the destination network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOperations.map((operation) => (
                <div key={operation.timestamp} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{operation.name}</div>
                    <div className="text-sm text-gray-600">
                      {getNetworkName(operation.sourceNetwork)} → {getNetworkName(operation.destinationNetwork)}
                    </div>
                    <Badge variant={operation.status === 'bridged' ? 'default' : 'secondary'}>
                      {operation.status}
                    </Badge>
                  </div>
                  {operation.status === 'bridged' && operation.bridgeTransactionHash && (
                    <Button
                      size="sm"
                      onClick={() => handleClaimMessage(operation.bridgeTransactionHash!)}
                    >
                      Claim on Destination
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 