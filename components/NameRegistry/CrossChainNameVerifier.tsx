import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, GitCompare } from 'lucide-react';
import { useEggNS } from '../../hooks/useEggNS';
import { getNetworkName } from '../../services/utils/lxly-utils';

export const CrossChainNameVerifier: React.FC = () => {
  const { resolveName, isLoading } = useEggNS();
  const [name, setName] = useState('');
  const [results, setResults] = useState<Record<number, any>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  const networks = [
    { id: 0, name: 'Sepolia' },
    { id: 1, name: 'Cardona' }
  ];

  const verifyAcrossChains = async () => {
    if (!name) return;
    
    setIsVerifying(true);
    try {
      const promises = networks.map(network => resolveName(name, network.id));
      const results = await Promise.all(promises);
      
      const resultMap = results.reduce((acc, result, index) => {
        acc[networks[index].id] = result;
        return acc;
      }, {} as Record<number, any>);
      
      setResults(resultMap);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const getConsistencyStatus = () => {
    const values = Object.values(results).filter(Boolean);
    if (values.length === 0) return 'not-registered';
    if (values.length === 1) return 'single-chain';
    
    const first = values[0];
    const consistent = values.every(result => 
      result.owner === first.owner &&
      result.resolvedAddress === first.resolvedAddress
    );
    
    return consistent ? 'consistent' : 'inconsistent';
  };

  const status = getConsistencyStatus();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Cross-Chain Name Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="myname"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={verifyAcrossChains} 
              disabled={!name || isLoading}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <GitCompare className="mr-2 h-4 w-4" />
                  Verify Across Chains
                </>
              )}
            </Button>
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            <Alert variant={status === 'consistent' ? 'default' : 'destructive'}>
              {status === 'consistent' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {status === 'consistent' 
                  ? 'Name records are consistent across all chains'
                  : 'Name records show inconsistencies between chains'}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {networks.map(network => (
                <Card key={network.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{network.name}</span>
                      {results[network.id] ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {results[network.id] ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Owner:</span>
                          <span className="font-mono">{results[network.id].owner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resolved Address:</span>
                          <span className="font-mono">{results[network.id].resolvedAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expiration:</span>
                          <span>
                            {new Date(parseInt(results[network.id].expirationTime) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        Not registered on {network.name}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
