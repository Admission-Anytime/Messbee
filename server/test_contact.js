const http = require('http');

const data = JSON.stringify({
  name: "Test Contact",
  whatsapp: "+919876543210",
  status: "ACTIVE"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/contacts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer test'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
