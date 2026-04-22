const mongoose = require('mongoose');
require('dotenv').config();

async function dropMessageIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const collection = mongoose.connection.collection('messages');
    
    try {
      await collection.dropIndex('whatsappMessageId_1');
      console.log('Index whatsappMessageId_1 dropped successfully');
    } catch (e) {
      console.log('Index whatsappMessageId_1 not found or already dropped');
    }

    try {
      // Also check for the unique index if it has a different name
      const indexes = await collection.indexes();
      const uniqueMsgIdIndex = indexes.find(idx => idx.key.whatsappMessageId && idx.unique);
      if (uniqueMsgIdIndex) {
        await collection.dropIndex(uniqueMsgIdIndex.name);
        console.log(`Dropped unique index: ${uniqueMsgIdIndex.name}`);
      }
    } catch (e) {
      console.error('Error checking unique indexes:', e.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

dropMessageIndex();
