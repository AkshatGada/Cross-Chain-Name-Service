import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useEggNS } from '../../hooks/useEggNS';
import { getNetworkName } from '../../services/utils/lxly-utils';

export const NameLookup: React.FC = () => {
  const { resolveName, isLoading, error } = useEggNS();
  const [name, setName] = useState('');
  const [networkId, setNetworkId] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const networks = [
    { id: 0, name: 'Sepolia' },
    { id: 1, name: 'Cardona' }
  ];

  const handleLookup = async () => {
    if (!name) return;
    
    setIsSearching(true);
    try {
      const record = await resolveName(name, networkId);
      setResult(record);
    } catch (error) {
      console.error('Lookup failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Name Lookup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="myname"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Network</Label>
            <Select
              value={networkId.toString()}
              onValueChange={(value) => setNetworkId(parseInt(value))}
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
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleLookup} 
              disabled={!name || isLoading}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : 'Lookup'}
            </Button>
          </div>
        </div>

        {result && (
          <Card className="mt-4">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Name:</span>
                <span className="font-mono">{result.name}.eggns</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Owner:</span>
                <span className="font-mono">{result.owner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Resolved Address:</span>
                <span className="font-mono">{result.resolvedAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Expiration:</span>
                <span>{new Date(parseInt(result.expirationTime) * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Active:</span>
                {result.isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {result === null && !isSearching && name && (
          <Alert className="mt-4">
            <AlertDescription>
              Name "{name}.eggns" not found on {getNetworkName(networkId)}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
