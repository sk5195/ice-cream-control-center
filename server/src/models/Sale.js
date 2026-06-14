import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  area: { type: String, required: true },
  flavor: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  revenue: { type: Number, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  soldAt: { type: Date, default: Date.now }
}, { timestamps: true });

saleSchema.index({ soldAt: -1 });
saleSchema.index({ area: 1 });
saleSchema.index({ flavor: 1 });

export default mongoose.model('Sale', saleSchema);
