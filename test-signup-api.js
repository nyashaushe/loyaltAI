// Test script for signup API
const testSignupAPI = async () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testData = {
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123',
    name: 'Test User'
  };

  try {
    console.log('Testing signup API with data:', { ...testData, password: '[REDACTED]' });
    
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (data.ok) {
      console.log('✅ Signup successful! User data saved to database.');
      console.log('User details:', data.user);
    } else {
      console.log('❌ Signup failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Wait a bit for the server to start, then run the test
setTimeout(testSignupAPI, 2000);