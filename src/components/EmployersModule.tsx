import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  CreditCard,
  Shield,
  Activity,
  Building,
  Briefcase,
  Award,
  X,
  AlertCircle,
  Save,
  Printer,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Calendar
} from 'lucide-react';
import { InfoTooltip } from './ui/info-tooltip';
import { toast } from 'sonner';
import { apiClient } from '../utils/supabase/client';
import { checkEmailExists, formatEmailError, isValidEmailFormat } from '../utils/emailValidation';
import SmartTable from './ui/SmartTable';

// Employer interface matching database schema
// Interface matches receiving_companies table exactly
interface Employer {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  country: string;
  license_number: string;
  payment_type: 'employer_funded' | 'candidate_funded' | 'hybrid';
  logo_url?: string;
  is_active: boolean;
  positions_needed?: string[];
  created_at?: string;
  updated_at?: string;
}

// Form data interface - matches receiving_companies table exactly
interface EmployerFormData {
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  country: string;
  license_number: string;
  payment_type: 'employer_funded' | 'candidate_funded' | 'hybrid';
  logo_url?: string;
  is_active: boolean;
  positions_needed: string[];
}

// Validation errors interface
interface ValidationErrors {
  company_name?: string;
  email?: string;
  phone?: string;
  contact?: string;
  license_number?: string;
}

const EmployersModule: React.FC = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Employer>('company_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [formData, setFormData] = useState<EmployerFormData>({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    country: '',
    license_number: '',
    payment_type: 'employer_funded',
    logo_url: '',
    is_active: true,
    positions_needed: []
  });

  // Input change handler
  const handleInputChange = (field: keyof EmployerFormData, value: any) => {
    if (field === 'is_active') {
      setFormData(prev => ({ ...prev, is_active: value === true }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Email validation function
  const handleEmailChange = (value: string) => {
    handleInputChange('email', value);
    setEmailWarning(null);
    
    if (isValidEmailFormat(value)) {
      const timeoutId = setTimeout(async () => {
        setCheckingEmail(true);
        try {
          const result = await checkEmailExists(value, selectedEmployer?.id, 'employers');
          
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
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  // Available positions and payment terms
  const availablePositions = [
    'Domestic Helper', 'Nanny', 'Caregiver', 'Driver', 'Cook', 
    'Cleaner', 'Security Guard', 'Construction Worker', 'Factory Worker'
  ];

  const paymentTerms = [
    'Monthly', 'Bi-weekly', 'Weekly', 'Upon Completion', 'Custom'
  ];

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEmployers();
      setEmployers(response.employers || []);
    } catch (error) {
      console.error('Error fetching employers:', error);
      toast.error('Failed to load employers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployer = async (data: EmployerFormData) => {
    try {
      await apiClient.createEmployer(data);
      await fetchEmployers();
      setShowForm(false);
      toast.success('Employer created successfully');
    } catch (error) {
      console.error('Error creating employer:', error);
      toast.error('Failed to create employer');
    }
  };

  const handleUpdateEmployer = async (id: string, data: EmployerFormData) => {
    try {
      await apiClient.updateEmployer(id, data);
      await fetchEmployers();
      setShowForm(false);
      setSelectedEmployer(null);
      toast.success('Employer updated successfully');
    } catch (error) {
      console.error('Error updating employer:', error);
      toast.error('Failed to update employer');
    }
  };

  const handleDeleteEmployer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employer?')) return;

    try {
      await apiClient.deleteEmployer(id);
      await fetchEmployers();
      toast.success('Employer deleted successfully');
    } catch (error) {
      console.error('Error deleting employer:', error);
      toast.error('Failed to delete employer');
    }
  };

  const handleViewDetails = (employer: Employer) => {
    setSelectedEmployer(employer);
    setShowViewModal(true);
  };

  const handleEditEmployer = (employer: Employer) => {
    setSelectedEmployer(employer);
    setShowForm(true);
  };

  const getFilteredAndSortedEmployers = () => {
    let filtered = employers.filter(employer =>
      employer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  };

  const columns = [
    { key: 'company_name', header: 'Company Name', sortable: true,
      render: (value: string, employer: Employer) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-gray-500">{employer.license_number}</span>
        </div>
      )
    },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'contact_person', header: 'Contact Person', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone', sortable: false },
    { key: 'payment_type', header: 'Payment Type', sortable: true,
      render: (value: string) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          {value?.replace('_', ' ').toUpperCase() || 'N/A'}
        </span>
      )
    },
    { key: 'is_active', header: 'Status', sortable: true, 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  // Add actions column to the columns array
  const columnsWithActions = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value: any, employer: Employer) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(employer)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditEmployer(employer)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteEmployer(employer.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employers Management</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Employer
        </Button>
      </div>

      {/* Company Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-semibold">89</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5 this month
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-semibold">67</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Briefcase className="h-3 w-3 mr-1" />
                  75.3% active rate
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Countries</p>
                <p className="text-2xl font-semibold">15</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Globe className="h-3 w-3 mr-1" />
                  Global reach
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Contract Value</p>
                <p className="text-2xl font-semibold">$45.2K</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  Per placement
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Top Performing Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { company: 'Dubai Construction Ltd', country: 'UAE', positions: 12, placements: 89, revenue: 234000, satisfaction: 4.8, retention: 94.2 },
                { company: 'Saudi Family Services', country: 'Saudi Arabia', positions: 8, placements: 67, revenue: 156700, satisfaction: 4.6, retention: 91.8 },
                { company: 'Qatar Industries Co', country: 'Qatar', positions: 10, placements: 78, revenue: 187200, satisfaction: 4.7, retention: 89.5 },
                { company: 'Kuwait Security Group', country: 'Kuwait', positions: 6, placements: 45, revenue: 98500, satisfaction: 4.9, retention: 96.1 }
              ].map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{item.company}</div>
                      <div className="text-sm text-muted-foreground">{item.country} • {item.positions} positions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">${item.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{item.placements} placements</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Satisfaction: {item.satisfaction}/5</span>
                    <span className="text-muted-foreground">Retention: {item.retention}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { method: 'Employer Funded', companies: 45, percentage: 50.6, avgValue: 52000, color: 'bg-blue-500' },
                { method: 'Candidate Funded', companies: 28, percentage: 31.5, avgValue: 38000, color: 'bg-green-500' },
                { method: 'Hybrid Model', companies: 16, percentage: 18.0, avgValue: 45000, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <div>
                        <div className="font-medium">{item.method}</div>
                        <div className="text-sm text-muted-foreground">{item.companies} companies</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.percentage}%</div>
                      <div className="text-sm text-muted-foreground">${item.avgValue.toLocaleString()} avg</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Market Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { region: 'GCC Countries', companies: 34, positions: 156, revenue: 1234000, growth: 15.2, marketShare: 42.3 },
              { region: 'Middle East', companies: 28, positions: 124, revenue: 987000, growth: 12.8, marketShare: 31.5 },
              { region: 'Asia Pacific', companies: 18, positions: 89, revenue: 756000, growth: 18.7, marketShare: 20.2 },
              { region: 'Europe', companies: 9, positions: 45, revenue: 234000, growth: 8.4, marketShare: 6.0 }
            ].map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-medium text-lg mb-2">{item.region}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Companies:</span>
                    <span>{item.companies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positions:</span>
                    <span>{item.positions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium text-green-600">${item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Growth:</span>
                    <span className="text-green-600">+{item.growth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Share:</span>
                    <span className="font-medium">{item.marketShare}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Company Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">High Risk Companies</h4>
              {[
                { company: 'ABC Trading Co', country: 'UAE', issue: 'Payment delays (45+ days)', risk: 'High' },
                { company: 'XYZ Services Ltd', country: 'Qatar', issue: 'License renewal pending', risk: 'Medium' },
                { company: 'Global Industries', country: 'Kuwait', issue: 'Contract disputes', risk: 'High' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                  <div>
                    <div className="font-medium text-sm">{item.company}</div>
                    <div className="text-xs text-muted-foreground">{item.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-red-600">{item.issue}</div>
                    <div className="text-xs text-muted-foreground">Risk: {item.risk}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Top Performers</h4>
              {[
                { company: 'Dubai Construction Ltd', country: 'UAE', metric: '98% on-time payments', score: 'A+' },
                { company: 'Saudi Family Services', country: 'Saudi Arabia', metric: '95% candidate retention', score: 'A' },
                { company: 'Qatar Industries', country: 'Qatar', metric: '92% contract renewals', score: 'A-' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div>
                    <div className="font-medium text-sm">{item.company}</div>
                    <div className="text-xs text-muted-foreground">{item.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-green-600">{item.metric}</div>
                    <div className="text-xs text-muted-foreground">Score: {item.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          placeholder="Search employers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <SmartTable
        data={getFilteredAndSortedEmployers()}
        columns={columnsWithActions}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={(field, direction) => {
          setSortField(field as keyof Employer);
          setSortDirection(direction);
        }}
        loading={loading}
      />

      {/* Employer Form Modal - Fullscreen */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background">
          <EmployerForm
            employer={selectedEmployer}
            onSave={selectedEmployer ? 
              async (formData) => {
                await handleUpdateEmployer(selectedEmployer.id, formData);
              } : 
              handleCreateEmployer
            }
            onCancel={() => {
              setShowForm(false);
              setSelectedEmployer(null);
            }}
            availablePositions={availablePositions}
            paymentTerms={paymentTerms}
          />
        </div>
      )}

      {/* Employer View Modal - Printable Bio Data */}
      {showViewModal && selectedEmployer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EmployerBioData
              employer={selectedEmployer}
              onClose={() => {
                setShowViewModal(false);
                setSelectedEmployer(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Employer Form Component with 2x2 Grid Layout
interface EmployerFormProps {
  employer: Employer | null;
  onSave: (data: EmployerFormData) => Promise<void>;
  onCancel: () => void;
  availablePositions: string[];
  paymentTerms: string[];
}

const EmployerForm: React.FC<EmployerFormProps> = ({
  employer,
  onSave,
  onCancel,
  availablePositions,
  paymentTerms
}) => {
  const [formData, setFormData] = useState<EmployerFormData>({
    company_name: employer?.company_name || '',
    contact_person: employer?.contact_person || '',
    phone: employer?.phone || '',
    email: employer?.email || '',
    country: employer?.country || '',
    license_number: employer?.license_number || '',
    payment_type: employer?.payment_type || 'employer_funded',
    logo_url: employer?.logo_url || '',
    is_active: employer?.is_active || true,
    positions_needed: employer?.positions_needed || []
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const isEdit = !!employer;

  const handleInputChange = (field: keyof EmployerFormData, value: any) => {
    if (field === 'is_active') {
      setFormData(prev => ({ ...prev, is_active: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Email validation function
  const handleEmailChange = (value: string) => {
    handleInputChange('email', value);
    setEmailWarning(null);
    
    if (isValidEmailFormat(value)) {
      const timeoutId = setTimeout(async () => {
        setCheckingEmail(true);
        try {
          const result = await checkEmailExists(value, undefined, 'employers');
          if (result.exists) {
            setEmailWarning(formatEmailError(result));
          }
        } catch (error) {
          console.error('Email validation error:', error);
        } finally {
          setCheckingEmail(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.company_name.trim()) {
      errors.company_name = 'Company name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.contact_person.trim()) {
      errors.contact = 'Contact person is required';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.license_number.trim()) {
      errors.license_number = 'License number is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{employer ? 'Edit Employer' : 'Create New Employer'}</h1>
            <p className="text-muted-foreground">
              {employer ? 'Update employer information and partnership details.' : 'Add a new receiving company to your network.'}
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
            
            {/* Top Left - Company Information */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Company Information</h3>
              
              <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Enter company name"
              />
              {validationErrors.company_name && (
                <p className="text-sm text-destructive">{validationErrors.company_name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  placeholder="Enter license number"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active Status</Label>
            </div>
          </div>
        </div>

        {/* Top Right - Contact Information */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold mb-4 text-blue-700">Contact Information</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                placeholder="Primary contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
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
                <p className="text-sm mt-1 flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {emailWarning}
                </p>
              )}
              {validationErrors.email && (
                <p className="text-sm text-destructive">{validationErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            
            {validationErrors.contact && (
              <p className="text-sm text-destructive">{validationErrors.contact}</p>
            )}
          </div>
        </div>

            {/* Bottom Left - Payment Details */}
            <div className="border rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold mb-4 text-green-700">Payment Details</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_type">Payment Type *</Label>
                  <Select value={formData.payment_type} onValueChange={(value) => handleInputChange('payment_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employer_funded">Employer Funded</SelectItem>
                      <SelectItem value="candidate_funded">Candidate Funded</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_upload">Company Logo</Label>
                  <div className="flex flex-col space-y-2">
                    <Input
                      id="logo_upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Create a preview URL for the uploaded file
                          const previewUrl = URL.createObjectURL(file);
                          handleInputChange('logo_url', previewUrl);
                          // Store the file for later upload
                          // You can add file upload logic here
                        }
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.logo_url && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src={formData.logo_url} 
                          alt="Company Logo Preview" 
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('logo_url', '')}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right - Status Information */}
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h4 className="font-semibold mb-4 text-yellow-700">Status Information</h4>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded border">
                  <p className="text-sm text-gray-600 mb-2">Company Status</p>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active_display"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active_display">
                      {formData.is_active ? 'Active Company' : 'Inactive Company'}
                    </Label>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-2">Payment Information</p>
                  <p className="text-sm text-blue-600">
                    Payment Type: <span className="font-medium">{formData.payment_type.replace('_', ' ').toUpperCase()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="col-span-2 px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {employer ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {employer ? 'Update Employer' : 'Create Employer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
);
};

// Employer Bio Data Component - Printable Format
interface EmployerBioDataProps {
  employer: Employer;
  onClose: () => void;
}

const EmployerBioData: React.FC<EmployerBioDataProps> = ({ employer, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white print-container">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hidden {
            display: none !important;
          }
          .bg-white {
            background: white !important;
          }
          .text-gray-900 { color: #111827 !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-green-600 { color: #059669 !important; }
          .text-red-600 { color: #dc2626 !important; }
          .text-blue-800 { color: #1e40af !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-blue-100 { background-color: #dbeafe !important; }
          .border-b { border-bottom: 1px solid #e5e7eb !important; }
          .border-t { border-top: 1px solid #e5e7eb !important; }
        }
      `}</style>
      {/* Header with Print Button */}
      <div className="flex justify-between items-center p-6 border-b print-hidden">
        <h2 className="text-2xl font-bold text-gray-900">Employer Bio Data</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div id="employer-bio-content" className="p-8 space-y-8">
        {/* Company Header */}
        <div className="text-center border-b pb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            {employer.logo_url && (
              <img 
                src={employer.logo_url} 
                alt="Company Logo" 
                className="h-16 w-16 object-cover rounded-lg border"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{employer.company_name}</h1>
              <p className="text-lg text-gray-600">{employer.license_number}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            {employer.is_active ? (
              <><CheckCircle className="h-5 w-5 text-green-600" /><span className="text-green-600 font-medium">Active Company</span></>
            ) : (
              <><XCircle className="h-5 w-5 text-red-600" /><span className="text-red-600 font-medium">Inactive Company</span></>
            )}
          </div>
        </div>

        {/* Company Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="space-y-4 pl-9">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Contact Person</p>
                  <p className="text-gray-900">{employer.contact_person}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Email Address</p>
                  <p className="text-gray-900">{employer.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Phone Number</p>
                  <p className="text-gray-900">{employer.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Country</p>
                  <p className="text-gray-900">{employer.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Business Information</h3>
            </div>
            
            <div className="space-y-4 pl-9">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">License Number</p>
                  <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{employer.license_number}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Payment Type</p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {employer.payment_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Registration Date</p>
                  <p className="text-gray-900">{new Date(employer.created_at || '').toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-9">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-700 mb-2">Company Status</p>
              <div className="flex items-center gap-2">
                {employer.is_active ? (
                  <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-green-600">Active</span></>
                ) : (
                  <><XCircle className="h-4 w-4 text-red-600" /><span className="text-red-600">Inactive</span></>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-700 mb-2">Payment Model</p>
              <p className="text-gray-900">{employer.payment_type?.replace('_', ' ') || 'Not specified'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-700 mb-2">Company ID</p>
              <p className="text-gray-900 font-mono text-sm">{employer.id}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-gray-500 text-sm">
          <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          <p className="mt-1">Recruitment Management System - Employer Bio Data</p>
        </div>
      </div>
    </div>
  );
};

// Employer Details Component
interface EmployerDetailsProps {
  employer: Employer;
  onClose: () => void;
}

const EmployerDetails: React.FC<EmployerDetailsProps> = ({ employer, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Employer Details</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Company Information</h4>
              <div className="space-y-2">
                <p><strong>Company:</strong> {employer.company_name}</p>
                <p><strong>Country:</strong> {employer.country}</p>
                <p><strong>License:</strong> {employer.license_number}</p>
                <p><strong>Status:</strong> 
                  <span className={`px-2 py-1 rounded text-xs font-medium ${employer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {employer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Contact Information</h4>
              <div className="space-y-2">
                <p><strong>Contact Person:</strong> {employer.contact_person}</p>
                <p><strong>Email:</strong> {employer.email}</p>
                <p><strong>Phone:</strong> {employer.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Partnership Details</h4>
              <div className="space-y-2">
                <p><strong>Payment Type:</strong> {employer.payment_type.replace('_', ' ').toUpperCase()}</p>
                {employer.logo_url && (
                  <p><strong>Logo:</strong> <a href={employer.logo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Logo</a></p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company Details</h4>
              <div className="space-y-2">
                <p><strong>Status:</strong> 
                  <span className={`px-2 py-1 rounded text-xs font-medium ml-2 ${employer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {employer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p><strong>Created:</strong> {employer.created_at ? new Date(employer.created_at).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Updated:</strong> {employer.updated_at ? new Date(employer.updated_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployersModule;
