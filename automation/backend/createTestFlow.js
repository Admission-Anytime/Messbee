import mongoose from 'mongoose';
import Automation from './src/models/Automation.js';
import dotenv from 'dotenv';

dotenv.config();

async function createFlow() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/whatsapp-saas');

  await Automation.deleteMany({ triggerKeywords: 'hello' });

  await Automation.create({
    tenantId: new mongoose.Types.ObjectId('60d5ecb8b392d700153f3e11'),
    channelId: new mongoose.Types.ObjectId('60d5ecb8b392d700153f3e22'),
    name: 'Test Flow',
    isActive: true,
    triggerKeywords: ['hello'],
    nodes: [
      {
        id: 'node_1',
        type: 'triggerNode',
        position: { x: 0, y: 0 },
        data: { keyword: 'hello' }
      },
      {
        id: 'node_2',
        type: 'messageNode',
        position: { x: 0, y: 0 },
        data: { messageType: 'text', text: 'Reply message from backend!' }
      }
    ],
    edges: [
      {
        id: 'edge_1',
        source: 'node_1',
        target: 'node_2'
      }
    ]
  });

  console.log('Test flow created.');
  process.exit(0);
}

createFlow();
