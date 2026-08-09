import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true }, // e.g., 'user:login', 'product:create', 'sale:create', 'user:create' etc
  actionUz: { type: String, default: '' }, // Uzbek Cyrillic description
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userName: String,
  userRole: String,
  targetId: { type: mongoose.Schema.Types.ObjectId, index: true },
  targetModel: String,
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: String,
  userAgent: String,
  location: {
    lat: Number,
    lon: Number,
    city: String,
    country: String,
    address: String,
  },
  // TTL 60 days = 2 months
  createdAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 60*24*60*60*1000), index: { expires: 0 } },
}, { timestamps: false });

auditSchema.index({ createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ userId: 1, createdAt: -1 });

const Audit = mongoose.model('Audit', auditSchema);
export default Audit;
