import VenueBookingRule from '../models/VenueBookingRule.js';

export const createRule = async (req, res) => {
  try {
    const ruleData = req.body;
    ruleData.createdBy = req.user.id;
    
    const rule = await VenueBookingRule.create(ruleData);
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: 'Rule creation failed', error: err.message });
  }
};

export const getRules = async (req, res) => {
  try {
    const { venueType, venueId, department, userRole, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (venueType) filter.venueType = venueType;
    if (venueId) filter.venueId = venueId;
    if (department) filter.department = department;
    if (userRole) filter.userRole = userRole;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const skip = (page - 1) * limit;
    
    const rules = await VenueBookingRule.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('venueId', 'name venueType');
    
    const total = await VenueBookingRule.countDocuments(filter);
    
    res.json({
      rules,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rules', error: err.message });
  }
};

export const getRuleById = async (req, res) => {
  try {
    const rule = await VenueBookingRule.findById(req.params.id)
      .populate('venueId', 'name venueType');
    
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    
    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rule', error: err.message });
  }
};

export const updateRule = async (req, res) => {
  try {
    const rule = await VenueBookingRule.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    
    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: 'Rule update failed', error: err.message });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const rule = await VenueBookingRule.findByIdAndDelete(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    
    res.json({ message: 'Rule deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Rule deletion failed', error: err.message });
  }
};

export const toggleRuleStatus = async (req, res) => {
  try {
    const rule = await VenueBookingRule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    
    rule.isActive = !rule.isActive;
    rule.updatedAt = Date.now();
    await rule.save();
    
    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle rule status', error: err.message });
  }
};

export const getApplicableRules = async (req, res) => {
  try {
    const { venueType, venueId, department, userRole } = req.query;
    
    const rules = await VenueBookingRule.find({
      isActive: true,
      $or: [
        { venueType: 'all' },
        { venueType: venueType },
        { venueId: venueId },
        { department: department },
        { userRole: userRole || 'all' }
      ]
    }).sort({ priority: -1 });
    
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applicable rules', error: err.message });
  }
};











