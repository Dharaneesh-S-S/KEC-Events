import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';

export const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      venue, 
      posterLink, 
      teamSize, 
      eventDate, 
      registrationDeadline, 
      description, 
      rules, 
      category, 
      isFree,
      venueBookingId,
      expectedAttendees
    } = req.body;

    // Validate that venue booking exists and is approved
    if (!venueBookingId) {
      return res.status(400).json({ 
        message: 'Venue booking ID is required. Please book a venue before creating an event.' 
      });
    }

    const booking = await Booking.findById(venueBookingId);
    if (!booking) {
      return res.status(404).json({ 
        message: 'Venue booking not found. Please ensure you have a valid venue booking.' 
      });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Venue booking must be approved before creating an event. Current status: ' + booking.status 
      });
    }

    // Check if the user's department matches the booking department
    if (booking.department !== req.user.department) {
      return res.status(403).json({ 
        message: 'You can only create events for venues booked by your department.' 
      });
    }

    // Validate event date matches booking date
    const eventDateObj = new Date(eventDate);
    const bookingDateObj = new Date(booking.fromDate);
    
    if (eventDateObj.toDateString() !== bookingDateObj.toDateString()) {
      return res.status(400).json({ 
        message: 'Event date must match the venue booking date.' 
      });
    }

    // Check if event date is in the future
    if (eventDateObj <= new Date()) {
      return res.status(400).json({ 
        message: 'Event date must be in the future.' 
      });
    }

    // Validate capacity
    const venueDoc = await Venue.findById(booking.venue);
    if (!venueDoc) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    if (expectedAttendees && expectedAttendees > venueDoc.capacity) {
      return res.status(400).json({ 
        message: `Expected attendees (${expectedAttendees}) exceed venue capacity (${venueDoc.capacity}).` 
      });
    }

    // Create event with venue booking validation
    const eventData = {
      title,
      venue: venueDoc.name,
      posterLink,
      teamSize,
      eventDate,
      registrationDeadline,
      description,
      rules: Array.isArray(rules) ? rules : rules.split('\n'),
      category,
      isFree,
      createdBy: req.user.id,
      venueBooking: {
        bookingId: venueBookingId,
        venueId: booking.venue,
        venueType: booking.venueType,
        bookingDate: booking.fromDate,
        startTime: booking.fromTime,
        endTime: booking.toTime,
        expectedAttendees: expectedAttendees || booking.participants,
        department: booking.department,
        facultyInCharge: booking.facultyInCharge
      }
    };

    const event = await Event.create(eventData);
    
    // Populate venue booking details for response
    await event.populate('venueBooking.bookingId');
    await event.populate('venueBooking.venueId');

    res.status(201).json({
      message: 'Event created successfully with venue booking validation',
      event,
      validationSummary: event.getValidationSummary()
    });
  } catch (err) {
    console.error('Event creation error:', err);
    
    // Handle validation errors specifically
    if (err.message.includes('Venue booking validation failed')) {
      return res.status(400).json({ 
        message: 'Event creation failed due to venue booking validation issues',
        error: err.message,
        details: 'Please ensure your venue booking meets all requirements before creating an event.'
      });
    }
    
    res.status(500).json({ 
      message: 'Event creation failed', 
      error: err.message 
    });
  }
};

// New function to validate venue booking before event creation
export const validateVenueBookingForEvent = async (req, res) => {
  try {
    const { 
      venueBookingId, 
      eventDate, 
      expectedAttendees,
      requireProjector,
      requireMic,
      requireSpeakers,
      requireWhiteboard,
      requireAC,
      requireWiFi,
      additionalRequirements
    } = req.body;

    if (!venueBookingId) {
      return res.status(400).json({ 
        message: 'Venue booking ID is required' 
      });
    }

    const booking = await Booking.findById(venueBookingId);
    if (!booking) {
      return res.status(404).json({ 
        message: 'Venue booking not found' 
      });
    }

    // Check booking status
    if (booking.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Venue booking must be approved',
        currentStatus: booking.status,
        canProceed: false
      });
    }

    // Check department eligibility
    if (booking.department !== req.user.department) {
      return res.status(403).json({ 
        message: 'You can only use venue bookings from your department',
        canProceed: false
      });
    }

    // Validate date
    const eventDateObj = new Date(eventDate);
    const bookingDateObj = new Date(booking.fromDate);
    const now = new Date();
    
    // Check if event date is in the future
    if (eventDateObj <= now) {
      return res.status(400).json({ 
        message: 'Event date must be in the future',
        canProceed: false
      });
    }
    
    // Check if event date matches booking date
    if (eventDateObj.toDateString() !== bookingDateObj.toDateString()) {
      return res.status(400).json({ 
        message: 'Event date must match venue booking date',
        canProceed: false
      });
    }

    // Check if booking date is not in the past
    if (bookingDateObj <= now) {
      return res.status(400).json({ 
        message: 'Venue booking date cannot be in the past',
        canProceed: false
      });
    }

    // Get venue details
    const venue = await Venue.findById(booking.venue);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Check venue availability
    if (!venue.availability.isActive) {
      return res.status(400).json({ 
        message: 'Venue is currently inactive',
        canProceed: false
      });
    }

    if (venue.availability.maintenanceMode) {
      return res.status(400).json({ 
        message: 'Venue is under maintenance',
        canProceed: false
      });
    }

    // Check capacity
    const attendees = expectedAttendees || booking.participants;
    const capacitySufficient = venue.capacity >= attendees;

    // Check logistics availability based on user requirements
    const requiredLogistics = [];
    const availableLogistics = [];
    const missingLogistics = [];
    
    // Check user-requested logistics against venue availability
    if (requireProjector && !venue.availableLogistics.projector) {
      requiredLogistics.push('projector');
      missingLogistics.push('projector');
    } else if (requireProjector) {
      availableLogistics.push('projector');
    }
    
    if (requireMic && !venue.availableLogistics.mic) {
      requiredLogistics.push('mic');
      missingLogistics.push('mic');
    } else if (requireMic) {
      availableLogistics.push('mic');
    }
    
    if (requireSpeakers && !venue.availableLogistics.speakers) {
      requiredLogistics.push('speakers');
      missingLogistics.push('speakers');
    } else if (requireSpeakers) {
      availableLogistics.push('speakers');
    }
    
    if (requireWhiteboard && !venue.availableLogistics.whiteboard) {
      requiredLogistics.push('whiteboard');
      missingLogistics.push('whiteboard');
    } else if (requireWhiteboard) {
      availableLogistics.push('whiteboard');
    }
    
    if (requireAC && !venue.availableLogistics.ac) {
      requiredLogistics.push('ac');
      missingLogistics.push('ac');
    } else if (requireAC) {
      availableLogistics.push('ac');
    }
    
    if (requireWiFi && !venue.availableLogistics.wifi) {
      requiredLogistics.push('wifi');
      missingLogistics.push('wifi');
    } else if (requireWiFi) {
      availableLogistics.push('wifi');
    }
    
    // Add venue-specific features that are available
    if (venue.features && venue.features.length > 0) {
      availableLogistics.push(...venue.features);
    }
    
    // Check if required logistics from booking are available
    if (booking.logistics) {
      if (booking.logistics.projector && !venue.availableLogistics.projector) {
        requiredLogistics.push('projector');
        if (!missingLogistics.includes('projector')) missingLogistics.push('projector');
      }
      if (booking.logistics.mic && !venue.availableLogistics.mic) {
        requiredLogistics.push('mic');
        if (!missingLogistics.includes('mic')) missingLogistics.push('mic');
      }
      if (booking.logistics.speakers && !venue.availableLogistics.speakers) {
        requiredLogistics.push('speakers');
        if (!missingLogistics.includes('speakers')) missingLogistics.push('speakers');
      }
    }

    // Check operating hours
    const dayOfWeek = eventDateObj.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const operatingHours = venue.operatingHours[dayOfWeek];
    const timeInRange = booking.fromTime >= operatingHours.start && booking.toTime <= operatingHours.end;

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      venue: booking.venue,
      status: 'approved',
      _id: { $ne: booking._id },
      $or: [
        {
          fromDate: { $lte: booking.toDate },
          toDate: { $gte: booking.fromDate }
        }
      ]
    });

    const hasOverlap = overlappingBookings.some(overlap => {
      const overlapStart = new Date(overlap.fromDate);
      const overlapEnd = new Date(overlap.toDate);
      const bookingStart = new Date(booking.fromDate);
      const bookingEnd = new Date(booking.toDate);
      
      return (overlapStart < bookingEnd && overlapEnd > bookingStart) ||
             (overlapStart <= bookingStart && overlapEnd >= bookingEnd);
    });

    const validationResult = {
      canProceed: true,
      booking: {
        id: booking._id,
        status: booking.status,
        venue: venue.name,
        date: booking.fromDate,
        time: `${booking.fromTime} - ${booking.toTime}`,
        department: booking.department,
        facultyInCharge: booking.facultyInCharge
      },
      validation: {
        dateValid: eventDateObj > now,
        dateMatches: eventDateObj.toDateString() === bookingDateObj.toDateString(),
        capacitySufficient,
        logisticsAvailable: missingLogistics.length === 0,
        departmentEligible: true,
        venueActive: venue.availability.isActive,
        noMaintenance: !venue.availability.maintenanceMode,
        operatingHoursValid: timeInRange,
        noOverlap: !hasOverlap
      },
      details: {
        venueCapacity: venue.capacity,
        expectedAttendees: attendees,
        availableLogistics,
        missingLogistics,
        requiredLogistics: requiredLogistics,
        venueType: venue.venueType,
        operatingHours: operatingHours,
        userRequirements: {
          projector: requireProjector,
          mic: requireMic,
          speakers: requireSpeakers,
          whiteboard: requireWhiteboard,
          ac: requireAC,
          wifi: requireWiFi,
          additional: additionalRequirements
        },
        recommendations: []
      }
    };

    // Generate recommendations
    if (!capacitySufficient) {
      validationResult.details.recommendations.push(
        `Consider reducing attendees or booking a larger venue. Current capacity: ${venue.capacity}`
      );
    }

    if (missingLogistics.length > 0) {
      validationResult.details.recommendations.push(
        `Required facilities missing: ${missingLogistics.join(', ')}. Consider alternative venues or arrangements.`
      );
    }

    if (!timeInRange) {
      validationResult.details.recommendations.push(
        `Event time (${booking.fromTime}-${booking.toTime}) is outside operating hours (${operatingHours.start}-${operatingHours.end}).`
      );
    }

    if (hasOverlap) {
      validationResult.details.recommendations.push(
        'There are overlapping bookings for this venue. Consider adjusting the time slot.'
      );
    }

    // Update canProceed based on all validation checks
    validationResult.canProceed = 
      validationResult.validation.dateValid &&
      validationResult.validation.dateMatches &&
      validationResult.validation.capacitySufficient &&
      validationResult.validation.logisticsAvailable &&
      validationResult.validation.departmentEligible &&
      validationResult.validation.venueActive &&
      validationResult.validation.noMaintenance &&
      validationResult.validation.operatingHoursValid &&
      validationResult.validation.noOverlap;

    res.json(validationResult);
  } catch (err) {
    console.error('Venue booking validation error:', err);
    res.status(500).json({ 
      message: 'Validation failed', 
      error: err.message 
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event', error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, venue, posterLink, teamSize, eventDate, registrationDeadline, description, rules, category, isFree } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        venue,
        posterLink,
        teamSize,
        eventDate,
        registrationDeadline,
        description,
        rules: Array.isArray(rules) ? rules : rules.split('\n'),
        category,
        isFree
      },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Event update failed', error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Event deletion failed', error: err.message });
  }
};

