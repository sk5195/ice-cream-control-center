import express from 'express';
import {
  getFlavorIntelligence,
  getDemandPredictions,
  getCustomerDemandPatterns
} from '../services/aiService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/flavor-intelligence', protect, async (req, res) => {
  const intelligence = await getFlavorIntelligence();
  const patterns = await getCustomerDemandPatterns();
  res.json({ intelligence, patterns });
});

router.get('/predictions', protect, async (req, res) => {
  const predictions = await getDemandPredictions();
  res.json(predictions);
});

export default router;
