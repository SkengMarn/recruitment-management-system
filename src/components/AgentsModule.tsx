import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  Plus, Search, Filter, Edit, Trash2, Building, MapPin, DollarSign, Users, Calendar, 
  BarChart3, TrendingUp, Eye, Copy, Download, RefreshCw, X, Save, AlertCircle,
  Phone, Mail, CheckCircle, Star, Upload, Camera, Edit3, User, Target, Award, Trophy, Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, supabase } from '../utils/supabase/client';
import { checkEmailExists, formatEmailError, isValidEmailFormat } from '../utils/emailValidation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent } from './ui/dialog';
import SmartTable from './ui/smart-table';
import { Switch } from './ui/switch';
import AgentBioDataModal from './AgentBioDataModal';

// Define types
interface Agent {
  id: string;
  agency_name: string;
  agency_id: string;
  phone?: string;
  email?: string;
  agency_country?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'flat';
  commission_value: number;
  is_active: boolean;
  photo_url?: string;
  total_candidates?: number;
  successful_placements?: number;
  total_earned?: number;
  created_at: string;
  updated_at: string;
  notes?: string;
  address?: string;
  contact_person?: string;
}

const AgentsModule: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [showBioDataModal, setShowBioDataModal] = useState(false);
  const [selectedAgentForBio, setSelectedAgentForBio] = useState<Agent | null>(null);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [agentsData, candidatesData] = await Promise.all([
        apiClient.getAgents(),
        apiClient.getCandidates()
      ]);
      setAgents(agentsData.agents || []);
      setCandidates(candidatesData.candidates || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAgents();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setError('Failed to load agents data');
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (formData: any) => {
    try {
      const response = await apiClient.createAgent(formData);
      setAgents(prev => [...prev, response.agent]);
      setShowForm(false);
      toast.success('Agent deleted successfully');
      await fetchAllData(); // Refresh data
    } catch (err) {
      console.error('Failed to create agent:', err);
      toast.error('Failed to create agent');
    }
  };

  const handleUpdateAgent = async (id: string, formData: any) => {
    try {
      const response = await apiClient.updateAgent(id, formData);
      setAgents(prev => prev.map(agent => 
        agent.id === id ? { ...agent, ...response.agent } : agent
      ));
      setShowForm(false);
      toast.success('Agent updated successfully');
      await fetchAllData(); // Refresh data
    } catch (err) {
      console.error('Failed to update agent:', err);
      toast.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await apiClient.deleteAgent(id);
      setAgents(prev => prev.filter(agent => agent.id !== id));
      toast.success('Agent deleted successfully');
    } catch (err) {
      console.error('Failed to delete agent:', err);
      toast.error('Failed to delete agent');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateSuccessRate = (agent: Agent) => {
    if (!agent.total_candidates || agent.total_candidates === 0) return '0.0';
    const rate = ((agent.successful_placements || 0) / agent.total_candidates) * 100;
    return isNaN(rate) ? '0.0' : rate.toFixed(1);
  };

  const calculateCommissionEarned = (agent: Agent) => {
    // Commission is calculated based on successful placements
    // Assuming average placement value for commission calculation
    const avgPlacementValue = 2000000; // 2M UGX average
    const successfulPlacements = agent.successful_placements || 0;
    const commissionRate = agent.commission_rate || 0;
    return successfulPlacements * avgPlacementValue * commissionRate;
  };

  const getPerformanceBadge = (successRate: number) => {
    if (successRate >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (successRate >= 60) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (successRate >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    if (successRate > 0) return <Badge className="bg-orange-100 text-orange-800">Developing</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">New Agent</Badge>;
  };

  const getFilteredAndSortedAgents = () => {
    let filtered = agents.filter(agent => {
      // Search filter
      const matchesSearch = agent.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.agency_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.agency_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && agent.is_active) ||
        (statusFilter === 'inactive' && !agent.is_active);
      
      // Country filter
      const matchesCountry = countryFilter === 'all' || agent.agency_country === countryFilter;
      
      return matchesSearch && matchesStatus && matchesCountry;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (sortField === 'total_candidates' || sortField === 'successful_placements' || sortField === 'commission_rate') {
        aValue = parseFloat(aValue || 0);
        bValue = parseFloat(bValue || 0);
      } else if (sortField === 'success_rate') {
        aValue = parseFloat(calculateSuccessRate(a));
        bValue = parseFloat(calculateSuccessRate(b));
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const exportAgents = () => {
    const filteredAgents = getFilteredAndSortedAgents();
    const csvContent = [
      ['Agency Name', 'Agency ID', 'Email', 'Phone', 'Country', 'Status', 'Total Candidates', 'Successful Placements', 'Success Rate', 'Commission Rate', 'Total Earned'].join(','),
      ...filteredAgents.map(agent => [
        agent.agency_name,
        agent.agency_id,
        agent.email || '',
        agent.phone || '',
        agent.agency_country,
        agent.is_active ? 'Active' : 'Inactive',
        agent.total_candidates || 0,
        agent.successful_placements || 0,
        calculateSuccessRate(agent) + '%',
        ((agent.commission_rate || 0) * 100).toFixed(1) + '%',
        formatCurrency(calculateCommissionEarned(agent))
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agents-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Agents data exported successfully');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc' as 'asc' | 'desc');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading agents...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
              <Button onClick={fetchAgents} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredAgents = getFilteredAndSortedAgents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Agents Network</h1>
          <p className="text-muted-foreground mt-1">
            Manage recruitment agents and track their performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchAgents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => {
              setSelectedAgent(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      {/* Agent Performance Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-semibold">24</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3 this month
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Placements</p>
                <p className="text-2xl font-semibold">1,247</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  52 avg per agent
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Commission</p>
                <p className="text-2xl font-semibold">$234K</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <DollarSign className="h-3 w-3 mr-1" />
                  $9.8K avg per agent
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-semibold">78.4%</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Percent className="h-3 w-3 mr-1" />
                  Above industry avg
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Top Performing Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { agent: 'Ahmed Al-Rashid', country: 'UAE', placements: 89, commission: 23400, successRate: 92.1, candidates: 97 },
                { agent: 'Sarah Okonkwo', country: 'Nigeria', placements: 76, commission: 19800, successRate: 88.4, candidates: 86 },
                { agent: 'Raj Patel', country: 'India', placements: 68, commission: 17600, successRate: 85.7, candidates: 79 },
                { agent: 'Maria Santos', country: 'Philippines', placements: 62, commission: 16100, successRate: 91.2, candidates: 68 }
              ].map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{item.agent}</div>
                      <div className="text-sm text-muted-foreground">{item.country} • {item.candidates} candidates</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">${item.commission.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{item.placements} placements</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate: {item.successRate}%</span>
                    <span className="text-muted-foreground">#{index + 1} performer</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Structure Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Percentage Based', agents: 16, avgRate: '8.5%', totalEarned: 156000, color: 'bg-blue-500' },
                { type: 'Flat Rate', agents: 8, avgRate: '$2,400', totalEarned: 78000, color: 'bg-green-500' }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <div>
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-muted-foreground">{item.agents} agents</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.avgRate}</div>
                      <div className="text-sm text-muted-foreground">${item.totalEarned.toLocaleString()} earned</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { region: 'Middle East', agents: 8, placements: 456, commission: 89000, avgSuccess: 85.2 },
              { region: 'South Asia', agents: 6, placements: 389, commission: 67000, avgSuccess: 82.1 },
              { region: 'Southeast Asia', agents: 5, placements: 267, commission: 45000, avgSuccess: 78.9 },
              { region: 'Africa', agents: 5, placements: 135, commission: 33000, avgSuccess: 76.4 }
            ].map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-medium text-lg mb-2">{item.region}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agents:</span>
                    <span>{item.agents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placements:</span>
                    <span>{item.placements}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission:</span>
                    <span className="font-medium text-green-600">${item.commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-medium">{item.avgSuccess}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">Needs Attention</h4>
              {[
                { agent: 'John Mukasa', country: 'Uganda', issue: 'Low placement rate (45%)', action: 'Training needed' },
                { agent: 'Grace Akinyi', country: 'Kenya', issue: 'No placements this month', action: 'Follow-up required' },
                { agent: 'Peter Ssali', country: 'Uganda', issue: 'High candidate dropout', action: 'Process review' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                  <div>
                    <div className="font-medium text-sm">{item.agent}</div>
                    <div className="text-xs text-muted-foreground">{item.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-orange-600">{item.issue}</div>
                    <div className="text-xs text-muted-foreground">{item.action}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Excellence Awards</h4>
              {[
                { agent: 'Ahmed Al-Rashid', country: 'UAE', achievement: 'Highest success rate (92%)', reward: 'Bonus earned' },
                { agent: 'Sarah Okonkwo', country: 'Nigeria', achievement: 'Most placements (76)', reward: 'Recognition' },
                { agent: 'Raj Patel', country: 'India', achievement: 'Consistent performer', reward: 'Commission boost' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div>
                    <div className="font-medium text-sm">{item.agent}</div>
                    <div className="text-xs text-muted-foreground">{item.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-green-600">{item.achievement}</div>
                    <div className="text-xs text-muted-foreground">{item.reward}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-semibold">{agents.length}</p>
              </div>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-semibold">
                  {agents.filter(a => a.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Placements</p>
                <p className="text-2xl font-semibold">
                  {agents.reduce((sum, a) => sum + (a.successful_placements || 0), 0)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(agents.reduce((sum, a) => sum + calculateCommissionEarned(a), 0))}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, region, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportAgents}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="UG">Uganda</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="TZ">Tanzania</SelectItem>
                    <SelectItem value="RW">Rwanda</SelectItem>
                    <SelectItem value="ET">Ethiopia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setCountryFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            All Agents ({filteredAgents.length})
            <div className="text-sm font-normal text-muted-foreground">
              Showing {filteredAgents.length} of {agents.length} agents
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartTable
            data={filteredAgents}
            loading={loading}
            sortField={sortField}
            sortDirection={sortDirection as 'asc' | 'desc' | undefined}
            onSort={handleSort}
            onRowClick={(agent) => {
              setSelectedAgent(agent);
              setIsViewDialogOpen(true);
            }}
            columns={[
              {
                key: 'agency_name',
                header: 'Agent',
                sortable: true,
                render: (value, agent) => (
                  <div className="flex items-center space-x-3">
                    {agent?.photo_url ? (
                      <img 
                        src={agent.photo_url} 
                        alt={agent.agency_name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextSibling) {
                            nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                      style={{ display: agent?.photo_url ? 'none' : 'flex' }}
                    >
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{agent?.agency_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{agent?.agency_id || 'N/A'}</div>
                    </div>
                  </div>
                )
              },
              {
                key: 'contact',
                header: 'Contact',
                render: (value, agent) => (
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                      {agent?.email || 'No email'}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                      {agent?.phone || 'No phone'}
                    </div>
                  </div>
                )
              },
              {
                key: 'agency_country',
                header: 'Country',
                render: (value, agent) => (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">{agent.agency_country === 'UG' ? 'Uganda' : agent.agency_country}</span>
                  </div>
                )
              },
              {
                key: 'performance',
                header: 'Performance',
                render: (value, agent) => {
                  const successRate = calculateSuccessRate(agent);
                  return (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{successRate}% success</div>
                      {getPerformanceBadge(parseFloat(successRate))}
                    </div>
                  );
                }
              },
              {
                key: 'total_candidates',
                header: 'Candidates',
                sortable: true,
                render: (value, agent) => {
                  // Get candidates for this agent to calculate stage breakdown
                  const agentCandidates = candidates.filter(c => c.agent_id === agent.id);
                  const stageBreakdown = agentCandidates.reduce((acc, candidate) => {
                    const stage = candidate.stage || 'unknown';
                    acc[stage] = (acc[stage] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  // Calculate actual total from candidates array
                  const actualTotal = agentCandidates.length;
                  
                  // Define stage display order and colors
                  const stageOrder = ['passport', 'interview', 'medical', 'training', 'visa', 'deployment'];
                  const stageColors = {
                    passport: 'text-blue-600',
                    interview: 'text-purple-600', 
                    medical: 'text-yellow-600',
                    training: 'text-orange-600',
                    visa: 'text-indigo-600',
                    deployment: 'text-green-600'
                  };
                  
                  return (
                    <div className="text-sm space-y-1">
                      <div className="font-medium">{actualTotal} Total</div>
                      {stageOrder.map(stage => {
                        const count = stageBreakdown[stage] || 0;
                        if (count === 0) return null;
                        return (
                          <div key={stage} className={stageColors[stage] || 'text-gray-600'}>
                            {count} {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </div>
                        );
                      })}
                    </div>
                  );
                }
              },
              {
                key: 'commission_rate',
                header: 'Commission Rate',
                sortable: true,
                render: (value, agent) => (
                  <div className="text-center font-medium">
                    {((agent?.commission_rate || 0) * 100).toFixed(1)}%
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Status',
                render: (value, agent) => (
                  <Badge className={agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                sortable: false,
                render: (value, agent) => (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="View Agent Details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(agent);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title="View Bio Data"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgentForBio(agent);
                        setShowBioDataModal(true);
                      }}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Edit Agent"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(agent);
                        setShowForm(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 rounded-md"
                          title="Delete Agent"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {agent.agency_name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Agent Form Modal - Fullscreen */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-background">
            <AgentForm
              agent={selectedAgent || undefined}
              onSubmit={selectedAgent ? 
                (formData) => handleUpdateAgent(selectedAgent.id, formData) : 
                handleCreateAgent
              }
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

      {/* View Agent Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[85vh] overflow-y-auto">
          {selectedAgent && (
            <AgentDetails 
              agent={selectedAgent} 
              formatCurrency={formatCurrency}
              calculateSuccessRate={calculateSuccessRate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Agent Bio Data Modal */}
      {selectedAgentForBio && (
        <AgentBioDataModal
          agent={selectedAgentForBio}
          isOpen={showBioDataModal}
          onClose={() => {
            setShowBioDataModal(false);
            setSelectedAgentForBio(null);
          }}
        />
      )}
    </div>
  );
};

interface AgentFormProps {
  agent?: Agent;
  onSubmit: (formData: any) => Promise<void>;
  isEdit?: boolean;
  onCancel?: () => void;
}

const AgentForm = ({ agent, onSubmit, onCancel }: AgentFormProps) => {
  const [formData, setFormData] = useState({
    agency_name: agent?.agency_name || '',
    agency_id: agent?.agency_id || '',
    phone: agent?.phone || '',
    email: agent?.email || '',
    agency_country: agent?.agency_country || 'UG',
    commission_rate: agent?.commission_rate ? (agent.commission_rate * 100).toString() : '10',
    commission_type: agent?.commission_type || 'percentage',
    commission_value: agent?.commission_value?.toString() || '0',
    is_active: agent?.is_active !== undefined ? agent.is_active : true,
    photo_url: agent?.photo_url || '',
    total_candidates: agent?.total_candidates?.toString() || '0',
    successful_placements: agent?.successful_placements?.toString() || '0',
    notes: agent?.notes || ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(agent?.photo_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState<string | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const checkPhoneExists = async (phone: string) => {
    if (!phone || phone === agent?.phone) return;
    
    setCheckingPhone(true);
    try {
      const { data } = await supabase
        .from('agents')
        .select('id, agency_name')
        .eq('phone', phone)
        .single();
      
      if (data) {
        setPhoneWarning(`This phone number is already registered to ${data.agency_name}`);
      } else {
        setPhoneWarning(null);
      }
    } catch (error) {
      setPhoneWarning(null);
    } finally {
      setCheckingPhone(false);
    }
  };

  const checkEmailExistsComprehensive = async (email: string) => {
    if (!email || email === agent?.email) return;
    
    setCheckingEmail(true);
    try {
      const result = await checkEmailExists(email, agent?.id, 'agents');
      
      if (result.exists) {
        setEmailWarning(formatEmailError(result));
      } else {
        setEmailWarning(null);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailWarning(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setPhoneWarning(null);
    
    if (value.length > 3) {
      const timeoutId = setTimeout(() => {
        checkPhoneExists(value);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    setEmailWarning(null);
    
    if (isValidEmailFormat(value)) {
      const timeoutId = setTimeout(() => {
        checkEmailExistsComprehensive(value);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      setUploadingPhoto(true);
      
      // Storage bucket has RLS policies blocking uploads, use base64 storage
      console.log('Storage bucket has RLS restrictions, using base64 storage for reliability');
      return await storePhotoAsBase64(file);

    } catch (error) {
      console.error('Error uploading photo:', error);
      return await storePhotoAsBase64(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Fallback method to store photo as base64 data URL
  const storePhotoAsBase64 = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        console.log('Storing photo as base64 data URL');
        resolve(base64);
      };
      reader.onerror = () => {
        console.error('Error reading file for base64 conversion');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };
  const [validationErrors, setValidationErrors] = useState<any>({});
  const isEdit = !!agent;

  const validateForm = () => {
    const errors: any = {};
    
    if (!formData.agency_name?.trim()) {
      errors.agency_name = 'Agency name is required';
    }
    
    
    // Agency ID is now auto-generated, no validation needed
    
    if (!formData.email?.trim() && !formData.phone?.trim()) {
      errors.contact = 'Either email or phone is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    const commissionRate = parseFloat(formData.commission_rate);
    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      errors.commission_rate = 'Commission rate must be between 0 and 100';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let photoUrl = formData.photo_url;
      
      // Upload photo if a new file was selected (mandatory for new agents)
      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile);
        if (!uploadedUrl) {
          throw new Error('Photo upload failed. Please try again.');
        }
        photoUrl = uploadedUrl;
      } else if (!isEdit && !photoFile && !formData.photo_url) {
        throw new Error('Agent photo is required');
      }
      
      const agentData = {
        ...formData,
        photo_url: photoUrl,
        commission_rate: parseFloat(formData.commission_rate) / 100,
        commission_type: formData.commission_type,
        commission_value: parseFloat(formData.commission_value) || 0,
        total_candidates: parseInt(formData.total_candidates) || 0,
        successful_placements: parseInt(formData.successful_placements) || 0
      };
      
      await onSubmit(agentData);
      toast.success(isEdit ? 'Agent updated successfully!' : 'Agent created successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Phone number') && error.message.includes('already registered')) {
        toast.error(`This phone number is already registered to another agent. Please use a different phone number.`);
      } else if (error.message.includes('agency_name')) {
        toast.error('Agency name is required');
      } else {
        toast.error(`Failed to save agent: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev: any) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Agent' : 'Create New Agent'}</h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update agent information and performance metrics.' : 'Add a new recruitment agent to your network.'}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-2 gap-6 h-full">
            
            {/* Top Left - Basic Information */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="agency_name">Agency Name *</Label>
                  <Input
                    id="agency_name"
                    value={formData.agency_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, agency_name: e.target.value }))}
                    placeholder="Enter agency name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="agency_country">Country</Label>
                  <Select value={formData.agency_country} onValueChange={(value) => setFormData(prev => ({ ...prev, agency_country: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UG">Uganda</SelectItem>
                      <SelectItem value="KE">Kenya</SelectItem>
                      <SelectItem value="TZ">Tanzania</SelectItem>
                      <SelectItem value="RW">Rwanda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Photo Upload */}
                <div>
                  <Label htmlFor="photo">Agent Photo {!isEdit && <span className="text-red-500">*</span>}</Label>
                  <div className="space-y-2">
                    {photoPreview && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src={photoPreview} 
                          alt="Agent preview" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPhotoPreview(null);
                            setPhotoFile(null);
                            setFormData(prev => ({ ...prev, photo_url: '' }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('photo')?.click()}
                        disabled={uploadingPhoto}
                        className={validationErrors.photo ? 'border-red-500' : ''}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                      </Button>
                    </div>
                    {validationErrors.photo && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.photo}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active Agent</Label>
                </div>
              </div>
            </div>

            {/* Top Right - Contact Information */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter phone number"
                    className={phoneWarning ? 'border-red-500' : ''}
                  />
                  {checkingPhone && (
                    <p className="text-sm text-gray-500 mt-1">Checking phone number...</p>
                  )}
                  {phoneWarning && (
                    <p className="text-sm mt-1 flex items-center" style={{ color: '#ff2400' }}>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {phoneWarning}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter email address"
                    className={emailWarning ? 'border-red-500' : ''}
                  />
                  {checkingEmail && (
                    <p className="text-sm text-gray-500 mt-1">Checking email address...</p>
                  )}
                  {emailWarning && (
                    <p className="text-sm mt-1 flex items-center" style={{ color: '#ff2400' }}>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {emailWarning}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Left - Business Terms */}
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Business Terms</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="commission_type">Commission Type</Label>
                  <Select value={formData.commission_type} onValueChange={(value) => setFormData(prev => ({ ...prev, commission_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select commission type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="flat">Flat Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: e.target.value }))}
                    placeholder="10"
                  />
                </div>

                <div>
                  <Label htmlFor="commission_value">Commission Value</Label>
                  <Input
                    id="commission_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.commission_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_value: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Right - Performance Metrics */}
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Performance Metrics</h3>
              <div className="space-y-3">
                {isEdit ? (
                  <>
                    <div>
                      <Label>Total Candidates</Label>
                      <Input
                        value={formData.total_candidates}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label>Successful Placements</Label>
                      <Input
                        value={formData.successful_placements}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Performance metrics will be calculated automatically based on candidate placements.
                  </p>
                )}
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Agent' : 'Create Agent'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface AgentDetailsProps {
  agent: Agent;
  formatCurrency: (amount: number) => string;
  calculateSuccessRate: (agent: Agent) => string;
}

const AgentDetails = ({ agent, formatCurrency, calculateSuccessRate }: AgentDetailsProps) => {
  const successRate = parseFloat(calculateSuccessRate(agent));
  const commissionEarned = ((agent: Agent) => {
    const avgPlacementValue = 2000000;
    const successfulPlacements = agent.successful_placements || 0;
    const commissionRate = agent.commission_rate || 0;
    return successfulPlacements * avgPlacementValue * commissionRate;
  })(agent);

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (rate >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (rate >= 40) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (rate >= 20) return { label: 'Developing', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'New Agent', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const performanceBadge = getPerformanceBadge(successRate);

  return (
    <div className="w-full">
      {/* Header Section - Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{agent?.agency_name || 'Unknown Agency'}</h2>
              <p className="text-gray-600 font-mono text-xs bg-white px-2 py-1 rounded-full inline-block">
                ID: {agent?.agency_id || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`px-2 py-1 text-xs font-medium border ${performanceBadge.color}`}>
              {performanceBadge.label}
            </Badge>
            <Badge className={`px-2 py-1 text-xs font-medium ${agent.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
              {agent.is_active ? '🟢 Active' : '🔴 Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - Landscape Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Quick Stats */}
        <div className="col-span-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border">
              <div className="text-xl font-bold text-blue-600">{agent.total_candidates || 0}</div>
              <div className="text-xs text-gray-600">Total Candidates</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border">
              <div className="text-xl font-bold text-green-600">{agent.successful_placements || 0}</div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border">
              <div className="text-xl font-bold text-purple-600">{successRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border">
              <div className="text-lg font-bold text-orange-600">{formatCurrency(commissionEarned)}</div>
              <div className="text-xs text-gray-600">Total Earnings</div>
            </div>
          </div>

          {/* Contact Information */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-800">
                <Mail className="h-4 w-4 text-blue-600" />
                Contact & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3 w-3 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium text-gray-900 text-xs">{agent?.email || 'Not provided'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3 w-3 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900 text-xs">{agent?.phone || 'Not provided'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3 w-3 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Country</div>
                  <div className="font-medium text-gray-900 text-xs">{agent?.agency_country || 'Not specified'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Financial Details */}
        <div className="col-span-4">
          <Card className="shadow-sm border-0 bg-white h-full">
            <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-800">
                <DollarSign className="h-4 w-4 text-green-600" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                <div>
                  <div className="text-xs text-green-600 font-medium">Commission Rate</div>
                  <div className="text-lg font-bold text-green-700">{((agent?.commission_rate || 0) * 100).toFixed(1)}%</div>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                <div>
                  <div className="text-xs text-blue-600 font-medium">Total Earned</div>
                  <div className="text-lg font-bold text-blue-700">{formatCurrency(commissionEarned)}</div>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600">Average per placement</div>
                <div className="text-sm font-semibold text-gray-800">
                  {agent.successful_placements ? formatCurrency(commissionEarned / agent.successful_placements) : formatCurrency(0)}
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <p className="font-medium">{agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <p className="font-medium">{agent.updated_at ? new Date(agent.updated_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Performance Analytics */}
        <div className="col-span-4">
          <Card className="shadow-sm border-0 bg-white h-full">
            <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-800">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                {/* Candidate Pipeline */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-blue-600">{agent.total_candidates || 0}</div>
                  <div className="text-xs text-gray-600 mb-1">Total Candidates</div>
                  <div className="text-xs text-gray-500">
                    {(agent.total_candidates || 0) - (agent.successful_placements || 0)} in process
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-lg font-bold text-green-600">{agent.successful_placements || 0}</div>
                  <div className="text-xs text-gray-600 mb-1">Successful Placements</div>
                  <div className="text-xs text-gray-500">
                    {successRate.toFixed(1)}% success rate
                  </div>
                </div>

                {/* Earnings Summary */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-bold text-purple-600">{formatCurrency(commissionEarned)}</div>
                  <div className="text-xs text-gray-600 mb-1">Total Earnings</div>
                  <div className="text-xs text-gray-500">
                    {((agent?.commission_rate || 0) * 100).toFixed(1)}% commission
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentsModule;