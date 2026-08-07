import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../../constants/roles.js';

const deviceSchema = new mongoose.Schema(
  {
    userAgent: String,
    ip: String,
    lastActive: { type: Date, default: Date.now },
    location: String,
  },
  { _id: true, timestamps: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    phone: { type: String, required: true, unique: true, trim: true },
    phoneNormalized: { type: String, index: true },
    password: { type: String, select: false, minlength: 6 },
    avatar: {
      url: { type: String, default: '' },
      thumb: { type: String, default: '' },
    },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.WORKER, index: true },
    isDisabled: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
    devices: [deviceSchema],
    telegramId: { type: String, default: null, trim: true },
    loginCount: { type: Number, default: 0 },
    preferences: {
      language: { type: String, default: 'en' },
      theme: { type: String, default: 'system' },
    },
  },
  { timestamps: true }
);

userSchema.index({ fullName: 'text', phone: 'text' });

userSchema.pre('save', async function (next) {
  if (this.isModified('phone')) {
    this.phoneNormalized = this.phone.replace(/\D/g, '');
  }
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.devices;
  delete obj.tokenVersion;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
