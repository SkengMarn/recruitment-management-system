#!/usr/bin/env node

/**
 * Simple Admin Signup Script
 * 
 * This script creates an admin user through the normal signup flow
 * and then updates their profile to admin role.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables. Please check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signupAdmin() {
  try {
    console.log('🔐 Signing up admin user...');
    
    const email = 'jayssemujju@gmail.com';
    const password = 'J!aL9$v7Qx2R#Tm8';
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: 'Jay Ssemujju'
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ User already exists, trying to sign in...');
        
        // Try to sign in instead
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (signInError) {
          console.log('❌ Sign in failed, user may need password reset');
          console.log('🔄 Sending password reset email...');
          
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3004/reset-password'
          });
          
          if (resetError) {
            console.error('Reset error:', resetError.message);
          } else {
            console.log('✅ Password reset email sent! Check your inbox.');
          }
          return;
        }
        
        console.log('✅ Signed in successfully:', signInData.user.email);
        data.user = signInData.user;
        
        // Check if user needs email confirmation
        if (!signInData.user.email_confirmed_at) {
          console.log('📧 User needs email confirmation. Attempting to confirm...');
          
          // For development, we can manually confirm the user
          const { error: confirmError } = await supabase.auth.admin.updateUserById(
            signInData.user.id,
            { email_confirm: true }
          );
          
          if (confirmError) {
            console.warn('Could not auto-confirm user:', confirmError.message);
          } else {
            console.log('✅ User email confirmed automatically');
          }
        }
      } else {
        throw error;
      }
    }

    if (data.user) {
      console.log('✅ User created/signed in:', data.user.email);
      
      // Update profile to admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: 'Jay Ssemujju',
          role: 'admin',
          phone: null,
          photo_url: null
        });

      if (profileError) {
        console.warn('Profile update warning:', profileError.message);
      } else {
        console.log('✅ Profile updated to admin role');
      }
    }

    console.log('\n🎉 Setup complete!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    
    if (data.user && !data.user.email_confirmed_at) {
      console.log('\n📬 Please check your email to confirm your account');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
signupAdmin();
