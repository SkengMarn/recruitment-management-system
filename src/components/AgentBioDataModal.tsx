import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Printer, Download, Settings, User, Mail, Phone, MapPin, Calendar, Star, TrendingUp, Users, DollarSign, X } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Agent {
  id: string;
  agency_name: string;
  agency_id: string;
  phone?: string;
  email?: string;
  agency_country?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  photo_url?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'flat';
  commission_value: number;
  notes?: string;
  address?: string;
  contact_person?: string;
  total_candidates?: number;
  successful_placements?: number;
  total_earned?: number;
}

interface AgentBioDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

const AgentBioDataModal: React.FC<AgentBioDataModalProps> = ({ isOpen, onClose, agent }) => {
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includePerformance, setIncludePerformance] = useState(true);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateSuccessRate = () => {
    if (!agent.total_candidates || agent.total_candidates === 0) return '0%';
    const rate = ((agent.successful_placements || 0) / agent.total_candidates) * 100;
    return `${rate.toFixed(1)}%`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header - Title and Controls on separate lines */}
        <div className="no-print border-b bg-gray-50">
          {/* Title Row */}
          <div className="flex items-center gap-4 p-6 pb-3">
            <h2 className="text-2xl font-semibold">Agent Bio Data - {agent.agency_name}</h2>
            <Badge variant={agent.is_active ? "default" : "secondary"}>
              {agent.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {/* Controls Row */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-financials" 
                checked={includeFinancials}
                onCheckedChange={setIncludeFinancials}
              />
              <Label htmlFor="include-financials" className="text-sm">Include Financial Detail</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={pageOrientation} onValueChange={(value: 'portrait' | 'landscape') => setPageOrientation(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print View
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="default" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-gray-50 p-6">
          <div className="bg-white rounded-lg shadow-sm print-content">
            {/* Document Header */}
            <div className="bg-gray-900 text-white p-4 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-1">AGENT BIO DATA</h1>
                  <p className="text-gray-300 text-sm">ID: {agent.agency_id} | Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold">{agent.agency_name}</h2>
                  <p className="text-gray-300 text-sm">AGENT PROFILE</p>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="p-6 space-y-6">
              {/* Executive Summary */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Executive Summary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Agent Photo */}
                  <div className="flex justify-center md:justify-start">
                    {agent.photo_url ? (
                      <img 
                        src={agent.photo_url} 
                        alt={agent.agency_name}
                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Agent Details */}
                  <div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Agent:</p>
                        <p className="font-semibold">{agent.agency_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Work Country:</p>
                        <p>{agent.agency_country || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Person:</p>
                        <p>{agent.contact_person || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Registration & Status */}
                  <div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Registration:</p>
                        <p>{formatDate(agent.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Commission Rate:</p>
                        <p>{(agent.commission_rate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status:</p>
                        <Badge variant={agent.is_active ? "default" : "secondary"} className="bg-blue-600">
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Performance & Operational Summary */}
              {includePerformance && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Performance & Operational Summary</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Candidates</p>
                      <p className="text-2xl font-bold text-blue-600">{agent.total_candidates || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Successful Placements</p>
                      <p className="text-2xl font-bold text-green-600">{agent.successful_placements || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-600">{calculateSuccessRate()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information & Financial Breakdown */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Contact Information & Financial Breakdown</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Contact Details</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Email Address:</p>
                        <p className="font-medium">{agent.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone Number:</p>
                        <p className="font-medium">{agent.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address:</p>
                        <p className="font-medium">{agent.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {includeFinancials && (
                    <div>
                      <h4 className="font-medium mb-3">Commission Structure</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Commission Rate:</p>
                          <p className="font-medium">{(agent.commission_rate * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Commission Type:</p>
                          <p className="font-medium">{agent.commission_type === 'percentage' ? 'Percentage' : 'Flat Rate'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Earnings:</p>
                          <p className="font-medium text-green-600">{formatCurrency(agent.total_earned || 0)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {agent.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold">Additional Information</h3>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{agent.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden !important;
          }
          
          .print-content,
          .print-content * {
            visibility: visible !important;
          }
          
          .print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          @page {
            size: ${pageOrientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
            margin: 1cm;
          }
          
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          .bg-gray-50 {
            background-color: white !important;
          }
          
          .bg-gray-900 {
            background-color: #1f2937 !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .text-white {
            color: white !important;
          }
          
          .bg-blue-50,
          .bg-green-50,
          .bg-purple-50,
          .bg-orange-50 {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }
          
          .shadow-xl,
          .shadow-sm {
            box-shadow: none !important;
          }
          
          .rounded-lg,
          .rounded-t-lg {
            border-radius: 0 !important;
          }
          
          .p-6,
          .p-4 {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentBioDataModal;
