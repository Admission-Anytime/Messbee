import mongoose from 'mongoose';
import CustomerSession from './src/models/CustomerSession.js';

mongoose.connect('mongodb://localhost:27017/whatsapp-saas').then(async () => {
  await CustomerSession.deleteMany({});
  console.log('Cleared all sessions!');
  process.exit(0);
});
