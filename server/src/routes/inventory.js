import express from 'express';
import Product from '../models/Product.js';
import Seller from '../models/Seller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const products = await Product.find({ isActive: true }).sort({ name: 1 });
  res.json(products);
});

router.get('/alerts', protect, async (req, res) => {
  const lowStock = await Product.find({
    isActive: true,
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
  });
  res.json(lowStock);
});

router.get('/:id', protect, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

router.post('/', protect, async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

router.put('/:id', protect, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

router.delete('/:id', protect, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deactivated' });
});

router.post('/assign', protect, async (req, res) => {
  const { sellerId, productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product || product.quantity < quantity) {
    return res.status(400).json({ message: 'Insufficient inventory' });
  }

  product.quantity -= quantity;
  await product.save();

  const seller = await Seller.findById(sellerId);
  const existing = seller.assignedProducts.find(p => p.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    seller.assignedProducts.push({ product: productId, quantity });
  }
  seller.currentStock += quantity;
  if (seller.currentStock < 20) seller.status = 'low_stock';
  else if (seller.status === 'low_stock') seller.status = 'active';
  await seller.save();

  res.json({ message: 'Stock assigned', seller, product });
});

export default router;
