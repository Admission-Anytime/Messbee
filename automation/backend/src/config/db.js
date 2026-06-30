import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-saas';
    await mongoose.connect(mongoURI, {
      maxPoolSize: 100, // Handle high concurrency
      minPoolSize: 10,  // Maintain a warm set of connections
      socketTimeoutMS: 45000, // Close inactive sockets
      serverSelectionTimeoutMS: 5000, // Fail fast if DB unreachable
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host} (Pool Size: 100)`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
