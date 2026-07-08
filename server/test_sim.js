require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const Automation = require('./models/Automation');
    const flow = await Automation.findOne().sort({createdAt: -1});
    console.log('Testing Flow:', flow.name, 'Nodes:', flow.nodes.length, 'Edges:', flow.edges.length);
    
    const { startFlowManually } = require('./engine/flowRunner.js');
    await startFlowManually('SIMULATOR_123', flow.channelId, flow._id, {}, true);
    
    console.log('Done starting');
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => process.exit(0), 2000);
  }
}).catch(console.error);
