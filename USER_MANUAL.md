# Recruitment Management System - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Module Guide](#module-guide)
4. [User Management](#user-management)
5. [Troubleshooting](#troubleshooting)
6. [Technical Information](#technical-information)

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Valid user account with appropriate permissions

### First Login
1. Navigate to your deployment URL
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the main dashboard

### Navigation
- **Sidebar Menu**: Access all modules from the left sidebar
- **Global Search**: Use the search bar to find candidates, agents, or employers
- **User Profile**: Click your avatar in the top-right for account settings

---

## Dashboard Overview

The dashboard provides a comprehensive overview of your recruitment operations:

### Key Metrics Cards
- **Total Candidates**: Current number of candidates in the system
- **Active Jobs**: Open positions requiring candidates
- **Pending Documents**: Documents awaiting verification
- **Monthly Revenue**: Financial performance tracking

### Quick Actions
- **Add New Candidate**: Start the recruitment process
- **Create Job Order**: Post new employment opportunities
- **Upload Documents**: Add candidate documentation
- **Generate Reports**: Access analytics and insights

---

## Module Guide

### 1. Candidates Module

**Purpose**: Manage candidate profiles and track their recruitment journey

#### Adding a New Candidate
1. Click "Add Candidate" button
2. Fill in the fullscreen form with 4 sections:
   - **Personal Information**: Name, contact details, nationality
   - **Next of Kin Information**: Emergency contact details
   - **Assignment Information**: Job placement and agent assignment
   - **Additional Information**: Skills, experience, notes

3. Use inline creation for:
   - **Agents**: Create new agents without leaving the form
   - **Employers**: Add new companies on-the-fly
   - **Jobs**: Create job positions directly

#### Candidate Stages
Candidates progress through 6 stages:
1. **Initial**: Just registered
2. **Documentation**: Collecting required documents
3. **Medical**: Medical examinations and clearances
4. **Training**: Skills development and certification
5. **Deployment**: Job placement process
6. **Deployed**: Successfully placed in employment

#### Stage Management
- Click on a candidate to view details
- Use the stage progression buttons to move candidates forward
- Each stage has specific requirements and costs
- Automatic audit logging tracks all changes

### 2. Agents Module

**Purpose**: Manage recruitment agents and track their performance

#### Agent Information Sections
- **Basic Information**: Name, contact details, agency affiliation
- **Contact Information**: Phone, email, address
- **Business Terms**: Commission rates and payment structure
- **Performance Metrics**: Success rates and candidate placements

#### Commission System
- **Flat Rate**: Fixed amount per successful placement
- **Percentage**: Percentage of job fee
- **Hybrid**: Combination of flat and percentage

### 3. Employers Module

**Purpose**: Manage companies and their job requirements

#### Company Profile Sections
- **Company Information**: Business details and registration
- **Contact Information**: Primary contacts and communication
- **Partnership Details**: Contract terms and payment arrangements
- **Additional Information**: Special requirements and notes

#### Job Management
- Link multiple job positions to each employer
- Track payment terms and markup structures
- Monitor active vs. filled positions

### 4. Jobs Module

**Purpose**: Create and manage job opportunities

#### Job Creation Sections
- **Basic Information**: Title, description, location
- **Compensation Details**: Salary, benefits, markup calculations
- **Contract Terms**: Duration, working conditions
- **Benefits & Additional Information**: Perks and special conditions

#### Markup System
- **Company Markup**: Additional fees charged to employers
- **Agency Markup**: Commission for recruitment agencies
- **Types**: Flat amount (UGX) or percentage-based
- **Real-time Calculation**: Automatic final fee computation

### 5. Documents Module

**Purpose**: Manage candidate documentation and verification

#### Document Types
- Passport
- Medical Certificate
- Training Certificate
- Visa Documents
- Candidate Photos
- National ID
- Birth Certificate
- Police Clearance
- Educational Certificates
- Work Permits

#### Document Upload Process
1. Select candidate from dropdown or create new
2. Choose document type
3. Upload file (PDF, JPG, PNG, DOC, DOCX - max 10MB)
4. Set expiry date if applicable
5. Submit for verification

#### Verification Workflow
- Documents start as "Pending Verification"
- Authorized users can mark as "Verified"
- Rejected documents require re-upload
- Automatic expiry monitoring and alerts

### 6. Financials Module

**Purpose**: Track payments, commissions, and financial performance

#### Payment Management
- Record payments from employers
- Track commission payments to agents
- Monitor outstanding balances
- Generate financial reports

#### Multi-Currency Support
- Primary currency: UGX (Ugandan Shillings)
- Support for USD, EUR, GBP
- Automatic conversion for calculations
- Real-time exchange rate integration

### 7. Settings Module

**Purpose**: System configuration and user management

#### User Management
- Create new users with role-based access
- Granular permissions for each module
- Role types: Admin, Staff, Agency Owner, Agency Staff, Employer, Employer Staff

#### Permission System
- **View Access**: Read-only permissions
- **Edit Access**: Full CRUD operations
- **Module-specific**: Individual control for each system component

---

## User Management

### User Roles and Permissions

#### Admin
- Full access to all modules
- User management capabilities
- System configuration
- Financial oversight

#### Staff
- Candidate and agent management
- Job creation and management
- Document processing
- Limited financial access

#### Agency Owner
- Full candidate management
- Agent oversight
- Financial tracking for their agency
- Limited job and employer access

#### Agency Staff
- Candidate data entry
- Document upload and management
- Basic agent information access
- No financial access

#### Employer
- Job posting and management
- Candidate review (assigned to their jobs)
- Limited financial visibility
- No agent access

#### Employer Staff
- Basic job information access
- Candidate viewing only
- No financial or agent access

### Creating New Users
1. Navigate to Settings Module
2. Click "Add User"
3. Fill in user details in fullscreen modal
4. Select appropriate role
5. Configure granular permissions using toggle switches
6. Save and send invitation

---

## Troubleshooting

### Common Issues

#### Login Problems
- **Forgot Password**: Use the password reset link
- **Account Locked**: Contact system administrator
- **Invalid Credentials**: Verify email and password

#### Performance Issues
- **Slow Loading**: Check internet connection
- **Module Not Responding**: Refresh the page
- **Data Not Saving**: Verify all required fields are filled

#### Document Upload Issues
- **File Too Large**: Compress files under 10MB
- **Unsupported Format**: Use PDF, JPG, PNG, DOC, or DOCX
- **Upload Failed**: Check internet connection and try again

### Error Messages

#### "Validation Error"
- Check all required fields are completed
- Verify data formats (email, phone numbers)
- Ensure file uploads meet requirements

#### "Permission Denied"
- Contact administrator for access rights
- Verify you're logged in with correct account
- Check if your role has required permissions

#### "Network Error"
- Check internet connection
- Try refreshing the page
- Contact technical support if persistent

---

## Technical Information

### System Architecture
- **Frontend**: React + TypeScript with Vite
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Hosting**: Sevalla (Static Site)

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Security Features
- Row Level Security (RLS) on all database tables
- Audit logging for all operations
- Role-based access control
- Secure file upload and storage
- Encrypted data transmission

### Data Backup
- Automatic daily backups via Supabase
- Point-in-time recovery available
- Export functionality for critical data
- Disaster recovery procedures in place

### Performance Optimization
- Lazy loading of modules
- Optimized database queries
- CDN delivery for static assets
- Responsive design for all devices

### API Integration
- RESTful API architecture
- Real-time updates via WebSockets
- Comprehensive error handling
- Rate limiting and security measures

---

## Support and Maintenance

### Getting Help
- **Technical Issues**: Contact system administrator
- **Feature Requests**: Submit through feedback form
- **Training**: Request user training sessions
- **Documentation**: Refer to this manual and inline help

### System Updates
- Regular security updates applied automatically
- Feature updates announced in advance
- Maintenance windows scheduled during off-hours
- Backup procedures before major updates

### Best Practices
- **Regular Backups**: Export important data regularly
- **Password Security**: Use strong, unique passwords
- **Data Accuracy**: Verify information before saving
- **Permission Management**: Review user access regularly

---

## Appendix

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save current form
- `Ctrl/Cmd + F`: Open global search
- `Esc`: Close modal dialogs
- `Tab`: Navigate between form fields

### Data Export Formats
- **CSV**: For spreadsheet analysis
- **PDF**: For formal reports
- **JSON**: For system integration
- **Excel**: For advanced data manipulation

### Integration Capabilities
- **Email Systems**: Automated notifications
- **Payment Gateways**: Financial processing
- **Document Scanners**: Direct upload integration
- **HR Systems**: Data synchronization

---

*Last Updated: September 16, 2025*
*Version: 1.0*
*For technical support, contact: support@recruitmentms.com*
