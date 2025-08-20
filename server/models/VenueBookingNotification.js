// models/VenueBookingNotification.js
import mongoose from 'mongoose';

const venueBookingNotificationSchema = new mongoose.Schema({
  // Notification identification
  notificationType: {
    type: String,
    enum: [
      'booking_created',
      'booking_approved',
      'booking_rejected',
      'booking_cancelled',
      'booking_modified',
      'reminder_before_event',
      'reminder_day_of_event',
      'maintenance_scheduled',
      'venue_blocked',
      'approval_required',
      'approval_expiring',
      'conflict_detected',
      'capacity_exceeded',
      'rule_violation'
    ],
    required: true,
  },
  
  // Related entities
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  
  // Recipients
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin', 'lab_assistant', 'hod'],
      required: true,
    },
    notificationMethod: {
      type: String,
      enum: ['email', 'sms', 'in_app', 'all'],
      default: 'in_app',
    },
    readAt: {
      type: Date,
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    }
  }],
  
  // Notification content
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  shortMessage: {
    type: String,
    default: '',
  },
  
  // Notification metadata
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  category: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'reminder'],
    default: 'info',
  },
  
  // Scheduling and delivery
  scheduledFor: {
    type: Date,
    default: Date.now,
  },
  sentAt: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  
  // Delivery status
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending',
  },
  deliveryAttempts: {
    type: Number,
    default: 0,
  },
  maxDeliveryAttempts: {
    type: Number,
    default: 3,
  },
  
  // Email specific fields
  emailData: {
    subject: { type: String, default: '' },
    htmlContent: { type: String, default: '' },
    textContent: { type: String, default: '' },
    attachments: [{ type: String }], // File paths or URLs
    templateId: { type: String, default: '' },
    templateData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  
  // SMS specific fields
  smsData: {
    message: { type: String, default: '' },
    sender: { type: String, default: 'KEC-Events' },
    priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
  },
  
  // In-app notification specific fields
  inAppData: {
    icon: { type: String, default: '' },
    actionUrl: { type: String, default: '' },
    actionText: { type: String, default: '' },
    badge: { type: Number, default: 1 },
    sound: { type: String, default: '' },
  },
  
  // Notification rules and triggers
  triggerConditions: {
    eventDate: { type: Date, default: null },
    hoursBeforeEvent: { type: Number, default: null },
    daysBeforeEvent: { type: Number, default: null },
    onStatusChange: { type: String, default: '' },
    onTimeSlot: { type: String, default: '' }, // HH:MM format
  },
  
  // Recurring notifications
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    frequency: { type: String, enum: ['hourly', 'daily', 'weekly'], default: 'daily' },
    interval: { type: Number, default: 1 }, // Every X hours/days/weeks
    endDate: { type: Date, default: null },
    maxOccurrences: { type: Number, default: null },
  },
  
  // Notification grouping
  groupId: {
    type: String,
    default: null, // For grouping related notifications
  },
  parentNotification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VenueBookingNotification',
    default: null,
  },
  
  // Error handling
  errorLog: [{
    attempt: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    error: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
venueBookingNotificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
venueBookingNotificationSchema.index({ notificationType: 1, deliveryStatus: 1 });
venueBookingNotificationSchema.index({ booking: 1 });
venueBookingNotificationSchema.index({ venue: 1 });
venueBookingNotificationSchema.index({ 'recipients.user': 1, 'recipients.readAt': 1 });
venueBookingNotificationSchema.index({ scheduledFor: 1, deliveryStatus: 1 });
venueBookingNotificationSchema.index({ groupId: 1 });

// Method to mark notification as read for a specific user
venueBookingNotificationSchema.methods.markAsRead = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient) {
    recipient.readAt = new Date();
  }
};

// Method to mark notification as acknowledged for a specific user
venueBookingNotificationSchema.methods.markAsAcknowledged = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient) {
    recipient.acknowledgedAt = new Date();
  }
};

// Method to check if notification is read by all recipients
venueBookingNotificationSchema.methods.isReadByAll = function() {
  return this.recipients.every(r => r.readAt !== null);
};

// Method to get unread notifications for a user
venueBookingNotificationSchema.statics.getUnreadForUser = function(userId) {
  return this.find({
    'recipients.user': userId,
    'recipients.readAt': null,
    deliveryStatus: { $in: ['sent', 'delivered'] }
  }).populate('booking venue').sort({ createdAt: -1 });
};

// Method to create notification for booking status change
venueBookingNotificationSchema.statics.createBookingStatusNotification = function(booking, oldStatus, newStatus, recipients) {
  const notificationTypes = {
    'pending': 'booking_created',
    'approved': 'booking_approved',
    'rejected': 'booking_rejected',
    'cancelled': 'booking_cancelled'
  };
  
  const titles = {
    'booking_approved': 'Booking Approved',
    'booking_rejected': 'Booking Rejected',
    'booking_cancelled': 'Booking Cancelled',
    'booking_created': 'New Booking Request'
  };
  
  const messages = {
    'booking_approved': `Your booking for ${booking.eventName} has been approved.`,
    'booking_rejected': `Your booking for ${booking.eventName} has been rejected.`,
    'booking_cancelled': `Your booking for ${booking.eventName} has been cancelled.`,
    'booking_created': `New booking request for ${booking.eventName} requires your approval.`
  };
  
  return this.create({
    notificationType: notificationTypes[newStatus],
    booking: booking._id,
    venue: booking.venue,
    recipients: recipients.map(r => ({
      user: r.userId,
      role: r.role,
      notificationMethod: r.method || 'in_app'
    })),
    title: titles[notificationTypes[newStatus]],
    message: messages[notificationTypes[newStatus]],
    priority: newStatus === 'rejected' ? 'high' : 'normal',
    category: newStatus === 'approved' ? 'success' : newStatus === 'rejected' ? 'error' : 'info',
    scheduledFor: new Date(),
    deliveryStatus: 'pending'
  });
};

const VenueBookingNotification = mongoose.model('VenueBookingNotification', venueBookingNotificationSchema);
export default VenueBookingNotification;
