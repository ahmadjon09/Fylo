import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(env.MONGO_URI, {
    autoIndex: !env.isProd,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};
