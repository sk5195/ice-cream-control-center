import express from 'express';
import multer from 'multer';
import path from 'path';
import RefrigeratorReport from '../models/RefrigeratorReport.js';
import Seller from '../models/Seller.js';
import { protect } from '../middleware/auth.js';
import { analyzeImage } from '../services/aiService.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `fridge-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', protect, async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const reports = await RefrigeratorReport.find(filter)
    .populate('seller', 'name area phone')
    .sort({ submittedAt: -1 });
  res.json(reports);
});

router.get('/summary', protect, async (req, res) => {
  const [ok, failed, warnings, flagged] = await Promise.all([
    RefrigeratorReport.countDocuments({ coolingStatus: 'ok', iceCreamCondition: 'good' }),
    RefrigeratorReport.countDocuments({ coolingStatus: 'failed' }),
    RefrigeratorReport.countDocuments({ coolingStatus: 'warning' }),
    RefrigeratorReport.countDocuments({ 'aiAnalysis.meltedProbability': { $gt: 50 } })
  ]);
  res.json({ coolingOk: ok, failed, warnings, spoilageWarnings: flagged });
});

router.post('/', protect, upload.array('photos', 3), async (req, res) => {
  const { sellerId, coolingStatus, iceCreamCondition, notes } = req.body;
  const photos = req.files?.map(f => f.filename) || [];

  const aiAnalysis = await analyzeImage(photos[0], coolingStatus, iceCreamCondition);

  const status = aiAnalysis.meltedProbability > 70 || coolingStatus === 'failed'
    ? 'flagged'
    : 'pending';

  const report = await RefrigeratorReport.create({
    seller: sellerId,
    coolingStatus,
    iceCreamCondition,
    photos,
    notes,
    aiAnalysis,
    status
  });

  if (coolingStatus === 'failed' || aiAnalysis.meltedProbability > 70) {
    await Seller.findByIdAndUpdate(sellerId, { status: 'issue' });
  }

  const populated = await RefrigeratorReport.findById(report._id)
    .populate('seller', 'name area phone');
  res.status(201).json(populated);
});

router.put('/:id/review', protect, async (req, res) => {
  const { status } = req.body;
  const report = await RefrigeratorReport.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('seller', 'name area');
  res.json(report);
});

export default router;
