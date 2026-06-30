import mongoose from 'mongoose';
import Automation from './src/models/Automation.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/whatsapp-saas');
  const flows = await Automation.find({});
  console.log(JSON.stringify(flows, null, 2));
  process.exit();
}
run();
