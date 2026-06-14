import express from 'express';
import Sale from '../models/Sale.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Wastage from '../models/Wastage.js';
import Area from '../models/Area.js';
import { protect } from '../middleware/auth.js';
import { generatePDF, generateExcel } from '../services/reportService.js';

const router = express.Router();

const reportConfigs = {
  daily: {
    title: 'Daily Sales Report',
    columns: ['Date', 'Area', 'Flavor', 'Quantity', 'Revenue'],
    fetch: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sales = await Sale.find({ soldAt: { $gte: today } }).sort({ soldAt: -1 });
      return sales.map(s => ({
        date: s.soldAt.toLocaleDateString(),
        area: s.area,
        flavor: s.flavor,
        quantity: s.quantity,
        revenue: `₹${s.revenue}`
      }));
    }
  },
  seller: {
    title: 'Seller Performance Report',
    columns: ['Name', 'Area', 'Status', 'Sales Today', 'Revenue Today', 'Current Stock'],
    fetch: async () => {
      const sellers = await Seller.find({ isActive: true });
      return sellers.map(s => ({
        name: s.name,
        area: s.area,
        status: s.status,
        sales_today: s.salesToday,
        revenue_today: `₹${s.revenueToday}`,
        current_stock: s.currentStock
      }));
    }
  },
  inventory: {
    title: 'Inventory Report',
    columns: ['Name', 'Flavor', 'Price', 'Quantity', 'Expiry Date', 'Status'],
    fetch: async () => {
      const products = await Product.find({ isActive: true });
      return products.map(p => ({
        name: p.name,
        flavor: p.flavor,
        price: `₹${p.price}`,
        quantity: p.quantity,
        expiry_date: p.expiryDate.toLocaleDateString(),
        status: p.quantity <= p.lowStockThreshold ? 'LOW STOCK' : 'OK'
      }));
    }
  },
  wastage: {
    title: 'Wastage Report',
    columns: ['Area', 'Flavor', 'Quantity', 'Reason', 'Estimated Loss', 'Date'],
    fetch: async () => {
      const items = await Wastage.find().populate('seller', 'name').sort({ reportedAt: -1 }).limit(100);
      return items.map(w => ({
        area: w.area,
        flavor: w.flavor,
        quantity: w.quantity,
        reason: w.reason,
        estimated_loss: `₹${w.estimatedLoss}`,
        date: w.reportedAt.toLocaleDateString()
      }));
    }
  },
  area: {
    title: 'Area Performance Report',
    columns: ['Area', 'Total Sales', 'Total Revenue', 'Demand Level', 'Active Sellers'],
    fetch: async () => {
      const areas = await Area.find().sort({ totalSales: -1 });
      return areas.map(a => ({
        area: a.name,
        total_sales: a.totalSales,
        total_revenue: `₹${a.totalRevenue}`,
        demand_level: a.demandLevel,
        active_sellers: a.activeSellers
      }));
    }
  }
};

router.get('/types', protect, (req, res) => {
  res.json(Object.keys(reportConfigs).map(key => ({
    id: key,
    title: reportConfigs[key].title
  })));
});

router.get('/:type', protect, async (req, res) => {
  const config = reportConfigs[req.params.type];
  if (!config) return res.status(404).json({ message: 'Report type not found' });

  const data = await config.fetch();
  res.json({ title: config.title, columns: config.columns, data });
});

router.get('/:type/download/:format', protect, async (req, res) => {
  const { type, format } = req.params;
  const config = reportConfigs[type];
  if (!config) return res.status(404).json({ message: 'Report type not found' });

  const data = await config.fetch();

  if (format === 'pdf') {
    const buffer = await generatePDF(config.title, config.columns, data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
    return res.send(buffer);
  }

  if (format === 'excel') {
    const buffer = await generateExcel(config.title, config.columns, data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.xlsx"`);
    return res.send(buffer);
  }

  res.status(400).json({ message: 'Format must be pdf or excel' });
});

export default router;
