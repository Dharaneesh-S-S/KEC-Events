// models/VenueAvailability.js
import mongoose from 'mongoose';

const venueAvailabilitySchema = new mongoose.Schema({
  // Venue reference
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  
  // Date and time slot
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // HH:MM format
    required: true,
  },
  endTime: {
    type: String, // HH:MM format
    required: true,
  },
  
  // Availability status
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance', 'blocked', 'tentative'],
    default: 'available',
  },
  
  // Booking reference (if booked)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
  
  // Blocking information (for maintenance, events, etc.)
  blockingInfo: {
    reason: { type: String, default: '' },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    blockingType: { 
      type: String, 
      enum: ['maintenance', 'event', 'holiday', 'emergency', 'other'],
      default: 'other'
    },
    description: { type: String, default: '' },
  },
  
  // Tentative booking information
  tentativeBooking: {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    requestedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    eventName: { type: String, default: '' },
    participants: { type: Number, default: 0 },
  },
  
  // Recurring availability (for regular schedules)
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    dayOfWeek: { type: Number, default: null }, // 0-6 for weekly
    dayOfMonth: { type: Number, default: null }, // 1-31 for monthly
    endDate: { type: Date, default: null },
    exceptions: [{ type: Date }], // Dates where recurring pattern doesn't apply
  },
  
  // Capacity and usage tracking
  capacity: {
    totalCapacity: { type: Number, default: 0 },
    bookedCapacity: { type: Number, default: 0 },
    availableCapacity: { type: Number, default: 0 },
    overbooked: { type: Boolean, default: false },
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
venueAvailabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for efficient queries
venueAvailabilitySchema.index({ venue: 1, date: 1, startTime: 1, endTime: 1 });
venueAvailabilitySchema.index({ status: 1, date: 1 });
venueAvailabilitySchema.index({ booking: 1 });
venueAvailabilitySchema.index({ 'tentativeBooking.expiresAt': 1 });

// Method to check if time slot overlaps with this availability
venueAvailabilitySchema.methods.hasTimeOverlap = function(startTime, endTime) {
  const thisStart = this.startTime;
  const thisEnd = this.endTime;
  
  // Check if the time ranges overlap
  return !(endTime <= thisStart || startTime >= thisEnd);
};

// Method to check if date and time slot overlaps
venueAvailabilitySchema.methods.hasDateTimeOverlap = function(date, startTime, endTime) {
  // Check if dates are the same
  const thisDate = new Date(this.date).toDateString();
  const checkDate = new Date(date).toDateString();
  
  if (thisDate !== checkDate) return false;
  
  // Check time overlap
  return this.hasTimeOverlap(startTime, endTime);
};

// Method to get availability status for a specific time slot
venueAvailabilitySchema.statics.getAvailabilityForSlot = async function(venueId, date, startTime, endTime) {
  const availabilities = await this.find({
    venue: venueId,
    date: date,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  }).populate('booking').populate('blockingInfo.blockedBy');
  
  return availabilities;
};

// Method to check if venue is available for booking
venueAvailabilitySchema.statics.isVenueAvailable = async function(venueId, date, startTime, endTime, excludeBookingId = null) {
  const query = {
    venue: venueId,
    date: date,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ],
    status: { $in: ['booked', 'maintenance', 'blocked'] }
  };
  
  if (excludeBookingId) {
    query.booking = { $ne: excludeBookingId };
  }
  
  const conflicts = await this.find(query);
  return conflicts.length === 0;
};

// Method to create availability slots for a date range
venueAvailabilitySchema.statics.createAvailabilitySlots = async function(venueId, startDate, endDate, operatingHours) {
  const slots = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const hours = operatingHours[dayOfWeek];
    
    if (hours && hours.start && hours.end) {
      slots.push({
        venue: venueId,
        date: new Date(currentDate),
        startTime: hours.start,
        endTime: hours.end,
        status: 'available',
        capacity: {
          totalCapacity: 0, // Will be set from venue
          bookedCapacity: 0,
          availableCapacity: 0,
          overbooked: false
        }
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return this.insertMany(slots);
};

// Method to update capacity for a time slot
venueAvailabilitySchema.methods.updateCapacity = function(totalCapacity, bookedCapacity) {
  this.capacity.totalCapacity = totalCapacity;
  this.capacity.bookedCapacity = bookedCapacity;
  this.capacity.availableCapacity = Math.max(0, totalCapacity - bookedCapacity);
  this.capacity.overbooked = bookedCapacity > totalCapacity;
};

const VenueAvailability = mongoose.model('VenueAvailability', venueAvailabilitySchema);
export default VenueAvailability;
