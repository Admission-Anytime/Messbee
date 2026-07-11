const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

async function testFlow() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  try {
    // 1. Delete user if exists
    const email = 'test_new_approval@example.com';
    await db.collection('users').deleteOne({ email });

    // 2. Request OTP
    console.log('Requesting OTP...');
    const reqRes = await axios.post('http://localhost:5000/api/auth/signup/request-otp', {
      name: 'Test User',
      email: email,
      password: 'password123',
      phone: '1234567890'
    });
    console.log('Request OTP Response:', reqRes.data);

    // 3. Get OTP from DB
    const user = await db.collection('users').findOne({ email });
    console.log('User created in DB with isApproved:', user.isApproved);
    
    // 4. Verify OTP
    console.log('Verifying OTP...', user.otp);
    try {
      const verRes = await axios.post('http://localhost:5000/api/auth/signup/verify-otp', {
        email: email,
        otp: user.otp
      });
      console.log('Verify OTP Response:', verRes.data);
    } catch(err) {
      console.log('Verify OTP Error:', err.response?.data || err.message);
    }

    // 5. Try to login
    console.log('Trying to login...');
    try {
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: email,
        password: 'password123'
      });
      console.log('Login Response:', loginRes.data);
    } catch (err) {
      console.log('Login Error (EXPECTED 403):', err.response?.data || err.message);
    }

  } catch (err) {
    console.error('Error in test:', err.response?.data || err.message);
  } finally {
    process.exit(0);
  }
}

testFlow();
