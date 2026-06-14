import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  area: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'low_stock', 'issue', 'offline'],
    default: 'active'
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  currentStock: { type: Number, default: 0 },
  salesToday: { type: Number, default: 0 },
  revenueToday: { type: Number, default: 0 },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' }
  },
  assignedProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true },
  lastLocationUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Seller', sellerSchema);
