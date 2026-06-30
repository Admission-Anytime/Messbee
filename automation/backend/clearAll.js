import mongoose from 'mongoose';
import Automation from './src/models/Automation.js';
import CustomerSession from './src/models/CustomerSession.js';

mongoose.connect('mongodb://localhost:27017/whatsapp-saas').then(async () => {
  await Automation.deleteMany({});
  await CustomerSession.deleteMany({});
  console.log('Cleared all dummy flows and sessions!');
  process.exit(0);
});
