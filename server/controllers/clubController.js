import Club from '../models/Club.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import slugify from 'slugify';
import { sendMail } from '../utils/mail.js';

// @desc    Create a club
// @route   POST /api/clubs
// @access  Private
const createClub = async (req, res) => {
  try {
    const { name, description, logoUrl, gallery, contactInfo, slug, ownerEmail, ownerName } = req.body;

    // 1️⃣ Check if club with same name exists
    const clubExists = await Club.findOne({ name });
    if (clubExists) {
      return res.status(400).json({ message: 'Club already exists' });
    }

    if (!req.body.parentEvent) delete req.body.parentEvent;


    // 2️⃣ Generate slug (normalized and unique)
    const baseSlug = slug
      ? slugify(slug.trim(), { lower: true, strict: true })
      : slugify(name.trim(), { lower: true, strict: true });

    let clubSlug = baseSlug;
    let slugExists = await Club.findOne({ slug: clubSlug });

    // Append random hex until unique
    while (slugExists) {
      const randomSuffix = crypto.randomBytes(3).toString('hex'); // 6 chars
      clubSlug = `${baseSlug}-${randomSuffix}`;
      slugExists = await Club.findOne({ slug: clubSlug });
    }

    // 3️⃣ Create club owner user
    const randomPassword = Math.random().toString(36).slice(-8);
    const ownerUser = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: randomPassword,
      isAdmin: false,
      isActive: true
    });

    // 4️⃣ Create club
    const club = await Club.create({
      name,
      slug: clubSlug,
      description,
      logoUrl,
      gallery: gallery || [],
      contactInfo: contactInfo || [],
      owner: ownerUser._id
    });

    // Link club to owner
    ownerUser.clubRef = club._id;
    await ownerUser.save();

    // 5️⃣ Send email with credentials
    await sendMail({
      to: ownerEmail,
      subject: 'Your KEC-Events Club Account Created',
      text: `Hello ${ownerName},\n\nYour club "${name}" has been created.\nYour login credentials:\nEmail: ${ownerEmail}\nPassword: ${randomPassword}\n\nPlease log in and update your password.`,
    });

    const createdClub = await Club.findById(club._id).populate('owner', 'name email');
    res.status(201).json(createdClub);

  } catch (error) {
    // Extra safeguard for duplicate key (very unlikely now)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists. Please choose a different one.' });
    }
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res) => {
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

    res.json({
      clubs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get club by ID
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('contactInfo');

    if (club) {
      // Get club events count
      const eventsCount = await Event.countDocuments({ createdBy: club._id });
      
      res.json({
        ...club.toObject(),
        eventsCount
      });
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClubBySlug = async (req, res) => {
  try {
    const club = await Club.findOne({ slug: req.params.slug })
      .populate('owner', 'name email')
      .populate('contactInfo');

    if (club) {
      // Get club events count
      const eventsCount = await Event.countDocuments({ createdBy: club._id });
      
      res.json({
        ...club.toObject(),
        eventsCount
      });
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private/ClubOwner
const updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (club) {
      club.name = req.body.name || club.name;
      club.description = req.body.description || club.description;
      club.logoUrl = req.body.logoUrl || club.logoUrl;
      club.gallery = req.body.gallery || club.gallery;
      club.contactInfo = req.body.contactInfo || club.contactInfo;

      // Handle slug update
      if (req.body.slug && req.body.slug !== club.slug) {
        const slugExists = await Club.findOne({ 
          slug: req.body.slug, 
          _id: { $ne: club._id } 
        });
        
        if (slugExists) {
          return res.status(400).json({ message: 'Slug already exists. Please choose a different one.' });
        }
        
        club.slug = req.body.slug;
      }

      const updatedClub = await club.save();
      const populatedClub = await Club.findById(updatedClub._id)
        .populate('owner', 'name email')
        .populate('contactInfo');

      res.json(populatedClub);
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists. Please choose a different one.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private/ClubOwner
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (club) {
      // Remove club reference from users
      await User.updateMany({ clubRef: club._id }, { $unset: { clubRef: 1 } });
      
      // Delete club events
      await Event.deleteMany({ createdBy: club._id });
      
      await Club.deleteOne({ _id: club._id });
      res.json({ message: 'Club removed' });
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's clubs
// @route   GET /api/clubs/my/clubs
// @access  Private
const getMyClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add contact to club
// @route   POST /api/clubs/:id/contacts
// @access  Private/ClubOwner
const addClubContact = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (club) {
      const newContact = {
        name: req.body.name,
        role: req.body.role,
        email: req.body.email,
        phone: req.body.phone,
        position: req.body.position
      };

      club.contactInfo.push(newContact);
      const updatedClub = await club.save();

      res.json(updatedClub.contactInfo[updatedClub.contactInfo.length - 1]);
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update club contact
// @route   PUT /api/clubs/:id/contacts/:contactId
// @access  Private/ClubOwner
const updateClubContact = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (club) {
      const contact = club.contactInfo.id(req.params.contactId);
      
      if (contact) {
        contact.name = req.body.name || contact.name;
        contact.role = req.body.role || contact.role;
        contact.email = req.body.email || contact.email;
        contact.phone = req.body.phone || contact.phone;
        contact.position = req.body.position || contact.position;

        const updatedClub = await club.save();
        res.json(contact);
      } else {
        res.status(404).json({ message: 'Contact not found' });
      }
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove contact from club
// @route   DELETE /api/clubs/:id/contacts/:contactId
// @access  Private/ClubOwner
const removeClubContact = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (club) {
      club.contactInfo.pull({ _id: req.params.contactId });
      await club.save();
      
      res.json({ message: 'Contact removed' });
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add image to gallery
// @route   POST /api/clubs/:id/gallery
// @access  Private/ClubOwner
const addGalleryImage = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (club) {
      club.gallery.push(req.body.imageUrl);
      const updatedClub = await club.save();

      res.json(updatedClub.gallery);
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove image from gallery
// @route   DELETE /api/clubs/:id/gallery/:imageIndex
// @access  Private/ClubOwner
const removeGalleryImage = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (club) {
      const imageIndex = parseInt(req.params.imageIndex);
      
      if (imageIndex >= 0 && imageIndex < club.gallery.length) {
        club.gallery.splice(imageIndex, 1);
        const updatedClub = await club.save();
        
        res.json(updatedClub.gallery);
      } else {
        res.status(400).json({ message: 'Invalid image index' });
      }
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createClub,
  getClubs,
  getClubById,
  getClubBySlug,
  updateClub,
  deleteClub,
  getMyClubs,
  addClubContact,
  updateClubContact,
  removeClubContact,
  addGalleryImage,
  removeGalleryImage
};