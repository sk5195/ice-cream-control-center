import express from 'express';
import Wastage from '../models/Wastage.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const wastage = await Wastage.find()
    .populate('seller', 'name area')
    .populate('product', 'name flavor')
    .sort({ reportedAt: -1 });
  res.json(wastage);
});

router.get('/summary', protect, async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const summary = await Wastage.aggregate([
    { $match: { reportedAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: '$reason',
        quantity: { $sum: '$quantity' },
        loss: { $sum: '$estimatedLoss' }
      }
    }
  ]);

  const total = summary.reduce((s, w) => ({ quantity: s.quantity + w.quantity, loss: s.loss + w.loss }), { quantity: 0, loss: 0 });
  res.json({ byReason: summary, total });
});

router.post('/', protect, async (req, res) => {
  const wastage = await Wastage.create(req.body);
  res.status(201).json(wastage);
});

export default router;
