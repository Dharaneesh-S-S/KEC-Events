import express from 'express';
import auth from '../middleware/auth.js';
import { 
  getNotifications, 
  getNotificationById, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  createNotification,
  getNotificationStats
} from '../controller/notificationController.js';

const router = express.Router();

// All notification routes require authentication
router.use(auth);

// Notification management
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.get('/user', getUserNotifications);
router.get('/:id', getNotificationById);
router.post('/', createNotification);
router.put('/:id/read', markNotificationAsRead);
router.put('/read-all', markAllNotificationsAsRead);
router.delete('/:id', deleteNotification);

export default router;











