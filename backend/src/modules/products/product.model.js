import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  thumb: { type: String },
  medium: { type: String },
}, { _id: false });

const LOW_STOCK_FIXED = 10;

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200, index: true },
  slug: { type: String, index: true },
  sku: { type: String, unique: true, sparse: true },
  images: [imageSchema],
  quantity: { type: Number, required: true, min: 0 },
  currentQuantity: { type: Number, required: true, min: 0 },
  totalPurchasePrice: { type: Number, required: true, min: 0 },
  totalIntlShipping: { type: Number, default: 0, min: 0 },
  totalLocalShipping: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, required: true, min: 0, index: true },
  minSellingPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], default: 'in_stock', index: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalSold: { type: Number, default: 0, min: 0 },
  totalRevenue: { type: Number, default: 0, min: 0 },
  totalProfit: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', sku: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ unitCost: 1, currentQuantity: 1 });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  }
  if (this.currentQuantity <= 0) this.status = 'out_of_stock';
  else if (this.currentQuantity <= LOW_STOCK_FIXED) this.status = 'low_stock';
  else this.status = 'in_stock';
  next();
});

productSchema.virtual('inventoryValue').get(function () {
  return this.currentQuantity * this.unitCost;
});
productSchema.virtual('expectedRevenue').get(function () {
  return this.currentQuantity * this.minSellingPrice;
});
productSchema.virtual('expectedProfit').get(function () {
  return this.currentQuantity * (this.minSellingPrice - this.unitCost);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
