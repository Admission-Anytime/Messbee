const http = require('http');

const data = JSON.stringify({
  email: 'test_approval_final@example.com',
  name: 'Test User',
  password: 'password123',
  phone: '1234567890'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signup/request-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
