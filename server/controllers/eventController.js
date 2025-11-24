// server/controllers/eventController.js
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";

import Event from '../models/Event.js';
import Club from '../models/Club.js';

// @desc    Create an event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      tags,
      venue,
      formLink,
      formSheetId,
      eventType,
      parentEvent,
    } = req.body;

    // Get user's club
    const club = await Club.findOne({ owner: req.user._id });
    if (!club) {
      return res.status(400).json({ message: 'You need to create a club first' });
    }

    // --- Upload poster to Cloudinary ---
    let posters = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "kec-events/posters",
        });
        return { url: upload.secure_url, public_id: upload.public_id };
      });

      posters = await Promise.all(uploadPromises);

      // Optionally delete local files after upload
      req.files.forEach((file) => fs.unlinkSync(file.path));
    }

    const cleanParentEvent = parentEvent ? parentEvent : null;
    
    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags); // convert '["CSE","CODING"]' to array
        } catch {
          parsedTags = tags.split(",").map(t => t.trim()); // fallback
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      tags: parsedTags,
      venue,
      createdBy: club._id,
      formLink,
      formSheetId,
      eventType: eventType || 'single',
      parentEvent: parentEvent || null,
      posters,
    });


    const createdEvent = await Event.findById(event._id)
      .populate('createdBy', 'name logoUrl')
      .populate('parentEvent', 'title');

    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      eventType = '',
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (eventType) {
      query.eventType = eventType;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(query)
      .populate('createdBy', 'name logoUrl')
      .populate('parentEvent', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name logoUrl contactInfo')
      .populate('parentEvent', 'title date');

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/ClubOwner
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (req.body.tags) {
      if (typeof req.body.tags === "string") {
        try {
          event.tags = JSON.parse(req.body.tags);
        } catch {
          event.tags = req.body.tags.split(",").map(t => t.trim());
        }
      } else if (Array.isArray(req.body.tags)) {
        event.tags = req.body.tags;
      }
    }
    if (event) {
      // Check if user owns the club that created this event
      const club = await Club.findOne({ owner: req.user._id });
      if (!club || event.createdBy.toString() !== club._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      event.title = req.body.title || event.title;
      event.description = req.body.description || event.description;
      event.date = req.body.date || event.date;
      event.time = req.body.time || event.time;
      event.tags = req.body.tags || event.tags;
      event.venue = req.body.venue || event.venue;
      event.formLink = req.body.formLink || event.formLink;
      event.formSheetId = req.body.formSheetId || event.formSheetId;
      event.eventType = req.body.eventType || event.eventType;
      event.parentEvent = req.body.parentEvent || event.parentEvent;
      event.posters = req.body.posters || event.posters;

      const updatedEvent = await event.save();
      const populatedEvent = await Event.findById(updatedEvent._id)
        .populate('createdBy', 'name logoUrl')
        .populate('parentEvent', 'title');

      res.json(populatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/ClubOwner
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Check if user owns the club that created this event
      const club = await Club.findOne({ owner: req.user._id });
      if (!club || event.createdBy.toString() !== club._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }

      await Event.deleteOne({ _id: event._id });
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get club events
// @route   GET /api/events/club/:clubId
// @access  Public
const getClubEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const events = await Event.find({ createdBy: req.params.clubId })
      .populate('createdBy', 'name logoUrl')
      .populate('parentEvent', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1 });

    const total = await Event.countDocuments({ createdBy: req.params.clubId });

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const events = await Event.find({
      date: { $gte: new Date() }
    })
      .populate('createdBy', 'name logoUrl')
      .limit(parseInt(limit))
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment event views
// @route   PATCH /api/events/:id/views
// @access  Public
const incrementEventViews = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      event.views += 1;
      await event.save();
      res.json({ views: event.views });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update participants count
// @route   PATCH /api/events/:id/participants
// @access  Public
const updateParticipantsCount = async (req, res) => {
  try {
    const { action } = req.body; // 'increment' or 'decrement'
    const event = await Event.findById(req.params.id);

    if (event) {
      if (action === 'increment') {
        event.participantsCount += 1;
      } else if (action === 'decrement' && event.participantsCount > 0) {
        event.participantsCount -= 1;
      }

      await event.save();
      res.json({ participantsCount: event.participantsCount });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event participants (mock data)
// @route   GET /api/events/:id/participants
// @access  Public
const getEventParticipants = async (req, res) => {
  try {
    // This would typically come from your form responses or registration system
    // For now, returning mock data
    const mockParticipants = [
      { name: 'John Doe', email: 'john@student.com', department: 'CSE', year: '3rd' },
      { name: 'Jane Smith', email: 'jane@student.com', department: 'ECE', year: '2nd' },
      { name: 'Mike Johnson', email: 'mike@student.com', department: 'MECH', year: '4th' }
    ];

    res.json(mockParticipants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getClubEvents,
  getUpcomingEvents,
  incrementEventViews,
  updateParticipantsCount,
  getEventParticipants
};