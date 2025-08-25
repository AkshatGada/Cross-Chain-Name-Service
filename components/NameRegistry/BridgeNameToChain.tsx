import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Check, AlertCircle, ExternalLink, Bridge, Zap } from 'lucide-react';
import { eggnsNameService } from '../../services/name-service';
import { getNetworkName } from '../../services/utils/lxly-utils';

interface BridgeNameToChainProps {
  onBridgeComplete?: (name: string, transactionHash: string) => void;
}

export const BridgeNameToChain: React.FC<BridgeNameToChainProps> = ({
  onBridgeComplete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sourceNetworkId: 0,
    destinationNetworkId: 1
  });
  
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeSuccess, setBridgeSuccess] = useState<{
    name: string;
    transactionHash: string;
  } | null>(null);
  const [chainPresence, setChainPresence] = useState<{
    [networkId: number]: { 
      exists: boolean; 
      owner?: string; 
      isBridged?: boolean;
      originNetwork?: number;
    };
  }>({});
  const [isCheckingPresence, setIsCheckingPresence] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const networks = [
    { id: 0, name: 'Sepolia' },
    { id: 1, name: 'Cardona' }
  ];

  // Check name presence across chains when name changes
  useEffect(() => {
    const checkNamePresence = async () => {
      if (!formData.name || formData.name.length < 3) {
        setChainPresence({});
        return;
      }

      setIsCheckingPresence(true);
      try {
        const presence = await eggnsNameService.getNameChainPresence(formData.name);
        setChainPresence(presence);
      } catch (error) {
        console.error('Failed to check name presence:', error);
      } finally {
        setIsCheckingPresence(false);
      }
    };

    const debounceTimer = setTimeout(checkNamePresence, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.name]);

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      return 'Name must be at least 3 characters long';
    }
    if (formData.sourceNetworkId === formData.destinationNetworkId) {
      return 'Source and destination networks must be different';
    }

    const sourcePresence = chainPresence[formData.sourceNetworkId];
    const destPresence = chainPresence[formData.destinationNetworkId];

    if (!sourcePresence?.exists) {
      return `Name "${formData.name}" does not exist on ${getNetworkName(formData.sourceNetworkId)}`;
    }

    if (sourcePresence.isBridged) {
      return `Cannot bridge a bridged name. This name was bridged from ${getNetworkName(sourcePresence.originNetwork || 0)}`;
    }

    if (destPresence?.exists) {
      return `Name "${formData.name}" already exists on ${getNetworkName(formData.destinationNetworkId)}`;
    }

    return null;
  };

  const handleBridge = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsBridging(true);
    setBridgeSuccess(null);
    setError(null);

    try {
      const result = await eggnsNameService.bridgeNameToChain({
        name: formData.name,
        sourceNetworkId: formData.sourceNetworkId,
        destinationNetworkId: formData.destinationNetworkId
      });

      setBridgeSuccess({
        name: formData.name,
        transactionHash: result.transactionHash
      });

      if (onBridgeComplete) {
        onBridgeComplete(formData.name, result.transactionHash);
      }

      // Refresh chain presence
      const presence = await eggnsNameService.getNameChainPresence(formData.name);
      setChainPresence(presence);

      // Reset name field to encourage trying other names
      setFormData({
        name: '',
        sourceNetworkId: formData.sourceNetworkId,
        destinationNetworkId: formData.destinationNetworkId
      });

    } catch (error: any) {
      console.error('Bridge failed:', error);
      setError(error.message || 'Failed to bridge name');
    } finally {
      setIsBridging(false);
    }
  };

  const getPresenceStatus = (networkId: number) => {
    if (isCheckingPresence) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    const presence = chainPresence[networkId];
    if (!presence) return null;

    if (presence.exists) {
      return (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <div className="flex flex-col">
            <span className="text-sm">
              Owner: {presence.owner?.slice(0, 6)}...{presence.owner?.slice(-4)}
            </span>
            {presence.isBridged && presence.originNetwork !== undefined && (
              <Badge variant="secondary" className="text-xs">
                Bridged from {getNetworkName(presence.originNetwork)}
              </Badge>
            )}
            {!presence.isBridged && (
              <Badge variant="default" className="text-xs">
                Original Registration
              </Badge>
            )}
          </div>
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

  const canBridge = () => {
    const sourcePresence = chainPresence[formData.sourceNetworkId];
    const destPresence = chainPresence[formData.destinationNetworkId];
    
    return sourcePresence?.exists && 
           !sourcePresence.isBridged && 
           !destPresence?.exists;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bridge className="h-5 w-5" />
            Bridge Name to Chain
          </CardTitle>
          <CardDescription>
            Bridge your existing registered names to other supported chains using lxly.js. Only original registrations can be bridged.
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
              <Label>Chain Presence</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {networks.map((network) => (
                  <div key={network.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{network.name}</span>
                      {getPresenceStatus(network.id)}
                    </div>
                    {chainPresence[network.id]?.exists && !chainPresence[network.id]?.isBridged && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Can bridge from here
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Network (Where name exists)</Label>
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

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm">
              <strong>Bridge Process:</strong> Uses lxly.js to encode name data and bridge via Polygon zkEVM
            </div>
            <div className="text-xs text-gray-600 mt-1">
              No additional fees beyond standard bridge costs
            </div>
          </div>

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {bridgeSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-1">
                  <div>Name "{bridgeSuccess.name}" bridged successfully!</div>
                  <div className="flex items-center gap-2">
                    <span>Transaction:</span>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${bridgeSuccess.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {bridgeSuccess.transactionHash.slice(0, 10)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleBridge}
            disabled={isBridging || !formData.name || !canBridge()}
            className="w-full"
          >
            {isBridging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bridging via lxly.js to {getNetworkName(formData.destinationNetworkId)}...
              </>
            ) : (
              <>
                <Bridge className="mr-2 h-4 w-4" />
                Bridge to {getNetworkName(formData.destinationNetworkId)}
              </>
            )}
          </Button>

          {!canBridge() && formData.name && (
            <div className="text-sm text-amber-600 text-center">
              {validateForm()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 