import express from 'express';
import { signup, login, verify } from '../controller/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify', verify);

export default router;

