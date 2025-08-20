import express from 'express';
import auth from '../middleware/auth.js';
import { 
  getVenueAvailability, 
  checkVenueAvailability, 
  createAvailabilitySlot, 
  updateAvailabilitySlot, 
  deleteAvailabilitySlot,
  bulkCreateAvailability,
  getAvailabilityStats,
  getAvailableVenuesForSlot
} from '../controller/availabilityController.js';

const router = express.Router();

// All availability routes require authentication
router.use(auth);

// Availability management
router.get('/', getVenueAvailability);
router.get('/stats', getAvailabilityStats);
router.get('/available-venues', getAvailableVenuesForSlot);
router.post('/check', checkVenueAvailability);
router.post('/', createAvailabilitySlot);
router.post('/bulk', bulkCreateAvailability);
router.put('/:id', updateAvailabilitySlot);
router.delete('/:id', deleteAvailabilitySlot);

export default router;








