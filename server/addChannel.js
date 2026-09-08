/**
 * addChannel.js
 * Seeds WhatsApp channel for a specific user account
 * Usage: node addChannel.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI    = process.env.MONGODB_URI;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;   // 938016822738928
const ACCESS_TOKEN   = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID        = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID; // 1612193906402010

// ── Target user ──────────────────────────────────────────────────────────────
const TARGET_EMAIL   = 'rahulyadav0000777@gmail.com';
const TARGET_PHONE   = '6203459821';

const channelSchema = new mongoose.Schema({
  tenantId:                    { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  activeWhatsappPhoneNumberId: { type: String, required: true, unique: true, index: true },
  metaAccessToken:             { type: String, required: true },
  metadata: {
    name:          { type: String,  default: 'Default WhatsApp Channel' },
    qualityRating: { type: String,  default: 'UNKNOWN' },
    status:        { type: String,  default: 'CONNECTED' },
    wabaId:        { type: String }
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({}, { strict: false });

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!\n');

  const Channel = mongoose.model('Channel', channelSchema);
  const User    = mongoose.model('User', userSchema, 'users');

  // ── Find target user by email ─────────────────────────────────────────────
  const user = await User.findOne({ email: TARGET_EMAIL });

  if (!user) {
    console.log(`❌ User not found with email: ${TARGET_EMAIL}`);
    console.log('   Check kar lo — email bilkul sahi hai?');
    const allUsers = await User.find({}, { email: 1, name: 1, role: 1 }).limit(10);
    console.log('\n📋 Existing users in DB:');
    allUsers.forEach(u => console.log(`   • ${u.email}  (${u.role})  ${u.name || ''}`));
    await mongoose.disconnect();
    return;
  }

  const tenantId = user.tenantId || user._id;
  console.log('👤 User Found!');
  console.log(`   Name:      ${user.name || 'N/A'}`);
  console.log(`   Email:     ${user.email}`);
  console.log(`   Role:      ${user.role}`);
  console.log(`   Tenant ID: ${tenantId}`);
  console.log(`   Phone:     ${user.phone || user.whatsapp || TARGET_PHONE}`);
  console.log('');
  console.log(`📱 Phone Number ID:  ${PHONE_NUMBER_ID}`);
  console.log(`🏢 WABA ID:          ${WABA_ID}`);
  console.log('');

  // ── Check if channel already exists ──────────────────────────────────────
  const existing = await Channel.findOne({ activeWhatsappPhoneNumberId: PHONE_NUMBER_ID });
  if (existing) {
    console.log('⚠️  Channel with this Phone Number ID already exists!');
    console.log('   Channel ID:', existing._id);
    console.log('   Tenant ID:', existing.tenantId);

    if (String(existing.tenantId) === String(tenantId)) {
      console.log('✅ Ye channel already aapke hi account mein hai — kuch karne ki zaroorat nahi!');
    } else {
      console.log('🔄 Different tenant ka channel hai. Updating tenantId to yours...');
      existing.tenantId = tenantId;
      await existing.save();
      console.log('✅ Channel updated to your account!');
    }
    await mongoose.disconnect();
    return;
  }

  // ── Create new channel ────────────────────────────────────────────────────
  const newChannel = await Channel.create({
    tenantId,
    activeWhatsappPhoneNumberId: PHONE_NUMBER_ID,
    metaAccessToken: ACCESS_TOKEN,
    metadata: {
      name:          'Rahul Yadav — WhatsApp Business',
      qualityRating: 'GREEN',
      status:        'CONNECTED',
      wabaId:        WABA_ID
    }
  });

  console.log('🎉 Channel successfully added!');
  console.log('─────────────────────────────────────────');
  console.log(`   Channel ID:   ${newChannel._id}`);
  console.log(`   Name:         ${newChannel.metadata.name}`);
  console.log(`   Phone ID:     ${newChannel.activeWhatsappPhoneNumberId}`);
  console.log(`   Status:       ${newChannel.metadata.status}`);
  console.log('─────────────────────────────────────────');
  console.log('\n✅ Ab "Assign WhatsApp Number" modal refresh karo — aapka number dikh jayega!');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
