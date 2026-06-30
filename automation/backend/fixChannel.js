import 'dotenv/config';
import mongoose from 'mongoose';
import Channel from './src/models/Channel.js';
import Tenant from './src/models/Tenant.js';

async function fixChannel() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const tenants = await Tenant.find({});
  if (tenants.length === 0) {
    console.log("No tenants found! Please login or sign up first.");
    process.exit(0);
  }
  
  const tenant = tenants[0];
  console.log("Found tenant:", tenant._id, tenant.name);
  
  // Find the dummy channel
  let channel = await Channel.findOne({ activeWhatsappPhoneNumberId: '123456123' });
  if (channel) {
    channel.tenantId = tenant._id;
    await channel.save();
    console.log("Updated existing Dummy Channel to match Tenant:", tenant._id);
  } else {
    await Channel.create({
      tenantId: tenant._id,
      name: 'Simulated Channel',
      provider: 'META',
      activeWhatsappPhoneNumberId: '123456123',
      metaAccessToken: 'DUMMY_TOKEN',
      status: 'ACTIVE'
    });
    console.log("Created NEW Dummy Channel for Tenant:", tenant._id);
  }
  
  process.exit(0);
}

fixChannel();
