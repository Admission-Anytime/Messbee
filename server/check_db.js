const mongoose = require('mongoose');
require('dotenv').config();

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  try {
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).limit(10).toArray();
    console.log("LAST 10 USERS:");
    users.forEach(u => {
      console.log(`- ${u.email} | isApproved: ${u.isApproved} | type: ${typeof u.isApproved}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkDb();
