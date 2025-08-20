import mongoose from 'mongoose';



const venueSchema = new mongoose.Schema({
  // Basic venue information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  venueType: {
    type: String,
    enum: ['cc', 'seminar', 'maharaja', 'convention', 'other'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  department: {
    type: String, // e.g., 'CSE', 'ECE', 'IT PARK', 'Maharaja Hall'
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  
  // Venue management
  facultyInCharge: {
    type: String,
    required: true,
  },
  facultyContact: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]+$/.test(v);
      },
      message: 'Invalid contact number format'
    }
  },
  labAssistant: {
    type: String,
    default: '',
  },
  labAssistantContact: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]+$/.test(v);
      },
      message: 'Invalid contact number format'
    }
  },
  
  // Venue features and logistics
  features: {
    type: [String], // e.g., ['Projector', 'AC', 'WiFi', 'Stage', 'Sound System']
    default: [],
  },
  availableLogistics: {
    projector: { type: Boolean, default: false },
    mic: { type: Boolean, default: false },
    speakers: { type: Boolean, default: false },
    whiteboard: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    stage: { type: Boolean, default: false },
    soundSystem: { type: Boolean, default: false },
    stageLighting: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
  },
  
  // CC-specific features
  computerSpecs: {
    totalComputers: { type: Number, default: 0 },
    ram: { type: String, default: '' }, // e.g., '8GB', '16GB'
    processor: { type: String, default: '' }, // e.g., 'Intel i5', 'AMD Ryzen'
    storage: { type: String, default: '' }, // e.g., '256GB SSD', '1TB HDD'
    installedSoftware: { type: [String], default: [] }, // e.g., ['VS Code', 'Eclipse', 'MATLAB']
  },
  
  // Availability and scheduling
  availability: {
    isActive: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceStartDate: { type: Date, default: null },
    maintenanceEndDate: { type: Date, default: null },
    maintenanceReason: { type: String, default: '' },
  },
  
  // Operating hours
  operatingHours: {
    monday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' } },
    tuesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' } },
    wednesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' } },
    thursday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' } },
    friday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' } },
    saturday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' } },
    sunday: { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' } },
  },
  
  // Booking rules and restrictions
  bookingRules: {
    maxAdvanceBookingDays: { type: Number, default: 30 },
    minAdvanceBookingHours: { type: Number, default: 24 },
    maxBookingDurationHours: { type: Number, default: 8 },
    allowWeekendBookings: { type: Boolean, default: true },
    requireFacultyApproval: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: null }, // null means use venue capacity
  },
  
  // Images and media
  images: {
    type: [String], // URLs to venue images
    default: [],
  },
  thumbnail: {
    type: String, // URL to main venue image
    default: '',
  },
  
  // Additional information
  description: {
    type: String,
    default: '',
  },
  specialInstructions: {
    type: String,
    default: '',
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
venueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
venueSchema.index({ venueType: 1 });
venueSchema.index({ department: 1 });
venueSchema.index({ 'availability.isActive': 1 });
venueSchema.index({ name: 1 });

// Virtual for full venue name
venueSchema.virtual('fullName').get(function() {
  return `${this.name} - ${this.department}`;
});

// Method to check if venue is available for a given time slot
venueSchema.methods.isAvailableForSlot = function(fromDate, toDate, fromTime, toTime) {
  if (!this.availability.isActive) return false;
  if (this.availability.maintenanceMode) return false;
  
  // Check if the booking is within operating hours
  const dayOfWeek = fromDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const operatingHours = this.operatingHours[dayOfWeek];
  
  if (fromTime < operatingHours.start || toTime > operatingHours.end) {
    return false;
  }
  
  return true;
};

// Method to get venue capacity for booking
venueSchema.methods.getBookingCapacity = function() {
  return this.bookingRules.maxParticipants || this.capacity;
};

const Venue = mongoose.model('Venue', venueSchema);
export default Venue;
