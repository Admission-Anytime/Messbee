const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config();
const http = require('http');

async function getOtpAndVerify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const email = 'test_approval_final@example.com';
  const user = await db.collection('users').findOne({ email });
  console.log('User found in DB. OTP is:', user.otp);
  console.log('isApproved in DB is:', user.isApproved);

  // Verify OTP
  const data = JSON.stringify({ email: email, otp: user.otp });
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/signup/verify-otp',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('Verify OTP Response:', body);
      
      // Now Try Login
      const loginData = JSON.stringify({ email: email, password: 'password123' });
      const loginReq = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
      }, loginRes => {
        let loginBody = '';
        loginRes.on('data', d => loginBody += d);
        loginRes.on('end', () => {
          console.log('Login Response:', loginBody);
          process.exit(0);
        });
      });
      loginReq.write(loginData);
      loginReq.end();
    });
  });

  req.write(data);
  req.end();
}

getOtpAndVerify();
