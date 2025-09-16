-- Database Schema Reference for Recruitment Management System
-- This file is for reference only to ensure accurate SQL operations

-- Agents Table
-- Primary Key: id
-- Foreign Keys: None
-- Indexes: agency_id (UNIQUE), agency_name (gin_trgm_ops)

-- Alerts Table
-- Primary Key: id
-- Foreign Keys: candidate_id, assigned_to, resolved_by
-- Indexes: candidate_id, alert_type, priority, is_read, resolved

-- Audit Logs Table
-- Primary Key: id
-- Foreign Keys: user_id
-- Indexes: table_name, record_id, timestamp

-- Candidates Table
-- Primary Key: id
-- Foreign Keys: agent_id, candidate_user_id, receiving_company_id
-- Indexes: agent_id, receiving_company_id, stage, passport_number, nin_number

-- Documents Table
-- Primary Key: id
-- Foreign Keys: candidate_id, verified_by, uploaded_by
-- Indexes: candidate_id, doc_type, is_verified, expiry_date

-- Leads Table
-- Primary Key: id
-- Foreign Keys: created_by, updated_by
-- Indexes: status, created_at, email, phone

-- Payments Table
-- Primary Key: id
-- Foreign Keys: candidate_id, paid_by
-- Indexes: candidate_id, stage, paid_at

-- Positions Table
-- Primary Key: id
-- Foreign Keys: receiving_company_id
-- Indexes: receiving_company_id, is_active, work_country

-- Profiles Table
-- Primary Key: id (matches auth.users.id)
-- Foreign Keys: id (to auth.users)
-- Indexes: role, is_active

-- Receiving Companies Table
-- Primary Key: id
-- Foreign Keys: None
-- Indexes: company_name, country, is_active

-- Stage Configs Table
-- Primary Key: id
-- Foreign Keys: None
-- Indexes: stage (UNIQUE)

-- Stage History Table
-- Primary Key: id
-- Foreign Keys: candidate_id, updated_by
-- Indexes: candidate_id, to_stage, updated_at

-- System Settings Table
-- Primary Key: id
-- Foreign Keys: updated_by
-- Indexes: setting_key (UNIQUE)
