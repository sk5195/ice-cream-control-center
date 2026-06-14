import mongoose from 'mongoose';

const refrigeratorReportSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  coolingStatus: {
    type: String,
    enum: ['ok', 'warning', 'failed'],
    required: true
  },
  iceCreamCondition: {
    type: String,
    enum: ['good', 'soft', 'melted', 'damaged'],
    required: true
  },
  photos: [{ type: String }],
  notes: { type: String, default: '' },
  aiAnalysis: {
    meltedProbability: { type: Number, default: 0 },
    packagingDamage: { type: Boolean, default: false },
    qualityScore: { type: Number, default: 100 },
    issues: [{ type: String }],
    recommendation: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'flagged'],
    default: 'pending'
  },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('RefrigeratorReport', refrigeratorReportSchema);
