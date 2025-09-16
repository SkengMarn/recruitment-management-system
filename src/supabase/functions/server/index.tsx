import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Health check endpoint
app.get("/make-server-968517b8/health", (c) => {
  return c.json({ status: "ok" });
});

// Dashboard endpoint
app.get("/make-server-968517b8/dashboard", async (c) => {
  try {
    // Fetch data from actual database tables
    const { data: candidates } = await supabase.from('candidates').select('*');
    const { data: agents } = await supabase.from('agents').select('*');
    const { data: employers } = await supabase.from('receiving_companies').select('*');
    const { data: payments } = await supabase.from('payments').select('*');

    // Calculate dashboard statistics
    const totalCandidates = candidates?.length || 0;
    const activeCandidates = candidates?.filter(c => !['deployed', 'rejected', 'cancelled'].includes(c.stage))?.length || 0;
    const deployedCandidates = candidates?.filter(c => c.stage === 'deployed')?.length || 0;
    const totalAgents = agents?.filter(a => a.is_active)?.length || 0;
    const totalEmployers = employers?.filter(e => e.is_active)?.length || 0;

    // Calculate financial metrics
    const completedPayments = payments?.filter(p => p.stage === 'deployment' && p.amount) || [];
    const monthlyRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Process stages
    const processStages = [
      {
        name: 'Passport Stage',
        count: candidates?.filter(c => c.stage === 'passport')?.length || 0,
        percentage: 15
      },
      {
        name: 'Medical Examination',
        count: candidates?.filter(c => c.stage === 'medical')?.length || 0,
        percentage: 25
      },
      {
        name: 'Training',
        count: candidates?.filter(c => c.stage === 'training')?.length || 0,
        percentage: 35
      },
      {
        name: 'Visa Processing',
        count: candidates?.filter(c => c.stage === 'visa')?.length || 0,
        percentage: 20
      },
      {
        name: 'Deployment Ready',
        count: candidates?.filter(c => c.stage === 'deployment_ready')?.length || 0,
        percentage: 5
      }
    ];

    // Recent activities
    const recentActivities = [
      {
        id: '1',
        message: 'New candidate registered for recruitment program',
        time: '2 hours ago',
        status: 'success'
      },
      {
        id: '2',
        message: 'Medical examination completed for candidate',
        time: '4 hours ago',
        status: 'info'
      },
      {
        id: '3',
        message: 'Visa processing initiated',
        time: '6 hours ago',
        status: 'pending'
      }
    ];

    return c.json({
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
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// Candidates endpoints
app.get("/make-server-968517b8/candidates", async (c) => {
  try {
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select(`
        *,
        agents!agent_id(*),
        receiving_companies!receiving_company_id(*)
      `);
    
    if (error) {
      console.error('Supabase error:', error);
      return c.json({ error: 'Failed to fetch candidates' }, 500);
    }

    // Map candidates to include compatibility fields
    const mappedCandidates = candidates?.map(candidate => ({
      ...candidate,
      name: candidate.full_name,
      status: candidate.stage,
      application_date: candidate.created_at?.split('T')[0],
      age: candidate.date_of_birth ? new Date().getFullYear() - new Date(candidate.date_of_birth).getFullYear() : null,
      investment_amount: 2469000,
      employer_fee: 3500000,
      service_fee_paid: false,
      medical_status: 'not_started',
      training_status: 'not_started',
      visa_status: 'not_started',
      refund_status: 'pending',
      deployment_date: candidate.stage === 'deployed' ? candidate.stage_updated_at?.split('T')[0] : null
    })) || [];

    return c.json({ candidates: mappedCandidates });
  } catch (error) {
    console.error('Get candidates error:', error);
    return c.json({ error: 'Failed to fetch candidates' }, 500);
  }
});

app.post("/make-server-968517b8/candidates", async (c) => {
  try {
    const candidateData = await c.req.json();
    
    // Check for duplicate passport number
    if (candidateData.passport_number) {
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('id, full_name')
        .eq('passport_number', candidateData.passport_number)
        .single();
      
      if (existingCandidate) {
        return c.json({ 
          error: `Passport number already exists for candidate: ${existingCandidate.full_name}` 
        }, 400);
      }
    }
    
    // Prepare candidate data for insertion
    const newCandidate = {
      ...candidateData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stage_updated_at: new Date().toISOString(),
      stage: candidateData.stage || 'passport',
      is_active: candidateData.is_active !== undefined ? candidateData.is_active : true
    };
    
    const { data, error } = await supabase
      .from('candidates')
      .insert([newCandidate])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return c.json({ error: 'Failed to create candidate' }, 500);
    }
    
    // Log audit event
    await logAuditEvent('CREATE', 'candidates', data.id, newCandidate);
    
    return c.json({ candidate: data });
  } catch (error) {
    console.error('Create candidate error:', error);
    return c.json({ error: 'Failed to create candidate' }, 500);
  }
});

app.put("/make-server-968517b8/candidates/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Check for duplicate passport number (excluding current candidate)
    if (updates.passport_number) {
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('id, full_name')
        .eq('passport_number', updates.passport_number)
        .neq('id', id)
        .single();
      
      if (existingCandidate) {
        return c.json({ 
          error: `Passport number already exists for candidate: ${existingCandidate.full_name}` 
        }, 400);
      }
    }
    
    // Get current candidate for audit log
    const { data: oldCandidate } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!oldCandidate) {
      return c.json({ error: 'Candidate not found' }, 404);
    }
    
    // Prepare update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      // Update stage timestamp if stage changed
      ...(updates.stage && updates.stage !== oldCandidate.stage && {
        stage_updated_at: new Date().toISOString()
      })
    };
    
    const { data, error } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      return c.json({ error: 'Failed to update candidate' }, 500);
    }
    
    // Log audit event
    await logAuditEvent('UPDATE', 'candidates', id, { before: oldCandidate, after: data });
    
    return c.json({ candidate: data });
  } catch (error) {
    console.error('Update candidate error:', error);
    return c.json({ error: 'Failed to update candidate' }, 500);
  }
});

app.delete("/make-server-968517b8/candidates/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get candidate for audit log before deletion
    const { data: candidateToDelete } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!candidateToDelete) {
      return c.json({ error: 'Candidate not found' }, 404);
    }
    
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase delete error:', error);
      return c.json({ error: 'Failed to delete candidate' }, 500);
    }
    
    // Log audit event
    await logAuditEvent('DELETE', 'candidates', id, candidateToDelete);
    
    return c.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    return c.json({ error: 'Failed to delete candidate' }, 500);
  }
});

// Check passport number uniqueness
app.get("/make-server-968517b8/candidates/check-passport", async (c) => {
  try {
    const passportNumber = c.req.query('passport_number');
    const excludeId = c.req.query('exclude_id');
    
    if (!passportNumber) {
      return c.json({ error: 'Passport number is required' }, 400);
    }
    
    let query = supabase
      .from('candidates')
      .select('id, full_name')
      .eq('passport_number', passportNumber);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data: existingCandidate } = await query.single();
    
    return c.json({ 
      exists: !!existingCandidate,
      candidate: existingCandidate ? { id: existingCandidate.id, name: existingCandidate.full_name } : null
    });
  } catch (error) {
    console.error('Check passport number error:', error);
    return c.json({ exists: false, candidate: null });
  }
});

// Agents endpoints
app.get("/make-server-968517b8/agents", async (c) => {
  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      return c.json({ error: 'Failed to fetch agents' }, 500);
    }

    // Map agents to include compatibility fields
    const mappedAgents = agents?.map(agent => ({
      ...agent,
      name: agent.agency_name,
      region: agent.agency_country === 'UG' ? 'Uganda' : agent.agency_country,
      status: agent.is_active ? 'active' : 'inactive',
      join_date: agent.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    })) || [];

    return c.json({ agents: mappedAgents });
  } catch (error) {
    console.error('Get agents error:', error);
    return c.json({ error: 'Failed to fetch agents' }, 500);
  }
});

app.post("/make-server-968517b8/agents", async (c) => {
  try {
    const agentData = await c.req.json();
    
    const newAgent = {
      ...agentData,
      commission_rate: agentData.commission_rate || 0.10,
      total_candidates: 0,
      successful_placements: 0,
      pending_commission: 0,
      total_earned: 0,
      is_active: agentData.is_active !== undefined ? agentData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('agents')
      .insert([newAgent])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return c.json({ error: 'Failed to create agent' }, 500);
    }
    
    return c.json({ agent: data });
  } catch (error) {
    console.error('Create agent error:', error);
    return c.json({ error: 'Failed to create agent' }, 500);
  }
});

app.put("/make-server-968517b8/agents/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      return c.json({ error: 'Failed to update agent' }, 500);
    }
    
    return c.json({ agent: data });
  } catch (error) {
    console.error('Update agent error:', error);
    return c.json({ error: 'Failed to update agent' }, 500);
  }
});

app.delete("/make-server-968517b8/agents/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase delete error:', error);
      return c.json({ error: 'Failed to delete agent' }, 500);
    }
    
    return c.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    return c.json({ error: 'Failed to delete agent' }, 500);
  }
});

// Employers endpoints
app.get("/make-server-968517b8/employers", async (c) => {
  try {
    const { data: employers, error } = await supabase
      .from('receiving_companies')
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      return c.json({ error: 'Failed to fetch employers' }, 500);
    }

    // Map receiving_companies fields to expected employer format
    const mappedEmployers = employers?.map(employer => ({
      ...employer,
      name: employer.company_name || employer.name,
      positions_needed: employer.positions_needed || [],
      monthly_requirement: employer.monthly_requirement || 0,
      total_hired: employer.total_hired || 0,
      pending_payments: employer.pending_payments || 0,
      partnership_date: employer.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: employer.is_active ? 'active' : 'inactive'
    }));

    return c.json({ employers: mappedEmployers || [] });
  } catch (error) {
    console.error('Get employers error:', error);
    return c.json({ error: 'Failed to fetch employers' }, 500);
  }
});

app.post("/make-server-968517b8/employers", async (c) => {
  try {
    const employerData = await c.req.json();
    
    const newEmployer = {
      company_name: employerData.name || employerData.company_name,
      contact_person: employerData.contact_person,
      phone: employerData.phone,
      email: employerData.email,
      country: employerData.country,
      logo_url: employerData.logo_url,
      is_active: employerData.is_active !== undefined ? employerData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Additional fields for compatibility
      positions_needed: employerData.positions_needed || [],
      monthly_requirement: employerData.monthly_requirement || 0,
      payment_terms: employerData.payment_terms || 'Net 30'
    };
    
    const { data, error } = await supabase
      .from('receiving_companies')
      .insert([newEmployer])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return c.json({ error: 'Failed to create employer' }, 500);
    }
    
    // Map back to expected format
    const mappedEmployer = {
      ...data,
      name: data.company_name,
      status: data.is_active ? 'active' : 'inactive',
      partnership_date: data.created_at?.split('T')[0],
      total_hired: 0,
      pending_payments: 0
    };
    
    return c.json({ employer: mappedEmployer });
  } catch (error) {
    console.error('Create employer error:', error);
    return c.json({ error: 'Failed to create employer' }, 500);
  }
});

app.put("/make-server-968517b8/employers/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const updateData = {
      company_name: updates.name || updates.company_name,
      contact_person: updates.contact_person,
      phone: updates.phone,
      email: updates.email,
      country: updates.country,
      logo_url: updates.logo_url,
      is_active: updates.status === 'active',
      updated_at: new Date().toISOString(),
      positions_needed: updates.positions_needed,
      monthly_requirement: updates.monthly_requirement,
      payment_terms: updates.payment_terms
    };
    
    const { data, error } = await supabase
      .from('receiving_companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      return c.json({ error: 'Failed to update employer' }, 500);
    }
    
    // Map back to expected format
    const mappedEmployer = {
      ...data,
      name: data.company_name,
      status: data.is_active ? 'active' : 'inactive',
      partnership_date: data.created_at?.split('T')[0]
    };
    
    return c.json({ employer: mappedEmployer });
  } catch (error) {
    console.error('Update employer error:', error);
    return c.json({ error: 'Failed to update employer' }, 500);
  }
});

app.delete("/make-server-968517b8/employers/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('receiving_companies')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase delete error:', error);
      return c.json({ error: 'Failed to delete employer' }, 500);
    }
    
    return c.json({ message: 'Employer deleted successfully' });
  } catch (error) {
    console.error('Delete employer error:', error);
    return c.json({ error: 'Failed to delete employer' }, 500);
  }
});

// Financials endpoints
app.get("/make-server-968517b8/financials", async (c) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        candidates!candidate_id(full_name)
      `);
    
    if (error) {
      console.error('Supabase error:', error);
      return c.json({ error: 'Failed to fetch financials' }, 500);
    }

    // Map payments to expected financial format
    const financials = payments?.map(payment => ({
      id: payment.id,
      candidate_id: payment.candidate_id,
      candidate_name: payment.candidates?.full_name || 'Unknown',
      type: payment.stage || 'service_fee',
      amount: payment.amount || 0,
      currency: payment.currency || 'UGX',
      status: 'completed', // Assuming payments are completed
      date: payment.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      description: payment.notes || `Payment for ${payment.stage || 'service'}`
    })) || [];

    return c.json({ financials });
  } catch (error) {
    console.error('Get financials error:', error);
    return c.json({ error: 'Failed to fetch financials' }, 500);
  }
});

app.post("/make-server-968517b8/financials", async (c) => {
  try {
    const financialData = await c.req.json();
    
    const newPayment = {
      candidate_id: financialData.candidate_id,
      stage: financialData.type || financialData.stage,
      amount: financialData.amount,
      currency: financialData.currency || 'UGX',
      payment_method: financialData.payment_method || 'Bank Transfer',
      reference_number: financialData.reference_number,
      notes: financialData.description || financialData.notes,
      paid_by: financialData.paid_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('payments')
      .insert([newPayment])
      .select(`
        *,
        candidates!candidate_id(full_name)
      `)
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return c.json({ error: 'Failed to create financial record' }, 500);
    }
    
    // Map back to expected format
    const financial = {
      id: data.id,
      candidate_id: data.candidate_id,
      candidate_name: data.candidates?.full_name || 'Unknown',
      type: data.stage,
      amount: data.amount,
      currency: data.currency,
      status: 'completed',
      date: data.created_at?.split('T')[0],
      description: data.notes
    };
    
    return c.json({ financial });
  } catch (error) {
    console.error('Create financial record error:', error);
    return c.json({ error: 'Failed to create financial record' }, 500);
  }
});

app.put("/make-server-968517b8/financials/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const updateData = {
      candidate_id: updates.candidate_id,
      stage: updates.type || updates.stage,
      amount: updates.amount,
      currency: updates.currency,
      notes: updates.description || updates.notes,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        candidates!candidate_id(full_name)
      `)
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      return c.json({ error: 'Failed to update financial record' }, 500);
    }
    
    // Map back to expected format
    const financial = {
      id: data.id,
      candidate_id: data.candidate_id,
      candidate_name: data.candidates?.full_name || 'Unknown',
      type: data.stage,
      amount: data.amount,
      currency: data.currency,
      status: 'completed',
      date: data.created_at?.split('T')[0],
      description: data.notes
    };
    
    return c.json({ financial });
  } catch (error) {
    console.error('Update financial record error:', error);
    return c.json({ error: 'Failed to update financial record' }, 500);
  }
});

app.delete("/make-server-968517b8/financials/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase delete error:', error);
      return c.json({ error: 'Failed to delete financial record' }, 500);
    }
    
    return c.json({ message: 'Financial record deleted successfully' });
  } catch (error) {
    console.error('Delete financial record error:', error);
    return c.json({ error: 'Failed to delete financial record' }, 500);
  }
});

// Process tracking endpoint
app.get("/make-server-968517b8/process", async (c) => {
  try {
    const { data: candidates } = await supabase.from('candidates').select('*');
    
    // Group candidates by stage for process tracking
    const processData = {
      passport: candidates?.filter(c => c.stage === 'passport') || [],
      interview: candidates?.filter(c => c.stage === 'interview') || [],
      medical: candidates?.filter(c => c.stage === 'medical') || [],
      training: candidates?.filter(c => c.stage === 'training') || [],
      visa: candidates?.filter(c => c.stage === 'visa') || [],
      deployment_ready: candidates?.filter(c => c.stage === 'deployment_ready') || [],
      deployed: candidates?.filter(c => c.stage === 'deployed') || []
    };
    
    return c.json({ processData });
  } catch (error) {
    console.error('Get process data error:', error);
    return c.json({ error: 'Failed to fetch process data' }, 500);
  }
});

// Documents endpoint
app.get("/make-server-968517b8/documents", async (c) => {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        candidates!candidate_id(full_name)
      `);
    
    if (error) {
      console.error('Supabase error:', error);
      return c.json({ error: 'Failed to fetch documents' }, 500);
    }

    return c.json({ documents: documents || [] });
  } catch (error) {
    console.error('Get documents error:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

// Reports endpoint
app.get("/make-server-968517b8/reports", async (c) => {
  try {
    const { data: candidates } = await supabase.from('candidates').select('*');
    const { data: payments } = await supabase.from('payments').select('*');
    const { data: agents } = await supabase.from('agents').select('*');
    
    // Generate comprehensive reports
    const reports = {
      monthly_placements: candidates?.filter(c => c.stage === 'deployed')?.length || 0,
      total_revenue: payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      agent_performance: agents?.map(agent => ({
        name: agent.name || agent.agency_name,
        placements: agent.successful_placements || 0,
        earnings: agent.total_earned || 0
      })) || [],
      pipeline_health: {
        conversion_rate: candidates?.length > 0 ? 
          ((candidates.filter(c => c.stage === 'deployed').length / candidates.length) * 100).toFixed(1) : '0',
        average_processing_time: '45 days',
        pending_candidates: candidates?.filter(c => !['deployed', 'rejected', 'cancelled'].includes(c.stage))?.length || 0
      }
    };
    
    return c.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return c.json({ error: 'Failed to generate reports' }, 500);
  }
});

// SQL Query execution endpoint
app.post("/make-server-968517b8/sql/execute", async (c) => {
  try {
    const { query } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'SQL query is required' }, 400);
    }
    
    // Execute the query using the SQL function
    const { data, error } = await supabase.rpc('execute_sql_query', { sql_query: query });
    
    if (error) {
      console.error('SQL execution error:', error);
      return c.json({ error: 'Failed to execute SQL query: ' + error.message }, 500);
    }
    
    // Extract the result from the function return format
    const results = data?.map(row => row.result) || [];
    
    return c.json({ data: results });
  } catch (error) {
    console.error('SQL endpoint error:', error);
    return c.json({ error: 'Failed to process SQL query' }, 500);
  }
});

// Search functionality
app.get("/make-server-968517b8/search", async (c) => {
  try {
    const query = c.req.query('q');
    
    if (!query) {
      return c.json({ results: [] });
    }
    
    // Search candidates, agents, and employers
    const [candidatesResult, agentsResult, employersResult] = await Promise.all([
      supabase.from('candidates').select('id, full_name, phone, email').ilike('full_name', `%${query}%`),
      supabase.from('agents').select('id, agency_name, phone, email').ilike('agency_name', `%${query}%`),
      supabase.from('receiving_companies').select('id, company_name, phone, email').ilike('company_name', `%${query}%`)
    ]);
    
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
      }))
    ];
    
    return c.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return c.json({ results: [] });
  }
});

// Audit logging function
async function logAuditEvent(action: string, tableName: string, recordId: string, changes?: any, userId?: string) {
  try {
    const auditEntry = {
      table_name: tableName,
      record_id: recordId,
      action,
      old_data: changes?.before || null,
      new_data: changes?.after || changes || null,
      user_id: userId || 'system',
      created_at: new Date().toISOString()
    };
    
    // Insert into audit_logs table
    await supabase.from('audit_logs').insert([auditEntry]);
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't fail the main operation if audit logging fails
  }
}

// Start the server
Deno.serve(app.fetch);