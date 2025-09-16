const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupJobsFunctions() {
  console.log('Setting up Jobs module functions...');
  
  // 1. Create the materialized view
  try {
    console.log('Creating job_analytics materialized view...');
    const { error: mvError } = await supabase.rpc('sql', {
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS public.job_analytics AS
        SELECT 
            p.id as position_id,
            p.position_name,
            rc.company_name as receiving_company_name,
            p.work_country,
            COUNT(DISTINCT c.id) as total_candidates,
            COUNT(DISTINCT CASE WHEN c.is_active = true THEN c.id END) as active_candidates,
            COUNT(DISTINCT CASE WHEN c.stage = 'deployed' THEN c.id END) as deployed_candidates,
            COALESCE(SUM(pay.amount), 0) as total_payments,
            COALESCE(AVG(pay.amount), 0) as average_payment,
            CASE 
                WHEN COUNT(DISTINCT c.id) > 0 
                THEN (COUNT(DISTINCT CASE WHEN c.stage = 'deployed' THEN c.id END)::float / COUNT(DISTINCT c.id)::float) * 100
                ELSE 0 
            END as success_rate,
            COALESCE(AVG(EXTRACT(days FROM (c.updated_at - c.created_at))), 0) as avg_processing_days,
            MAX(GREATEST(p.updated_at, c.updated_at, pay.created_at)) as last_activity
        FROM public.positions p
        LEFT JOIN public.receiving_companies rc ON p.receiving_company_id = rc.id
        LEFT JOIN public.candidates c ON c.receiving_company_id = p.receiving_company_id
        LEFT JOIN public.payments pay ON pay.candidate_id = c.id
        GROUP BY p.id, p.position_name, rc.company_name, p.work_country;
      `
    });
    
    if (mvError) {
      console.error('Error creating materialized view:', mvError);
    } else {
      console.log('✓ Materialized view created');
    }
  } catch (error) {
    console.error('Error with materialized view:', error);
  }

  // 2. Create basic CRUD functions using direct SQL
  const functions = [
    {
      name: 'create_job_simple',
      sql: `
        CREATE OR REPLACE FUNCTION create_job_simple(job_data jsonb)
        RETURNS uuid AS $$
        DECLARE
          new_job_id uuid;
        BEGIN
          INSERT INTO public.positions (
            position_name,
            receiving_company_id,
            work_country,
            requested_headcount,
            salary,
            salary_currency,
            contract_period,
            working_hours,
            accommodation,
            food,
            air_ticket,
            transport,
            medical_insurance,
            employment_visa,
            is_active
          ) VALUES (
            (job_data->>'position_name')::text,
            (job_data->>'receiving_company_id')::uuid,
            (job_data->>'work_country')::text,
            (job_data->>'requested_headcount')::integer,
            (job_data->>'salary')::numeric,
            COALESCE((job_data->>'salary_currency')::text, 'USD'),
            COALESCE((job_data->>'contract_period')::integer, 24),
            COALESCE((job_data->>'working_hours')::text, '8 hours/day'),
            COALESCE((job_data->>'accommodation')::boolean, false),
            COALESCE((job_data->>'food')::boolean, false),
            COALESCE((job_data->>'air_ticket')::boolean, false),
            COALESCE((job_data->>'transport')::boolean, false),
            COALESCE((job_data->>'medical_insurance')::boolean, false),
            COALESCE((job_data->>'employment_visa')::boolean, false),
            COALESCE((job_data->>'is_active')::boolean, true)
          ) RETURNING id INTO new_job_id;
          
          RETURN new_job_id;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    },
    {
      name: 'get_jobs_simple',
      sql: `
        CREATE OR REPLACE FUNCTION get_jobs_simple()
        RETURNS TABLE (
          id uuid,
          position_name text,
          receiving_company_id uuid,
          receiving_company_name text,
          work_country text,
          requested_headcount integer,
          salary numeric,
          salary_currency text,
          contract_period integer,
          working_hours text,
          accommodation boolean,
          food boolean,
          air_ticket boolean,
          transport boolean,
          medical_insurance boolean,
          employment_visa boolean,
          is_active boolean,
          created_at timestamptz,
          updated_at timestamptz
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            p.id,
            p.position_name,
            p.receiving_company_id,
            rc.company_name as receiving_company_name,
            p.work_country,
            p.requested_headcount,
            p.salary,
            p.salary_currency,
            p.contract_period,
            p.working_hours,
            p.accommodation,
            p.food,
            p.air_ticket,
            p.transport,
            p.medical_insurance,
            p.employment_visa,
            p.is_active,
            p.created_at,
            p.updated_at
          FROM public.positions p
          LEFT JOIN public.receiving_companies rc ON p.receiving_company_id = rc.id
          ORDER BY p.created_at DESC;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    }
  ];

  // Create each function
  for (const func of functions) {
    try {
      console.log(`Creating function: ${func.name}...`);
      const { error } = await supabase.rpc('sql', { query: func.sql });
      
      if (error) {
        console.error(`Error creating ${func.name}:`, error);
      } else {
        console.log(`✓ Function ${func.name} created`);
      }
    } catch (error) {
      console.error(`Error with ${func.name}:`, error);
    }
  }

  console.log('Jobs module setup completed!');
}

setupJobsFunctions().catch(console.error);
