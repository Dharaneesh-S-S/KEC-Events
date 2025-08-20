import express from 'express';
import auth from '../middleware/auth.js'; // Assuming auth middleware exists
import { 
  getVenues, 
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  checkAvailability,
  updateVenueAvailability
} from '../controller/venueController.js';

const router = express.Router();

// Public routes
router.get('/', getVenues);
router.get('/:id', getVenueById);
router.post('/check-availability', checkAvailability);

// Admin routes (assuming auth middleware and admin checks)
router.post('/', auth, createVenue);
router.put('/:id', auth, updateVenue);
router.delete('/:id', auth, deleteVenue);
router.patch('/:id/availability', auth, updateVenueAvailability);

export default router;
