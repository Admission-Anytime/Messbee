const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();

async function listUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  try {
    const users = await db.collection('users').find({}).toArray();
    console.log(JSON.stringify(users.map(u => ({
      name: u.name,
      email: u.email,
      role: u.role,
      isApproved: !!u.isApproved,
      createdAt: u.createdAt
    }))));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

listUsers();
