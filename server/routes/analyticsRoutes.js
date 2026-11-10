import express from 'express';
import {
  getDashboardSummary,
  getAnalyticsData,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/', getAnalyticsData);

export default router;

