-- Jawal International Sample Data for Testing
-- Run this SQL in your Supabase SQL Editor to populate your database with realistic test data

-- NOTE: You'll need to create some test users in Supabase Auth first, then update the profile IDs below
-- For now, we'll use sample UUIDs - replace these with actual user IDs from your auth.users table

-- 1. PROFILES (Staff and Admin Users)
-- First create some users in Supabase Auth, then insert their profiles here
INSERT INTO public.profiles (id, full_name, role, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'John Mugisha', 'admin', '+256777123456', true),
('00000000-0000-0000-0000-000000000002', 'Sarah Nakato', 'staff', '+256777123457', true),
('00000000-0000-0000-0000-000000000003', 'David Okello', 'staff', '+256777123458', true),
('00000000-0000-0000-0000-000000000004', 'Grace Achieng', 'staff', '+256777123459', true);

-- 2. AGENTS (Recruitment Agents)
INSERT INTO public.agents (agency_name, phone, email, commission_rate, is_active, agency_country, agency_id) VALUES
('Kampala Recruitment Services', '+256701234567', 'info@kampalarecruit.com', 0.08, true, 'UG', 'KRS001'),
('East Africa Manpower', '+256702234567', 'contact@eastafricamanpower.com', 0.10, true, 'UG', 'EAM002'),
('Nairobi Employment Agency', '+254701234567', 'info@nairobiemploy.co.ke', 0.09, true, 'KE', 'NEA003'),
('Tanzania Workers Union', '+255701234567', 'contact@tzworkers.co.tz', 0.07, true, 'TZ', 'TWU004'),
('Rwanda Job Connect', '+250701234567', 'info@rwandajobs.rw', 0.08, true, 'RW', 'RJC005'),
('Mbarara Regional Services', '+256703234567', 'mbarara@recruiters.com', 0.06, true, 'UG', 'MRS006'),
('Gulu Employment Hub', '+256704234567', 'gulu@joinhub.com', 0.08, false, 'UG', 'GEH007');

-- 3. RECEIVING COMPANIES (Gulf Employers)
INSERT INTO public.receiving_companies (company_name, contact_person, phone, email, country, is_active) VALUES
('Al Mansouri Family Services', 'Ahmad Al Mansouri', '+971501234567', 'hr@almansouri.ae', 'UAE', true),
('Riyadh Domestic Services Ltd', 'Mohammed Al Saud', '+966501234567', 'hiring@riyadhdomestic.sa', 'Saudi Arabia', true),
('Qatar Home Care Solutions', 'Fahad Al Thani', '+974501234567', 'recruitment@qatarhome.qa', 'Qatar', true),
('Kuwait Family Support', 'Nasser Al Sabah', '+965501234567', 'jobs@kuwaitfamily.kw', 'Kuwait', true),
('Bahrain Household Services', 'Ali Al Khalifa', '+973501234567', 'careers@bahrainhouse.bh', 'Bahrain', true),
('Muscat Care Services', 'Salem Al Said', '+968501234567', 'hr@muscatcare.om', 'Oman', true),
('Dubai Elite Homes', 'Rashid Al Maktoum', '+971502234567', 'recruitment@dubaielite.ae', 'UAE', true),
('Jeddah Premium Services', 'Abdullah Al Rashid', '+966502234567', 'hiring@jeddahpremium.sa', 'Saudi Arabia', true);

-- 4. POSITIONS (Job Openings)
INSERT INTO public.positions (position_name, receiving_company_id, work_country, requested_headcount, salary, salary_currency, input_fee, input_fee_currency, contract_period, min_age, max_age, accommodation, transport, medical_insurance, employment_visa, food, air_ticket, working_hours, probation_period, is_active) VALUES
('Domestic Worker', (SELECT id FROM receiving_companies WHERE company_name = 'Al Mansouri Family Services'), 'UAE', 5, 1200, 'USD', 3500000, 'UGX', 24, 21, 45, true, false, true, true, true, true, '8 hours/day', 3, true),
('Housekeeper', (SELECT id FROM receiving_companies WHERE company_name = 'Riyadh Domestic Services Ltd'), 'Saudi Arabia', 3, 1400, 'USD', 3800000, 'UGX', 24, 23, 40, true, true, true, true, true, true, '10 hours/day', 6, true),
('Caregiver', (SELECT id FROM receiving_companies WHERE company_name = 'Qatar Home Care Solutions'), 'Qatar', 2, 1600, 'USD', 4200000, 'UGX', 24, 25, 50, true, true, true, true, true, true, '12 hours/day', 3, true),
('Nanny', (SELECT id FROM receiving_companies WHERE company_name = 'Kuwait Family Support'), 'Kuwait', 4, 1300, 'USD', 3600000, 'UGX', 24, 22, 38, true, false, true, true, true, true, '9 hours/day', 3, true),
('Cleaner', (SELECT id FROM receiving_companies WHERE company_name = 'Bahrain Household Services'), 'Bahrain', 6, 1100, 'USD', 3200000, 'UGX', 24, 20, 45, true, true, true, true, false, true, '8 hours/day', 2, true),
('Cook', (SELECT id FROM receiving_companies WHERE company_name = 'Muscat Care Services'), 'Oman', 2, 1500, 'USD', 3900000, 'UGX', 24, 25, 50, true, false, true, true, true, true, '8 hours/day', 3, true);

-- 5. CANDIDATES (Job Seekers)
INSERT INTO public.candidates (agent_id, full_name, passport_number, nin_number, date_of_birth, gender, nationality, next_of_kin, next_of_kin_contact, next_of_kin_relationship, stage, receiving_company_id, expected_salary, position, phone, email, address, is_active) VALUES
((SELECT id FROM agents WHERE agency_id = 'KRS001'), 'Agnes Nakimuli', 'B1234567', 'CF12345678901234', '1995-03-15', 'female', 'Ugandan', 'Rose Nakimuli', '+256777987654', 'mother', 'medical', (SELECT id FROM receiving_companies WHERE company_name = 'Al Mansouri Family Services'), 1200, 'Domestic Worker', '+256701987654', 'agnes.nakimuli@email.com', 'Kampala, Central Uganda', true),

((SELECT id FROM agents WHERE agency_id = 'KRS001'), 'James Otim', 'B1234568', 'CF12345678901235', '1992-07-22', 'male', 'Ugandan', 'Mary Otim', '+256777987655', 'wife', 'training', (SELECT id FROM receiving_companies WHERE company_name = 'Riyadh Domestic Services Ltd'), 1400, 'Security Guard', '+256701987655', 'james.otim@email.com', 'Gulu, Northern Uganda', true),

((SELECT id FROM agents WHERE agency_id = 'EAM002'), 'Patience Nalwoga', 'B1234569', 'CF12345678901236', '1988-11-08', 'female', 'Ugandan', 'John Nalwoga', '+256777987656', 'husband', 'visa', (SELECT id FROM receiving_companies WHERE company_name = 'Qatar Home Care Solutions'), 1600, 'Caregiver', '+256701987656', 'patience.nalwoga@email.com', 'Mukono, Central Uganda', true),

((SELECT id FROM agents WHERE agency_id = 'NEA003'), 'Grace Wanjiku', 'A7654321', 'KE12345678901234', '1990-05-12', 'female', 'Kenyan', 'Peter Wanjiku', '+254777987654', 'father', 'deployment_ready', (SELECT id FROM receiving_companies WHERE company_name = 'Kuwait Family Support'), 1300, 'Nanny', '+254701987654', 'grace.wanjiku@email.com', 'Nairobi, Kenya', true),

((SELECT id FROM agents WHERE agency_id = 'EAM002'), 'Moses Kiprotich', 'B1234570', 'CF12345678901237', '1993-01-30', 'male', 'Ugandan', 'Sarah Kiprotich', '+256777987657', 'sister', 'passport', NULL, 1100, 'Driver', '+256701987657', 'moses.kiprotich@email.com', 'Mbale, Eastern Uganda', true),

((SELECT id FROM agents WHERE agency_id = 'TWU004'), 'Amina Hassan', 'T9876543', 'TZ12345678901234', '1991-09-18', 'female', 'Tanzanian', 'Fatuma Hassan', '+255777987654', 'mother', 'medical', (SELECT id FROM receiving_companies WHERE company_name = 'Bahrain Household Services'), 1100, 'Cleaner', '+255701987654', 'amina.hassan@email.com', 'Dar es Salaam, Tanzania', true),

((SELECT id FROM agents WHERE agency_id = 'RJC005'), 'Jean Baptiste Uwimana', 'R5432109', 'RW12345678901234', '1989-12-25', 'male', 'Rwandan', 'Marie Uwimana', '+250777987654', 'wife', 'training', (SELECT id FROM receiving_companies WHERE company_name = 'Muscat Care Services'), 1500, 'Cook', '+250701987654', 'jean.uwimana@email.com', 'Kigali, Rwanda', true),

((SELECT id FROM agents WHERE agency_id = 'KRS001'), 'Rebecca Atim', 'B1234571', 'CF12345678901238', '1994-06-14', 'female', 'Ugandan', 'Paul Atim', '+256777987658', 'brother', 'interview', NULL, 1200, 'Domestic Worker', '+256701987658', 'rebecca.atim@email.com', 'Lira, Northern Uganda', true),

((SELECT id FROM agents WHERE agency_id = 'MRS006'), 'Sarah Tumukunde', 'B1234572', 'CF12345678901239', '1987-04-03', 'female', 'Ugandan', 'David Tumukunde', '+256777987659', 'husband', 'deployed', (SELECT id FROM receiving_companies WHERE company_name = 'Dubai Elite Homes'), 1200, 'Domestic Worker', '+256701987659', 'sarah.tumukunde@email.com', 'Mbarara, Western Uganda', true),

((SELECT id FROM agents WHERE agency_id = 'NEA003'), 'Daniel Kipchoge', 'A7654322', 'KE12345678901235', '1985-08-19', 'male', 'Kenyan', 'Rose Kipchoge', '+254777987655', 'mother', 'visa', (SELECT id FROM receiving_companies WHERE company_name = 'Jeddah Premium Services'), 1400, 'Security Guard', '+254701987655', 'daniel.kipchoge@email.com', 'Eldoret, Kenya', true);

-- 6. STAGE CONFIGURATIONS
INSERT INTO public.stage_configs (stage, standard_cost, max_days_allowed, description, requirements) VALUES
('passport', 150000, 14, 'Passport application and processing stage', ARRAY['Valid national ID', 'Birth certificate', 'Passport photos']),
('interview', 50000, 7, 'Initial screening and interview stage', ARRAY['Completed application', 'Valid passport', 'Phone interview']),
('medical', 300000, 21, 'Medical examination and certification', ARRAY['Medical examination', 'HIV test', 'Tuberculosis screening', 'General health check']),
('training', 500000, 30, 'Skills training and certification', ARRAY['Basic language training', 'Job-specific skills', 'Cultural orientation']),
('visa', 800000, 45, 'Visa application and processing', ARRAY['Job offer letter', 'Medical certificate', 'Training certificate', 'Passport']),
('deployment_ready', 0, 14, 'Final preparations for deployment', ARRAY['Valid visa', 'Flight booking', 'Final briefing']),
('deployed', 0, 0, 'Successfully deployed to employer', ARRAY['Arrival confirmation', 'Employer handover']);

-- 7. PAYMENTS (Financial Records)
INSERT INTO public.payments (candidate_id, stage, amount, currency, payment_method, reference_number, notes, paid_by) VALUES
((SELECT id FROM candidates WHERE passport_number = 'B1234567'), 'service_fee', 100000, 'UGX', 'Mobile Money', 'MM240301001', 'Initial service fee payment', (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234567'), 'medical', 300000, 'UGX', 'Bank Transfer', 'BT240302001', 'Medical examination fee', (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234568'), 'service_fee', 100000, 'UGX', 'Cash', 'CSH240301002', 'Service fee - cash payment', (SELECT id FROM profiles WHERE full_name = 'David Okello')),
((SELECT id FROM candidates WHERE passport_number = 'B1234569'), 'visa', 800000, 'UGX', 'Bank Transfer', 'BT240303001', 'Visa processing fee', (SELECT id FROM profiles WHERE full_name = 'Grace Achieng')),
((SELECT id FROM candidates WHERE passport_number = 'A7654321'), 'service_fee', 100000, 'UGX', 'Mobile Money', 'MM240304001', 'Service fee payment', (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'T9876543'), 'medical', 300000, 'UGX', 'Bank Transfer', 'BT240305001', 'Medical examination completed', (SELECT id FROM profiles WHERE full_name = 'David Okello'));

-- 8. DOCUMENTS
INSERT INTO public.documents (candidate_id, doc_type, doc_name, doc_url, file_size, mime_type, is_verified, verified_by, expiry_date, uploaded_by) VALUES
((SELECT id FROM candidates WHERE passport_number = 'B1234567'), 'passport', 'Agnes_Nakimuli_Passport.pdf', '/documents/passport_b1234567.pdf', 2547123, 'application/pdf', true, (SELECT id FROM profiles WHERE full_name = 'John Mugisha'), '2029-03-15', (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234567'), 'medical_certificate', 'Agnes_Medical_Certificate.pdf', '/documents/medical_b1234567.pdf', 1234567, 'application/pdf', true, (SELECT id FROM profiles WHERE full_name = 'John Mugisha'), '2025-03-15', (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234568'), 'passport', 'James_Otim_Passport.pdf', '/documents/passport_b1234568.pdf', 2654321, 'application/pdf', true, (SELECT id FROM profiles WHERE full_name = 'John Mugisha'), '2028-07-22', (SELECT id FROM profiles WHERE full_name = 'David Okello')),
((SELECT id FROM candidates WHERE passport_number = 'B1234569'), 'passport', 'Patience_Nalwoga_Passport.pdf', '/documents/passport_b1234569.pdf', 2456789, 'application/pdf', true, (SELECT id FROM profiles WHERE full_name = 'John Mugisha'), '2030-11-08', (SELECT id FROM profiles WHERE full_name = 'Grace Achieng')),
((SELECT id FROM candidates WHERE passport_number = 'A7654321'), 'passport', 'Grace_Wanjiku_Passport.pdf', '/documents/passport_a7654321.pdf', 2789123, 'application/pdf', true, (SELECT id FROM profiles WHERE full_name = 'John Mugisha'), '2029-05-12', (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234570'), 'photo', 'Moses_Kiprotich_Photo.jpg', '/documents/photo_b1234570.jpg', 456789, 'image/jpeg', false, NULL, NULL, (SELECT id FROM profiles WHERE full_name = 'David Okello'));

-- 9. LEADS (Potential Candidates)
INSERT INTO public.leads (first_name, last_name, email, phone, interested_country, service_type, message, status, created_by) VALUES
('Mary', 'Namubiru', 'mary.namubiru@email.com', '+256701654321', 'UAE', 'Domestic Work', 'Interested in housekeeping position in Dubai. Have 3 years experience.', 'new', (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
('Peter', 'Wanyama', 'peter.wanyama@email.com', '+256702654321', 'Saudi Arabia', 'Security', 'Looking for security guard position. Former police officer with 5 years experience.', 'contacted', (SELECT id FROM profiles WHERE full_name = 'David Okello')),
('Jennifer', 'Akello', 'jennifer.akello@email.com', '+256703654321', 'Qatar', 'Caregiving', 'Qualified nurse interested in elderly care position.', 'in_progress', (SELECT id FROM profiles WHERE full_name = 'Grace Achieng')),
('Robert', 'Ssemakula', 'robert.ssemakula@email.com', '+256704654321', 'Kuwait', 'Construction', 'Experienced mason looking for construction work.', 'new', (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato'));

-- 10. STAGE HISTORY (Candidate Progress Tracking)
INSERT INTO public.stage_history (candidate_id, from_stage, to_stage, notes, cost, days_in_previous_stage, updated_by) VALUES
((SELECT id FROM candidates WHERE passport_number = 'B1234567'), NULL, 'passport', 'Initial registration', 0, NULL, (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234567'), 'passport', 'interview', 'Passport received, interview scheduled', 150000, 12, (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234567'), 'interview', 'medical', 'Interview passed, proceeding to medical', 50000, 3, (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234568'), NULL, 'passport', 'Initial registration', 0, NULL, (SELECT id FROM profiles WHERE full_name = 'David Okello')),
((SELECT id FROM candidates WHERE passport_number = 'B1234568'), 'passport', 'training', 'Fast-tracked to training stage', 150000, 8, (SELECT id FROM profiles WHERE full_name = 'David Okello')),
((SELECT id FROM candidates WHERE passport_number = 'B1234569'), 'medical', 'visa', 'Medical cleared, visa application submitted', 300000, 18, (SELECT id FROM profiles WHERE full_name = 'Grace Achieng')),
((SELECT id FROM candidates WHERE passport_number = 'A7654321'), 'visa', 'deployment_ready', 'Visa approved, ready for deployment', 800000, 38, (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234572'), 'deployment_ready', 'deployed', 'Successfully deployed to Dubai', 0, 7, (SELECT id FROM profiles WHERE full_name = 'John Mugisha'));

-- 11. SYSTEM SETTINGS
INSERT INTO public.system_settings (setting_key, setting_value, description, updated_by) VALUES
('service_fee_ugx', '100000', 'Standard service fee in Uganda Shillings', (SELECT id FROM profiles WHERE full_name = 'John Mugisha')),
('average_investment_ugx', '2469000', 'Average total investment per candidate in UGX', (SELECT id FROM profiles WHERE full_name = 'John Mugisha')),
('default_commission_rate', '0.08', 'Default commission rate for new agents (8%)', (SELECT id FROM profiles WHERE full_name = 'John Mugisha')),
('medical_validity_days', '365', 'Medical certificate validity period in days', (SELECT id FROM profiles WHERE full_name = 'John Mugisha')),
('visa_processing_days', '45', 'Standard visa processing time in days', (SELECT id FROM profiles WHERE full_name = 'John Mugisha')),
('company_name', '"Jawal International"', 'Company name for documentation', (SELECT id FROM profiles WHERE full_name = 'John Mugisha')),
('company_phone', '"+256700123456"', 'Main company contact phone', (SELECT id FROM profiles WHERE full_name = 'John Mugisha')),
('company_email', '"info@jawalinternational.com"', 'Main company email address', (SELECT id FROM profiles WHERE full_name = 'John Mugisha'));

-- 12. ALERTS (System Notifications)
INSERT INTO public.alerts (candidate_id, alert_type, priority, title, message, is_read, assigned_to) VALUES
((SELECT id FROM candidates WHERE passport_number = 'B1234567'), 'document_expiry', 'high', 'Medical Certificate Expiring Soon', 'Agnes Nakimuli medical certificate expires in 30 days', false, (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
((SELECT id FROM candidates WHERE passport_number = 'B1234568'), 'stage_delay', 'medium', 'Training Stage Delayed', 'James Otim has been in training stage for 35 days (max: 30 days)', false, (SELECT id FROM profiles WHERE full_name = 'David Okello')),
((SELECT id FROM candidates WHERE passport_number = 'A7654321'), 'deployment_ready', 'high', 'Candidate Ready for Deployment', 'Grace Wanjiku is ready for deployment - arrange travel', false, (SELECT id FROM profiles WHERE full_name = 'John Mugisha'));

-- 13. AUDIT LOGS (Sample entries)
INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, user_id) VALUES
('candidates', (SELECT id FROM candidates WHERE passport_number = 'B1234567'), 'UPDATE', 
 '{"stage": "interview"}', 
 '{"stage": "medical"}', 
 (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
('payments', (SELECT id FROM payments WHERE reference_number = 'MM240301001'), 'CREATE',
 NULL,
 '{"candidate_id": "' || (SELECT id FROM candidates WHERE passport_number = 'B1234567') || '", "amount": 100000, "stage": "service_fee"}',
 (SELECT id FROM profiles WHERE full_name = 'Sarah Nakato')),
('agents', (SELECT id FROM agents WHERE agency_id = 'KRS001'), 'UPDATE',
 '{"commission_rate": 0.07}',
 '{"commission_rate": 0.08}',
 (SELECT id FROM profiles WHERE full_name = 'John Mugisha'));

-- Display summary of created data
SELECT 
    'Data Creation Summary' as info,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM agents) as agents_count,
    (SELECT COUNT(*) FROM receiving_companies) as companies_count,
    (SELECT COUNT(*) FROM candidates) as candidates_count,
    (SELECT COUNT(*) FROM positions) as positions_count,
    (SELECT COUNT(*) FROM documents) as documents_count,
    (SELECT COUNT(*) FROM payments) as payments_count,
    (SELECT COUNT(*) FROM leads) as leads_count,
    (SELECT COUNT(*) FROM stage_history) as stage_history_count,
    (SELECT COUNT(*) FROM alerts) as alerts_count;

-- Show candidate distribution by stage
SELECT 
    stage,
    COUNT(*) as candidate_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM candidates), 1) as percentage
FROM candidates 
GROUP BY stage 
ORDER BY candidate_count DESC;

-- Show agent performance summary
SELECT 
    a.agency_name,
    a.agency_country,
    COUNT(c.id) as total_candidates,
    COUNT(CASE WHEN c.stage = 'deployed' THEN 1 END) as deployed_candidates,
    CASE 
        WHEN COUNT(c.id) > 0 THEN ROUND(COUNT(CASE WHEN c.stage = 'deployed' THEN 1 END) * 100.0 / COUNT(c.id), 1)
        ELSE 0 
    END as success_rate_percent
FROM agents a
LEFT JOIN candidates c ON a.id = c.agent_id
GROUP BY a.id, a.agency_name, a.agency_country
ORDER BY total_candidates DESC;