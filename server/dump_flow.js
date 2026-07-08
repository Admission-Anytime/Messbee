require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const Automation = require('./models/Automation');
    const flow = await Automation.findById('6a47a67fef6a358e17a89c97');
    if (!flow) {
      console.log('Flow not found');
      return;
    }
    fs.writeFileSync('debug_flow.json', JSON.stringify({ nodes: flow.nodes, edges: flow.edges }, null, 2));
    console.log('Saved to debug_flow.json');
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => process.exit(0), 1000);
  }
}).catch(console.error);
