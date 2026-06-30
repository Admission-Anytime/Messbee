import axios from 'axios';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Channel from './src/models/Channel.js';
import Automation from './src/models/Automation.js';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5001/api';
const META_SECRET = process.env.META_APP_SECRET || 'test_secret_123';
const API_KEY = process.env.API_SECRET_KEY || 'test_api_key_456';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');

  // 1. Setup Mock Data in DB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-saas');
  
  const tenantId = new mongoose.Types.ObjectId();
  const channel = await Channel.findOneAndUpdate(
    { activeWhatsappPhoneNumberId: '1234567890' },
    { 
      tenantId: tenantId,
      activeWhatsappPhoneNumberId: '1234567890',
      metaAccessToken: 'DUMMY_TOKEN', // will bypass actual WhatsApp API
      metadata: { name: 'Test Channel', status: 'CONNECTED' }
    },
    { upsert: true, new: true }
  );

  // Create dummy automation flow
  const flow = await Automation.findOneAndUpdate(
    { name: 'Test Trigger Flow' },
    {
      name: 'Test Trigger Flow',
      tenantId: tenantId,
      channelId: channel._id,
      isActive: true,
      nodes: [
        {
          id: 'node_trigger',
          type: 'triggerNode',
          position: { x: 0, y: 0 },
          data: { triggerType: 'image_received' }
        },
        {
          id: 'node_msg',
          type: 'messageNode',
          position: { x: 0, y: 100 },
          data: { messageType: 'text', text: 'Thanks for the image!' }
        }
      ],
      edges: [
        { id: 'e1', source: 'node_trigger', target: 'node_msg' }
      ]
    },
    { upsert: true, new: true }
  );
  
  const flowId = flow._id;

  console.log('✅ Mock data created in database.');

  // 2. Test External API Webhook
  console.log('\n-> Testing External Event Trigger (POST /api/events/trigger)...');
  try {
    const res = await axios.post(`${BASE_URL}/events/trigger`, {
      channelId: channel._id.toString(),
      flowId: flowId.toString(),
      customerPhone: '15551234567',
      eventData: { orderId: '999' }
    }, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`✅ Success: ${res.status} ${res.data.message}`);
  } catch (err) {
    console.error('❌ Failed:', err.response?.data || err.message);
  }

  // 3. Test Meta Webhook (Image Received)
  console.log('\n-> Testing Meta Webhook (Image Received)...');
  const mockWebhookPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WHATEVER',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { phone_number_id: '1234567890' },
          messages: [{
            from: '15559998888',
            id: 'wamid.dummy',
            type: 'image',
            image: { mime_type: 'image/jpeg', sha256: 'dummy', id: 'img1' }
          }]
        }
      }]
    }]
  };

  const payloadString = JSON.stringify(mockWebhookPayload);
  const signature = 'sha256=' + crypto.createHmac('sha256', META_SECRET).update(Buffer.from(payloadString)).digest('hex');

  try {
    const res = await axios.post('http://localhost:5001/api/webhooks/whatsapp', mockWebhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': signature
      }
    });
    console.log(`✅ Success: Webhook accepted (${res.status} ${res.data})`);
  } catch (err) {
    console.error('❌ Failed:', err.response?.data || err.message);
  }

  console.log('\nWaiting 2 seconds for engine queues to process...');
  await sleep(2000);

  mongoose.disconnect();
  console.log('--- TESTS COMPLETE ---');
}

runTests();
