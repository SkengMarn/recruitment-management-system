import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  X, 
  Download, 
  Printer, 
  Building, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign,
  FileText,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

// Enhanced Job interface with all required fields
interface JobOrderData {
  id: string;
  position_name: string;
  receiving_company_id: string;
  receiving_company_name?: string;
  work_country: string;
  requested_headcount: number;
  salary?: number;
  salary_currency: string;
  input_fee?: number;
  input_fee_currency: string;
  markup_agency?: number;
  markup_agency_type?: 'flat' | 'percentage';
  markup_company?: number;
  markup_company_type?: 'flat' | 'percentage';
  final_fee?: number;
  contract_period: number;
  probation_period: number;
  min_age: number;
  max_age: number;
  accommodation: boolean;
  food: boolean;
  air_ticket: boolean;
  transport: boolean;
  medical_insurance: boolean;
  employment_visa: boolean;
  working_hours: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  payment_type?: 'employer_funded' | 'candidate_funded' | 'hybrid';
  // Additional fields for comprehensive job order
  job_description?: string;
  start_date?: string;
  assigned_agents?: string[];
  candidates_sourced?: number;
  candidates_shortlisted?: number;
  candidates_assigned?: number;
}

interface JobOrderModalProps {
  job: JobOrderData;
  isOpen: boolean;
  onClose: () => void;
}

const JobOrderModal: React.FC<JobOrderModalProps> = ({ job, isOpen, onClose }) => {
  const [includeFinancialDetail, setIncludeFinancialDetail] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [printView, setPrintView] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Exchange rate conversion (simplified - in real app, fetch from API)
  const convertToUGX = (amount: number, currency: string): number => {
    const rates: { [key: string]: number } = {
      'USD': 3700,
      'EUR': 4000,
      'GBP': 4500,
      'UGX': 1,
      'SAR': 987,
      'AED': 1007,
      'QAR': 1016
    };
    return amount * (rates[currency] || 1);
  };

  // Calculate financial breakdown
  const calculateFinancials = () => {
    const inputFeeUGX = job.input_fee ? convertToUGX(job.input_fee, job.input_fee_currency) : 0;
    
    let agencyMarkupUGX = 0;
    if (job.markup_agency) {
      if (job.markup_agency_type === 'percentage') {
        agencyMarkupUGX = inputFeeUGX * (job.markup_agency / 100);
      } else {
        agencyMarkupUGX = job.markup_agency;
      }
    }
    
    let companyMarkupUGX = 0;
    if (job.markup_company) {
      if (job.markup_company_type === 'percentage') {
        companyMarkupUGX = inputFeeUGX * (job.markup_company / 100);
      } else {
        companyMarkupUGX = job.markup_company;
      }
    }

    let finalFeeUGX = 0;
    switch (job.payment_type) {
      case 'employer_funded':
        finalFeeUGX = agencyMarkupUGX;
        break;
      case 'candidate_funded':
        finalFeeUGX = inputFeeUGX + companyMarkupUGX;
        break;
      case 'hybrid':
      default:
        finalFeeUGX = inputFeeUGX + agencyMarkupUGX + companyMarkupUGX;
    }

    return {
      inputFeeUGX,
      agencyMarkupUGX,
      companyMarkupUGX,
      finalFeeUGX,
      totalRevenue: finalFeeUGX * job.requested_headcount,
      perCandidateMargin: finalFeeUGX * 0.3, // Assuming 30% margin
      totalMargin: finalFeeUGX * job.requested_headcount * 0.3
    };
  };

  const financials = calculateFinancials();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      // Simple PDF generation using browser print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Job Order - ${job.position_name}</title>
              <style>
                ${getPrintStyles()}
              </style>
            </head>
            <body>
              ${modalRef.current?.innerHTML || ''}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success('PDF generation initiated');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const getPrintStyles = () => `
    @media print {
      body { 
        font-family: Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.4;
        color: #000;
        background: white;
      }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      .avoid-break { page-break-inside: avoid; }
      table { 
        border-collapse: collapse;
        width: 100%;
        margin: 10px 0;
      }
      th, td { 
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }
      th { 
        background-color: #f0f0f0;
        font-weight: bold;
      }
      h1 { font-size: 18pt; margin: 20px 0 10px 0; }
      h2 { font-size: 14pt; margin: 15px 0 8px 0; }
      h3 { font-size: 12pt; margin: 10px 0 5px 0; }
      .header { text-align: center; margin-bottom: 30px; }
      .footer { 
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
        font-size: 10pt;
        border-top: 1px solid #000;
        padding: 10px 0;
      }
    }
  `;

  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${orientation === 'landscape' ? 'landscape-mode' : ''}`}>
        {/* Modal Header - No Print */}
        <div className="no-print flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">Job Order - {job.position_name}</h2>
            <Badge variant={job.is_active ? "default" : "secondary"}>
              {job.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="financial-detail"
                checked={includeFinancialDetail}
                onCheckedChange={setIncludeFinancialDetail}
              />
              <Label htmlFor="financial-detail" className="text-sm">Include Financial Detail</Label>
            </div>
            
            <Select value={orientation} onValueChange={(value: 'portrait' | 'landscape') => setOrientation(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setPrintView(!printView)}>
              {printView ? 'Normal View' : 'Print View'}
            </Button>
            
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div 
          ref={modalRef}
          className={`overflow-y-auto max-h-[calc(90vh-80px)] p-6 ${printView ? 'print-optimized' : ''}`}
        >
          {/* Header Section */}
          <div className="header text-center mb-8 avoid-break">
            <div className="flex justify-between items-start mb-4">
              <div className="text-left">
                <h1 className="text-2xl font-bold">JOB ORDER</h1>
                <p className="text-sm text-gray-600">ID: {job.id}</p>
                <p className="text-sm text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{job.receiving_company_name}</div>
                <Badge 
                  variant={job.payment_type === 'employer_funded' ? 'default' : 
                          job.payment_type === 'candidate_funded' ? 'secondary' : 'outline'}
                  className="mt-2"
                >
                  {job.payment_type?.replace('_', ' ').toUpperCase() || 'HYBRID'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <section className="mb-8 avoid-break">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Executive Summary
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-gray-700">Position:</label>
                  <p className="text-lg">{job.position_name}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Work Country:</label>
                  <p>{job.work_country}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Employer:</label>
                  <p>{job.receiving_company_name}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-gray-700">Headcount:</label>
                  <p className="text-lg font-semibold">{job.requested_headcount} positions</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Contract Period:</label>
                  <p>{job.contract_period} months</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Status:</label>
                  <Badge variant={job.is_active ? "default" : "secondary"}>
                    {job.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          {/* Talent & Operational Summary */}
          <section className="mb-8 avoid-break">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Talent & Operational Summary
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Candidate Profile</h3>
                <ul className="space-y-1 text-sm">
                  <li>Age Range: {job.min_age} - {job.max_age} years</li>
                  <li>Working Hours: {job.working_hours}</li>
                  <li>Probation Period: {job.probation_period} months</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Recruitment Progress</h3>
                <ul className="space-y-1 text-sm">
                  <li>Candidates Sourced: {job.candidates_sourced || 0}</li>
                  <li>Shortlisted: {job.candidates_shortlisted || 0}</li>
                  <li>Assigned: {job.candidates_assigned || 0}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Benefits Package */}
          <section className="mb-8 avoid-break">
            <h3 className="font-medium mb-3">Benefits & Allowances</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'accommodation', label: 'Accommodation', value: job.accommodation },
                { key: 'food', label: 'Food', value: job.food },
                { key: 'air_ticket', label: 'Air Ticket', value: job.air_ticket },
                { key: 'transport', label: 'Transport', value: job.transport },
                { key: 'medical_insurance', label: 'Medical Insurance', value: job.medical_insurance },
                { key: 'employment_visa', label: 'Employment Visa', value: job.employment_visa }
              ].map(benefit => (
                <div key={benefit.key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded border ${benefit.value ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">{benefit.label}</span>
                </div>
              ))}
            </div>
          </section>

          {includeFinancialDetail && (
            <>
              {/* Page Break */}
              <div className="page-break"></div>
              
              {/* Compensation & Financial Breakdown */}
              <section className="mb-8 avoid-break">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Compensation & Financial Breakdown
                </h2>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium mb-3">Candidate Compensation</h3>
                    <table className="w-full border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">Monthly Salary</td>
                          <td className="border border-gray-300 p-2">{job.salary ? formatCurrency(job.salary, job.salary_currency) : 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">In UGX</td>
                          <td className="border border-gray-300 p-2">{job.salary ? formatCurrency(convertToUGX(job.salary, job.salary_currency)) : 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Service Fees</h3>
                    <table className="w-full border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">Input Fee</td>
                          <td className="border border-gray-300 p-2">{job.input_fee ? formatCurrency(job.input_fee, job.input_fee_currency) : 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">Input Fee (UGX)</td>
                          <td className="border border-gray-300 p-2">{formatCurrency(financials.inputFeeUGX)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Markup Calculations */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Markup Calculations</h3>
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Component</th>
                        <th className="border border-gray-300 p-2 text-left">Type</th>
                        <th className="border border-gray-300 p-2 text-left">Value</th>
                        <th className="border border-gray-300 p-2 text-left">Amount (UGX)</th>
                        <th className="border border-gray-300 p-2 text-left">Formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">Agency Markup</td>
                        <td className="border border-gray-300 p-2">{job.markup_agency_type || 'flat'}</td>
                        <td className="border border-gray-300 p-2">{job.markup_agency || 0}{job.markup_agency_type === 'percentage' ? '%' : ' UGX'}</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(financials.agencyMarkupUGX)}</td>
                        <td className="border border-gray-300 p-2 text-xs">
                          {job.markup_agency_type === 'percentage' 
                            ? `${formatCurrency(financials.inputFeeUGX)} × ${job.markup_agency}%`
                            : `${job.markup_agency} UGX`
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">Company Markup</td>
                        <td className="border border-gray-300 p-2">{job.markup_company_type || 'flat'}</td>
                        <td className="border border-gray-300 p-2">{job.markup_company || 0}{job.markup_company_type === 'percentage' ? '%' : ' UGX'}</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(financials.companyMarkupUGX)}</td>
                        <td className="border border-gray-300 p-2 text-xs">
                          {job.markup_company_type === 'percentage' 
                            ? `${formatCurrency(financials.inputFeeUGX)} × ${job.markup_company}%`
                            : `${job.markup_company} UGX`
                          }
                        </td>
                      </tr>
                      <tr className="bg-blue-50 font-semibold">
                        <td className="border border-gray-300 p-2">Final Fee (per candidate)</td>
                        <td className="border border-gray-300 p-2">Calculated</td>
                        <td className="border border-gray-300 p-2">-</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(financials.finalFeeUGX)}</td>
                        <td className="border border-gray-300 p-2 text-xs">
                          {job.payment_type === 'employer_funded' ? 'Agency Markup Only' :
                           job.payment_type === 'candidate_funded' ? 'Input Fee + Company Markup' :
                           'Input Fee + Agency Markup + Company Markup'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Revenue Projections */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Revenue Projections</h3>
                  <table className="w-full border border-gray-300">
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">Per Candidate Fee</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(financials.finalFeeUGX)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">Total Headcount</td>
                        <td className="border border-gray-300 p-2">{job.requested_headcount}</td>
                      </tr>
                      <tr className="bg-green-50 font-semibold">
                        <td className="border border-gray-300 p-2">Total Revenue</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(financials.totalRevenue)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">Estimated Margin (30%)</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(financials.totalMargin)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* Risks & Notes */}
          <section className="mb-8 avoid-break">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risks & Notes
            </h2>
            <div className="space-y-2">
              <p className="text-sm">• Ensure all candidates meet age requirements ({job.min_age}-{job.max_age} years)</p>
              <p className="text-sm">• Verify work permit requirements for {job.work_country}</p>
              <p className="text-sm">• Confirm payment terms with {job.receiving_company_name}</p>
              {!job.is_active && (
                <p className="text-sm text-red-600">⚠️ This position is currently inactive</p>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="footer text-center text-xs text-gray-600 mt-8 pt-4 border-t">
            <p>Generated on {new Date().toLocaleString()} | Confidential Document</p>
            <p>Contact: recruitment@company.com | Page 1 of 1</p>
          </footer>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
          .landscape-mode { 
            width: 297mm;
            height: 210mm;
          }
          body { 
            font-size: 12pt;
            line-height: 1.4;
          }
        }
        .print-optimized {
          font-size: 14px;
          line-height: 1.6;
        }
        .print-optimized h1 { font-size: 24px; }
        .print-optimized h2 { font-size: 20px; }
        .print-optimized h3 { font-size: 16px; }
      `}</style>
    </div>
  );
};

export default JobOrderModal;
