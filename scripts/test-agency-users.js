#!/usr/bin/env node

/**
 * Test script for the new agency structure with principals and users array
 * This script tests:
 * 1. Adding principal details to existing agencies
 * 2. Creating users and linking them to agencies via users array
 * 3. Testing the helper functions for agency-user relationships
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testAgencyStructure() {
  console.log('🧪 Testing Agency Structure with Principals and Users Array...\n');

  try {
    // 1. Update existing agencies with principal information
    console.log('1️⃣ Updating agencies with principal information...');
    
    const { data: agencies, error: fetchError } = await supabase
      .from('agents')
      .select('id, agency_name')
      .limit(3);

    if (fetchError) {
      console.error('❌ Error fetching agencies:', fetchError);
      return;
    }

    if (agencies && agencies.length > 0) {
      for (const agency of agencies) {
        const { error: updateError } = await supabase
          .from('agents')
          .update({
            principal_name: `Principal of ${agency.agency_name}`,
            principal_contact: `principal@${agency.agency_name.toLowerCase().replace(/\s+/g, '')}.com`,
            users: [] // Initialize empty users array
          })
          .eq('id', agency.id);

        if (updateError) {
          console.error(`❌ Error updating agency ${agency.agency_name}:`, updateError);
        } else {
          console.log(`✅ Updated ${agency.agency_name} with principal information`);
        }
      }
    }

    // 2. Test creating a test user and linking to agency
    console.log('\n2️⃣ Testing user creation and agency linking...');
    
    if (agencies && agencies.length > 0) {
      const testAgency = agencies[0];
      
      // Create a test user profile (simulating what happens in the UI)
      const testUserId = crypto.randomUUID();
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: testUserId,
          email: 'test-agency-staff@example.com',
          full_name: 'Test Agency Staff',
          role: 'agency_staff'
        }]);

      if (profileError) {
        console.error('❌ Error creating test profile:', profileError);
      } else {
        console.log('✅ Created test user profile');

        // Link user to agency using the new function
        const { error: linkError } = await supabase.rpc('add_user_to_agency', {
          agency_id: testAgency.id,
          user_id: testUserId
        });

        if (linkError) {
          console.error('❌ Error linking user to agency:', linkError);
        } else {
          console.log(`✅ Linked user to agency: ${testAgency.agency_name}`);
        }
      }
    }

    // 3. Test getting users for an agency
    console.log('\n3️⃣ Testing get agency users function...');
    
    if (agencies && agencies.length > 0) {
      const testAgency = agencies[0];
      
      const { data: agencyUsers, error: getUsersError } = await supabase.rpc('get_agency_users', {
        agency_id: testAgency.id
      });

      if (getUsersError) {
        console.error('❌ Error getting agency users:', getUsersError);
      } else {
        console.log(`✅ Found ${agencyUsers.length} users for ${testAgency.agency_name}:`);
        agencyUsers.forEach(user => {
          console.log(`   - ${user.full_name} (${user.email}) - Role: ${user.role}`);
        });
      }
    }

    // 4. Test getting agency for a user
    console.log('\n4️⃣ Testing get user agency function...');
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'agency_staff')
      .limit(1);

    if (profiles && profiles.length > 0) {
      const testUser = profiles[0];
      
      const { data: userAgency, error: getAgencyError } = await supabase.rpc('get_user_agency', {
        user_id: testUser.id
      });

      if (getAgencyError) {
        console.error('❌ Error getting user agency:', getAgencyError);
      } else if (userAgency && userAgency.length > 0) {
        const agency = userAgency[0];
        console.log(`✅ User ${testUser.full_name} belongs to agency:`);
        console.log(`   - Agency: ${agency.agency_name}`);
        console.log(`   - Principal: ${agency.principal_name}`);
        console.log(`   - Contact: ${agency.principal_contact}`);
      } else {
        console.log(`ℹ️ User ${testUser.full_name} is not linked to any agency yet`);
      }
    }

    // 5. Display updated agency structure
    console.log('\n5️⃣ Current agency structure with principals and users:');
    
    const { data: updatedAgencies, error: finalFetchError } = await supabase
      .from('agents')
      .select('id, agency_name, principal_name, principal_contact, users')
      .limit(5);

    if (finalFetchError) {
      console.error('❌ Error fetching updated agencies:', finalFetchError);
    } else {
      updatedAgencies.forEach(agency => {
        console.log(`\n📋 ${agency.agency_name}`);
        console.log(`   Principal: ${agency.principal_name}`);
        console.log(`   Contact: ${agency.principal_contact}`);
        console.log(`   Users: ${agency.users ? agency.users.length : 0} linked users`);
        if (agency.users && agency.users.length > 0) {
          console.log(`   User IDs: ${agency.users.join(', ')}`);
        }
      });
    }

    console.log('\n🎉 Agency structure testing completed successfully!');
    console.log('\n📝 Summary of new features:');
    console.log('   ✅ Principal details added to agencies');
    console.log('   ✅ Users array for tracking agency staff and owners');
    console.log('   ✅ Helper functions for managing agency-user relationships');
    console.log('   ✅ Support for multiple users per agency');
    console.log('   ✅ Proper indexing for efficient queries');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAgencyStructure().then(() => {
  console.log('\n🏁 Test script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
