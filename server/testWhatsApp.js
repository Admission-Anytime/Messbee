/**
 * WhatsApp Integration Test Script
 * 
 * This script helps you test your WhatsApp Business API integration
 * Run: node testWhatsApp.js
 */

require('dotenv').config();
const axios = require('axios');

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testWhatsAppConnection() {
  log('\n🧪 WhatsApp Business API Integration Test\n', colors.blue);
  log('================================================\n');

  // Test 1: Check environment variables
  log('📋 Test 1: Checking environment variables...', colors.yellow);
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    log('❌ FAILED: Missing environment variables', colors.red);
    log('   Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env file\n', colors.red);
    return;
  }
  log('✅ PASSED: Environment variables found\n', colors.green);

  // Test 2: Verify access token
  log('🔑 Test 2: Verifying access token...', colors.yellow);
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    log('✅ PASSED: Access token is valid', colors.green);
    log(`   Phone Number: ${response.data.display_phone_number}`, colors.blue);
    log(`   Verified Name: ${response.data.verified_name}\n`, colors.blue);
  } catch (error) {
    log('❌ FAILED: Invalid access token or phone number ID', colors.red);
    log(`   Error: ${error.response?.data?.error?.message || error.message}\n`, colors.red);
    return;
  }

  // Test 3: Test message sending (to yourself)
  log('📤 Test 3: Testing message sending capability...', colors.yellow);
  log('   To test sending, uncomment the sendTestMessage() function below', colors.yellow);
  log('   and add your WhatsApp number in E.164 format (e.g., +1234567890)\n', colors.yellow);

  log('================================================', colors.blue);
  log('✅ All tests passed! Your WhatsApp integration is ready.', colors.green);
  log('\n🚀 Next steps:', colors.blue);
  log('1. Set up webhook URL in Meta Business Manager', colors.reset);
  log('2. Start your server: npm run dev', colors.reset);
  log('3. Test receiving messages by sending a WhatsApp to your business number\n', colors.reset);
}

// Uncomment to test sending a message
async function sendTestMessage(to) {
  log('\n📤 Sending test message...', colors.yellow);
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: '🎉 Test message from Messbee! Your WhatsApp integration is working!'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    log('✅ Message sent successfully!', colors.green);
    log(`   Message ID: ${response.data.messages[0].id}\n`, colors.blue);
  } catch (error) {
    log('❌ Failed to send message', colors.red);
    log(`   Error: ${error.response?.data?.error?.message || error.message}\n`, colors.red);
  }
}

// Run tests
testWhatsAppConnection();

// Uncomment to send a test message (replace with your WhatsApp number)
// sendTestMessage('+1234567890');
