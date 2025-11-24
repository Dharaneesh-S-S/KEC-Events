import User from '../models/User.js';
import Club from '../models/Club.js';
import Event from '../models/Event.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalClubs = await Club.countDocuments();
    const totalStudents = await User.countDocuments({ isAdmin: false });
    const activeStudents = await User.countDocuments({ isAdmin: false, isActive: true });
    const blockedStudents = await User.countDocuments({ isAdmin: false, isActive: false });
    const totalEvents = await Event.countDocuments();

    res.json({
      totalClubs,
      totalStudents,
      activeStudents,
      blockedStudents,
      totalEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students with pagination and search
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = { isAdmin: false };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .populate('clubRef', 'name logoUrl')
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle student access (active/block)
// @route   PATCH /api/admin/students/:id/access
// @access  Private/Admin
const toggleStudentAccess = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.isAdmin) {
      return res.status(400).json({ message: 'Cannot modify admin user access' });
    }

    student.isActive = !student.isActive;
    await student.save();

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      isActive: student.isActive,
      message: `Student ${student.isActive ? 'activated' : 'blocked'} successfully`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all clubs for admin with pagination and search
// @route   GET /api/admin/clubs
// @access  Private/Admin
const getAdminClubs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const clubs = await Club.find(query)
      .populate('owner', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Club.countDocuments(query);

    // Get additional stats for each club
    const clubsWithStats = await Promise.all(
      clubs.map(async (club) => {
        const eventsCount = await Event.countDocuments({ createdBy: club._id });
        const membersCount = await User.countDocuments({ clubRef: club._id });
        
        return {
          ...club.toObject(),
          eventsCount,
          membersCount
        };
      })
    );

    res.json({
      clubs: clubsWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete club (admin only)
// @route   DELETE /api/admin/clubs/:id
// @access  Private/Admin
const deleteClubAdmin = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Remove club reference from users
    await User.updateMany({ clubRef: club._id }, { $unset: { clubRef: 1 } });
    
    // Delete club events
    await Event.deleteMany({ createdBy: club._id });
    
    await Club.deleteOne({ _id: club._id });
    
    res.json({ message: 'Club and associated data removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create admin user (for initial setup)
// @route   POST /api/admin/setup
// @access  Public (should be protected in production)
const createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await User.findOne({ isAdmin: true });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Create admin user
    const adminUser = await User.create({
      name,
      email,
      password, // Store password directly
      isAdmin: true,
      isActive: true
    });

    res.status(201).json({
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAdminStats,
  getStudents,
  toggleStudentAccess,
  getAdminClubs,
  deleteClubAdmin,
  createAdminUser
};