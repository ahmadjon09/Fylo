import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database.js';
import User from './modules/users/user.model.js';

const seed = async () => {
  await connectDB();
  const count = await User.countDocuments();
  if (count > 0) { console.log('Users already exist, skipping'); process.exit(0); }
  const admin = await User.create({
    fullName: 'Super Admin',
    phone: '+998901234567',
    password: 'admin123',
    role: 'admin',
    telegramId: null,
  });
  console.log('Seeded admin:', admin.phone, 'password: admin123');
  process.exit(0);
};
seed();
