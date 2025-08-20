import express from 'express';
import auth from '../middleware/auth.js';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent, validateVenueBookingForEvent } from '../controller/eventController.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

// New route for venue booking validation
router.post('/validate-venue-booking', auth, validateVenueBookingForEvent);

export default router;

