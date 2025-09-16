# Recruitment Management System - Complete Documentation

## System Overview

The Recruitment Management System is a comprehensive platform for managing the entire recruitment workflow from candidate registration through deployment. It handles agents, employers (receiving companies), candidates, financial transactions, documents, and stage-based progression tracking.

## Core Architecture

### Frontend
- **React/TypeScript** application with modern UI components
- **Modular design** with separate components for each business domain
- **Real-time updates** and comprehensive form validation
- **Responsive design** with professional dashboard interface

### Backend
- **Supabase** PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** for data protection
- **Audit logging** for all CRUD operations
- **Direct database integration** via Supabase client

## Database Schema & Relationships

### Core Tables

#### 1. **profiles** (User Management)
```sql
- id (uuid, FK to auth.users)
- full_name (text)
- role (admin|staff|agent|candidate)
- phone, photo_url
- is_active, last_login
- created_at, updated_at
```

#### 2. **agents** (Recruitment Agents)
```sql
- id (uuid, PK)
- agency_name (text, NOT NULL)
- agency_id (text, UNIQUE)
- agency_country (text, default 'UG')
- phone, email, photo_url
- commission_rate (numeric)
- is_active (boolean)
- created_at, updated_at
```

#### 3. **receiving_companies** (Employers)
```sql
- id (uuid, PK)
- company_name (text, NOT NULL)
- contact_person, phone, email
- country, logo_url
- is_active (boolean)
- created_at, updated_at
```

#### 4. **candidates** (Job Seekers)
```sql
- id (uuid, PK)
- agent_id (uuid, FK to agents)
- candidate_user_id (uuid, FK to profiles)
- receiving_company_id (uuid, FK to receiving_companies)
- full_name (text, NOT NULL)
- passport_number (text, UNIQUE)
- nin_number, date_of_birth, gender
- nationality, phone, email, address
- next_of_kin, next_of_kin_contact, next_of_kin_relationship
- photo_url, expected_salary, position
- stage (candidate_stage enum)
- stage_updated_at
- is_active (boolean)
- created_at, updated_at
```

#### 5. **payments** (Financial Transactions)
```sql
- id (uuid, PK)
- candidate_id (uuid, FK to candidates)
- stage (payment_stage enum)
- amount (numeric), currency (default 'USD')
- payment_method, reference_number
- notes, paid_by (uuid, FK to profiles)
- paid_at
```

#### 6. **documents** (Document Management)
```sql
- id (uuid, PK)
- candidate_id (uuid, FK to candidates)
- doc_type, doc_name, doc_url
- file_size, mime_type
- is_verified (boolean)
- verified_by (uuid, FK to profiles)
- verified_at, expiry_date
- uploaded_by (uuid, FK to profiles)
- uploaded_at
```

#### 7. **positions** (Job Positions)
```sql
- id (uuid, PK)
- receiving_company_id (uuid, FK to receiving_companies)
- position_name, work_country
- requested_headcount, salary, salary_currency
- input_fee, input_fee_currency
- contract_period, min_age, max_age
- benefits (accommodation, transport, medical_insurance, etc.)
- working_hours, probation_period
- is_active (boolean)
- created_at, updated_at
```

#### 8. **audit_logs** (System Audit Trail)
```sql
- id (uuid, PK)
- table_name (text)
- record_id (uuid)
- action (CREATE|UPDATE|DELETE)
- old_data, new_data (jsonb)
- user_id (uuid, FK to profiles)
- timestamp
```

#### 9. **stage_history** (Candidate Progress Tracking)
```sql
- id (uuid, PK)
- candidate_id (uuid, FK to candidates)
- from_stage, to_stage (candidate_stage enum)
- notes, cost (numeric)
- days_in_previous_stage
- updated_by (uuid, FK to profiles)
- updated_at
```

#### 10. **alerts** (System Notifications)
```sql
- id (uuid, PK)
- candidate_id (uuid, FK to candidates)
- alert_type, priority (enum)
- title, message
- is_read, resolved
- assigned_to, resolved_by (uuid, FK to profiles)
- resolved_at, created_at
```

## Business Process Flows

### 1. Agent Registration & Management
**Process:** Agent Onboarding → Profile Creation → Commission Setup → Candidate Assignment

**Database Flow:**
1. Create record in `profiles` table (role: 'agent')
2. Create record in `agents` table with agency details
3. Set commission rate and country
4. Link candidates via `candidates.agent_id`

**Key Features:**
- Commission tracking and earnings calculation
- Performance metrics (success rate, total candidates)
- Geographic territory management
- Active/inactive status management

### 2. Employer (Receiving Company) Management
**Process:** Company Registration → Contact Setup → Position Creation → Candidate Matching

**Database Flow:**
1. Create record in `receiving_companies` table
2. Create positions in `positions` table
3. Link candidates via `candidates.receiving_company_id`
4. Track placement success rates

**Key Features:**
- Multi-country employer support
- Position-specific requirements
- Salary and benefit package management
- Company branding (logo, contact info)

### 3. Candidate Recruitment Workflow
**Process:** Registration → Stage Progression → Document Collection → Payment Processing → Deployment

#### Stage Progression System:
1. **Passport Stage** - Initial registration, document collection
2. **Interview Stage** - Employer screening and selection
3. **Medical Examination** - Health clearance
4. **Training Stage** - Skills development and preparation
5. **Visa Processing** - Legal documentation
6. **Deployment** - Final placement and travel

**Database Flow:**
```
candidates.stage → stage_history → payments → documents → alerts
```

**Detailed Workflow:**
1. **Registration:**
   - Create `candidates` record with personal details
   - Link to `agent` and `receiving_company`
   - Set initial stage to 'passport'
   - Create audit log entry

2. **Stage Progression:**
   - Update `candidates.stage` and `stage_updated_at`
   - Create `stage_history` record tracking transition
   - Calculate days spent in previous stage
   - Trigger stage-specific alerts if needed

3. **Document Management:**
   - Upload documents to `documents` table
   - Link to candidate via `candidate_id`
   - Track verification status and expiry dates
   - Maintain audit trail of uploads/verifications

4. **Payment Processing:**
   - Create `payments` records for stage-specific fees
   - Track payment methods and reference numbers
   - Link payments to specific candidates and stages
   - Generate financial reports and commission calculations

### 4. Financial Management System
**Process:** Fee Structure → Payment Collection → Commission Calculation → Financial Reporting

**Database Flow:**
```
stage_configs → payments → agents.commission_rate → audit_logs
```

**Key Components:**
1. **Stage-based Payments:**
   - Each recruitment stage has associated costs
   - Payments tracked in `payments` table
   - Multiple currencies supported (USD, UGX)

2. **Commission System:**
   - Agents earn commission based on successful placements
   - Commission rates stored in `agents.commission_rate`
   - Calculated from completed candidate deployments

3. **Financial Reporting:**
   - Revenue tracking by stage, agent, and time period
   - Commission calculations and payouts
   - Cost analysis and profitability metrics

### 5. Document Management Workflow
**Process:** Document Upload → Verification → Expiry Tracking → Compliance Monitoring

**Database Flow:**
```
documents → profiles (uploaded_by/verified_by) → alerts (expiry warnings)
```

**Features:**
- Multi-format document support
- Verification workflow with approver tracking
- Expiry date monitoring and alerts
- Secure file storage and access control

### 6. Alert & Notification System
**Process:** Event Triggers → Alert Creation → Assignment → Resolution → Audit

**Database Flow:**
```
system_events → alerts → profiles (assigned_to/resolved_by) → audit_logs
```

**Alert Types:**
- Document expiry warnings
- Stage progression delays
- Payment overdue notifications
- System compliance alerts

## System Integration Points

### 1. API Client Architecture
**File:** `src/utils/supabase/client.ts`

**Core Functions:**
- **CRUD Operations:** Create, Read, Update, Delete for all entities
- **Audit Logging:** Automatic logging of all data changes
- **Data Transformation:** UI ↔ Database field mapping
- **Error Handling:** Comprehensive error management

### 2. UI Component Structure
**Modules:**
- `CandidatesModule.tsx` - Complete candidate lifecycle management
- `AgentsModule.tsx` - Agent registration and performance tracking
- `EmployersModule.tsx` - Receiving company management
- `FinancialsModule.tsx` - Payment and commission tracking
- `DocumentsModule.tsx` - Document upload and verification
- `AIInsightsModule.tsx` - Analytics and reporting

### 3. Data Flow Patterns

#### Create Operations:
```
UI Form → Validation → API Client → Database Insert → Audit Log → UI Update
```

#### Update Operations:
```
UI Form → Get Old Data → Database Update → Audit Log → UI Refresh
```

#### Stage Progression:
```
Stage Change → Update Candidate → Create Stage History → Trigger Alerts → Update UI
```

## Security & Compliance

### 1. Data Protection
- **Row Level Security (RLS)** on all tables
- **User role-based access control**
- **Audit trail** for all data modifications
- **Secure file storage** for documents

### 2. Business Rules
- **Unique constraints** on passport numbers and agency IDs
- **Foreign key integrity** across all relationships
- **Stage progression validation**
- **Commission calculation accuracy**

## Performance & Scalability

### 1. Database Optimization
- **UUID primary keys** for distributed scaling
- **Indexed foreign keys** for fast joins
- **JSONB fields** for flexible data storage
- **Automatic timestamps** for audit trails

### 2. Frontend Optimization
- **Component-based architecture** for reusability
- **Smart table components** with sorting and filtering
- **Lazy loading** for large datasets
- **Real-time updates** via Supabase subscriptions

## Deployment & Maintenance

### 1. Environment Setup
- **Supabase project** with PostgreSQL database
- **React/TypeScript** frontend application
- **Environment variables** for configuration
- **SSL/TLS encryption** for data transmission

### 2. Monitoring & Analytics
- **System performance metrics**
- **User activity tracking**
- **Error logging and alerting**
- **Business intelligence dashboards**

This documentation provides a complete overview of how the Recruitment Management System operates, from database design through business processes to technical implementation details.
