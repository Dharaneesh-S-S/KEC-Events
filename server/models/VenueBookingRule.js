// models/VenueBookingRule.js
import mongoose from 'mongoose';

const venueBookingRuleSchema = new mongoose.Schema({
  // Rule identification
  ruleName: {
    type: String,
    required: true,
    unique: true,
  },
  ruleType: {
    type: String,
    enum: ['global', 'venue_type', 'venue_specific', 'department', 'user_role'],
    required: true,
  },
  
  // Rule scope
  venueType: {
    type: String,
    enum: ['cc', 'seminar', 'maharaja', 'convention', 'other', 'all'],
    default: 'all',
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    default: null,
  },
  department: {
    type: String,
    default: null,
  },
  userRole: {
    type: String,
    enum: ['student', 'faculty', 'admin', 'club', 'all'],
    default: 'all',
  },
  
  // Booking time restrictions
  timeRestrictions: {
    maxAdvanceBookingDays: { type: Number, default: 30 },
    minAdvanceBookingHours: { type: Number, default: 24 },
    maxBookingDurationHours: { type: Number, default: 8 },
    minBookingDurationHours: { type: Number, default: 1 },
    allowWeekendBookings: { type: Boolean, default: true },
    allowHolidayBookings: { type: Boolean, default: false },
    blackoutDates: [{ type: Date }], // Dates when booking is not allowed
    blackoutTimeSlots: [{ // Time slots when booking is not allowed
      dayOfWeek: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      startTime: { type: String }, // HH:MM format
      endTime: { type: String }, // HH:MM format
      reason: { type: String, default: '' }
    }],
  },
  
  // Capacity and participant restrictions
  capacityRestrictions: {
    maxParticipants: { type: Number, default: null },
    minParticipants: { type: Number, default: 1 },
    requireExactParticipantCount: { type: Boolean, default: false },
    allowOverbooking: { type: Boolean, default: false },
    overbookingPercentage: { type: Number, default: 0 }, // Allow 10% overbooking
  },
  
  // Approval workflow
  approvalWorkflow: {
    requireFacultyApproval: { type: Boolean, default: true },
    requireAdminApproval: { type: Boolean, default: false },
    requireHODApproval: { type: Boolean, default: false },
    autoApproveForFaculty: { type: Boolean, default: false },
    autoApproveForAdmin: { type: Boolean, default: false },
    approvalTimeLimit: { type: Number, default: 48 }, // Hours to approve/reject
  },
  
  // Booking frequency and limits
  frequencyLimits: {
    maxBookingsPerUser: { type: Number, default: null }, // Per day/week/month
    maxBookingsPerUserPerDay: { type: Number, default: 2 },
    maxBookingsPerUserPerWeek: { type: Number, default: 5 },
    maxBookingsPerUserPerMonth: { type: Number, default: 20 },
    preventConcurrentBookings: { type: Boolean, default: true }, // Same user can't book multiple venues at same time
    cooldownPeriodHours: { type: Number, default: 0 }, // Hours between bookings
  },
  
  // Special requirements
  specialRequirements: {
    requireEventDescription: { type: Boolean, default: true },
    requireSoftwareList: { type: Boolean, default: false },
    requireLogisticsList: { type: Boolean, default: true },
    requireAlternatives: { type: Boolean, default: false },
    requireChiefGuestInfo: { type: Boolean, default: false },
    requireBudgetApproval: { type: Boolean, default: false },
  },
  
  // Notification settings
  notifications: {
    notifyFacultyOnBooking: { type: Boolean, default: true },
    notifyAdminOnBooking: { type: Boolean, default: false },
    notifyLabAssistantOnBooking: { type: Boolean, default: true },
    sendReminderBeforeEvent: { type: Boolean, default: true },
    reminderHoursBeforeEvent: { type: Number, default: 24 },
  },
  
  // Cancellation and modification rules
  cancellationRules: {
    allowCancellation: { type: Boolean, default: true },
    maxCancellationHoursBeforeEvent: { type: Number, default: 24 },
    allowModification: { type: Boolean, default: true },
    maxModificationHoursBeforeEvent: { type: Number, default: 48 },
    requireCancellationReason: { type: Boolean, default: true },
    cancellationPenalty: { type: String, enum: ['none', 'warning', 'temporary_ban', 'permanent_ban'], default: 'none' },
  },
  
  // Rule status and priority
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 1, // Higher number = higher priority
  },
  effectiveFrom: {
    type: Date,
    default: Date.now,
  },
  effectiveUntil: {
    type: Date,
    default: null, // null means no end date
  },
  
  // Rule description and metadata
  description: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
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
venueBookingRuleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
venueBookingRuleSchema.index({ ruleType: 1, venueType: 1 });
venueBookingRuleSchema.index({ venueId: 1 });
venueBookingRuleSchema.index({ department: 1 });
venueBookingRuleSchema.index({ userRole: 1 });
venueBookingRuleSchema.index({ isActive: 1, priority: -1 });

// Method to check if rule is currently effective
venueBookingRuleSchema.methods.isEffective = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (now < this.effectiveFrom) return false;
  if (this.effectiveUntil && now > this.effectiveUntil) return false;
  
  return true;
};

// Method to check if rule applies to a specific booking
venueBookingRuleSchema.methods.appliesToBooking = function(booking, venue, user) {
  if (!this.isEffective()) return false;
  
  // Check venue type
  if (this.venueType !== 'all' && this.venueType !== venue.venueType) return false;
  
  // Check specific venue
  if (this.venueId && this.venueId.toString() !== venue._id.toString()) return false;
  
  // Check department
  if (this.department && this.department !== venue.department) return false;
  
  // Check user role
  if (this.userRole !== 'all' && this.userRole !== user.role) return false;
  
  return true;
};

const VenueBookingRule = mongoose.model('VenueBookingRule', venueBookingRuleSchema);
export default VenueBookingRule;
