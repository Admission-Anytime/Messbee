import mongoose from 'mongoose';
import Automation from './src/models/Automation.js';

mongoose.connect('mongodb://localhost:27017/whatsapp-saas').then(async () => {
  const docs = await Automation.find({});
  console.log(JSON.stringify(docs, null, 2));
  process.exit(0);
});
