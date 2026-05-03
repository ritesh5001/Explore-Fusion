import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3500
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB not connected. API will run with demo discovery data.');
    console.warn(error instanceof Error ? error.message : error);
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
