// server/controller/adminController.js
import User from '../models/User.js';
import Event from '../models/Event.js';
import jwt from 'jsonwebtoken';

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    const totalClubs = await User.countDocuments({ role: 'club' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalEvents = await Event.countDocuments();
    const activeClubs = await User.countDocuments({ role: 'club', status: 'active' });

    // Get events count per club
    const eventsPerClub = await Event.aggregate([
      {
        $group: {
          _id: '$createdBy',
          eventCount: { $sum: 1 }
        }
      }
    ]);

    // Get total members (students) per club
    const membersPerClub = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$department',
          memberCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats: {
        totalClubs,
        totalStudents,
        totalEvents,
        activeClubs
      },
      eventsPerClub,
      membersPerClub
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch admin statistics', error: error.message });
  }
};

// Get all clubs with their details
export const getAllClubs = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    
    let query = { role: 'club' };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add department filter
    if (department && department !== 'all') {
      query.department = department;
    }
    
    // Add status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    const clubs = await User.find(query).select('-password');
    
    // Get additional stats for each club
    const clubsWithStats = await Promise.all(
      clubs.map(async (club) => {
        const eventCount = await Event.countDocuments({ createdBy: club._id });
        const memberCount = await User.countDocuments({ 
          role: 'student', 
          department: club.department 
        });
        
        return {
          ...club.toObject(),
          events: eventCount,
          members: memberCount
        };
      })
    );

    res.json(clubsWithStats);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Failed to fetch clubs', error: error.message });
  }
};

// Generate random password
const generatePassword = (length = 8) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Create a new club
export const createClub = async (req, res) => {
  try {
    const { name, email, department, description } = req.body;
    
    // Check if club with this email already exists
    const existingClub = await User.findOne({ email });
    if (existingClub) {
      return res.status(400).json({ message: 'Club with this email already exists' });
    }
    
    // Generate random password
    const plainPassword = generatePassword(8);
    
    // Create new club with plain text password
    const newClub = new User({
      name,
      email,
      password: plainPassword,
      role: 'club',
      department,
      description,
      status: 'active'
    });
    
    await newClub.save();
    
    // Return club data without password, but include plain password for admin
    const clubData = {
      id: newClub._id,
      name: newClub.name,
      email: newClub.email,
      role: newClub.role,
      department: newClub.department,
      description: newClub.description,
      status: newClub.status,
      createdAt: newClub.createdAt,
      events: 0,
      members: 0
    };
    
    res.status(201).json({
      message: 'Club created successfully',
      club: clubData,
      generatedPassword: plainPassword // Return plain password for admin to share
    });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ message: 'Failed to create club', error: error.message });
  }
};

// Update club details
export const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, department, description, status } = req.body;
    
    // Check if club exists
    const club = await User.findById(id);
    if (!club || club.role !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Check if email is already taken by another club
    if (email && email !== club.email) {
      const existingClub = await User.findOne({ email, _id: { $ne: id } });
      if (existingClub) {
        return res.status(400).json({ message: 'Email already taken by another club' });
      }
    }
    
    // Update fields
    const updateData = { name, email, department, description, status };
    
    // Store password as plain text if provided
    if (password) {
      updateData.password = password;
    }
    
    const updatedClub = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Get updated stats
    const eventCount = await Event.countDocuments({ createdBy: id });
    const memberCount = await User.countDocuments({ 
      role: 'student', 
      department: updatedClub.department 
    });
    
    const clubData = {
      ...updatedClub.toObject(),
      events: eventCount,
      members: memberCount
    };
    
    res.json({
      message: 'Club updated successfully',
      club: clubData
    });
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ message: 'Failed to update club', error: error.message });
  }
};

// Delete club
export const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if club exists
    const club = await User.findById(id);
    if (!club || club.role !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Check if club has events
    const eventCount = await Event.countDocuments({ createdBy: id });
    if (eventCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete club with existing events. Please delete all events first.' 
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ message: 'Failed to delete club', error: error.message });
  }
};

// Get club by ID
export const getClubById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await User.findById(id).select('-password');
    if (!club || club.role !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Get club stats
    const eventCount = await Event.countDocuments({ createdBy: id });
    const memberCount = await User.countDocuments({ 
      role: 'student', 
      department: club.department 
    });
    
    const clubData = {
      ...club.toObject(),
      events: eventCount,
      members: memberCount
    };
    
    res.json(clubData);
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: 'Failed to fetch club', error: error.message });
  }
};



// Get all departments
export const getDepartments = async (req, res) => {
  try {
    // Return default departments since we're not using a separate Department model
    const defaultDepartments = [
      'IT',
      'CSE', 
      'CSD',
      'ECE',
      'EEC',
      'MECHANICAL',
      'MECHATRONICS',
      'COMMON',
      'S&H',
      'FT'
    ];
    res.json(defaultDepartments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
};