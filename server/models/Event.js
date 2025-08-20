import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  venue: { type: String, required: true },
  posterLink: { type: String },
  teamSize: { type: String },
  eventDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  description: { type: String, required: true },
  rules: { type: [String], default: [] },
  category: { type: String, required: true },
  isFree: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  
  // Venue Booking Requirements
  venueBooking: {
    bookingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Booking', 
      required: true 
    },
    venueId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Venue', 
      required: true 
    },
    venueType: { 
      type: String, 
      enum: ['cc', 'seminar', 'maharaja', 'convention', 'other'], 
      required: true 
    },
    bookingDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // HH:MM format
    endTime: { type: String, required: true }, // HH:MM format
    expectedAttendees: { type: Number, required: true },
    department: { type: String, required: true },
    facultyInCharge: { type: String, required: true }
  },
  
  // Event Validation Status
  validationStatus: {
    venueBookingValid: { type: Boolean, default: false },
    capacityCheckPassed: { type: Boolean, default: false },
    logisticsConfirmed: { type: Boolean, default: false },
    departmentEligible: { type: Boolean, default: false },
    dateTimeValid: { type: Boolean, default: false },
    overallValid: { type: Boolean, default: false }
  },
  
  // Validation Details
  validationDetails: {
    capacityCheck: {
      venueCapacity: { type: Number },
      expectedAttendees: { type: Number },
      capacitySufficient: { type: Boolean, default: false },
      message: { type: String }
    },
    logisticsCheck: {
      requiredFacilities: [{ type: String }],
      availableFacilities: [{ type: String }],
      missingFacilities: [{ type: String }],
      logisticsConfirmed: { type: Boolean, default: false }
    },
    eligibilityCheck: {
      userDepartment: { type: String },
      venueDepartment: { type: String },
      isEligible: { type: Boolean, default: false },
      message: { type: String }
    },
    dateTimeCheck: {
      bookingDate: { type: Date },
      eventDate: { type: Date },
      isFuture: { type: Boolean, default: false },
      noOverlap: { type: Boolean, default: false },
      message: { type: String }
    }
  }
});

// Pre-save middleware to validate venue booking requirements
eventSchema.pre('save', async function(next) {
  try {
    // Only validate if this is a new event or venue booking has changed
    if (this.isNew || this.isModified('venueBooking.bookingId')) {
      await this.validateVenueBooking();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate venue booking requirements
eventSchema.methods.validateVenueBooking = async function() {
  const Booking = mongoose.model('Booking');
  const Venue = mongoose.model('Venue');
  
  try {
    // 1. Check if venue booking exists and is approved
    const booking = await Booking.findById(this.venueBooking.bookingId);
    if (!booking) {
      throw new Error('Venue booking not found');
    }
    
    if (booking.status !== 'approved') {
      throw new Error('Venue booking must be approved before creating event');
    }
    
    // 2. Validate date and time
    const now = new Date();
    const eventDate = new Date(this.eventDate);
    const bookingDate = new Date(this.venueBooking.bookingDate);
    
    if (eventDate <= now) {
      this.validationDetails.dateTimeCheck.isFuture = false;
      this.validationDetails.dateTimeCheck.message = 'Event date must be in the future';
    } else {
      this.validationDetails.dateTimeCheck.isFuture = true;
    }
    
    // Check if event date matches booking date
    if (eventDate.toDateString() !== bookingDate.toDateString()) {
      this.validationDetails.dateTimeCheck.message = 'Event date must match venue booking date';
    } else {
      this.validationDetails.dateTimeCheck.noOverlap = true;
    }
    
    // 3. Check capacity
    const venue = await Venue.findById(this.venueBooking.venueId);
    if (!venue) {
      throw new Error('Venue not found');
    }
    
    this.validationDetails.capacityCheck.venueCapacity = venue.capacity;
    this.validationDetails.capacityCheck.expectedAttendees = this.venueBooking.expectedAttendees;
    this.validationDetails.capacityCheck.capacitySufficient = venue.capacity >= this.venueBooking.expectedAttendees;
    
    if (!this.validationDetails.capacityCheck.capacitySufficient) {
      this.validationDetails.capacityCheck.message = `Venue capacity (${venue.capacity}) is insufficient for expected attendees (${this.venueBooking.expectedAttendees})`;
    }
    
    // 4. Check department eligibility
    this.validationDetails.eligibilityCheck.userDepartment = this.venueBooking.department;
    this.validationDetails.eligibilityCheck.venueDepartment = venue.department;
    
    // Check if user's department can access this venue
    // This could be enhanced with more complex rules
    this.validationDetails.eligibilityCheck.isEligible = true; // Simplified for now
    
    // 5. Check logistics
    const requiredLogistics = ['projector', 'mic', 'speakers']; // Default required facilities
    const availableLogistics = [];
    
    if (venue.availableLogistics.projector) availableLogistics.push('projector');
    if (venue.availableLogistics.mic) availableLogistics.push('mic');
    if (venue.availableLogistics.speakers) availableLogistics.push('speakers');
    
    this.validationDetails.logisticsCheck.requiredFacilities = requiredLogistics;
    this.validationDetails.logisticsCheck.availableFacilities = availableLogistics;
    this.validationDetails.logisticsCheck.missingFacilities = requiredLogistics.filter(
      facility => !availableLogistics.includes(facility)
    );
    
    this.validationDetails.logisticsCheck.logisticsConfirmed = 
      this.validationDetails.logisticsCheck.missingFacilities.length === 0;
    
    // 6. Update overall validation status
    this.validationStatus.venueBookingValid = true;
    this.validationStatus.capacityCheckPassed = this.validationDetails.capacityCheck.capacitySufficient;
    this.validationStatus.logisticsConfirmed = this.validationDetails.logisticsCheck.logisticsConfirmed;
    this.validationStatus.departmentEligible = this.validationDetails.eligibilityCheck.isEligible;
    this.validationStatus.dateTimeValid = this.validationDetails.dateTimeCheck.isFuture && 
                                         this.validationDetails.dateTimeCheck.noOverlap;
    
    this.validationStatus.overallValid = 
      this.validationStatus.venueBookingValid &&
      this.validationStatus.capacityCheckPassed &&
      this.validationStatus.logisticsConfirmed &&
      this.validationStatus.departmentEligible &&
      this.validationStatus.dateTimeValid;
    
    // 7. If validation fails, throw error
    if (!this.validationStatus.overallValid) {
      const errors = [];
      if (!this.validationStatus.capacityCheckPassed) errors.push('Capacity check failed');
      if (!this.validationStatus.logisticsConfirmed) errors.push('Required logistics not available');
      if (!this.validationStatus.dateTimeValid) errors.push('Date/time validation failed');
      
      throw new Error(`Event validation failed: ${errors.join(', ')}`);
    }
    
  } catch (error) {
    throw new Error(`Venue booking validation failed: ${error.message}`);
  }
};

// Method to get validation summary
eventSchema.methods.getValidationSummary = function() {
  return {
    isValid: this.validationStatus.overallValid,
    status: this.validationStatus,
    details: this.validationDetails,
    canCreate: this.validationStatus.overallValid
  };
};

const Event = mongoose.model('Event', eventSchema);
export default Event;

