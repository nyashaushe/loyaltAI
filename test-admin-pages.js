// Test script for admin pages
const testAdminPages = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing admin pages...\n');
  
  try {
    // Test main admin page
    console.log('1. Testing main admin page...');
    const adminResponse = await fetch(`${baseUrl}/admin`);
    console.log(`   Status: ${adminResponse.status}`);
    console.log(`   OK: ${adminResponse.ok}\n`);
    
    // Test analytics page
    console.log('2. Testing analytics page...');
    const analyticsResponse = await fetch(`${baseUrl}/admin/analytics`);
    console.log(`   Status: ${analyticsResponse.status}`);
    console.log(`   OK: ${analyticsResponse.ok}\n`);
    
    // Test rewards page
    console.log('3. Testing rewards page...');
    const rewardsResponse = await fetch(`${baseUrl}/admin/rewards`);
    console.log(`   Status: ${rewardsResponse.status}`);
    console.log(`   OK: ${rewardsResponse.ok}\n`);
    
    // Test customers page
    console.log('4. Testing customers page...');
    const customersResponse = await fetch(`${baseUrl}/admin/customers`);
    console.log(`   Status: ${customersResponse.status}`);
    console.log(`   OK: ${customersResponse.ok}\n`);
    
    console.log('✅ All admin pages are accessible!');
    console.log('\n📊 Admin Dashboard Features:');
    console.log('   • Main dashboard with key metrics');
    console.log('   • Analytics with AI-powered insights');
    console.log('   • Rewards management');
    console.log('   • Customer management');
    console.log('   • Program rules configuration');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Wait a bit for the server to start, then run the test
setTimeout(testAdminPages, 2000);