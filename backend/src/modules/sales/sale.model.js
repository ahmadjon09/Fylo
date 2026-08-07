import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  productSnapshot: {
    name: String,
    unitCost: Number,
    sku: String,
    image: String,
  },
  quantity: { type: Number, required: true, min: 1 },
  sellingPrice: { type: Number, required: true, min: 0 }, // per unit selling price
  unitCost: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 },
  totalRevenue: { type: Number, required: true, min: 0 },
  profit: { type: Number, required: true },
  profitMargin: { type: Number, default: 0 },
  customer: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  comment: { type: String, default: '' },
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['completed', 'refunded', 'pending'], default: 'completed', index: true },
  refundedAt: { type: Date, default: null },
  refundReason: { type: String, default: '' },
}, { timestamps: true });

saleSchema.index({ createdAt: -1 });
saleSchema.index({ product: 1, createdAt: -1 });
saleSchema.index({ soldBy: 1, createdAt: -1 });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
