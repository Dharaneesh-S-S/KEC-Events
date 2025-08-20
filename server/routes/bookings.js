import express from 'express';
import auth from '../middleware/auth.js';
import { 
  createBooking, 
  getBookings, 
  getBookingById, 
  updateBookingStatus, 
  deleteBooking,
  getBookingStats,
  getUserBookings,
  getBookingsByClub
} from '../controller/bookingController.js';

const router = express.Router();

// All booking routes require authentication
router.use(auth);

// Booking management
router.get('/', getBookings);
router.get('/user', getUserBookings);
router.get('/stats', getBookingStats);
router.get('/club/:clubId', getBookingsByClub);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;

