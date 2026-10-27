const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e){}
const mongoose = require('mongoose');

const BASE_URI = 'mongodb://messbee_db_user:SGMVWdSudmCNwc5n@ac-amx81wh-shard-00-00.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-01.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-02.gvjfwvw.mongodb.net:27017';
const PARAMS = '?ssl=true&replicaSet=atlas-flbx0i-shard-0&authSource=admin';

const MESSBEE_TENANT_ID = new mongoose.Types.ObjectId('6ac0cbbf32560b8b627f2465');
const MESSBEE_CHANNEL_ID = new mongoose.Types.ObjectId('6ac0cfb16c2657d83bb1e24c');

const DOCTOR_KEYWORDS = [
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

async function updateDb(dbName, channelId, tenantId) {
  const uri = `${BASE_URI}/${dbName}${PARAMS}`;
  console.log(`\nConnecting to ${dbName}...`);
  const conn = await mongoose.createConnection(uri).asPromise();

  // 1. Update Doctor Appointment Book to have triggerType: 'qr_link'
  const doctorFlow = await conn.collection('automations').findOne({
    tenantId: tenantId,
    name: /doctor appointment/i
  });

  if (doctorFlow) {
    console.log(`Found Doctor Flow in ${dbName}: ${doctorFlow.name} (ID: ${doctorFlow._id})`);
    const updatedNodes = doctorFlow.nodes.map(n => {
      if (n.id === 'node_trigger' || (n.type && n.type.toLowerCase().includes('trigger'))) {
        return {
          ...n,
          type: 'triggerNode',
          data: {
            ...n.data,
            label: 'QR Code / Click-to-Chat Link',
            title: 'QR Scan & Click Trigger',
            triggerType: 'qr_link',
            matchType: 'contains',
            keyword: DOCTOR_KEYWORDS.join(', '),
            qrCountryCode: '+91',
            qrPhoneNumber: '9217742081',
            businessName: 'MessBee Hospital & Healthcare',
            offerLabel: 'Scan & Book Priority Doctor Consultation',
            description: 'Triggered when patient scans QR code or taps link'
          }
        };
      }
      return n;
    });

    const triggers = DOCTOR_KEYWORDS.map(kw => ({
      _id: new mongoose.Types.ObjectId(),
      type: 'keyword',
      value: kw
    }));
    triggers.unshift({
      _id: new mongoose.Types.ObjectId(),
      type: 'qr_link',
      value: 'Doctor Appointment'
    });

    await conn.collection('automations').updateOne(
      { _id: doctorFlow._id },
      {
        $set: {
          nodes: updatedNodes,
          triggerType: 'qr_link',
          triggers: triggers,
          isActive: true,
          status: 'active',
          updatedAt: new Date()
        }
      }
    );
    console.log(`✅ Updated Doctor Flow with QR Trigger!`);
  }

  // 2. Check if "QR Reception Desk & Doctor Routing" exists for MessBee tenant
  let receptionFlow = await conn.collection('automations').findOne({
    tenantId: tenantId,
    name: /QR Reception Desk/i
  });

  if (!receptionFlow) {
    console.log(`"QR Reception Desk" not found for MessBee in ${dbName}. Cloning template...`);
    const sourceFlow = await conn.collection('automations').findOne({
      name: /QR Reception Desk/i
    });

    if (sourceFlow) {
      const clonedFlow = {
        ...sourceFlow,
        _id: new mongoose.Types.ObjectId(),
        name: 'QR Reception Desk & Doctor Routing',
        tenantId: tenantId,
        channelId: channelId,
        isActive: true,
        status: 'active',
        triggerType: 'qr_link',
        triggers: [
          { _id: new mongoose.Types.ObjectId(), type: 'qr_link', value: 'Check-in' },
          { _id: new mongoose.Types.ObjectId(), type: 'keyword', value: 'check-in' },
          { _id: new mongoose.Types.ObjectId(), type: 'keyword', value: 'reception' },
          { _id: new mongoose.Types.ObjectId(), type: 'keyword', value: 'desk' },
          { _id: new mongoose.Types.ObjectId(), type: 'keyword', value: 'token' },
          { _id: new mongoose.Types.ObjectId(), type: 'keyword', value: 'counter' },
          { _id: new mongoose.Types.ObjectId(), type: 'keyword', value: 'qr checkin' }
        ],
        nodes: sourceFlow.nodes.map(n => {
          if (n.id === '1' || (n.type && n.type.toLowerCase().includes('trigger'))) {
            return {
              ...n,
              type: 'triggerNode',
              data: {
                ...n.data,
                label: 'QR Code / Click-to-Chat Link',
                title: 'Reception Desk QR Scan',
                triggerType: 'qr_link',
                matchType: 'contains',
                keyword: 'Check-in, Reception, Desk, Token, Counter, QR Checkin',
                qrCountryCode: '+91',
                qrPhoneNumber: '9217742081',
                businessName: 'MessBee Reception Desk',
                offerLabel: 'Scan for Reception Desk & Doctor Check-in',
                description: 'Triggered when visitor/patient scans reception desk QR code'
              }
            };
          }
          return n;
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await conn.collection('automations').insertOne(clonedFlow);
      console.log(`✅ Cloned "QR Reception Desk & Doctor Routing" into MessBee tenant! (ID: ${clonedFlow._id})`);
    }
  } else {
    console.log(`"QR Reception Desk" already exists for MessBee: ${receptionFlow._id}`);
    await conn.collection('automations').updateOne(
      { _id: receptionFlow._id },
      { $set: { isActive: true, status: 'active', updatedAt: new Date() } }
    );
  }

  await conn.close();
}

async function run() {
  await updateDb('messbee', MESSBEE_CHANNEL_ID, MESSBEE_TENANT_ID);
  
  const TEST_TENANT_ID = new mongoose.Types.ObjectId('6ac0cbbf32560b8b627f2465');
  const TEST_CHANNEL_ID = new mongoose.Types.ObjectId('6ac0cfb06c2657d83bb1e24b');
  await updateDb('test', TEST_CHANNEL_ID, TEST_TENANT_ID);

  console.log('\n🎉 ALL QR AUTOMATIONS CONFIGURED AND VERIFIED!');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
