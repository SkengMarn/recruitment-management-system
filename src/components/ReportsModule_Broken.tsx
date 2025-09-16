import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from './ui/table';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Clock, FileText, 
  Download, Play, Save, Trash2, RefreshCw, Award, Target, CheckCircle,
  ArrowUpDown, Database, Code, AlertCircle, BarChart3,
  Phone, Mail, User, Briefcase, CreditCard, PieChart, LineChart, Activity,
  ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown, ChevronLeft, 
  ChevronRight, MoreHorizontal, SlidersHorizontal, Grid3X3, Maximize2, Info
} from 'lucide-react';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { supabase, APIClient } from '../utils/supabase/client';

// Helper function to calculate average processing time
const calculateAverageProcessingTime = (candidates: any[]): string => {
  const deployedCandidates = candidates.filter(c => c.stage === 'deployed' && c.created_at);
  
  if (deployedCandidates.length === 0) return '0 days';
  
  const totalDays = deployedCandidates.reduce((sum, candidate) => {
    const createdDate = new Date(candidate.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return sum + daysDiff;
  }, 0);
  
  const avgDays = Math.round(totalDays / deployedCandidates.length);
  return `${avgDays} days`;
};

// Helper function to calculate trend percentage
const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to get data for specific month
const getMonthlyData = (data: any[], month: number, year: number) => {
  return data.filter(item => {
    const itemDate = new Date(item.created_at);
    return itemDate.getMonth() === month && itemDate.getFullYear() === year;
  });
};

// Helper function to calculate agent performance
const calculateAgentPerformance = (candidates: any[], agents: any[], financials: any[]) => {
  return agents.map(agent => {
    const agentCandidates = candidates.filter(c => c.agent_id === agent.id);
    const placements = agentCandidates.filter(c => c.stage === 'deployed').length;
    const successRate = agentCandidates.length > 0 ? (placements / agentCandidates.length) * 100 : 0;
    
    // Calculate earnings from financials
    const earnings = financials
      .filter(f => agentCandidates.some(c => c.id === f.candidate_id))
      .reduce((sum, f) => sum + (f.amount * (agent.commission_rate || 0.1)), 0);
    
    return {
      name: agent.agency_name || agent.name,
      placements,
      success_rate: Math.round(successRate),
      earnings: Math.round(earnings),
      candidates: agentCandidates.length
    };
  }).sort((a, b) => b.placements - a.placements);
};

// Calculate employer performance metrics
const calculateEmployerPerformance = (candidates: any[], payments: any[]) => {
  const employerStats = candidates.reduce((acc, candidate) => {
    const company = candidate.company || 'Unknown Company';
    if (!acc[company]) {
      acc[company] = {
        total_candidates: 0,
        deployed_candidates: 0,
        total_payments: 0,
        avg_time_to_fill: 0
      };
    }
    acc[company].total_candidates++;
    if (candidate.stage === 'deployed') {
      acc[company].deployed_candidates++;
      // Calculate time to fill
      const createdDate = new Date(candidate.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      acc[company].avg_time_to_fill += daysDiff;
    }
    return acc;
  }, {} as Record<string, {
    total_candidates: number;
    deployed_candidates: number;
    total_payments: number;
    avg_time_to_fill: number;
  }>);

  // Calculate payments per employer
  payments.forEach(payment => {
    const candidate = candidates.find(c => c.id === payment.candidate_id);
    const company = candidate?.company || 'Unknown Company';
    if (employerStats[company]) {
      employerStats[company].total_payments += payment.amount || 0;
    }
  });

  return Object.entries(employerStats).map(([company, stats]: [string, any]) => ({
    company,
    total_candidates: stats.total_candidates,
    deployed_candidates: stats.deployed_candidates,
    fill_rate: stats.total_candidates > 0 ? Math.round((stats.deployed_candidates / stats.total_candidates) * 100) : 0,
    avg_time_to_fill: stats.deployed_candidates > 0 ? Math.round(stats.avg_time_to_fill / stats.deployed_candidates) : 0,
    total_revenue: stats.total_payments
  }));
};

// Calculate financial analytics
const calculateFinancialAnalytics = (payments: any[]) => {
  const revenueByStage = payments.reduce((acc, payment) => {
    const stage = payment.stage || 'unknown';
    acc[stage] = (acc[stage] || 0) + (payment.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const currencyBreakdown = payments.reduce((acc, payment) => {
    const currency = payment.currency || 'USD';
    acc[currency] = (acc[currency] || 0) + (payment.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  return {
    revenue_by_stage: Object.entries(revenueByStage).map(([stage, amount]) => ({ stage, amount })),
    currency_breakdown: Object.entries(currencyBreakdown).map(([currency, amount]) => ({ currency, amount })),
    total_revenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  };
};

// Calculate operational efficiency metrics
const calculateOperationalEfficiency = (candidates: any[], documents: any[]) => {
  const totalCandidates = candidates.length;
  const candidatesWithinSLA = candidates.filter(c => {
    // Simplified SLA check - assume 30 days per stage is SLA
    const createdDate = new Date(c.created_at);
    const daysSinceCreated = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated <= 30;
  }).length;

  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(d => d.verified === true).length;

  return {
    sla_compliance: totalCandidates > 0 ? Math.round((candidatesWithinSLA / totalCandidates) * 100) : 0,
    document_verification_rate: totalDocuments > 0 ? Math.round((verifiedDocuments / totalDocuments) * 100) : 0,
    total_candidates: totalCandidates,
    candidates_within_sla: candidatesWithinSLA,
    total_documents: totalDocuments,
    verified_documents: verifiedDocuments
  };
};

const ReportsModule: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [chartView, setChartView] = useState('funnel'); // funnel, agents, stages

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from multiple sources to build reports
      const apiClient = new APIClient();
      const [candidatesResult, agentsResult, employersResult, paymentsResult] = await Promise.all([
        apiClient.getCandidates(),
        apiClient.getAgents(),
        apiClient.getEmployers(),
        apiClient.getFinancials()
      ]);
      
      // Calculate current and previous month data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Extract data from API responses
      const candidatesData = candidatesResult.candidates || [];
      const agentsData = agentsResult.agents || [];
      const employersData = employersResult.employers || [];
      const financialsData = paymentsResult.financials || [];

      // Current month data
      const currentMonthCandidates = candidatesData.filter(c => {
        const createdDate = new Date(c.created_at);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      });
      const currentMonthRevenue = financialsData.filter(f => {
        const paidDate = new Date(f.date);
        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
      }).reduce((sum, f) => sum + f.amount, 0);

      // Previous month data
      const previousMonthCandidates = candidatesData.filter(c => {
        const createdDate = new Date(c.created_at);
        return createdDate.getMonth() === previousMonth && createdDate.getFullYear() === previousYear;
      });
      const previousMonthRevenue = financialsData.filter(f => {
        const paidDate = new Date(f.date);
        return paidDate.getMonth() === previousMonth && paidDate.getFullYear() === previousYear;
      }).reduce((sum, f) => sum + f.amount, 0);

      // Calculate trends
      const totalCandidates = candidatesData.length;
      const totalPlacements = candidatesData.filter(c => c.stage === 'deployed').length;
      const totalRevenue = financialsData.reduce((sum, f) => sum + f.amount, 0);
      const currentMonthPlacements = currentMonthCandidates.filter(c => c.stage === 'deployed').length;
      const previousMonthPlacements = previousMonthCandidates.filter(c => c.stage === 'deployed').length;
      const monthlyPlacements = currentMonthPlacements;

      // Calculate conversion rates
      const currentConversionRate = currentMonthCandidates.length > 0 ? 
        (currentMonthCandidates.filter(c => c.stage === 'deployed').length / currentMonthCandidates.length) * 100 : 0;
      const previousConversionRate = previousMonthCandidates.length > 0 ? 
        (previousMonthCandidates.filter(c => c.stage === 'deployed').length / previousMonthCandidates.length) * 100 : 0;

      // Calculate revenue trends
      const revenueTrend = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;
      const conversionTrend = calculateTrend(currentConversionRate, previousConversionRate);
      const placementsTrend = calculateTrend(currentMonthPlacements, previousMonthPlacements);
      
      // Calculate stage distribution
      const stageData = ['passport', 'interview', 'medical', 'training', 'visa', 'deployed'].reduce((acc, stage) => {
        acc[stage] = candidatesData.filter(c => c.stage === stage).length || 0;
        return acc;
      }, {} as Record<string, number>);

      // Calculate real agent performance data
      const agentPerformance = calculateAgentPerformance(candidatesData, agentsData, financialsData);
      
      // Calculate employer performance
      const employerPerformance = calculateEmployerPerformance(candidatesData, financialsData);
      
      // Calculate financial analytics
      const financialAnalytics = calculateFinancialAnalytics(financialsData);
      
      // Calculate operational efficiency
      const operationalEfficiency = calculateOperationalEfficiency(candidatesData, []);

      // Calculate recruitment pipeline data
      const deployedCandidates = candidatesData.filter(c => c.stage === 'deployed').length;
      const pipelineData = [
        { name: 'Passport', count: candidatesData.filter(c => c.stage === 'passport').length, percentage: 15 },
        { name: 'Interview', count: candidatesData.filter(c => c.stage === 'interview').length, percentage: 20 },
        { name: 'Medical', count: candidatesData.filter(c => c.stage === 'medical').length, percentage: 25 },
        { name: 'Training', count: candidatesData.filter(c => c.stage === 'training').length, percentage: 20 },
        { name: 'Visa', count: candidatesData.filter(c => c.stage === 'visa').length, percentage: 15 },
        { name: 'Deployed', count: deployedCandidates, percentage: 5 }
      ];

      // Calculate average processing time
      const avgProcessingTime = calculateAverageProcessingTime(candidatesData);
      const pendingCandidates = candidatesData.filter(c => !['deployed', 'rejected', 'cancelled'].includes(c.stage)).length;

      const reportsData = {
        recruitment_pipeline: pipelineData,
        agent_performance: agentPerformance,
        employer_performance: employerPerformance,
        financial_analytics: financialAnalytics,
        operational_efficiency: operationalEfficiency,
        monthly_placements: monthlyPlacements,
        total_revenue: totalRevenue,
        conversion_rate: currentConversionRate,
        revenue_trend: revenueTrend,
        avg_processing_time: avgProcessingTime,
        pending_candidates: pendingCandidates,
        saved_reports: []
      };
      
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportReport = (reportType) => {
    // In a real app, this would generate and download the actual report
    const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log(`Exporting ${reportType} report as ${filename}`);
    // Simulate download
    alert(`${reportType} report would be downloaded as ${filename}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading reports...</span>
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
              <Button onClick={fetchReports} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Reports & Analytics</CardTitle>
              <CardDescription className="mt-1">
                Comprehensive business intelligence and performance reports
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="px-3 py-2 border border-input rounded-md text-sm bg-background"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchReports}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Placements</p>
                <p className="text-2xl font-semibold">{reports?.monthly_placements || 0}</p>
                <p className={`text-sm flex items-center mt-1 ${reports?.trends?.placements?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {reports?.trends?.placements?.isPositive ? '+' : '-'}{reports?.trends?.placements?.percentage?.toFixed(1) || 0}% from last month
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold">{formatCurrency(reports?.total_revenue || 0)}</p>
                <p className={`text-sm flex items-center mt-1 ${reports?.trends?.revenue?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {reports?.trends?.revenue?.isPositive ? '+' : '-'}{reports?.trends?.revenue?.percentage?.toFixed(1) || 0}% from last month
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-semibold">{reports?.pipeline_health?.conversion_rate || 0}%</p>
                <p className={`text-sm flex items-center mt-1 ${reports?.trends?.conversion?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {reports?.trends?.conversion?.isPositive ? '+' : '-'}{reports?.trends?.conversion?.percentage?.toFixed(1) || 0}% from last month
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Processing</p>
                <p className="text-2xl font-semibold">{reports?.pipeline_health?.average_processing_time || 'N/A'}</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3 days improved
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Performance Overview
                  <Button variant="outline" size="sm" onClick={() => exportReport('performance')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>
                  Key performance indicators and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">Monthly Placements</div>
                      <div className="text-2xl font-bold text-blue-600">{reports?.monthly_placements || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">This Month</div>
                      <div className="text-sm text-blue-600">Actual Data</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">Success Rate</div>
                      <div className="text-2xl font-bold text-green-600">{reports?.pipeline_health?.conversion_rate || 0}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      <div className="text-sm text-green-600">Deployed/Total</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">Pending Candidates</div>
                      <div className="text-2xl font-bold text-orange-600">{reports?.pipeline_health?.pending_candidates || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">In Pipeline</div>
                      <div className="text-sm text-orange-600">Active Cases</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recruitment Pipeline Funnel</CardTitle>
                <CardDescription>
                  Candidate progression through recruitment stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { stage: 'Passport', count: reports?.stage_data?.passport || 0, fill: '#6b7280' },
                      { stage: 'Interview', count: reports?.stage_data?.interview || 0, fill: '#eab308' },
                      { stage: 'Medical', count: reports?.stage_data?.medical || 0, fill: '#f97316' },
                      { stage: 'Training', count: reports?.stage_data?.training || 0, fill: '#a855f7' },
                      { stage: 'Visa', count: reports?.stage_data?.visa || 0, fill: '#3b82f6' },
                      { stage: 'Deployed', count: reports?.stage_data?.deployed || 0, fill: '#10b981' }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Leaderboard</CardTitle>
                <CardDescription>
                  Top performing agents by placement success rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reports?.agent_performance?.slice(0, 5).map((agent, index) => ({
                        name: agent.name,
                        value: agent.placements,
                        fill: index === 0 ? '#eab308' : 
                              index === 1 ? '#6b7280' : 
                              index === 2 ? '#f97316' : 
                              index === 3 ? '#3b82f6' : '#10b981'
                      })) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employer Performance KPI Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Employer Performance Overview</CardTitle>
                <CardDescription>Key metrics by company</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports?.employer_performance?.slice(0, 3).map((employer, index) => (
                    <div key={employer.company} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{employer.company}</div>
                        <div className="text-sm text-muted-foreground">
                          {employer.deployed_candidates}/{employer.total_candidates} candidates • {employer.fill_rate}% fill rate
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(employer.total_revenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">{employer.avg_time_to_fill} days avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Employer Fill Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fill Rate by Employer</CardTitle>
                <CardDescription>Deployment success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reports?.employer_performance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="company" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="fill_rate" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Agent Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Leaderboard</CardTitle>
                <CardDescription>Detailed agent metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports?.agent_performance?.map((agent, index) => (
                    <div key={agent.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {agent.placements} placements • {agent.total_candidates} total
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(agent.earnings)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((agent.placements / Math.max(agent.total_candidates, 1)) * 100)}% success
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agent Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Commission Earnings</CardTitle>
                <CardDescription>Revenue per agent</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reports?.agent_performance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SLA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>SLA Compliance</CardTitle>
                <CardDescription>Stage processing time compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">Overall SLA Compliance</div>
                      <div className="text-2xl font-bold text-green-600">
                        {reports?.operational_efficiency?.sla_compliance || 0}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {reports?.operational_efficiency?.candidates_within_sla || 0} / {reports?.operational_efficiency?.total_candidates || 0}
                      </div>
                      <div className="text-sm text-green-600">Within 30 days</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">Document Verification Rate</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {reports?.operational_efficiency?.document_verification_rate || 0}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {reports?.operational_efficiency?.verified_documents || 0} / {reports?.operational_efficiency?.total_documents || 0}
                      </div>
                      <div className="text-sm text-blue-600">Verified</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational Efficiency Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Metrics</CardTitle>
                <CardDescription>Key efficiency indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Within SLA', value: reports?.operational_efficiency?.candidates_within_sla || 0, fill: '#10b981' },
                        { name: 'Outside SLA', value: (reports?.operational_efficiency?.total_candidates || 0) - (reports?.operational_efficiency?.candidates_within_sla || 0), fill: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Stage */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Stage</CardTitle>
                <CardDescription>Payment distribution across recruitment stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reports?.financial_analytics?.revenue_by_stage || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Currency Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Currency Breakdown</CardTitle>
                <CardDescription>Revenue split by currency</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reports?.financial_analytics?.currency_breakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ currency, amount, percent }) => `${currency}: ${formatCurrency(amount)} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {reports?.financial_analytics?.currency_breakdown?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#f59e0b'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Commission Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Commission Tracking
                  <Button variant="outline" size="sm" onClick={() => exportReport('financial')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>
                  Financial performance breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <div className="font-medium text-green-900">Total Revenue</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(reports?.total_revenue || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-700">This Month</div>
                      <div className="text-sm text-green-600">+8.2% growth</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Service Fees</span>
                      <span className="font-medium">{formatCurrency(1200000)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Employer Fees</span>
                      <span className="font-medium">{formatCurrency(reports?.total_revenue * 0.75 || 0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Commission Paid</span>
                      <span className="font-medium text-red-600">-{formatCurrency(reports?.total_revenue * 0.1 || 0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '10%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Revenue trend charts</p>
                    <p className="text-sm text-muted-foreground">Interactive financial visualizations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Agent Performance Report
                <Button variant="outline" size="sm" onClick={() => exportReport('agents')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>
                Individual agent performance metrics and rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.agent_performance?.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Medical</span>
                        <span>25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Training</span>
                        <span>15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '15%'}}></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {formatCurrency(agent.earnings)}
                        </div>
                        <div className="text-sm text-muted-foreground">earned</div>
                      </div>
                      <div className="w-24">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.min((agent.placements / 10) * 100, 100)}%`}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No agent performance data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pipeline Health Report
                  <Button variant="outline" size="sm" onClick={() => exportReport('pipeline')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>
                  Recruitment pipeline status and bottlenecks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">Conversion Rate</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {reports?.pipeline_health?.conversion_rate || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${parseFloat(reports?.pipeline_health?.conversion_rate || 0)}%`}}></div>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Above industry benchmark of 65%
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-orange-900">Avg. Processing Time</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {reports?.pipeline_health?.average_processing_time || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-orange-700">
                      3 days faster than last month
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-900">Pending Candidates</span>
                      <span className="text-2xl font-bold text-green-600">
                        {reports?.pipeline_health?.pending_candidates || 0}
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Ready for next stage processing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Process Bottlenecks</CardTitle>
                <CardDescription>
                  Identify and resolve pipeline constraints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900">Medical Examinations</span>
                    </div>
                    <span className="text-red-600 font-medium">18 pending</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Visa Processing</span>
                    </div>
                    <span className="text-yellow-600 font-medium">12 pending</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Training Programs</span>
                    </div>
                    <span className="text-green-600 font-medium">On track</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sql" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Custom SQL Reports</span>
                </CardTitle>
                <CardDescription>
                  Execute custom SQL queries against your recruitment database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SQL Query</label>
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="SELECT * FROM candidates WHERE stage = 'deployed' LIMIT 10;"
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button onClick={executeQuery} disabled={loading || !sqlQuery.trim()}>
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Executing...' : 'Execute Query'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSqlQuery('');
                      setQueryResults(null);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 font-medium">Query Error</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">Database Connection</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    Queries execute against your live Supabase database. Basic SQL operations (SELECT, WHERE, GROUP BY, ORDER BY) are supported.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ReportsModule: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: string | null, direction: string}>({ key: null, direction: 'asc' });
  
  // Enhanced Table Features
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [columnFilters, setColumnFilters] = useState<any>({});
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [isTableMaximized, setIsTableMaximized] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const executeQuery = async () => {
    try {
      setLoading(true);
      setError(null);
      const startTime = Date.now();
      
      const apiClient = new APIClient();
      const result = await apiClient.executeSQLQuery(sqlQuery);
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setQueryResults(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
      setQueryResults([]);
    } finally {
      setLoading(false);
    }
  };
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const sampleQueries = [
    {
      name: 'All Candidates by Stage',
      query: `SELECT 
  stage,
  COUNT(*) as count
FROM public.candidates 
GROUP BY stage 
ORDER BY count DESC;`
    },
    {
      name: 'Active Agents Overview',
      query: `SELECT 
  agency_name,
  agency_country,
  commission_rate
FROM public.agents 
WHERE is_active = true
ORDER BY commission_rate DESC;`
    },
    {
      name: 'Receiving Companies by Country',
      query: `SELECT 
  country,
  COUNT(*) as company_count
FROM public.receiving_companies 
WHERE is_active = true
GROUP BY country 
ORDER BY company_count DESC;`
    },
    {
      name: 'Recent Payments Summary',
      query: `SELECT 
  stage,
  COUNT(*) as payment_count,
  SUM(amount) as total_amount
FROM public.payments 
GROUP BY stage 
ORDER BY total_amount DESC;`
    },
    {
      name: 'Available Positions',
      query: `SELECT 
  position_name,
  work_country,
  salary,
  requested_headcount
FROM public.positions 
WHERE is_active = true
ORDER BY salary DESC;`
    },
    {
      name: 'Leads by Status',
      query: `SELECT 
  status,
  COUNT(*) as lead_count,
  interested_country
FROM public.leads 
GROUP BY status, interested_country
ORDER BY lead_count DESC;`
    }
  ];

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQueryResults(null);
      
      // Reset table state
      setCurrentPage(1);
      setColumnFilters({});
      setHiddenColumns(new Set());
      setSortConfig({ key: null, direction: 'asc' });
      setIsTableMaximized(false);
      setShowColumnSettings(false);
      
      await executeQuery();
    } catch (err) {
      console.error('SQL query execution failed:', err);
      setError(err.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  // ...
};
  const loadSampleQuery = (query) => {
    setSqlQuery(query);
    setQueryResults(null);
    setError(null);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const getSortedResults = () => {
    if (!queryResults) return [];

    let filteredData = [...queryResults];

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue && typeof filterValue === 'string' && filterValue.trim()) {
        filteredData = filteredData.filter(row => {
          const cellValue = String(row[column] || '').toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Convert to numbers if both values are numeric
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filteredData;
  };

  const getDataType = (column, data) => {
    if (!data || data.length === 0) return 'text';
    
    const columnLower = column.toLowerCase();
    
    // ID, phone, and timestamp fields should be treated as text to preserve raw values
    if (columnLower.includes('id') || 
        columnLower.includes('phone') || 
        columnLower.includes('created') || 
        columnLower.includes('updated')) {
      return 'text';
    }
    
    const sampleValues = data.slice(0, 10).map(row => row[column]).filter(val => val !== null && val !== undefined);
    
    if (sampleValues.length === 0) return 'text';
    
    // Check if most values are numbers
    const numericValues = sampleValues.filter(val => !isNaN(parseFloat(val)));
    if (numericValues.length / sampleValues.length > 0.7) return 'number';
    
    // Check if most values are dates
    const dateValues = sampleValues.filter(val => !isNaN(Date.parse(val)));
    if (dateValues.length / sampleValues.length > 0.7) return 'date';
    
    return 'text';
  };

  const getColumnAlignment = (column, data) => {
    const dataType = getDataType(column, data);
    switch (dataType) {
      case 'number': return 'text-right';
      case 'date': return 'text-center';
      default: return 'text-left';
    }
  };

  const formatCellValue = (value, column, data) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">NULL</span>;
    }

    const stringValue = String(value);
    const columnLower = column.toLowerCase();
    
    // Don't format ID, phone, and created_at fields - show raw database values
    if (columnLower.includes('id') || 
        columnLower.includes('phone') || 
        columnLower.includes('created') || 
        columnLower.includes('updated')) {
      return stringValue;
    }

    const dataType = getDataType(column, data);

    // Conditional formatting for numbers (excluding ID fields)
    if (dataType === 'number') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const isNegative = numValue < 0;
        const isZero = numValue === 0;
        
        return (
          <span className={`font-mono ${
            isNegative ? 'text-red-600 dark:text-red-400' : 
            isZero ? 'text-muted-foreground' : 
            'text-foreground'
          }`}>
            {numValue.toLocaleString()}
          </span>
        );
      }
    }

    // Conditional formatting for common patterns
    if (stringValue.toLowerCase().includes('error') || stringValue.toLowerCase().includes('failed')) {
      return <span className="text-red-600 dark:text-red-400">{stringValue}</span>;
    }
    
    if (stringValue.toLowerCase().includes('success') || stringValue.toLowerCase().includes('completed')) {
      return <span className="text-green-600 dark:text-green-400">{stringValue}</span>;
    }
    
    if (stringValue.toLowerCase().includes('pending') || stringValue.toLowerCase().includes('waiting')) {
      return <span className="text-orange-600 dark:text-orange-400">{stringValue}</span>;
    }

    return stringValue;
  };

  const generateFilenameFromQuery = (query) => {
    if (!query || !query.trim()) return 'sql_query_results';
    
    const cleanQuery = query.toLowerCase().trim();
    
    // Extract table names from FROM clauses
    const fromMatches = cleanQuery.match(/from\s+(?:public\.)?(\w+)/g);
    const tables = fromMatches ? fromMatches.map(match => 
      match.replace(/from\s+(?:public\.)?/, '')
    ) : [];
    
    // Extract main operation (SELECT, INSERT, UPDATE, DELETE)
    let operation = 'query';
    if (cleanQuery.startsWith('select')) operation = 'select';
    else if (cleanQuery.startsWith('insert')) operation = 'insert';
    else if (cleanQuery.startsWith('update')) operation = 'update';
    else if (cleanQuery.startsWith('delete')) operation = 'delete';
    
    // Check for common aggregations
    let aggregation = '';
    if (cleanQuery.includes('count(')) aggregation = '_count';
    else if (cleanQuery.includes('sum(')) aggregation = '_sum';
    else if (cleanQuery.includes('avg(')) aggregation = '_avg';
    else if (cleanQuery.includes('group by')) aggregation = '_grouped';
    
    // Check for filtering
    let filter = '';
    if (cleanQuery.includes('where')) filter = '_filtered';
    
    // Build filename
    let filename = operation;
    
    if (tables.length > 0) {
      // Limit to first 2 tables to keep filename reasonable
      const tableNames = tables.slice(0, 2).join('_');
      filename += `_${tableNames}`;
    }
    
    filename += aggregation + filter;
    
    // Clean up filename - remove special characters and limit length
    filename = filename
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50); // Limit length
    
    return filename;
  };

  const exportToCSV = () => {
    const data = getSortedResults();
    if (!data || data.length === 0) return;

    const visibleColumns = Object.keys(data[0]).filter(col => !hiddenColumns.has(col));
    
    // Create CSV content
    const headers = visibleColumns.join(',');
    const rows = data.map(row => 
      visibleColumns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Generate smart filename based on query
    const baseFilename = generateFilenameFromQuery(sqlQuery);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${baseFilename}_${timestamp}.csv`;
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumnVisibility = (column) => {
    const newHiddenColumns = new Set(hiddenColumns);
    if (newHiddenColumns.has(column)) {
      newHiddenColumns.delete(column);
    } else {
      newHiddenColumns.add(column);
    }
    setHiddenColumns(newHiddenColumns);
  };

  const renderResults = () => {
    if (!queryResults) return null;

    if (queryResults.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Query executed successfully but returned no results.</p>
          </CardContent>
        </Card>
      );
    }

    const allColumns = Object.keys(queryResults[0]);
    const visibleColumns = allColumns.filter(col => !hiddenColumns.has(col));
    const sortedResults = getSortedResults();
    
    // Pagination
    const totalRows = sortedResults.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const paginatedResults = sortedResults.slice(startIndex, endIndex);

    return (
      <Card className={`transition-all duration-300 ${isTableMaximized ? 'fixed inset-4 z-50 max-h-[calc(100vh-2rem)]' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Query Results ({totalRows} rows)</span>
              {executionTime && (
                <Badge variant="secondary" className="text-xs">
                  {executionTime}ms
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* Column Settings */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="flex items-center space-x-1"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
              
              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
              
              {/* Maximize/Minimize */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTableMaximized(!isTableMaximized)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Column Settings Panel */}
          {showColumnSettings && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Column Visibility</h4>
                <Badge variant="outline">{visibleColumns.length}/{allColumns.length} visible</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allColumns.map(column => (
                  <div key={column} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.has(column)}
                      onChange={() => toggleColumnVisibility(column)}
                      className="rounded border-input"
                    />
                    <span className="text-sm truncate" title={column}>
                      {column.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className={`${isTableMaximized ? 'flex-1 overflow-hidden' : ''}`}>
          {/* Table Container */}
          <div className={`border rounded-lg ${isTableMaximized ? 'h-full flex flex-col' : ''}`}>
            <div className={`overflow-auto ${isTableMaximized ? 'flex-1' : 'max-h-[600px]'}`}>
              <div className="relative">
                <Table className="border-separate border-spacing-0">
                  {/* Sticky Header */}
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="border-b-2">
                      {visibleColumns.map((column, colIndex) => (
                        <TableHead 
                          key={column}
                          className={`
                            font-bold bg-muted/50 border-r border-border last:border-r-0
                            cursor-pointer select-none hover:bg-muted transition-colors
                            px-4 py-3 ${getColumnAlignment(column, queryResults)}
                            ${hoveredColumn === column ? 'bg-muted' : ''}
                          `}
                          onClick={() => handleSort(column)}
                          onMouseEnter={() => setHoveredColumn(column)}
                          onMouseLeave={() => setHoveredColumn(null)}
                        >
                          <div className="flex items-center justify-between min-w-0">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="font-bold truncate" title={column}>
                                {column.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <div className="text-xs text-muted-foreground">
                                {getDataType(column, queryResults)}
                              </div>
                            </div>
                            <div className="ml-2 flex items-center space-x-1">
                              {/* Filter Input */}
                              {getDataType(column, queryResults) === 'text' && (
                                <input
                                  type="text"
                                  placeholder="Filter..."
                                  value={columnFilters[column] || ''}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setColumnFilters(prev => ({
                                      ...prev,
                                      [column]: e.target.value
                                    }));
                                    setCurrentPage(1);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-20 px-1 py-0.5 text-xs border rounded"
                                />
                              )}
                              {/* Sort Icon */}
                              <div className="flex flex-col">
                                {sortConfig.key === column ? (
                                  sortConfig.direction === 'asc' ? (
                                    <ChevronUp className="h-4 w-4 text-primary" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-primary" />
                                  )
                                ) : (
                                  <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  
                  {/* Table Body */}
                  <TableBody>
                    {paginatedResults.map((row, rowIndex) => (
                      <TableRow 
                        key={startIndex + rowIndex}
                        className={`
                          border-b hover:bg-muted/30 transition-colors group
                          ${hoveredRow === rowIndex ? 'bg-muted/50' : ''}
                          ${rowIndex % 2 === 0 ? 'bg-muted/20' : 'bg-background'}
                        `}
                        onMouseEnter={() => setHoveredRow(rowIndex)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        {visibleColumns.map((column, colIndex) => (
                          <TableCell 
                            key={column}
                            className={`
                              border-r border-border last:border-r-0 px-4 py-3
                              ${getColumnAlignment(column, queryResults)}
                              ${hoveredColumn === column ? 'bg-muted/20' : ''}
                              transition-colors duration-150
                            `}
                            onMouseEnter={() => setHoveredColumn(column)}
                            onMouseLeave={() => setHoveredColumn(null)}
                          >
                            <div className="relative group/cell">
                              {formatCellValue(row[column], column, queryResults)}
                              {/* Tooltip for long content */}
                              {String(row[column] || '').length > 50 && (
                                <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200 z-20 max-w-xs break-words pointer-events-none">
                                  {String(row[column])}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{endIndex} of {totalRows} rows
                  </span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 text-sm border rounded bg-background"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Custom SQL Query Runner
          </CardTitle>
          <CardDescription>
            Execute custom SQL queries against the system database for advanced reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Queries */}
          <div>
            <h4 className="font-medium mb-3">Sample Queries</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleQueries.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleQuery(sample.query)}
                  className="justify-start h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium">{sample.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {sample.query.split('\n')[0]}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* SQL Query Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">SQL Query</label>
            <Textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Enter your SQL query here... (e.g., SELECT * FROM candidates WHERE status = 'deployed')"
              className="min-h-32 font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              <strong>Available tables:</strong> agents, alerts, audit_logs, candidates, documents, leads, payments, positions, profiles, receiving_companies, stage_configs, stage_history, system_settings
            </div>
          </div>

          {/* Execute Button */}
          <div className="flex items-center space-x-2">
            <Button onClick={executeQuery} disabled={loading || !sqlQuery.trim()}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Executing...' : 'Execute Query'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSqlQuery('');
                setQueryResults(null);
                setError(null);
              }}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600 font-medium">Query Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Database Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Database Connection</span>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              Queries execute against your live Supabase database. Basic SQL operations (SELECT, WHERE, GROUP BY, ORDER BY) are supported. For advanced features, run the SQL setup script.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </TabsContent>
</Tabs>
  );
};

export default ReportsModule;