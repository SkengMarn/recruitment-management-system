import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { 
  Users, 
  UserCheck, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '../utils/supabase/client';
import { usePerformance, useCachedAPI, usePerformanceMetrics } from '../hooks/usePerformance';

// Lazy load heavy components
const ProcessStagesChart = lazy(() => import('./charts/ProcessStagesChart'));
const RevenueChart = lazy(() => import('./charts/RevenueChart'));
const ActivityFeed = lazy(() => import('./ActivityFeed'));

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
  processStages: any[];
  recentActivities: any[];
}

// Loading skeleton for stats cards
const StatsCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
);

// Optimized stats card component
const StatsCard = React.memo(({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  trend: 'up' | 'down' | 'neutral';
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs flex items-center ${
        trend === 'up' ? 'text-green-600' : 
        trend === 'down' ? 'text-red-600' : 
        'text-muted-foreground'
      }`}>
        {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
        {change}
      </p>
    </CardContent>
  </Card>
));

const OptimizedDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { logPerformance } = usePerformance('Dashboard');
  const { logMetrics } = usePerformanceMetrics();

  // Cached API call
  const fetchDashboardData = useCachedAPI(
    'dashboard-data',
    async () => {
      const startTime = Date.now();
      const result = await apiClient.getDashboard();
      logPerformance('API Call', Date.now() - startTime);
      return result;
    },
    []
  );

  const loadDashboard = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (forceRefresh) {
        // Clear cache for force refresh
        const { apiCache } = await import('../utils/performance');
        apiCache.clear();
      }

      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
      setLastRefresh(new Date());
      
      // Log performance metrics after load
      setTimeout(() => logMetrics(), 100);
      
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Memoized stats calculations
  const statsCards = useMemo(() => {
    if (!data?.stats) return [];

    return [
      {
        title: "Total Candidates",
        value: data.stats.totalCandidates?.toLocaleString() || '0',
        change: "+12% from last month",
        icon: Users,
        trend: 'up' as const
      },
      {
        title: "Active Candidates",
        value: data.stats.activeCandidates?.toLocaleString() || '0',
        change: "+8% from last month",
        icon: Activity,
        trend: 'up' as const
      },
      {
        title: "Total Agents",
        value: data.stats.totalAgents?.toLocaleString() || '0',
        change: "+3% from last month",
        icon: UserCheck,
        trend: 'up' as const
      },
      {
        title: "Employers",
        value: data.stats.totalEmployers?.toLocaleString() || '0',
        change: "+5% from last month",
        icon: Building2,
        trend: 'up' as const
      },
      {
        title: "Monthly Revenue",
        value: `UGX ${(data.stats.monthlyRevenue || 0).toLocaleString()}`,
        change: "+15% from last month",
        icon: DollarSign,
        trend: 'up' as const
      },
      {
        title: "This Month Placements",
        value: data.stats.thisMonthPlacements?.toLocaleString() || '0',
        change: "+22% from last month",
        icon: TrendingUp,
        trend: 'up' as const
      }
    ];
  }, [data?.stats]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={() => loadDashboard(true)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">Error loading dashboard: {error}</p>
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={() => loadDashboard(true)} 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 6 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))
        ) : (
          // Show actual stats
          statsCards.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))
        )}
      </div>

      {/* Charts and Activities - Lazy loaded */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Process Stages</CardTitle>
            <CardDescription>Current pipeline status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <ProcessStagesChart data={data?.processStages || []} />
              </Suspense>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <ActivityFeed activities={data?.recentActivities || []} />
              </Suspense>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart - Full width, lazy loaded */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <RevenueChart />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedDashboard;
