import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Channel from './src/models/Channel.js';
import Automation from './src/models/Automation.js';

dotenv.config();

const API_URL = 'http://127.0.0.1:5001/api';

async function runTest() {
  console.log('--- STARTING INBOUND WEBHOOK TEST ---');
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // 1. Get a channel to test with
  const channel = await Channel.findOne();
  if (!channel) {
    console.error('No channels found in DB to test with.');
    process.exit(1);
  }

  console.log(`Using Channel ID: ${channel._id}`);
  console.log(`Phone Number ID: ${channel.activeWhatsappPhoneNumberId}`);

  // 2. Ensure an automation exists for this channel with the keyword "HELLO"
  let auto = await Automation.findOne({ channelId: channel._id, 'triggers.type': 'KEYWORD_MATCH', 'triggers.value': 'hello' });
  
  if (!auto) {
    console.log('Creating a test Keyword Automation...');
    auto = await Automation.create({
      tenantId: channel.tenantId,
      channelId: channel._id,
      name: 'Test Keyword Flow',
      isActive: true,
      triggers: [{ type: 'KEYWORD_MATCH', value: 'hello' }],
      nodes: [
        { id: 't1', type: 'triggerNode', position: {x:0,y:0}, data: { triggerType: 'exact_match', keyword: 'hello' } },
        { id: 'm1', type: 'messageNode', position: {x:0,y:100}, data: { messageType: 'text', text: 'Success! Keyword matched.' } }
      ],
      edges: [{ id: 'e1', source: 't1', target: 'm1' }]
    });
    console.log(`Automation created: ${auto._id}`);
  } else {
    console.log(`Found existing automation: ${auto._id}`);
  }

  // 3. Construct Meta Webhook Payload
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: channel.metadata?.wabaId || '987654321',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: channel.activeWhatsappPhoneNumberId
              },
              contacts: [
                {
                  profile: { name: 'Test Customer' },
                  wa_id: '15551234567' // Customer phone number
                }
              ],
              messages: [
                {
                  from: '15551234567',
                  id: `wamid.${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: 'hello' }, // This matches the keyword trigger!
                  type: 'text'
                }
              ]
            }
          }
        ]
      }
    ]
  };

  const payloadString = JSON.stringify(payload);

  // 4. Compute Meta Signature
  const secret = process.env.META_APP_SECRET;
  if (!secret) {
    console.error('META_APP_SECRET is not defined in .env');
    process.exit(1);
  }

  const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(payloadString).digest('hex');

  console.log('\nSending Webhook payload to backend...');
  
  try {
    const res = await fetch(`${API_URL}/webhooks/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': signature
      },
      body: payloadString
    });

    const responseText = await res.text();
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Body: ${responseText}`);
    
    if (res.status === 200 && responseText === 'EVENT_RECEIVED') {
      console.log('✅ Webhook successfully verified and accepted by backend!');
      console.log('Check your backend terminal logs to see the incoming message processed and the flow triggered.');
    } else {
      console.error('❌ Webhook rejected!');
    }
  } catch (error) {
    console.error('❌ Fetch failed:', error);
  }

  process.exit(0);
}

runTest();
