import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  bounds: {
    north: Number,
    south: Number,
    east: Number,
    west: Number
  },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  demandLevel: {
    type: String,
    enum: ['hot', 'normal', 'cold'],
    default: 'normal'
  },
  activeSellers: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Area', areaSchema);
