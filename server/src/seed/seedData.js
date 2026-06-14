import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Area from '../models/Area.js';
import Wastage from '../models/Wastage.js';
import RefrigeratorReport from '../models/RefrigeratorReport.js';

dotenv.config();

const AREAS = [
  { name: 'Downtown', center: { lat: 12.9716, lng: 77.5946 }, demandLevel: 'hot' },
  { name: 'Koramangala', center: { lat: 12.9352, lng: 77.6245 }, demandLevel: 'hot' },
  { name: 'Indiranagar', center: { lat: 12.9784, lng: 77.6408 }, demandLevel: 'normal' },
  { name: 'Whitefield', center: { lat: 12.9698, lng: 77.7500 }, demandLevel: 'normal' },
  { name: 'Jayanagar', center: { lat: 12.9308, lng: 77.5838 }, demandLevel: 'hot' },
  { name: 'Malleshwaram', center: { lat: 13.0035, lng: 77.5640 }, demandLevel: 'cold' },
  { name: 'HSR Layout', center: { lat: 12.9116, lng: 77.6389 }, demandLevel: 'normal' },
  { name: 'Electronic City', center: { lat: 12.8456, lng: 77.6603 }, demandLevel: 'cold' }
];

const FLAVORS = ['Chocolate', 'Vanilla', 'Mango', 'Strawberry', 'Butterscotch', 'Pista', 'Kulfi'];
const SELLER_NAMES = [
  'Rahul Kumar', 'Priya Sharma', 'Arjun Patel', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Iyer', 'Karthik Nair', 'Divya Menon', 'Rohan Das', 'Meera Joshi',
  'Aditya Rao', 'Kavya Pillai', 'Suresh Babu', 'Lakshmi Devi', 'Naveen Gowda'
];

const STATUSES = ['active', 'active', 'active', 'active', 'low_stock', 'issue'];

async function runSeed({ disconnect = false } = {}) {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('Database already seeded, skipping...');
    if (disconnect) {
      await mongoose.disconnect();
      process.exit(0);
    }
    return;
  }

  console.log('Seeding database...');
  await User.create([
    { name: 'Super Admin', email: 'admin@icecream.com', password: 'admin123', role: 'super_admin' },
    { name: 'Operations Manager', email: 'manager@icecream.com', password: 'manager123', role: 'manager' },
    { name: 'Regional Admin', email: 'regional@icecream.com', password: 'regional123', role: 'admin' }
  ]);

  console.log('Creating products...');
  const products = await Product.insertMany(
    FLAVORS.map((flavor, i) => ({
      name: `${flavor} Ice Cream`,
      flavor,
      price: 30 + (i * 5),
      quantity: 200 + Math.floor(Math.random() * 300),
      expiryDate: new Date(Date.now() + (30 + i * 5) * 24 * 60 * 60 * 1000),
      lowStockThreshold: 25
    }))
  );

  console.log('Creating areas...');
  const areas = await Area.insertMany(AREAS.map(a => ({
    ...a,
    totalSales: 0,
    totalRevenue: 0,
    activeSellers: 0
  })));

  console.log('Creating sellers...');
  const sellers = [];
  for (let i = 0; i < SELLER_NAMES.length; i++) {
    const area = AREAS[i % AREAS.length];
    const status = STATUSES[i % STATUSES.length];
    const stock = status === 'low_stock' ? 8 + Math.floor(Math.random() * 10) : 40 + Math.floor(Math.random() * 60);

    const seller = await Seller.create({
      name: SELLER_NAMES[i],
      phone: `+91 98${String(10000000 + i).slice(0, 8)}`,
      email: `${SELLER_NAMES[i].split(' ')[0].toLowerCase()}@seller.com`,
      area: area.name,
      status,
      location: {
        lat: area.center.lat + (Math.random() - 0.5) * 0.02,
        lng: area.center.lng + (Math.random() - 0.5) * 0.02
      },
      currentStock: stock,
      salesToday: Math.floor(Math.random() * 50),
      revenueToday: Math.floor(Math.random() * 2000),
      workingHours: { start: '09:00', end: '18:00' },
      assignedProducts: products.slice(0, 3).map(p => ({
        product: p._id,
        quantity: Math.floor(stock / 3)
      }))
    });
    sellers.push(seller);
  }

  console.log('Generating sales history...');
  const sales = [];
  const now = Date.now();
  for (let day = 0; day < 30; day++) {
    const dayDate = new Date(now - day * 24 * 60 * 60 * 1000);
    const salesCount = 30 + Math.floor(Math.random() * 50);

    for (let s = 0; s < salesCount; s++) {
      const seller = sellers[Math.floor(Math.random() * sellers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = 1 + Math.floor(Math.random() * 5);
      const soldAt = new Date(dayDate);
      soldAt.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

      sales.push({
        seller: seller._id,
        product: product._id,
        area: seller.area,
        flavor: product.flavor,
        quantity: qty,
        unitPrice: product.price,
        revenue: qty * product.price,
        location: seller.location,
        soldAt
      });
    }
  }
  await Sale.insertMany(sales);

  console.log('Updating area stats...');
  for (const area of areas) {
    const areaSales = await Sale.aggregate([
      { $match: { area: area.name } },
      { $group: { _id: null, total: { $sum: '$quantity' }, revenue: { $sum: '$revenue' } } }
    ]);
    const sellerCount = sellers.filter(s => s.area === area.name).length;
    const stats = areaSales[0] || { total: 0, revenue: 0 };

    const maxSales = 500;
    let demandLevel = 'cold';
    if (stats.total > maxSales * 0.7) demandLevel = 'hot';
    else if (stats.total > maxSales * 0.35) demandLevel = 'normal';

    await Area.findByIdAndUpdate(area._id, {
      totalSales: stats.total,
      totalRevenue: stats.revenue,
      activeSellers: sellerCount,
      demandLevel
    });
  }

  console.log('Creating wastage records...');
  const wastageReasons = ['melted', 'expired', 'damaged', 'unsold', 'cooling_failure'];
  await Wastage.insertMany(
    Array.from({ length: 20 }, (_, i) => {
      const seller = sellers[i % sellers.length];
      const product = products[i % products.length];
      const qty = 1 + Math.floor(Math.random() * 8);
      return {
        seller: seller._id,
        product: product._id,
        area: seller.area,
        flavor: product.flavor,
        quantity: qty,
        reason: wastageReasons[i % wastageReasons.length],
        estimatedLoss: qty * product.price,
        reportedAt: new Date(now - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)
      };
    })
  );

  console.log('Creating refrigerator reports...');
  const coolingStatuses = ['ok', 'ok', 'ok', 'warning', 'failed'];
  const conditions = ['good', 'good', 'soft', 'melted', 'damaged'];
  await RefrigeratorReport.insertMany(
    sellers.slice(0, 10).map((seller, i) => ({
      seller: seller._id,
      coolingStatus: coolingStatuses[i % coolingStatuses.length],
      iceCreamCondition: conditions[i % conditions.length],
      photos: [],
      notes: i % 3 === 0 ? 'Regular check completed' : '',
      aiAnalysis: {
        meltedProbability: conditions[i % conditions.length] === 'melted' ? 85 : conditions[i % conditions.length] === 'soft' ? 45 : 10,
        packagingDamage: conditions[i % conditions.length] === 'damaged',
        qualityScore: conditions[i % conditions.length] === 'good' ? 95 : 60,
        issues: conditions[i % conditions.length] !== 'good' ? ['Condition issue detected'] : [],
        recommendation: conditions[i % conditions.length] === 'good' ? 'Continue selling' : 'Inspect and replace stock'
      },
      status: coolingStatuses[i % coolingStatuses.length] === 'failed' ? 'flagged' : 'pending',
      submittedAt: new Date(now - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000)
    }))
  );

  console.log('\n✅ Seed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('  admin@icecream.com / admin123');
  console.log('  manager@icecream.com / manager123');
  console.log(`\n  ${sellers.length} sellers, ${products.length} products, ${sales.length} sales records`);

  if (disconnect) {
    await mongoose.disconnect();
    process.exit(0);
  }
}

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(), Seller.deleteMany(), Product.deleteMany(),
    Sale.deleteMany(), Area.deleteMany(), Wastage.deleteMany(),
    RefrigeratorReport.deleteMany()
  ]);

  await runSeed({ disconnect: true });
}

export { runSeed };

const isDirectRun = process.argv[1]?.includes('seedData');
if (isDirectRun) {
  seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
