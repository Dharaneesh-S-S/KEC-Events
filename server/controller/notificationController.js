import VenueBookingNotification from '../models/VenueBookingNotification.js';
import User from '../models/User.js';

export const getNotifications = async (req, res) => {
  try {
    const { 
      userId, 
      notificationType, 
      deliveryStatus, 
      priority, 
      category, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const filter = {};
    if (userId) filter['recipients.user'] = userId;
    if (notificationType) filter.notificationType = notificationType;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    
    const skip = (page - 1) * limit;
    
    const notifications = await VenueBookingNotification.find(filter)
      .populate('booking', 'eventName fromDate toDate')
      .populate('venue', 'name venueType')
      .populate('recipients.user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await VenueBookingNotification.countDocuments(filter);
    
    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await VenueBookingNotification.findById(req.params.id)
      .populate('booking', 'eventName fromDate toDate')
      .populate('venue', 'name venueType')
      .populate('recipients.user', 'name email role');
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notification', error: err.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false, page = 1, limit = 20 } = req.query;
    
    const filter = { 'recipients.user': userId };
    if (unreadOnly === 'true') {
      filter['recipients.readAt'] = null;
    }
    
    const skip = (page - 1) * limit;
    
    const notifications = await VenueBookingNotification.find(filter)
      .populate('booking', 'eventName fromDate toDate')
      .populate('venue', 'name venueType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await VenueBookingNotification.countDocuments(filter);
    const unreadCount = await VenueBookingNotification.countDocuments({
      'recipients.user': userId,
      'recipients.readAt': null
    });
    
    res.json({
      notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user notifications', error: err.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await VenueBookingNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Mark as read for this user
    const recipient = notification.recipients.find(r => r.user.toString() === userId);
    if (recipient) {
      recipient.readAt = new Date();
      await notification.save();
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: err.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await VenueBookingNotification.updateMany(
      { 'recipients.user': userId, 'recipients.readAt': null },
      { $set: { 'recipients.$.readAt': new Date() } }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications as read', error: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await VenueBookingNotification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification', error: err.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const notificationData = req.body;
    
    const notification = await VenueBookingNotification.create(notificationData);
    
    // Populate related data for response
    await notification.populate('booking venue');
    await notification.populate('recipients.user', 'name email role');
    
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Notification creation failed', error: err.message });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    const { userId, fromDate, toDate } = req.query;
    
    const filter = {};
    if (userId) filter['recipients.user'] = userId;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    
    const stats = await VenueBookingNotification.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$notificationType',
          count: { $sum: 1 },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$deliveryStatus', 'delivered'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$deliveryStatus', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const totalNotifications = await VenueBookingNotification.countDocuments(filter);
    const unreadCount = await VenueBookingNotification.countDocuments({
      ...filter,
      'recipients.readAt': null
    });
    
    res.json({
      totalNotifications,
      unreadCount,
      byType: stats
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notification statistics', error: err.message });
  }
};











