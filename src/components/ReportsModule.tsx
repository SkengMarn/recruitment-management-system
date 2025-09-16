import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Clock, FileText, 
  Download, Play, RefreshCw, Award, Target, CheckCircle,
  Database, AlertCircle, BarChart3, Maximize2, Minimize2
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
  LineChart as RechartsLineChart,
  Line
} from 'recharts';
import { APIClient } from '../utils/supabase/client';

// Helper functions
const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const calculateAgentPerformance = (candidates: any[], agents: any[], financials: any[]) => {
  return agents.map(agent => {
    const agentCandidates = candidates.filter(c => c.agent_id === agent.id);
    const placements = agentCandidates.filter(c => c.stage === 'deployed').length;
    const successRate = agentCandidates.length > 0 ? (placements / agentCandidates.length) * 100 : 0;
    
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX'
  }).format(amount);
};

const ReportsModule: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [queryLoading, setQueryLoading] = useState(false);
  
  // Enhanced Table Features
  const [sortConfig, setSortConfig] = useState<{key: string | null, direction: string}>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [columnFilters, setColumnFilters] = useState<any>({});
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [isTableMaximized, setIsTableMaximized] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [isTableFullscreen, setIsTableFullscreen] = useState(false);

  // Function to determine column width based on column type and content
  const getColumnWidth = (column: string): string => {
    // Common ID columns - compact for UUIDs
    if (column.toLowerCase().includes('id')) return '100px';
    
    // Email columns - medium width
    if (column.toLowerCase().includes('email')) return '160px';
    
    // Phone columns - compact for phone numbers
    if (column.toLowerCase().includes('phone')) return '120px';
    
    // Name columns - medium width for names
    if (column.toLowerCase().includes('name')) return '140px';
    
    // Address columns - wider for addresses but still constrained
    if (column.toLowerCase().includes('address')) return '180px';
    
    // URL/Photo columns - constrained to prevent stretching
    if (column.toLowerCase().includes('url') || column.toLowerCase().includes('photo')) return '120px';
    
    // Date columns - compact for dates
    if (column.toLowerCase().includes('date') || column.toLowerCase().includes('created') || column.toLowerCase().includes('updated')) return '100px';
    
    // Boolean columns - very compact for true/false
    if (column.toLowerCase().includes('active') || column.toLowerCase().includes('is_')) return '80px';
    
    // Stage/Status columns - compact for status badges
    if (column.toLowerCase().includes('stage') || column.toLowerCase().includes('status')) return '100px';
    
    // Gender column - very compact
    if (column.toLowerCase().includes('gender')) return '80px';
    
    // Default width for other columns - smaller to prevent stretching
    return '120px';
  };

  const executeQuery = async () => {
    try {
      setQueryLoading(true);
      setError(null);
      const startTime = Date.now();
      
      const apiClient = new APIClient();
      const result = await apiClient.executeSQLQuery(sqlQuery);
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setQueryResults(result.data || []);
      
      // Reset table state for new results
      setCurrentPage(1);
      setColumnFilters({});
      setHiddenColumns(new Set());
      setSortConfig({ key: null, direction: 'asc' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
      setQueryResults([]);
    } finally {
      setQueryLoading(false);
    }
  };

  // Helper functions for table functionality
  const getDataType = (column: string, data: any[]): string => {
    if (!data || data.length === 0) return 'text';
    
    const sampleValues = data.slice(0, 10).map(row => row[column]).filter(val => val !== null && val !== undefined);
    if (sampleValues.length === 0) return 'text';
    
    const firstValue = sampleValues[0];
    if (typeof firstValue === 'number') return 'number';
    if (typeof firstValue === 'boolean') return 'boolean';
    if (firstValue instanceof Date) return 'date';
    
    // Check if string represents a number
    const stringValue = String(firstValue);
    if (!isNaN(parseFloat(stringValue)) && isFinite(stringValue as any)) return 'number';
    
    return 'text';
  };

  const getColumnAlignment = (column: string, data: any[]): string => {
    const dataType = getDataType(column, data);
    if (dataType === 'number') return 'text-right';
    if (dataType === 'boolean') return 'text-center';
    return 'text-left';
  };

  const handleSort = (columnKey: string) => {
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
      if (filterValue && typeof filterValue === 'string') {
        filteredData = filteredData.filter(row => {
          const cellValue = String(row[column] || '').toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        });
      }
    });
    
    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const aNum = parseFloat(String(aVal));
        const bNum = parseFloat(String(bVal));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }
    
    return filteredData;
  };

  const formatCellValue = (value: any, column: string, data: any[]) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    
    const stringValue = String(value);
    const columnLower = column.toLowerCase();
    
    // Don't format ID, phone, and created_at fields
    if (columnLower.includes('id') || 
        columnLower.includes('phone') || 
        columnLower.includes('created') || 
        columnLower.includes('updated')) {
      return <span className="font-mono text-sm">{stringValue}</span>;
    }

    const dataType = getDataType(column, data);

    // Number formatting
    if (dataType === 'number') {
      const numValue = parseFloat(stringValue);
      if (!isNaN(numValue)) {
        const isNegative = numValue < 0;
        const isZero = numValue === 0;
        
        return (
          <span className={`font-mono ${
            isNegative ? 'text-red-600' : 
            isZero ? 'text-muted-foreground' : 
            'text-foreground'
          }`}>
            {numValue.toLocaleString()}
          </span>
        );
      }
    }

    // Status formatting
    if (stringValue.toLowerCase().includes('error') || stringValue.toLowerCase().includes('failed')) {
      return <span className="text-red-600">{stringValue}</span>;
    }
    
    if (stringValue.toLowerCase().includes('success') || stringValue.toLowerCase().includes('completed')) {
      return <span className="text-green-600">{stringValue}</span>;
    }
    
    if (stringValue.toLowerCase().includes('pending') || stringValue.toLowerCase().includes('waiting')) {
      return <span className="text-orange-600">{stringValue}</span>;
    }

    return stringValue;
  };

  const exportToCSV = () => {
    const data = getSortedResults();
    if (!data || data.length === 0) return;

    const allColumns = Object.keys(data[0]);
    const visibleColumns = allColumns.filter(col => !hiddenColumns.has(col));
    
    const headers = visibleColumns.join(',');
    const rows = data.map(row => 
      visibleColumns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `sql_query_results_${timestamp}.csv`;
    
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

  const toggleColumnVisibility = (column: string) => {
    const newHiddenColumns = new Set(hiddenColumns);
    if (newHiddenColumns.has(column)) {
      newHiddenColumns.delete(column);
    } else {
      newHiddenColumns.add(column);
    }
    setHiddenColumns(newHiddenColumns);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiClient = new APIClient();
      
      // Fetch all required data
      const [candidatesData, agentsData, employersData, financialsData] = await Promise.all([
        apiClient.getCandidates(),
        apiClient.getAgents(),
        apiClient.getEmployers(),
        apiClient.getFinancials()
      ]);

      // Calculate metrics
      const totalCandidates = candidatesData.candidates?.length || 0;
      const deployedCandidates = candidatesData.candidates?.filter(c => c.stage === 'deployed').length || 0;
      const totalRevenue = financialsData.financials?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
      
      // Calculate trends (mock data for now)
      const currentMonth = new Date().getMonth();
      const previousMonth = currentMonth - 1;
      
      const currentMonthPlacements = deployedCandidates;
      const previousMonthPlacements = Math.floor(deployedCandidates * 0.8);
      const placementsTrend = calculateTrend(currentMonthPlacements, previousMonthPlacements);
      
      // Calculate stage distribution
      const stageData = ['passport', 'interview', 'medical', 'training', 'visa', 'deployed'].map(stage => ({
        stage,
        count: candidatesData.candidates?.filter(c => c.stage === stage).length || 0
      }));

      // Calculate agent performance
      const agentPerformance = calculateAgentPerformance(
        candidatesData.candidates || [], 
        agentsData.agents || [], 
        financialsData.financials || []
      );

      const reportsData = {
        total_candidates: totalCandidates,
        deployed_candidates: deployedCandidates,
        total_revenue: totalRevenue,
        placements_trend: placementsTrend,
        stage_distribution: stageData,
        agent_performance: agentPerformance,
        pipeline_health: {
          conversion_rate: totalCandidates > 0 ? ((deployedCandidates / totalCandidates) * 100).toFixed(1) : '0',
          average_processing_time: '45 days'
        }
      };

      setReports(reportsData);
    } catch (err) {
      setError('Failed to load reports data');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-600 font-medium">Error</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-full mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Reports & Analytics</h1>
          <p className="text-xs text-muted-foreground">Comprehensive recruitment analytics and custom queries</p>
        </div>
        <Button onClick={fetchReports} disabled={loading} size="sm">
          {loading ? (
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
          <TabsTrigger value="sql">Custom SQL</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Candidates</p>
                    <p className="text-lg font-bold">{reports?.total_candidates || 0}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Deployed</p>
                    <p className="text-lg font-bold">{reports?.deployed_candidates || 0}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+8% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-lg font-bold">{formatCurrency(reports?.total_revenue || 0)}</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+15% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-lg font-bold">{reports?.pipeline_health?.conversion_rate || 0}%</p>
                  </div>
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-xs text-red-600">-2% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Candidate Pipeline</CardTitle>
                <CardDescription className="text-xs">Distribution by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reports?.stage_distribution || []}>
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
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Agent Performance</CardTitle>
                <CardDescription className="text-xs">Top performing agents</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
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

        <TabsContent value="agents" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agent Performance Leaderboard</CardTitle>
              <CardDescription className="text-xs">Performance metrics and earnings by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports?.agent_performance?.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                        <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.placements} placements</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(agent.earnings)}</p>
                      <p className="text-xs text-muted-foreground">{agent.success_rate}% success rate</p>
                      <div className="text-sm text-muted-foreground">earned</div>
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

        <TabsContent value="employers" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Employer Analytics</CardTitle>
              <CardDescription className="text-xs">Performance metrics by receiving company</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground text-sm">
                Employer analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sql" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Database className="h-4 w-4" />
                <span>SQL Query Runner</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Execute custom SQL queries against your recruitment database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">SQL Query</label>
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM candidates WHERE stage = 'deployed' LIMIT 10;"
                  className="min-h-[120px] font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button onClick={executeQuery} disabled={queryLoading || !sqlQuery.trim()}>
                    {queryLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {queryLoading ? 'Executing...' : 'Execute Query'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSqlQuery('');
                      setQueryResults([]);
                      setError(null);
                      setExecutionTime(null);
                    }}
                    disabled={queryLoading}
                  >
                    Clear
                  </Button>
                </div>
                
                {/* Query Status Indicator */}
                {queryLoading && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Executing query...</span>
                  </div>
                )}
                
                {executionTime && !queryLoading && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Query completed in {executionTime}ms</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-red-600 font-medium">SQL Query Error</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setError(null)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        <p className="text-red-700 text-sm font-mono bg-red-100 p-2 rounded border overflow-x-auto">
                          {error}
                        </p>
                        <details className="text-xs text-red-600">
                          <summary className="cursor-pointer hover:text-red-700 font-medium">
                            💡 Common Solutions
                          </summary>
                          <div className="mt-2 space-y-1 pl-4 border-l-2 border-red-200">
                            <p>• Check table names: <code className="bg-red-100 px-1 rounded">candidates</code>, <code className="bg-red-100 px-1 rounded">agents</code>, <code className="bg-red-100 px-1 rounded">receiving_companies</code>, <code className="bg-red-100 px-1 rounded">positions</code></p>
                            <p>• Verify column names exist in the selected tables</p>
                            <p>• Ensure proper SQL syntax (semicolon at end, quotes around strings)</p>
                            <p>• Use <code className="bg-red-100 px-1 rounded">LIMIT 10</code> for testing large queries</p>
                            <p>• Check for typos in WHERE clauses and JOIN conditions</p>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {queryResults && queryResults.length > 0 && (
                <div className={`${isTableFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
                <Card className={`${isTableFullscreen ? 'h-full flex flex-col' : 'w-full'} mt-6`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <CardTitle>Query Results</CardTitle>
                        {executionTime && (
                          <Badge variant="secondary" className="ml-2">
                            {executionTime}ms
                          </Badge>
                        )}
                        <Badge variant="outline" className="ml-2">
                          {getSortedResults().length} rows
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowColumnSettings(!showColumnSettings)}
                          className="flex items-center space-x-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Columns</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportToCSV}
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Export CSV</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsTableFullscreen(!isTableFullscreen)}
                          className="flex items-center space-x-2"
                          title={isTableFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                        >
                          {isTableFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                          <span>{isTableFullscreen ? 'Exit' : 'Full Screen'}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Column Settings Panel */}
                    {showColumnSettings && queryResults.length > 0 && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">Column Visibility</h4>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHiddenColumns(new Set())}
                            >
                              Show All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHiddenColumns(new Set(Object.keys(queryResults[0] || {})))}
                            >
                              Hide All
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {Object.keys(queryResults[0] || {}).map((column) => (
                            <label key={column} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={!hiddenColumns.has(column)}
                                onChange={() => toggleColumnVisibility(column)}
                                className="rounded border-gray-300"
                              />
                              <span className="truncate">{column.replace(/_/g, ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className={`${isTableFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
                    {/* Table Controls */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-xs font-medium">Rows:</label>
                          <select
                            value={rowsPerPage}
                            onChange={(e) => {
                              setRowsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="border rounded px-1 py-0.5 text-xs"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          Showing {Math.min((currentPage - 1) * rowsPerPage + 1, getSortedResults().length)} to{' '}
                          {Math.min(currentPage * rowsPerPage, getSortedResults().length)} of{' '}
                          {getSortedResults().length} results
                        </span>
                      </div>
                    </div>

                    <div className={`${isTableFullscreen ? 'overflow-auto h-full' : 'overflow-x-auto overflow-y-auto max-h-[400px]'} border rounded-lg`}>
                      <div className="min-w-max">
                        <div className="bg-muted/30 sticky top-0 z-10 overflow-x-auto">
                          <Table className="table-fixed w-full min-w-full">
                            <colgroup>
                              {Object.keys(queryResults[0] || {})
                                .filter(column => !hiddenColumns.has(column))
                                .map((column) => (
                                  <col key={column} style={{ width: getColumnWidth(column), maxWidth: getColumnWidth(column), minWidth: getColumnWidth(column) }} />
                                ))}
                            </colgroup>
                            {/* Table Header with Sorting and Filtering */}
                            <TableHeader>
                              <TableRow className="border-b-2 border-border hover:bg-transparent">
                                {Object.keys(queryResults[0] || {})
                                  .filter(column => !hiddenColumns.has(column))
                                  .map((column) => (
                                  <TableHead 
                                    key={column}
                                    className="border-r border-border last:border-r-0 px-4 py-3 font-semibold text-xs uppercase tracking-wide bg-muted/50 sticky top-0"
                                  >
                                    <div className="space-y-2">
                                      {/* Column Header with Sort */}
                                      <div 
                                        className="flex items-center justify-between cursor-pointer hover:text-primary"
                                        onClick={() => handleSort(column)}
                                      >
                                        <span>{column.replace(/_/g, ' ')}</span>
                                        <div className="flex items-center">
                                          {sortConfig.key === column && (
                                            sortConfig.direction === 'asc' ? 
                                              <TrendingUp className="h-3 w-3 ml-1" /> : 
                                              <TrendingDown className="h-3 w-3 ml-1" />
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Column Filter */}
                                      <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={columnFilters[column] || ''}
                                        onChange={(e) => {
                                          setColumnFilters(prev => ({
                                            ...prev,
                                            [column]: e.target.value
                                          }));
                                          setCurrentPage(1);
                                        }}
                                        className="w-full px-2 py-1 text-xs border rounded bg-background"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            
                            {/* Table Body */}
                            <TableBody>
                              {getSortedResults()
                                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                                .map((row, rowIndex) => (
                                <TableRow 
                                  key={rowIndex}
                                  className={`
                                    border-b hover:bg-muted/30 transition-colors
                                    ${rowIndex % 2 === 0 ? 'bg-muted/20' : 'bg-background'}
                                    ${hoveredRow === rowIndex ? 'bg-muted/40' : ''}
                                  `}
                                  onMouseEnter={() => setHoveredRow(rowIndex)}
                                  onMouseLeave={() => setHoveredRow(null)}
                                >
                                  {Object.entries(row)
                                    .filter(([column]) => !hiddenColumns.has(column))
                                    .map(([column, value]) => (
                                    <TableCell 
                                      key={column}
                                      className={`
                                        border-r border-border last:border-r-0 px-2 py-2
                                        ${getColumnAlignment(column, queryResults)}
                                        ${hoveredColumn === column ? 'bg-muted/50' : ''}
                                        max-w-0 overflow-hidden
                                      `}
                                      style={{ 
                                        width: getColumnWidth(column), 
                                        maxWidth: getColumnWidth(column),
                                        minWidth: getColumnWidth(column)
                                      }}
                                      onMouseEnter={() => setHoveredColumn(column)}
                                      onMouseLeave={() => setHoveredColumn(null)}
                                    >
                                      <div className="relative group/cell truncate overflow-hidden whitespace-nowrap text-ellipsis" title={String(value || '')}>
                                        {formatCellValue(value, column, queryResults)}
                                        
                                        {/* Tooltip for long content */}
                                        {String(value || '').length > 20 && (
                                          <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200 z-20 max-w-xs break-words pointer-events-none">
                                            {String(value)}
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
                    </div>
                    
                    {/* Pagination Controls */}
                    {getSortedResults().length > rowsPerPage && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {Math.ceil(getSortedResults().length / rowsPerPage)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(getSortedResults().length / rowsPerPage), prev + 1))}
                            disabled={currentPage === Math.ceil(getSortedResults().length / rowsPerPage)}
                          >
                            Next
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.ceil(getSortedResults().length / rowsPerPage))}
                            disabled={currentPage === Math.ceil(getSortedResults().length / rowsPerPage)}
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsModule;
