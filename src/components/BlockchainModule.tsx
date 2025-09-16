import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Shield,
  Lock,
  Key,
  Coins,
  Award,
  Users,
  Vote,
  Zap,
  FileCheck,
  Globe,
  Link,
  Sparkles,
  TrendingUp,
  Wallet,
  QrCode,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

const BlockchainModule = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [userWallet, setUserWallet] = useState({
    address: '0x742d35Cc5A9bF84a1B3F72b6Bd4A6Db23f2C....',
    balance: 2547.89,
    nfts: 12,
    tokens: 8942,
    reputation: 95
  });

  const [blockchainStats, setBlockchainStats] = useState({
    totalTransactions: 124567,
    verifiedCredentials: 45678,
    activeContracts: 289,
    stakingRewards: 156.78,
    governanceProposals: 23,
    tokenHolders: 8945
  });

  const smartContracts = [
    {
      id: 1,
      name: 'Candidate Verification',
      address: '0x1a2b3c...def456',
      status: 'active',
      transactions: 15847,
      gasUsed: '2.4M',
      lastActivity: '2 hours ago',
      version: 'v2.1.0'
    },
    {
      id: 2,
      name: 'Employment Escrow',
      address: '0x789abc...123def',
      status: 'active',
      transactions: 8945,
      gasUsed: '1.8M',
      lastActivity: '5 minutes ago',
      version: 'v1.8.2'
    },
    {
      id: 3,
      name: 'Agent Commission',
      address: '0xdef123...789abc',
      status: 'pending',
      transactions: 5623,
      gasUsed: '1.2M',
      lastActivity: '1 day ago',
      version: 'v1.5.1'
    }
  ];

  const nftCollections = [
    {
      id: 1,
      name: 'Professional Certifications',
      description: 'Blockchain-verified skill certifications',
      total: 1247,
      floor: 0.5,
      volume: 89.4,
      image: '📜',
      verified: true
    },
    {
      id: 2,
      name: 'Achievement Badges',
      description: 'Milestone and performance achievements',
      total: 3456,
      floor: 0.1,
      volume: 234.7,
      image: '🏆',
      verified: true
    },
    {
      id: 3,
      name: 'Experience Records',
      description: 'Verified employment history NFTs',
      total: 892,
      floor: 1.2,
      volume: 156.8,
      image: '💼',
      verified: true
    }
  ];

  const daoProposals = [
    {
      id: 1,
      title: 'Increase Agent Commission Rate to 12%',
      description: 'Proposal to raise commission rates to attract more quality agents',
      proposer: '0x123...abc',
      status: 'active',
      votesFor: 2847,
      votesAgainst: 1523,
      totalVotes: 4370,
      endDate: '2025-01-20',
      category: 'Economic'
    },
    {
      id: 2,
      title: 'New Skill Verification Standards',
      description: 'Implement enhanced blockchain verification for healthcare workers',
      proposer: '0x456...def',
      status: 'passed',
      votesFor: 5847,
      votesAgainst: 1205,
      totalVotes: 7052,
      endDate: '2024-12-28',
      category: 'Technical'
    },
    {
      id: 3,
      title: 'Partnership with Additional Gulf Countries',
      description: 'Expand operations to include Bahrain and Oman',
      proposer: '0x789...ghi',
      status: 'pending',
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
      endDate: '2025-02-15',
      category: 'Strategic'
    }
  ];

  const credentialTypes = [
    { name: 'Identity Verification', icon: '🆔', count: 45678, status: 'active' },
    { name: 'Educational Certificates', icon: '🎓', count: 28945, status: 'active' },
    { name: 'Skill Assessments', icon: '⚡', count: 34567, status: 'active' },
    { name: 'Work Experience', icon: '💼', count: 19823, status: 'active' },
    { name: 'Medical Clearances', icon: '🏥', count: 23456, status: 'active' },
    { name: 'Background Checks', icon: '🔍', count: 41789, status: 'active' }
  ];

  const auditTrail = [
    {
      id: 1,
      action: 'Credential Issued',
      entity: 'Healthcare Certificate - Sarah Nakamya',
      hash: '0x1a2b3c4d...',
      timestamp: '2024-12-15 14:30:22',
      gas: '0.0012 ETH',
      status: 'confirmed'
    },
    {
      id: 2,
      action: 'Smart Contract Deployed',
      entity: 'Employment Escrow v1.8.2',
      hash: '0x5e6f7g8h...',
      timestamp: '2024-12-15 12:15:08',
      gas: '0.0245 ETH',
      status: 'confirmed'
    },
    {
      id: 3,
      action: 'Token Transfer',
      entity: '1000 JWL → Agent Commission',
      hash: '0x9i0j1k2l...',
      timestamp: '2024-12-15 11:45:33',
      gas: '0.0008 ETH',
      status: 'confirmed'
    }
  ];

  const connectWallet = () => {
    setWalletConnected(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Blockchain Suite</h1>
                <p className="text-gray-600">Web3 Infrastructure & Decentralized Trust</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                Smart Contracts
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Coins className="h-3 w-3 mr-1" />
                DeFi Enabled
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Vote className="h-3 w-3 mr-1" />
                DAO Governance
              </Badge>
            </div>
          </div>
          
          {/* Wallet Connection */}
          <div className="text-right">
            {walletConnected ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700">Wallet Connected</span>
                </div>
                <div className="text-sm text-gray-600">{userWallet.address}</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{userWallet.balance}</div>
                    <div className="text-gray-600">JWL Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{userWallet.nfts}</div>
                    <div className="text-gray-600">NFTs</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Connect your Web3 wallet</p>
                <Button onClick={connectWallet} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blockchain Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Link className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-purple-100 text-purple-700">24h</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{blockchainStats.totalTransactions.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Transactions</div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-blue-100 text-blue-700">Verified</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{blockchainStats.verifiedCredentials.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Verified Credentials</div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{blockchainStats.activeContracts}</div>
          <div className="text-sm text-gray-600">Smart Contracts</div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-yellow-100 text-yellow-700">Rewards</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{blockchainStats.stakingRewards}</div>
          <div className="text-sm text-gray-600">JWL Earned</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 h-12 rounded-xl">
          <TabsTrigger value="identity" className="px-6 py-2 rounded-lg">Digital Identity</TabsTrigger>
          <TabsTrigger value="contracts" className="px-6 py-2 rounded-lg">Smart Contracts</TabsTrigger>
          <TabsTrigger value="tokens" className="px-6 py-2 rounded-lg">Token Economy</TabsTrigger>
          <TabsTrigger value="nfts" className="px-6 py-2 rounded-lg">NFT Credentials</TabsTrigger>
          <TabsTrigger value="dao" className="px-6 py-2 rounded-lg">DAO Governance</TabsTrigger>
          <TabsTrigger value="audit" className="px-6 py-2 rounded-lg">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Decentralized Identity Verification</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Credential Types</h4>
                  <div className="space-y-3">
                    {credentialTypes.map((credential, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{credential.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{credential.name}</div>
                            <div className="text-sm text-gray-600">{credential.count.toLocaleString()} verified</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">{credential.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Verification Process</h4>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Document Submission', status: 'completed', time: '2 min' },
                      { step: 2, title: 'AI Analysis', status: 'completed', time: '30 sec' },
                      { step: 3, title: 'Blockchain Recording', status: 'completed', time: '1 min' },
                      { step: 4, title: 'Credential Minting', status: 'active', time: '45 sec' },
                      { step: 5, title: 'Distribution', status: 'pending', time: '15 sec' }
                    ].map((step) => (
                      <div key={step.step} className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-500 text-white' :
                          step.status === 'active' ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {step.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : step.step}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{step.title}</div>
                          <div className="text-sm text-gray-600">~{step.time}</div>
                        </div>
                        {step.status === 'active' && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Identity Wallet</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <Key className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Master Identity</div>
                          <div className="text-sm text-gray-600">Primary blockchain ID</div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Verified</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <FileCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Professional Credentials</div>
                          <div className="text-sm text-gray-600">12 verified certificates</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Achievement NFTs</div>
                          <div className="text-sm text-gray-600">8 unique achievements</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Privacy Controls</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-900">Public Profile Visibility</span>
                      <div className="w-10 h-5 bg-green-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-900">Credential Sharing</span>
                      <div className="w-10 h-5 bg-green-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-900">Analytics Tracking</span>
                      <div className="w-10 h-5 bg-gray-300 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">Smart Contract Management</h3>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Deploy Contract
              </Button>
            </div>
            
            <div className="space-y-4">
              {smartContracts.map((contract) => (
                <div key={contract.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{contract.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{contract.address}</span>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(contract.address)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Badge className={
                      contract.status === 'active' ? 'bg-green-100 text-green-700' :
                      contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {contract.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{contract.transactions.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Transactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{contract.gasUsed}</div>
                      <div className="text-xs text-gray-600">Gas Used</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{contract.lastActivity}</div>
                      <div className="text-xs text-gray-600">Last Activity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{contract.version}</div>
                      <div className="text-xs text-gray-600">Version</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Code
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Etherscan
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">JWL Token Economy</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Token Overview</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Token Symbol</span>
                      <span className="font-medium">JWL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Supply</span>
                      <span className="font-medium">1,000,000,000 JWL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Circulating Supply</span>
                      <span className="font-medium">245,678,932 JWL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Market Cap</span>
                      <span className="font-medium">$12,284,567</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">$0.05</span>
                        <Badge className="bg-green-100 text-green-700">+5.2%</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Staking Rewards</h4>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{blockchainStats.stakingRewards} JWL</div>
                    <div className="text-sm text-gray-600">Available to claim</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Staked Amount</span>
                      <span className="font-medium">10,000 JWL</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">APY</span>
                      <span className="font-medium text-green-600">12.5%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Lock Period</span>
                      <span className="font-medium">90 days</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                    <Coins className="h-4 w-4 mr-2" />
                    Claim Rewards
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Token Utility</h4>
                  <div className="space-y-3">
                    {[
                      { use: 'Platform Fees', percentage: 35, description: 'Transaction and service fees' },
                      { use: 'Staking Rewards', percentage: 25, description: 'Validator and delegator rewards' },
                      { use: 'Governance Voting', percentage: 20, description: 'DAO proposal voting power' },
                      { use: 'Agent Commissions', percentage: 15, description: 'Payment to recruitment agents' },
                      { use: 'Ecosystem Incentives', percentage: 5, description: 'Growth and adoption rewards' }
                    ].map((utility, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{utility.use}</span>
                          <span className="text-sm font-medium">{utility.percentage}%</span>
                        </div>
                        <Progress value={utility.percentage} className="h-2 mb-1" />
                        <div className="text-xs text-gray-600">{utility.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Token Transactions</h4>
                  <div className="space-y-3">
                    {[
                      { type: 'Reward Claim', amount: '+50.25 JWL', time: '2 hours ago', hash: '0x1a2b...' },
                      { type: 'Staking', amount: '-1000 JWL', time: '1 day ago', hash: '0x3c4d...' },
                      { type: 'Commission', amount: '+125.50 JWL', time: '2 days ago', hash: '0x5e6f...' }
                    ].map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{tx.type}</div>
                          <div className="text-sm text-gray-600">{tx.time}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount}
                          </div>
                          <div className="text-xs text-gray-500">{tx.hash}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nfts" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">NFT Credential Collections</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nftCollections.map((collection) => (
                <div key={collection.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-3">{collection.image}</div>
                      <div className="flex items-center justify-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{collection.name}</h4>
                        {collection.verified && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 text-center mb-4">{collection.description}</p>
                    
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{collection.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Total Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{collection.floor} ETH</div>
                        <div className="text-xs text-gray-600">Floor Price</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{collection.volume} ETH</div>
                        <div className="text-xs text-gray-600">24h Volume</div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      <Award className="h-4 w-4 mr-2" />
                      View Collection
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* User's NFT Portfolio */}
            <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <h4 className="font-semibold text-gray-900 mb-4">Your NFT Portfolio</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { id: 1, name: 'Healthcare Pro', rarity: 'Rare', image: '🏥' },
                  { id: 2, name: 'Language Master', rarity: 'Epic', image: '🗣️' },
                  { id: 3, name: 'Safety Expert', rarity: 'Common', image: '🛡️' },
                  { id: 4, name: 'Team Leader', rarity: 'Rare', image: '👨‍💼' },
                  { id: 5, name: 'Cultural Bridge', rarity: 'Legendary', image: '🌍' },
                  { id: 6, name: 'Innovation Award', rarity: 'Epic', image: '💡' }
                ].map((nft) => (
                  <div key={nft.id} className="bg-white rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer">
                    <div className="text-4xl mb-2">{nft.image}</div>
                    <div className="text-sm font-medium text-gray-900">{nft.name}</div>
                    <Badge className={
                      nft.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-700' :
                      nft.rarity === 'Epic' ? 'bg-purple-100 text-purple-700' :
                      nft.rarity === 'Rare' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    } text-xs mt-1>
                      {nft.rarity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dao" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">DAO Governance</h3>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Vote className="h-4 w-4 mr-2" />
                Create Proposal
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  {daoProposals.map((proposal) => (
                    <div key={proposal.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{proposal.title}</h4>
                            <Badge className={
                              proposal.status === 'active' ? 'bg-green-100 text-green-700' :
                              proposal.status === 'passed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {proposal.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {proposal.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{proposal.description}</p>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{proposal.votesFor.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">For</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-red-600">{proposal.votesAgainst.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">Against</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{proposal.totalVotes.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">Total</div>
                            </div>
                          </div>

                          {proposal.totalVotes > 0 && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Approval Rate</span>
                                <span>{Math.round((proposal.votesFor / proposal.totalVotes) * 100)}%</span>
                              </div>
                              <Progress 
                                value={(proposal.votesFor / proposal.totalVotes) * 100} 
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Ends: {proposal.endDate}
                        </div>
                        {proposal.status === 'active' && (
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                              Vote For
                            </Button>
                            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                              Vote Against
                            </Button>
                          </div>
                        )}
                        {proposal.status !== 'active' && (
                          <Button size="sm" variant="outline">
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Your Voting Power</h4>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{userWallet.tokens.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">JWL Tokens</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Voting Weight</span>
                      <span className="font-medium">0.89%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Proposals Voted</span>
                      <span className="font-medium">12 / 23</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Participation Rate</span>
                      <span className="font-medium text-green-600">52.2%</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Governance Stats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Proposals</span>
                      <span className="font-medium">{blockchainStats.governanceProposals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Voters</span>
                      <span className="font-medium">{blockchainStats.tokenHolders.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Participation</span>
                      <span className="font-medium text-blue-600">68.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Treasury</span>
                      <span className="font-medium">2.4M JWL</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Delegation</h4>
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Delegate your voting power to trusted community members
                    </p>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Delegation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">Immutable Audit Trail</h3>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live Updates
                </Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Log
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {auditTrail.map((entry) => (
                <div key={entry.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Link className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-medium text-gray-900">{entry.action}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">{entry.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{entry.entity}</div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{entry.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{entry.gas}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Transaction Hash</div>
                      <div className="text-xs font-mono text-gray-500">{entry.hash}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(entry.hash)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Blockchain Analytics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">Transaction Volume</h4>
                <div className="text-2xl font-bold text-blue-600 mb-2">124,567</div>
                <div className="text-sm text-gray-600">Total blockchain transactions</div>
                <Badge className="bg-blue-100 text-blue-700 mt-2">+15.3% this week</Badge>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3">Data Integrity</h4>
                <div className="text-2xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Verified records accuracy</div>
                <Badge className="bg-green-100 text-green-700 mt-2">All checks passed</Badge>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-3">Network Security</h4>
                <div className="text-2xl font-bold text-purple-600 mb-2">A+</div>
                <div className="text-sm text-gray-600">Security audit score</div>
                <Badge className="bg-purple-100 text-purple-700 mt-2">Enterprise grade</Badge>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockchainModule;