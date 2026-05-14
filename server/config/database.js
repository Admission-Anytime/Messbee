const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Force reliable public DNS servers for SRV lookups to avoid local DNS issues
    dns.setServers(['8.8.8.8', '1.1.1.1']);

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined');

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;