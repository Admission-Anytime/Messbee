require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
    
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/messbee';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const Automation = require('./models/Automation');
    
    // Find the automation being tested
    const auto = await Automation.findById('6a47a67fef6a358e17a89c97');
    if (!auto) {
      console.log('Automation not found');
      process.exit(1);
    }
    
    console.log('Automation found:', auto.name);
    console.log('channelId:', auto.channelId);
    console.log('isActive:', auto.isActive);
    console.log('Nodes:', auto.nodes.length);
    console.log('Edges:', auto.edges.length);
    
    // Check if channel exists
    const Channel = require('./models/Channel');
    const channel = await Channel.findById(auto.channelId);
    console.log('Channel exists in DB:', !!channel);
    if (channel) {
      console.log('Channel name:', channel.name);
      console.log('Channel phone:', channel.phoneNumber);
    }
    
    // Find trigger node
    const triggerNode = auto.nodes.find(n => n.type === 'triggerNode');
    console.log('\nTrigger node:', triggerNode ? triggerNode.id : 'NOT FOUND');
    if (triggerNode) {
      console.log('Trigger data:', JSON.stringify(triggerNode.data));
    }
    
    // Find first connected node
    const outEdges = auto.edges.filter(e => e.source === triggerNode?.id);
    console.log('Trigger outgoing edges:', outEdges.length);
    if (outEdges.length > 0) {
      const firstNodeId = outEdges[0].target;
      const firstNode = auto.nodes.find(n => n.id === firstNodeId);
      console.log('First node after trigger:', firstNode?.type, firstNode?.id);
      console.log('First node data:', JSON.stringify(firstNode?.data).substring(0, 200));
    }
    
    // Check for existing simulator sessions
    const CustomerSession = require('./models/CustomerSession');
    const sessions = await CustomerSession.find({ phone: /^SIMULATOR_/ });
    console.log('\nExisting simulator sessions:', sessions.length);
    for (const s of sessions) {
      console.log(`  - Status: ${s.status}, FlowId: ${s.activeFlowId}, NodeId: ${s.currentNodeId}`);
    }
    
    // Check Contact exists
    const Contact = require('./models/Contact');
    const simContacts = await Contact.find({ phone: /^SIMULATOR_/ });
    console.log('Simulator contacts:', simContacts.length);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

test();
