/**
 * WhatsApp Webhook Setup Helper
 * 
 * This script helps you set up your webhook configuration
 * Run: node setupWebhook.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, colors.bright + colors.blue);
  console.log('='.repeat(60) + '\n');
}

// Generate secure verify token
function generateVerifyToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Read current .env file
function getCurrentEnvValue(key) {
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      return null;
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

// Update .env file
function updateEnvFile(key, value) {
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      log('❌ .env file not found. Creating from .env.example...', colors.red);
      fs.copyFileSync(path.join(__dirname, '.env.example'), envPath);
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    return true;
  } catch (error) {
    log(`❌ Error updating .env: ${error.message}`, colors.red);
    return false;
  }
}

async function main() {
  header('🔧 WhatsApp Webhook Configuration Helper');

  // Step 1: Check/Generate Verify Token
  log('📋 Step 1: Verify Token Configuration', colors.yellow);
  log('─'.repeat(60), colors.cyan);
  
  let currentToken = getCurrentEnvValue('WHATSAPP_VERIFY_TOKEN');
  
  if (!currentToken || currentToken === 'your_secure_verify_token_here') {
    const newToken = generateVerifyToken();
    log('\n✨ Generating secure verify token...', colors.cyan);
    log(`Token: ${newToken}`, colors.green);
    
    if (updateEnvFile('WHATSAPP_VERIFY_TOKEN', newToken)) {
      log('✅ Verify token saved to .env file', colors.green);
      currentToken = newToken;
    } else {
      log('⚠️  Could not update .env automatically', colors.yellow);
      log(`Please manually add this to your .env file:`, colors.yellow);
      log(`WHATSAPP_VERIFY_TOKEN=${newToken}`, colors.bright);
    }
  } else {
    log('✅ Verify token already configured:', colors.green);
    log(`   ${currentToken}`, colors.cyan);
  }

  // Step 2: Get webhook URL
  header('🌐 Step 2: Get Your Webhook URL');
  
  log('You need a publicly accessible HTTPS URL for your webhook.', colors.reset);
  log('Choose an option:\n', colors.reset);
  
  log('Option A: Testing Locally (Recommended for Development)', colors.bright + colors.cyan);
  log('─'.repeat(60), colors.cyan);
  log('1. Install ngrok: https://ngrok.com/download', colors.reset);
  log('2. Run: ngrok http 5000', colors.yellow);
  log('3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)', colors.reset);
  log('4. Your webhook URL will be: https://abc123.ngrok.io/api/whatsapp/webhook\n', colors.green);
  
  log('Option B: Production Deployment', colors.bright + colors.cyan);
  log('─'.repeat(60), colors.cyan);
  log('1. Deploy your server with HTTPS enabled', colors.reset);
  log('2. Your webhook URL will be: https://yourdomain.com/api/whatsapp/webhook\n', colors.green);

  // Step 3: Meta Business Manager Configuration
  header('⚙️  Step 3: Configure Webhook in Meta Business Manager');
  
  log('1. Go to: https://business.facebook.com/', colors.cyan);
  log('2. Navigate to: WhatsApp > Configuration > Webhook', colors.cyan);
  log('3. Click "Edit" button\n', colors.cyan);
  
  log('4. Enter these values:', colors.bright);
  log('   ┌─────────────────────────────────────────────────────────┐', colors.cyan);
  log('   │ Callback URL:                                           │', colors.cyan);
  log(`   │ https://YOUR-URL/api/whatsapp/webhook                   │`, colors.green);
  log('   │                                                         │', colors.cyan);
  log('   │ Verify Token:                                           │', colors.cyan);
  log(`   │ ${currentToken || 'YOUR_VERIFY_TOKEN'}`, colors.green);
  log('   └─────────────────────────────────────────────────────────┘\n', colors.cyan);
  
  log('5. Click "Verify and Save"', colors.cyan);
  log('6. Subscribe to these webhook fields:', colors.cyan);
  log('   ☑️  messages', colors.green);
  log('   ☑️  message_status\n', colors.green);
  
  log('7. Click "Done"', colors.cyan);

  // Step 4: Start Server
  header('🚀 Step 4: Start Your Server');
  
  log('Run: npm run dev', colors.yellow);
  log('\nServer will start on: http://localhost:5000', colors.green);
  log('Webhook endpoint: http://localhost:5000/api/whatsapp/webhook\n', colors.green);

  // Step 5: Test
  header('🧪 Step 5: Test Your Configuration');
  
  log('1. Send a WhatsApp message to your business number', colors.cyan);
  log('2. Check your server logs - you should see:', colors.cyan);
  log('   📱 Received WhatsApp Webhook', colors.green);
  log('3. The message should appear in your Messbee dashboard', colors.cyan);
  log('4. Reply from dashboard - you should receive it on WhatsApp\n', colors.cyan);

  // Quick Reference
  header('📝 Quick Reference');
  
  log('Your Configuration:', colors.bright);
  log(`Verify Token: ${currentToken || 'Not set'}`, colors.cyan);
  log('Webhook Endpoint: /api/whatsapp/webhook', colors.cyan);
  log('Port: 5000 (default)', colors.cyan);
  
  log('\nEnvironment Variables to Set:', colors.bright);
  const requiredVars = [
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_BUSINESS_ACCOUNT_ID'
  ];
  
  requiredVars.forEach(varName => {
    const value = getCurrentEnvValue(varName);
    if (!value || value.includes('your_') || value.includes('_here')) {
      log(`❌ ${varName}: Not configured`, colors.red);
    } else {
      log(`✅ ${varName}: Configured`, colors.green);
    }
  });

  // Troubleshooting
  header('🔍 Troubleshooting');
  
  log('If webhook verification fails:', colors.yellow);
  log('• Ensure your server is running', colors.reset);
  log('• Check that the URL is publicly accessible (HTTPS)', colors.reset);
  log('• Verify the token matches exactly (no extra spaces)', colors.reset);
  log('• Check server logs for errors', colors.reset);
  
  log('\nIf messages are not received:', colors.yellow);
  log('• Verify webhook fields are subscribed (messages, message_status)', colors.reset);
  log('• Check webhook is marked as "Active" in Meta dashboard', colors.reset);
  log('• Review server logs for webhook POST requests', colors.reset);
  log('• Ensure no firewall blocking incoming requests\n', colors.reset);

  // Next Steps
  header('✨ Next Steps');
  
  log('1. ✅ Configure remaining WhatsApp credentials in .env', colors.cyan);
  log('2. 🌐 Set up ngrok or deploy to production', colors.cyan);
  log('3. ⚙️  Configure webhook in Meta Business Manager', colors.cyan);
  log('4. 🚀 Start server: npm run dev', colors.cyan);
  log('5. 🧪 Test sending/receiving messages', colors.cyan);
  log('6. 📚 Read WHATSAPP_INTEGRATION_GUIDE.md for more details\n', colors.cyan);

  log('═'.repeat(60), colors.green);
  log('✅ Setup helper completed!', colors.bright + colors.green);
  log('═'.repeat(60) + '\n', colors.green);
}

main().catch(console.error);
