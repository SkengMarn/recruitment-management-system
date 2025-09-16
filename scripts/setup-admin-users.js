#!/usr/bin/env node

/**
 * Admin User Setup Script
 * 
 * This script helps you configure admin user accounts before running the migration.
 * It will prompt for your email addresses and update the migration file accordingly.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const migrationPath = path.join(__dirname, '../supabase/migrations/20250915000004_seed_admin_users.sql');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdminUsers() {
  console.log('\n🔐 Admin User Setup for Recruitment Management System');
  console.log('====================================================\n');
  
  console.log('This script will configure admin accounts that will be created in the authentication system.');
  console.log('Supabase will automatically send verification emails to the addresses you provide.\n');
  
  // Get primary admin email
  const primaryEmail = await question('Enter PRIMARY admin email address: ');
  
  if (!primaryEmail || !primaryEmail.includes('@')) {
    console.log('❌ Invalid email address. Please run the script again.');
    rl.close();
    return;
  }
  
  // Get secondary admin email (optional)
  const needSecondary = await question('Do you want to add a SECONDARY admin user? (y/n): ');
  let secondaryEmail = '';
  
  if (needSecondary.toLowerCase() === 'y' || needSecondary.toLowerCase() === 'yes') {
    secondaryEmail = await question('Enter SECONDARY admin email address: ');
    
    if (!secondaryEmail || !secondaryEmail.includes('@')) {
      console.log('❌ Invalid secondary email address. Please run the script again.');
      rl.close();
      return;
    }
  }
  
  try {
    // Read the migration file
    let migrationContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Replace primary email
    migrationContent = migrationContent.replace(
      'your-email@domain.com',
      primaryEmail
    );
    
    if (secondaryEmail) {
      // Replace secondary email
      migrationContent = migrationContent.replace(
        'second-admin@domain.com',
        secondaryEmail
      );
      
      // Update the WHERE clause to include both emails
      migrationContent = migrationContent.replace(
        "WHERE u.email IN ('your-email@domain.com', 'second-admin@domain.com');",
        `WHERE u.email IN ('${primaryEmail}', '${secondaryEmail}');`
      );
    } else {
      // Remove the secondary user entry entirely
      const lines = migrationContent.split('\n');
      const startIdx = lines.findIndex(line => line.includes('-- Admin User 2'));
      const endIdx = lines.findIndex((line, idx) => idx > startIdx && line.includes(');'));
      
      if (startIdx !== -1 && endIdx !== -1) {
        // Remove the secondary user block and fix the SQL syntax
        lines.splice(startIdx, endIdx - startIdx + 1);
        
        // Fix the previous line to end with semicolon instead of comma
        const prevLineIdx = startIdx - 1;
        if (lines[prevLineIdx] && lines[prevLineIdx].endsWith(',')) {
          lines[prevLineIdx] = lines[prevLineIdx].slice(0, -1) + ';';
        }
      }
      
      migrationContent = lines.join('\n');
      
      // Update the WHERE clause for single email
      migrationContent = migrationContent.replace(
        "WHERE u.email IN ('your-email@domain.com', 'second-admin@domain.com');",
        `WHERE u.email = '${primaryEmail}';`
      );
    }
    
    // Write the updated migration file
    fs.writeFileSync(migrationPath, migrationContent);
    
    console.log('\n✅ Migration file updated successfully!');
    console.log('\n📧 Admin accounts configured:');
    console.log(`   Primary:   ${primaryEmail}`);
    if (secondaryEmail) {
      console.log(`   Secondary: ${secondaryEmail}`);
    }
    
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npx supabase db reset');
    console.log('2. Check your email for verification messages from Supabase');
    console.log('3. Click the verification links to activate your admin accounts');
    console.log('4. You can then log in with your email and the temporary password: TempAdmin2024!');
    console.log('5. Change your password immediately after first login\n');
    
    console.log('⚠️  Important: The temporary password is "TempAdmin2024!" - change it after verification!');
    
  } catch (error) {
    console.error('❌ Error updating migration file:', error.message);
  }
  
  rl.close();
}

// Run the setup
setupAdminUsers().catch(console.error);
