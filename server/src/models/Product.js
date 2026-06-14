import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  flavor: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true },
  category: { type: String, default: 'ice_cream' },
  lowStockThreshold: { type: Number, default: 20 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

export default mongoose.model('Product', productSchema);
