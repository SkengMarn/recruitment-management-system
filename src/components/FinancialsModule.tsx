import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Textarea } from './ui/textarea';
import SmartTable from './ui/smart-table';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit3,
  Trash2,
  Download, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Banknote,
  Receipt,
  PiggyBank,
  Save,
  BarChart3,
  Target,
  Percent
} from 'lucide-react';
import { apiClient } from '../utils/supabase/client';
import InlineSelectCreate from './InlineSelectCreate';
import { toast } from 'sonner';

interface Financial {
  id: string;
  candidate_id: string;
  candidate_name: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  description: string;
  notes?: string;
}

interface Candidate {
  id: string;
  name: string;
  full_name: string;
}

const FinancialsModule = () => {
  const [financials, setFinancials] = useState<Financial[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFinancial, setSelectedFinancial] = useState<Financial | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchFinancials();
    fetchCandidates();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getFinancials();
      setFinancials(data.financials || []);
    } catch (err) {
      console.error('Failed to fetch financials:', err);
      setError('Failed to load financial data');
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await apiClient.getCandidates();
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };

  const handleCreateFinancial = async (formData) => {
    try {
      const response = await apiClient.createFinancialRecord(formData);
      setFinancials(prev => [...prev, response.financial]);
      setIsCreateDialogOpen(false);
      toast.success('Financial record created successfully');
      await fetchFinancials(); // Refresh data
    } catch (err) {
      console.error('Failed to create financial record:', err);
      toast.error('Failed to create financial record');
    }
  };

  const handleUpdateFinancial = async (id, formData) => {
    try {
      const response = await apiClient.updateFinancialRecord(id, formData);
      setFinancials(prev => prev.map(financial => 
        financial.id === id ? response.financial : financial
      ));
      setIsEditDialogOpen(false);
      setSelectedFinancial(null);
      toast.success('Financial record updated successfully');
      await fetchFinancials(); // Refresh data
    } catch (err) {
      console.error('Failed to update financial record:', err);
      toast.error('Failed to update financial record');
    }
  };

  const handleDeleteFinancial = async (id) => {
    try {
      await apiClient.deleteFinancialRecord(id);
      setFinancials(prev => prev.filter(financial => financial.id !== id));
      toast.success('Financial record deleted successfully');
    } catch (err) {
      console.error('Failed to delete financial record:', err);
      toast.error('Failed to delete financial record');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeIcon = (type) => {
    const icons = {
      'service_fee': <CreditCard className="h-4 w-4 text-blue-600" />,
      'employer_fee': <Banknote className="h-4 w-4 text-green-600" />,
      'agent_commission': <Receipt className="h-4 w-4 text-purple-600" />,
      'refund': <PiggyBank className="h-4 w-4 text-orange-600" />
    };
    return icons[type] || <DollarSign className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadge = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'overdue': 'bg-red-100 text-red-800',
      'processing': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.pending;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'service_fee': 'Service Fee',
      'employer_fee': 'Employer Fee',
      'agent_commission': 'Agent Commission',
      'refund': 'Refund Payment'
    };
    return labels[type] || type;
  };

  // Calculate summary statistics
  const totalRevenue = financials
    .filter(f => f.type === 'employer_fee' && f.status === 'completed')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalServiceFees = financials
    .filter(f => f.type === 'service_fee' && f.status === 'completed')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalCommissions = financials
    .filter(f => f.type === 'agent_commission' && f.status === 'completed')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalRefunds = financials
    .filter(f => f.type === 'refund' && f.status === 'completed')
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingPayments = financials
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + f.amount, 0);

  const getFilteredAndSortedFinancials = () => {
    let filtered = financials.filter(financial => {
      const matchesSearch = 
        financial.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        financial.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        financial.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || financial.type === selectedFilter;
      
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'date') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (sortField === 'amount') {
        aValue = parseFloat(aValue || 0);
        bValue = parseFloat(bValue || 0);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading financial data...</span>
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
              <Button onClick={fetchFinancials} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredFinancials = getFilteredAndSortedFinancials();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Financial Management</h1>
          <p className="text-muted-foreground mt-1">Track payments, fees, and financial transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchFinancials} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-action="add-financial">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <FinancialForm
                formData={formData}
                setFormData={setFormData}
                candidates={candidates}
                isEdit={isEdit}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                handleInputChange={handleInputChange}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Pipeline</p>
                <p className="text-2xl font-semibold">$485,200</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Potential revenue
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
                <p className="text-sm font-medium text-muted-foreground">Realized Revenue</p>
                <p className="text-2xl font-semibold">$124,800</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  25.7% realization
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commission Earned</p>
                <p className="text-2xl font-semibold">$18,750</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Percent className="h-3 w-3 mr-1" />
                  Agent commissions
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <PiggyBank className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Methods</p>
                <p className="text-2xl font-semibold">5</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Active methods
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <Banknote className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Revenue by Stage
            </CardTitle>
            <CardDescription>Revenue distribution across recruitment stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'Deployment', revenue: 124800, count: 18, color: 'bg-green-500' },
                { stage: 'Visa Processing', revenue: 89200, count: 22, color: 'bg-blue-500' },
                { stage: 'Training', revenue: 156400, count: 28, color: 'bg-yellow-500' },
                { stage: 'Medical', revenue: 114800, count: 32, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <span className="font-medium">{item.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${item.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{item.count} candidates</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Analysis</CardTitle>
            <CardDescription>Cash flow and payment method breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { method: 'Bank Transfer', amount: 89400, count: 45, percentage: 71.7 },
                { method: 'Mobile Money', amount: 22100, count: 28, percentage: 17.7 },
                { method: 'Cash', amount: 8900, count: 12, percentage: 7.1 },
                { method: 'Cheque', amount: 4400, count: 3, percentage: 3.5 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.method}</div>
                    <div className="text-sm text-muted-foreground">{item.count} transactions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${item.amount.toLocaleString()}</div>
                    <div className="text-sm text-green-600">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Summary</CardTitle>
          <CardDescription>Cumulative revenue and payment trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { month: 'January 2024', revenue: 45200, payments: 42800, growth: '+12.3%' },
              { month: 'February 2024', revenue: 52100, payments: 48900, growth: '+15.2%' },
              { month: 'March 2024', revenue: 48900, payments: 51200, growth: '-6.1%' },
              { month: 'April 2024', revenue: 58700, payments: 55400, growth: '+20.0%' },
              { month: 'May 2024', revenue: 62400, payments: 59100, growth: '+6.3%' },
              { month: 'June 2024', revenue: 67800, payments: 64200, growth: '+8.7%' }
            ].map((item, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">{item.month}</div>
                <div className="text-lg font-semibold">${item.revenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Payments: ${item.payments.toLocaleString()}</div>
                <div className={`text-sm font-medium ${
                  item.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.growth} vs prev month
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold">{formatCurrency(totalRevenue)}</p>
                <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Fees</p>
                <p className="text-2xl font-semibold text-blue-600">{formatCurrency(totalServiceFees)}</p>
              </div>
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commissions</p>
                <p className="text-2xl font-semibold text-purple-600">{formatCurrency(totalCommissions)}</p>
              </div>
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refunds</p>
                <p className="text-2xl font-semibold text-orange-600">{formatCurrency(totalRefunds)}</p>
              </div>
              <PiggyBank className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{formatCurrency(pendingPayments)}</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-600" />
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
                  placeholder="Search by candidate, description, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="service_fee">Service Fees</SelectItem>
                  <SelectItem value="employer_fee">Employer Fees</SelectItem>
                  <SelectItem value="agent_commission">Commissions</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Financial Transactions ({filteredFinancials.length})
            <div className="text-sm font-normal text-muted-foreground">
              Showing {filteredFinancials.length} of {financials.length} transactions
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartTable
            data={filteredFinancials}
            loading={loading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={(financial) => {
              setSelectedFinancial(financial);
              setIsViewDialogOpen(true);
            }}
            columns={[
              {
                key: 'id',
                header: 'Transaction',
                render: (value, transaction) => (
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(transaction.type)}
                    <div>
                      <div className="font-medium">#{transaction.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.description}
                      </div>
                    </div>
                  </div>
                )
              },
              {
                key: 'candidate_name',
                header: 'Candidate',
                render: (value, transaction) => (
                  <div>
                    <div className="font-medium">{transaction.candidate_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {transaction.candidate_id || 'N/A'}
                    </div>
                  </div>
                )
              },
              {
                key: 'type',
                header: 'Type',
                render: (value, transaction) => (
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(transaction.type)}
                    <span>{getTypeLabel(transaction.type)}</span>
                  </div>
                )
              },
              {
                key: 'amount',
                header: 'Amount',
                sortable: true,
                render: (value, transaction) => (
                  <div className={`font-semibold ${
                    transaction.type === 'refund' || transaction.type === 'agent_commission' 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {transaction.type === 'refund' || transaction.type === 'agent_commission' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Status',
                render: (value, transaction) => (
                  <Badge className={getStatusBadge(transaction.status)}>
                    {transaction.status}
                  </Badge>
                )
              },
              {
                key: 'date',
                header: 'Date',
                sortable: true,
                render: (value) => (
                  <div className="text-sm text-muted-foreground">
                    {value ? new Date(value).toLocaleDateString() : 'N/A'}
                  </div>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                sortable: false,
                render: (value, transaction) => (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFinancial(transaction);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFinancial(transaction);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this financial transaction? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteFinancial(transaction.id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFinancial && (
            <FinancialForm
              financial={selectedFinancial}
              onSubmit={(formData) => handleUpdateFinancial(selectedFinancial.id, formData)}
              candidates={candidates}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedFinancial && (
            <FinancialDetails
              financial={selectedFinancial}
              formatCurrency={formatCurrency}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface FinancialFormProps {
  financial?: Financial | null;
  onSubmit: (formData: any) => Promise<void>;
  candidates: Candidate[];
  isEdit?: boolean;
}

const FinancialForm = ({ financial, onSubmit, candidates, isEdit = false }: FinancialFormProps) => {
  const [formData, setFormData] = useState({
    candidate_id: financial?.candidate_id || '',
    type: financial?.type || '',
    amount: financial?.amount?.toString() || '',
    currency: financial?.currency || 'UGX',
    status: financial?.status || 'pending',
    date: financial?.date || new Date().toISOString().split('T')[0],
    description: financial?.description || '',
    notes: financial?.notes || ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transactionTypes = [
    { value: 'service_fee', label: 'Service Fee' },
    { value: 'employer_fee', label: 'Employer Fee' },
    { value: 'agent_commission', label: 'Agent Commission' },
    { value: 'refund', label: 'Refund Payment' }
  ];

  const currencies = [
    { value: 'UGX', label: 'Uganda Shilling (UGX)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'AED', label: 'UAE Dirham (AED)' },
    { value: 'SAR', label: 'Saudi Riyal (SAR)' },
    { value: 'QAR', label: 'Qatari Riyal (QAR)' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.candidate_id) {
      errors.candidate_id = 'Candidate is required';
    }
    
    if (!formData.type) {
      errors.type = 'Transaction type is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount.toString()) <= 0) {
      errors.amount = 'Valid amount is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const finalFormData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      await onSubmit(finalFormData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Financial Transaction' : 'Add New Financial Transaction'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update transaction information' : 'Record a new financial transaction in the system'}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.type && (
              <p className="text-sm text-destructive">{validationErrors.type}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
            />
            {validationErrors.amount && (
              <p className="text-sm text-destructive">{validationErrors.amount}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of the transaction"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes or comments"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="submit"
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
                {isEdit ? 'Update Transaction' : 'Create Transaction'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

const FinancialDetails = ({ financial, formatCurrency }) => {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          Transaction #{financial.id}
          <Badge className={financial.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {financial.status}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Complete information about this financial transaction
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-medium">{financial.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{financial.type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(financial.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency:</span>
              <span>{financial.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{financial.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={financial.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {financial.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Candidate:</span>
              <span className="font-medium">{financial.candidate_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Candidate ID:</span>
              <span>{financial.candidate_id || 'N/A'}</span>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Description:</span>
              <p className="text-sm bg-muted p-2 rounded">
                {financial.description || 'No description available'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {financial.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{financial.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialsModule;