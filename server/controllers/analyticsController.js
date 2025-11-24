// controllers/analyticsController.js
import Event from '../models/Event.js';
import Club from '../models/Club.js';

// @desc    Get club analytics overview
// @route   GET /api/analytics/club/:clubId
// @access  Private/ClubOwner
const getClubAnalytics = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { timeRange = '30days' } = req.query;

    // Verify club ownership
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this club' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Get events for the club within time range
    const events = await Event.find({
      createdBy: clubId,
      createdAt: { $gte: startDate }
    }).populate('parentEvent', 'title');

    // Calculate analytics
    const totalEvents = events.length;
    const totalParticipants = events.reduce((sum, event) => sum + event.participantsCount, 0);
    const totalViews = events.reduce((sum, event) => sum + event.views, 0);
    const averageParticipation = totalEvents > 0 ? (totalParticipants / totalEvents) : 0;

    // Calculate growth (compared to previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (timeRange === '7days' ? 7 : 
                            timeRange === '30days' ? 30 : 
                            timeRange === '90days' ? 90 : 365));

    const previousEvents = await Event.find({
      createdBy: clubId,
      createdAt: { 
        $gte: previousStartDate,
        $lt: startDate
      }
    });

    const previousParticipants = previousEvents.reduce((sum, event) => sum + event.participantsCount, 0);
    const participationGrowth = previousParticipants > 0 ? 
      ((totalParticipants - previousParticipants) / previousParticipants * 100) : 100;

    // Event performance data
    const eventPerformance = events.map(event => ({
      eventId: event._id,
      title: event.title,
      participants: event.participantsCount,
      views: event.views,
      conversionRate: event.views > 0 ? (event.participantsCount / event.views * 100) : 0,
      trend: event.participantsCount > (previousEvents.find(e => e._id.toString() === event._id.toString())?.participantsCount || 0) ? 'up' : 'down'
    })).sort((a, b) => b.participants - a.participants);

    res.json({
      overview: {
        totalEvents,
        totalParticipants,
        totalViews,
        averageParticipation: Math.round(averageParticipation * 10) / 10,
        participationGrowth: Math.round(participationGrowth * 10) / 10
      },
      eventPerformance,
      timeRange
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event-specific analytics
// @route   GET /api/analytics/event/:eventId
// @access  Private/ClubOwner
const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate('createdBy');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Verify club ownership
    if (event.createdBy.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this event' });
    }

    // Get form responses data (this would come from your form response system)
    const formResponses = await getFormResponsesData(eventId);

    res.json({
      event: {
        title: event.title,
        participants: event.participantsCount,
        views: event.views,
        conversionRate: event.views > 0 ? (event.participantsCount / event.views * 100) : 0
      },
      formResponses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get participation trends
// @route   GET /api/analytics/participation-trends/:clubId
// @access  Private/ClubOwner
const getParticipationTrends = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { timeRange = '30days' } = req.query;

    const club = await Club.findById(clubId);
    if (!club || club.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Calculate monthly trends
    const monthlyTrends = [];
    const months = 6; // Last 6 months

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthlyEvents = await Event.find({
        createdBy: clubId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const participants = monthlyEvents.reduce((sum, event) => sum + event.participantsCount, 0);
      
      monthlyTrends.push({
        month: startOfMonth.toLocaleDateString('en-US', { month: 'short' }),
        participants,
        events: monthlyEvents.length
      });
    }

    res.json(monthlyTrends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get form response analytics
// @route   GET /api/analytics/form-responses/:clubId
// @access  Private/ClubOwner
const getFormAnalytics = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { eventId } = req.query;

    const club = await Club.findById(clubId);
    if (!club || club.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mock form response data - in real app, this would come from your form response system
    const formResponses = [
      {
        question: "Year of Study",
        data: {
          "I Year": Math.floor(Math.random() * 30) + 20,
          "II Year": Math.floor(Math.random() * 40) + 30,
          "III Year": Math.floor(Math.random() * 25) + 15,
          "IV Year": Math.floor(Math.random() * 20) + 10
        }
      },
      {
        question: "Department",
        data: {
          "CSE": Math.floor(Math.random() * 50) + 30,
          "IT": Math.floor(Math.random() * 30) + 20,
          "ECE": Math.floor(Math.random() * 20) + 10,
          "EEE": Math.floor(Math.random() * 15) + 5,
          "Others": Math.floor(Math.random() * 10) + 5
        }
      },
      {
        question: "Interest Level",
        data: {
          "Very Interested": Math.floor(Math.random() * 70) + 20,
          "Interested": Math.floor(Math.random() * 30) + 15,
          "Neutral": Math.floor(Math.random() * 20) + 5,
          "Not Interested": Math.floor(Math.random() * 10) + 2
        }
      }
    ];

    // Convert counts to percentages
    const normalizedResponses = formResponses.map(response => {
      const total = Object.values(response.data).reduce((sum, count) => sum + count, 0);
      const normalizedData = {};
      
      Object.entries(response.data).forEach(([key, value]) => {
        normalizedData[key] = Math.round((value / total) * 100);
      });

      return {
        question: response.question,
        data: normalizedData
      };
    });

    res.json(normalizedResponses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get form responses (mock implementation)
const getFormResponsesData = async (eventId) => {
  // This would typically query your form responses database
  // For now, return mock data
  return [
    { name: 'John Doe', email: 'john@student.com', department: 'CSE', year: '3rd' },
    { name: 'Jane Smith', email: 'jane@student.com', department: 'ECE', year: '2nd' },
    { name: 'Mike Johnson', email: 'mike@student.com', department: 'MECH', year: '4th' }
  ];
};

export {
  getClubAnalytics,
  getEventAnalytics,
  getParticipationTrends,
  getFormAnalytics
};