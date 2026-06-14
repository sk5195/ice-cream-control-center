import express from 'express';
import Area from '../models/Area.js';
import Sale from '../models/Sale.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const areas = await Area.find().sort({ totalSales: -1 });
  res.json(areas);
});

router.get('/heatmap', protect, async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const salesByArea = await Sale.aggregate([
    { $match: { soldAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$area', sales: { $sum: '$quantity' }, revenue: { $sum: '$revenue' } } }
  ]);

  const areas = await Area.find();
  const maxSales = Math.max(...salesByArea.map(s => s.sales), 1);

  const heatmap = areas.map(area => {
    const salesData = salesByArea.find(s => s._id === area.name);
    const sales = salesData?.sales || 0;
    const intensity = sales / maxSales;

    let zone = 'cold';
    if (intensity > 0.7) zone = 'hot';
    else if (intensity > 0.35) zone = 'normal';

    return {
      name: area.name,
      center: area.center,
      sales,
      revenue: salesData?.revenue || 0,
      intensity: Math.round(intensity * 100),
      zone,
      activeSellers: area.activeSellers,
      recommendation: zone === 'hot'
        ? 'High demand — deploy more sellers and stock'
        : zone === 'cold'
          ? 'Low demand — reduce stock or reassign sellers'
          : 'Stable demand — maintain current allocation'
    };
  });

  res.json(heatmap.sort((a, b) => b.sales - a.sales));
});

export default router;
