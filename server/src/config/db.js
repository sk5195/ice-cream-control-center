import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let memoryServer = null;

const startMemoryServer = async () => {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  console.log('Using in-memory MongoDB');
  return memoryServer.getUri('icecream_control');
};

const connectDB = async () => {
  const useMemory = process.env.USE_MEMORY_DB === 'true';
  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/icecream_control';

  if (useMemory) {
    uri = await startMemoryServer();
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    if (!useMemory) {
      console.warn('Falling back to in-memory MongoDB so the app can still start.');
      uri = await startMemoryServer();
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } else {
      throw error;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};

export default connectDB;
