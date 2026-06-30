import 'dotenv/config';
import mongoose from 'mongoose';
import Automation from './src/models/Automation.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const automations = await Automation.find({});
    console.log(`Found ${automations.length} automations in the collection.`);
    if (automations.length > 0) {
      console.log('First automation:', JSON.stringify(automations[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

test();
