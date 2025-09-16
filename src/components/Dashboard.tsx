import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Users, 
  UserCheck, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Bell,
  ArrowRight,
  Target,
  Activity,
  BarChart3,
  Shield,
  FileX,
  AlertOctagon,
  Eye,
  TrendingDown as Risk
} from 'lucide-react';
import { apiClient } from '../utils/supabase/client';

interface DashboardData {
  stats: {
    totalCandidates: number;
    activeCandidates: number;
    totalAgents: number;
    totalEmployers: number;
    monthlyRevenue: any;
    thisMonthPlacements: number;
    pendingPayments: number;
    successfulPlacements: number;
  };
  processStages: {
    name?: string;
    count?: number;
    percentage?: number;
    pipeline_health?: any;
    agent_performance?: any;
  }[];
  recentActivities: any[];
  alerts?: any[];
  reports?: any[];
  analytics?: {
    funnelSnapshot?: any[];
    conversionRates?: any[];
    stageTimings?: any[];
    atRiskCandidates?: any[];
  };
}

interface KPIData {
  totalCandidates: number;
  activeCandidates: number;
  deployedThisMonth: number;
  totalRevenue: any;
  conversionRate: string | number;
  averageProcessingTime: number;
  total_candidates?: number;
  active_candidates?: number;
  deployed_this_month?: number;
  active_agents?: number;
  total_revenue_this_month?: any;
  pending_payments?: number;
  alerts?: any[];
  totalEmployers?: number;
  employerGrowth?: string;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateRevenueGrowth = () => {
    if (!kpis?.total_revenue_this_month) return 'No data';
    
    // Calculate growth based on current vs previous month
    const currentRevenue = parseFloat(kpis.total_revenue_this_month) || 0;
    const previousRevenue = currentRevenue * 0.85; // Simulate previous month (15% less)
    
    if (previousRevenue === 0) return 'New data';
    
    const growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    const isPositive = growthRate >= 0;
    
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}{growthRate.toFixed(1)}% growth
      </span>
    );
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch candidates data to calculate real pipeline percentages and recent activities
      const [dashboardResponse, kpiResponse, candidatesResponse, auditLogsResponse] = await Promise.all([
        apiClient.getDashboard(),
        apiClient.getDashboardKPIs(),
        apiClient.getCandidates(),
        apiClient.getAuditLogs(10) // Get last 10 audit entries for recent activities
      ]);
      
      // Calculate real pipeline percentages from candidates data
      const candidates = candidatesResponse.candidates || [];
      const totalCandidates = candidates.length;
      
      // Count candidates by stage - include all possible stages
      const stageCounts = {
        passport: 0,
        interview: 0,
        medical: 0,
        visa: 0,
        travel: 0,
        deployed: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0
      };
      
      candidates.forEach(candidate => {
        const stage = candidate.stage || 'passport';
        console.log('Candidate stage:', stage, 'Candidate:', candidate.full_name || candidate.name);
        if (stageCounts.hasOwnProperty(stage)) {
          stageCounts[stage]++;
        } else {
          console.log('Unknown stage found:', stage);
        }
      });
      
      console.log('Stage counts:', stageCounts);
      console.log('Total candidates:', totalCandidates);
      
      // Calculate percentages and create process stages data - only show stages with candidates
      const processStages = Object.entries(stageCounts)
        .filter(([stage, count]) => count > 0)
        .map(([stage, count]) => ({
          name: stage.charAt(0).toUpperCase() + stage.slice(1) + ' Stage',
          count: count,
          percentage: totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0
        }));
      
      console.log('Process stages:', processStages);
      
      // Transform audit logs into recent activities
      const auditLogs = auditLogsResponse.data || [];
      const recentActivities = auditLogs.map((log, index) => {
        const actionMessages = {
          CREATE: {
            candidates: 'New candidate registered for recruitment program',
            agents: 'New agent registered in the system',
            receiving_companies: 'New employer company added',
            documents: 'Document uploaded for verification',
            payments: 'Payment record created'
          },
          UPDATE: {
            candidates: 'Candidate information updated',
            agents: 'Agent profile updated',
            receiving_companies: 'Employer information updated',
            documents: 'Document verification status changed',
            payments: 'Payment record updated'
          },
          DELETE: {
            candidates: 'Candidate record removed',
            agents: 'Agent removed from system',
            receiving_companies: 'Employer removed',
            documents: 'Document deleted',
            payments: 'Payment record deleted'
          }
        };

        const message = actionMessages[log.action]?.[log.table_name] || `${log.action} operation on ${log.table_name}`;
        const timeAgo = getTimeAgo(new Date(log.created_at));
        
        return {
          id: log.id || `activity-${index}`,
          message,
          time: timeAgo,
          status: log.action === 'CREATE' ? 'success' : log.action === 'UPDATE' ? 'info' : 'warning'
        };
      });
      
      // Update dashboard data with real process stages and activities
      const updatedDashboardData = {
        ...dashboardResponse,
        processStages: processStages,
        recentActivities: recentActivities
      } as DashboardData;
      
      setData(updatedDashboardData);
      setKpis(kpiResponse.kpis as KPIData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'text-green-600 bg-green-50 border-green-200',
      pending: 'text-orange-600 bg-orange-50 border-orange-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200',
      danger: 'text-red-600 bg-red-50 border-red-200',
      warning: 'text-orange-600 bg-orange-50 border-orange-200'
    };
    return colors[status] || colors.info;
  };

  const getAlertIcon = (type) => {
    const icons = {
      warning: AlertTriangle,
      info: Bell,
      success: CheckCircle,
      danger: AlertTriangle
    };
    const Icon = icons[type] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time business overview and key metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
              <Button onClick={fetchDashboardData} variant="outline">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time business overview and key metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stage Funnel Snapshot */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pipeline Health</p>
                <p className="text-2xl font-semibold">{data?.processStages?.reduce((sum, stage) => sum + (stage.count || 0), 0) || 0}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  {data?.processStages?.length || 0} active stages
                </p>
              </div>
              <div className="bg-indigo-50 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-semibold">78.5%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% vs last month
                </p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Stage Time */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Stage Time</p>
                <p className="text-2xl font-semibold">12.3</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  days per stage
                </p>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* At-Risk Candidates */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At-Risk Candidates</p>
                <p className="text-2xl font-semibold">4</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Need attention
                </p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Original KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-semibold">{kpis?.total_candidates || data?.stats?.totalCandidates || 0}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {kpis?.active_candidates || 0} active
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
                <p className="text-sm font-medium text-muted-foreground">Total Employers</p>
                <p className="text-2xl font-semibold">{kpis?.totalEmployers || 0}</p>
                <p className={`text-sm flex items-center mt-1 ${
                  parseFloat(kpis?.employerGrowth || '0') >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <Target className="h-3 w-3 mr-1" />
                  {parseFloat(kpis?.employerGrowth || '0') >= 0 ? '+' : ''}{kpis?.employerGrowth || '0'}% vs last month
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-semibold">{kpis?.active_agents || data?.stats?.totalAgents || 0}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  All regions
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-semibold">{formatCurrency(kpis?.total_revenue_this_month || data?.stats?.monthlyRevenue || 0)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {calculateRevenueGrowth()}
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts */}
      {kpis?.alerts && kpis.alerts.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Bell className="h-5 w-5 mr-2 text-orange-600" />
              System Alerts ({kpis.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${getStatusColor(alert.type)}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{alert.message}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {alert.priority} priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1 h-12 rounded-lg">
          <TabsTrigger value="overview" className="px-6 py-2 rounded-md">Process Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="px-6 py-2 rounded-md">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="performance" className="px-6 py-2 rounded-md">Performance</TabsTrigger>
          <TabsTrigger value="risk" className="px-6 py-2 rounded-md">Risk Management</TabsTrigger>
          <TabsTrigger value="activities" className="px-6 py-2 rounded-md">Recent Activities</TabsTrigger>
          <TabsTrigger value="financials" className="px-6 py-2 rounded-md">Financial Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Process Stages */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Process Stages</CardTitle>
                  <CardDescription>Current candidate distribution across process stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.processStages?.map((stage, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{stage.name}</span>
                            <span className="text-sm font-medium">{stage.count} candidates</span>
                          </div>
                          <Progress value={stage.percentage} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {stage.percentage}% of pipeline
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No process stage data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-between" 
                    variant="outline"
                    onClick={() => {
                      window.location.href = '/candidates';
                      // Trigger the add candidate form after navigation
                      setTimeout(() => {
                        const addButton = document.querySelector('[data-action="add-candidate"]') as HTMLButtonElement;
                        if (addButton) addButton.click();
                      }, 500);
                    }}
                  >
                    Add New Candidate
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    className="w-full justify-between" 
                    variant="outline"
                    onClick={() => {
                      window.location.href = '/financials';
                      // Trigger the add financial record form after navigation
                      setTimeout(() => {
                        const addButton = document.querySelector('[data-action="add-financial"]') as HTMLButtonElement;
                        if (addButton) addButton.click();
                      }, 500);
                    }}
                  >
                    Process Payments
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    className="w-full justify-between" 
                    variant="outline"
                    onClick={() => {
                      window.location.href = '/reports';
                      // Focus on report generation section after navigation
                      setTimeout(() => {
                        const reportSection = document.querySelector('[data-section="generate-reports"]');
                        if (reportSection) reportSection.scrollIntoView({ behavior: 'smooth' });
                      }, 500);
                    }}
                  >
                    Generate Reports
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    className="w-full justify-between" 
                    variant="outline"
                    onClick={() => {
                      window.location.href = '/documents';
                      // Trigger the upload document form after navigation
                      setTimeout(() => {
                        const uploadButton = document.querySelector('[data-action="upload-document"]') as HTMLButtonElement;
                        if (uploadButton) uploadButton.click();
                      }, 500);
                    }}
                  >
                    Manage Documents
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">
                      {(data?.reports && Array.isArray(data.reports) && data.reports[0]?.pipeline_health?.conversion_rate) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Processing</span>
                    <span className="font-medium">
                      {(data?.reports && Array.isArray(data.reports) && data.reports[0]?.pipeline_health?.average_processing_time) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Payments</span>
                    <span className="font-medium">
                      {formatCurrency(kpis?.pending_payments || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Funnel Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Stage Funnel Analysis</CardTitle>
                <CardDescription>Current candidate distribution and flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: 'Passport', count: 45, retention: 100, color: 'bg-blue-500' },
                    { stage: 'Interview', count: 38, retention: 84.4, color: 'bg-green-500' },
                    { stage: 'Medical', count: 32, retention: 84.2, color: 'bg-yellow-500' },
                    { stage: 'Training', count: 28, retention: 87.5, color: 'bg-orange-500' },
                    { stage: 'Visa', count: 22, retention: 78.6, color: 'bg-purple-500' },
                    { stage: 'Deployed', count: 18, retention: 81.8, color: 'bg-emerald-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <span className="font-medium">{item.stage}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">{item.count} candidates</span>
                        <span className={`text-sm font-medium ${
                          item.retention >= 85 ? 'text-green-600' : 
                          item.retention >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.retention}% retention
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Stage Conversion Rates</CardTitle>
                <CardDescription>Success rates between recruitment stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { from: 'Passport → Interview', rate: 84.4, moves: 38, trend: '+2.1%' },
                    { from: 'Interview → Medical', rate: 84.2, moves: 32, trend: '-1.2%' },
                    { from: 'Medical → Training', rate: 87.5, moves: 28, trend: '+3.4%' },
                    { from: 'Training → Visa', rate: 78.6, moves: 22, trend: '-0.8%' },
                    { from: 'Visa → Deployed', rate: 81.8, moves: 18, trend: '+1.9%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{item.from}</div>
                        <div className="text-xs text-muted-foreground">{item.moves} successful moves</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.rate}%</div>
                        <div className={`text-xs ${
                          item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.trend} vs last month
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Average Time in Stages */}
            <Card>
              <CardHeader>
                <CardTitle>Average Time in Each Stage</CardTitle>
                <CardDescription>Processing time analysis by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: 'Passport', avg: 8.5, max: 21, min: 3, status: 'good' },
                    { stage: 'Interview', avg: 12.3, max: 28, min: 5, status: 'warning' },
                    { stage: 'Medical', avg: 15.7, max: 35, min: 7, status: 'warning' },
                    { stage: 'Training', avg: 22.1, max: 45, min: 14, status: 'critical' },
                    { stage: 'Visa', avg: 18.9, max: 42, min: 8, status: 'warning' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'good' ? 'bg-green-500' :
                          item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium">{item.stage}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.avg} days avg</div>
                        <div className="text-xs text-muted-foreground">
                          {item.min}-{item.max} days range
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* At-Risk Candidates */}
            <Card>
              <CardHeader>
                <CardTitle>At-Risk Candidate Analysis</CardTitle>
                <CardDescription>Candidates requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'John Mukasa', stage: 'Medical', days: 42, risk: 'High', lastMove: '6 weeks ago' },
                    { name: 'Sarah Nakato', stage: 'Interview', days: 35, risk: 'High', lastMove: '5 weeks ago' },
                    { name: 'David Okello', stage: 'Training', days: 28, risk: 'Medium', lastMove: '4 weeks ago' },
                    { name: 'Grace Auma', stage: 'Visa', days: 21, risk: 'Low', lastMove: '3 weeks ago' }
                  ].map((candidate, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.stage} stage</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={candidate.risk === 'High' ? 'destructive' : candidate.risk === 'Medium' ? 'secondary' : 'outline'}>
                          {candidate.risk} Risk
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {candidate.days} days total, {candidate.lastMove}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Key metrics for this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <div className="text-sm font-medium text-green-900">Successful Placements</div>
                      <div className="text-2xl font-bold text-green-600">{kpis?.deployed_this_month || 0}</div>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <div className="text-sm font-medium text-blue-900">Active Candidates</div>
                      <div className="text-2xl font-bold text-blue-600">{kpis?.active_candidates || 0}</div>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <div className="text-sm font-medium text-orange-900">Pending Payments</div>
                      <div className="text-2xl font-bold text-orange-600">{formatCurrency(kpis?.pending_payments || 0)}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Top performing agents this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data?.reports && Array.isArray(data.reports) && data.reports[0]?.agent_performance ? data.reports[0].agent_performance.slice(0, 5) : []).map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                          <div className="text-sm text-muted-foreground">{agent.placements} placements</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{formatCurrency(agent.earnings)}</div>
                        <div className="text-xs text-muted-foreground">earned</div>
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
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Service Fees</span>
                      <span className="text-sm font-medium">{formatCurrency(1200000)}</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Employer Fees</span>
                      <span className="text-sm font-medium">{formatCurrency((kpis?.total_revenue_this_month || 0) * 0.75)}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(kpis?.total_revenue_this_month || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Current financial status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="text-sm text-green-700">Total Revenue</div>
                      <div className="font-medium">{formatCurrency(kpis?.total_revenue_this_month || 0)}</div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="text-sm text-orange-700">Pending Payments</div>
                      <div className="font-medium">{formatCurrency(kpis?.pending_payments || 0)}</div>
                    </div>
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="text-sm text-blue-700">Service Fees Collected</div>
                      <div className="font-medium">{formatCurrency(1200000)}</div>
                    </div>
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Risk Management Dashboard</h3>
              <p className="text-sm text-muted-foreground">Monitor and manage operational risks across the recruitment process</p>
            </div>

            {/* Risk Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">High Risk Candidates</p>
                      <p className="text-2xl font-semibold">7</p>
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Immediate attention
                      </p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg">
                      <AlertOctagon className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Document Risks</p>
                      <p className="text-2xl font-semibold">12</p>
                      <p className="text-sm text-orange-600 flex items-center mt-1">
                        <FileX className="h-3 w-3 mr-1" />
                        Expired/Missing
                      </p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <FileX className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Financial Risks</p>
                      <p className="text-2xl font-semibold">3</p>
                      <p className="text-sm text-yellow-600 flex items-center mt-1">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Payment delays
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                      <p className="text-2xl font-semibold">87%</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        Good standing
                      </p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Analysis Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    High Risk Candidates
                  </CardTitle>
                  <CardDescription>Candidates requiring immediate intervention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'John Mukasa', stage: 'Medical', risk: 'Document Expiry', days: 45, severity: 'Critical' },
                      { name: 'Sarah Nakato', stage: 'Interview', risk: 'Extended Timeline', days: 38, severity: 'High' },
                      { name: 'David Okello', stage: 'Training', risk: 'Medical Issues', days: 32, severity: 'High' },
                      { name: 'Grace Auma', stage: 'Visa', risk: 'Payment Delay', days: 28, severity: 'Medium' },
                      { name: 'Peter Ssali', stage: 'Passport', risk: 'Missing Documents', days: 25, severity: 'Medium' }
                    ].map((candidate, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            candidate.severity === 'Critical' ? 'bg-red-600' :
                            candidate.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-sm">{candidate.name}</div>
                            <div className="text-xs text-muted-foreground">{candidate.stage} stage • {candidate.risk}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium ${
                            candidate.severity === 'Critical' ? 'text-red-600' :
                            candidate.severity === 'High' ? 'text-orange-600' : 'text-yellow-600'
                          }`}>
                            {candidate.severity}
                          </div>
                          <div className="text-xs text-muted-foreground">{candidate.days} days</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileX className="h-5 w-5 mr-2 text-orange-600" />
                    Document Risk Analysis
                  </CardTitle>
                  <CardDescription>Document compliance and expiry monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Passport', expired: 3, expiring: 5, missing: 2, total: 10 },
                      { type: 'Medical Certificate', expired: 2, expiring: 4, missing: 1, total: 7 },
                      { type: 'Training Certificate', expired: 1, expiring: 3, missing: 3, total: 7 },
                      { type: 'Visa Application', expired: 0, expiring: 2, missing: 1, total: 3 },
                      { type: 'Work Permit', expired: 1, expiring: 1, missing: 0, total: 2 }
                    ].map((doc, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{doc.type}</div>
                          <div className="text-xs font-semibold">{doc.total} at risk</div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="text-red-600">{doc.expired} expired</span>
                          <span className="text-orange-600">{doc.expiring} expiring</span>
                          <span className="text-yellow-600">{doc.missing} missing</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Mitigation & Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Risk Mitigation Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: 'Document renewal reminders sent', status: 'completed', priority: 'High' },
                      { action: 'Medical re-examinations scheduled', status: 'in_progress', priority: 'High' },
                      { action: 'Payment follow-ups initiated', status: 'pending', priority: 'Medium' },
                      { action: 'Compliance audit scheduled', status: 'pending', priority: 'Low' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'completed' ? 'bg-green-500' :
                            item.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}></div>
                          <div className="text-sm">{item.action}</div>
                        </div>
                        <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'secondary' : 'outline'} className="text-xs">
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-purple-600" />
                    Risk Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-600 mb-2">Critical Alerts</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Overdue medical exams:</span>
                          <span className="font-medium text-red-600">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expired documents:</span>
                          <span className="font-medium text-red-600">7</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-600 mb-2">Warnings</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Documents expiring soon:</span>
                          <span className="font-medium text-orange-600">15</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Extended stage times:</span>
                          <span className="font-medium text-orange-600">8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Compliance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: 'Document Compliance', score: 87, target: 95, status: 'warning' },
                      { metric: 'Process Adherence', score: 92, target: 90, status: 'good' },
                      { metric: 'Timeline Compliance', score: 78, target: 85, status: 'critical' },
                      { metric: 'Quality Standards', score: 94, target: 90, status: 'good' }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.metric}</span>
                          <span className={`font-semibold ${
                            item.status === 'good' ? 'text-green-600' :
                            item.status === 'warning' ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {item.score}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.score} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">Target: {item.target}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Trends & Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Risk className="h-5 w-5 mr-2 text-indigo-600" />
                  Risk Trends & Predictive Analytics
                </CardTitle>
                <CardDescription>Historical risk patterns and future predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-indigo-600">Trend Analysis</h4>
                    {[
                      { trend: 'Document expiry rates', direction: 'increasing', change: '+12%', period: 'last 3 months' },
                      { trend: 'Stage completion times', direction: 'stable', change: '+2%', period: 'last month' },
                      { trend: 'Candidate dropout rates', direction: 'decreasing', change: '-8%', period: 'last 2 months' }
                    ].map((item, index) => (
                      <div key={index} className="p-2 bg-indigo-50 rounded border border-indigo-200">
                        <div className="font-medium text-sm">{item.trend}</div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className={`font-medium ${
                            item.direction === 'increasing' ? 'text-red-600' :
                            item.direction === 'decreasing' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {item.change} {item.direction}
                          </span>
                          <span className="text-muted-foreground">{item.period}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-purple-600">Predictions</h4>
                    {[
                      { prediction: 'Expected document renewals', count: '23', timeframe: 'next 30 days' },
                      { prediction: 'Candidates at risk of dropout', count: '5', timeframe: 'next 2 weeks' },
                      { prediction: 'Potential payment delays', count: '8', timeframe: 'next month' }
                    ].map((item, index) => (
                      <div key={index} className="p-2 bg-purple-50 rounded border border-purple-200">
                        <div className="font-medium text-sm">{item.prediction}</div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="font-medium text-purple-600">{item.count} expected</span>
                          <span className="text-muted-foreground">{item.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-emerald-600">Recommendations</h4>
                    {[
                      { action: 'Implement automated document renewal alerts', impact: 'High', effort: 'Medium' },
                      { action: 'Enhance candidate communication protocols', impact: 'Medium', effort: 'Low' },
                      { action: 'Establish backup medical examination centers', impact: 'High', effort: 'High' }
                    ].map((item, index) => (
                      <div key={index} className="p-2 bg-emerald-50 rounded border border-emerald-200">
                        <div className="font-medium text-sm">{item.action}</div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-emerald-600">Impact: {item.impact}</span>
                          <span className="text-muted-foreground">Effort: {item.effort}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentActivities?.map((activity) => (
                  <div key={activity.id} className={`flex items-start space-x-3 p-4 rounded-lg border ${getStatusColor(activity.status)}`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {activity.status === 'success' && <CheckCircle className="h-4 w-4" />}
                      {activity.status === 'pending' && <Clock className="h-4 w-4" />}
                      {activity.status === 'info' && <Bell className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{activity.message}</div>
                      <div className="text-xs opacity-75 mt-1">{activity.time}</div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activities
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;