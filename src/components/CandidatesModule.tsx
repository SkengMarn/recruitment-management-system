import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { checkEmailExists, formatEmailError, isValidEmailFormat } from '../utils/emailValidation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import SmartTable from './ui/smart-table';
import { 
  User, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Save, 
  X, 
  ChevronDown, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Clock, 
  FileText, 
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowUpDown,
  MoreVertical,
  Heart,
  Building2,
  UserPlus,
  Building,
  Globe,
  CreditCard,
  User as UserIcon
} from 'lucide-react';
import { APIClient } from '../utils/supabase/client';
import { StageValidator, STAGE_VALIDATION_RULES } from '../utils/stageValidation';
import InlineSelectCreate from './ui/inline-select-create';
import StageRequirementsPanel from './ui/StageRequirementsPanel';

const apiClient = new APIClient();

// Types
interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  passport_number: string;
  nin_number: string;
  next_of_kin: string;
  next_of_kin_contact: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
  address: string;
  agent_id: string;
  receiving_company_id: string;
  position_id?: string;
  job_id?: string;
  stage: string;
  education_level: string;
  work_experience: string;
  skills: string;
  notes: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

interface Agent {
  id: string;
  full_name: string;
  agency_name: string;
  email: string;
  phone: string;
  commission_rate: number;
  agency_country: string;
  created_at: string;
  updated_at: string;
}

interface Employer {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  created_at: string;
  updated_at: string;
}

interface Job {
  id: string;
  position_name: string;
  receiving_company_id: string;
  work_country: string;
  requested_headcount: number;
  salary?: number;
  salary_currency: string;
  contract_period: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CandidatesModule: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [receivingCompanies, setReceivingCompanies] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stageValidationErrors, setStageValidationErrors] = useState<string[]>([]);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Email validation function
  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    setEmailWarning(null);
    
    if (isValidEmailFormat(value)) {
      const timeoutId = setTimeout(async () => {
        setCheckingEmail(true);
        try {
          const result = await checkEmailExists(value, editingCandidate?.id, 'candidates');
          
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
  
  // Form data state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    passport_number: '',
    nin_number: '',
    next_of_kin: '',
    next_of_kin_contact: '',
    next_of_kin_phone: '',
    next_of_kin_relationship: '',
    address: '',
    agent_id: '',
    receiving_company_id: '',
    position_id: '',
    job_id: '',
    stage: 'passport',
    education_level: '',
    work_experience: '',
    skills: '',
    notes: '',
    photo_url: ''
  });

  // Validation errors state
  const [fieldValidationErrors, setFieldValidationErrors] = useState<Record<string, string>>({});
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Filter and pagination functions
  const getFilteredCandidates = () => {
    let filtered = candidates;

    // Apply global search
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.stage?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(candidate => {
          const value = candidate[column as keyof Candidate];
          return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    return filtered;
  };

  const getPaginatedCandidates = () => {
    const filtered = getFilteredCandidates();
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [candidatesData, agentsData, employersData, jobsData, documentsData] = await Promise.all([
        apiClient.getCandidates(),
        apiClient.getAgents(),
        apiClient.getEmployers(),
        apiClient.getJobs(),
        apiClient.getDocuments()
      ]);
      
      setCandidates(candidatesData.candidates || []);
      setAgents(agentsData.agents || []);
      setEmployers(employersData.employers || []);
      setReceivingCompanies(employersData.employers || []);
      setJobs(jobsData.jobs || []);
      setDocuments(documentsData.documents || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      nationality: '',
      passport_number: '',
      nin_number: '',
      next_of_kin: '',
      next_of_kin_contact: '',
      next_of_kin_phone: '',
      next_of_kin_relationship: '',
      address: '',
      agent_id: '',
      receiving_company_id: '',
      position_id: '',
      job_id: '',
      stage: 'passport',
      education_level: '',
      work_experience: '',
      skills: '',
      notes: '',
      photo_url: ''
    });
    setFieldValidationErrors({});
    setStageValidationErrors([]);
    setEditingCandidate(null);
  };

  const handleCreateCandidate = () => {
    resetForm();
    setShowCreateForm(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setFormData({
      full_name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      date_of_birth: candidate.date_of_birth,
      gender: candidate.gender,
      nationality: candidate.nationality,
      passport_number: candidate.passport_number,
      nin_number: candidate.nin_number,
      next_of_kin: candidate.next_of_kin,
      next_of_kin_contact: candidate.next_of_kin_contact,
      next_of_kin_phone: candidate.next_of_kin_phone || '',
      next_of_kin_relationship: candidate.next_of_kin_relationship,
      address: candidate.address,
      agent_id: candidate.agent_id,
      receiving_company_id: candidate.receiving_company_id,
      position_id: candidate.position_id || '',
      job_id: candidate.job_id || '',
      stage: candidate.stage,
      education_level: candidate.education_level || '',
      work_experience: candidate.work_experience || '',
      skills: candidate.skills || '',
      notes: candidate.notes || '',
      photo_url: candidate.photo_url || ''
    });
    setEditingCandidate(candidate);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    
    if (Object.keys(errors).length > 0) {
      setFieldValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setStageValidationErrors([]);
      
      // If updating a candidate and stage is changing, validate stage progression
      if (editingCandidate && editingCandidate.stage !== formData.stage) {
        const validation = await StageValidator.validateStageProgression(
          { ...editingCandidate, ...formData },
          editingCandidate.stage,
          formData.stage,
          documents
        );
        
        if (!validation.isValid) {
          StageValidator.showValidationErrors(validation);
          setStageValidationErrors([
            ...validation.errors,
            ...validation.missingRequirements.map(req => `Missing: ${req}`),
            ...validation.missingDocuments.map(doc => `Missing document: ${doc}`)
          ]);
          return;
        }
      }
      
      if (editingCandidate) {
        const updatedCandidate = await apiClient.updateCandidate(editingCandidate.id, formData);
        setCandidates(prev => prev.map(c => c.id === editingCandidate.id ? updatedCandidate.candidate : c));
        toast.success('Candidate updated successfully');
      } else {
        const newCandidate = await apiClient.createCandidate(formData);
        setCandidates(prev => [...prev, newCandidate.candidate]);
        toast.success('Candidate created successfully');
      }
      
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error('Failed to save candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await apiClient.deleteCandidate(candidateId);
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success('Candidate deleted successfully');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewDialogOpen(true);
  };

  const getStageColor = (stage: string) => {
    const colors = {
      passport: 'bg-blue-100 text-blue-800',
      medical: 'bg-yellow-100 text-yellow-800',
      visa: 'bg-purple-100 text-purple-800',
      travel: 'bg-orange-100 text-orange-800',
      deployed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const candidateColumns = [
    { 
      key: 'photo', 
      header: 'Photo', 
      label: 'Photo', 
      sortable: false,
      render: (value: any, candidate: Candidate) => (
        <div className="flex items-center justify-center">
          {candidate.photo_url ? (
            <img 
              src={candidate.photo_url} 
              alt={candidate.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200 ${candidate.photo_url ? 'hidden' : ''}`}>
            {candidate.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </div>
      )
    },
    { key: 'full_name', header: 'Name', label: 'Name', sortable: true },
    { key: 'phone', header: 'Phone', label: 'Phone', sortable: true },
    { key: 'email', header: 'Email', label: 'Email', sortable: true },
    { 
      key: 'stage', 
      header: 'Stage',
      label: 'Stage', 
      sortable: true,
      render: (value: string) => (
        <Badge className={getStageColor(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    { key: 'nationality', header: 'Destination Country', label: 'Destination Country', sortable: true },
    { key: 'created_at', header: 'Created', label: 'Created', sortable: true, render: (value: string) => new Date(value).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, candidate: Candidate) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewCandidate(candidate);
            }}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditCandidate(candidate);
            }}
            title="Edit Candidate"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this candidate?')) {
                handleDeleteCandidate(candidate.id);
              }
            }}
            title="Delete Candidate"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">Manage candidate profiles and recruitment stages</p>
        </div>
        <Button onClick={handleCreateCandidate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
          <CardDescription>
            View and manage all candidate profiles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-64"
                />
              </div>
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
                Showing {Math.min((currentPage - 1) * rowsPerPage + 1, getFilteredCandidates().length)} to{' '}
                {Math.min(currentPage * rowsPerPage, getFilteredCandidates().length)} of{' '}
                {getFilteredCandidates().length} results
              </span>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[400px] border rounded-lg">
            <div style={{ minWidth: '1130px' }}>
              <div className="bg-muted/30 sticky top-0 z-10">
                <table className="w-full caption-bottom text-sm table-fixed">
                  <colgroup>
                    <col style={{ width: '80px' }} /> {/* Photo */}
                    <col style={{ width: '180px' }} /> {/* Name */}
                    <col style={{ width: '140px' }} /> {/* Phone */}
                    <col style={{ width: '200px' }} /> {/* Email */}
                    <col style={{ width: '120px' }} /> {/* Stage */}
                    <col style={{ width: '150px' }} /> {/* Destination Country */}
                    <col style={{ width: '120px' }} /> {/* Created */}
                    <col style={{ width: '120px' }} /> {/* Actions */}
                  </colgroup>
                  <thead className="[&_tr]:border-b">
                    <tr className="data-[state=selected]:bg-muted transition-colors border-b-2 border-border hover:bg-transparent">
                      {candidateColumns.map((col) => (
                        <th
                          key={col.key}
                          className="text-foreground h-10 text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] border-r border-border last:border-r-0 px-4 py-3 font-semibold text-xs uppercase tracking-wide bg-muted/50 sticky top-0"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between cursor-pointer hover:text-primary">
                              <span>{col.header}</span>
                            </div>
                            {col.key !== 'photo' && col.key !== 'actions' && (
                              <Input
                                placeholder={`Filter...`}
                                value={columnFilters[col.key] || ''}
                                onChange={(e) => {
                                  setColumnFilters(prev => ({
                                    ...prev,
                                    [col.key]: e.target.value
                                  }));
                                  setCurrentPage(1);
                                }}
                                className="h-6 text-xs border-gray-300"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {getPaginatedCandidates().map((candidate, index) => (
                      <tr
                        key={candidate.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        {candidateColumns.map((col) => (
                          <td
                            key={col.key}
                            className="p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] border-r border-border last:border-r-0"
                          >
                            <div className="truncate overflow-hidden whitespace-nowrap" title={col.render ? undefined : String(candidate[col.key as keyof Candidate] || '')}>
                              {col.render ? col.render(candidate[col.key as keyof Candidate], candidate) : candidate[col.key as keyof Candidate]}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          {getFilteredCandidates().length > rowsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {Math.ceil(getFilteredCandidates().length / rowsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(getFilteredCandidates().length / rowsPerPage)))}
                  disabled={currentPage === Math.ceil(getFilteredCandidates().length / rowsPerPage)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog - Fullscreen Modal */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 z-50 bg-white flex flex-col"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0
          }}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b flex-shrink-0">
            <h2 className="text-xl font-semibold">
              {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingCandidate ? 'Update candidate information' : 'Create a new candidate profile'}
            </p>
          </div>
          
          {/* Modal Body with 2x2 Grid Layout */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="container-fluid h-full">
              <form onSubmit={handleSubmit}>
                {/* 2x2 Grid Layout */}
                <div className="grid grid-cols-2 gap-6 h-full">
                  
                  {/* Top Left - Personal Information */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Personal Information</h3>
                    <div className="space-y-3">
                      {/* Profile Photo Upload */}
                      <div className="flex flex-col items-center space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                        <div className="relative">
                          {formData.photo_url ? (
                            <img 
                              src={formData.photo_url} 
                              alt="Profile"
                              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-200">
                              {formData.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <input
                            type="file"
                            id="photo_upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  setFormData(prev => ({ ...prev, photo_url: result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label 
                            htmlFor="photo_upload"
                            className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </label>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Profile Photo</p>
                          <p className="text-xs text-gray-500">Click + to upload</p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter full name"
                        />
                        {fieldValidationErrors.full_name && (
                          <p className="text-sm text-destructive mt-1">{fieldValidationErrors.full_name}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                        {fieldValidationErrors.phone && (
                          <p className="text-sm text-destructive mt-1">{fieldValidationErrors.phone}</p>
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
                          <p className="text-sm mt-1 flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {emailWarning}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Top Right - Next of Kin Information */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Next of Kin Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="next_of_kin">Next of Kin Name</Label>
                        <Input
                          id="next_of_kin"
                          value={formData.next_of_kin}
                          onChange={(e) => setFormData(prev => ({ ...prev, next_of_kin: e.target.value }))}
                          placeholder="Enter next of kin name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="next_of_kin_phone">Next of Kin Phone</Label>
                        <Input
                          id="next_of_kin_phone"
                          value={formData.next_of_kin_phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, next_of_kin_phone: e.target.value }))}
                          placeholder="Enter next of kin phone"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="next_of_kin_relationship">Relationship</Label>
                        <Input
                          id="next_of_kin_relationship"
                          value={formData.next_of_kin_relationship}
                          onChange={(e) => setFormData(prev => ({ ...prev, next_of_kin_relationship: e.target.value }))}
                          placeholder="Enter relationship"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="nationality">Destination Country</Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                          placeholder="Enter destination country"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="passport_number">Passport Number</Label>
                        <Input
                          id="passport_number"
                          value={formData.passport_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, passport_number: e.target.value }))}
                          placeholder="Enter passport number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Left - Assignment Information */}
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Assignment Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="nin_number">NIN Number</Label>
                        <Input
                          id="nin_number"
                          value={formData.nin_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, nin_number: e.target.value }))}
                          placeholder="Enter NIN number"
                        />
                      </div>
                      
                      <div>
                        <InlineSelectCreate
                          value={formData.agent_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, agent_id: value }))}
                          items={agents}
                          displayField="agency_name"
                          placeholder="Select or create agent"
                          label="Agent"
                          createTitle="Create New Agent"
                          createDescription="Add a new agent to the system"
                          createFields={[
                            { key: 'agency_name', label: 'Agency Name', type: 'text', required: true },
                            { key: 'phone', label: 'Phone', type: 'tel' },
                            { key: 'email', label: 'Email', type: 'email' },
                            { key: 'agency_country', label: 'Country', type: 'text' },
                            { key: 'commission_rate', label: 'Commission Rate (%)', type: 'text' },
                            { key: 'photo_url', label: 'Photo URL', type: 'text' }
                          ]}
                          onCreateItem={async (data) => {
                            const agentData = {
                              ...data,
                              commission_rate: data.commission_rate ? parseFloat(data.commission_rate) / 100 : 0.1,
                              is_active: true
                            };
                            const response = await apiClient.createAgent(agentData);
                            const newAgent = response.agent || response;
                            setAgents(prev => [...prev, newAgent]);
                            return newAgent;
                          }}
                        />
                      </div>
                      
                      <div>
                        <InlineSelectCreate
                          value={formData.receiving_company_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, receiving_company_id: value }))}
                          items={employers}
                          displayField="company_name"
                          placeholder="Select or create company"
                          label="Receiving Company"
                          createTitle="Create New Company"
                          createDescription="Add a new receiving company to the system"
                          createFields={[
                            { key: 'company_name', label: 'Company Name', type: 'text', required: true },
                            { key: 'contact_person', label: 'Contact Person', type: 'text' },
                            { key: 'email', label: 'Email', type: 'email' },
                            { key: 'phone', label: 'Phone', type: 'tel' },
                            { key: 'country', label: 'Country', type: 'text' }
                          ]}
                          onCreateItem={async (data) => {
                            const response = await apiClient.createEmployer(data);
                            const newEmployer = response.employer || response;
                            setEmployers(prev => [...prev, newEmployer]);
                            return newEmployer;
                          }}
                        />
                      </div>

                      <div>
                        <InlineSelectCreate
                          value={formData.job_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, job_id: value }))}
                          items={jobs.filter(job => job.is_active)}
                          displayField="position_name"
                          placeholder="Select or create job"
                          label="Job Assignment"
                          createTitle="Create New Job"
                          createDescription="Add a new job position to the system"
                          createFields={[
                            { key: 'position_name', label: 'Position Name', type: 'text', required: true },
                            { key: 'work_country', label: 'Work Country', type: 'text', required: true },
                            { key: 'receiving_company_id', label: 'Company', type: 'select', required: true, options: employers.map(emp => ({ value: emp.id, label: emp.company_name })) },
                            { key: 'requested_headcount', label: 'Positions Needed', type: 'text', required: true },
                            { key: 'salary', label: 'Monthly Salary', type: 'text' },
                            { key: 'salary_currency', label: 'Currency', type: 'select', options: [
                              { value: 'USD', label: 'USD' },
                              { value: 'EUR', label: 'EUR' },
                              { value: 'GBP', label: 'GBP' },
                              { value: 'AED', label: 'AED' },
                              { value: 'SAR', label: 'SAR' }
                            ]},
                            { key: 'contract_period', label: 'Contract Period (months)', type: 'text' }
                          ]}
                          onCreateItem={async (data) => {
                            const jobData = {
                              ...data,
                              requested_headcount: parseInt(data.requested_headcount) || 1,
                              salary: data.salary ? parseFloat(data.salary) : null,
                              salary_currency: data.salary_currency || 'USD',
                              contract_period: parseInt(data.contract_period) || 24,
                              probation_period: 3,
                              min_age: 21,
                              max_age: 45,
                              accommodation: false,
                              food: false,
                              air_ticket: false,
                              transport: false,
                              medical_insurance: false,
                              employment_visa: false,
                              working_hours: '8 hours/day, 6 days/week',
                              is_active: true,
                              input_fee: null,
                              input_fee_currency: 'USD'
                            };
                            const response = await apiClient.createJob(jobData);
                            const newJob = response.job || response;
                            setJobs(prev => [...prev, newJob]);
                            return newJob;
                          }}
                        />
                      </div>

                      {/* Agent Payout Calculation - Always visible */}
                      <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                        <Label className="text-sm font-medium text-blue-800">Agent Payout Calculation</Label>
                        <div className="mt-2 space-y-1">
                          {formData.agent_id ? (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Base Salary:</span>
                                <span className="font-medium">$2,500</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Commission Rate:</span>
                                <span className="font-medium">10%</span>
                              </div>
                              <div className="border-t border-blue-200 pt-1 mt-2">
                                <div className="flex justify-between text-sm font-semibold text-blue-800">
                                  <span>Agent Payout:</span>
                                  <span>$250.00</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              Select an agent to see payout calculation
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="stage">Current Stage</Label>
                        <Select value={formData.stage} onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {editingCandidate ? (
                              // For editing, only show current stage and allowed next stages
                              <>
                                <SelectItem value={editingCandidate.stage}>
                                  {editingCandidate.stage.charAt(0).toUpperCase() + editingCandidate.stage.slice(1)} (Current)
                                </SelectItem>
                                {StageValidator.getNextAllowedStages(editingCandidate.stage).map(stage => (
                                  <SelectItem key={stage} value={stage}>
                                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                  </SelectItem>
                                ))}
                              </>
                            ) : (
                              // For new candidates, show all stages
                              <>
                                <SelectItem value="passport">Passport</SelectItem>
                                <SelectItem value="interview">Interview</SelectItem>
                                <SelectItem value="medical">Medical</SelectItem>
                                <SelectItem value="training">Training</SelectItem>
                                <SelectItem value="visa">Visa</SelectItem>
                                <SelectItem value="deployed">Deployed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        {editingCandidate && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Stage progression: {StageValidator.getStageDescription(editingCandidate.stage)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Right - Additional Information */}
                  <div className="border rounded-lg p-4 bg-yellow-50">
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Additional Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="education_level">Education Level</Label>
                        <Input
                          id="education_level"
                          value={formData.education_level}
                          onChange={(e) => setFormData(prev => ({ ...prev, education_level: e.target.value }))}
                          placeholder="Enter education level"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="work_experience">Work Experience</Label>
                        <Input
                          id="work_experience"
                          value={formData.work_experience}
                          onChange={(e) => setFormData(prev => ({ ...prev, work_experience: e.target.value }))}
                          placeholder="Enter work experience"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="skills">Skills</Label>
                        <Input
                          id="skills"
                          value={formData.skills}
                          onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                          placeholder="Enter skills (comma separated)"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                          id="notes"
                          className="w-full px-3 py-2 border rounded-md"
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Stage Requirements Panel - only show when editing */}
                {editingCandidate && (
                  <StageRequirementsPanel 
                    candidateData={{ ...editingCandidate, ...formData }}
                    documents={documents}
                    currentStage={editingCandidate.stage}
                  />
                )}

              </form>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 flex-shrink-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || checkingEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {editingCandidate ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingCandidate ? 'Update Candidate' : 'Create Candidate'}
                </>
              )}
            </Button>
          </div>

          {/* Validation Errors Display */}
          {stageValidationErrors.length > 0 && (
            <div className="px-6 py-4 border-t bg-red-50">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Stage Progression Requirements Not Met
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {stageValidationErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <p><strong>Name:</strong> {selectedCandidate.full_name}</p>
              <p><strong>Phone:</strong> {selectedCandidate.phone}</p>
              <p><strong>Email:</strong> {selectedCandidate.email}</p>
              <p><strong>Stage:</strong> {selectedCandidate.stage}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidatesModule;
