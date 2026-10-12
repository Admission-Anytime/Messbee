const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb://messbee_db_user:SGMVWdSudmCNwc5n@ac-amx81wh-shard-00-00.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-01.gvjfwvw.mongodb.net:27017,ac-amx81wh-shard-00-02.gvjfwvw.mongodb.net:27017/?ssl=true&replicaSet=atlas-flbx0i-shard-0&authSource=admin';

async function check() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const testDb = client.db('test');

    const channels = await testDb.collection('channels').find({}).toArray();
    console.log('=== TEST DB: ALL CHANNELS ===');
    for (const c of channels) {
      console.log(JSON.stringify(c, null, 2));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

check();
