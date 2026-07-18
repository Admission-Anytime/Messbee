const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  try {
    // Create a dummy PDF
    fs.writeFileSync('test.pdf', 'dummy content');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('test.pdf'));
    
    // Attempt to hit the endpoint (assuming auth might block us, but let's see)
    // Actually, we can test just by making a request
    // Since we don't have a token, we might get 401. But let's see.
    const res = await axios.post('http://localhost:5000/api/chats/upload-file', form, {
      headers: form.getHeaders(),
    });
    console.log(res.data);
  } catch (error) {
    if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.data);
    } else {
      console.error('Crash or Network Error:', error.message);
    }
  }
}

testUpload();
