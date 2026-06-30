import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Channel from './src/models/Channel.js';
import { upsertContactInternal } from './src/controllers/contact.controller.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find any channel
  const channel = await Channel.findOne();
  if (!channel) {
    console.log('No channel found');
    process.exit(1);
  }

  console.log('Dropping old indexes...');
  try {
    await mongoose.connection.collection('contacts').dropIndex('user_1_whatsapp_1');
    console.log('Old index dropped');
  } catch (e) {
    console.log('Index drop ignored:', e.message);
  }

  console.log('Testing upsert with channel:', channel._id, 'tenant:', channel.tenantId);
  const contact = await upsertContactInternal(channel.tenantId, channel._id, '1234567890', 'Unknown');
  if (contact) {
    console.log('Success:', contact._id);
  } else {
    console.log('Failed!');
  }
  process.exit(0);
}

run();
