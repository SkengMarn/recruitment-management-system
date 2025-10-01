#!/usr/bin/env node

/**
 * Emergency Access Script
 * 
 * This script helps you regain access to the system by:
 * 1. Confirming the existing admin user email
 * 2. Providing instructions for password reset
 * 3. Optionally creating a new admin user if needed
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function emergencyAccess() {
  console.log('\n🚨 Emergency Access Recovery Tool');
  console.log('==================================\n');
  
  // Initialize Supabase client with service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing Supabase configuration in .env.local file');
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    rl.close();
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    console.log('🔍 Checking existing admin users...\n');
    
    // Check for existing admin users
    const { data: adminUsers, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('role', 'admin');
    
    if (error) {
      console.log('❌ Error checking admin users:', error.message);
      rl.close();
      return;
    }
    
    if (adminUsers && adminUsers.length > 0) {
      console.log('✅ Found existing admin users:');
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.full_name || 'No name set'})`);
      });
      console.log('');
      
      const choice = await question('Do you want to reset password for one of these accounts? (y/n): ');
      
      if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
        const emailChoice = await question('Enter the email address you want to reset: ');
        
        const selectedUser = adminUsers.find(user => user.email.toLowerCase() === emailChoice.toLowerCase());
        
        if (selectedUser) {
          console.log(`\n🔄 Initiating password reset for ${selectedUser.email}...`);
          
          // Use the public client for password reset (service role can't do this)
          const publicClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          
          const { error: resetError } = await publicClient.auth.resetPasswordForEmail(selectedUser.email, {
            redirectTo: `${getBaseUrl()}/reset-password`
          });
          
          if (resetError) {
            console.log('❌ Error sending reset email:', resetError.message);
          } else {
            console.log('✅ Password reset email sent successfully!');
            console.log('\n📧 Check your email inbox for the reset link.');
            console.log('⚠️  Make sure to check your spam folder if you don\'t see it.');
            console.log('\n🔗 The reset link will take you to: /reset-password');
            console.log('   This route is now properly configured in the application.');
          }
        } else {
          console.log('❌ Email not found in admin users list.');
        }
      }
    } else {
      console.log('⚠️  No admin users found in the system.');
      
      const createNew = await question('Do you want to create a new admin user? (y/n): ');
      
      if (createNew.toLowerCase() === 'y' || createNew.toLowerCase() === 'yes') {
        await createNewAdminUser(supabase);
      }
    }
    
    console.log('\n📋 Alternative Access Methods:');
    console.log('1. If you have access to Supabase dashboard:');
    console.log('   - Go to Authentication > Users');
    console.log('   - Find your user and click "Send recovery email"');
    console.log('');
    console.log('2. If you need to create a new admin user:');
    console.log('   - Run: node scripts/setup-admin-users.js');
    console.log('   - Then run: npx supabase db reset');
    console.log('');
    console.log('3. Current admin credentials (if email is verified):');
    console.log('   - Email: jayssemujju@gmail.com');
    console.log('   - Password: J!aL9$v7Qx2R#Tm8');
    console.log('   - ⚠️  Change this password immediately after login!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  rl.close();
}

async function createNewAdminUser(supabase) {
  try {
    const email = await question('Enter new admin email address: ');
    const fullName = await question('Enter full name: ');
    const tempPassword = 'TempAdmin2024!';
    
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address.');
      return;
    }
    
    console.log('\n🔄 Creating new admin user...');
    
    // Create user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: false, // Require email verification
      user_metadata: {
        full_name: fullName
      }
    });
    
    if (authError) {
      console.log('❌ Error creating auth user:', authError.message);
      return;
    }
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authUser.user.id,
        email: email,
        full_name: fullName,
        role: 'admin'
      }]);
    
    if (profileError) {
      console.log('❌ Error creating profile:', profileError.message);
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Temporary Password: ${tempPassword}`);
    console.log('\n⚠️  Important: Check your email for verification link before trying to log in!');
    
  } catch (error) {
    console.log('❌ Error creating admin user:', error.message);
  }
}

function getBaseUrl() {
  // Try to determine the base URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return 'http://localhost:3000'; // Default for development
}

// Run the emergency access tool
emergencyAccess().catch(console.error);
