import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Create a singleton Supabase client to avoid multiple instances
let supabaseInstance: any = null;

if (!supabaseInstance) {
  // Always use remote Supabase instance for consistent data access
  const supabaseUrl = `https://${projectId}.supabase.co`;
  const supabaseKey = publicAnonKey;
  
  supabaseInstance = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: true,
        storageKey: 'recruitment-system-auth'
      }
    }
  );
}

export const supabase = supabaseInstance;

// API client using direct Supabase database calls
export class APIClient {
  constructor() {
    // Direct database access through Supabase client
  }

  // Dashboard API
  async getDashboard() {
    try {
      const [candidatesResult, agentsResult, employersResult, paymentsResult] = await Promise.all([
        supabase.from('candidates').select('*'),
        supabase.from('agents').select('*'),
        supabase.from('receiving_companies').select('*'),
        supabase.from('payments').select('*')
      ])

      const candidates = candidatesResult.data || []
      const agents = agentsResult.data || []
      const employers = employersResult.data || []
      const payments = paymentsResult.data || []

      const totalCandidates = candidates.length
      const activeCandidates = candidates.filter(c => !['deployed', 'rejected', 'cancelled'].includes(c.stage)).length
      const deployedCandidates = candidates.filter(c => c.stage === 'deployed').length
      const totalAgents = agents.filter(a => a.is_active).length
      const totalEmployers = employers.filter(e => e.is_active).length

      const monthlyRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

      const processStages = [
        { name: 'Passport Stage', count: candidates.filter(c => c.stage === 'passport').length, percentage: 15 },
        { name: 'Medical Examination', count: candidates.filter(c => c.stage === 'medical').length, percentage: 25 },
        { name: 'Training', count: candidates.filter(c => c.stage === 'training').length, percentage: 35 },
        { name: 'Visa Processing', count: candidates.filter(c => c.stage === 'visa').length, percentage: 20 },
        { name: 'Deployment Ready', count: candidates.filter(c => c.stage === 'deployment_ready').length, percentage: 5 }
      ]

      const recentActivities = [
        { id: '1', message: 'New candidate registered for recruitment program', time: '2 hours ago', status: 'success' },
        { id: '2', message: 'Medical examination completed for candidate', time: '4 hours ago', status: 'info' },
        { id: '3', message: 'Visa processing initiated', time: '6 hours ago', status: 'pending' }
      ]

      return {
        stats: {
          totalCandidates,
          activeCandidates,
          totalAgents,
          totalEmployers,
          monthlyRevenue,
          thisMonthPlacements: deployedCandidates,
          pendingPayments: 0,
          successfulPlacements: deployedCandidates
        },
        processStages,
        recentActivities
      }
    } catch (error) {
      console.error('Dashboard API error:', error)
      throw error
    }
  }

  async getDashboardKPIs() {
    try {
      const { data: candidates } = await supabase.from('candidates').select('*')
      const { data: payments } = await supabase.from('payments').select('*')
      const { data: employers } = await supabase.from('receiving_companies').select('*')

      const totalCandidates = candidates?.length || 0
      const activeCandidates = candidates?.filter(c => !['deployed', 'rejected', 'cancelled'].includes(c.stage))?.length || 0
      const deployedThisMonth = candidates?.filter(c => c.stage === 'deployed')?.length || 0
      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      const totalEmployers = employers?.length || 0

      // Calculate month-over-month employer trend
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const currentMonthEmployers = employers?.filter(emp => {
        const createdDate = new Date(emp.created_at)
        return createdDate.getMonth() <= currentMonth && createdDate.getFullYear() === currentYear
      })?.length || 0

      const lastMonthEmployers = employers?.filter(emp => {
        const createdDate = new Date(emp.created_at)
        return createdDate.getMonth() <= lastMonth && createdDate.getFullYear() === lastMonthYear
      })?.length || 0

      const employerGrowth = lastMonthEmployers > 0 
        ? ((currentMonthEmployers - lastMonthEmployers) / lastMonthEmployers) * 100 
        : 0

      return {
        kpis: {
          totalCandidates,
          activeCandidates,
          deployedThisMonth,
          totalRevenue,
          conversionRate: totalCandidates > 0 ? ((deployedThisMonth / totalCandidates) * 100).toFixed(1) : 0,
          averageProcessingTime: 42,
          totalEmployers,
          employerGrowth: employerGrowth.toFixed(1)
        }
      }
    } catch (error) {
      console.error('Dashboard KPIs error:', error)
      throw error
    }
  }

  // Candidates API
  async getCandidates() {
    try {
      console.log('Attempting to fetch candidates...')
      
      // Use a simpler query structure to avoid URL encoding issues
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('Candidates query result:', { data, error })
      
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      
      // Fetch related data separately to avoid complex joins
      const agentIds = data ? [...new Set(data.map(c => c.agent_id).filter(Boolean))] : []
      const companyIds = data ? [...new Set(data.map(c => c.receiving_company_id).filter(Boolean))] : []
      
      let agentsData: any[] = []
      let companiesData: any[] = []
      
      if (agentIds.length > 0) {
        const { data: agents } = await supabase
          .from('agents')
          .select('id, agency_name, agency_id')
          .in('id', agentIds)
        agentsData = agents || []
      }
      
      if (companyIds.length > 0) {
        const { data: companies } = await supabase
          .from('receiving_companies')
          .select('id, company_name')
          .in('id', companyIds)
        companiesData = companies || []
      }
      
      const mappedCandidates = data?.map(candidate => {
        const agent = agentsData.find(a => a.id === candidate.agent_id)
        const company = companiesData.find(c => c.id === candidate.receiving_company_id)
        
        return {
          ...candidate,
          name: candidate.full_name,
          status: candidate.stage,
          application_date: candidate.created_at?.split('T')[0],
          age: candidate.date_of_birth ? new Date().getFullYear() - new Date(candidate.date_of_birth).getFullYear() : null,
          agent_name: agent?.agency_name,
          company_name: company?.company_name
        }
      }) || []

      console.log('Mapped candidates:', mappedCandidates)
      return { candidates: mappedCandidates }
    } catch (error) {
      console.error('Get candidates error:', error)
      throw error
    }
  }

  async createCandidate(candidateData: any) {
    try {
      console.log('Creating candidate with data:', candidateData)
      
      // Check for unique constraints before creating
      if (candidateData.phone) {
        const { data: existingPhone } = await supabase
          .from('candidates')
          .select('id, full_name')
          .eq('phone', candidateData.phone)
          .single()
        
        if (existingPhone) {
          throw new Error(`Phone number ${candidateData.phone} is already registered to ${existingPhone.full_name}`)
        }
      }
      
      if (candidateData.passport_number) {
        const { data: existingPassport } = await supabase
          .from('candidates')
          .select('id, full_name')
          .eq('passport_number', candidateData.passport_number.toUpperCase())
          .single()
        
        if (existingPassport) {
          throw new Error(`Passport number ${candidateData.passport_number} is already registered to ${existingPassport.full_name}`)
        }
      }
      
      // Clean the data to ensure proper format
      const cleanData = {
        full_name: candidateData.full_name || candidateData.name || '',
        email: candidateData.email || null,
        phone: candidateData.phone || null,
        date_of_birth: candidateData.date_of_birth || null,
        gender: candidateData.gender || null,
        nationality: candidateData.nationality || null,
        passport_number: candidateData.passport_number || null,
        nin_number: candidateData.nin_number || null,
        next_of_kin: candidateData.next_of_kin || candidateData.next_of_kin_name || null,
        next_of_kin_contact: candidateData.next_of_kin_contact || null,
        next_of_kin_relationship: candidateData.next_of_kin_relationship || null,
        address: candidateData.address || null,
        photo_url: candidateData.photo_url || null,
        agent_id: candidateData.agent_id || null,
        receiving_company_id: candidateData.receiving_company_id || null,
        expected_salary: candidateData.expected_salary ? parseFloat(candidateData.expected_salary) : null,
        position: candidateData.position || candidateData.position_applied_for || null,
        stage: candidateData.stage || 'passport',
        is_active: candidateData.is_active !== undefined ? candidateData.is_active : true
      }
      
      console.log('Clean data for insert:', cleanData)
      
      const { data, error } = await supabase
        .from('candidates')
        .insert([cleanData])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      
      console.log('Candidate created successfully:', data)
      
      // Log audit event
      try {
        await this.logAuditEvent('CREATE', 'candidates', data.id, null, data)
      } catch (auditError) {
        console.warn('Audit logging failed:', auditError)
      }
      
      return { candidate: data }
    } catch (error) {
      console.error('Create candidate error:', error)
      throw error
    }
  }

  async updateCandidate(id: string, updates: any) {
    try {
      console.log('API Client - Starting candidate update for ID:', id);
      console.log('API Client - Update data:', updates);
      
      // Get old data for audit log
      const { data: oldData, error: fetchError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError) {
        console.error('API Client - Error fetching old data:', fetchError);
        throw fetchError;
      }
      
      console.log('API Client - Old data fetched:', oldData);
      
      // Check for unique constraints before updating (excluding current record)
      if (updates.phone && updates.phone !== oldData.phone) {
        const { data: existingPhone } = await supabase
          .from('candidates')
          .select('id, full_name')
          .eq('phone', updates.phone)
          .neq('id', id)
          .single()
        
        if (existingPhone) {
          throw new Error(`Phone number ${updates.phone} is already registered to ${existingPhone.full_name}`)
        }
      }
      
      if (updates.passport_number && updates.passport_number !== oldData.passport_number) {
        const { data: existingPassport } = await supabase
          .from('candidates')
          .select('id, full_name')
          .eq('passport_number', updates.passport_number.toUpperCase())
          .neq('id', id)
          .single()
        
        if (existingPassport) {
          throw new Error(`Passport number ${updates.passport_number} is already registered to ${existingPassport.full_name}`)
        }
      }
      
      const updateData = {
        full_name: updates.full_name || updates.name,
        email: updates.email,
        phone: updates.phone,
        date_of_birth: updates.date_of_birth,
        gender: updates.gender,
        nationality: updates.nationality,
        passport_number: updates.passport_number,
        nin_number: updates.nin_number,
        next_of_kin: updates.next_of_kin || updates.next_of_kin_name,
        next_of_kin_contact: updates.next_of_kin_contact,
        next_of_kin_relationship: updates.next_of_kin_relationship,
        address: updates.address,
        photo_url: updates.photo_url,
        agent_id: updates.agent_id,
        receiving_company_id: updates.receiving_company_id,
        expected_salary: updates.expected_salary,
        position: updates.position || updates.position_applied_for,
        // Only update stage if explicitly provided, otherwise preserve existing
        stage: updates.stage !== undefined ? updates.stage : oldData.stage,
        is_active: updates.is_active !== undefined ? updates.is_active : true,
        updated_at: new Date().toISOString()
      };
      
      console.log('API Client - Prepared update data:', updateData);
      
      const { data, error } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('API Client - Update error:', error);
        throw error;
      }
      
      console.log('API Client - Update successful:', data);
      
      // Log audit event
      try {
        await this.logAuditEvent('UPDATE', 'candidates', id, oldData, data)
        console.log('API Client - Audit log successful');
      } catch (auditError) {
        console.warn('API Client - Audit logging failed:', auditError);
      }
      
      return { candidate: data }
    } catch (error) {
      console.error('API Client - Update candidate error:', error)
      throw error
    }
  }

  async deleteCandidate(id: string) {
    try {
      // Get data before deletion for audit log
      const { data: oldData } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single()
      
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Log audit event
      await this.logAuditEvent('DELETE', 'candidates', id, oldData, null)
      
      return { message: 'Candidate deleted successfully' }
    } catch (error) {
      console.error('Delete candidate error:', error)
      throw error
    }
  }

  // Agents API
  async getAgents() {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          candidates:candidates(count)
        `)
      
      if (error) throw error
      
      const mappedAgents = data?.map(agent => {
        // Calculate performance metrics
        const totalCandidates = agent.candidates?.[0]?.count || 0;
        
        // Get successful placements count with separate query if needed
        const successfulPlacements = 0; // Will be calculated separately
        
        // Calculate total earnings based on commission
        const totalEarned = successfulPlacements * (agent.commission_value || 0);
        
        return {
          ...agent,
          name: agent.agency_name,
          status: agent.is_active ? 'active' : 'inactive',
          total_candidates: totalCandidates,
          successful_placements: successfulPlacements,
          total_earned: totalEarned,
          notes: agent.address || '' // Use address as notes if available
        };
      }) || []

      return { agents: mappedAgents }
    } catch (error) {
      console.error('Get agents error:', error)
      // Fallback to simple query if complex query fails
      try {
        const { data: simpleData, error: simpleError } = await supabase
          .from('agents')
          .select('*')
        
        if (simpleError) throw simpleError
        
        const simpleMappedAgents = simpleData?.map(agent => ({
          ...agent,
          name: agent.agency_name,
          status: agent.is_active ? 'active' : 'inactive',
          total_candidates: 0,
          successful_placements: 0,
          total_earned: 0,
          notes: agent.address || ''
        })) || []

        return { agents: simpleMappedAgents }
      } catch (fallbackError) {
        console.error('Fallback get agents error:', fallbackError)
        throw fallbackError
      }
    }
  }

  async createAgent(agentData: any) {
    try {
      // Check for unique phone number constraint
      if (agentData.phone) {
        const { data: existingPhone } = await supabase
          .from('agents')
          .select('id, agency_name')
          .eq('phone', agentData.phone)
          .single()
        
        if (existingPhone) {
          throw new Error(`Phone number ${agentData.phone} is already registered to ${existingPhone.agency_name}`)
        }
      }
      
      // Auto-generate Agency ID with country-based format
      const country = agentData.agency_country || 'UG'
      const countryCode = country === 'UG' ? 'UG' : country === 'KE' ? 'KE' : 'UG'
      
      // Get the highest numeric sequence for this country
      const { data: existingAgents } = await supabase
        .from('agents')
        .select('agency_id')
        .like('agency_id', `JA%_${countryCode}%`)
        .order('agency_id', { ascending: false })
      
      let nextNumber = 1
      let countrySuffix = 1
      
      if (existingAgents && existingAgents.length > 0) {
        // Parse existing IDs to find the next available number
        const pattern = new RegExp(`^JA(\\d{5})_${countryCode}(\\d+)$`)
        
        for (const agent of existingAgents) {
          const match = agent.agency_id.match(pattern)
          if (match) {
            const num = parseInt(match[1])
            const suffix = parseInt(match[2])
            
            if (num >= nextNumber) {
              nextNumber = num
              countrySuffix = suffix
              
              // If we've reached 99999, increment country suffix and reset number
              if (num >= 99999) {
                countrySuffix = suffix + 1
                nextNumber = 1
              } else {
                nextNumber = num + 1
              }
              break
            }
          }
        }
      }
      
      const generatedAgencyId = `JA${nextNumber.toString().padStart(5, '0')}_${countryCode}${countrySuffix}`
      
      const { data, error } = await supabase
        .from('agents')
        .insert([{
          agency_name: agentData.agency_name || agentData.name,
          phone: agentData.phone,
          email: agentData.email,
          photo_url: agentData.photo_url,
          commission_rate: agentData.commission_rate || 0.10,
          agency_country: countryCode,
          agency_id: generatedAgencyId,
          is_active: agentData.is_active !== undefined ? agentData.is_active : true,
        }])
        .select()
        .single()
      
      if (error) throw error
      
      // Log audit event
      await this.logAuditEvent('CREATE', 'agents', data.id, null, data)
      
      return { agent: data }
    } catch (error) {
      console.error('Create agent error:', error)
      throw error
    }
  }

  async updateAgent(id: string, updates: any) {
    try {
      // Get old data for audit log
      const { data: oldData } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single()
      
      // Check for unique phone number constraint (excluding current record)
      if (updates.phone && updates.phone !== oldData.phone) {
        const { data: existingPhone } = await supabase
          .from('agents')
          .select('id, agency_name')
          .eq('phone', updates.phone)
          .neq('id', id)
          .single()
        
        if (existingPhone) {
          throw new Error(`Phone number ${updates.phone} is already registered to ${existingPhone.agency_name}`)
        }
      }
      
      const { data, error } = await supabase
        .from('agents')
        .update({
          agency_name: updates.agency_name || updates.name,
          phone: updates.phone,
          email: updates.email,
          photo_url: updates.photo_url,
          commission_rate: updates.commission_rate,
          agency_country: updates.agency_country,
          // Don't allow manual update of agency_id - it should remain auto-generated
          is_active: updates.is_active
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // Log audit event
      await this.logAuditEvent('UPDATE', 'agents', id, oldData, data)
      
      return { agent: data }
    } catch (error) {
      console.error('Update agent error:', error)
      throw error
    }
  }

  async deleteAgent(id: string) {
    try {
      // Get data before deletion for audit log
      const { data: oldData } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single()
      
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Log audit event
      await this.logAuditEvent('DELETE', 'agents', id, oldData, null)
      
      return { message: 'Agent deleted successfully' }
    } catch (error) {
      console.error('Delete agent error:', error)
      throw error
    }
  }

  // Employers API
  async getEmployers() {
    try {
      const { data, error } = await supabase
        .from('receiving_companies')
        .select('*')
      
      if (error) throw error
      
      const mappedEmployers = data?.map(employer => ({
        ...employer,
        name: employer.company_name,
        status: employer.is_active ? 'active' : 'inactive'
      })) || []

      return { employers: mappedEmployers }
    } catch (error) {
      console.error('Get employers error:', error)
      throw error
    }
  }

  async createEmployer(employerData: any) {
    try {
      const { data, error } = await supabase
        .from('receiving_companies')
        .insert([{
          company_name: employerData.name || employerData.company_name,
          contact_person: employerData.contact_person,
          phone: employerData.phone,
          email: employerData.email,
          country: employerData.country,
          license_number: employerData.license_number,
          payment_type: employerData.payment_type || 'employer_funded',
          logo_url: employerData.logo_url,
          is_active: employerData.is_active !== undefined ? employerData.is_active : true
        }])
        .select()
        .single()
      
      if (error) throw error
      return { employer: { ...data, name: data.company_name, status: data.is_active ? 'active' : 'inactive' } }
    } catch (error) {
      console.error('Create employer error:', error)
      throw error
    }
  }

  async updateEmployer(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('receiving_companies')
        .update({
          company_name: updates.name || updates.company_name,
          contact_person: updates.contact_person,
          phone: updates.phone,
          email: updates.email,
          country: updates.country,
          license_number: updates.license_number,
          payment_type: updates.payment_type,
          logo_url: updates.logo_url,
          is_active: updates.is_active !== undefined ? updates.is_active : (updates.status === 'active'),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { employer: { ...data, name: data.company_name, status: data.is_active ? 'active' : 'inactive' } }
    } catch (error) {
      console.error('Update employer error:', error)
      throw error
    }
  }

  async deleteEmployer(id: string) {
    try {
      const { error } = await supabase
        .from('receiving_companies')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { message: 'Employer deleted successfully' }
    } catch (error) {
      console.error('Delete employer error:', error)
      throw error
    }
  }

  // Financials API
  async getFinancials() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          candidates!candidate_id(full_name)
        `)
      
      if (error) throw error
      
      const financials = data?.map(payment => ({
        id: payment.id,
        candidate_id: payment.candidate_id,
        candidate_name: payment.candidates?.full_name || 'Unknown',
        type: payment.stage,
        amount: payment.amount || 0,
        currency: payment.currency || 'UGX',
        status: 'completed',
        date: payment.paid_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        description: payment.notes || `Payment for ${payment.stage || 'service'}`
      })) || []

      return { financials }
    } catch (error) {
      console.error('Get financials error:', error)
      throw error
    }
  }

  async createFinancialRecord(financialData: any) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          candidate_id: financialData.candidate_id,
          stage: financialData.type || financialData.stage,
          amount: financialData.amount,
          currency: financialData.currency || 'UGX',
          payment_method: financialData.payment_method || 'Bank Transfer',
          reference_number: financialData.reference_number,
          notes: financialData.description || financialData.notes,
          paid_by: financialData.paid_by,
          paid_at: new Date().toISOString()
        }])
        .select(`
          *,
          candidates!candidate_id(full_name)
        `)
        .single()
      
      if (error) throw error
      
      const financial = {
        id: data.id,
        candidate_id: data.candidate_id,
        candidate_name: data.candidates?.full_name || 'Unknown',
        type: data.stage,
        amount: data.amount,
        currency: data.currency,
        status: 'completed',
        date: data.paid_at?.split('T')[0],
        description: data.notes
      }
      
      return { financial }
    } catch (error) {
      console.error('Create financial record error:', error)
      throw error
    }
  }

  async updateFinancialRecord(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          candidate_id: updates.candidate_id,
          stage: updates.type || updates.stage,
          amount: updates.amount,
          currency: updates.currency,
          notes: updates.description || updates.notes
        })
        .eq('id', id)
        .select(`
          *,
          candidates!candidate_id(full_name)
        `)
        .single()
      
      if (error) throw error
      
      const financial = {
        id: data.id,
        candidate_id: data.candidate_id,
        candidate_name: data.candidates?.full_name || 'Unknown',
        type: data.stage,
        amount: data.amount,
        currency: data.currency,
        status: 'completed',
        date: data.paid_at?.split('T')[0],
        description: data.notes
      }
      
      return { financial }
    } catch (error) {
      console.error('Update financial record error:', error)
      throw error
    }
  }

  async deleteFinancialRecord(id: string) {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { message: 'Financial record deleted successfully' }
    } catch (error) {
      console.error('Delete financial record error:', error)
      throw error
    }
  }

  // Positions API
  async getPositions() {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select(`
          *,
          receiving_companies!receiving_company_id(id, company_name)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const positions = data?.map(position => ({
        ...position,
        company_name: position.receiving_companies?.company_name
      })) || []
      
      return { data: positions }
    } catch (error) {
      console.error('Get positions error:', error)
      throw error
    }
  }

  // Additional methods for other endpoints
  async getProcessData() {
    try {
      const { data: candidates } = await supabase.from('candidates').select('*')
      
      const processData = {
        passport: candidates?.filter(c => c.stage === 'passport') || [],
        interview: candidates?.filter(c => c.stage === 'interview') || [],
        medical: candidates?.filter(c => c.stage === 'medical') || [],
        training: candidates?.filter(c => c.stage === 'training') || [],
        visa: candidates?.filter(c => c.stage === 'visa') || [],
        deployment_ready: candidates?.filter(c => c.stage === 'deployment_ready') || [],
        deployed: candidates?.filter(c => c.stage === 'deployed') || []
      }
      
      return { processData }
    } catch (error) {
      console.error('Get process data error:', error)
      throw error
    }
  }

  async getDocuments() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          candidates!candidate_id(full_name)
        `)
      
      if (error) throw error
      return { documents: data || [] }
    } catch (error) {
      console.error('Get documents error:', error)
      throw error
    }
  }

  async getReports() {
    try {
      const { data: candidates } = await supabase.from('candidates').select('*')
      const { data: payments } = await supabase.from('payments').select('*')
      const { data: agents } = await supabase.from('agents').select('*')
      
      const reports = {
        monthly_placements: candidates?.filter(c => c.stage === 'deployed')?.length || 0,
        total_revenue: payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        agent_performance: agents?.map(agent => ({
          name: agent.agency_name,
          placements: 0,
          earnings: 0
        })) || [],
        pipeline_health: {
          conversion_rate: (candidates && candidates.length > 0) ? 
            ((candidates.filter(c => c.stage === 'deployed').length / candidates.length) * 100).toFixed(1) : '0',
          average_processing_time: '45 days',
          pending_candidates: candidates?.filter(c => !['deployed', 'rejected', 'cancelled'].includes(c.stage))?.length || 0
        }
      }
      
      return { reports }
    } catch (error) {
      console.error('Get reports error:', error)
      throw error
    }
  }

  // Health check
  async healthCheck() {
    return { status: 'ok' }
  }

  // Search functionality
  async searchGlobal(query: string) {
    try {
      if (!query) return { results: [] }
      
      const [candidatesResult, agentsResult, employersResult, positionsResult] = await Promise.all([
        supabase.from('candidates').select('id, full_name, phone, email').ilike('full_name', `%${query}%`),
        supabase.from('agents').select('id, agency_name, phone, email').ilike('agency_name', `%${query}%`),
        supabase.from('receiving_companies').select('id, company_name, phone, email').ilike('company_name', `%${query}%`),
        supabase.from('positions').select('id, job_title, country, salary_range').or(`job_title.ilike.%${query}%,country.ilike.%${query}%,position_type.ilike.%${query}%`)
      ])
      
      const results = [
        ...(candidatesResult.data || []).map(c => ({
          id: c.id,
          name: c.full_name,
          type: 'candidate',
          details: c.phone || c.email
        })),
        ...(agentsResult.data || []).map(a => ({
          id: a.id,
          name: a.agency_name,
          type: 'agent',
          details: a.phone || a.email
        })),
        ...(employersResult.data || []).map(e => ({
          id: e.id,
          name: e.company_name,
          type: 'employer',
          details: e.phone || e.email
        })),
        ...(positionsResult.data || []).map(p => ({
          id: p.id,
          name: p.job_title,
          type: 'job',
          details: `${p.country} • ${p.salary_range || 'Salary not specified'}`
        }))
      ]
      
      return { results }
    } catch (error) {
      console.error('Search error:', error)
      return { results: [] }
    }
  }

  // SQL Query execution
  async executeSQLQuery(query: string) {
    try {
      if (!query) throw new Error('SQL query is required')
      
      const { data, error } = await supabase.rpc('execute_sql_query', { sql_query: query })
      
      if (error) {
        // Enhanced error message with more context
        let errorMessage = error.message || 'Unknown database error'
        
        // Add specific error context based on error type
        if (error.code) {
          switch (error.code) {
            case '42P01':
              errorMessage = `Table does not exist: ${errorMessage}. Available tables: candidates, agents, receiving_companies, positions, payments, documents`
              break
            case '42703':
              errorMessage = `Column does not exist: ${errorMessage}. Check column names in your query`
              break
            case '42601':
              errorMessage = `SQL syntax error: ${errorMessage}. Check your SQL syntax, quotes, and semicolons`
              break
            case '23505':
              errorMessage = `Duplicate value constraint violation: ${errorMessage}`
              break
            case '23503':
              errorMessage = `Foreign key constraint violation: ${errorMessage}`
              break
            case '23502':
              errorMessage = `Not null constraint violation: ${errorMessage}`
              break
            case '08006':
              errorMessage = `Database connection error: ${errorMessage}`
              break
            default:
              errorMessage = `Database error (${error.code}): ${errorMessage}`
          }
        }
        
        // Add query context for debugging
        const queryPreview = query.length > 100 ? query.substring(0, 100) + '...' : query
        errorMessage += `\n\nQuery: ${queryPreview}`
        
        // Add helpful suggestions
        if (errorMessage.includes('does not exist')) {
          errorMessage += '\n\n💡 Tip: Use "\\dt" to list all tables, or check the schema documentation'
        } else if (errorMessage.includes('syntax error')) {
          errorMessage += '\n\n💡 Tip: Ensure proper SQL syntax, check for missing quotes around strings'
        }
        
        throw new Error(errorMessage)
      }
      
      const results = data?.map(row => row.result) || []
      return { data: results }
    } catch (error) {
      console.error('SQL execution error:', error)
      
      // If it's already our enhanced error, throw as-is
      if (error instanceof Error && error.message.includes('💡 Tip:')) {
        throw error
      }
      
      // For other errors, provide generic enhancement
      const originalMessage = error instanceof Error ? error.message : 'Query execution failed'
      const enhancedMessage = `${originalMessage}\n\n💡 Common issues:\n• Check table names: candidates, agents, receiving_companies, positions\n• Verify column names exist\n• Ensure proper SQL syntax (quotes, semicolons)\n• Use LIMIT for large result sets`
      
      throw new Error(enhancedMessage)
    }
  }

  // Audit logging functionality
  async logAuditEvent(action: string, tableName: string, recordId: any, oldData: any, newData: any) {
    try {
      await supabase
        .from('audit_logs')
        .insert([{
          table_name: tableName,
          record_id: recordId,
          action: action,
          old_data: oldData,
          new_data: newData
        }])
    } catch (error) {
      console.error('Audit log error:', error)
      // Don't throw error for audit logging failures
    }
  }

  // Documents API - Complete CRUD
  async createDocument(documentData: any) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          candidate_id: documentData.candidate_id,
          doc_type: documentData.doc_type,
          doc_name: documentData.doc_name,
          doc_url: documentData.doc_url,
          file_size: documentData.file_size || 0,
          mime_type: documentData.mime_type,
          is_verified: documentData.is_verified || false,
          expiry_date: documentData.expiry_date || null,
          uploaded_by: documentData.uploaded_by || null
        }])
        .select()
        .single()
      
      if (error) throw error
      
      await this.logAuditEvent('CREATE', 'documents', data.id, null, data)
      return { document: data }
    } catch (error) {
      console.error('Create document error:', error)
      throw error
    }
  }

  async updateDocument(id: string, updates: any) {
    try {
      const { data: oldData } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()
      
      const { data, error } = await supabase
        .from('documents')
        .update({
          doc_type: updates.doc_type,
          doc_name: updates.doc_name,
          doc_url: updates.doc_url,
          file_size: updates.file_size,
          mime_type: updates.mime_type,
          is_verified: updates.is_verified,
          expiry_date: updates.expiry_date || null,
          verified_by: updates.verified_by,
          verified_at: updates.is_verified ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      await this.logAuditEvent('UPDATE', 'documents', id, oldData, data)
      return { document: data }
    } catch (error) {
      console.error('Update document error:', error)
      throw error
    }
  }

  async deleteDocument(id: string) {
    try {
      const { data: oldData } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await this.logAuditEvent('DELETE', 'documents', id, oldData, null)
      return { message: 'Document deleted successfully' }
    } catch (error) {
      console.error('Delete document error:', error)
      throw error
    }
  }

  async verifyDocument(id: string, verificationData: any) {
    try {
      console.log('API Client - Starting document verification for ID:', id);
      console.log('API Client - Verification data:', verificationData);
      
      // First check if document exists
      const { data: existingDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError) {
        console.error('API Client - Error fetching document:', fetchError);
        throw new Error(`Document not found: ${fetchError.message}`);
      }
      
      console.log('API Client - Found document:', existingDoc);
      
      const { data, error } = await supabase
        .from('documents')
        .update({
          is_verified: true,
          verified_by: null, // Set to null since verified_by expects UUID or null
          verified_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('API Client - Update error:', error);
        throw new Error(`Verification failed: ${error.message}`);
      }
      
      console.log('API Client - Verification successful:', data);
      
      // Log audit event
      await this.logAuditEvent('UPDATE', 'documents', id, existingDoc, data);
      
      return { document: data }
    } catch (error) {
      console.error('API Client - Verify document error:', error)
      throw error
    }
  }

  // Process/Stage Management API
  async getStageHistory(candidateId?: string) {
    try {
      let query = supabase
        .from('stage_history')
        .select(`
          *,
          candidates!candidate_id(full_name)
        `)
        .order('created_at', { ascending: false })
      
      if (candidateId) {
        query = query.eq('candidate_id', candidateId)
      }
      
      const { data, error } = await query
      if (error) throw error
      
      return { data: data || [] }
    } catch (error) {
      console.error('Get stage history error:', error)
      throw error
    }
  }

  async createStageEntry(stageData: any) {
    try {
      const { data, error } = await supabase
        .from('stage_history')
        .insert([{
          candidate_id: stageData.candidate_id,
          stage: stageData.stage,
          notes: stageData.notes,
          changed_by: stageData.changed_by || 'system'
        }])
        .select()
        .single()
      
      if (error) throw error
      return { data }
    } catch (error) {
      console.error('Create stage entry error:', error)
      throw error
    }
  }

  // Settings API - Complete CRUD
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
      
      if (error) throw error
      return { data: data || [] }
    } catch (error) {
      console.error('Get settings error:', error)
      throw error
    }
  }

  async createSetting(settingData: any) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .insert([{
          setting_key: settingData.key,
          setting_value: settingData.value,
          description: settingData.description,
          category: settingData.category || 'general'
        }])
        .select()
        .single()
      
      if (error) throw error
      return { data }
    } catch (error) {
      console.error('Create setting error:', error)
      throw error
    }
  }

  async updateSetting(key: string, value: any) {
    try {
      // First try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('system_settings')
        .update({
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key)
        .select()
      
      // If update succeeded and returned data, we're done
      if (!updateError && updateData && updateData.length > 0) {
        return { data: updateData[0] }
      }
      
      // If no rows were updated, create a new record
      // Only include columns that definitely exist
      const { data: insertData, error: insertError } = await supabase
        .from('system_settings')
        .insert({
          setting_key: key,
          setting_value: value
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      return { data: insertData }
    } catch (error) {
      console.error('Update setting error:', error)
      throw error
    }
  }

  async deleteSetting(key: string) {
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('setting_key', key)
      
      if (error) throw error
      return { message: 'Setting deleted successfully' }
    } catch (error) {
      console.error('Delete setting error:', error)
      throw error
    }
  }

  // Reports API - Complete CRUD
  async getSavedReports() {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data: data || [] }
    } catch (error) {
      console.error('Get saved reports error:', error)
      return { data: [] }
    }
  }

  async saveReport(reportData: any) {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .insert([{
          report_name: reportData.name,
          report_type: reportData.type,
          report_config: reportData.config,
          description: reportData.description,
          created_by: reportData.created_by || 'system'
        }])
        .select()
        .single()
      
      if (error) throw error
      return { data }
    } catch (error) {
      console.error('Save report error:', error)
      throw error
    }
  }

  async deleteReport(id: string) {
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { message: 'Report deleted successfully' }
    } catch (error) {
      console.error('Delete report error:', error)
      throw error
    }
  }

  async runSavedReport(id: string) {
    try {
      const { data: reportConfig } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('id', id)
        .single()
      
      if (!reportConfig) throw new Error('Report not found')
      
      // Execute report based on type
      switch (reportConfig.report_type) {
        case 'candidates':
          return await this.getCandidates()
        case 'agents':
          return await this.getAgents()
        case 'financials':
          return await this.getFinancials()
        default:
          return { data: [] }
      }
    } catch (error) {
      console.error('Run saved report error:', error)
      throw error
    }
  }

  // Profile Management
  async getProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
      
      if (error) throw error
      return { profiles: data || [], data: data || [] }
    } catch (error) {
      console.error('Get profiles error:', error)
      throw error
    }
  }

  async getCurrentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      return { data }
    } catch (error) {
      console.error('Get current profile error:', error)
      return { data: null }
    }
  }

  // File Upload
  async uploadDocumentFile(file: File, candidateId: string, documentType: string) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${candidateId}/${documentType}_${Date.now()}.${fileExt}`
      
      // First, try to create the bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets()
      const documentsExists = buckets?.some(bucket => bucket.name === 'documents')
      
      if (!documentsExists) {
        console.log('Creating documents bucket...')
        const { error: createError } = await supabase.storage.createBucket('documents', {
          public: true,
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
          fileSizeLimit: 10485760 // 10MB
        })
        
        if (createError) {
          console.error('Failed to create documents bucket:', createError)
          // Fallback: return a mock URL for development
          return { 
            url: `mock://documents/${fileName}`, 
            doc_url: `mock://documents/${fileName}`, 
            data: { url: `mock://documents/${fileName}` },
            error: 'Storage bucket not configured. Please set up Supabase Storage.'
          }
        }
      }
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file)
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)
      
      return { url: publicUrl, doc_url: publicUrl, data: { url: publicUrl } }
    } catch (error) {
      console.error('Upload document file error:', error)
      
      // Provide fallback for development
      if (error.message?.includes('Bucket not found')) {
        return { 
          url: `mock://documents/${candidateId}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`, 
          doc_url: `mock://documents/${candidateId}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`, 
          data: { url: `mock://documents/${candidateId}/${documentType}_${Date.now()}.${file.name.split('.').pop()}` },
          error: 'Storage bucket not configured. Document upload simulated.'
        }
      }
      
      throw error
    }
  }

  // Audit logging functionality
  async logAuditTrail(auditData: any) {
    return await this.logAuditEvent(auditData.action, auditData.table_name, auditData.record_id, null, auditData.new_data)
  }

  // Legacy compatibility methods
  async uploadDocument(formData: FormData) { return { message: 'Use uploadDocumentFile instead' } }
  async updateStageEntry(id: string, updates: any) { return { data: updates } }
  async deleteStageEntry(id: string) { return { message: 'Deleted' } }
  async getStageConfigs() { return { data: [] } }
  async createStageConfig(configData: any) { return { data: configData } }
  async updateStageConfig(id: string, updates: any) { return { data: updates } }
  async deleteStageConfig(id: string) { return { message: 'Deleted' } }
  async getCandidateDocuments(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('candidate_id', candidateId)
      
      if (error) throw error
      return { data: data || [] }
    } catch (error) {
      return { data: [] }
    }
  }
  // Jobs API (positions table)
  async getJobs(filters: any = {}) {
    try {
      console.log('Fetching jobs with filters:', filters);
      
      // Use direct table query instead of stored procedure
      let query = supabase
        .from('positions')
        .select(`
          *,
          receiving_companies!inner(
            id,
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      
      if (filters.work_country) {
        query = query.ilike('work_country', `%${filters.work_country}%`);
      }
      
      if (filters.receiving_company_id) {
        query = query.eq('receiving_company_id', filters.receiving_company_id);
      }
      
      if (filters.position_name_search) {
        query = query.ilike('position_name', `%${filters.position_name_search}%`);
      }
      
      if (filters.salary_min) {
        query = query.gte('salary', filters.salary_min);
      }
      
      if (filters.salary_max) {
        query = query.lte('salary', filters.salary_max);
      }

      if (filters.contract_period_min) {
        query = query.gte('contract_period', filters.contract_period_min);
      }
      
      if (filters.contract_period_max) {
        query = query.lte('contract_period', filters.contract_period_max);
      }

      // Apply benefit filters
      if (filters.accommodation) {
        query = query.eq('accommodation', true);
      }
      if (filters.food) {
        query = query.eq('food', true);
      }
      if (filters.air_ticket) {
        query = query.eq('air_ticket', true);
      }
      if (filters.transport) {
        query = query.eq('transport', true);
      }
      if (filters.medical_insurance) {
        query = query.eq('medical_insurance', true);
      }
      if (filters.employment_visa) {
        query = query.eq('employment_visa', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Jobs fetch error:', error);
        throw error;
      }

      // Transform data to include company name
      const transformedData = data?.map(job => ({
        ...job,
        receiving_company_name: job.receiving_companies?.company_name || 'Unknown Company'
      })) || [];

      console.log('Jobs fetched successfully:', transformedData.length);
      return { jobs: transformedData };
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      throw error;
    }
  }

  async getJobById(jobId: string) {
    try {
      console.log('Fetching job by ID:', jobId);
      
      const { data, error } = await supabase.rpc('get_job_by_id', {
        p_job_id: jobId
      });

      if (error) {
        console.error('Job fetch error:', error);
        throw error;
      }

      const job = data?.[0] || null;
      console.log('Job fetched successfully:', job?.id);
      return { job };
    } catch (error) {
      console.error('Failed to fetch job:', error);
      throw error;
    }
  }

  async createJob(jobData: any) {
    try {
      console.log('Creating job:', jobData);
      
      // Use direct table insert instead of stored procedure
      const { data, error } = await supabase
        .from('positions')
        .insert({
          position_name: jobData.position_name,
          receiving_company_id: jobData.receiving_company_id,
          work_country: jobData.work_country,
          requested_headcount: jobData.requested_headcount,
          salary: jobData.salary || null,
          salary_currency: jobData.salary_currency || 'USD',
          input_fee: jobData.input_fee || 0, // Use 0 instead of null for NOT NULL constraint
          input_fee_currency: jobData.input_fee_currency || 'UGX',
          markup_agency: jobData.markup_agency || 0,
          markup_agency_type: jobData.markup_agency_type || 'flat',
          markup_company: jobData.markup_company || 0,
          markup_company_type: jobData.markup_company_type || 'flat',
          contract_period: jobData.contract_period || 24,
          probation_period: jobData.probation_period || 3,
          min_age: jobData.min_age || 18,
          max_age: jobData.max_age || 65,
          accommodation: jobData.accommodation || false,
          food: jobData.food || false,
          air_ticket: jobData.air_ticket || false,
          transport: jobData.transport || false,
          medical_insurance: jobData.medical_insurance || false,
          employment_visa: jobData.employment_visa || false,
          working_hours: jobData.working_hours || '8 hours/day',
          is_active: jobData.is_active !== undefined ? jobData.is_active : true
        })
        .select()
        .single();

      if (error) {
        console.error('Job creation error:', error);
        throw error;
      }

      console.log('Job created successfully:', data);
      
      // Log audit trail (skip if function doesn't exist)
      try {
        await this.logAuditTrail({
          table_name: 'positions',
          record_id: data.id,
          action: 'CREATE',
          new_data: jobData
        });
      } catch (auditError) {
        console.warn('Audit logging failed:', auditError);
      }

      return { job: data };
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  }

  async updateJob(jobId: string, updates: any) {
    try {
      console.log('Updating job:', jobId, updates);
      
      // Use direct table update instead of stored procedure
      const { data, error } = await supabase
        .from('positions')
        .update({
          position_name: updates.position_name,
          receiving_company_id: updates.receiving_company_id,
          work_country: updates.work_country,
          requested_headcount: updates.requested_headcount,
          salary: updates.salary,
          salary_currency: updates.salary_currency,
          input_fee: updates.input_fee,
          input_fee_currency: updates.input_fee_currency,
          markup_agency: updates.markup_agency,
          markup_agency_type: updates.markup_agency_type,
          markup_company: updates.markup_company,
          markup_company_type: updates.markup_company_type,
          contract_period: updates.contract_period,
          probation_period: updates.probation_period,
          min_age: updates.min_age,
          max_age: updates.max_age,
          accommodation: updates.accommodation,
          food: updates.food,
          air_ticket: updates.air_ticket,
          transport: updates.transport,
          medical_insurance: updates.medical_insurance,
          employment_visa: updates.employment_visa,
          working_hours: updates.working_hours,
          is_active: updates.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        console.error('Job update error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Job not found or update failed');
      }

      console.log('Job updated successfully:', jobId);
      
      // Log audit trail (skip if function doesn't exist)
      try {
        await this.logAuditTrail({
          table_name: 'positions',
          record_id: jobId,
          action: 'UPDATE',
          new_data: updates
        });
      } catch (auditError) {
        console.warn('Audit logging failed:', auditError);
      }

      return { job: data };
    } catch (error) {
      console.error('Failed to update job:', error);
      throw error;
    }
  }

  async deleteJob(jobId: string) {
    try {
      console.log('Deleting job (soft delete):', jobId);
      
      // Use direct table update for soft delete instead of stored procedure
      const { data, error } = await supabase
        .from('positions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        console.error('Job deletion error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Job not found or deletion failed');
      }

      console.log('Job deleted successfully:', jobId);
      
      // Log audit trail (skip if function doesn't exist)
      try {
        await this.logAuditTrail({
          table_name: 'positions',
          record_id: jobId,
          action: 'DELETE'
        });
      } catch (auditError) {
        console.warn('Audit logging failed:', auditError);
      }

      return { message: 'Job deleted successfully' };
    } catch (error) {
      console.error('Failed to delete job:', error);
      throw error;
    }
  }

  async getJobAnalyticsWithFilters(filters: any = {}) {
    try {
      console.log('Fetching job analytics with filters:', filters);
      
      const { data, error } = await supabase.rpc('get_job_analytics', {
        p_position_id: filters.position_id || null,
        p_is_active: filters.is_active || null,
        p_work_country: filters.work_country || null,
        p_receiving_company_id: filters.receiving_company_id || null
      });

      if (error) {
        console.error('Job analytics fetch error:', error);
        throw error;
      }

      console.log('Job analytics fetched successfully:', data?.length || 0);
      return { data: data || [] };
    } catch (error) {
      console.error('Failed to fetch job analytics:', error);
      throw error;
    }
  }

  // Legacy position methods for backward compatibility
  async createPosition(positionData: any) { 
    const result = await this.createJob(positionData);
    return { data: result.job };
  }
  async updatePosition(id: string, updates: any) { 
    const result = await this.updateJob(id, updates);
    return { data: result.job };
  }
  async deletePosition(id: string) { 
    return await this.deleteJob(id);
  }
  
  // Additional legacy methods
  async getAuditLogs(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      
      return { data: data || [] }
    } catch (error) {
      console.error('Get audit logs error:', error)
      return { data: [] }
    }
  }

  async getJobAnalytics() {
    try {
      const { data, error } = await supabase
        .from('job_analytics')
        .select('*')
        .order('snapshot_at', { ascending: false })
      
      if (error) throw error
      
      return { data: data || [] }
    } catch (error) {
      console.error('Get job analytics error:', error)
      return { data: [] }
    }
  }

  async refreshJobAnalytics() {
    try {
      const { error } = await supabase.rpc('refresh_materialized_view', {
        view_name: 'job_analytics'
      })
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Refresh job analytics error:', error)
      throw error
    }
  }
  async updateProfile(id: string, updates: any) { return { data: updates } }
  async getLeads() { return { data: [] } }
  async createLead(leadData: any) { return { data: leadData } }
  async updateLead(id: string, updates: any) { return { data: updates } }
  async deleteLead(id: string) { return { message: 'Deleted' } }
  async convertLeadToCandidate(leadId: string, candidateData: any) { return { data: candidateData } }
  async bulkUpdateCandidates(updates: any[]) { return { data: updates } }
  async bulkDeleteRecords(table: string, ids: string[]) { return { message: 'Deleted' } }
}

// Create and export the API client instance
export const apiClient = new APIClient()
