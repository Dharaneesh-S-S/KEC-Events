import express from 'express';
import {
  getAdminStats,
  getStudents,
  toggleStudentAccess,
  getAdminClubs,
  deleteClubAdmin,
  createAdminUser
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/stats', protect, admin, getAdminStats);
router.get('/students', protect, admin, getStudents);
router.patch('/students/:id/access', protect, admin, toggleStudentAccess);
router.get('/clubs', protect, admin, getAdminClubs);
router.delete('/clubs/:id', protect, admin, deleteClubAdmin);

// Initial setup route (remove in production after setup)
router.post('/setup', createAdminUser);

export default router;