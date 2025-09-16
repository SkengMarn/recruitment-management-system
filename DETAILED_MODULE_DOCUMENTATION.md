# Detailed Module Documentation - Recruitment Management System

## Table of Contents
1. [CandidatesModule - Core Recruitment Workflow](#candidatesmodule)
2. [AgentsModule - Agent Management & Performance](#agentsmodule)
3. [EmployersModule - Company & Position Management](#employersmodule)
4. [FinancialsModule - Payment & Commission Tracking](#financialsmodule)
5. [DocumentsModule - File Management & Verification](#documentsmodule)
6. [API Client - Database Integration Layer](#api-client)
7. [UI Components - Reusable Interface Elements](#ui-components)

---

## CandidatesModule - Core Recruitment Workflow {#candidatesmodule}

**File:** `src/components/CandidatesModule.tsx`
**Purpose:** Manages the complete candidate lifecycle from registration through deployment
**Database Tables:** `candidates`, `agents`, `receiving_companies`, `stage_history`, `payments`, `documents`

### Core Functions & Their Importance

#### 1. **fetchAllData()**
```typescript
const fetchAllData = async () => {
  // Loads candidates, agents, employers, positions, and statuses
}
```
**Purpose:** Initializes the module with all required data
**Why Important:** 
- Ensures UI has complete context for candidate management
- Loads reference data for dropdowns and selections
- Establishes data relationships for proper form functionality

**How It Works:**
1. Calls `apiClient.getCandidates()` to load all candidate records
2. Fetches agents list for assignment dropdowns
3. Loads employers (receiving companies) for placement options
4. Retrieves position data for job matching
5. Sets up candidate status configurations
6. Handles loading states and error management

#### 2. **handleCreateCandidate(formData)**
```typescript
const handleCreateCandidate = async (formData) => {
  const response = await apiClient.createCandidate(formData);
  setCandidates(prev => [...prev, response.candidate]);
}
```
**Purpose:** Creates new candidate records in the system
**Why Important:**
- Entry point for all new recruitment cases
- Establishes candidate-agent-employer relationships
- Triggers initial stage assignment and audit logging

**How It Works:**
1. **Form Validation:** Validates required fields (name, passport, contact info)
2. **Data Transformation:** Maps UI fields to database schema
3. **Database Insert:** Creates record in `candidates` table with proper foreign keys
4. **Audit Logging:** Records creation event in `audit_logs`
5. **UI Update:** Refreshes candidate list with new record
6. **Stage Initialization:** Sets candidate to 'passport' stage by default

**Field Mappings:**
```typescript
{
  full_name: formData.full_name,           // Required
  passport_number: formData.passport_number, // Unique identifier
  agent_id: formData.agent_id,             // FK to agents table
  receiving_company_id: formData.receiving_company_id, // FK to receiving_companies
  next_of_kin: formData.next_of_kin,       // Emergency contact
  stage: 'passport',                       // Initial workflow stage
  is_active: true                          // Active status
}
```

#### 3. **handleUpdateCandidate(id, formData)**
```typescript
const handleUpdateCandidate = async (id, formData) => {
  const response = await apiClient.updateCandidate(id, formData);
  setCandidates(prev => prev.map(candidate => 
    candidate.id === id ? response.candidate : candidate
  ));
}
```
**Purpose:** Updates existing candidate information
**Why Important:**
- Maintains data accuracy throughout recruitment process
- Tracks changes with audit trail
- Enables stage progression and status updates

**How It Works:**
1. **Pre-Update Audit:** Retrieves current data for audit comparison
2. **Field Validation:** Ensures data integrity and required fields
3. **Database Update:** Updates specific record with new information
4. **Audit Trail:** Logs old vs new data in `audit_logs` table
5. **UI Synchronization:** Updates local state to reflect changes
6. **Relationship Updates:** Maintains foreign key integrity

#### 4. **handleStageProgression(candidateId, newStage)**
```typescript
const handleStageProgression = async (candidateId, newStage) => {
  // Updates candidate stage and creates stage history
}
```
**Purpose:** Manages candidate progression through recruitment stages
**Why Important:**
- Core business logic for recruitment workflow
- Tracks time spent in each stage for performance metrics
- Triggers stage-specific actions and payments

**Recruitment Stages:**
1. **Passport Stage:** Document collection and verification
2. **Interview Stage:** Employer screening and selection
3. **Medical Examination:** Health clearance and fitness assessment
4. **Training Stage:** Skills development and job preparation
5. **Visa Processing:** Legal documentation and permits
6. **Deployment:** Final placement and travel arrangements

**How It Works:**
1. **Stage Validation:** Ensures valid stage progression sequence
2. **Time Calculation:** Computes days spent in current stage
3. **Database Updates:**
   - Updates `candidates.stage` and `stage_updated_at`
   - Creates `stage_history` record with transition details
4. **Cost Calculation:** Applies stage-specific fees if configured
5. **Alert Generation:** Creates notifications for stakeholders
6. **Commission Tracking:** Updates agent performance metrics

#### 5. **CandidateForm Component**
```typescript
const CandidateForm = ({ candidate, onSubmit, agents, employers, positions }) => {
  // Comprehensive form for candidate data entry
}
```
**Purpose:** Provides structured interface for candidate data management
**Why Important:**
- Ensures data consistency and validation
- Handles complex relationships (agent, employer assignments)
- Supports both create and edit operations

**Form Sections:**
1. **Personal Information:**
   - Full name, passport number, NIN
   - Date of birth, gender, nationality
   - Photo upload and contact details

2. **Contact Information:**
   - Phone, email, physical address
   - Next of kin details and relationships

3. **Employment Details:**
   - Agent assignment with inline creation
   - Employer selection with company matching
   - Position preferences and salary expectations

4. **System Tracking:**
   - Current stage and status
   - Notes and special requirements
   - Active/inactive status management

**Inline Creation Features:**
- **Agent Creation:** Can create new agents without leaving form
- **Employer Creation:** Can add new companies during candidate registration
- **Real-time Validation:** Immediate feedback on data entry
- **Auto-save Functionality:** Prevents data loss during long sessions

#### 6. **getFilteredAndSortedCandidates()**
```typescript
const getFilteredAndSortedCandidates = () => {
  return candidates
    .filter(candidate => /* search and filter logic */)
    .sort((a, b) => /* sorting logic */);
}
```
**Purpose:** Provides dynamic data filtering and sorting
**Why Important:**
- Enables efficient data navigation in large datasets
- Supports multiple search criteria and sorting options
- Improves user experience with responsive interface

**Filter Capabilities:**
- **Text Search:** Name, passport number, phone, email
- **Stage Filtering:** Current recruitment stage
- **Agent Filtering:** Assigned recruitment agent
- **Status Filtering:** Active/inactive candidates
- **Date Range:** Registration or stage update dates

**Sort Options:**
- **Name:** Alphabetical ordering
- **Stage:** Recruitment progress
- **Date:** Registration or last update
- **Agent:** Assigned agent name
- **Status:** Active status priority

---

## AgentsModule - Agent Management & Performance {#agentsmodule}

**File:** `src/components/AgentsModule.tsx`
**Purpose:** Manages recruitment agents, their performance, and commission tracking
**Database Tables:** `agents`, `candidates`, `payments`, `audit_logs`

### Core Functions & Their Importance

#### 1. **fetchAgents()**
```typescript
const fetchAgents = async () => {
  const response = await apiClient.getAgents();
  setAgents(response.agents);
}
```
**Purpose:** Loads all agent records with performance metrics
**Why Important:**
- Provides complete agent roster for management oversight
- Includes calculated performance metrics and earnings
- Enables agent assignment and performance tracking

**Data Enrichment:**
```typescript
const mappedAgents = data?.map(agent => ({
  ...agent,
  name: agent.agency_name,                    // UI display name
  status: agent.is_active ? 'active' : 'inactive',
  total_candidates: calculateTotalCandidates(agent.id),
  successful_placements: calculateSuccessfulPlacements(agent.id),
  total_earned: calculateCommissionEarned(agent.id),
  success_rate: calculateSuccessRate(agent)
}));
```

#### 2. **handleCreateAgent(formData)**
```typescript
const handleCreateAgent = async (formData) => {
  const response = await apiClient.createAgent(formData);
  setAgents(prev => [...prev, response.agent]);
}
```
**Purpose:** Registers new recruitment agents in the system
**Why Important:**
- Expands recruitment capacity and geographic coverage
- Establishes commission structure and territory assignments
- Creates accountability and performance tracking foundation

**Agent Registration Process:**
1. **Agency Information:**
   - Agency name and unique ID generation
   - Contact details (phone, email)
   - Geographic territory (country assignment)

2. **Commission Setup:**
   - Commission rate configuration (percentage)
   - Payment terms and calculation methods
   - Performance targets and incentives

3. **System Integration:**
   - Profile creation in `agents` table
   - Initial status set to active
   - Audit log creation for tracking

**Field Mappings:**
```typescript
{
  agency_name: formData.agency_name,        // Primary identifier
  agency_id: `AG${Date.now()}`,            // Unique system ID
  agency_country: formData.agency_country || 'UG', // Territory
  commission_rate: formData.commission_rate || 0.10, // Default 10%
  phone: formData.phone,
  email: formData.email,
  is_active: true                          // Active by default
}
```

#### 3. **handleUpdateAgent(id, formData)**
```typescript
const handleUpdateAgent = async (id, formData) => {
  const response = await apiClient.updateAgent(id, formData);
  setAgents(prev => prev.map(agent => 
    agent.id === id ? response.agent : agent
  ));
}
```
**Purpose:** Updates agent information and commission structures
**Why Important:**
- Maintains accurate agent records and contact information
- Allows commission rate adjustments based on performance
- Tracks changes for audit and compliance purposes

**Update Capabilities:**
- **Contact Information:** Phone, email, address updates
- **Commission Rates:** Performance-based rate adjustments
- **Territory Changes:** Geographic assignment modifications
- **Status Management:** Active/inactive status control

#### 4. **calculateSuccessRate(agent)**
```typescript
const calculateSuccessRate = (agent) => {
  if (agent.total_candidates === 0) return 0;
  return ((agent.successful_placements / agent.total_candidates) * 100).toFixed(1);
}
```
**Purpose:** Computes agent performance metrics
**Why Important:**
- Provides objective performance measurement
- Enables performance-based commission adjustments
- Supports agent ranking and recognition programs

**Performance Metrics:**
- **Success Rate:** Percentage of successful placements
- **Total Candidates:** Number of candidates managed
- **Earnings:** Commission earned from successful placements
- **Average Time:** Time to successful placement
- **Retention Rate:** Candidate retention in placements

#### 5. **AgentForm Component**
```typescript
const AgentForm = ({ agent, onSubmit, isEdit }) => {
  // Comprehensive agent registration/editing form
}
```
**Purpose:** Structured interface for agent data management
**Why Important:**
- Ensures consistent agent registration process
- Validates required information and commission structures
- Supports both new registration and profile updates

**Form Sections:**
1. **Agency Information:**
   - Agency name and branding
   - Unique identifier assignment
   - Geographic territory selection

2. **Contact Details:**
   - Primary contact information
   - Communication preferences
   - Emergency contact details

3. **Commission Structure:**
   - Commission rate configuration
   - Payment terms and schedules
   - Performance incentive setup

4. **System Settings:**
   - Active/inactive status
   - Access permissions and roles
   - Notification preferences

#### 6. **Commission Calculation System**
```typescript
const calculateCommissionEarned = (agentId) => {
  // Calculate total commission from successful placements
  return successfulPlacements.reduce((total, placement) => {
    return total + (placement.total_fees * agent.commission_rate);
  }, 0);
}
```
**Purpose:** Automated commission calculation and tracking
**Why Important:**
- Ensures accurate and timely commission payments
- Provides transparency in earnings calculation
- Supports performance-based incentive programs

**Commission Calculation Logic:**
1. **Successful Placement Identification:** Candidates in 'deployed' stage
2. **Fee Calculation:** Sum of all payments for each candidate
3. **Commission Application:** Agent commission rate × total fees
4. **Currency Handling:** Multi-currency support and conversion
5. **Payment Tracking:** Commission payment history and status

---

## EmployersModule - Company & Position Management {#employersmodule}

**File:** `src/components/EmployersModule.tsx`
**Purpose:** Manages receiving companies (employers) and their job positions
**Database Tables:** `receiving_companies`, `positions`, `candidates`, `audit_logs`

### Core Functions & Their Importance

#### 1. **fetchEmployers()**
```typescript
const fetchEmployers = async () => {
  const response = await apiClient.getEmployers();
  setEmployers(response.employers);
}
```
**Purpose:** Loads all employer records with associated data
**Why Important:**
- Provides complete employer database for candidate placement
- Includes position counts and placement statistics
- Enables employer relationship management and tracking

**Data Enhancement:**
```typescript
const mappedEmployers = data?.map(employer => ({
  ...employer,
  name: employer.company_name,              // UI display name
  status: employer.is_active ? 'active' : 'inactive',
  total_positions: countActivePositions(employer.id),
  total_placements: countSuccessfulPlacements(employer.id),
  average_salary: calculateAverageSalary(employer.id)
}));
```

#### 2. **handleCreateEmployer(formData)**
```typescript
const handleCreateEmployer = async (formData) => {
  const response = await apiClient.createEmployer(formData);
  setEmployers(prev => [...prev, response.employer]);
}
```
**Purpose:** Registers new employers in the recruitment system
**Why Important:**
- Expands job placement opportunities for candidates
- Establishes employer relationships and requirements
- Creates foundation for position posting and candidate matching

**Employer Registration Process:**
1. **Company Information:**
   - Company name and legal details
   - Industry classification and size
   - Geographic location and operations

2. **Contact Management:**
   - Primary contact person and role
   - Communication channels (phone, email)
   - Preferred contact methods and times

3. **Branding and Identity:**
   - Company logo upload and management
   - Brand colors and visual identity
   - Marketing materials and descriptions

**Field Mappings:**
```typescript
{
  company_name: formData.company_name,      // Primary identifier
  contact_person: formData.contact_person,  // Main contact
  phone: formData.phone,
  email: formData.email,
  country: formData.country,               // Operating location
  logo_url: formData.logo_url,            // Branding asset
  is_active: true                         // Active by default
}
```

#### 3. **handleUpdateEmployer(id, formData)**
```typescript
const handleUpdateEmployer = async (id, formData) => {
  const response = await apiClient.updateEmployer(id, formData);
  setEmployers(prev => prev.map(employer => 
    employer.id === id ? response.employer : employer
  ));
}
```
**Purpose:** Updates employer information and relationship status
**Why Important:**
- Maintains accurate employer records and contact information
- Tracks relationship changes and business developments
- Ensures compliance with employer requirements and preferences

#### 4. **EmployerForm Component**
```typescript
const EmployerForm = ({ employer, onSubmit, isEdit }) => {
  // Comprehensive employer registration/editing form
}
```
**Purpose:** Structured interface for employer data management
**Why Important:**
- Ensures consistent employer onboarding process
- Captures essential business information and requirements
- Supports relationship management and communication tracking

**Form Sections:**
1. **Company Details:**
   - Legal name and registration information
   - Industry type and business classification
   - Company size and employee count

2. **Contact Information:**
   - Primary contact person and title
   - Multiple communication channels
   - Preferred contact methods and schedules

3. **Location and Operations:**
   - Headquarters and operational locations
   - Countries of operation and expansion plans
   - Time zones and working hours

4. **Requirements and Preferences:**
   - Candidate skill requirements and preferences
   - Cultural and language requirements
   - Compensation ranges and benefit packages

#### 5. **Position Management Integration**
```typescript
const handlePositionCreation = async (employerId, positionData) => {
  // Create new job positions for employers
}
```
**Purpose:** Manages job positions associated with employers
**Why Important:**
- Defines specific job opportunities for candidate placement
- Establishes requirements and compensation structures
- Enables targeted candidate matching and selection

**Position Management Features:**
1. **Job Definition:**
   - Position title and job description
   - Required skills and qualifications
   - Experience level and education requirements

2. **Compensation Structure:**
   - Salary ranges and currency specifications
   - Benefit packages and additional compensation
   - Contract terms and duration

3. **Requirements Specification:**
   - Age ranges and physical requirements
   - Language and cultural preferences
   - Visa and work permit requirements

4. **Placement Tracking:**
   - Application and interview tracking
   - Placement success rates and retention
   - Employer satisfaction and feedback

---

## FinancialsModule - Payment & Commission Tracking {#financialsmodule}

**File:** `src/components/FinancialsModule.tsx`
**Purpose:** Manages all financial transactions, payments, and commission calculations
**Database Tables:** `payments`, `candidates`, `agents`, `audit_logs`

### Core Functions & Their Importance

#### 1. **fetchFinancials()**
```typescript
const fetchFinancials = async () => {
  const response = await apiClient.getFinancials();
  setFinancials(response.financials);
}
```
**Purpose:** Loads all financial records with enriched data
**Why Important:**
- Provides complete financial overview for business management
- Includes candidate and payment stage information
- Enables financial reporting and analysis

**Data Enrichment:**
```typescript
const enrichedFinancials = data?.map(financial => ({
  id: financial.id,
  candidate_id: financial.candidate_id,
  candidate_name: financial.candidates?.full_name || 'Unknown',
  type: financial.stage,                    // Payment stage
  amount: financial.amount,
  currency: financial.currency,
  status: 'completed',                      // Payment status
  date: financial.paid_at?.split('T')[0],   // Formatted date
  description: financial.notes,
  payment_method: financial.payment_method,
  reference_number: financial.reference_number
}));
```

#### 2. **handleCreateFinancial(formData)**
```typescript
const handleCreateFinancial = async (formData) => {
  const response = await apiClient.createFinancialRecord(formData);
  setFinancials(prev => [...prev, response.financial]);
}
```
**Purpose:** Records new financial transactions in the system
**Why Important:**
- Tracks all revenue and payments throughout recruitment process
- Maintains financial audit trail for compliance and reporting
- Enables commission calculation and agent compensation

**Financial Transaction Process:**
1. **Transaction Classification:**
   - Stage-based payment categorization
   - Service type identification (passport, visa, medical, etc.)
   - Currency specification and conversion rates

2. **Payment Recording:**
   - Amount and currency validation
   - Payment method and reference tracking
   - Transaction date and time stamping

3. **Candidate Association:**
   - Links payment to specific candidate
   - Updates candidate financial status
   - Triggers stage progression if applicable

**Field Mappings:**
```typescript
{
  candidate_id: formData.candidate_id,      // FK to candidates
  stage: formData.type || formData.stage,   // Payment stage
  amount: formData.amount,                  // Transaction amount
  currency: formData.currency || 'UGX',     // Default currency
  payment_method: formData.payment_method || 'Bank Transfer',
  reference_number: formData.reference_number,
  notes: formData.description || formData.notes,
  paid_by: formData.paid_by,               // User who recorded payment
  paid_at: new Date().toISOString()        // Transaction timestamp
}
```

#### 3. **handleUpdateFinancialRecord(id, formData)**
```typescript
const handleUpdateFinancialRecord = async (id, formData) => {
  const response = await apiClient.updateFinancialRecord(id, formData);
  setFinancials(prev => prev.map(financial => 
    financial.id === id ? response.financial : financial
  ));
}
```
**Purpose:** Updates existing financial records and corrections
**Why Important:**
- Enables correction of data entry errors
- Supports payment status updates and modifications
- Maintains accurate financial records for reporting

#### 4. **FinancialForm Component**
```typescript
const FinancialForm = ({ financial, onSubmit, candidates }) => {
  // Comprehensive financial transaction form
}
```
**Purpose:** Structured interface for financial data entry
**Why Important:**
- Ensures accurate and complete financial record keeping
- Provides validation for financial data integrity
- Supports multiple currencies and payment methods

**Form Sections:**
1. **Transaction Details:**
   - Candidate selection with inline creation
   - Payment stage and service type
   - Amount and currency specification

2. **Payment Information:**
   - Payment method selection
   - Reference number and tracking details
   - Transaction date and time

3. **Additional Details:**
   - Transaction notes and descriptions
   - Supporting documentation references
   - Approval workflow and authorization

#### 5. **Financial Reporting Functions**
```typescript
const generateFinancialReport = (dateRange, filters) => {
  // Generate comprehensive financial reports
}

const calculateCommissionSummary = (agentId, period) => {
  // Calculate agent commission for specific period
}

const getRevenueByStage = (stage, period) => {
  // Analyze revenue by recruitment stage
}
```
**Purpose:** Provides business intelligence and financial analysis
**Why Important:**
- Enables data-driven business decisions
- Supports financial planning and forecasting
- Provides transparency in commission calculations

**Reporting Capabilities:**
1. **Revenue Analysis:**
   - Total revenue by time period
   - Revenue breakdown by service stage
   - Currency-wise revenue distribution

2. **Commission Tracking:**
   - Agent commission calculations
   - Commission payment status and history
   - Performance-based commission adjustments

3. **Cost Analysis:**
   - Service delivery costs by stage
   - Profitability analysis per candidate
   - Operational expense tracking

4. **Trend Analysis:**
   - Revenue growth trends
   - Seasonal pattern identification
   - Forecasting and projection models

#### 6. **Multi-Currency Support**
```typescript
const handleCurrencyConversion = (amount, fromCurrency, toCurrency) => {
  // Convert between different currencies
}

const getExchangeRates = () => {
  // Fetch current exchange rates
}
```
**Purpose:** Manages multi-currency financial operations
**Why Important:**
- Supports international recruitment operations
- Provides accurate financial reporting across currencies
- Enables proper commission calculation in agent's preferred currency

**Currency Features:**
- **Supported Currencies:** USD, UGX, EUR, GBP, KES
- **Real-time Rates:** Integration with exchange rate APIs
- **Conversion Tracking:** Historical rate preservation
- **Reporting Flexibility:** Multi-currency financial reports

---

## DocumentsModule - File Management & Verification {#documentsmodule}

**File:** `src/components/DocumentsModule.tsx`
**Purpose:** Manages document upload, verification, and compliance tracking
**Database Tables:** `documents`, `candidates`, `profiles`, `alerts`

### Core Functions & Their Importance

#### 1. **fetchDocuments()**
```typescript
const fetchDocuments = async () => {
  const response = await apiClient.getDocuments();
  setDocuments(response.documents);
}
```
**Purpose:** Loads all document records with verification status
**Why Important:**
- Provides complete document inventory for compliance tracking
- Shows verification status and expiry dates
- Enables document management workflow coordination

#### 2. **handleDocumentUpload(file, candidateId, docType)**
```typescript
const handleDocumentUpload = async (file, candidateId, docType) => {
  // Upload document and create database record
}
```
**Purpose:** Manages secure document upload and storage
**Why Important:**
- Ensures secure storage of sensitive candidate documents
- Maintains document integrity and access control
- Creates audit trail for document handling

**Upload Process:**
1. **File Validation:**
   - File type and size validation
   - Virus scanning and security checks
   - Duplicate detection and prevention

2. **Secure Storage:**
   - Encrypted file storage
   - Access control and permissions
   - Backup and redundancy management

3. **Database Recording:**
   - Document metadata storage
   - Candidate association and linking
   - Upload tracking and audit logging

#### 3. **handleDocumentVerification(documentId, verificationStatus)**
```typescript
const handleDocumentVerification = async (documentId, verificationStatus) => {
  // Update document verification status
}
```
**Purpose:** Manages document verification workflow
**Why Important:**
- Ensures document authenticity and compliance
- Tracks verification process and approvers
- Maintains legal and regulatory compliance

**Verification Workflow:**
1. **Initial Review:** Document completeness and quality check
2. **Authenticity Verification:** Document validation and cross-referencing
3. **Compliance Check:** Regulatory requirement verification
4. **Approval Process:** Multi-level approval workflow
5. **Status Update:** Verification status and timestamp recording

#### 4. **Document Expiry Tracking**
```typescript
const checkDocumentExpiry = () => {
  // Monitor document expiry dates and generate alerts
}
```
**Purpose:** Proactive document expiry management
**Why Important:**
- Prevents compliance issues due to expired documents
- Enables proactive document renewal processes
- Maintains continuous candidate eligibility

---

## API Client - Database Integration Layer {#api-client}

**File:** `src/utils/supabase/client.ts`
**Purpose:** Provides centralized database access and business logic
**Database Integration:** Direct Supabase client with comprehensive CRUD operations

### Core Functions & Their Importance

#### 1. **CRUD Operations Pattern**
```typescript
// Create Pattern
async createEntity(entityData: any) {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .insert([transformedData])
      .select()
      .single()
    
    if (error) throw error
    
    // Log audit event
    await this.logAuditEvent('CREATE', 'table_name', data.id, null, data)
    
    return { entity: data }
  } catch (error) {
    console.error('Create entity error:', error)
    throw error
  }
}
```
**Purpose:** Standardized data creation with audit logging
**Why Important:**
- Ensures consistent data creation patterns
- Maintains complete audit trail for all operations
- Provides error handling and data validation

#### 2. **Field Mapping System**
```typescript
// Example: Candidate field mapping
const mappedCandidateData = {
  full_name: candidateData.full_name || candidateData.name,
  next_of_kin: candidateData.next_of_kin || candidateData.next_of_kin_name,
  receiving_company_id: candidateData.receiving_company_id || candidateData.employer_id,
  position: candidateData.position || candidateData.position_applied_for
}
```
**Purpose:** Handles UI ↔ Database field name differences
**Why Important:**
- Maintains clean separation between UI and database schemas
- Enables database schema changes without UI modifications
- Provides backward compatibility for legacy field names

#### 3. **Audit Logging System**
```typescript
async logAuditEvent(action: string, tableName: string, recordId: string, oldData: any, newData: any) {
  await supabase
    .from('audit_logs')
    .insert([{
      table_name: tableName,
      record_id: recordId,
      action: action,
      old_data: oldData,
      new_data: newData,
      user_id: getCurrentUserId(),
      timestamp: new Date().toISOString()
    }])
}
```
**Purpose:** Comprehensive audit trail for all data changes
**Why Important:**
- Provides complete change history for compliance
- Enables data recovery and change tracking
- Supports security auditing and forensic analysis

#### 4. **Error Handling Pattern**
```typescript
try {
  // Database operation
} catch (error) {
  console.error('Operation error:', error)
  
  // Log error for monitoring
  await this.logError(error, operation, context)
  
  // Transform error for UI consumption
  throw new Error(this.getErrorMessage(error))
}
```
**Purpose:** Consistent error handling and user feedback
**Why Important:**
- Provides meaningful error messages to users
- Enables error monitoring and debugging
- Maintains system stability and user experience

---

## UI Components - Reusable Interface Elements {#ui-components}

### 1. **SmartTable Component**
**File:** `src/components/ui/smart-table.tsx`
**Purpose:** Advanced data table with sorting, filtering, and pagination

**Features:**
- **Dynamic Sorting:** Multi-column sorting with direction indicators
- **Advanced Filtering:** Text search, date ranges, status filters
- **Pagination:** Configurable page sizes and navigation
- **Row Selection:** Multi-select with bulk actions
- **Responsive Design:** Mobile-friendly table layouts

#### 2. **InlineSelectCreate Component**
**File:** `src/components/ui/inline-select-create.tsx`
**Purpose:** Dropdown with inline creation capability

**Why Important:**
- Eliminates workflow interruption for creating related records
- Maintains data relationships and referential integrity
- Provides seamless user experience for complex forms

**Usage Pattern:**
```typescript
<InlineSelectCreate
  value={formData.agent_id}
  onValueChange={(value) => handleInputChange('agent_id', value)}
  placeholder="Select agent"
  label="Recruitment Agent"
  existingItems={agents}
  createFields={[
    { key: 'agency_name', label: 'Agency Name', type: 'text', required: true },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' }
  ]}
  onCreateItem={async (data) => {
    const response = await apiClient.createAgent(data);
    setAgents(prev => [...prev, response.agent]);
    return response.agent;
  }}
/>
```

#### 3. **Form Validation System**
```typescript
const validateForm = (formData, validationRules) => {
  const errors = {};
  
  validationRules.forEach(rule => {
    if (rule.required && !formData[rule.field]) {
      errors[rule.field] = rule.message || `${rule.field} is required`;
    }
    
    if (rule.pattern && !rule.pattern.test(formData[rule.field])) {
      errors[rule.field] = rule.patternMessage;
    }
  });
  
  return errors;
}
```
**Purpose:** Consistent form validation across all modules
**Why Important:**
- Ensures data quality and integrity
- Provides immediate user feedback
- Prevents invalid data submission

#### 4. **Loading and Error States**
```typescript
if (loading) {
  return <LoadingSpinner message="Loading data..." />;
}

if (error) {
  return <ErrorDisplay error={error} onRetry={fetchData} />;
}
```
**Purpose:** Consistent user feedback for async operations
**Why Important:**
- Provides clear system status to users
- Enables error recovery and retry mechanisms
- Maintains professional user experience

### Integration Summary

Each module works together to create a comprehensive recruitment management system:

1. **Data Flow:** UI Components → API Client → Database → Audit Logs
2. **Business Logic:** Stage progression triggers payments and document requirements
3. **Relationships:** Agents manage candidates placed with employers
4. **Financial Tracking:** All transactions linked to candidates and stages
5. **Compliance:** Document verification and audit trails ensure regulatory compliance

The system provides end-to-end recruitment workflow management with complete audit trails, financial tracking, and performance analytics.
