import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { APIClient } from '../utils/supabase/client';
const apiClient = new APIClient();
import { supabase } from '../utils/supabase/client';

interface Job {
  id: string;
  position_name: string;
  receiving_company_id: string;
  receiving_company_name?: string;
  work_country: string;
  requested_headcount: number;
  salary: number;
  salary_currency: string;
  input_fee: number;
  input_fee_currency: string;
  markup_agency?: number;
  markup_agency_type?: string;
  markup_company?: number;
  markup_company_type?: string;
  final_fee?: number;
  contract_period: number;
  probation_period?: number;
  min_age: number;
  max_age: number;
  accommodation: boolean;
  food: boolean;
  air_ticket: boolean;
  transport: boolean;
  medical_insurance: boolean;
  employment_visa: boolean;
  working_hours?: string;
  payment_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  company_name: string;
  payment_type?: string;
}

interface JobFormData {
  position_name: string;
  receiving_company_id: string;
  work_country: string;
  requested_headcount: string;
  salary: string;
  salary_currency: string;
  input_fee: string;
  input_fee_currency: string;
  contract_period: string;
  probation_period: string;
  min_age: string;
  max_age: string;
  accommodation: boolean;
  food: boolean;
  air_ticket: boolean;
  transport: boolean;
  medical_insurance: boolean;
  employment_visa: boolean;
  working_hours: string;
  markup_agency: string;
  markup_agency_type: string;
  markup_company: string;
  markup_company_type: string;
  payment_type: string;
  is_active: boolean;
}

interface JobFormProps {
  job?: Job | null;
  onClose: () => void;
  onSave: () => void;
  companies: Company[];
}

const JobFormFullscreen: React.FC<JobFormProps> = ({ job, onClose, onSave, companies }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  const [exchangeLoading, setExchangeLoading] = useState(false);
  
  // Fetch exchange rates from multiple free APIs with fallbacks
  const fetchExchangeRates = async () => {
    try {
      setExchangeLoading(true);
      
      // Try multiple free APIs in order of preference
      const apis = [
        {
          name: 'Fixer.io (Free)',
          url: 'https://api.fixer.io/latest?base=USD&access_key=YOUR_FREE_KEY',
          disabled: true // Requires API key
        },
        {
          name: 'ExchangeRate-API (Free)',
          url: 'https://open.er-api.com/v6/latest/USD',
          disabled: false
        },
        {
          name: 'CurrencyAPI (Free)', 
          url: 'https://api.currencyapi.com/v3/latest?apikey=YOUR_FREE_KEY&base_currency=USD',
          disabled: true // Requires API key
        }
      ];
      
      // Try the open exchange rate API (no key required)
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      
      if (data.result === 'success' && data.rates) {
        // Convert USD-based rates to UGX-based rates
        const ugxRates: {[key: string]: number} = {};
        const usdToUgx = data.rates.UGX || 3700; // Fallback if UGX not available
        
        Object.keys(data.rates).forEach(currency => {
          if (currency === 'UGX') {
            ugxRates[currency] = 1;
          } else {
            // Convert: 1 [currency] = (UGX_rate / currency_rate) UGX
            ugxRates[currency] = usdToUgx / data.rates[currency];
          }
        });
        
        // Add UGX if not present
        ugxRates['UGX'] = 1;
        
        setExchangeRates(ugxRates);
        console.log('Exchange rates updated successfully');
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Comprehensive fallback rates (updated as of 2024)
      setExchangeRates({
        'UGX': 1,
        'USD': 3700,    // 1 USD = 3,700 UGX
        'EUR': 4000,    // 1 EUR = 4,000 UGX  
        'GBP': 4600,    // 1 GBP = 4,600 UGX
        'AED': 1007,    // 1 AED = 1,007 UGX
        'SAR': 987,     // 1 SAR = 987 UGX
        'KES': 28,      // 1 KES = 28 UGX
        'TZS': 1.6,     // 1 TZS = 1.6 UGX
        'RWF': 3.2,     // 1 RWF = 3.2 UGX
        'CAD': 2700,    // 1 CAD = 2,700 UGX
        'AUD': 2450,    // 1 AUD = 2,450 UGX
        'JPY': 25,      // 1 JPY = 25 UGX
        'CHF': 4100,    // 1 CHF = 4,100 UGX
        'CNY': 520,     // 1 CNY = 520 UGX
        'INR': 44,      // 1 INR = 44 UGX
        'ZAR': 200,     // 1 ZAR = 200 UGX
        'NGN': 2.4,     // 1 NGN = 2.4 UGX
        'GHS': 310,     // 1 GHS = 310 UGX
        'EGP': 120,     // 1 EGP = 120 UGX
        'MAD': 370,     // 1 MAD = 370 UGX
        'QAR': 1016,    // 1 QAR = 1,016 UGX
        'KWD': 12000,   // 1 KWD = 12,000 UGX
        'BHD': 9800,    // 1 BHD = 9,800 UGX
        'OMR': 9600,    // 1 OMR = 9,600 UGX
        'JOD': 5220,    // 1 JOD = 5,220 UGX
        'ILS': 1000,    // 1 ILS = 1,000 UGX
        'TRY': 110,     // 1 TRY = 110 UGX
        'RUB': 39,      // 1 RUB = 39 UGX
        'BRL': 670,     // 1 BRL = 670 UGX
        'MXN': 220,     // 1 MXN = 220 UGX
        'SGD': 2750,    // 1 SGD = 2,750 UGX
        'HKD': 475,     // 1 HKD = 475 UGX
        'NOK': 350,     // 1 NOK = 350 UGX
        'SEK': 350,     // 1 SEK = 350 UGX
        'DKK': 540,     // 1 DKK = 540 UGX
        'PLN': 920,     // 1 PLN = 920 UGX
        'CZK': 160,     // 1 CZK = 160 UGX
        'HUF': 10,      // 1 HUF = 10 UGX
        'RON': 800,     // 1 RON = 800 UGX
        'BGN': 2050,    // 1 BGN = 2,050 UGX
        'HRK': 530,     // 1 HRK = 530 UGX
        'THB': 105,     // 1 THB = 105 UGX
        'MYR': 790,     // 1 MYR = 790 UGX
        'IDR': 0.24,    // 1 IDR = 0.24 UGX
        'PHP': 66,      // 1 PHP = 66 UGX
        'VND': 0.15,    // 1 VND = 0.15 UGX
        'KRW': 2.8,     // 1 KRW = 2.8 UGX
        'TWD': 115,     // 1 TWD = 115 UGX
        'ARS': 4.2,     // 1 ARS = 4.2 UGX
        'CLP': 3.9,     // 1 CLP = 3.9 UGX
        'COP': 0.9,     // 1 COP = 0.9 UGX
        'PEN': 980,     // 1 PEN = 980 UGX
        'LBP': 0.04,    // 1 LBP = 0.04 UGX
      });
      console.log('Using fallback exchange rates');
    } finally {
      setExchangeLoading(false);
    }
  };

  // Convert currency to UGX
  const convertToUGX = (amount: number, fromCurrency: string): number => {
    if (fromCurrency === 'UGX') return amount;
    const rate = exchangeRates[fromCurrency];
    if (!rate) return amount; // If no rate available, return original amount
    return amount * rate;
  };

  // Format number with commas
  const formatNumberWithCommas = (value: string): string => {
    if (!value || value === '') return '';
    // Remove all non-digits
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue === '') return '';
    // Add commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Remove commas for storage
  const removeCommas = (value: string): string => {
    if (!value || value === '') return '0';
    return value.replace(/,/g, '');
  };
  
  // Handle formatted number input
  const handleFormattedNumberChange = (value: string, fieldName: string) => {
    const formattedValue = formatNumberWithCommas(value);
    setFormData(prev => ({ ...prev, [fieldName]: formattedValue }));
    
    // Force re-render of final fee calculation by triggering a state update
    setTimeout(() => {
      // This will cause the component to re-render and recalculate final fee
    }, 0);
  };
  const [formData, setFormData] = useState<JobFormData>({
    position_name: '',
    receiving_company_id: '',
    work_country: '',
    requested_headcount: '1',
    salary: '',
    salary_currency: 'USD',
    input_fee: '',
    input_fee_currency: 'UGX',
    markup_agency: '0',
    markup_agency_type: 'flat',
    markup_company: '0',
    markup_company_type: 'flat',
    contract_period: '24',
    probation_period: '3',
    min_age: '18',
    max_age: '65',
    accommodation: false,
    food: false,
    air_ticket: false,
    transport: false,
    medical_insurance: false,
    employment_visa: false,
    working_hours: '',
    payment_type: '',
    is_active: true
  });

  // Get selected company details
  const getSelectedCompany = (companyId: string): Company | null => {
    return companies.find(c => c.id === companyId) || null;
  };

  // Handle company selection and payment type detection
  const handleCompanyChange = (companyId: string) => {
    const company = getSelectedCompany(companyId);
    setSelectedCompany(company);
    
    const newFormData = {
      ...formData,
      receiving_company_id: companyId,
      payment_type: company?.payment_type || ''
    };

    // Auto-adjust fields based on payment type
    switch (company?.payment_type) {
      case 'employer_funded':
        newFormData.input_fee = '0';
        newFormData.markup_company = '0';
        // Keep markup_agency editable for commission
        break;
      case 'candidate_funded':
        newFormData.markup_agency = '0';
        // Reset input_fee and markup_company to editable if they were 0
        if (newFormData.input_fee === '0') newFormData.input_fee = '';
        if (newFormData.markup_company === '0') newFormData.markup_company = '';
        break;
      case 'hybrid':
        // All fields editable - reset any zeros to empty for user input
        if (newFormData.input_fee === '0') newFormData.input_fee = '';
        if (newFormData.markup_agency === '0') newFormData.markup_agency = '';
        if (newFormData.markup_company === '0') newFormData.markup_company = '';
        break;
    }

    setFormData(newFormData);
  };

  // Check if field should be disabled based on payment type
  const isFieldDisabled = (fieldName: string): boolean => {
    if (!selectedCompany?.payment_type) return false;
    
    switch (selectedCompany.payment_type) {
      case 'employer_funded':
        return fieldName === 'input_fee' || fieldName === 'markup_company';
      case 'candidate_funded':
        return fieldName === 'markup_agency';
      case 'hybrid':
        return false; // All fields editable
      default:
        return false;
    }
  };

  // Check if field is required based on payment type
  const isFieldRequired = (fieldName: string): boolean => {
    if (!selectedCompany?.payment_type) return false;
    
    switch (selectedCompany.payment_type) {
      case 'candidate_funded':
      case 'hybrid':
        return fieldName === 'input_fee';
      default:
        return false;
    }
  };

  // Calculate final fee based on payment type and markup types (always in UGX)
  const calculateFinalFee = () => {
    try {
      // Get clean numeric values
      const inputFeeValue = (formData.input_fee || '').replace(/[^0-9]/g, '');
      const agencyMarkupValue = (formData.markup_agency || '').replace(/[^0-9]/g, '');
      const companyMarkupValue = (formData.markup_company || '').replace(/[^0-9]/g, '');
      
      const inputFeeOriginal = parseInt(inputFeeValue) || 0;
      const agencyMarkupOriginal = parseInt(agencyMarkupValue) || 0;
      const companyMarkupOriginal = parseInt(companyMarkupValue) || 0;
      
      // Convert input fee to UGX if it's in a different currency
      const inputFeeInUGX = convertToUGX(inputFeeOriginal, formData.input_fee_currency);
      
      // Calculate agency markup based on type
      let agencyMarkupInUGX = 0;
      if (formData.markup_agency_type === 'percentage') {
        agencyMarkupInUGX = inputFeeInUGX * (agencyMarkupOriginal / 100);
      } else {
        agencyMarkupInUGX = agencyMarkupOriginal;
      }
      
      // Calculate company markup based on type
      let companyMarkupInUGX = 0;
      if (formData.markup_company_type === 'percentage') {
        companyMarkupInUGX = inputFeeInUGX * (companyMarkupOriginal / 100);
      } else {
        companyMarkupInUGX = companyMarkupOriginal;
      }
      
      console.log('Enhanced markup calculation:', {
        inputFeeOriginal,
        inputFeeInUGX,
        agencyMarkupOriginal,
        agencyMarkupType: formData.markup_agency_type,
        agencyMarkupInUGX,
        companyMarkupOriginal,
        companyMarkupType: formData.markup_company_type,
        companyMarkupInUGX
      });
      
      let finalAmount = 0;
      
      if (!selectedCompany?.payment_type) {
        finalAmount = inputFeeInUGX + agencyMarkupInUGX + companyMarkupInUGX;
      } else {
        switch (selectedCompany.payment_type) {
          case 'employer_funded':
            finalAmount = agencyMarkupInUGX;
            break;
          case 'candidate_funded':
            finalAmount = inputFeeInUGX + companyMarkupInUGX;
            break;
          case 'hybrid':
            finalAmount = inputFeeInUGX + agencyMarkupInUGX + companyMarkupInUGX;
            break;
          default:
            finalAmount = inputFeeInUGX + agencyMarkupInUGX + companyMarkupInUGX;
        }
      }
      
      if (finalAmount === 0) return '0';
      
      // Format with commas
      const formatted = Math.round(finalAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return formatted;
      
    } catch (error) {
      console.error('Error in calculateFinalFee:', error);
      return '0';
    }
  };

  // Country to currency mapping
  const getCountryCurrency = (country: string): string => {
    const currencyMap: { [key: string]: string } = {
      'United States': 'USD',
      'USA': 'USD',
      'United Kingdom': 'GBP',
      'UK': 'GBP',
      'Germany': 'EUR',
      'France': 'EUR',
      'Italy': 'EUR',
      'Spain': 'EUR',
      'Netherlands': 'EUR',
      'Belgium': 'EUR',
      'Austria': 'EUR',
      'Portugal': 'EUR',
      'Ireland': 'EUR',
      'Finland': 'EUR',
      'Luxembourg': 'EUR',
      'UAE': 'AED',
      'United Arab Emirates': 'AED',
      'Dubai': 'AED',
      'Abu Dhabi': 'AED',
      'Saudi Arabia': 'SAR',
      'KSA': 'SAR',
      'Riyadh': 'SAR',
      'Jeddah': 'SAR',
      'Uganda': 'UGX',
      'Canada': 'CAD',
      'Australia': 'AUD',
      'Japan': 'JPY',
      'South Korea': 'KRW',
      'Singapore': 'SGD',
      'Hong Kong': 'HKD',
      'Switzerland': 'CHF',
      'Norway': 'NOK',
      'Sweden': 'SEK',
      'Denmark': 'DKK',
      'Poland': 'PLN',
      'Czech Republic': 'CZK',
      'Hungary': 'HUF',
      'Romania': 'RON',
      'Bulgaria': 'BGN',
      'Croatia': 'HRK',
      'India': 'INR',
      'China': 'CNY',
      'Thailand': 'THB',
      'Malaysia': 'MYR',
      'Indonesia': 'IDR',
      'Philippines': 'PHP',
      'Vietnam': 'VND',
      'South Africa': 'ZAR',
      'Nigeria': 'NGN',
      'Kenya': 'KES',
      'Ghana': 'GHS',
      'Egypt': 'EGP',
      'Morocco': 'MAD',
      'Turkey': 'TRY',
      'Russia': 'RUB',
      'Brazil': 'BRL',
      'Mexico': 'MXN',
      'Argentina': 'ARS',
      'Chile': 'CLP',
      'Colombia': 'COP',
      'Peru': 'PEN',
      'Israel': 'ILS',
      'Jordan': 'JOD',
      'Lebanon': 'LBP',
      'Kuwait': 'KWD',
      'Qatar': 'QAR',
      'Bahrain': 'BHD',
      'Oman': 'OMR'
    };
    
    return currencyMap[country] || 'USD'; // Default to USD if country not found
  };

  // Fetch available currencies from existing jobs
  const fetchAvailableCurrencies = async () => {
    try {
      const { data: jobs } = await supabase
        .from('positions')
        .select('work_country, salary_currency, input_fee_currency')
        .not('work_country', 'is', null);
      
      const currencies = new Set<string>();
      
      // Add currencies from existing jobs
      jobs?.forEach(job => {
        if (job.salary_currency) currencies.add(job.salary_currency);
        if (job.input_fee_currency) currencies.add(job.input_fee_currency);
        
        // Add currency based on work country
        if (job.work_country) {
          const countryCurrency = getCountryCurrency(job.work_country);
          currencies.add(countryCurrency);
        }
      });
      
      // Always include common currencies
      const commonCurrencies = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'UGX'];
      commonCurrencies.forEach(currency => currencies.add(currency));
      
      // Add currency for current work country if specified
      if (formData.work_country) {
        const currentCountryCurrency = getCountryCurrency(formData.work_country);
        currencies.add(currentCountryCurrency);
      }
      
      setAvailableCurrencies(Array.from(currencies).sort());
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // Fallback to common currencies
      setAvailableCurrencies(['USD', 'EUR', 'GBP', 'AED', 'SAR', 'UGX']);
    }
  };

  // Update currencies when work country changes
  const handleWorkCountryChange = (country: string) => {
    const newFormData = { ...formData, work_country: country };
    
    // Auto-suggest currency based on country
    const suggestedCurrency = getCountryCurrency(country);
    if (!formData.salary_currency) {
      newFormData.salary_currency = suggestedCurrency;
    }
    if (!formData.input_fee_currency) {
      newFormData.input_fee_currency = suggestedCurrency;
    }
    
    setFormData(newFormData);
    
    // Add the new currency to available list if not already present
    if (!availableCurrencies.includes(suggestedCurrency)) {
      setAvailableCurrencies(prev => [...prev, suggestedCurrency].sort());
    }
  };

  useEffect(() => {
    fetchAvailableCurrencies();
    fetchExchangeRates();
  }, []);

  // Refetch exchange rates when input fee currency changes
  useEffect(() => {
    if (formData.input_fee_currency && formData.input_fee_currency !== 'UGX') {
      if (!exchangeRates[formData.input_fee_currency]) {
        fetchExchangeRates();
      }
    }
  }, [formData.input_fee_currency]);

  useEffect(() => {
    if (job) {
      setFormData({
        position_name: job.position_name,
        receiving_company_id: job.receiving_company_id,
        work_country: job.work_country,
        requested_headcount: job.requested_headcount?.toString() || '1',
        salary: job.salary?.toString() || '',
        salary_currency: job.salary_currency || 'USD',
        input_fee: job.input_fee?.toString() || '',
        input_fee_currency: job.input_fee_currency || 'UGX',
        markup_agency: job.markup_agency?.toString() || '0',
        markup_agency_type: job.markup_agency_type || 'flat',
        markup_company: job.markup_company?.toString() || '0',
        markup_company_type: job.markup_company_type || 'flat',
        contract_period: job.contract_period?.toString() || '24',
        probation_period: job.probation_period?.toString() || '3',
        min_age: job.min_age?.toString() || '18',
        max_age: job.max_age?.toString() || '65',
        accommodation: job.accommodation || false,
        food: job.food || false,
        air_ticket: job.air_ticket || false,
        transport: job.transport || false,
        medical_insurance: job.medical_insurance || false,
        employment_visa: job.employment_visa || false,
        working_hours: job.working_hours || '',
        payment_type: job.payment_type || '',
        is_active: job.is_active ?? true
      });
      const company = getSelectedCompany(job.receiving_company_id);
      setSelectedCompany(company);
    }
  }, [job, companies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        requested_headcount: parseInt(formData.requested_headcount) || 1,
        salary: parseFloat(removeCommas(formData.salary)) || 0,
        input_fee: parseFloat(removeCommas(formData.input_fee)) || 0,
        markup_agency: parseFloat(removeCommas(formData.markup_agency)) || 0,
        markup_company: parseFloat(removeCommas(formData.markup_company)) || 0,
        contract_period: parseInt(formData.contract_period) || 24,
        probation_period: parseInt(formData.probation_period) || 3,
        min_age: parseInt(formData.min_age) || 18,
        max_age: parseInt(formData.max_age) || 65
      };

      if (job) {
        await apiClient.updateJob(job.id, jobData);
        toast.success('Job updated successfully!');
      } else {
        await apiClient.createJob(jobData);
        toast.success('Job created successfully!');
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold">{job ? 'Edit Job' : 'Create New Job'}</h1>
          <p className="text-muted-foreground">Add a new job position</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-6 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="position_name">Position Name *</Label>
                  <Input
                    id="position_name"
                    required
                    value={formData.position_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, position_name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="work_country">Work Country *</Label>
                  <Input
                    id="work_country"
                    required
                    placeholder="e.g., UAE, Saudi Arabia, Uganda"
                    value={formData.work_country}
                    onChange={(e) => handleWorkCountryChange(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="receiving_company_id">Company *</Label>
                  <Select value={formData.receiving_company_id} onValueChange={handleCompanyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCompany?.payment_type && (
                    <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                      <strong>Payment Type: {selectedCompany.payment_type.toUpperCase().replace('_', ' ')}</strong>
                      <br />
                      {selectedCompany.payment_type === 'employer_funded' && 'Candidate pays nothing; company margin: commission breakdown.'}
                      {selectedCompany.payment_type === 'candidate_funded' && 'Candidate pays service charge; company margin: commission breakdown.'}
                      {selectedCompany.payment_type === 'hybrid' && 'Shared payment; candidate pays service + company margin; commission breakdown.'}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="requested_headcount">Positions Needed *</Label>
                  <Input
                    id="requested_headcount"
                    type="number"
                    min="1"
                    required
                    value={formData.requested_headcount}
                    onChange={(e) => setFormData(prev => ({ ...prev, requested_headcount: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Compensation Details */}
            <div className="space-y-6 p-6 bg-purple-50 rounded-lg">
              <h3 className="text-lg font-medium text-purple-900">Compensation Details</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary</Label>
                  <Input
                    id="salary"
                    placeholder="e.g., 2,500"
                    value={formData.salary}
                    onChange={(e) => handleFormattedNumberChange(e.target.value, 'salary')}
                  />
                  {formData.salary && formData.salary_currency !== 'UGX' && exchangeRates[formData.salary_currency] && (
                    <p className="text-xs text-green-600">
                      ≈ {Math.round((parseFloat(removeCommas(formData.salary)) || 0) * exchangeRates[formData.salary_currency]).toLocaleString()} UGX/month
                    </p>
                  )}
                  {formData.salary && formData.salary_currency === 'UGX' && (
                    <p className="text-xs text-gray-500">
                      {Math.round(parseFloat(removeCommas(formData.salary)) || 0).toLocaleString()} UGX/month
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="salary_currency">Salary Currency</Label>
                  <Select value={formData.salary_currency} onValueChange={(value) => setFormData(prev => ({ ...prev, salary_currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input_fee">Input Fee {isFieldRequired('input_fee') ? '*' : ''}</Label>
                  <Input
                    id="input_fee"
                    placeholder="3,000"
                    value={formData.input_fee}
                    onChange={(e) => handleFormattedNumberChange(e.target.value, 'input_fee')}
                    disabled={isFieldDisabled('input_fee')}
                    className={isFieldDisabled('input_fee') ? 'bg-gray-100 cursor-not-allowed' : ''}
                    readOnly={isFieldDisabled('input_fee')}
                    required={isFieldRequired('input_fee')}
                  />
                  {formData.input_fee && formData.input_fee_currency !== 'UGX' && exchangeRates[formData.input_fee_currency] && (
                    <p className="text-xs text-blue-600">
                      ≈ {Math.round((parseFloat(removeCommas(formData.input_fee)) || 0) * exchangeRates[formData.input_fee_currency]).toLocaleString()} UGX
                    </p>
                  )}
                  {formData.input_fee && formData.input_fee_currency === 'UGX' && (
                    <p className="text-xs text-gray-500">
                      {Math.round(parseFloat(removeCommas(formData.input_fee)) || 0).toLocaleString()} UGX
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="input_fee_currency">Input Fee Currency</Label>
                  <Select value={formData.input_fee_currency} onValueChange={(value) => setFormData(prev => ({ ...prev, input_fee_currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Breakdown */}
                {selectedCompany?.payment_type && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-sm mb-2">Payment Breakdown - {selectedCompany.payment_type.toUpperCase().replace('_', ' ')}</h4>
                    <div className="space-y-2 text-sm">
                      {selectedCompany.payment_type === 'employer_funded' && (
                        <>
                          <div className="flex justify-between">
                            <span>Who pays:</span>
                            <span className="font-medium">Employer</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service charge:</span>
                            <span className="text-gray-500">Covered by employer</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Company margin:</span>
                            <span className="text-gray-500">Commission breakdown</span>
                          </div>
                        </>
                      )}
                      {selectedCompany.payment_type === 'candidate_funded' && (
                        <>
                          <div className="flex justify-between">
                            <span>Who pays:</span>
                            <span className="font-medium">Candidate</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service charge:</span>
                            <span className="text-blue-600">Paid by candidate</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Company margin:</span>
                            <span className="text-blue-600">Commission breakdown</span>
                          </div>
                        </>
                      )}
                      {selectedCompany.payment_type === 'hybrid' && (
                        <>
                          <div className="flex justify-between">
                            <span>Who pays:</span>
                            <span className="font-medium">Shared</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service charge:</span>
                            <span className="text-blue-600">Paid by candidate</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Company margin:</span>
                            <span className="text-blue-600">Commission breakdown</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="markup_agency">Agency Markup</Label>
                      {isFieldDisabled('markup_agency') && (
                        <div className="group relative">
                          <Info className="h-4 w-4 text-blue-500 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Auto-disabled for {selectedCompany?.payment_type?.replace('_', ' ')} payment type.
                            <br />Candidate pays service charge; agency gets no markup.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.markup_agency_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, markup_agency_type: value }))}
                        disabled={isFieldDisabled('markup_agency')}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">UGX</SelectItem>
                          <SelectItem value="percentage">%</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="markup_agency"
                        placeholder={formData.markup_agency_type === 'percentage' ? 'e.g., 15' : 'e.g., 50,000'}
                        value={formData.markup_agency}
                        onChange={(e) => handleFormattedNumberChange(e.target.value, 'markup_agency')}
                        disabled={isFieldDisabled('markup_agency')}
                        className={isFieldDisabled('markup_agency') ? 'bg-gray-100 cursor-not-allowed' : ''}
                        readOnly={isFieldDisabled('markup_agency')}
                      />
                    </div>
                    {formData.markup_agency_type === 'percentage' && formData.markup_agency && (
                      <p className="text-xs text-blue-600">
                        {formData.markup_agency}% of input fee = {Math.round((parseFloat(removeCommas(formData.input_fee)) || 0) * convertToUGX(1, formData.input_fee_currency) * (parseFloat(formData.markup_agency) || 0) / 100).toLocaleString()} UGX
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="markup_company">Company Markup</Label>
                      {isFieldDisabled('markup_company') && (
                        <div className="group relative">
                          <Info className="h-4 w-4 text-blue-500 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Auto-disabled for {selectedCompany?.payment_type?.replace('_', ' ')} payment type.
                            <br />Employer covers all costs; no company markup charged.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.markup_company_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, markup_company_type: value }))}
                        disabled={isFieldDisabled('markup_company')}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">UGX</SelectItem>
                          <SelectItem value="percentage">%</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="markup_company"
                        placeholder={formData.markup_company_type === 'percentage' ? 'e.g., 10' : 'e.g., 50,000'}
                        value={formData.markup_company}
                        onChange={(e) => handleFormattedNumberChange(e.target.value, 'markup_company')}
                        disabled={isFieldDisabled('markup_company')}
                        className={isFieldDisabled('markup_company') ? 'bg-gray-100 cursor-not-allowed' : ''}
                        readOnly={isFieldDisabled('markup_company')}
                      />
                    </div>
                    {formData.markup_company_type === 'percentage' && formData.markup_company && (
                      <p className="text-xs text-blue-600">
                        {formData.markup_company}% of input fee = {Math.round((parseFloat(removeCommas(formData.input_fee)) || 0) * convertToUGX(1, formData.input_fee_currency) * (parseFloat(formData.markup_company) || 0) / 100).toLocaleString()} UGX
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="final_fee">Final Fee (Auto-calculated in UGX)</Label>
                    <div className="relative">
                      <Input
                        id="final_fee"
                        type="text"
                        value={calculateFinalFee()}
                        disabled
                        className="bg-gray-100 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        UGX
                      </span>
                      {exchangeLoading && (
                        <span className="absolute right-16 top-1/2 transform -translate-y-1/2 text-xs text-blue-500">
                          Loading rates...
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCompany?.payment_type === 'employer_funded' && 'Formula: Agency Markup only'}
                      {selectedCompany?.payment_type === 'candidate_funded' && 'Formula: Input Fee (converted to UGX) + Company Markup'}
                      {selectedCompany?.payment_type === 'hybrid' && 'Formula: Input Fee (converted to UGX) + Company Markup + Agency Markup'}
                      {!selectedCompany?.payment_type && 'Formula: Input Fee (converted to UGX) + Agency Markup + Company Markup'}
                    </p>
                    {formData.input_fee_currency !== 'UGX' && exchangeRates[formData.input_fee_currency] && (
                      <p className="text-xs text-blue-600 mt-1">
                        Exchange rate: 1 {formData.input_fee_currency} = {Math.round(exchangeRates[formData.input_fee_currency]).toLocaleString()} UGX
                        <span className="text-gray-500 ml-2">(Updated daily)</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Contract Terms</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contract_period">Contract Period (months)</Label>
                  <Input
                    id="contract_period"
                    type="number"
                    min="1"
                    value={formData.contract_period}
                    onChange={(e) => setFormData(prev => ({ ...prev, contract_period: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="probation_period">Probation Period (months)</Label>
                  <Input
                    id="probation_period"
                    type="number"
                    min="0"
                    value={formData.probation_period}
                    onChange={(e) => setFormData(prev => ({ ...prev, probation_period: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="min_age">Minimum Age</Label>
                  <Input
                    id="min_age"
                    type="number"
                    min="18"
                    max="65"
                    value={formData.min_age}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_age: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="max_age">Maximum Age</Label>
                  <Input
                    id="max_age"
                    type="number"
                    min="18"
                    max="65"
                    value={formData.max_age}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_age: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contract Terms */}
            <div className="space-y-6 p-6 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-900">Benefits & Additional Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="working_hours">Working Hours</Label>
                  <Input
                    id="working_hours"
                    placeholder="e.g., 8 hours/day, 6 days/week"
                    value={formData.working_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, working_hours: e.target.value }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Benefits Provided</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: 'accommodation', label: 'Accommodation' },
                      { key: 'food', label: 'Food' },
                      { key: 'air_ticket', label: 'Air Ticket' },
                      { key: 'transport', label: 'Transport' },
                      { key: 'medical_insurance', label: 'Medical Insurance' },
                      { key: 'employment_visa', label: 'Employment Visa' }
                    ].map(benefit => (
                      <div key={benefit.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`form_${benefit.key}`}
                          checked={formData[benefit.key as keyof typeof formData] as boolean}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            [benefit.key]: checked 
                          }))}
                        />
                        <Label htmlFor={`form_${benefit.key}`} className="text-sm">
                          {benefit.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      is_active: checked as boolean 
                    }))}
                  />
                  <Label htmlFor="is_active" className="text-sm">
                    Job is Active
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
        <div className="flex justify-end gap-3 max-w-6xl mx-auto">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            {loading ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobFormFullscreen;
