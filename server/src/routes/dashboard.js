import express from 'express';
import Seller from '../models/Seller.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Wastage from '../models/Wastage.js';
import RefrigeratorReport from '../models/RefrigeratorReport.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    activeSellers,
    todaySales,
    totalInventory,
    wastageToday,
    fridgeAlerts,
    totalRevenue
  ] = await Promise.all([
    Seller.countDocuments({ isActive: true, status: { $ne: 'offline' } }),
    Sale.aggregate([
      { $match: { soldAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$quantity' }, revenue: { $sum: '$revenue' } } }
    ]),
    Product.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
    Wastage.aggregate([
      { $match: { reportedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$quantity' }, loss: { $sum: '$estimatedLoss' } } }
    ]),
    RefrigeratorReport.countDocuments({
      status: { $in: ['pending', 'flagged'] },
      $or: [{ coolingStatus: { $in: ['warning', 'failed'] } }, { 'aiAnalysis.meltedProbability': { $gt: 50 } }]
    }),
    Sale.aggregate([
      { $match: { soldAt: { $gte: today } } },
      { $group: { _id: null, revenue: { $sum: '$revenue' } } }
    ])
  ]);

  const salesData = todaySales[0] || { total: 0, revenue: 0 };
  const wastageData = wastageToday[0] || { total: 0, loss: 0 };

  res.json({
    activeSellers,
    iceCreamsSoldToday: salesData.total,
    totalRevenue: salesData.revenue,
    remainingInventory: totalInventory[0]?.total || 0,
    wastageToday: wastageData.total,
    wastageLoss: wastageData.loss,
    refrigeratorAlerts: fridgeAlerts,
    lowStockSellers: await Seller.countDocuments({ status: 'low_stock' }),
    issueSellers: await Seller.countDocuments({ status: 'issue' })
  });
});

router.get('/recent-activity', protect, async (req, res) => {
  const [recentSales, recentReports, recentWastage] = await Promise.all([
    Sale.find().populate('seller', 'name').populate('product', 'name flavor')
      .sort({ soldAt: -1 }).limit(10),
    RefrigeratorReport.find().populate('seller', 'name area')
      .sort({ submittedAt: -1 }).limit(5),
    Wastage.find().populate('seller', 'name').sort({ reportedAt: -1 }).limit(5)
  ]);

  res.json({ recentSales, recentReports, recentWastage });
});

export default router;
