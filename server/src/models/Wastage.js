import mongoose from 'mongoose';

const wastageSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  area: { type: String, required: true },
  flavor: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  reason: {
    type: String,
    enum: ['melted', 'expired', 'damaged', 'unsold', 'cooling_failure', 'other'],
    default: 'other'
  },
  estimatedLoss: { type: Number, default: 0 },
  reportedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Wastage', wastageSchema);
