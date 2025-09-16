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
  agency_country: string;
  commission_rate: number;
  commission_type: 'percentage' | 'flat';
  commission_value: number;
  is_active: boolean;
  photo_url?: string;
  total_candidates?: number;
  successful_placements?: number;
  total_earned?: number;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  contact_person?: string;
  address?: string;
}

interface AgentBioDataModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

const AgentBioDataModal: React.FC<AgentBioDataModalProps> = ({ agent, isOpen, onClose }) => {
  const [isPrintView, setIsPrintView] = useState(false);
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includePerformance, setIncludePerformance] = useState(true);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const handlePrint = () => {
    setIsPrintView(true);
    setTimeout(() => {
      window.print();
      setIsPrintView(false);
    }, 100);
  };

  const handleDownloadPDF = () => {
    setIsPrintView(true);
    setTimeout(() => {
      window.print();
      setIsPrintView(false);
    }, 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${pageOrientation === 'landscape' ? 'landscape-mode' : ''}`}>
        {/* Modal Header - No Print */}
        <div className="no-print flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">Agent Bio Data - {agent.agency_name}</h2>
            <Badge variant={agent.is_active ? "default" : "secondary"}>
              {agent.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
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

          {/* Print Settings */}
          <div className="print:hidden border rounded-lg p-4 bg-gray-50 mb-4">
            <div className="flex items-center gap-4 mb-3">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Print Settings</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-financials" 
                  checked={includeFinancials}
                  onCheckedChange={setIncludeFinancials}
                />
                <Label htmlFor="include-financials">Include Financial Details</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-performance" 
                  checked={includePerformance}
                  onCheckedChange={setIncludePerformance}
                />
                <Label htmlFor="include-performance">Include Performance Metrics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="orientation">Page Orientation:</Label>
                <Select value={pageOrientation} onValueChange={(value: 'portrait' | 'landscape') => setPageOrientation(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            {/* Bio Data Content */}
                    src={agent.photo_url} 
                    alt={agent.agency_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{agent.agency_name}</h1>
                  <Badge variant={agent.is_active ? "default" : "secondary"}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-lg text-gray-600 mb-3">Agent ID: {agent.agency_id}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{agent.agency_country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Joined: {formatDate(agent.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-900">{agent.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-gray-900">{agent.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p className="text-gray-900">{agent.agency_country || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Person</p>
                    <p className="text-gray-900">{agent.contact_person || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Agent Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge variant={agent.is_active ? "default" : "secondary"} className="mt-1">
                      {agent.is_active ? 'Active Agent' : 'Inactive Agent'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration Date</p>
                    <p className="text-gray-900">{formatDate(agent.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-gray-900">{formatDate(agent.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {includePerformance && (
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg print:bg-gray-50">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{agent.total_candidates || 0}</p>
                    <p className="text-sm text-gray-600">Total Candidates</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg print:bg-gray-50">
                    <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{agent.successful_placements || 0}</p>
                    <p className="text-sm text-gray-600">Successful Placements</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg print:bg-gray-50">
                    <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{calculateSuccessRate()}</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg print:bg-gray-50">
                    <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(agent.total_earned || 0)}</p>
                    <p className="text-sm text-gray-600">Total Earned</p>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Details */}
            {includeFinancials && (
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Commission Rate</p>
                    <p className="text-lg font-semibold text-gray-900">{(agent.commission_rate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Commission Type</p>
                    <Badge variant="outline" className="mt-1">
                      {agent.commission_type === 'percentage' ? 'Percentage' : 'Flat Rate'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Commission Value</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {agent.commission_type === 'percentage' 
                        ? `${(agent.commission_value * 100).toFixed(1)}%`
                        : formatCurrency(agent.commission_value)
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Section */}
            {(agent.notes || agent.address) && (
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                {agent.address && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-700">{agent.address}</p>
                  </div>
                )}
                {agent.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{agent.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 border-t pt-4 print:mt-8">
              <p>Agent Bio Data Report - Generated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p className="mt-1">Recruitment Management System</p>
            </div>
        </div>
        <p className="text-lg text-gray-600 mb-3">Agent ID: {agent.agency_id}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{agent.agency_country}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Joined: {formatDate(agent.created_at)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Contact Information */}
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Contact Information
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Email Address</p>
            <p className="text-gray-900">{agent.email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone Number</p>
            <p className="text-gray-900">{agent.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Country</p>
            <p className="text-gray-900">{agent.agency_country || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Contact Person</p>
            <p className="text-gray-900">{agent.contact_person || 'Not provided'}</p>
          </div>
        </div>
      </div>
          
          .print\\:landscape {
            transform: rotate(90deg);
            transform-origin: center;
          }
          
          .print\\:portrait {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default AgentBioDataModal;
