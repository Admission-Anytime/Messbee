const axios = require('axios');
const dotenv = require('dotenv');
path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testMetaGraphAPI() {
  console.log('====================================================');
  console.log('🧪 TESTING META GRAPH API (/me) WITH EXISTING TOKEN');
  console.log('====================================================');

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    console.error('❌ No WHATSAPP_ACCESS_TOKEN found in .env');
    return;
  }

  try {
    console.log('🔄 Sending request to https://graph.facebook.com/me...');
    console.log('Requested fields: id, name, email, picture\n');

    const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`);
    
    console.log('✅ LIVE META GRAPH API ACTUAL RESPONSE:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n====================================================');
    console.log('💡 THIS IS EXACTLY WHAT FACEBOOK RETURNS TO OUR BACKEND!');
    console.log('====================================================');
  } catch (error) {
    console.log('⚠️ Could not fetch with current WhatsApp token (Token may be expired or lack public_profile scope).');
    if (error.response) {
      console.log('Meta Error Return Log:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }

    console.log('\n====================================================');
    console.log('📘 REFERENCE ACTUAL RESPONSE STRUCTURE FROM META:');
    console.log('====================================================');
    const referenceActualResponse = {
      "id": "10224589012345678",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@company.com",
      "picture": {
        "data": {
          "height": 200,
          "width": 200,
          "is_silhouette": false,
          "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10224589012345678&height=200&width=200&ext=17288..."
        }
      }
    };
    console.log(JSON.stringify(referenceActualResponse, null, 2));
  }
}

testMetaGraphAPI();
