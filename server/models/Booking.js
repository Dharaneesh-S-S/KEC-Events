// models/Booking.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Basic booking information
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  venueType: {
    type: String,
    enum: ['cc', 'seminar', 'maharaja', 'convention', 'other'],
    required: true,
  },
  bookedBy: {
    type: String, // Club/Dept name or student email/ID
    required: true,
  },
  
  // Date and time information
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  fromTime: {
    type: String, // 'HH:MM' format
    required: true,
  },
  toTime: {
    type: String, // 'HH:MM' format
    required: true,
  },
  
  // Contact and organizer information
  facultyInCharge: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be 10 digits'
    }
  },
  
  // Event details
  eventName: {
    type: String,
    required: true,
  },
  participants: {
    type: Number,
    required: true,
    min: 1,
  },
  
  // CC-specific fields
  softwareRequirement: {
    type: String,
    enum: ['Visual Studio Code', 'IntelliJ IDEA', 'Eclipse', 'PyCharm', 'MATLAB', 'AutoCAD', 'Photoshop', 'Other', ''],
    default: '',
  },
  eventType: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Competition', 'Training', 'Examination', 'Project Work', 'Other', ''],
    default: '',
  },
  
  // Seminar Hall and Maharaja Hall specific fields
  functionName: {
    type: String,
    default: '',
  },
  functionDate: {
    type: Date,
    default: null,
  },
  chiefGuest: {
    type: String,
    default: '',
  },
  totalAudience: {
    type: Number,
    default: 0,
  },
  
  // Logistics and requirements
  logistics: {
    // General logistics
    mic: { type: Boolean, default: false },
    speakers: { type: Boolean, default: false },
    projector: { type: Boolean, default: false },
    whiteboard: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    
    // Seminar Hall specific
    airConditioning: { type: String, enum: ['Yes', 'No'], default: 'No' },
    electricalLighting: { type: String, enum: ['Yes', 'No'], default: 'No' },
    stageLightings: { type: String, enum: ['Yes', 'No'], default: 'No' },
    houseKeeping: { type: String, enum: ['Yes', 'No'], default: 'No' },
    audioWork: { type: String, enum: ['Yes', 'No'], default: 'No' },
    
    // Additional notes
    additionalNotes: { type: String, default: '' }
  },
  
  // Alternatives for booking
  alternatives: [{
    date: { type: Date, required: true },
    session: { type: String, required: true }, // 'Morning', 'Afternoon', 'Evening'
    sessionName: { type: String, required: true },
    facultyInCharge: { type: String, required: true },
  }],
  
  // Booking status and workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
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
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
bookingSchema.index({ venue: 1, fromDate: 1, toDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookedBy: 1 });
bookingSchema.index({ facultyInCharge: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
