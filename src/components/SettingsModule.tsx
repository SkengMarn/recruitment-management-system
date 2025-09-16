import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Settings,
  User,
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Building2, 
  RefreshCw,
  Eye,
  EyeOff,
  X,
  DollarSign,
  AlertCircle,
  Mail,
  Phone,
  Key,
  Globe,
  Save,
  Database,
  Bell,
  Upload,
  Image,
  BarChart3,
  TrendingUp,
  Clock,
  Activity,
  FileText,
  Calendar
} from 'lucide-react';
import { apiClient, supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

const SettingsModule = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>({});
  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingValue, setNewSettingValue] = useState('');
  const [newSettingDescription, setNewSettingDescription] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ 
    email: '', 
    full_name: '', 
    role: 'staff',
    organization_id: '',
    organization_type: '', 
    permissions: {
      candidates: 'read',
      agents: 'read', 
      employers: 'read',
      jobs: 'read',
      financials: 'read',
      documents: 'read',
      settings: 'none'
    }
  });
  const [organizations, setOrganizations] = useState<{ agencies: any[], employers: any[] }>({ agencies: [], employers: [] });
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [showAddOrganization, setShowAddOrganization] = useState(false);
  const [newOrganization, setNewOrganization] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    license_number: ''
  });
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string>('');

  useEffect(() => {
    fetchSettings();
    fetchUsers();
    fetchOrganizations();
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    // Reset organization selection when role changes
    if (newUser.role !== 'agency_staff' && newUser.role !== 'employer_staff') {
      setNewUser(prev => ({ ...prev, organization_id: '', organization_type: '' }));
    }
    // Clear validation errors when role changes
    setValidationErrors({});
  }, [newUser.role]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch system settings from database
      const settingsData = await apiClient.getSettings();
      setSystemSettings(settingsData.data || []);
      
      // Convert array of settings to object for easier access
      const settingsObj: any = {};
      settingsData.data?.forEach((setting: any) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      
      // Set default values if not in database
      const defaultSettings = {
        // User Profile - will be updated by fetchCurrentUser
        userName: settingsObj.user_name || '',
        userEmail: settingsObj.user_email || '',
        userPhone: settingsObj.user_phone || '',
        userRole: settingsObj.user_role || 'Operations Manager',
        
        // Company Settings
        companyName: settingsObj.company_name || 'Jawal International',
        companyAddress: settingsObj.company_address || 'Kampala, Uganda',
        companyPhone: settingsObj.company_phone || '+256701234567',
        companyEmail: settingsObj.company_email || 'info@jawalinternational.com',
        
        // System Settings
        defaultCurrency: settingsObj.default_currency || 'UGX',
        defaultLanguage: settingsObj.default_language || 'English',
        timezone: settingsObj.timezone || 'Africa/Kampala',
        dateFormat: settingsObj.date_format || 'DD/MM/YYYY',
        
        // Financial Settings
        serviceFee: parseInt(settingsObj.service_fee) || 100000,
        investmentAmount: parseInt(settingsObj.investment_amount) || 2469000,
        employerFee: parseInt(settingsObj.employer_fee) || 3500000,
        agentCommissionRate: parseFloat(settingsObj.agent_commission_rate) || 10,
        refundAmount: parseInt(settingsObj.refund_amount) || 500000,
        
        // Notification Settings
        emailNotifications: settingsObj.email_notifications === 'true' || true,
        smsNotifications: settingsObj.sms_notifications === 'true' || true,
        systemAlerts: settingsObj.system_alerts === 'true' || true,
        weeklyReports: settingsObj.weekly_reports === 'true' || true,
        monthlyReports: settingsObj.monthly_reports === 'true' || true,
        
        // Security Settings
        twoFactorAuth: settingsObj.two_factor_auth === 'true' || false,
        sessionTimeout: parseInt(settingsObj.session_timeout) || 60,
        passwordExpiry: parseInt(settingsObj.password_expiry) || 90,
        loginAttempts: parseInt(settingsObj.login_attempts) || 5
      };
      
      setSettings(defaultSettings);
      
      // Fetch users for access control
      await fetchUsers();
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      
      // Fetch agencies
      const agenciesResult = await supabase
        .from('agents')
        .select('id, agency_name, agency_country, phone, email, is_active')
        .eq('is_active', true)
        .order('agency_name');
      
      // Fetch employers
      const employersResult = await supabase
        .from('receiving_companies')
        .select('id, company_name, country, phone, email, is_active')
        .eq('is_active', true)
        .order('company_name');
      
      if (agenciesResult.error) throw agenciesResult.error;
      if (employersResult.error) throw employersResult.error;
      
      setOrganizations({
        agencies: agenciesResult.data || [],
        employers: employersResult.data || []
      });
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('Fetching users from database...');
      console.log('Current auth user:', await supabase.auth.getUser());
      
      // Fetch real users from profiles table with their permissions
      const usersResult = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          phone,
          photo_url,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });
      
      console.log('Users query result:', usersResult);
      console.log('Users query error details:', usersResult.error);
      
      if (usersResult.error) {
        console.error('Users query error:', usersResult.error);
        console.error('Error code:', usersResult.error.code);
        console.error('Error message:', usersResult.error.message);
        console.error('Error details:', usersResult.error.details);
        console.error('Error hint:', usersResult.error.hint);
        
        // Set empty users but don't throw to allow UI to show
        setUsers([]);
        setError(`Failed to load users: ${usersResult.error.message}`);
        return;
      }
      
      const fetchedUsers = usersResult.data || [];
      console.log('Fetched users:', fetchedUsers);
      setUsers(fetchedUsers);
      
      // Try to fetch permissions for each user (table may not exist yet)
      let permissionsResult = { data: [], error: null };
      try {
        permissionsResult = await supabase
          .from('permissions')
          .select('*');
        
        console.log('Permissions query result:', permissionsResult);
        
        if (permissionsResult.error) {
          console.error('Permissions query error:', permissionsResult.error);
          // Don't throw error if permissions table doesn't exist
          if ((permissionsResult.error as any).code !== 'PGRST116') {
            throw permissionsResult.error;
          }
        }
      } catch (permError) {
        console.log('Permissions table not accessible, using empty permissions:', permError);
        permissionsResult = { data: [], error: null };
      }
      
      // Group permissions by user_id
      const permissions: any = {};
      fetchedUsers.forEach((user: any) => {
        permissions[user.id] = {};
      });
      
      (permissionsResult.data || []).forEach((perm: any) => {
        if (!permissions[perm.user_id]) {
          permissions[perm.user_id] = {};
        }
        permissions[perm.user_id][perm.module] = perm.access_level;
      });
      
      console.log('Processed permissions:', permissions);
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setError(`Failed to load users: ${error.message}`);
      // Set empty users array to show the interface
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      if (section === 'Profile') {
        // Update user profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: settings.userName,
            phone: settings.userPhone,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser?.id);

        if (profileError) {
          throw profileError;
        }

        // Update auth user metadata if needed
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: settings.userName,
            phone: settings.userPhone
          }
        });

        if (authError) {
          console.warn('Auth metadata update warning:', authError);
        }

        // Update local state
        setCurrentUser(prev => ({
          ...prev,
          full_name: settings.userName,
          phone: settings.userPhone
        }));

        toast.success('Profile updated successfully');
        return;
      }

      // Save other settings to system_settings table
      const settingsToSave: any[] = [];
      
      // Map UI settings to database format
      Object.entries(settings).forEach(([key, value]) => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        settingsToSave.push({
          key: dbKey,
          value: String(value),
          description: `${section} setting: ${key}`
        });
      });
      
      // Update or create each setting
      for (const setting of settingsToSave) {
        try {
          await apiClient.updateSetting(setting.key, setting.value);
        } catch (error) {
          // If update fails, try to create
          await apiClient.createSetting({
            key: setting.key,
            value: setting.value,
            description: setting.description
          });
        }
      }
      
      toast.success(`${section} settings saved successfully!`);
      await fetchSettings(); // Refresh settings
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSetting = async () => {
    if (!newSettingKey.trim() || !newSettingValue.trim()) {
      toast.error('Please provide both key and value');
      return;
    }

    try {
      await apiClient.createSetting({
        key: newSettingKey,
        value: newSettingValue,
        description: newSettingDescription || `Custom setting: ${newSettingKey}`
      });
      
      toast.success('Setting created successfully');
      setNewSettingKey('');
      setNewSettingValue('');
      setNewSettingDescription('');
      await fetchSettings();
    } catch (error) {
      console.error('Failed to create setting:', error);
      toast.error('Failed to create setting');
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) return;

    try {
      await apiClient.deleteSetting(key);
      toast.success('Setting deleted successfully');
      await fetchSettings();
    } catch (error) {
      console.error('Failed to delete setting:', error);
      toast.error('Failed to delete setting');
    }
  };

  const handlePermissionChange = async (userId, module, accessLevel) => {
    try {
      // Update permission in database
      const { error } = await supabase
        .from('permissions')
        .upsert({
          user_id: userId,
          module: module,
          access_level: accessLevel
        }, {
          onConflict: 'user_id,module'
        });
      
      if (error) throw error;
      
      // Update local state
      setUserPermissions(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [module]: accessLevel
        }
      }));
      
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Failed to update permission:', error);
      toast.error('Failed to update permission');
    }
  };
  
  const handleDeleteUser = async (userId) => {
    // Find the user to check their role
    const userToDelete = users.find(user => user.id === userId);
    
    // Prevent deletion of admin users
    if (userToDelete && userToDelete.role === 'admin') {
      alert('⚠️ Administrator accounts cannot be deleted for security reasons.\n\nAdmin users are protected to ensure system access is maintained.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete user permissions first
      await supabase
        .from('permissions')
        .delete()
        .eq('user_id', userId);
      
      // Delete user profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Delete from auth.users (this might require admin privileges)
      await supabase.auth.admin.deleteUser(userId);
      
      // Refresh users list
      fetchUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };
  
  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };
  
  const handleCreateUser = async () => {
    console.log('Create User button clicked!');
    setCreatingUser(true);
    
    try {
      // Validate required fields
      const errors: any = {};
      
      if (!newUser.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!newUser.full_name) {
        errors.full_name = 'Full name is required';
      }
      
      // Validate organization selection for roles that require it
      if ((newUser.role === 'agency_staff' || newUser.role === 'agency_owner') && !newUser.organization_id) {
        errors.organization = 'Please select an agency';
      }
      
      if (newUser.role === 'employer_staff' && !newUser.organization_id) {
        errors.organization = 'Please select an employer';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setCreatingUser(false);
        return;
      }

      console.log('Validation passed, creating user...');

      // Check if user already exists by checking profiles table with user_id
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', newUser.full_name)
        .single();

      if (existingUser) {
        setValidationErrors({ email: 'A user with this email already exists' });
        setCreatingUser(false);
        return;
      }

      console.log('User does not exist, proceeding with creation...');

      // Handle rate limiting with better error message
      let authUser;
      let authError;
      
      try {
        // Create user in Supabase Auth with email verification
        const result = await supabase.auth.signUp({
          email: newUser.email,
          password: 'TempPassword123!',
          options: {
            data: {
              full_name: newUser.full_name,
              role: newUser.role
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        authUser = result.data;
        authError = result.error;
      } catch (error: any) {
        authError = error;
      }

      console.log('Auth signup result:', { authUser, authError });

      if (authError) {
        console.error('Auth error:', authError);
        
        // Handle rate limiting specifically
        if (authError.message?.includes('For security purposes') || authError.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment before creating another user.');
        } else {
          toast.error('Failed to create user: ' + authError.message);
        }
        setCreatingUser(false);
        return;
      }

      if (!authUser?.user) {
        console.error('No user returned from auth signup');
        toast.error('Failed to create user: No user data returned');
        setCreatingUser(false);
        return;
      }

      console.log('User created in auth, creating profile...');

      // Create profile (using id as primary key, no separate user_id needed)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.user.id,
          full_name: newUser.full_name,
          role: newUser.role
        }]);

      console.log('Profile creation result:', { profileError });

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error('Failed to create user profile: ' + profileError.message);
        setCreatingUser(false);
        return;
      }

      // Add user to agency's users array if it's an agency role
      if (newUser.role === 'agency_staff' || newUser.role === 'agency_owner') {
        console.log('Adding user to agency...');
        const { error: agencyError } = await supabase.rpc('add_user_to_agency', {
          agency_id: newUser.organization_id,
          user_id: authUser.user.id
        });

        if (agencyError) {
          console.error('Failed to add user to agency:', agencyError);
          toast.error('User created but failed to link to agency');
        }
      }

      // Log the user creation with organization association
      console.log('Logging audit trail...');
      await supabase
        .from('audit_logs')
        .insert([{
          table_name: 'profiles',
          operation: 'CREATE',
          record_id: authUser.user.id,
          old_data: null,
          new_data: {
            full_name: newUser.full_name,
            role: newUser.role,
            organization_id: newUser.organization_id,
            organization_type: newUser.organization_type
          },
          user_id: authUser.user.id
        }]);

      console.log('User creation completed successfully!');
      toast.success('User created successfully! They will receive an email verification link before they can login.');
      
      // Reset form and close modal
      setShowAddUserModal(false);
      setNewUser({ 
        email: '', 
        full_name: '', 
        role: 'staff', 
        organization_id: '', 
        organization_type: '',
        permissions: {
          candidates: 'read',
          agents: 'read', 
          employers: 'read',
          jobs: 'read',
          financials: 'read',
          documents: 'read',
          settings: 'none'
        }
      });
      setValidationErrors({});
      setOrganizationSearch('');
      
      // Refresh the users list
      await fetchUsers();
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. Please try again.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleOrganizationSelect = (orgId, orgType) => {
    setNewUser(prev => ({ 
      ...prev, 
      organization_id: orgId, 
      organization_type: orgType 
    }));
    setValidationErrors(prev => ({ ...prev, organization: '' }));
  };
  
  const getFilteredOrganizations = () => {
    const orgType = (newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'agencies' : 'employers';
    const orgs = organizations[orgType] || [];
    
    if (!organizationSearch) return orgs;
    
    return orgs.filter((org: any) => {
      const name = orgType === 'agencies' ? org.agency_name : org.company_name;
      return name.toLowerCase().includes(organizationSearch.toLowerCase());
    });
  };
  
  const getSelectedOrganization = () => {
    if (!newUser.organization_id) return null;
    
    const orgType = (newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'agencies' : 'employers';
    const orgs = organizations[orgType] || [];
    
    return orgs.find((org: any) => org.id === newUser.organization_id);
  };

  const handleCreateOrganization = async () => {
    try {
      setCreatingOrganization(true);
      
      // Validate required fields
      const errors: any = {};
      if (!newOrganization.name.trim()) {
        errors.name = 'Organization name is required';
      }
      if (!newOrganization.email.trim()) {
        errors.email = 'Email is required';
      }
      if (!newOrganization.country.trim()) {
        errors.country = 'Country is required';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const isAgency = (newUser.role === 'agency_staff' || newUser.role === 'agency_owner');
      
      if (isAgency) {
        // Create agency
        const { data: agencyData, error: agencyError } = await supabase
          .from('agents')
          .insert({
            agency_name: newOrganization.name,
            email: newOrganization.email,
            phone: newOrganization.phone,
            agency_country: newOrganization.country,
            address: newOrganization.address,
            commission_rate: 10, // Default commission rate
            commission_type: 'percentage',
            commission_value: 10,
            active: true
          })
          .select()
          .single();

        if (agencyError) throw agencyError;

        // Auto-select the new agency
        handleOrganizationSelect(agencyData.id, 'agency');
        
        toast.success('Agency created successfully');
      } else {
        // Create employer
        const { data: employerData, error: employerError } = await supabase
          .from('receiving_companies')
          .insert({
            company_name: newOrganization.name,
            email: newOrganization.email,
            phone: newOrganization.phone,
            country: newOrganization.country,
            address: newOrganization.address,
            license_number: newOrganization.license_number,
            payment_type: 'employer_funded',
            active: true
          })
          .select()
          .single();

        if (employerError) throw employerError;

        // Auto-select the new employer
        handleOrganizationSelect(employerData.id, 'employer');
        
        toast.success('Employer created successfully');
      }

      // Refresh organizations list
      await fetchOrganizations();
      
      // Reset form and close modal
      setNewOrganization({
        name: '',
        email: '',
        phone: '',
        country: '',
        address: '',
        license_number: ''
      });
      setShowAddOrganization(false);
      setValidationErrors({});

    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error('Failed to create organization');
    } finally {
      setCreatingOrganization(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Use auth user data as fallback
          setCurrentUser({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Admin User',
            phone: user.user_metadata?.phone || '',
            role: 'admin'
          });
        } else {
          setCurrentUser({
            ...profile,
            email: user.email // Always use email from auth
          });
        }

        // Update settings with real user data
        setSettings(prev => ({
          ...prev,
          userName: profile?.full_name || user.user_metadata?.full_name || 'Admin User',
          userEmail: user.email,
          userPhone: profile?.phone || user.user_metadata?.phone || '',
          userRole: profile?.role || 'admin'
        }));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setChangingPassword(true);
      
      // Validate form
      const errors: any = {};
      if (!passwordData.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }
      if (!passwordData.newPassword) {
        errors.newPassword = 'New password is required';
      }
      if (passwordData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      }
      if (!passwordData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      // Show success state
      setPasswordChangeSuccess(true);
      setValidationErrors({});
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordModal(false);
        setPasswordChangeSuccess(false);
      }, 3000);

    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleBackgroundImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file must be less than 5MB');
        return;
      }

      setBackgroundImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = async () => {
    if (!backgroundImageFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploadingBackground(true);
      
      // Use base64 encoding for reliable storage without bucket dependencies
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          
          // Save data URL to settings
          await apiClient.updateSetting('login_background_image', dataUrl);
          
          // Update local settings
          setSettings(prev => ({
            ...prev,
            loginBackgroundImage: dataUrl
          }));

          toast.success('Login background image updated successfully!');
          
          // Reset form
          setBackgroundImageFile(null);
          setBackgroundImagePreview('');
          
          // Refresh settings
          await fetchSettings();
        } catch (error: any) {
          console.error('Background upload error:', error);
          toast.error(error.message || 'Failed to upload background image');
        } finally {
          setUploadingBackground(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setUploadingBackground(false);
      };
      
      reader.readAsDataURL(backgroundImageFile);
      
    } catch (error: any) {
      console.error('Background upload error:', error);
      toast.error(error.message || 'Failed to upload background image');
      setUploadingBackground(false);
    }
  };

  const handleResetBackgroundImage = async () => {
    try {
      await apiClient.updateSetting('login_background_image', '');
      
      setSettings(prev => ({
        ...prev,
        loginBackgroundImage: ''
      }));

      toast.success('Login background reset to default');
      await fetchSettings();
    } catch (error: any) {
      console.error('Reset background error:', error);
      toast.error('Failed to reset background image');
    }
  };
  
  const getRolePermissionSummary = (role) => {
    switch (role) {
      case 'admin':
        return 'Full system access with all permissions across all modules';
      case 'staff':
        return 'System-wide access with read/write permissions on most modules';
      case 'agency_owner':
        return 'Full agency management access including staff management, candidate operations, and financial oversight for the selected agency';
      case 'agency_staff':
        return 'Limited access to records and operations related to the selected agency only';
      case 'employer':
        return 'Full employer access including job posting, candidate review, and hiring management';
      case 'employer_staff':
        return 'Limited access to records and operations related to the selected employer only';
      default:
        return 'Standard user permissions based on role assignment';
    }
  };

  const getDefaultPermissions = (role) => {
    switch (role) {
      case 'admin':
        return {
          candidates: 'write',
          agents: 'write',
          employers: 'write',
          jobs: 'write',
          financials: 'write',
          documents: 'write',
          settings: 'write'
        };
      case 'staff':
        return {
          candidates: 'write',
          agents: 'write',
          employers: 'write',
          jobs: 'write',
          financials: 'read',
          documents: 'write',
          settings: 'read'
        };
      case 'agency_owner':
        return {
          candidates: 'write',
          agents: 'read',
          employers: 'none',
          jobs: 'read',
          financials: 'write',
          documents: 'write',
          settings: 'none'
        };
      case 'agency_staff':
        return {
          candidates: 'write',
          agents: 'read',
          employers: 'none',
          jobs: 'read',
          financials: 'read',
          documents: 'write',
          settings: 'none'
        };
      case 'employer':
        return {
          candidates: 'read',
          agents: 'none',
          employers: 'write',
          jobs: 'write',
          financials: 'read',
          documents: 'read',
          settings: 'none'
        };
      case 'employer_staff':
        return {
          candidates: 'read',
          agents: 'none',
          employers: 'read',
          jobs: 'read',
          financials: 'read',
          documents: 'read',
          settings: 'none'
        };
      default:
        return {
          candidates: 'read',
          agents: 'read',
          employers: 'read',
          jobs: 'read',
          financials: 'none',
          documents: 'read',
          settings: 'none'
        };
    }
  };

  const updateUserPermission = (module, level) => {
    setNewUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: level
      }
    }));
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'approve': return 'text-green-600 bg-green-50';
      case 'delete': return 'text-red-600 bg-red-50';
      case 'write': return 'text-blue-600 bg-blue-50';
      case 'read': return 'text-yellow-600 bg-yellow-50';
      case 'none': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Settings className="h-6 w-6 mr-3" />
                System Settings
              </CardTitle>
              <CardDescription className="mt-1">
                Configure system preferences and operational parameters
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        {user?.role === 'admin' && (
          <TabsList className="grid w-full grid-cols-2 mt-2">
            <TabsTrigger value="staff">Staff Analytics</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                User Profile
              </CardTitle>
              <CardDescription>
                Manage your personal account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name</Label>
                  <Input
                    id="userName"
                    value={settings.userName}
                    onChange={(e) => handleSettingChange('userName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole">Role</Label>
                  <Input
                    id="userRole"
                    value={currentUser?.role || settings.userRole || 'admin'}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Role cannot be changed from this interface. Contact system administrator.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email Address</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={settings.userEmail}
                    onChange={(e) => handleSettingChange('userEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPhone">Phone Number</Label>
                  <Input
                    id="userPhone"
                    value={settings.userPhone}
                    onChange={(e) => handleSettingChange('userPhone', e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={() => handleSave('Profile')} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
              <CardDescription>
                Configure company details and business settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
                    value={settings.defaultCurrency}
                    onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                  >
                    <option value="UGX">UGX - Ugandan Shilling</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyPhone}
                    onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={settings.companyAddress}
                  onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  >
                    <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={() => handleSave('Company')} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Company Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Analytics Tab */}
        <TabsContent value="staff" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Staff Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">Monitor staff productivity and system usage</p>
            </div>

            {/* Staff Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                      <p className="text-2xl font-semibold">12</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +2 this month
                      </p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                      <p className="text-2xl font-semibold">8</p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        <Activity className="h-3 w-3 mr-1" />
                        Currently online
                      </p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Session Time</p>
                      <p className="text-2xl font-semibold">4.2h</p>
                      <p className="text-sm text-orange-600 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Per day
                      </p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System Usage</p>
                      <p className="text-2xl font-semibold">94.7%</p>
                      <p className="text-sm text-purple-600 flex items-center mt-1">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Efficiency rate
                      </p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <Database className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Staff Performance Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Staff Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Admin User', role: 'Administrator', lastActive: '2 mins ago', sessionsToday: 3, tasksCompleted: 24, status: 'online' },
                      { name: 'Sarah Johnson', role: 'HR Manager', lastActive: '15 mins ago', sessionsToday: 2, tasksCompleted: 18, status: 'online' },
                      { name: 'Mike Chen', role: 'Recruiter', lastActive: '1 hour ago', sessionsToday: 4, tasksCompleted: 32, status: 'away' },
                      { name: 'Lisa Wang', role: 'Coordinator', lastActive: '3 hours ago', sessionsToday: 1, tasksCompleted: 12, status: 'offline' }
                    ].map((staff, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            staff.status === 'online' ? 'bg-green-500' : 
                            staff.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-muted-foreground">{staff.role}</div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{staff.tasksCompleted} tasks</div>
                          <div className="text-muted-foreground">{staff.lastActive}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Module Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { module: 'Candidates', usage: 89, sessions: 156, avgTime: '12m' },
                      { module: 'Jobs', usage: 76, sessions: 124, avgTime: '8m' },
                      { module: 'Employers', usage: 68, sessions: 98, avgTime: '15m' },
                      { module: 'Documents', usage: 54, sessions: 87, avgTime: '6m' },
                      { module: 'Financials', usage: 42, sessions: 65, avgTime: '18m' }
                    ].map((item, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{item.module}</div>
                          <div className="text-sm font-semibold">{item.usage}%</div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{item.sessions} sessions</span>
                          <span>{item.avgTime} avg time</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Productivity Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">High Performers</h4>
                    {[
                      { name: 'Mike Chen', metric: '32 tasks completed today', score: 'A+' },
                      { name: 'Sarah Johnson', metric: '18 candidates processed', score: 'A' },
                      { name: 'Admin User', metric: '24 system updates', score: 'A-' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.metric}</div>
                        </div>
                        <div className="text-xs font-medium text-green-600">{item.score}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-orange-600">Needs Support</h4>
                    {[
                      { name: 'Lisa Wang', issue: 'Low activity (1 session)', action: 'Check workload' },
                      { name: 'New Staff', issue: 'Training in progress', action: 'Mentoring assigned' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.issue}</div>
                        </div>
                        <div className="text-xs text-orange-600">{item.action}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-600">System Health</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className="font-medium text-green-600">99.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Time:</span>
                        <span className="font-medium">245ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Error Rate:</span>
                        <span className="font-medium text-green-600">0.02%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Users:</span>
                        <span className="font-medium">8/12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">System Audit Logs</h3>
              <p className="text-sm text-muted-foreground">Track all system activities and user actions</p>
            </div>

            {/* Audit Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                      <p className="text-2xl font-semibold">2,847</p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        <Activity className="h-3 w-3 mr-1" />
                        Last 30 days
                      </p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Security Events</p>
                      <p className="text-2xl font-semibold">23</p>
                      <p className="text-sm text-orange-600 flex items-center mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        Requires attention
                      </p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                      <p className="text-2xl font-semibold">7</p>
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        This week
                      </p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data Changes</p>
                      <p className="text-2xl font-semibold">1,456</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Normal activity
                      </p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg">
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Audit Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Audit Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { timestamp: '2024-01-15 14:32:15', user: 'Admin User', action: 'Candidate Created', details: 'New candidate: John Doe added to system', type: 'info' },
                    { timestamp: '2024-01-15 14:28:42', user: 'Sarah Johnson', action: 'Document Verified', details: 'Passport verification completed for candidate ID: 1234', type: 'success' },
                    { timestamp: '2024-01-15 14:15:33', user: 'System', action: 'Failed Login Attempt', details: 'Invalid credentials from IP: 192.168.1.100', type: 'warning' },
                    { timestamp: '2024-01-15 13:45:21', user: 'Mike Chen', action: 'Job Updated', details: 'Construction Worker position modified - salary updated', type: 'info' },
                    { timestamp: '2024-01-15 13:22:18', user: 'Lisa Wang', action: 'Payment Processed', details: 'Commission payment of $2,400 processed for Agent ID: 567', type: 'success' },
                    { timestamp: '2024-01-15 12:58:07', user: 'Admin User', action: 'User Role Changed', details: 'User Sarah Johnson promoted to HR Manager', type: 'warning' },
                    { timestamp: '2024-01-15 12:33:44', user: 'System', action: 'Backup Completed', details: 'Daily database backup completed successfully', type: 'success' },
                    { timestamp: '2024-01-15 11:15:29', user: 'Mike Chen', action: 'Candidate Stage Updated', details: 'Candidate moved from Interview to Medical stage', type: 'info' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.type === 'success' ? 'bg-green-500' :
                        event.type === 'warning' ? 'bg-yellow-500' :
                        event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{event.action}</div>
                          <div className="text-xs text-muted-foreground">{event.timestamp}</div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{event.details}</div>
                        <div className="text-xs text-muted-foreground mt-1">User: {event.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audit Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: 'User Authentication', count: 456, percentage: 32.1, color: 'bg-blue-500' },
                      { category: 'Data Modifications', count: 389, percentage: 27.4, color: 'bg-green-500' },
                      { category: 'System Operations', count: 234, percentage: 16.5, color: 'bg-purple-500' },
                      { category: 'Security Events', count: 156, percentage: 11.0, color: 'bg-orange-500' },
                      { category: 'Error Events', count: 89, percentage: 6.3, color: 'bg-red-500' },
                      { category: 'Other', count: 95, percentage: 6.7, color: 'bg-gray-500' }
                    ].map((item, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded ${item.color}`}></div>
                            <div className="font-medium">{item.category}</div>
                          </div>
                          <div className="text-sm font-semibold">{item.percentage}%</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{item.count} events</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-600 mb-2">Critical Alerts</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Failed login attempts (last 24h):</span>
                          <span className="font-medium text-red-600">7</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Suspicious IP addresses:</span>
                          <span className="font-medium text-red-600">2</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-600 mb-2">Warnings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Unusual access patterns:</span>
                          <span className="font-medium text-yellow-600">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Permission escalations:</span>
                          <span className="font-medium text-yellow-600">1</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-600 mb-2">System Health</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Successful operations:</span>
                          <span className="font-medium text-green-600">2,756</span>
                        </div>
                        <div className="flex justify-between">
                          <span>System uptime:</span>
                          <span className="font-medium text-green-600">99.8%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="h-5 w-5 mr-2" />
                Login Page Appearance
              </CardTitle>
              <CardDescription>
                Customize the login page background image and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Background Preview */}
              <div className="space-y-3">
                <Label>Current Login Background</Label>
                <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                  {settings.loginBackgroundImage ? (
                    <img 
                      src={settings.loginBackgroundImage} 
                      alt="Current login background"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full"
                      style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="text-white text-center">
                      <h3 className="text-lg font-semibold">Login Page Preview</h3>
                      <p className="text-sm opacity-90">Background Image</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload New Background */}
              <div className="space-y-4">
                <Label>Upload New Background Image</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImageSelect}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  <Button 
                    onClick={handleBackgroundImageUpload}
                    disabled={!backgroundImageFile || uploadingBackground}
                    className="shrink-0"
                  >
                    {uploadingBackground ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: JPG, PNG, WebP. Maximum size: 5MB. Recommended resolution: 1920x1080 or higher.
                </p>
              </div>

              {/* Image Preview */}
              {backgroundImagePreview && (
                <div className="space-y-3">
                  <Label>Preview</Label>
                  <div className="relative w-full h-48 rounded-lg border overflow-hidden">
                    <img 
                      src={backgroundImagePreview} 
                      alt="Background preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-white text-center">
                        <h3 className="text-lg font-semibold">Preview</h3>
                        <p className="text-sm opacity-90">New Background</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reset to Default */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reset to Default</h4>
                    <p className="text-sm text-muted-foreground">
                      Remove custom background and use the default airplane image
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleResetBackgroundImage}
                    disabled={!settings.loginBackgroundImage}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Configuration
              </CardTitle>
              <CardDescription>
                Set default financial parameters and fee structures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceFee">Service Fee (UGX)</Label>
                  <Input
                    id="serviceFee"
                    type="number"
                    value={settings.serviceFee}
                    onChange={(e) => handleSettingChange('serviceFee', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {formatCurrency(settings.serviceFee)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investmentAmount">Total Investment (UGX)</Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    value={settings.investmentAmount}
                    onChange={(e) => handleSettingChange('investmentAmount', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {formatCurrency(settings.investmentAmount)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerFee">Employer Fee (UGX)</Label>
                  <Input
                    id="employerFee"
                    type="number"
                    value={settings.employerFee}
                    onChange={(e) => handleSettingChange('employerFee', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {formatCurrency(settings.employerFee)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">Success Refund (UGX)</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    value={settings.refundAmount}
                    onChange={(e) => handleSettingChange('refundAmount', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {formatCurrency(settings.refundAmount)}
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="agentCommissionRate">Agent Commission Rate (%)</Label>
                  <Input
                    id="agentCommissionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.agentCommissionRate}
                    onChange={(e) => handleSettingChange('agentCommissionRate', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {settings.agentCommissionRate}% of employer fee
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={() => handleSave('Financial')} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Financial Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive urgent notifications via SMS
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">System Alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified about system events and errors
                    </div>
                  </div>
                  <Switch
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Weekly Reports</div>
                    <div className="text-sm text-muted-foreground">
                      Receive automated weekly performance reports
                    </div>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Monthly Reports</div>
                    <div className="text-sm text-muted-foreground">
                      Receive comprehensive monthly business reports
                    </div>
                  </div>
                  <Switch
                    checked={settings.monthlyReports}
                    onCheckedChange={(checked) => handleSettingChange('monthlyReports', checked)}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => handleSave('Notifications')} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Change Password</div>
                      <div className="text-sm text-muted-foreground">
                        Update your account password for better security
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="15"
                      max="480"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      min="30"
                      max="365"
                      value={settings.passwordExpiry}
                      onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Maximum Failed Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.loginAttempts}
                    onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Account will be locked after this many failed attempts
                  </p>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <Button onClick={() => handleSave('Security')} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Security Settings
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-control" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Access Control
                </div>
                <Button onClick={() => setShowAddUserModal(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add User
                </Button>
              </CardTitle>
              <CardDescription>
                Manage user permissions and access rights for different modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading users...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Role</th>
                            <th className="text-left p-4 font-medium">Created</th>
                            <th className="text-left p-4 font-medium">Permissions</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <tr key={user.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                              <td className="p-4">
                                <div>
                                  <div className="font-medium">{user.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                  user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                                  user.role === 'agency_owner' ? 'bg-green-100 text-green-800' :
                                  user.role === 'employer' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.role.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {formatDate(user.created_at)}
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(userPermissions[user.id] || {}).slice(0, 3).map(([module, level]) => (
                                    <span key={module} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getAccessLevelColor(String(level))}`}>
                                      {module}: {String(level)}
                                    </span>
                                  ))}
                                  {Object.keys(userPermissions[user.id] || {}).length > 3 && (
                                    <span className="text-xs text-muted-foreground">+{Object.keys(userPermissions[user.id] || {}).length - 3} more</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openUserModal(user)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={user.role === 'admin'}
                                    className={user.role === 'admin' 
                                      ? "text-gray-400 cursor-not-allowed" 
                                      : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                    }
                                    title={user.role === 'admin' ? 'Administrator accounts cannot be deleted' : 'Delete user'}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    {user.role === 'admin' ? 'Protected' : 'Delete'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Permissions Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Edit User Permissions - {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm">{selectedUser.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm capitalize">{selectedUser.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Module Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'candidates', 'agents', 'employers', 'positions', 
                    'payments', 'documents', 'reports', 'settings', 
                    'users', 'analytics'
                  ].map(module => (
                    <div key={module} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-medium capitalize">{module}</Label>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getAccessLevelColor(userPermissions[selectedUser.id]?.[module] || 'none')}`}>
                          {userPermissions[selectedUser.id]?.[module] || 'none'}
                        </span>
                      </div>
                      <Select
                        value={userPermissions[selectedUser.id]?.[module] || 'none'}
                        onValueChange={(value) => handlePermissionChange(selectedUser.id, module, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="read">Read Only</SelectItem>
                          <SelectItem value="write">Read & Write</SelectItem>
                          <SelectItem value="delete">Read, Write & Delete</SelectItem>
                          <SelectItem value="approve">Full Access (Approve)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Modal - Fullscreen */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between p-6 border-b bg-background flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Plus className="h-6 w-6 mr-2" />
                Add New User
              </h1>
              <p className="text-muted-foreground">Create a new user account with role-based permissions</p>
            </div>
            <button
              onClick={() => {
                setShowAddUserModal(false);
                setNewUser({ 
                  email: '', 
                  full_name: '', 
                  role: 'staff', 
                  organization_id: '', 
                  organization_type: '',
                  permissions: {
                    candidates: 'read',
                    agents: 'read', 
                    employers: 'read',
                    jobs: 'read',
                    financials: 'read',
                    documents: 'read',
                    settings: 'none'
                  }
                });
                setValidationErrors({});
                setOrganizationSearch('');
              }}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent hover:text-accent-foreground size-9 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={newUser.full_name}
                onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="John Doe"
                className={validationErrors.full_name ? 'border-red-500' : ''}
              />
              {validationErrors.full_name && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.full_name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => {
                  setNewUser(prev => ({ 
                    ...prev, 
                    role: value,
                    permissions: getDefaultPermissions(value)
                  }));
                  // Set organization type based on role
                  if (value === 'agency_staff' || value === 'agency_owner') {
                    setNewUser(prev => ({ ...prev, organization_type: 'agency' }));
                  } else if (value === 'employer_staff') {
                    setNewUser(prev => ({ ...prev, organization_type: 'employer' }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="agency_owner">Agency Owner</SelectItem>
                  <SelectItem value="agency_staff">Agency Staff</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="employer_staff">Employer Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Organization Selector */}
            {(newUser.role === 'agency_staff' || newUser.role === 'agency_owner' || newUser.role === 'employer_staff') && (
              <div>
                <Label htmlFor="organization">
                  {(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'Select Agency *' : 'Select Employer *'}
                </Label>
                <div className="space-y-2">
                  <Input
                    placeholder={`Search ${(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'agencies' : 'employers'}...`}
                    value={organizationSearch}
                    onChange={(e) => setOrganizationSearch(e.target.value)}
                    className="mb-2"
                  />
                  
                  <div className={`border rounded-lg max-h-48 overflow-y-auto ${validationErrors.organization ? 'border-red-500' : ''}`}>
                    {loadingOrganizations ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Loading organizations...
                      </div>
                    ) : getFilteredOrganizations().length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No {(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'agencies' : 'employers'} found
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setShowAddOrganization(true)}
                          className="ml-2"
                        >
                          + Add New
                        </Button>
                      </div>
                    ) : (
                      getFilteredOrganizations().map((org: any) => {
                        const isSelected = newUser.organization_id === org.id;
                        const orgName = (newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? org.agency_name : org.company_name;
                        const orgLocation = (newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? org.agency_country : org.country;
                        
                        return (
                          <div
                            key={org.id}
                            className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                            onClick={() => handleOrganizationSelect(org.id, (newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'agency' : 'employer')}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium flex items-center">
                                  {(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? (
                                    <Building2 className="h-4 w-4 mr-2 text-green-600" />
                                  ) : (
                                    <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                                  )}
                                  {orgName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {orgLocation} • {org.email}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="text-blue-600">
                                  ✓ Selected
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {validationErrors.organization && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.organization}</p>
                  )}
                  
                  {/* Selected Organization Preview */}
                  {getSelectedOrganization() && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium text-green-800">
                          Selected: {(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') 
                            ? getSelectedOrganization()?.agency_name 
                            : getSelectedOrganization()?.company_name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Role Permission Summary */}
            <div className="bg-amber-50 p-3 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Role Permissions</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {getRolePermissionSummary(newUser.role)}
                  </p>
                </div>
              </div>
            </div>

            {/* Granular Module Permissions */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <div className="flex items-center mb-4">
                <Settings className="h-4 w-4 mr-2 text-slate-600" />
                <h4 className="text-sm font-medium text-slate-800">Module Access Permissions</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(newUser.permissions).map(([module, level]) => (
                  <div key={module} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-slate-700 capitalize min-w-[100px]">
                        {module}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* View Access Toggle */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateUserPermission(module, level === 'read' || level === 'write' ? 'none' : 'read')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            level === 'read' || level === 'write' 
                              ? 'bg-blue-600' 
                              : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              level === 'read' || level === 'write' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-xs font-medium text-slate-600">View</span>
                      </div>

                      {/* Edit Access Toggle */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateUserPermission(module, level === 'write' ? 'read' : 'write')}
                          disabled={level === 'none'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                            level === 'write' 
                              ? 'bg-green-600' 
                              : level === 'none'
                              ? 'bg-gray-100 cursor-not-allowed'
                              : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              level === 'write' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-medium ${level === 'none' ? 'text-gray-400' : 'text-slate-600'}`}>
                          Edit
                        </span>
                      </div>

                      {/* Current Status */}
                      <div className="min-w-[70px]">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          level === 'write' ? 'bg-green-100 text-green-800' :
                          level === 'read' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {level === 'write' ? 'Full Access' :
                           level === 'read' ? 'View Only' :
                           'No Access'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>How it works:</strong> Toggle "View" to grant read-only access. Toggle "Edit" to grant full read/write permissions. 
                  Edit access automatically includes view access.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Email Verification Process:</strong>
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>User will receive an email verification link at the provided email address</li>
                <li>They must click the verification link before they can login</li>
                <li>Temporary password: "TempPassword123!" (they should change this after first login)</li>
                <li>If they don't receive the email, check spam folder or contact system administrator</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Rate Limiting:</strong> If you see a rate limit error, please wait 60 seconds before creating another user. 
                This is a Supabase security feature.
              </p>
            </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t bg-background p-6 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddUserModal(false);
                  setNewUser({ 
                    email: '', 
                    full_name: '', 
                    role: 'staff', 
                    organization_id: '', 
                    organization_type: '',
                    permissions: {
                      candidates: 'read',
                      agents: 'read', 
                      employers: 'read',
                      jobs: 'read',
                      financials: 'read',
                      documents: 'read',
                      settings: 'none'
                    }
                  });
                  setValidationErrors({});
                  setOrganizationSearch('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
                disabled={
                  creatingUser ||
                  !newUser.email || 
                  !newUser.full_name || 
                  ((newUser.role === 'agency_staff' || newUser.role === 'agency_owner' || newUser.role === 'employer_staff') && !newUser.organization_id)
                }
              >
                {creatingUser ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Organization Creation Modal */}
      {showAddOrganization && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New {(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'Agency' : 'Employer'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a new organization to assign to this user
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddOrganization(false);
                  setNewOrganization({
                    name: '',
                    email: '',
                    phone: '',
                    country: '',
                    address: '',
                    license_number: ''
                  });
                  setValidationErrors({});
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organization Name */}
                <div>
                  <Label htmlFor="org-name">
                    {(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'Agency Name' : 'Company Name'} *
                  </Label>
                  <Input
                    id="org-name"
                    value={newOrganization.name}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={`Enter ${(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'agency' : 'company'} name`}
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="org-email">Email Address *</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={newOrganization.email}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className={validationErrors.email ? 'border-red-500' : ''}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="org-phone">Phone Number</Label>
                  <Input
                    id="org-phone"
                    value={newOrganization.phone}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="org-country">Country *</Label>
                  <Input
                    id="org-country"
                    value={newOrganization.country}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter country"
                    className={validationErrors.country ? 'border-red-500' : ''}
                  />
                  {validationErrors.country && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.country}</p>
                  )}
                </div>

                {/* License Number (for employers only) */}
                {newUser.role === 'employer_staff' && (
                  <div>
                    <Label htmlFor="org-license">License Number</Label>
                    <Input
                      id="org-license"
                      value={newOrganization.license_number}
                      onChange={(e) => setNewOrganization(prev => ({ ...prev, license_number: e.target.value }))}
                      placeholder="Enter license number"
                    />
                  </div>
                )}

                {/* Address */}
                <div className={newUser.role === 'employer_staff' ? 'md:col-span-1' : 'md:col-span-2'}>
                  <Label htmlFor="org-address">Address</Label>
                  <Input
                    id="org-address"
                    value={newOrganization.address}
                    onChange={(e) => setNewOrganization(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-muted/20">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddOrganization(false);
                  setNewOrganization({
                    name: '',
                    email: '',
                    phone: '',
                    country: '',
                    address: '',
                    license_number: ''
                  });
                  setValidationErrors({});
                }}
                disabled={creatingOrganization}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrganization}
                disabled={creatingOrganization}
                className="min-w-[120px]"
              >
                {creatingOrganization ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create {(newUser.role === 'agency_staff' || newUser.role === 'agency_owner') ? 'Agency' : 'Employer'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Change Password
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your account password
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setValidationErrors({});
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {passwordChangeSuccess ? (
                /* Success Alert */
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="rounded-full bg-green-100 p-2">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-1">Password Changed Successfully!</h3>
                  <p className="text-sm text-green-700">
                    Your password has been updated. This window will close automatically in a few seconds.
                  </p>
                </div>
              ) : (
                <>
                  {/* Current Password */}
                  <div>
                    <Label htmlFor="current-password">Current Password *</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter your current password"
                      className={validationErrors.currentPassword ? 'border-red-500' : ''}
                    />
                    {validationErrors.currentPassword && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <Label htmlFor="new-password">New Password *</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter your new password"
                      className={validationErrors.newPassword ? 'border-red-500' : ''}
                    />
                    {validationErrors.newPassword && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.newPassword}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your new password"
                      className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-muted/20">
              {!passwordChangeSuccess && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setValidationErrors({});
                    }}
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                    className="min-w-[120px]"
                  >
                    {changingPassword ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModule;