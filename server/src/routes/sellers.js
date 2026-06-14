import express from 'express';
import Seller from '../models/Seller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const sellers = await Seller.find({ isActive: true })
    .populate('assignedProducts.product', 'name flavor price');
  res.json(sellers);
});

router.get('/:id', protect, async (req, res) => {
  const seller = await Seller.findById(req.params.id)
    .populate('assignedProducts.product', 'name flavor price quantity');
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  res.json(seller);
});

router.post('/', protect, async (req, res) => {
  const seller = await Seller.create(req.body);
  res.status(201).json(seller);
});

router.put('/:id', protect, async (req, res) => {
  const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  res.json(seller);
});

router.put('/:id/location', protect, async (req, res) => {
  const { lat, lng } = req.body;
  const seller = await Seller.findByIdAndUpdate(
    req.params.id,
    { location: { lat, lng }, lastLocationUpdate: new Date() },
    { new: true }
  );
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  res.json(seller);
});

router.delete('/:id', protect, async (req, res) => {
  const seller = await Seller.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  res.json({ message: 'Seller deactivated' });
});

export default router;
