import Venue from '../models/Venue.js';
import VenueAvailability from '../models/VenueAvailability.js';

// GET all venues with filtering and pagination
export const getVenues = async (req, res) => {
  try {
    const { department, venueType, isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    const trimmedDept = typeof department === 'string' ? department.trim() : department;
    if (trimmedDept) filter.department = { $regex: trimmedDept, $options: 'i' };
    if (venueType) filter.venueType = venueType;
    if (isActive !== undefined) filter['availability.isActive'] = isActive === 'true';
    
    const skip = (page - 1) * limit;
    
    // DEBUG: Log query and filter for troubleshooting
    console.log('[getVenues] req.query =', req.query);
    console.log('[getVenues] computed filter =', filter, 'skip =', skip, 'limit =', parseInt(limit));

    const totalVenues = await Venue.countDocuments(filter);
    const venues = await Venue.find(filter).skip(skip).limit(parseInt(limit));
    
    res.status(200).json({
      venues,
      pagination: {
        totalItems: totalVenues,
        totalPages: Math.ceil(totalVenues / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching venues', error: error.message });
  }
};

// GET a single venue by its ID
export const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findById(id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(200).json(venue);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch venue details', error: err.message });
  }
};

// POST check venue availability for a given time slot
export const checkAvailability = async (req, res) => {
    const { venueId, date, fromTime, toTime } = req.body;
    try {
        const availability = await VenueAvailability.findOne({ venue: venueId, date: new Date(date) });
        if (availability) {
            // NOTE: VenueAvailability.isVenueAvailable needs to be implemented as a static method on the model
            const isAvailable = await VenueAvailability.isVenueAvailable(venueId, new Date(date), fromTime, toTime);
            res.status(200).json({ isAvailable, slots: availability.slots });
        } else {
            res.status(200).json({ isAvailable: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error checking availability', error: error.message });
    }
};

// POST create a new venue (admin-only)
export const createVenue = async (req, res) => {
  try {
    const { name, venueType, department, capacity, location } = req.body;
    if (!name || !venueType || !department || !capacity || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newVenue = new Venue(req.body);
    await newVenue.save();
    res.status(201).json(newVenue);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create venue', error: err.message });
  }
};

// PUT update a venue (admin-only)
export const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVenue = await Venue.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedVenue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(200).json(updatedVenue);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update venue', error: err.message });
  }
};

// DELETE a venue (admin-only)
export const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVenue = await Venue.findByIdAndDelete(id);
    if (!deletedVenue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(200).json({ message: 'Venue deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete venue', error: err.message });
  }
};
export const updateVenueAvailability = async (req, res) => {
  try {
    const { isActive, maintenanceMode, maintenanceStartDate, maintenanceEndDate, maintenanceReason } = req.body;
    
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      {
        'availability.isActive': isActive,
        'availability.maintenanceMode': maintenanceMode,
        'availability.maintenanceStartDate': maintenanceStartDate,
        'availability.maintenanceEndDate': maintenanceEndDate,
        'availability.maintenanceReason': maintenanceReason,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: 'Venue availability update failed', error: err.message });
  }
};

export const getVenueStats = async (req, res) => {
  try {
    const stats = await Venue.aggregate([
      {
        $group: {
          _id: '$venueType',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$availability.isActive', 1, 0] }
          },
          maintenanceCount: {
            $sum: { $cond: ['$availability.maintenanceMode', 1, 0] }
          },
          avgCapacity: { $avg: '$capacity' }
        }
      }
    ]);
    
    const totalVenues = await Venue.countDocuments();
    const activeVenues = await Venue.countDocuments({ 'availability.isActive': true });
    const maintenanceVenues = await Venue.countDocuments({ 'availability.maintenanceMode': true });
    
    res.json({
      totalVenues,
      activeVenues,
      maintenanceVenues,
      byType: stats
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch venue statistics', error: err.message });
  }
};

