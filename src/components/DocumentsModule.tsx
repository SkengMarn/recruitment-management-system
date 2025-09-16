import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import SmartTable from './ui/SmartTable';
import SQLResultsTable from './SQLResultsTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Building,
  FileCheck,
  FileX,
  TrendingUp,
  BarChart3,
  Shield,
  Activity,
  Target,
  RefreshCw,
  AlertCircle,
  Plus,
  File,
  Image,
  X,
  Edit,
  Database,
  Play
} from 'lucide-react';
import { InfoTooltip } from './ui/info-tooltip';
import { apiClient } from '../utils/supabase/client';
import InlineSelectCreate from './ui/inline-select-create';
import { toast } from 'sonner';

interface DocumentType {
  id: number;
  candidate_id: string;
  doc_type: string;
  doc_name: string;
  doc_url: string;
  file_size: number;
  mime_type: string;
  is_verified: number | boolean;
  uploaded_at: string;
  expiry_date: string | null;
  uploaded_by: string;
  verified_by: string | null;
  verified_at: string | null;
  // Legacy fields for backward compatibility
  name?: string;
  type?: string;
  status?: string;
  upload_date?: string;
}

const DocumentsModule = () => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    candidate_id: '',
    doc_type: '',
    doc_name: '',
    file: null as File | null
  });
  
  // SQL Query state
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResults, setSqlResults] = useState<any[]>([]);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('management');
  const [previewDocument, setPreviewDocument] = useState<DocumentType | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add missing handler functions
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Handle document upload logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
      setIsDialogOpen(false);
      fetchDocuments();
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file) => {
    setFormData(prev => ({ ...prev, file }));
  };



  useEffect(() => {
    fetchDocuments();
    // Set default SQL query for documents - simplified without aliases
    setSqlQuery(`-- Query all documents (basic query)
SELECT 
  id,
  candidate_id,
  doc_type,
  doc_name,
  doc_url,
  file_size,
  mime_type,
  is_verified,
  uploaded_at,
  expiry_date,
  uploaded_by
FROM documents
ORDER BY uploaded_at DESC
LIMIT 50;`);
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const [docsResponse, candidatesResponse] = await Promise.all([
        apiClient.getDocuments(),
        apiClient.getCandidates()
      ]);
      setDocuments(docsResponse.documents || []);
      setCandidates(candidatesResponse.candidates || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (documentId: string) => {
    try {
      console.log('Starting verification for document ID:', documentId);
      setLoading(true);
      
      const result = await apiClient.verifyDocument(documentId, { verified_by: 'current_user' });
      console.log('Verification result:', result);
      
      toast.success('Document verified successfully');
      await fetchDocuments();
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error(`Failed to verify document: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = (doc: DocumentType) => {
    if (doc.mime_type?.startsWith('image/')) {
      // For images, show in modal
      setPreviewDocument(doc);
    } else {
      // For non-images, open in new tab or download
      if (doc.doc_url.startsWith('http')) {
        window.open(doc.doc_url, '_blank');
      } else {
        toast.info('Document preview not available. Use download instead.');
      }
    }
  };

  const handleDownloadDocument = (doc: DocumentType) => {
    if (doc.doc_url.startsWith('http')) {
      const link = document.createElement('a');
      link.href = doc.doc_url;
      link.download = doc.doc_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Document download not available');
    }
  };

  const [editingDocument, setEditingDocument] = useState<any>(null);

  // Document Preview Component
  const DocumentPreview = ({ document }: { document: DocumentType }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

    useEffect(() => {
      setLoading(true);
      setError(null);
      setConvertedUrl(null);
      
      // Simulate loading delay
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }, [document]);

    const renderPreview = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Loading document...</p>
            </div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 font-medium">Preview Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        );
      }

      // Handle different file types
      const mimeType = document.mime_type?.toLowerCase() || '';
      const fileExt = document.doc_name?.split('.').pop()?.toLowerCase() || '';

      // Images
      if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
        return (
          <div className="flex justify-center bg-gray-50 rounded-lg p-4">
            <img 
              src={document.doc_url} 
              alt={document.doc_name}
              className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
              onError={() => setError('Failed to load image')}
            />
          </div>
        );
      }

      // PDFs
      if (mimeType === 'application/pdf' || fileExt === 'pdf') {
        return (
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <iframe
              src={`${document.doc_url}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-96 border-0"
              title={document.doc_name}
              onError={() => setError('PDF preview not available')}
            />
            <div className="p-2 bg-gray-100 text-xs text-gray-600 text-center">
              PDF Preview - Use browser controls to navigate
            </div>
          </div>
        );
      }

      // Word Documents
      if (mimeType.includes('word') || mimeType.includes('document') || 
          ['doc', 'docx'].includes(fileExt)) {
        // Try Office Online Viewer
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.doc_url)}`;
        
        return (
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <iframe
              src={officeViewerUrl}
              className="w-full h-96 border-0"
              title={document.doc_name}
              onError={() => setError('Word document preview not available')}
            />
            <div className="p-2 bg-blue-100 text-xs text-blue-700 text-center">
              Word Document Preview via Office Online
            </div>
          </div>
        );
      }

      // Excel/Spreadsheets
      if (mimeType.includes('sheet') || mimeType.includes('excel') || 
          ['xls', 'xlsx', 'csv'].includes(fileExt)) {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.doc_url)}`;
        
        return (
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <iframe
              src={officeViewerUrl}
              className="w-full h-96 border-0"
              title={document.doc_name}
              onError={() => setError('Spreadsheet preview not available')}
            />
            <div className="p-2 bg-green-100 text-xs text-green-700 text-center">
              Spreadsheet Preview via Office Online
            </div>
          </div>
        );
      }

      // PowerPoint
      if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(fileExt)) {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.doc_url)}`;
        
        return (
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <iframe
              src={officeViewerUrl}
              className="w-full h-96 border-0"
              title={document.doc_name}
              onError={() => setError('Presentation preview not available')}
            />
            <div className="p-2 bg-purple-100 text-xs text-purple-700 text-center">
              Presentation Preview via Office Online
            </div>
          </div>
        );
      }

      // Text files
      if (mimeType.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'csv'].includes(fileExt)) {
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="bg-white rounded border p-4 font-mono text-sm max-h-96 overflow-auto">
              <iframe
                src={document.doc_url}
                className="w-full h-80 border-0"
                title={document.doc_name}
                onError={() => setError('Text file preview not available')}
              />
            </div>
          </div>
        );
      }

      // Fallback for unsupported formats
      return (
        <div className="bg-yellow-50 rounded-lg p-8 text-center border border-yellow-200">
          <FileText className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="font-semibold text-yellow-900 mb-2">{document.doc_name}</h3>
          <p className="text-yellow-700 mb-4">
            Preview not available for {mimeType || fileExt.toUpperCase()} files
          </p>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>File Type: {mimeType || 'Unknown'}</p>
            <p>Size: {(document.file_size / 1024).toFixed(1)} KB</p>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-blue-800 text-sm font-medium mb-2">Alternative Options:</p>
            <div className="flex gap-2 justify-center">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(document.doc_url, '_blank')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Open Externally
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleDownloadDocument(document)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {renderPreview()}
        
        {/* Document Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <p className="text-gray-600">{document.doc_type}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Size:</span>
            <p className="text-gray-600">{(document.file_size / 1024).toFixed(1)} KB</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Format:</span>
            <p className="text-gray-600">{document.mime_type || 'Unknown'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <Badge variant={document.is_verified ? 'default' : 'secondary'}>
              {document.is_verified ? 'Verified' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const handleEditDocument = async (document: any) => {
    // Open edit dialog with document data
    setEditingDocument(document);
    setShowUploadDialog(true);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      setLoading(true);
      await apiClient.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const executeSqlQuery = async () => {
    if (!sqlQuery.trim()) {
      setSqlError('Please enter a SQL query');
      return;
    }

    try {
      setSqlLoading(true);
      setSqlError(null);
      
      // Try to execute SQL query through API
      const response = await apiClient.executeSQLQuery(sqlQuery);
      setSqlResults(response.data || []);
      
      if (response.data?.length === 0) {
        setSqlError('Query executed successfully but returned no results. The documents table may be empty or not exist yet.');
      }
    } catch (err) {
      console.error('SQL query failed:', err);
      let errorMessage = err.message || 'Failed to execute SQL query';
      
      // Handle specific database errors
      if (errorMessage.includes('not an embedded resource') || 
          errorMessage.includes('does not exist') ||
          errorMessage.includes('404') ||
          errorMessage.includes('endpoint')) {
        setSqlError('SQL execution is not available yet. This feature requires database setup. Please use the sample data below to test the interface.');
        
        // Load sample data automatically when SQL fails
        setSqlResults([
          {
            id: 1,
            candidate_id: 'CND-001',
            doc_type: 'passport',
            doc_name: 'passport_john_doe.pdf',
            doc_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            file_size: 2048576,
            mime_type: 'application/pdf',
            is_verified: 1,
            uploaded_at: '2024-01-15 10:30:00',
            expiry_date: '2030-06-15',
            uploaded_by: 'admin',
            verified_by: 'system',
            verified_at: '2024-01-15 11:00:00'
          },
          {
            id: 2,
            candidate_id: 'CND-002',
            doc_type: 'medical_certificate',
            doc_name: 'medical_jane_smith.pdf',
            doc_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            file_size: 1536000,
            mime_type: 'application/pdf',
            is_verified: 0,
            uploaded_at: '2024-01-20 14:15:00',
            expiry_date: '2025-01-20',
            uploaded_by: 'agent_user',
            verified_by: null,
            verified_at: null
          },
          {
            id: 3,
            candidate_id: 'CND-003',
            doc_type: 'photo',
            doc_name: 'photo_david_wilson.jpg',
            doc_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face',
            file_size: 256000,
            mime_type: 'image/jpeg',
            is_verified: 1,
            uploaded_at: '2024-02-01 09:00:00',
            expiry_date: null,
            uploaded_by: null,
            verified_by: null,
            verified_at: '2024-02-01 09:30:00'
          }
        ]);
        return;
      } else if (errorMessage.includes('syntax error')) {
        errorMessage = 'SQL syntax error. Please check your query syntax.';
      }
      
      setSqlError(errorMessage);
      setSqlResults([]);
    } finally {
      setSqlLoading(false);
    }
  };

  const handleSqlRefresh = () => {
    executeSqlQuery();
  };

  const getStatusBadge = (status) => {
    const colors = {
      'verified': 'bg-green-100 text-green-800',
      'pending_verification': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[status] || colors.pending_verification}>{status.replace('_', ' ')}</Badge>;
  };

  const getDocumentIcon = (type) => {
    const icons = {
      'passport': <FileText className="h-4 w-4 text-blue-600" />,
      'medical_certificate': <FileCheck className="h-4 w-4 text-green-600" />,
      'training_certificate': <FileText className="h-4 w-4 text-purple-600" />,
      'visa': <FileText className="h-4 w-4 text-indigo-600" />,
      'photo': <FileText className="h-4 w-4 text-orange-600" />
    };
    return icons[type] || <FileText className="h-4 w-4 text-gray-600" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'passport': 'Passport',
      'medical_certificate': 'Medical Certificate',
      'training_certificate': 'Training Certificate',
      'visa': 'Visa Document',
      'photo': 'Photograph'
    };
    return labels[type] || type;
  };

  // Calculate statistics
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(d => d.is_verified === 1 || d.is_verified === true || d.status === 'verified').length;
  const pendingDocuments = documents.filter(d => d.status === 'pending_verification' || d.is_verified === 0 || d.is_verified === false).length;
  const rejectedDocuments = documents.filter(d => d.status === 'rejected').length;

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      (doc.name || doc.doc_name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.type || doc.doc_type)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.candidate_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const docType = doc.type || doc.doc_type;
    const docStatus = doc.status || (doc.is_verified ? 'verified' : 'pending_verification');
    const matchesFilter = selectedFilter === 'all' || docType === selectedFilter || docStatus === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading documents...</span>
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
              <Button onClick={fetchDocuments} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Document Management</h1>
          <p className="text-muted-foreground mt-1">Manage candidate documents and verification</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchDocuments} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-action="upload-document">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a new document for a candidate
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate">Candidate</Label>
                  <Input
                    id="candidate"
                    value={formData.candidate_id}
                    onChange={(e) => handleInputChange('candidate_id', e.target.value)}
                    placeholder="Select candidate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc_type">Document Type</Label>
                  <Input
                    id="doc_type"
                    value={formData.doc_type}
                    onChange={(e) => handleInputChange('doc_type', e.target.value)}
                    placeholder="Enter document type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc_name">Document Name</Label>
                  <Input
                    id="doc_name"
                    value={formData.doc_name}
                    onChange={(e) => handleInputChange('doc_name', e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Document Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-semibold">{documents.length}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="management">Document Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="management" className="space-y-6">
              <SmartTable
                data={documents}
                columns={[
                  { key: 'doc_name', header: 'Document Name' },
                  { key: 'doc_type', header: 'Type' },
                  { key: 'candidate_id', header: 'Candidate' }
                ]}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Analytics content would go here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Preview Modal */}
      {previewDocument && (
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {previewDocument.doc_name}
              </DialogTitle>
              <DialogDescription>
                {previewDocument.doc_type} • {(previewDocument.file_size / 1024).toFixed(1)} KB • {previewDocument.mime_type}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Document preview would appear here</p>
                <p className="text-xs text-gray-500 mt-1">File: {previewDocument.doc_name}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => handleDownloadDocument(previewDocument)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {!previewDocument.is_verified && (
                <Button 
                  onClick={() => {
                    handleVerifyDocument(previewDocument.id.toString());
                    setPreviewDocument(null);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Verified
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default DocumentsModule;