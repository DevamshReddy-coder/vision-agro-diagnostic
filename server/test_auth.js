const axios = require('axios');

async function testAuth() {
  const email = `test_${Date.now()}@test.com`;
  const password = 'password123';
  
  try {
    console.log('--- TESTING REGISTRATION ---');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email,
      password,
      role: 'Farmer'
    });
    console.log('Registration Success:', regRes.status === 201);
    
    console.log('--- TESTING LOGIN ---');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    console.log('Login Success:', loginRes.status === 200);
    console.log('Token received:', !!loginRes.data.token);
    
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testAuth();
