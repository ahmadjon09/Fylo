import dotenv from 'dotenv';
dotenv.config();

const required = (key, fallback) => {
  const val = process.env[key] || fallback;
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGO_URI: required('MONGO_URI', 'mongodb://localhost:27017/wareflow'),
  REDIS_URL: required('REDIS_URL', 'redis://localhost:6379'),
  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET', 'access_secret_dev_change'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET', 'refresh_secret_dev_change'),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  IMGBB_API_KEY: process.env.IMGBB_API_KEY || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  isProd: process.env.NODE_ENV === 'production',
};
