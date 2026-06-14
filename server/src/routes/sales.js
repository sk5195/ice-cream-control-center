import express from 'express';
import Sale from '../models/Sale.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', protect, async (req, res) => {
  const { period = 'week' } = req.query;
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'day': startDate.setHours(0, 0, 0, 0); break;
    case 'week': startDate.setDate(now.getDate() - 7); break;
    case 'month': startDate.setMonth(now.getMonth() - 1); break;
    default: startDate.setDate(now.getDate() - 7);
  }

  const match = { soldAt: { $gte: startDate } };

  const [byArea, byHour, byFlavor, bySeller, dailyTrend, revenueTrend] = await Promise.all([
    Sale.aggregate([
      { $match: match },
      { $group: { _id: '$area', quantity: { $sum: '$quantity' }, revenue: { $sum: '$revenue' } } },
      { $sort: { revenue: -1 } }
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: { $hour: '$soldAt' }, quantity: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } }
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: '$flavor', quantity: { $sum: '$quantity' }, revenue: { $sum: '$revenue' } } },
      { $sort: { quantity: -1 } }
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: '$seller', quantity: { $sum: '$quantity' }, revenue: { $sum: '$revenue' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'sellers', localField: '_id', foreignField: '_id', as: 'seller' } },
      { $unwind: '$seller' },
      { $project: { name: '$seller.name', area: '$seller.area', quantity: 1, revenue: 1 } }
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$soldAt' } }, quantity: { $sum: '$quantity' }, revenue: { $sum: '$revenue' } } },
      { $sort: { _id: 1 } }
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$soldAt' } }, revenue: { $sum: '$revenue' } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.json({
    byArea: byArea.map(a => ({ area: a._id, quantity: a.quantity, revenue: a.revenue })),
    byHour: byHour.map(h => ({ hour: h._id, quantity: h.quantity })),
    byFlavor: byFlavor.map(f => ({ flavor: f._id, quantity: f.quantity, revenue: f.revenue })),
    bySeller,
    dailyTrend: dailyTrend.map(d => ({ date: d._id, quantity: d.quantity, revenue: d.revenue })),
    revenueTrend: revenueTrend.map(d => ({ date: d._id, revenue: d.revenue })),
    totalSales: dailyTrend.reduce((s, d) => s + d.quantity, 0),
    totalRevenue: dailyTrend.reduce((s, d) => s + d.revenue, 0)
  });
});

router.get('/', protect, async (req, res) => {
  const { area, flavor, limit = 50 } = req.query;
  const filter = {};
  if (area) filter.area = area;
  if (flavor) filter.flavor = flavor;

  const sales = await Sale.find(filter)
    .populate('seller', 'name area')
    .populate('product', 'name flavor')
    .sort({ soldAt: -1 })
    .limit(Number(limit));
  res.json(sales);
});

router.post('/', protect, async (req, res) => {
  const sale = await Sale.create(req.body);
  res.status(201).json(sale);
});

export default router;
