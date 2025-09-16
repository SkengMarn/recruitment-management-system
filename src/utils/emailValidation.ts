import { supabase } from './supabase/client';

export interface EmailCheckResult {
  exists: boolean;
  source?: 'candidates' | 'agents' | 'employers';
  details?: string;
}

/**
 * Comprehensive email validation that checks against all user types
 * @param email - Email address to validate
 * @param excludeId - ID to exclude from check (for editing existing records)
 * @param excludeType - Type of record being edited ('candidates' | 'agents' | 'employers')
 * @returns Promise<EmailCheckResult>
 */
export const checkEmailExists = async (
  email: string, 
  excludeId?: string, 
  excludeType?: 'candidates' | 'agents' | 'employers'
): Promise<EmailCheckResult> => {
  if (!email || !email.includes('@')) {
    return { exists: false };
  }

  const normalizedEmail = email.toLowerCase().trim();
  console.log('🔍 Checking email:', normalizedEmail, 'excludeId:', excludeId, 'excludeType:', excludeType);

  try {
    // Check agents table FIRST (current module being edited)
    if (excludeType !== 'agents') {
      console.log('👥 Checking agents table...');
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id, agency_name, phone, email')
        .eq('email', normalizedEmail);

      console.log('👥 Agents result:', agentData, 'error:', agentError);

      if (agentData && agentData.length > 0) {
        // Filter out the excluded ID if editing
        const filteredData = excludeId ? agentData.filter(a => a.id !== excludeId) : agentData;
        if (filteredData.length > 0) {
          const agent = filteredData[0];
          return {
            exists: true,
            source: 'agents',
            details: `${agent.agency_name} (Phone: ${agent.phone || 'N/A'})`
          };
        }
      }
    }

    // Check candidates table
    if (excludeType !== 'candidates') {
      console.log('📋 Checking candidates table...');
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .select('id, first_name, last_name, email')
        .eq('email', normalizedEmail);

      console.log('📋 Candidates result:', candidateData, 'error:', candidateError);

      if (candidateData && candidateData.length > 0) {
        // Filter out the excluded ID if editing
        const filteredData = excludeId ? candidateData.filter(c => c.id !== excludeId) : candidateData;
        if (filteredData.length > 0) {
          const candidate = filteredData[0];
          return {
            exists: true,
            source: 'candidates',
            details: `${candidate.first_name} ${candidate.last_name}`
          };
        }
      }
    }

    // Always check agents table when editing other modules
    if (excludeType !== 'agents') {
      // Already checked above
    } else {
      console.log('👥 Checking agents table for other module validation...');
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id, agency_name, phone, email')
        .eq('email', normalizedEmail);

      console.log('👥 Agents result for other modules:', agentData, 'error:', agentError);

      if (agentData && agentData.length > 0) {
        const agent = agentData[0];
        return {
          exists: true,
          source: 'agents',
          details: `${agent.agency_name} (Phone: ${agent.phone || 'N/A'})`
        };
      }
    }

    // Check employers table (receiving_companies)
    if (excludeType !== 'employers') {
      console.log('🏢 Checking employers table (receiving_companies)...');
      const { data: employerData, error: employerError } = await supabase
        .from('receiving_companies')
        .select('id, company_name, contact_person, email')
        .eq('email', normalizedEmail);

      console.log('🏢 Employers result:', employerData, 'error:', employerError);

      if (employerData && employerData.length > 0) {
        // Filter out the excluded ID if editing
        const filteredData = excludeId ? employerData.filter(e => e.id !== excludeId) : employerData;
        if (filteredData.length > 0) {
          const employer = filteredData[0];
          return {
            exists: true,
            source: 'employers',
            details: `${employer.contact_person || 'Contact'} (${employer.company_name})`
          };
        }
      }
    }

    return { exists: false };

  } catch (error) {
    console.error('Error checking email existence:', error);
    return { exists: false };
  }
};

/**
 * Format error message for email validation
 * @param result - EmailCheckResult from checkEmailExists
 * @returns Formatted error message
 */
export const formatEmailError = (result: EmailCheckResult): string => {
  if (!result.exists) return '';
  
  const sourceLabels = {
    candidates: 'candidate',
    agents: 'agent',
    employers: 'employer'
  };

  const sourceLabel = sourceLabels[result.source!];
  return `This email is already registered to ${sourceLabel}: ${result.details}`;
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns boolean indicating if email format is valid
 */
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
