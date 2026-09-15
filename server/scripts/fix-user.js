/**
 * One-time script to fix a user's isEmailVerified and password in MongoDB.
 * Run with: node scripts/fix-user.js
 * 
 * Uses the same DB connection as the server.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---- CONFIG ----
const EMAIL = 'rahulyadav0000777@gmail.com';
const NEW_PASSWORD = 'Rahul123@';
// ----------------

// The server's dotenv has leading-space keys so we inline the URI
// (You can see it in server/.env)
const MONGODB_URI = 'mongodb+srv://messbee_db_user:SGMVWdSudmCNwc5n@cluster0.gvjfwvw.mongodb.net/messbee?appName=Cluster0';

async function fixUser() {
  console.log('🔌 Connecting to MongoDB...');
  
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  console.log('✅ Connected!');

  // First: show current state
  const user = await mongoose.connection.db.collection('users').findOne({ email: EMAIL });
  
  if (!user) {
    console.log('❌ User NOT FOUND with email:', EMAIL);
    await mongoose.disconnect();
    return;
  }

  console.log('\n📋 Current user state:');
  console.log('   name:', user.name);
  console.log('   email:', user.email);
  console.log('   isEmailVerified:', user.isEmailVerified);
  console.log('   isActive:', user.isActive);
  console.log('   isApproved:', user.isApproved);
  console.log('   role:', user.role);
  console.log('   password (first 20 chars):', user.password?.substring(0, 20) + '...');

  // Fix isEmailVerified + password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: EMAIL },
    { 
      $set: { 
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        password: hashedPassword
      } 
    }
  );

  console.log('\n✅ Fixed! Updated fields:');
  console.log('   isEmailVerified → true');
  console.log('   isActive → true');
  console.log('   isApproved → true');
  console.log('   password → freshly hashed version of:', NEW_PASSWORD);
  console.log('\n👉 You can now login with:', EMAIL, '/', NEW_PASSWORD);

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

fixUser().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
