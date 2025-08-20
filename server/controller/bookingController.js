import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import VenueAvailability from '../models/VenueAvailability.js';
import VenueBookingRule from '../models/VenueBookingRule.js';
import VenueBookingNotification from '../models/VenueBookingNotification.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    // Safe logging of inbound request
    const safeUser = req.user ? { id: req.user.id || req.user._id, email: req.user.email, role: req.user.role, name: req.user.name } : null;
    console.log('[createBooking] user =', safeUser);
    console.log('[createBooking] body =', {
      ...req.body,
      // Avoid logging large nested objects in detail
      logistics: req.body?.logistics ? '[object]' : undefined,
      alternatives: Array.isArray(req.body?.alternatives) ? `len=${req.body.alternatives.length}` : undefined,
    });

    const {
      venue,
      venueType,
      fromDate,
      toDate,
      fromTime,
      toTime,
      facultyInCharge,
      department,
      mobileNumber,
      eventName,
      participants,
      softwareRequirement,
      eventType,
      functionName,
      functionDate,
      chiefGuest,
      totalAudience,
      logistics,
      alternatives,
      bookedBy
    } = req.body;

    // Basic validation against required fields from Booking model
    const missing = [];
    const required = {
      venue,
      venueType,
      fromDate,
      toDate,
      fromTime,
      toTime,
      facultyInCharge,
      department,
      mobileNumber,
      eventName,
      participants
    };
    Object.entries(required).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') missing.push(k);
    });
    if (missing.length) {
      console.warn('[createBooking] missing required fields:', missing);
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    // Coerce and validate types
    const participantsNum = Number(participants);
    if (!Number.isFinite(participantsNum) || participantsNum < 1) {
      return res.status(400).json({ message: 'participants must be a positive number' });
    }
    if (!/^\d{10}$/.test(String(mobileNumber))) {
      return res.status(400).json({ message: 'Mobile number must be 10 digits' });
    }

    const resolvedBookedBy = bookedBy || req.user?.email || req.user?.name || 'UNKNOWN_USER';

    // Validate venue exists and is active
    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    if (!venueDoc.availability.isActive) {
      return res.status(400).json({ message: 'Venue is currently inactive' });
    }

    if (venueDoc.availability.maintenanceMode) {
      return res.status(400).json({ message: 'Venue is under maintenance' });
    }

    // Check venue availability for the requested time slot
    const isAvailable = await VenueAvailability.isVenueAvailable(
      venue,
      new Date(fromDate),
      fromTime,
      toTime
    );

    if (!isAvailable) {
      return res.status(409).json({ message: 'Venue is not available for the requested time slot' });
    }

    // Validate booking rules
    const applicableRules = await VenueBookingRule.find({
      isActive: true,
      $or: [
        { venueType: 'all' },
        { venueType: venueType },
        { venueId: venue },
        { department: department }
      ]
    }).sort({ priority: -1 });

    // Apply booking rules validation
    for (const rule of applicableRules) {
      if (rule.isEffective()) {
        // Check advance booking time
        const bookingDate = new Date(fromDate);
        const now = new Date();
        const daysDifference = Math.ceil((bookingDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > rule.timeRestrictions.maxAdvanceBookingDays) {
          return res.status(400).json({ 
            message: `Booking cannot be made more than ${rule.timeRestrictions.maxAdvanceBookingDays} days in advance` 
          });
        }

        if (daysDifference < (rule.timeRestrictions.minAdvanceBookingHours / 24)) {
          return res.status(400).json({ 
            message: `Booking must be made at least ${rule.timeRestrictions.minAdvanceBookingHours} hours in advance` 
          });
        }

        // Check participant limits
        if (rule.capacityRestrictions.maxParticipants && participants > rule.capacityRestrictions.maxParticipants) {
          return res.status(400).json({ 
            message: `Maximum participants allowed: ${rule.capacityRestrictions.maxParticipants}` 
          });
        }

        if (participants < rule.capacityRestrictions.minParticipants) {
          return res.status(400).json({ 
            message: `Minimum participants required: ${rule.capacityRestrictions.minParticipants}` 
          });
        }
      }
    }

    // Create the booking
    const bookingData = {
      venue,
      venueType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      fromTime,
      toTime,
      facultyInCharge,
      department,
      mobileNumber,
      eventName,
      participants: participantsNum,
      softwareRequirement,
      eventType,
      functionName,
      functionDate: functionDate ? new Date(functionDate) : null,
      chiefGuest,
      totalAudience,
      logistics,
      alternatives,
      bookedBy: resolvedBookedBy,
      status: 'pending'
    };

    console.log('[createBooking] creating booking with data:', {
      ...bookingData,
      venue: String(bookingData.venue),
      fromDate: bookingData.fromDate?.toISOString?.() || bookingData.fromDate,
      toDate: bookingData.toDate?.toISOString?.() || bookingData.toDate,
    });
    const booking = await Booking.create(bookingData);

    // Update venue availability
    await VenueAvailability.findOneAndUpdate(
      {
        venue,
        date: new Date(fromDate),
        startTime: { $lte: fromTime },
        endTime: { $gte: toTime }
      },
      {
        status: 'booked',
        booking: booking._id
      }
    );

    // Create notifications (non-blocking and safe)
    try {
      const userIdStr = req.user?.id || req.user?._id;
      const notificationRecipients = [];
      if (userIdStr) {
        notificationRecipients.push({ userId: userIdStr, role: req.user?.role || 'student', method: 'in_app' });
      } else {
        console.warn('[createBooking] Skipping notification: missing req.user.id/_id');
      }

      // Add faculty notification if required (placeholder - implement lookup as needed)
      if (applicableRules.some(rule => rule.approvalWorkflow.requireFacultyApproval)) {
        // TODO: Lookup faculty user and push to notificationRecipients
      }

      if (notificationRecipients.length) {
        await VenueBookingNotification.createBookingStatusNotification(
          booking,
          null,
          'pending',
          notificationRecipients
        );
      }
    } catch (notifyErr) {
      console.warn('[createBooking] Notification creation failed, continuing without blocking booking:', notifyErr?.message);
    }

    // Populate venue details for response
    await booking.populate('venue');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ message: 'Booking creation failed', error: err.message });
  }
};

// Get bookings for a specific club by clubId
export const getBookingsByClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    if (!clubId) {
      return res.status(400).json({ message: 'clubId is required' });
    }

    // Authorization: ensure the requested clubId matches the logged-in club
    const loggedInClubId = req.user?.clubId || req.user?.id || req.user?._id?.toString?.();
    if (!loggedInClubId || String(loggedInClubId) !== String(clubId)) {
      return res.status(403).json({ message: 'Forbidden: club mismatch' });
    }

    // Fetch bookings for this club
    const bookings = await Booking.find({ clubId: clubId })
      .sort({ createdAt: -1 })
      .populate('venue', 'name location _id')
      .populate('club', 'name _id');

    return res.json({ bookings });
  } catch (err) {
    console.error('Error fetching club bookings:', err);
    return res.status(500).json({ message: 'Failed to fetch club bookings', error: err.message });
  }
};

// Get all bookings with filters
export const getBookings = async (req, res) => {
  try {
    const {
      venue,
      venueType,
      status,
      fromDate,
      toDate,
      facultyInCharge,
      department,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (venue) filter.venue = venue;
    if (venueType) filter.venueType = venueType;
    if (status) filter.status = status;
    if (facultyInCharge) filter.facultyInCharge = { $regex: facultyInCharge, $options: 'i' };
    if (department) filter.department = { $regex: department, $options: 'i' };

    if (fromDate || toDate) {
      filter.fromDate = {};
      if (fromDate) filter.fromDate.$gte = new Date(fromDate);
      if (toDate) filter.fromDate.$lte = new Date(toDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('venue')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venue')
      .populate('approvedBy', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch booking', error: err.message });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    
    if (status === 'approved') {
      booking.approvedBy = req.user._id;
      booking.approvedAt = new Date();
    } else if (status === 'rejected' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }

    await booking.save();

    // Update venue availability if booking is cancelled
    if (status === 'cancelled' && oldStatus === 'approved') {
      await VenueAvailability.findOneAndUpdate(
        {
          venue: booking.venue,
          booking: booking._id
        },
        {
          status: 'available',
          booking: null
        }
      );
    }

    // Create notification for status change
    const notificationRecipients = [
      { userId: booking.bookedBy, role: 'student', method: 'in_app' }
    ];

    await VenueBookingNotification.createBookingStatusNotification(
      booking,
      oldStatus,
      status,
      notificationRecipients
    );

    res.json({
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking', error: err.message });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow deletion of pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be deleted' });
    }

    // Update venue availability
    await VenueAvailability.findOneAndUpdate(
      {
        venue: booking.venue,
        booking: booking._id
      },
      {
        status: 'available',
        booking: null
      }
    );

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete booking', error: err.message });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const { venueType, department, fromDate, toDate } = req.query;

    const filter = {};
    if (venueType) filter.venueType = venueType;
    if (department) filter.department = department;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const stats = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalParticipants: { $sum: '$participants' }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments(filter);
    const totalParticipants = await Booking.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$participants' } } }
    ]);

    res.json({
      totalBookings,
      totalParticipants: totalParticipants[0]?.total || 0,
      byStatus: stats
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch booking statistics', error: err.message });
  }
};

// Get bookings for the authenticated user
export const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {
      $or: [
        { bookedBy: req.user.email },
        { department: req.user.department },
        { facultyInCharge: req.user.name }
      ]
    };

    if (status) {
      filter.status = status;
    }

    const sort = { createdAt: -1 };
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('venue', 'name capacity department venueType availableLogistics')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ message: 'Failed to fetch user bookings', error: err.message });
  }
};

