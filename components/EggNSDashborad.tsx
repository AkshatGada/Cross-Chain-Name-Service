import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { NameRegistration } from './NameRegistry/NameRegistration';
import { NameLookup } from './NameRegistry/NameLookup';
import { CrossChainNameVerifier } from './NameRegistry/CrossChainNameVerifier';
import { CrossChainNameTransfer } from './NameRegistry/CrossChainNameTransfer';
import { CredentialIssuer } from './Credentials/CredentialIssuer';
import { CredentialVerifier } from './Credentials/CredentialVerifier';
import { CrossChainCredentialManager } from './Credentials/CrossChainCredentialManager';
import { BridgeStatus } from './Bridge/BridgeStatus';
import { TransactionMonitor } from './Bridge/TransactionMonitor';

export const EggNSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const handleTransactionComplete = (type: string, details: any) => {
    setRecentTransactions(prev => [{
      id: Date.now(),
      type,
      timestamp: Date.now(),
      ...details
    }, ...prev.slice(0, 9)]); // Keep last 10 transactions
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">EggNS</h1>
        <p className="text-xl text-muted-foreground mb-4">
          Cross-Chain Name Service & Verifiable Credentials
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Globe className="w-4 h-4 mr-1" />
            Cross-Chain
          </Badge>
          <Badge variant="outline">
            <Shield className="w-4 h-4 mr-1" />
            Verifiable Credentials
          </Badge>
          <Badge variant="outline">
            <Zap className="w-4 h-4 mr-1" />
            Bridge & Call
          </Badge>
          <Badge variant="outline">
            <RefreshCw className="w-4 h-4 mr-1" />
            Live Claiming
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="names">Register</TabsTrigger>
          <TabsTrigger value="lookup">Lookup</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="verify-names">Verify</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="verify-creds">Verify Creds</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Cross-Chain Names
                </CardTitle>
                <CardDescription>
                  Register human-readable names across multiple chains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Register once, use everywhere</li>
                  <li>• Automatic cross-chain bridging</li>
                  <li>• Real-time claiming system</li>
                  <li>• Built on AggLayer</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verifiable Credentials
                </CardTitle>
                <CardDescription>
                  Issue and verify credentials across chains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• W3C compliant credentials</li>
                  <li>• Cross-chain verification</li>
                  <li>• Zero-knowledge proofs</li>
                  <li>• Decentralized identity</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Live Bridge Integration
                </CardTitle>
                <CardDescription>
                  Real-time cross-chain operations with lxly.js
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Actual bridge message calls</li>
                  <li>• Automated claim detection</li>
                  <li>• Cross-chain name transfers</li>
                  <li>• Gas-optimized operations</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How Cross-Chain Integration Works</CardTitle>
              <CardDescription>
                Understanding EggNS real cross-chain functionality with lxly.js
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-1">Register/Transfer</h4>
                  <p className="text-sm text-muted-foreground">
                    Smart contract calls Polygon zkEVM bridge
                  </p>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-1">Bridge Message</h4>
                  <p className="text-sm text-muted-foreground">
                    lxly.js handles cross-chain messaging
                  </p>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-1">Auto-Claim</h4>
                  <p className="text-sm text-muted-foreground">
                    UI provides one-click claiming
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {recentTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest transactions and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionMonitor transactions={recentTransactions} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="names">
          <NameRegistration 
            onRegistrationComplete={(name, txHash) => 
              handleTransactionComplete('name_registration', { name, transactionHash: txHash })
            }
          />
        </TabsContent>

        <TabsContent value="lookup">
          <NameLookup />
        </TabsContent>

        <TabsContent value="transfer">
          <CrossChainNameTransfer 
            onTransferComplete={(name, txHash) => 
              handleTransactionComplete('name_transfer', { name, transactionHash: txHash })
            }
          />
        </TabsContent>

        <TabsContent value="verify-names">
          <CrossChainNameVerifier />
        </TabsContent>

        <TabsContent value="credentials">
          <CredentialIssuer 
            onCredentialIssued={(tokenId, txHash) => 
              handleTransactionComplete('credential_issuance', { tokenId, transactionHash: txHash })
            }
          />
        </TabsContent>

        <TabsContent value="verify-creds">
          <CredentialVerifier />
        </TabsContent>

        <TabsContent value="bridge">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BridgeStatus />
            {recentTransactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Monitor</CardTitle>
                  <CardDescription>
                    Track your cross-chain transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionMonitor transactions={recentTransactions} />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EggNSDashboard;
