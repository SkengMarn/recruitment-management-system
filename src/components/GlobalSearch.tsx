import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Users, UserCheck, Building2, Briefcase, DollarSign, FileText } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface SearchResult {
  id: string;
  name: string;
  type: 'candidate' | 'agent' | 'employer' | 'job' | 'payment' | 'document';
  details: string;
  module: string;
  path: string;
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export default function GlobalSearch({ 
  className = "w-80", 
  placeholder = "Search candidates, agents, employers..." 
}: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'candidate': return <Users className="h-4 w-4 text-blue-600" />;
      case 'agent': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'employer': return <Building2 className="h-4 w-4 text-purple-600" />;
      case 'job': return <Briefcase className="h-4 w-4 text-orange-600" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case 'document': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getModuleLabel = (type: string) => {
    switch (type) {
      case 'candidate': return 'Candidate';
      case 'agent': return 'Agent';
      case 'employer': return 'Employer';
      case 'job': return 'Job Position';
      case 'payment': return 'Payment';
      case 'document': return 'Document';
      default: return 'Unknown';
    }
  };

  const performGlobalSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const searchQuery = `%${query.toLowerCase()}%`;
      
      // Search across all modules simultaneously
      const [candidatesResult, agentsResult, employersResult, jobsResult, paymentsResult, documentsResult] = await Promise.all([
        // Candidates search
        supabase
          .from('candidates')
          .select('id, full_name, phone, email, passport_number, stage')
          .or(`full_name.ilike.${searchQuery},phone.ilike.${searchQuery},email.ilike.${searchQuery},passport_number.ilike.${searchQuery}`)
          .limit(5),
        
        // Agents search
        supabase
          .from('agents')
          .select('id, agency_name, phone, email, agency_id')
          .or(`agency_name.ilike.${searchQuery},phone.ilike.${searchQuery},email.ilike.${searchQuery},agency_id.ilike.${searchQuery}`)
          .limit(5),
        
        // Employers search
        supabase
          .from('receiving_companies')
          .select('id, company_name, phone, email, contact_person')
          .or(`company_name.ilike.${searchQuery},phone.ilike.${searchQuery},email.ilike.${searchQuery},contact_person.ilike.${searchQuery}`)
          .limit(5),
        
        // Jobs/Positions search
        supabase
          .from('positions')
          .select('id, job_title, description, country, salary_range')
          .or(`job_title.ilike.${searchQuery},description.ilike.${searchQuery},country.ilike.${searchQuery}`)
          .limit(5),
        
        // Payments search
        supabase
          .from('payments')
          .select(`
            id, amount, currency, stage, reference_number,
            candidates!candidate_id(full_name)
          `)
          .or(`stage.ilike.${searchQuery},reference_number.ilike.${searchQuery}`)
          .limit(5),
        
        // Documents search
        supabase
          .from('documents')
          .select(`
            id, doc_name, doc_type,
            candidates!candidate_id(full_name)
          `)
          .or(`doc_name.ilike.${searchQuery},doc_type.ilike.${searchQuery}`)
          .limit(5)
      ]);

      const results: SearchResult[] = [];

      // Process candidates
      candidatesResult.data?.forEach(candidate => {
        results.push({
          id: candidate.id,
          name: candidate.full_name,
          type: 'candidate',
          details: `${candidate.stage} • ${candidate.phone || candidate.email || 'No contact'}`,
          module: 'Candidates',
          path: `/candidates?highlight=${candidate.id}`
        });
      });

      // Process agents
      agentsResult.data?.forEach(agent => {
        results.push({
          id: agent.id,
          name: agent.agency_name,
          type: 'agent',
          details: `${agent.agency_id} • ${agent.phone || agent.email || 'No contact'}`,
          module: 'Agents',
          path: `/agents?highlight=${agent.id}`
        });
      });

      // Process employers
      employersResult.data?.forEach(employer => {
        results.push({
          id: employer.id,
          name: employer.company_name,
          type: 'employer',
          details: `${employer.contact_person || 'No contact person'} • ${employer.phone || employer.email || 'No contact'}`,
          module: 'Employers',
          path: `/employers?highlight=${employer.id}`
        });
      });

      // Process jobs
      jobsResult.data?.forEach(job => {
        results.push({
          id: job.id,
          name: job.job_title,
          type: 'job',
          details: `${job.country || 'Location TBD'} • ${job.salary_range || 'Salary negotiable'}`,
          module: 'Jobs',
          path: `/jobs?highlight=${job.id}`
        });
      });

      // Process payments
      paymentsResult.data?.forEach(payment => {
        results.push({
          id: payment.id,
          name: `${payment.currency} ${payment.amount?.toLocaleString() || '0'}`,
          type: 'payment',
          details: `${payment.stage} • ${(payment.candidates as any)?.full_name || 'Unknown candidate'}`,
          module: 'Financials',
          path: `/financials?highlight=${payment.id}`
        });
      });

      // Process documents
      documentsResult.data?.forEach(document => {
        results.push({
          id: document.id,
          name: document.doc_name,
          type: 'document',
          details: `${document.doc_type} • ${(document.candidates as any)?.full_name || 'Unknown candidate'}`,
          module: 'Documents',
          path: `/documents?highlight=${document.id}`
        });
      });

      setSearchResults(results);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Global search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    setShowResults(false);
    setSearchTerm('');
    navigate(result.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performGlobalSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group results by module
  const groupedResults = searchResults.reduce((groups, result) => {
    const module = result.module;
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowResults(true)}
          onKeyDown={handleKeyDown}
          className={`pl-10 pr-10 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-input ${className}`}
        />
        {searching && (
          <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {showResults && searchTerm && (
        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
          {searchResults.length > 0 ? (
            <div className="p-2">
              {Object.entries(groupedResults).map(([module, results]) => (
                <div key={module} className="mb-3 last:mb-0">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/50 mb-1">
                    {module} ({results.length})
                  </div>
                  {results.map((result, index) => {
                    const globalIndex = searchResults.findIndex(r => r.id === result.id && r.type === result.type);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultSelect(result)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {getModuleIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {getModuleLabel(result.type)} • {result.details}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {searchResults.length >= 25 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t border-border/50">
                  Showing first 25 results. Refine your search for more specific results.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{searchTerm}"</p>
              <p className="text-xs mt-1">Try searching for names, phone numbers, or IDs</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
