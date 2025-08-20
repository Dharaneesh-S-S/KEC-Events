import VenueAvailability from '../models/VenueAvailability.js';
import Venue from '../models/Venue.js';

export const getVenueAvailability = async (req, res) => {
  try {
    const { venueId, date, startDate, endDate, status } = req.query;

    if (!venueId) {
      return res.status(400).json({ message: 'Venue ID is required' });
    }

    let query = { venue: venueId };
    if (status) query.status = status;

    if (date) {
      query.date = new Date(date);
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const availability = await VenueAvailability.find(query)
      .populate('booking', 'eventName fromTime toTime')
      .sort({ date: 1, startTime: 1 });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch venue availability', error: err.message });
  }
};

export const checkVenueAvailability = async (req, res) => {
  try {
    const { venueId, date, startTime, endTime } = req.body;

    if (!venueId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const isAvailable = await VenueAvailability.isVenueAvailable(
      venueId,
      new Date(date),
      startTime,
      endTime
    );

    res.json({ available: isAvailable });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check availability', error: err.message });
  }
};

export const createAvailabilitySlot = async (req, res) => {
  try {
    const { venueId, date, startTime, endTime, status = 'available' } = req.body;

    // Check if venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Check if slot already exists
    const existingSlot = await VenueAvailability.findOne({
      venue: venueId,
      date: new Date(date),
      startTime,
      endTime
    });

    if (existingSlot) {
      return res.status(409).json({ message: 'Availability slot already exists' });
    }

    const availability = await VenueAvailability.create({
      venue: venueId,
      date: new Date(date),
      startTime,
      endTime,
      status
    });

    res.status(201).json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create availability slot', error: err.message });
  }
};

export const updateAvailabilitySlot = async (req, res) => {
  try {
    const { status, booking } = req.body;
    
    const availability = await VenueAvailability.findByIdAndUpdate(
      req.params.id,
      { status, booking, updatedAt: Date.now() },
      { new: true }
    );

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update availability slot', error: err.message });
  }
};

export const deleteAvailabilitySlot = async (req, res) => {
  try {
    const availability = await VenueAvailability.findByIdAndDelete(req.params.id);

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    res.json({ message: 'Availability slot deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete availability slot', error: err.message });
  }
};

export const bulkCreateAvailability = async (req, res) => {
  try {
    const { venueId, slots } = req.body;

    // Check if venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const availabilitySlots = slots.map(slot => ({
      venue: venueId,
      date: new Date(slot.date),
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status || 'available'
    }));

    const createdSlots = await VenueAvailability.insertMany(availabilitySlots);

    res.status(201).json({
      message: `${createdSlots.length} availability slots created`,
      slots: createdSlots
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create availability slots', error: err.message });
  }
};

export const getAvailabilityStats = async (req, res) => {
  try {
    const { venueId, fromDate, toDate } = req.query;

    const filter = {};
    if (venueId) filter.venue = venueId;
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }

    const stats = await VenueAvailability.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: {
            $sum: {
              $divide: [
                { $subtract: [{ $toDate: '$endTime' }, { $toDate: '$startTime' }] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        }
      }
    ]);

    const totalSlots = await VenueAvailability.countDocuments(filter);
    const bookedSlots = await VenueAvailability.countDocuments({
      ...filter,
      status: 'booked'
    });

    res.json({
      totalSlots,
      bookedSlots,
      utilizationRate: totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0,
      byStatus: stats
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch availability statistics', error: err.message });
  }
};

// Get venues available for a specific date and time range
export const getAvailableVenuesForSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, venueType, department } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'date, startTime, and endTime are required' });
    }

    const baseVenueFilter = {
      'availability.isActive': true,
      'availability.maintenanceMode': false,
    };

    if (venueType) baseVenueFilter.venueType = venueType;
    if (department) baseVenueFilter.department = { $regex: department, $options: 'i' };

    // Find venues that have conflicting availability entries (booked/blocked/maintenance) for the slot
    const conflictVenueIds = await VenueAvailability.distinct('venue', {
      date: new Date(date),
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $in: ['booked', 'maintenance', 'blocked'] }
    });

    // Fetch candidate venues excluding those with conflicts
    const candidateVenues = await Venue.find({
      ...baseVenueFilter,
      _id: { $nin: conflictVenueIds }
    }).sort({ name: 1 });

    // Additional guard: ensure the requested time is within operating hours
    const requestedDate = new Date(date);
    const availableVenues = candidateVenues.filter(v => v.isAvailableForSlot(requestedDate, requestedDate, startTime, endTime));

    res.json({ venues: availableVenues });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch available venues', error: err.message });
  }
};








