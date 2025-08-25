import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useEggNS } from '../../hooks/useEggNS';
import { getNetworkName } from '../../services/utils/lxly-utils';

interface NameRegistrationProps {
  onRegistrationComplete?: (name: string, transactionHash: string) => void;
}

export const NameRegistration: React.FC<NameRegistrationProps> = ({
  onRegistrationComplete
}) => {
  const {
    registerName,
    registerAndBridgeName,
    checkNameAvailability,
    getRegistrationFee,
    isLoading,
    error
  } = useEggNS();

  const [formData, setFormData] = useState({
    name: '',
    resolvedAddress: '',
    sourceNetworkId: 0,
    destinationNetworkId: 1,
    crossChain: false
  });

  const [nameAvailability, setNameAvailability] = useState<{
    [networkId: number]: boolean;
  }>({});

  const [registrationFees, setRegistrationFees] = useState<{
    [networkId: number]: string;
  }>({});

  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    name: string;
    transactionHash: string;
  } | null>(null);

  const networks = [
    { id: 0, name: 'Sepolia' },
    { id: 1, name: 'Cardona' }
  ];

  useEffect(() => {
    // Load registration fees for all networks
    const loadFees = async () => {
      for (const network of networks) {
        try {
          const fee = await getRegistrationFee(network.id);
          setRegistrationFees(prev => ({
            ...prev,
            [network.id]: fee
          }));
        } catch (error) {
          console.error(`Failed to load fee for network ${network.id}:`, error);
        }
      }
    };

    loadFees();
  }, []);

  useEffect(() => {
    // Check name availability when name changes
    const checkAvailability = async () => {
      if (formData.name.length >= 3) {
        setIsCheckingAvailability(true);
        
        for (const network of networks) {
          try {
            const isAvailable = await checkNameAvailability(formData.name, network.id);
            setNameAvailability(prev => ({
              ...prev,
              [network.id]: isAvailable
            }));
          } catch (error) {
            console.error(`Failed to check availability on network ${network.id}:`, error);
          }
        }
        
        setIsCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.name]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear success message when form changes
    if (registrationSuccess) {
      setRegistrationSuccess(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name || formData.name.length < 3) {
      return 'Name must be at least 3 characters long';
    }

    if (!/^[a-z0-9-]+$/.test(formData.name)) {
      return 'Name can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.resolvedAddress) {
      return 'Resolved address is required';
    }

    if (!ethers.utils.isAddress(formData.resolvedAddress)) {
      return 'Invalid resolved address format';
    }

    const targetNetworkId = formData.crossChain ? formData.sourceNetworkId : formData.sourceNetworkId;
    if (!nameAvailability[targetNetworkId]) {
      return `Name "${formData.name}" is not available on ${getNetworkName(targetNetworkId)}`;
    }

    return null;
  };

  const handleRegistration = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsRegistering(true);
    setRegistrationSuccess(null);

    try {
      let result;
      const fee = registrationFees[formData.sourceNetworkId] || '1000000000000000';

      if (formData.crossChain) {
        result = await registerAndBridgeName({
          name: formData.name,
          resolvedAddress: formData.resolvedAddress,
          fee,
          sourceNetworkId: formData.sourceNetworkId,
          destinationNetworkId: formData.destinationNetworkId,
          forceUpdateGlobalExitRoot: true
        });
      } else {
        result = await registerName({
          name: formData.name,
          resolvedAddress: formData.resolvedAddress,
          fee,
          networkId: formData.sourceNetworkId
        });
      }

      setRegistrationSuccess({
        name: formData.name,
        transactionHash: result.transactionHash
      });

      if (onRegistrationComplete) {
        onRegistrationComplete(formData.name, result.transactionHash);
      }

      // Reset form
      setFormData({
        name: '',
        resolvedAddress: '',
        sourceNetworkId: 0,
        destinationNetworkId: 1,
        crossChain: false
      });

    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const getNameStatusIcon = (networkId: number) => {
    if (isCheckingAvailability) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (nameAvailability[networkId] === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (nameAvailability[networkId] === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register EggNS Name</CardTitle>
        <CardDescription>
          Register a human-readable name that resolves to your address across multiple chains
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {registrationSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully registered "{registrationSuccess.name}"! 
              Transaction: {registrationSuccess.transactionHash.slice(0, 10)}...
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="myname"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value.toLowerCase())}
              className="font-mono"
            />
            <div className="text-sm text-muted-foreground">
              {formData.name && (
                <span className="font-mono">{formData.name}.eggns</span>
              )}
            </div>
            
            {formData.name.length >= 3 && (
              <div className="space-y-1">
                {networks.map(network => (
                  <div key={network.id} className="flex items-center gap-2 text-sm">
                    {getNameStatusIcon(network.id)}
                    <span>{network.name}: </span>
                    <span className={
                      nameAvailability[network.id] === true 
                        ? 'text-green-600' 
                        : nameAvailability[network.id] === false 
                        ? 'text-red-600' 
                        : 'text-gray-500'
                    }>
                      {isCheckingAvailability 
                        ? 'Checking...' 
                        : nameAvailability[network.id] === true 
                        ? 'Available' 
                        : nameAvailability[network.id] === false 
                        ? 'Taken' 
                        : 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolvedAddress">Resolved Address</Label>
            <Input
              id="resolvedAddress"
              placeholder="0x..."
              value={formData.resolvedAddress}
              onChange={(e) => handleInputChange('resolvedAddress', e.target.value)}
              className="font-mono"
            />
            <div className="text-sm text-muted-foreground">
              The address this name will resolve to
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="crossChain"
                checked={formData.crossChain}
                onChange={(e) => handleInputChange('crossChain', e.target.checked)}
              />
              <Label htmlFor="crossChain">Cross-chain registration</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Network</Label>
                <Select
                  value={formData.sourceNetworkId.toString()}
                  onValueChange={(value) => handleInputChange('sourceNetworkId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map(network => (
                      <SelectItem key={network.id} value={network.id.toString()}>
                        {network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  Fee: {registrationFees[formData.sourceNetworkId] 
                    ? `${ethers.utils.formatEther(registrationFees[formData.sourceNetworkId])} ETH`
                    : 'Loading...'}
                </div>
              </div>

              {formData.crossChain && (
                <div className="space-y-2">
                  <Label>Destination Network</Label>
                  <Select
                    value={formData.destinationNetworkId.toString()}
                    onValueChange={(value) => handleInputChange('destinationNetworkId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networks
                        .filter(network => network.id !== formData.sourceNetworkId)
                        .map(network => (
                          <SelectItem key={network.id} value={network.id.toString()}>
                            {network.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        {formData.crossChain && (
          <Alert>
            <ArrowRight className="h-4 w-4" />
            <AlertDescription>
              Cross-chain registration will register the name on {getNetworkName(formData.sourceNetworkId)} 
              and automatically bridge it to {getNetworkName(formData.destinationNetworkId)}.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleRegistration}
          disabled={isRegistering || isLoading || !formData.name || !formData.resolvedAddress}
          className="w-full"
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {formData.crossChain ? 'Registering & Bridging...' : 'Registering...'}
            </>
          ) : (
            <>
              {formData.crossChain ? 'Register & Bridge Name' : 'Register Name'}
              {registrationFees[formData.sourceNetworkId] && (
                <span className="ml-2 text-sm opacity-75">
                  ({ethers.utils.formatEther(registrationFees[formData.sourceNetworkId])} ETH)
                </span>
              )}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
