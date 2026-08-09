import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/database.js';
import User from './modules/users/user.model.js';

const seed = async () => {
  await connectDB();
  const count = await User.countDocuments();
  if (count > 0) { console.log('Users already exist, skipping'); process.exit(0); }
  const superAdmin = await User.create({
    fullName: 'Super Admin - Fylo',
    phone: '+998901234567',
    password: 'admin123',
    role: 'super_admin',
    telegramId: null,
  });
  console.log('Seeded super_admin:', superAdmin.phone, 'password: admin123 - Fylo @FyloRobot');
  const admin = await User.create({
    fullName: 'Admin - Fylo',
    phone: '+998901234568',
    password: 'admin123',
    role: 'admin',
  });
  console.log('Seeded admin:', admin.phone, 'password: admin123');
  process.exit(0);
};
seed();
