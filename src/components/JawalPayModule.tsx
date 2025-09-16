import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  CreditCard,
  Wallet,
  Send,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  DollarSign,
  PiggyBank,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  QrCode,
  Sparkles,
  Target,
  Award,
  Users,
  Building2
} from 'lucide-react';

const JawalPayModule = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('UGX');
  const [walletData, setWalletData] = useState({
    mainBalance: 15750000,
    usdBalance: 4200,
    eurBalance: 3800,
    pendingTransfers: 8,
    monthlyTransfers: 156,
    savingsGoal: 75,
    creditScore: 850
  });

  const currencies = [
    { code: 'UGX', symbol: 'UGX', rate: 1, flag: '🇺🇬' },
    { code: 'USD', symbol: '$', rate: 0.00027, flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', rate: 0.00025, flag: '🇪🇺' },
    { code: 'SAR', symbol: 'ر.س', rate: 0.001, flag: '🇸🇦' },
    { code: 'AED', symbol: 'د.إ', rate: 0.001, flag: '🇦🇪' },
    { code: 'QAR', symbol: 'ر.ق', rate: 0.001, flag: '🇶🇦' }
  ];

  const recentTransactions = [
    { id: 1, type: 'received', amount: 850000, currency: 'UGX', from: 'Mohammad Al-Rashid (UAE)', time: '2 min ago', status: 'completed' },
    { id: 2, type: 'sent', amount: 450000, currency: 'UGX', to: 'Sarah Nakamya Family', time: '1 hour ago', status: 'completed' },
    { id: 3, type: 'loan', amount: 1200000, currency: 'UGX', purpose: 'Medical Emergency', time: '3 hours ago', status: 'approved' },
    { id: 4, type: 'savings', amount: 300000, currency: 'UGX', goal: 'House Down Payment', time: '1 day ago', status: 'completed' }
  ];

  const quickActions = [
    { name: 'Send Money', icon: Send, color: 'from-blue-500 to-cyan-500', description: 'Instant global transfers' },
    { name: 'Request Loan', icon: TrendingUp, color: 'from-green-500 to-emerald-500', description: 'AI-powered approvals' },
    { name: 'Save Money', icon: PiggyBank, color: 'from-purple-500 to-pink-500', description: 'Automated savings' },
    { name: 'Pay Bills', icon: Zap, color: 'from-yellow-500 to-orange-500', description: 'Utility payments' },
    { name: 'QR Pay', icon: QrCode, color: 'from-indigo-500 to-blue-500', description: 'Scan to pay' },
    { name: 'Insurance', icon: Shield, color: 'from-red-500 to-pink-500', description: 'Health & travel' }
  ];

  const formatCurrency = (amount, currency = 'UGX') => {
    const curr = currencies.find(c => c.code === currency);
    if (currency === 'UGX') {
      return new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0
      }).format(amount);
    }
    return `${curr?.symbol}${(amount * (curr?.rate || 1)).toLocaleString()}`;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Jawal Pay</h1>
                <p className="text-gray-600">Your Global Financial Companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Connected to 54 Countries
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Credit Score</div>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-green-600">{walletData.creditScore}</div>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                  style={{ width: `${(walletData.creditScore / 900) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-green-600 font-medium">Excellent</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet Balance Card */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full translate-y-8 -translate-x-8" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-6 w-6 text-yellow-400" />
                  <div>
                    <h3 className="font-semibold text-lg">Multi-Currency Wallet</h3>
                    <p className="text-gray-300 text-sm">Global balance across all currencies</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-white hover:bg-white/10"
                >
                  {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center space-x-3 mb-6">
                {currencies.slice(0, 4).map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => setSelectedCurrency(currency.code)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      selectedCurrency === currency.code
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{currency.flag}</span>
                    <span className="font-medium">{currency.code}</span>
                  </button>
                ))}
              </div>

              {/* Main Balance */}
              <div className="mb-6">
                {balanceVisible ? (
                  <div className="text-4xl font-bold mb-2">
                    {formatCurrency(walletData.mainBalance, selectedCurrency)}
                  </div>
                ) : (
                  <div className="text-4xl font-bold mb-2 text-gray-400">••••••••</div>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-1">
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                    <span>+12.5% this month</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Real-time rates</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{walletData.pendingTransfers}</div>
                  <div className="text-xs text-gray-300">Pending Transfers</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{walletData.monthlyTransfers}</div>
                  <div className="text-xs text-gray-300">Monthly Transfers</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{walletData.savingsGoal}%</div>
                  <div className="text-xs text-gray-300">Savings Goal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="group p-4 rounded-xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{action.name}</div>
                  <div className="text-xs text-gray-600">{action.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI Financial Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-1">Optimal Transfer Time</div>
                <div className="text-xs text-gray-600">Send money now to save 3.2% on exchange rates</div>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-1">Savings Opportunity</div>
                <div className="text-xs text-gray-600">You could save UGX 180,000 monthly with automated savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Features */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 h-12 rounded-xl">
          <TabsTrigger value="transactions" className="px-6 py-2 rounded-lg">Recent Transactions</TabsTrigger>
          <TabsTrigger value="loans" className="px-6 py-2 rounded-lg">Micro-Loans</TabsTrigger>
          <TabsTrigger value="savings" className="px-6 py-2 rounded-lg">Savings & Goals</TabsTrigger>
          <TabsTrigger value="insurance" className="px-6 py-2 rounded-lg">Insurance</TabsTrigger>
          <TabsTrigger value="remittance" className="px-6 py-2 rounded-lg">Family Remittance</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">Recent Transactions</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Transfer
              </Button>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'received' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'sent' ? 'bg-blue-100 text-blue-600' :
                      transaction.type === 'loan' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {transaction.type === 'received' ? <ArrowDownLeft className="h-5 w-5" /> :
                       transaction.type === 'sent' ? <ArrowUpRight className="h-5 w-5" /> :
                       transaction.type === 'loan' ? <TrendingUp className="h-5 w-5" /> :
                       <PiggyBank className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.type === 'received' ? `From: ${transaction.from}` :
                         transaction.type === 'sent' ? `To: ${transaction.to}` :
                         transaction.type === 'loan' ? `Loan: ${transaction.purpose}` :
                         `Savings: ${transaction.goal}`}
                      </div>
                      <div className="text-sm text-gray-600">{transaction.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      transaction.type === 'received' ? 'text-green-600' :
                      transaction.type === 'sent' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {transaction.type === 'sent' ? '-' : '+'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <Badge className={`text-xs ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                      transaction.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">AI-Powered Micro-Loans</h3>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Apply for Loan
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quick Cash</h4>
                    <p className="text-sm text-gray-600">Emergency funding</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount Range</span>
                    <span className="text-sm font-medium">UGX 100K - 2M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest Rate</span>
                    <span className="text-sm font-medium text-green-600">2.5% monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Approval Time</span>
                    <span className="text-sm font-medium text-blue-600">5 minutes</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Business Boost</h4>
                    <p className="text-sm text-gray-600">For small businesses</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount Range</span>
                    <span className="text-sm font-medium">UGX 500K - 10M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest Rate</span>
                    <span className="text-sm font-medium text-green-600">1.8% monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Approval Time</span>
                    <span className="text-sm font-medium text-blue-600">24 hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">AI Credit Assessment</span>
              </div>
              <p className="text-sm text-blue-700">
                Based on your transaction history and employment verification, you're pre-approved for up to UGX 5,000,000 
                at our lowest interest rate. Your responsible payment history qualifies you for instant approval.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Savings Goals & Automated Deposits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">House Down Payment</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">Active</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">UGX 8.5M / UGX 15M</span>
                    </div>
                    <Progress value={57} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>57% complete</span>
                      <span>6 months remaining</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Children's Education</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Auto-Save</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">UGX 3.2M / UGX 12M</span>
                    </div>
                    <Progress value={27} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>27% complete</span>
                      <span>UGX 200K monthly</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Savings Achievements</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🏆</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Consistent Saver</div>
                      <div className="text-xs text-gray-600">6 months of regular deposits</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-silver rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🥈</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Goal Achiever</div>
                      <div className="text-xs text-gray-600">Completed 2 savings goals</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-bronze rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🥉</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Smart Saver</div>
                      <div className="text-xs text-gray-600">Saved 15% above target</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Insurance Marketplace</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Health Insurance</h4>
                    <p className="text-sm text-gray-600">Medical coverage abroad</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-blue-600">UGX 85,000</div>
                  <div className="text-sm text-gray-600">per month</div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Get Quote
                  </Button>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Travel Insurance</h4>
                    <p className="text-sm text-gray-600">Journey protection</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">UGX 45,000</div>
                  <div className="text-sm text-gray-600">per trip</div>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    Get Quote
                  </Button>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Family Protection</h4>
                    <p className="text-sm text-gray-600">Life & disability</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-purple-600">UGX 125,000</div>
                  <div className="text-sm text-gray-600">per month</div>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    Get Quote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="remittance" className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Family Remittance Platform</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Send Money Home</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Amount to Send</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        <div className="absolute right-3 top-3 text-gray-500">UGX</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
                        <option>Select family member</option>
                        <option>Sarah Nakamya (Mother)</option>
                        <option>James Ssemakula (Brother)</option>
                        <option>Grace Nalubega (Sister)</option>
                      </select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Send Money
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Smart Remittance</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    AI suggests optimal sending times and amounts based on exchange rates and family needs.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Remittance History</h4>
                <div className="space-y-3">
                  {[
                    { recipient: 'Sarah Nakamya (Mother)', amount: 450000, date: '2 days ago', status: 'Delivered' },
                    { recipient: 'James Ssemakula (Brother)', amount: 280000, date: '1 week ago', status: 'Delivered' },
                    { recipient: 'Grace Nalubega (Sister)', amount: 350000, date: '2 weeks ago', status: 'Delivered' }
                  ].map((transfer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{transfer.recipient}</div>
                        <div className="text-sm text-gray-600">{transfer.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(transfer.amount)}</div>
                        <Badge className="bg-green-100 text-green-700 text-xs">{transfer.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JawalPayModule;