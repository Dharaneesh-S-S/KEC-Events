// routes/analyticsRoutes.js
import express from 'express';
import {
  getClubAnalytics,
  getEventAnalytics,
  getParticipationTrends,
  getFormAnalytics
} from '../controllers/analyticsController.js';
import { protect, clubOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require club ownership
router.get('/club/:clubId', protect, getClubAnalytics);
router.get('/event/:eventId', protect, getEventAnalytics);
router.get('/participation-trends/:clubId', protect, getParticipationTrends);
router.get('/form-responses/:clubId', protect, getFormAnalytics);

export default router;