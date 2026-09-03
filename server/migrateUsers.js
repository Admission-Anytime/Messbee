const mongoose = require('mongoose');

async function updateExistingUsers() {
  try {
    await mongoose.connect('mongodb+srv://messbee_db_user:SGMVWdSudmCNwc5n@cluster0.gvjfwvw.mongodb.net/?appName=Cluster0');
    console.log('Connected to DB');
    
    const usersCollection = mongoose.connection.collection('users');
    
    // Update all users who do not have a tenantId to be ADMIN
    const result = await usersCollection.updateMany(
      { tenantId: { $exists: false } },
      { $set: { role: 'ADMIN' } }
    );
    
    console.log(`Successfully updated ${result.modifiedCount} existing users to ADMIN role.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

updateExistingUsers();
