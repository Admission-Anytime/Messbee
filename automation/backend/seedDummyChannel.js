import mongoose from 'mongoose';
import Channel from './src/models/Channel.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-saas');
  
  const existing = await Channel.findOne({ activeWhatsappPhoneNumberId: '123456123' });
  if (!existing) {
    await Channel.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d700153f3e22'),
      tenantId: new mongoose.Types.ObjectId('60d5ecb8b392d700153f3e11'),
      name: 'Simulated Channel',
      provider: 'META',
      activeWhatsappPhoneNumberId: '123456123',
      metaAccessToken: 'DUMMY_TOKEN',
      status: 'ACTIVE'
    });
    console.log('Dummy Channel created successfully.');
  } else {
    console.log('Dummy Channel already exists.');
  }
  
  process.exit(0);
}

seed();
