// server/routes/admin.js
import express from 'express';
import { 
  getAdminStats, 
  getAllClubs, 
  createClub, 
  updateClub, 
  deleteClub, 
  getClubById,
  getDepartments
} from '../controller/adminController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(verifyAdmin);

// Admin dashboard statistics
router.get('/stats', getAdminStats);

// Club management routes
router.get('/clubs', getAllClubs);
router.post('/clubs', createClub);
router.get('/clubs/:id', getClubById);
router.put('/clubs/:id', updateClub);
router.delete('/clubs/:id', deleteClub);

// Department management
router.get('/departments', getDepartments);

export default router;
