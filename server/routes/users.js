import express from 'express';
import auth from '../middleware/auth.js';
import { updateProfile } from '../controller/userController.js';

const router = express.Router();

router.put('/profile', auth, updateProfile);

export default router;

