const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e){}
const mongoose = require('mongoose');

const BASE_URI = 'mongodb://messbee_db_user:SGMVWdSudmCNwc5n@ac-amx81wh-shard-00-00.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-01.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-02.gvjfwvw.mongodb.net:27017';
const PARAMS = '?ssl=true&replicaSet=atlas-flbx0i-shard-0&authSource=admin';

const KEYWORD_LIST = [
  'doctor appointment',
  'book doctor',
  'doctor',
  'appointment',
  'opd',
  'clinic',
  'consultation',
  'check-in',
  'hi',
  'hello',
  'hey',
  'start',
  'dr',
  'dr.',
  'book',
  'appointment book',
  'clinic visit',
  'opd check-in'
];

const KEYWORD_STRING = KEYWORD_LIST.join(', ');

async function fixFlowInDb(dbName) {
  const uri = `${BASE_URI}/${dbName}${PARAMS}`;
  console.log(`\n========================================`);
  console.log(`Connecting to database: ${dbName}...`);
  const conn = await mongoose.createConnection(uri).asPromise();

  // Find all doctor appointment flows in this db
  const flows = await conn.collection('automations').find({ name: /doctor/i }).toArray();
  console.log(`Found ${flows.length} doctor flow(s) in ${dbName}`);

  for (const flow of flows) {
    console.log(`\nUpdating Flow: "${flow.name}" (ID: ${flow._id}, channelId: ${flow.channelId}, tenantId: ${flow.tenantId})`);

    const updatedNodes = (flow.nodes || []).map(node => {
      if (node.id === 'node_trigger' || (node.type && node.type.toLowerCase().includes('trigger'))) {
        return {
          ...node,
          type: 'triggerNode',
          data: {
            ...node.data,
            label: '1. Trigger (Keyword / QR / Click-to-Chat / Greetings)',
            title: 'Appointment & Greeting Trigger',
            triggerType: 'keyword',
            matchType: 'contains',
            keyword: KEYWORD_STRING,
            description: 'Triggered when patient sends greeting (hi, hello) or appointment keywords (doctor, appointment, book, etc.)'
          }
        };
      }
      return node;
    });

    const triggersArray = KEYWORD_LIST.map(kw => ({
      _id: new mongoose.Types.ObjectId(),
      type: 'keyword',
      value: kw
    }));

    await conn.collection('automations').updateOne(
      { _id: flow._id },
      {
        $set: {
          nodes: updatedNodes,
          triggers: triggersArray,
          triggerType: 'keyword',
          isActive: true,
          status: 'active',
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Flow ${flow._id} successfully updated with active triggers and keywords!`);
  }

  // Clear any hung customer sessions for this flow so testing starts fresh
  const cleared = await conn.collection('customersessions').deleteMany({
    status: { $in: ['WAITING_FOR_INPUT', 'ACTIVE'] },
    phone: { $in: ['919876543210', '919999123456'] }
  });
  console.log(`Cleared ${cleared.deletedCount} test sessions in ${dbName}`);

  await conn.close();
}

async function run() {
  await fixFlowInDb('messbee');
  await fixFlowInDb('test');
  console.log('\n🎉 ALL DATABASES FIXED SUCCESSFULLY!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error fixing flows:', err);
  process.exit(1);
});
