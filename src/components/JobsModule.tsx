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
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Building,
  TrendingUp,
  BarChart3,
  Target,
  Globe,
  Activity
} from 'lucide-react';
import { InfoTooltip } from './ui/info-tooltip';
import { toast } from 'sonner';
import { apiClient } from '../utils/supabase/client';
import { InlineSelectCreate } from './ui/inline-select-create';
import JobFormFullscreen from './JobForm';
import JobOrderModal from './JobOrderModal';

// Type definitions
interface Job {
  id: string;
  position_name: string;
  receiving_company_id: string;
  receiving_company_name?: string;
  work_country: string;
  requested_headcount: number;
  salary?: number;
  salary_currency: string;
  input_fee?: number;
  input_fee_currency: string;
  markup_agency?: number;
  markup_company?: number;
  final_fee?: number;
  contract_period: number;
  probation_period: number;
  min_age: number;
  max_age: number;
  accommodation: boolean;
  food: boolean;
  air_ticket: boolean;
  transport: boolean;
  medical_insurance: boolean;
  employment_visa: boolean;
  working_hours: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface JobFilters {
  is_active?: boolean;
  work_country?: string;
  receiving_company_id?: string;
  position_name_search?: string;
  salary_min?: number;
  salary_max?: number;
  contract_period_min?: number;
  contract_period_max?: number;
  accommodation?: boolean;
  food?: boolean;
  air_ticket?: boolean;
  transport?: boolean;
  medical_insurance?: boolean;
  employment_visa?: boolean;
}

interface JobAnalytics {
  position_id: string;
  position_name: string;
  receiving_company_name: string;
  work_country: string;
  total_candidates: number;
  active_candidates: number;
  deployed_candidates: number;
  total_payments: number;
  average_payment: number;
  success_rate: number;
  avg_processing_days: number;
  last_activity: string;
}

interface Company {
  id: string;
  company_name: string;
  country: string;
}

const JobsModule = () => {
  // State management
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [analytics, setAnalytics] = useState<JobAnalytics[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobOrder, setShowJobOrder] = useState(false);
  const [selectedJobOrder, setSelectedJobOrder] = useState<Job | null>(null);
  const [filters, setFilters] = useState<JobFilters>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('jobs');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, []);

  // Fetch analytics when tab changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Fetch jobs with current filters
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getJobs(filters);
      setJobs(response.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const response = await apiClient.getEmployers();
      setCompanies(response.employers || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      toast.error('Failed to load companies');
    }
  };

  // Fetch job analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await apiClient.getJobAnalytics();
      setAnalytics(response.data || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load job analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Refresh analytics materialized view
  const refreshAnalytics = async () => {
    try {
      await apiClient.refreshJobAnalytics();
      await fetchAnalytics();
      toast.success('Analytics refreshed successfully');
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
      toast.error('Failed to refresh analytics');
    }
  };

  // Apply filters
  useEffect(() => {
    fetchJobs();
  }, [filters, searchTerm]);

  // Reset form
  const handleCreateJob = () => {
    setSelectedJob(null);
    setShowForm(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setShowForm(true);
  };

  const handleViewJobOrder = (job: Job) => {
    setSelectedJobOrder(job);
    setShowJobOrder(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await apiClient.deleteJob(id);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
      toast.error('Failed to delete job');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Jobs & Positions</h1>
          <p className="text-muted-foreground mt-1">Manage job positions and requirements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchJobs} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowJobForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Position Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Positions</p>
                  <InfoTooltip content="Number of job positions currently open for recruitment. These are positions actively seeking candidates and available for applications." />
                </div>
                <p className="text-2xl font-semibold">47</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8 this month
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Headcount</p>
                  <InfoTooltip content="Total number of workers needed across all active job positions. This represents the combined recruitment target for all open positions." />
                </div>
                <p className="text-2xl font-semibold">1,284</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  Across all positions
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-muted-foreground">Fill Rate</p>
                  <InfoTooltip content="Percentage of positions that have been successfully filled with candidates. Higher fill rates indicate effective recruitment and good job market conditions." />
                </div>
                <p className="text-2xl font-semibold">73.2%</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  940 filled
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-muted-foreground">Countries Active</p>
                  <InfoTooltip content="Number of countries where job positions are currently available. This shows the geographic diversity and international reach of recruitment operations." />
                </div>
                <p className="text-2xl font-semibold">12</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Globe className="h-3 w-3 mr-1" />
                  Global reach
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Performance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Position Performance Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { position: 'Construction Worker', company: 'Dubai Construction Ltd', country: 'UAE', headcount: 45, filled: 32, fillRate: 71.1, revenue: 96000 },
                { position: 'Domestic Helper', company: 'Saudi Family Services', country: 'Saudi Arabia', headcount: 28, filled: 24, fillRate: 85.7, revenue: 67200 },
                { position: 'Factory Worker', company: 'Qatar Industries', country: 'Qatar', headcount: 35, filled: 18, fillRate: 51.4, revenue: 54000 },
                { position: 'Security Guard', company: 'Kuwait Security Co', country: 'Kuwait', headcount: 22, filled: 19, fillRate: 86.4, revenue: 41800 }
              ].map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{item.position}</div>
                      <div className="text-sm text-muted-foreground">{item.company} • {item.country}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.fillRate}%</div>
                      <div className="text-sm text-muted-foreground">{item.filled}/{item.headcount} filled</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Revenue: ${item.revenue.toLocaleString()}</span>
                    <span className="text-muted-foreground">{item.headcount - item.filled} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Demand Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { company: 'Dubai Construction Ltd', country: 'UAE', positions: 8, headcount: 156, candidates: 89, success: 78.4, revenue: 234000 },
                { company: 'Saudi Family Services', country: 'Saudi Arabia', positions: 5, headcount: 89, candidates: 67, success: 85.1, revenue: 156700 },
                { company: 'Qatar Industries', country: 'Qatar', positions: 6, headcount: 124, candidates: 78, success: 62.9, revenue: 187200 },
                { company: 'Kuwait Security Co', country: 'Kuwait', positions: 4, headcount: 67, candidates: 45, success: 91.1, revenue: 98500 }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{item.company}</div>
                      <div className="text-sm text-muted-foreground">{item.country} • {item.positions} positions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{item.success}%</div>
                      <div className="text-sm text-muted-foreground">success rate</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span>{item.headcount} needed</span>
                    <span>{item.candidates} candidates</span>
                    <span>${item.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Market Penetration Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { country: 'UAE', companies: 12, positions: 89, headcount: 456, filled: 312, marketValue: 1234000, avgSalary: 2800, competition: 3.2 },
              { country: 'Saudi Arabia', companies: 8, positions: 67, headcount: 289, filled: 198, marketValue: 987000, avgSalary: 2400, competition: 2.8 },
              { country: 'Qatar', companies: 6, positions: 45, headcount: 234, filled: 156, marketValue: 756000, avgSalary: 3200, competition: 2.1 },
              { country: 'Kuwait', companies: 5, positions: 34, headcount: 178, filled: 134, marketValue: 567000, avgSalary: 2600, competition: 1.9 }
            ].map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-medium text-lg">{item.country}</div>
                <div className="space-y-2 mt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Companies:</span>
                    <span>{item.companies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positions:</span>
                    <span>{item.positions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fill Rate:</span>
                    <span className="font-medium">{Math.round((item.filled / item.headcount) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Value:</span>
                    <span className="font-medium text-green-600">${item.marketValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Salary:</span>
                    <span>${item.avgSalary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Competition:</span>
                    <span>{item.competition}:1</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Jobs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by position name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <Select 
                value={filters.is_active?.toString() || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  is_active: value === 'all' ? undefined : value === 'true' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Country</Label>
              <Input
                placeholder="Work country..."
                value={filters.work_country || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, work_country: e.target.value || undefined }))}
              />
            </div>

            <div>
              <Label>Company</Label>
              <Select 
                value={filters.receiving_company_id || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  receiving_company_id: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                Advanced Filters
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>
              
              {/* Salary Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Min Salary</Label>
                  <Input
                    type="number"
                    placeholder="Minimum salary..."
                    value={filters.salary_min || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      salary_min: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                  />
                </div>
                <div>
                  <Label>Max Salary</Label>
                  <Input
                    type="number"
                    placeholder="Maximum salary..."
                    value={filters.salary_max || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      salary_max: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                  />
                </div>
              </div>

              {/* Contract Period Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Min Contract Period (months)</Label>
                  <Input
                    type="number"
                    placeholder="Minimum contract period..."
                    value={filters.contract_period_min || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      contract_period_min: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>
                <div>
                  <Label>Max Contract Period (months)</Label>
                  <Input
                    type="number"
                    placeholder="Maximum contract period..."
                    value={filters.contract_period_max || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      contract_period_max: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>
              </div>

              {/* Benefits Filters */}
              <div>
                <Label className="text-base font-medium">Required Benefits</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {[
                    { key: 'accommodation', label: 'Accommodation' },
                    { key: 'food', label: 'Food' },
                    { key: 'air_ticket', label: 'Air Ticket' },
                    { key: 'transport', label: 'Transport' },
                    { key: 'medical_insurance', label: 'Medical Insurance' },
                    { key: 'employment_visa', label: 'Employment Visa' }
                  ].map(benefit => (
                    <div key={benefit.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={benefit.key}
                        checked={filters[benefit.key as keyof JobFilters] === true}
                        onCheckedChange={(checked) => setFilters(prev => ({ 
                          ...prev, 
                          [benefit.key]: checked ? true : undefined 
                        }))}
                      />
                      <Label htmlFor={benefit.key} className="text-sm">
                        {benefit.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="grid gap-4">
        {loading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading jobs...</div>
            </CardContent>
          </Card>
        )}

        {!loading && jobs.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                No jobs found. Create your first job to get started.
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && jobs.map(job => {
          // Calculate job age
          const calculateJobAge = (createdAt: string) => {
            const created = new Date(createdAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - created.getTime());
            
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays === 1) return '1 day ago';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 14) return '1 week ago';
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 60) return '1 month ago';
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
            return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
          };

          return (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{job.position_name}</h3>
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{job.receiving_company_name || 'Unknown Company'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{job.work_country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{job.requested_headcount} positions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{job.contract_period} months</span>
                      </div>
                    </div>

                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{job.salary} {job.salary_currency}</span>
                      </div>
                    )}

                    {/* Benefits */}
                    <div className="flex flex-wrap gap-2">
                      {job.accommodation && <Badge variant="outline">Accommodation</Badge>}
                      {job.food && <Badge variant="outline">Food</Badge>}
                      {job.air_ticket && <Badge variant="outline">Air Ticket</Badge>}
                      {job.transport && <Badge variant="outline">Transport</Badge>}
                      {job.medical_insurance && <Badge variant="outline">Medical Insurance</Badge>}
                      {job.employment_visa && <Badge variant="outline">Employment Visa</Badge>}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewJobOrder(job)}
                      title="View Job Order"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditJob(job)}
                      title="Edit Job"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      title="Delete Job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Job Age Footer */}
                <div className="mt-4 pt-3 border-t border-muted-foreground/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created {calculateJobAge(job.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Job Analytics Dashboard</h2>
              <p className="text-muted-foreground">Performance metrics and insights for job positions</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{jobs.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">{jobs.filter(j => j.is_active).length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                    <p className="text-2xl font-bold">
                      {analytics.reduce((sum, a) => sum + a.total_candidates, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics.length > 0 
                        ? Math.round(analytics.reduce((sum, a) => sum + a.success_rate, 0) / analytics.length)
                        : 0}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Job Performance Analytics</span>
                {analyticsLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="text-center py-8">Loading analytics...</div>
              ) : analytics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No analytics data available. Create some jobs and candidates to see insights.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Position</th>
                        <th className="text-left p-2">Company</th>
                        <th className="text-left p-2">Country</th>
                        <th className="text-right p-2">Candidates</th>
                        <th className="text-right p-2">Active</th>
                        <th className="text-right p-2">Deployed</th>
                        <th className="text-right p-2">Success Rate</th>
                        <th className="text-right p-2">Avg Payment</th>
                        <th className="text-right p-2">Processing Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map((item) => (
                        <tr key={item.position_id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{item.position_name}</td>
                          <td className="p-2">{item.receiving_company_name}</td>
                          <td className="p-2">{item.work_country}</td>
                          <td className="p-2 text-right">{item.total_candidates}</td>
                          <td className="p-2 text-right">{item.active_candidates}</td>
                          <td className="p-2 text-right">{item.deployed_candidates}</td>
                          <td className="p-2 text-right">
                            <Badge variant={item.success_rate >= 70 ? "default" : item.success_rate >= 40 ? "secondary" : "destructive"}>
                              {Math.round(item.success_rate)}%
                            </Badge>
                          </td>
                          <td className="p-2 text-right">
                            {item.average_payment > 0 ? `$${item.average_payment.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-2 text-right">{Math.round(item.avg_processing_days)} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Form Modal - Fullscreen */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background">
          <JobFormFullscreen 
            job={selectedJob}
            onClose={() => setShowForm(false)}
            onSave={fetchJobs}
            companies={companies}
          />
        </div>
      )}

      {/* Job Order Modal */}
      {showJobOrder && selectedJobOrder && (
        <JobOrderModal
          job={selectedJobOrder}
          isOpen={showJobOrder}
          onClose={() => {
            setShowJobOrder(false);
            setSelectedJobOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default JobsModule;
