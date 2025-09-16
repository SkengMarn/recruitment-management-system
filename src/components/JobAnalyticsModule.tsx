import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RefreshCw, TrendingUp, Users, FileCheck, DollarSign, Clock } from 'lucide-react';
import { apiClient } from '../utils/supabase/client';

interface JobAnalytics {
  company_name: string;
  country: string;
  position_id: string | null;
  position_name: string;
  position_text: string;
  stage: string;
  total_candidates: number;
  active_candidates: number;
  total_verified_documents: number;
  total_unverified_documents: number;
  candidate_payments: Record<string, Record<string, number>> | null;
  avg_days_by_stage: Record<string, number> | null;
  cost_by_stage: Record<string, number> | null;
  snapshot_at: string;
}

const JobAnalyticsModule: React.FC = () => {
  const [analytics, setAnalytics] = useState<JobAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getJobAnalytics();
      setAnalytics(response.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch job analytics:', err);
      setError('Failed to load job analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      setRefreshing(true);
      await apiClient.refreshJobAnalytics();
      await fetchAnalytics();
    } catch (err) {
      console.error('Failed to refresh job analytics:', err);
      setError('Failed to refresh analytics data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getStageColor = (stage: string) => {
    const colors = {
      passport: 'bg-blue-100 text-blue-800',
      interview: 'bg-yellow-100 text-yellow-800',
      medical: 'bg-purple-100 text-purple-800',
      training: 'bg-orange-100 text-orange-800',
      visa: 'bg-indigo-100 text-indigo-800',
      deployment: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCompanySummary = () => {
    const companySummary = analytics.reduce((acc, item) => {
      if (!acc[item.company_name]) {
        acc[item.company_name] = {
          country: item.country,
          totalCandidates: 0,
          activeCandidates: 0,
          positions: new Set(),
          stages: new Set()
        };
      }
      acc[item.company_name].totalCandidates += item.total_candidates;
      acc[item.company_name].activeCandidates += item.active_candidates;
      acc[item.company_name].positions.add(item.position_name || item.position_text || 'Unknown Position');
      acc[item.company_name].stages.add(item.stage);
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(companySummary).map(([company, data]) => ({
      company,
      ...data,
      positions: Array.from(data.positions),
      stages: Array.from(data.stages)
    }));
  };

  const getStageMetrics = () => {
    const stageMetrics = analytics.reduce((acc, item) => {
      if (!acc[item.stage]) {
        acc[item.stage] = {
          totalCandidates: 0,
          activeCandidates: 0,
          avgDays: 0,
          totalCost: 0,
          companies: new Set()
        };
      }
      acc[item.stage].totalCandidates += item.total_candidates;
      acc[item.stage].activeCandidates += item.active_candidates;
      acc[item.stage].companies.add(item.company_name);
      
      if (item.avg_days_by_stage && item.avg_days_by_stage[item.stage]) {
        acc[item.stage].avgDays = item.avg_days_by_stage[item.stage];
      }
      
      if (item.cost_by_stage && item.cost_by_stage[item.stage]) {
        acc[item.stage].totalCost += item.cost_by_stage[item.stage];
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(stageMetrics).map(([stage, data]) => ({
      stage,
      ...data,
      companies: Array.from(data.companies)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading job analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const companySummary = getCompanySummary();
  const stageMetrics = getStageMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Analytics</h2>
          <p className="text-gray-600">Comprehensive recruitment performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={refreshAnalytics} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold">
                  {analytics.reduce((sum, item) => sum + item.total_candidates, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Candidates</p>
                <p className="text-2xl font-bold">
                  {analytics.reduce((sum, item) => sum + item.active_candidates, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Documents</p>
                <p className="text-2xl font-bold">
                  {analytics.reduce((sum, item) => sum + item.total_verified_documents, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold">{companySummary.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="companies" className="w-full">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <div className="grid gap-4">
            {companySummary.map((company) => (
              <Card key={company.company}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {company.company}
                    <Badge variant="outline">{company.country}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {company.totalCandidates} total candidates • {company.activeCandidates} active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Positions ({company.positions.length})</h4>
                      <div className="flex flex-wrap gap-1">
                        {company.positions.map((position, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Active Stages</h4>
                      <div className="flex flex-wrap gap-1">
                        {company.stages.map((stage, idx) => (
                          <Badge key={idx} className={`text-xs ${getStageColor(stage)}`}>
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4">
          <div className="grid gap-4">
            {stageMetrics.map((stage) => (
              <Card key={stage.stage}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{stage.stage} Stage</span>
                    <Badge className={getStageColor(stage.stage)}>
                      {stage.totalCandidates} candidates
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {stage.activeCandidates} active • {stage.companies.length} companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Avg. Days</p>
                        <p className="font-medium">{stage.avgDays || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="font-medium">
                          {stage.totalCost ? formatCurrency(stage.totalCost) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Companies</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.companies.slice(0, 3).map((company, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {company}
                          </Badge>
                        ))}
                        {stage.companies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{stage.companies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <div className="grid gap-4">
            {analytics.map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {item.position_name || item.position_text || 'Unknown Position'}
                    <div className="flex items-center space-x-2">
                      <Badge className={getStageColor(item.stage)}>
                        {item.stage}
                      </Badge>
                      <Badge variant="outline">{item.company_name}</Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {item.total_candidates} candidates • {item.active_candidates} active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Documents</h4>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {item.total_verified_documents} verified
                        </span>
                        <span className="text-orange-600">
                          ⏳ {item.total_unverified_documents} pending
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="text-sm text-gray-600">
                        {item.avg_days_by_stage && item.avg_days_by_stage[item.stage] && (
                          <p>Avg. {item.avg_days_by_stage[item.stage]} days in {item.stage}</p>
                        )}
                        {item.cost_by_stage && item.cost_by_stage[item.stage] && (
                          <p>Cost: {formatCurrency(item.cost_by_stage[item.stage])}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobAnalyticsModule;
