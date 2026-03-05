/**
 * Test Supabase Connection
 * Run: node test_connection.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://epwpejmbihthqwosdick.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseKey ? 'Present' : 'Missing');
console.log('Service Key:', serviceKey ? 'Present (' + serviceKey.substring(0, 20) + '...)' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testConnection() {
  try {
    // Test 1: Products table
    console.log('\n1. Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (productsError) {
      console.log('Products error:', productsError.message);
    } else {
      console.log('Products: OK -', products?.length || 0, 'products');
    }
    
    // Test 2: Profiles table
    console.log('\n2. Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, full_name');
    
    if (profilesError) {
      console.log('Profiles error:', profilesError.message);
    } else {
      console.log('Profiles: OK -', profiles?.length || 0, 'profiles');
      console.log('All profiles:', profiles);
    }
    
    // Test 3: Auth users with service role
    console.log('\n3. Testing auth.users...');
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.log('Auth error:', usersError.message);
    } else {
      console.log('Auth: OK -', users?.length || 0, 'users');
      if (users && users.length > 0) {
        console.log('\nUsers:');
        users.forEach(u => {
          console.log('  -', u.email, '(ID:', u.id + ')');
        });
      }
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testConnection();
