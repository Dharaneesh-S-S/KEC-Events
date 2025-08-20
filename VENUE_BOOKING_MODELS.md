# Venue Booking Models Documentation

This document provides a comprehensive overview of the venue booking system models for the KEC Events application.

## Overview

The venue booking system consists of five main models that work together to provide a robust booking management solution:

1. **Booking** - Core booking entity
2. **Venue** - Venue information and configuration
3. **VenueAvailability** - Real-time availability tracking
4. **VenueBookingRule** - Booking rules and restrictions
5. **VenueBookingNotification** - Notification management

## Model Details

### 1. Booking Model (`server/models/Booking.js`)

The core booking entity that stores all booking information.

#### Key Features:
- **Multi-venue type support**: CC, Seminar Hall, Maharaja Hall, Convention Center
- **Comprehensive booking data**: Date, time, participants, logistics, etc.
- **Status tracking**: pending, approved, rejected, cancelled
- **Approval workflow**: Tracks who approved and when
- **Alternatives support**: Backup booking options
- **Validation**: Mobile number, date validation, etc.

#### Schema Fields:

```javascript
{
  // Basic booking information
  venue: ObjectId (ref: 'Venue'),
  venueType: String (enum: ['cc', 'seminar', 'maharaja', 'convention', 'other']),
  bookedBy: String,
  
  // Date and time
  fromDate: Date,
  toDate: Date,
  fromTime: String (HH:MM),
  toTime: String (HH:MM),
  
  // Contact and organizer
  facultyInCharge: String,
  department: String,
  mobileNumber: String (validated),
  
  // Event details
  eventName: String,
  participants: Number,
  
  // CC-specific fields
  softwareRequirement: String (enum),
  eventType: String (enum),
  
  // Seminar Hall specific fields
  functionName: String,
  functionDate: Date,
  chiefGuest: String,
  totalAudience: Number,
  
  // Logistics
  logistics: {
    mic: Boolean,
    speakers: Boolean,
    projector: Boolean,
    whiteboard: Boolean,
    ac: Boolean,
    airConditioning: String,
    electricalLighting: String,
    stageLightings: String,
    houseKeeping: String,
    audioWork: String,
    additionalNotes: String
  },
  
  // Alternatives
  alternatives: [{
    date: Date,
    session: String,
    sessionName: String,
    facultyInCharge: String
  }],
  
  // Status and workflow
  status: String (enum: ['pending', 'approved', 'rejected', 'cancelled']),
  approvedBy: ObjectId (ref: 'User'),
  approvedAt: Date,
  rejectionReason: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Venue Model (`server/models/Venue.js`)

Comprehensive venue information with type-specific configurations.

#### Key Features:
- **Venue type classification**: CC, Seminar Hall, etc.
- **Management information**: Faculty in-charge, lab assistants
- **Features and logistics**: Available equipment and facilities
- **Operating hours**: Configurable per day of week
- **Booking rules**: Venue-specific restrictions
- **Availability management**: Maintenance mode, active status
- **Computer specs**: For CC venues

#### Schema Fields:

```javascript
{
  // Basic information
  name: String,
  venueType: String (enum: ['cc', 'seminar', 'maharaja', 'convention', 'other']),
  location: String,
  department: String,
  capacity: Number,
  
  // Management
  facultyInCharge: String,
  facultyContact: String,
  labAssistant: String,
  labAssistantContact: String,
  
  // Features
  features: [String],
  availableLogistics: {
    projector: Boolean,
    mic: Boolean,
    speakers: Boolean,
    whiteboard: Boolean,
    ac: Boolean,
    stage: Boolean,
    soundSystem: Boolean,
    stageLighting: Boolean,
    wifi: Boolean
  },
  
  // CC-specific
  computerSpecs: {
    totalComputers: Number,
    ram: String,
    processor: String,
    storage: String,
    installedSoftware: [String]
  },
  
  // Availability
  availability: {
    isActive: Boolean,
    maintenanceMode: Boolean,
    maintenanceStartDate: Date,
    maintenanceEndDate: Date,
    maintenanceReason: String
  },
  
  // Operating hours
  operatingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    // ... other days
  },
  
  // Booking rules
  bookingRules: {
    maxAdvanceBookingDays: Number,
    minAdvanceBookingHours: Number,
    maxBookingDurationHours: Number,
    allowWeekendBookings: Boolean,
    requireFacultyApproval: Boolean,
    maxParticipants: Number
  },
  
  // Media
  images: [String],
  thumbnail: String,
  
  // Additional info
  description: String,
  specialInstructions: String
}
```

### 3. VenueAvailability Model (`server/models/VenueAvailability.js`)

Real-time availability tracking and conflict management.

#### Key Features:
- **Time slot management**: Granular availability tracking
- **Status tracking**: available, booked, maintenance, blocked, tentative
- **Conflict detection**: Prevents double bookings
- **Capacity tracking**: Real-time capacity management
- **Recurring patterns**: Support for regular schedules
- **Blocking management**: Maintenance, events, holidays

#### Schema Fields:

```javascript
{
  // Venue reference
  venue: ObjectId (ref: 'Venue'),
  
  // Time slot
  date: Date,
  startTime: String (HH:MM),
  endTime: String (HH:MM),
  
  // Status
  status: String (enum: ['available', 'booked', 'maintenance', 'blocked', 'tentative']),
  booking: ObjectId (ref: 'Booking'),
  
  // Blocking information
  blockingInfo: {
    reason: String,
    blockedBy: ObjectId (ref: 'User'),
    blockingType: String (enum: ['maintenance', 'event', 'holiday', 'emergency', 'other']),
    description: String
  },
  
  // Tentative bookings
  tentativeBooking: {
    requestedBy: ObjectId (ref: 'User'),
    requestedAt: Date,
    expiresAt: Date,
    eventName: String,
    participants: Number
  },
  
  // Recurring patterns
  isRecurring: Boolean,
  recurringPattern: {
    frequency: String (enum: ['daily', 'weekly', 'monthly']),
    dayOfWeek: Number,
    dayOfMonth: Number,
    endDate: Date,
    exceptions: [Date]
  },
  
  // Capacity
  capacity: {
    totalCapacity: Number,
    bookedCapacity: Number,
    availableCapacity: Number,
    overbooked: Boolean
  }
}
```

### 4. VenueBookingRule Model (`server/models/VenueBookingRule.js`)

Flexible booking rules and restrictions system.

#### Key Features:
- **Rule types**: Global, venue-type, venue-specific, department, user-role
- **Time restrictions**: Advance booking, duration limits, blackout dates
- **Capacity restrictions**: Participant limits, overbooking rules
- **Approval workflow**: Multi-level approval requirements
- **Frequency limits**: Per-user booking limits
- **Special requirements**: Event-specific requirements
- **Notification settings**: Automated notification rules
- **Cancellation rules**: Cancellation policies and penalties

#### Schema Fields:

```javascript
{
  // Rule identification
  ruleName: String,
  ruleType: String (enum: ['global', 'venue_type', 'venue_specific', 'department', 'user_role']),
  
  // Scope
  venueType: String (enum: ['cc', 'seminar', 'maharaja', 'convention', 'other', 'all']),
  venueId: ObjectId (ref: 'Venue'),
  department: String,
  userRole: String (enum: ['student', 'faculty', 'admin', 'club', 'all']),
  
  // Time restrictions
  timeRestrictions: {
    maxAdvanceBookingDays: Number,
    minAdvanceBookingHours: Number,
    maxBookingDurationHours: Number,
    minBookingDurationHours: Number,
    allowWeekendBookings: Boolean,
    allowHolidayBookings: Boolean,
    blackoutDates: [Date],
    blackoutTimeSlots: [{
      dayOfWeek: String,
      startTime: String,
      endTime: String,
      reason: String
    }]
  },
  
  // Capacity restrictions
  capacityRestrictions: {
    maxParticipants: Number,
    minParticipants: Number,
    requireExactParticipantCount: Boolean,
    allowOverbooking: Boolean,
    overbookingPercentage: Number
  },
  
  // Approval workflow
  approvalWorkflow: {
    requireFacultyApproval: Boolean,
    requireAdminApproval: Boolean,
    requireHODApproval: Boolean,
    autoApproveForFaculty: Boolean,
    autoApproveForAdmin: Boolean,
    approvalTimeLimit: Number
  },
  
  // Frequency limits
  frequencyLimits: {
    maxBookingsPerUserPerDay: Number,
    maxBookingsPerUserPerWeek: Number,
    maxBookingsPerUserPerMonth: Number,
    preventConcurrentBookings: Boolean,
    cooldownPeriodHours: Number
  },
  
  // Special requirements
  specialRequirements: {
    requireEventDescription: Boolean,
    requireSoftwareList: Boolean,
    requireLogisticsList: Boolean,
    requireAlternatives: Boolean,
    requireChiefGuestInfo: Boolean,
    requireBudgetApproval: Boolean
  },
  
  // Notifications
  notifications: {
    notifyFacultyOnBooking: Boolean,
    notifyAdminOnBooking: Boolean,
    notifyLabAssistantOnBooking: Boolean,
    sendReminderBeforeEvent: Boolean,
    reminderHoursBeforeEvent: Number
  },
  
  // Cancellation rules
  cancellationRules: {
    allowCancellation: Boolean,
    maxCancellationHoursBeforeEvent: Number,
    allowModification: Boolean,
    maxModificationHoursBeforeEvent: Number,
    requireCancellationReason: Boolean,
    cancellationPenalty: String (enum: ['none', 'warning', 'temporary_ban', 'permanent_ban'])
  },
  
  // Rule status
  isActive: Boolean,
  priority: Number,
  effectiveFrom: Date,
  effectiveUntil: Date,
  
  // Metadata
  description: String,
  createdBy: ObjectId (ref: 'User')
}
```

### 5. VenueBookingNotification Model (`server/models/VenueBookingNotification.js`)

Comprehensive notification management system.

#### Key Features:
- **Multiple notification types**: Booking status, reminders, maintenance, etc.
- **Multi-channel delivery**: Email, SMS, in-app notifications
- **Recipient management**: Role-based recipient targeting
- **Scheduling**: Delayed and recurring notifications
- **Delivery tracking**: Status, attempts, error logging
- **Template support**: Email templates with dynamic data
- **Grouping**: Related notification grouping

#### Schema Fields:

```javascript
{
  // Notification identification
  notificationType: String (enum: [
    'booking_created', 'booking_approved', 'booking_rejected', 'booking_cancelled',
    'booking_modified', 'reminder_before_event', 'reminder_day_of_event',
    'maintenance_scheduled', 'venue_blocked', 'approval_required',
    'approval_expiring', 'conflict_detected', 'capacity_exceeded', 'rule_violation'
  ]),
  
  // Related entities
  booking: ObjectId (ref: 'Booking'),
  venue: ObjectId (ref: 'Venue'),
  
  // Recipients
  recipients: [{
    user: ObjectId (ref: 'User'),
    role: String (enum: ['student', 'faculty', 'admin', 'lab_assistant', 'hod']),
    notificationMethod: String (enum: ['email', 'sms', 'in_app', 'all']),
    readAt: Date,
    acknowledgedAt: Date
  }],
  
  // Content
  title: String,
  message: String,
  shortMessage: String,
  
  // Metadata
  priority: String (enum: ['low', 'normal', 'high', 'urgent']),
  category: String (enum: ['info', 'success', 'warning', 'error', 'reminder']),
  
  // Scheduling
  scheduledFor: Date,
  sentAt: Date,
  deliveredAt: Date,
  
  // Delivery status
  deliveryStatus: String (enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled']),
  deliveryAttempts: Number,
  maxDeliveryAttempts: Number,
  
  // Channel-specific data
  emailData: {
    subject: String,
    htmlContent: String,
    textContent: String,
    attachments: [String],
    templateId: String,
    templateData: Object
  },
  
  smsData: {
    message: String,
    sender: String,
    priority: String
  },
  
  inAppData: {
    icon: String,
    actionUrl: String,
    actionText: String,
    badge: Number,
    sound: String
  },
  
  // Triggers
  triggerConditions: {
    eventDate: Date,
    hoursBeforeEvent: Number,
    daysBeforeEvent: Number,
    onStatusChange: String,
    onTimeSlot: String
  },
  
  // Recurring
  isRecurring: Boolean,
  recurringPattern: {
    frequency: String (enum: ['hourly', 'daily', 'weekly']),
    interval: Number,
    endDate: Date,
    maxOccurrences: Number
  },
  
  // Grouping
  groupId: String,
  parentNotification: ObjectId (ref: 'VenueBookingNotification'),
  
  // Error handling
  errorLog: [{
    attempt: Number,
    timestamp: Date,
    error: String,
    details: Object
  }]
}
```

## API Endpoints

The booking controller provides the following endpoints:

### Booking Management
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings with filters
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Availability Management
- `GET /api/bookings/availability` - Get venue availability
- `POST /api/bookings/check-availability` - Check specific time slot availability

### Statistics
- `GET /api/bookings/stats` - Get booking statistics

## Usage Examples

### Creating a CC Booking
```javascript
const bookingData = {
  venue: "venueId",
  venueType: "cc",
  fromDate: "2024-01-15",
  toDate: "2024-01-15",
  fromTime: "09:00",
  toTime: "11:00",
  facultyInCharge: "Dr. John Doe",
  department: "CSE",
  mobileNumber: "9876543210",
  eventName: "Programming Workshop",
  participants: 30,
  softwareRequirement: "Visual Studio Code",
  eventType: "Workshop",
  bookedBy: "student@kec.ac.in"
};

const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
});
```

### Creating a Seminar Hall Booking
```javascript
const bookingData = {
  venue: "venueId",
  venueType: "seminar",
  fromDate: "2024-01-20",
  toDate: "2024-01-20",
  fromTime: "14:00",
  toTime: "16:00",
  facultyInCharge: "Dr. Jane Smith",
  department: "ECE",
  mobileNumber: "9876543211",
  eventName: "Tech Talk",
  participants: 100,
  functionName: "Annual Tech Symposium",
  functionDate: "2024-01-20",
  chiefGuest: "Dr. Tech Expert",
  totalAudience: 150,
  logistics: {
    airConditioning: "Yes",
    electricalLighting: "Yes",
    stageLightings: "Yes",
    houseKeeping: "Yes",
    audioWork: "Yes"
  },
  bookedBy: "faculty@kec.ac.in"
};
```

## Database Indexes

The models include optimized indexes for efficient querying:

### Booking Indexes
- `{ venue: 1, fromDate: 1, toDate: 1 }` - Venue and date range queries
- `{ status: 1 }` - Status-based filtering
- `{ bookedBy: 1 }` - User booking history
- `{ facultyInCharge: 1 }` - Faculty booking queries

### Venue Indexes
- `{ venueType: 1 }` - Venue type filtering
- `{ department: 1 }` - Department-based queries
- `{ 'availability.isActive': 1 }` - Active venue queries
- `{ name: 1 }` - Venue name searches

### Availability Indexes
- `{ venue: 1, date: 1, startTime: 1, endTime: 1 }` - Time slot queries
- `{ status: 1, date: 1 }` - Status and date filtering
- `{ booking: 1 }` - Booking-specific availability
- `{ 'tentativeBooking.expiresAt': 1 }` - Expiring tentative bookings

### Rule Indexes
- `{ ruleType: 1, venueType: 1 }` - Rule type and venue filtering
- `{ venueId: 1 }` - Venue-specific rules
- `{ department: 1 }` - Department rules
- `{ userRole: 1 }` - Role-based rules
- `{ isActive: 1, priority: -1 }` - Active rules by priority

### Notification Indexes
- `{ notificationType: 1, deliveryStatus: 1 }` - Type and status filtering
- `{ booking: 1 }` - Booking-specific notifications
- `{ venue: 1 }` - Venue-related notifications
- `{ 'recipients.user': 1, 'recipients.readAt': 1 }` - User unread notifications
- `{ scheduledFor: 1, deliveryStatus: 1 }` - Scheduled delivery queries
- `{ groupId: 1 }` - Notification grouping

## Best Practices

1. **Validation**: Always validate booking data before creating records
2. **Availability Check**: Always check venue availability before booking
3. **Rule Application**: Apply booking rules in priority order
4. **Notification**: Send appropriate notifications for status changes
5. **Error Handling**: Implement comprehensive error handling
6. **Indexing**: Use appropriate indexes for performance
7. **Transactions**: Use database transactions for complex operations
8. **Audit Trail**: Maintain audit trails for important changes

## Future Enhancements

1. **Recurring Bookings**: Support for weekly/monthly recurring bookings
2. **Waitlist Management**: Handle overbooked venues with waitlists
3. **Payment Integration**: Support for paid venue bookings
4. **Calendar Integration**: Sync with external calendar systems
5. **Mobile App**: Native mobile application support
6. **Analytics Dashboard**: Advanced booking analytics and reporting
7. **API Rate Limiting**: Implement rate limiting for API endpoints
8. **Caching**: Redis caching for frequently accessed data
