import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Globe,
  MapPin,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Flag,
  Plane,
  FileText,
  Shield,
  Handshake,
  BarChart3,
  Zap,
  Eye,
  Settings,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';

const MultiCountryModule = () => {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('gulf');
  const [realTimeData, setRealTimeData] = useState({
    totalCountries: 54,
    activeOperations: 12,
    candidatesDeployed: 45678,
    monthlyPlacements: 2847,
    totalRevenue: 2400000000
  });

  const regions = [
    { id: 'gulf', name: 'Gulf Countries', countries: 6, active: true, color: 'from-blue-500 to-cyan-500' },
    { id: 'east-africa', name: 'East Africa', countries: 8, active: true, color: 'from-green-500 to-emerald-500' },
    { id: 'west-africa', name: 'West Africa', countries: 12, active: false, color: 'from-yellow-500 to-orange-500' },
    { id: 'central-africa', name: 'Central Africa', countries: 9, active: false, color: 'from-purple-500 to-pink-500' },
    { id: 'north-africa', name: 'North Africa', countries: 7, active: false, color: 'from-red-500 to-pink-500' },
    { id: 'southern-africa', name: 'Southern Africa', countries: 12, active: false, color: 'from-indigo-500 to-purple-500' }
  ];

  const gulfCountries = [
    {
      id: 'uae',
      name: 'United Arab Emirates',
      flag: '🇦🇪',
      capital: 'Abu Dhabi',
      status: 'active',
      candidates: 12847,
      agents: 245,
      employers: 89,
      revenue: 680000000,
      growth: 15.4,
      currency: 'AED',
      languages: ['Arabic', 'English'],
      visaTypes: ['Work Visa', 'Domestic Worker', 'Skilled Professional'],
      processingTime: '45-60 days',
      complianceScore: 98,
      economicIndicators: {
        gdp: 421000000000,
        unemploymentRate: 2.3,
        inflationRate: 2.1
      }
    },
    {
      id: 'saudi',
      name: 'Saudi Arabia',
      flag: '🇸🇦',
      capital: 'Riyadh',
      status: 'active',
      candidates: 18452,
      agents: 167,
      employers: 124,
      revenue: 890000000,
      growth: 22.8,
      currency: 'SAR',
      languages: ['Arabic', 'English'],
      visaTypes: ['Work Visa', 'Domestic Worker', 'Healthcare', 'Construction'],
      processingTime: '60-75 days',
      complianceScore: 95,
      economicIndicators: {
        gdp: 833000000000,
        unemploymentRate: 11.7,
        inflationRate: 3.1
      }
    },
    {
      id: 'qatar',
      name: 'Qatar',
      flag: '🇶🇦',
      capital: 'Doha',
      status: 'active',
      candidates: 8956,
      agents: 98,
      employers: 45,
      revenue: 520000000,
      growth: 18.9,
      currency: 'QAR',
      languages: ['Arabic', 'English'],
      visaTypes: ['Work Visa', 'Construction', 'Hospitality'],
      processingTime: '30-45 days',
      complianceScore: 97,
      economicIndicators: {
        gdp: 179000000000,
        unemploymentRate: 0.1,
        inflationRate: -2.7
      }
    },
    {
      id: 'kuwait',
      name: 'Kuwait',
      flag: '🇰🇼',
      capital: 'Kuwait City',
      status: 'active',
      candidates: 5423,
      agents: 67,
      employers: 32,
      revenue: 310000000,
      growth: 12.1,
      currency: 'KWD',
      languages: ['Arabic', 'English'],
      visaTypes: ['Work Visa', 'Domestic Worker'],
      processingTime: '35-50 days',
      complianceScore: 94,
      economicIndicators: {
        gdp: 134000000000,
        unemploymentRate: 2.1,
        inflationRate: 1.1
      }
    },
    {
      id: 'bahrain',
      name: 'Bahrain',
      flag: '🇧🇭',
      capital: 'Manama',
      status: 'pilot',
      candidates: 1247,
      agents: 23,
      employers: 12,
      revenue: 45000000,
      growth: 8.7,
      currency: 'BHD',
      languages: ['Arabic', 'English'],
      visaTypes: ['Work Visa', 'Professional'],
      processingTime: '25-35 days',
      complianceScore: 92,
      economicIndicators: {
        gdp: 38000000000,
        unemploymentRate: 1.2,
        inflationRate: -0.6
      }
    },
    {
      id: 'oman',
      name: 'Oman',
      flag: '🇴🇲',
      capital: 'Muscat',
      status: 'planned',
      candidates: 0,
      agents: 0,
      employers: 0,
      revenue: 0,
      growth: 0,
      currency: 'OMR',
      languages: ['Arabic', 'English'],
      visaTypes: ['Work Visa', 'Professional', 'Healthcare'],
      processingTime: '40-55 days',
      complianceScore: 0,
      economicIndicators: {
        gdp: 76000000000,
        unemploymentRate: 3.0,
        inflationRate: 1.9
      }
    }
  ];

  const eastAfricanCountries = [
    {
      id: 'uganda',
      name: 'Uganda',
      flag: '🇺🇬',
      capital: 'Kampala',
      status: 'headquarters',
      candidates: 28945,
      agents: 456,
      employers: 0,
      revenue: 0,
      growth: 0,
      currency: 'UGX',
      languages: ['English', 'Swahili', 'Luganda'],
      population: 47123533,
      complianceScore: 100
    },
    {
      id: 'kenya',
      name: 'Kenya',
      flag: '🇰🇪',
      capital: 'Nairobi',
      status: 'active',
      candidates: 15624,
      agents: 189,
      employers: 0,
      revenue: 0,
      growth: 0,
      currency: 'KES',
      languages: ['English', 'Swahili'],
      population: 54027652,
      complianceScore: 87
    },
    {
      id: 'tanzania',
      name: 'Tanzania',
      flag: '🇹🇿',
      capital: 'Dodoma',
      status: 'active',
      candidates: 9834,
      agents: 98,
      employers: 0,
      revenue: 0,
      growth: 0,
      currency: 'TZS',
      languages: ['English', 'Swahili'],
      population: 61498437,
      complianceScore: 82
    },
    {
      id: 'rwanda',
      name: 'Rwanda',
      flag: '🇷🇼',
      capital: 'Kigali',
      status: 'pilot',
      candidates: 3456,
      agents: 34,
      employers: 0,
      revenue: 0,
      growth: 0,
      currency: 'RWF',
      languages: ['English', 'French', 'Kinyarwanda'],
      population: 13276513,
      complianceScore: 95
    }
  ];

  const regulatoryUpdates = [
    {
      id: 1,
      country: 'UAE',
      title: 'New Domestic Worker Visa Regulations',
      description: 'Updated visa processing requirements effective January 2025',
      type: 'regulatory',
      priority: 'high',
      date: '2024-12-15',
      status: 'active',
      impact: 'All domestic worker applications'
    },
    {
      id: 2,
      country: 'Saudi Arabia',
      title: 'Healthcare Worker Certification Requirements',
      description: 'Additional medical certifications now required',
      type: 'compliance',
      priority: 'medium',
      date: '2024-12-10',
      status: 'pending',
      impact: 'Healthcare sector placements'
    },
    {
      id: 3,
      country: 'Qatar',
      title: 'Wage Protection System Update',
      description: 'Enhanced salary verification protocols',
      type: 'policy',
      priority: 'low',
      date: '2024-12-08',
      status: 'implemented',
      impact: 'All employment contracts'
    }
  ];

  const formatCurrency = (amount, currency = 'USD') => {
    if (currency === 'UGX') {
      return new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Multi-Country Operations</h1>
                <p className="text-gray-600">Global Labor Mobility Command Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                {realTimeData.totalCountries} Countries
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Zap className="h-3 w-3 mr-1" />
                {realTimeData.activeOperations} Active Operations
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live Data Stream
              </Badge>
            </div>
          </div>
          
          {/* Global KPIs */}
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeData.candidatesDeployed.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Total Deployed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(realTimeData.totalRevenue)}</div>
                <div className="text-xs text-gray-600">Global Revenue</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Overview */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-6">Regional Operations Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`group p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedRegion === region.id
                  ? 'border-blue-300 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{region.name}</h4>
                <Badge className={region.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {region.active ? 'Active' : 'Planned'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{region.countries} countries</span>
                <div className={`w-8 h-8 bg-gradient-to-r ${region.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="gulf-countries" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 h-12 rounded-xl">
          <TabsTrigger value="gulf-countries" className="px-6 py-2 rounded-lg">Gulf Operations</TabsTrigger>
          <TabsTrigger value="african-markets" className="px-6 py-2 rounded-lg">African Markets</TabsTrigger>
          <TabsTrigger value="compliance" className="px-6 py-2 rounded-lg">Compliance Center</TabsTrigger>
          <TabsTrigger value="partnerships" className="px-6 py-2 rounded-lg">Government Relations</TabsTrigger>
          <TabsTrigger value="analytics" className="px-6 py-2 rounded-lg">Cross-Border Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="gulf-countries" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">Gulf Countries Operations</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {gulfCountries.map((country) => (
                <div key={country.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{country.flag}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{country.name}</h4>
                          <p className="text-sm text-gray-600">{country.capital}</p>
                        </div>
                      </div>
                      <Badge className={
                        country.status === 'active' ? 'bg-green-100 text-green-700' :
                        country.status === 'pilot' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {country.status}
                      </Badge>
                    </div>

                    {country.status !== 'planned' && (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{country.candidates.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Candidates</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{country.agents}</div>
                            <div className="text-xs text-gray-600">Agents</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{country.employers}</div>
                            <div className="text-xs text-gray-600">Employers</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Revenue</span>
                            <span className="text-sm font-bold text-green-600">
                              +{country.growth}%
                            </span>
                          </div>
                          <div className="text-xl font-bold text-gray-900 mb-1">
                            {formatCurrency(country.revenue)}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Compliance Score</span>
                            <span className="text-sm font-medium">{country.complianceScore}%</span>
                          </div>
                          <Progress value={country.complianceScore} className="h-2" />
                        </div>
                      </>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Processing Time</span>
                        <span className="font-medium">{country.processingTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Currency</span>
                        <span className="font-medium">{country.currency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Languages</span>
                        <span className="font-medium">{country.languages.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {country.visaTypes.slice(0, 2).map((visa, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {visa}
                        </Badge>
                      ))}
                      {country.visaTypes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{country.visaTypes.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="african-markets" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">East African Source Markets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eastAfricanCountries.map((country) => (
                <div key={country.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{country.name}</h4>
                        <p className="text-sm text-gray-600">{country.capital}</p>
                      </div>
                    </div>

                    <Badge className={
                      country.status === 'headquarters' ? 'bg-yellow-100 text-yellow-700' :
                      country.status === 'active' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    } mb-4>
                      {country.status}
                    </Badge>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Population</span>
                        <span className="font-medium">{country.population?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Candidates</span>
                        <span className="font-medium text-blue-600">{country.candidates.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active Agents</span>
                        <span className="font-medium text-green-600">{country.agents}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Compliance</span>
                        <span className="font-medium">{country.complianceScore}%</span>
                      </div>
                    </div>

                    <Progress value={country.complianceScore} className="h-2 mb-4" />

                    <div className="flex flex-wrap gap-1 mb-4">
                      {country.languages?.map((language, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {language}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <Building2 className="h-4 w-4 mr-2" />
                      View Operations
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Market Analytics */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Source Market Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Candidate Pipeline</h4>
                    <p className="text-sm text-gray-600">Active recruitment</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">57,859</div>
                <div className="text-sm text-gray-600">Ready for deployment</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Success Rate</h4>
                    <p className="text-sm text-gray-600">Placement success</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">94.7%</div>
                <div className="text-sm text-gray-600">Above industry average</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Processing Time</h4>
                    <p className="text-sm text-gray-600">Average deployment</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">52</div>
                <div className="text-sm text-gray-600">Days end-to-end</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Regulatory Compliance Matrix</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Critical Updates</h4>
                  <div className="space-y-4">
                    {regulatoryUpdates.filter(update => update.priority === 'high').map((update) => (
                      <div key={update.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{update.country}</span>
                            <Badge className="bg-red-100 text-red-700 text-xs">{update.priority}</Badge>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-1">{update.title}</h5>
                          <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{update.date}</span>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Recent Policy Changes</h4>
                  <div className="space-y-3">
                    {regulatoryUpdates.filter(update => update.priority !== 'high').map((update) => (
                      <div key={update.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{update.country}</span>
                              <Badge className={
                                update.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                              } text-xs>
                                {update.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{update.title}</p>
                            <p className="text-xs text-gray-500">{update.date}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Compliance Dashboard</h4>
                  <div className="space-y-4">
                    {gulfCountries.slice(0, 4).map((country) => (
                      <div key={country.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <div className="font-medium text-gray-900">{country.name}</div>
                            <div className="text-sm text-gray-600">Last updated: 2 hours ago</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{country.complianceScore}%</div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all duration-1000"
                              style={{ width: `${country.complianceScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Automated Monitoring</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Real-time Policy Tracking</div>
                        <div className="text-sm text-gray-600">AI monitors 247 regulatory sources</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">Instant Alerts</div>
                        <div className="text-sm text-gray-600">Immediate notification of changes</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">Auto Documentation</div>
                        <div className="text-sm text-gray-600">Compliance reports generated daily</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Government Relations & Bilateral Agreements</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Active Bilateral Agreements</h4>
                  <div className="space-y-4">
                    {[
                      { source: 'Uganda', destination: 'UAE', status: 'Active', signed: '2019', candidates: 12847 },
                      { source: 'Kenya', destination: 'Saudi Arabia', status: 'Active', signed: '2020', candidates: 8956 },
                      { source: 'Tanzania', destination: 'Qatar', status: 'Pending', signed: '2024', candidates: 0 },
                      { source: 'Rwanda', destination: 'Kuwait', status: 'Negotiating', signed: null, candidates: 0 }
                    ].map((agreement, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">
                            {agreement.source} ↔ {agreement.destination}
                          </div>
                          <div className="text-sm text-gray-600">
                            {agreement.signed ? `Signed: ${agreement.signed}` : 'Under negotiation'}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            agreement.status === 'Active' ? 'bg-green-100 text-green-700' :
                            agreement.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {agreement.status}
                          </Badge>
                          {agreement.candidates > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              {agreement.candidates.toLocaleString()} deployed
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Government Contacts</h4>
                  <div className="space-y-3">
                    {[
                      { 
                        name: 'Ministry of Labour - UAE',
                        contact: 'Dr. Sarah Al-Mansouri',
                        role: 'Director of Foreign Workers',
                        phone: '+971-4-XXX-XXXX',
                        email: 'sarah.almansouri@mol.ae'
                      },
                      {
                        name: 'Ministry of Labor - Saudi Arabia',
                        contact: 'Eng. Mohammed Hassan',
                        role: 'Foreign Workforce Coordinator',
                        phone: '+966-11-XXX-XXXX',
                        email: 'mhassan@mol.gov.sa'
                      }
                    ].map((contact, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.contact} - {contact.role}</div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span>{contact.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Diplomatic Relations</h4>
                  <div className="space-y-4">
                    {[
                      { embassy: 'UAE Embassy - Kampala', status: 'Excellent', cooperation: 95 },
                      { embassy: 'Saudi Embassy - Nairobi', status: 'Good', cooperation: 87 },
                      { embassy: 'Qatar Embassy - Kigali', status: 'Developing', cooperation: 72 }
                    ].map((relation, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{relation.embassy}</div>
                          <Badge className={
                            relation.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                            relation.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {relation.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Cooperation Level</span>
                          <span className="text-sm font-medium">{relation.cooperation}%</span>
                        </div>
                        <Progress value={relation.cooperation} className="h-2 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Upcoming Meetings</h4>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'UAE Labor Cooperation Review',
                        date: 'Jan 15, 2025',
                        time: '10:00 AM',
                        attendees: 8,
                        type: 'Virtual'
                      },
                      {
                        title: 'Saudi Healthcare Worker MOU',
                        date: 'Jan 22, 2025',
                        time: '2:00 PM',
                        attendees: 12,
                        type: 'In-person'
                      }
                    ].map((meeting, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{meeting.title}</div>
                          <div className="text-sm text-gray-600">{meeting.date} at {meeting.time}</div>
                          <div className="text-xs text-gray-500">{meeting.attendees} attendees • {meeting.type}</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Cross-Border Analytics & Economic Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Plane className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Migration Flow</h4>
                    <p className="text-sm text-gray-600">Monthly average</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">2,847</div>
                <div className="text-sm text-gray-600">Workers deployed</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Remittances</h4>
                    <p className="text-sm text-gray-600">Sent home monthly</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">$89M</div>
                <div className="text-sm text-gray-600">Economic impact</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">GDP Contribution</h4>
                    <p className="text-sm text-gray-600">To source countries</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">2.4%</div>
                <div className="text-sm text-gray-600">Of total GDP</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Market Growth</h4>
                    <p className="text-sm text-gray-600">Year over year</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">+18.5%</div>
                <div className="text-sm text-gray-600">Above projections</div>
              </div>
            </div>

            {/* Economic Impact Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Migration Patterns</h4>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Interactive migration flow map</p>
                    <p className="text-sm text-gray-500">Real-time workforce movement visualization</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Economic Impact Trends</h4>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Economic contribution analysis</p>
                    <p className="text-sm text-gray-500">GDP impact and remittance flows</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiCountryModule;