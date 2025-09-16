#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user through Supabase Auth API
 * and sets up the corresponding profile record.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key needed for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check .env.local file.');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    const email = 'jayssemujju@gmail.com';
    const password = 'J!aL9$v7Qx2R#Tm8';
    
    // Create user through Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: 'Jay Ssemujju'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ User already exists, updating profile...');
        
        // Get existing user
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = existingUsers.users.find(u => u.email === email);
        if (!existingUser) throw new Error('User not found after creation check');
        
        authData.user = existingUser;
      } else {
        throw authError;
      }
    }

    console.log('✅ Auth user created/found:', authData.user.id);

    // Create or update profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: 'Jay Ssemujju',
        role: 'admin',
        phone: null,
        photo_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    console.log('✅ Profile created/updated:', profileData);

    // Create default permissions for admin
    const modules = ['candidates', 'agents', 'employers', 'jobs', 'financials', 'documents', 'settings'];
    
    for (const module of modules) {
      const { error: permError } = await supabase
        .from('permissions')
        .upsert({
          user_id: authData.user.id,
          module: module,
          access_level: 'edit'
        }, {
          onConflict: 'user_id,module'
        });
      
      if (permError) {
        console.warn(`Warning: Could not create permission for ${module}:`, permError.message);
      }
    }

    console.log('✅ Admin permissions created');
    console.log('\n🎉 Admin user setup complete!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('\n🚀 You can now login to the application');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
