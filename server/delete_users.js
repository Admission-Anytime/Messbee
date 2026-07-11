const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();

async function deleteUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  try {
    const emailsToDelete = [
      'dafandastaavez@gmail.com',
      'aliengigglequest.official@gmail.com',
      'rahulkumarraahi3@gmail.com'
    ];

    const result = await db.collection('users').deleteMany({
      email: { $in: emailsToDelete }
    });

    console.log(`Successfully deleted ${result.deletedCount} users.`);
    console.log('Emails targeted:', emailsToDelete.join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

deleteUsers();
