import express from 'express';
import {
  createClub,
  getClubs,
  getClubById,
  getClubBySlug,
  updateClub,
  deleteClub,
  getMyClubs,
  addClubContact,
  updateClubContact,
  removeClubContact,
  addGalleryImage,
  removeGalleryImage
} from '../controllers/clubController.js';
import { protect, admin, clubOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/slug/:slug', getClubBySlug); 
router.get('/', getClubs);
router.get('/:id', getClubById);

// Protected routes
router.post('/', protect, createClub);
router.get('/my/clubs', protect, getMyClubs);

// Club owner or admin routes
router.route('/:id')
  .put(protect, clubOwner, updateClub)
  .delete(protect, clubOwner, deleteClub);

// Contact management
router.post('/:id/contacts', protect, clubOwner, addClubContact);
router.put('/:id/contacts/:contactId', protect, clubOwner, updateClubContact);
router.delete('/:id/contacts/:contactId', protect, clubOwner, removeClubContact);

// Gallery management
router.post('/:id/gallery', protect, clubOwner, addGalleryImage);
router.delete('/:id/gallery/:imageIndex', protect, clubOwner, removeGalleryImage);

// Admin only routes
router.delete('/admin/:id', protect, admin, deleteClub);

export default router;