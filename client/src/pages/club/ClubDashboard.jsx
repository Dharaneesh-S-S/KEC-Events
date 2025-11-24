import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Eye,
  Plus,
  Edit,
  BarChart3,
  Clock,
  MapPin,
  Tag,
  ArrowRight,
  Building,
  Mail,
  Phone,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Bell,
  LogOut
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../../components/common/Navbar';

const ClubDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clubInfo, setClubInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = user?.token;
      
      // Get user's club
      const clubRes = await axios.get('http://localhost:5000/api/clubs/my/clubs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (clubRes.data.length === 0) {
        alert('You need to create a club first!');
        navigate('/club/create-club');
        return;
      }

      const userClub = clubRes.data[0];
      setClubInfo(userClub);

      // Get club events
      const eventsRes = await axios.get(`http://localhost:5000/api/events/club/${userClub._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const clubEvents = eventsRes.data.events || [];
      setEvents(clubEvents);
      
      // Calculate stats
      const currentDate = new Date();
      const upcomingEvents = clubEvents.filter(event => new Date(event.date) >= currentDate);
      const pastEvents = clubEvents.filter(event => new Date(event.date) < currentDate);
      
      setStats({
        totalEvents: clubEvents.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert(error.response?.data?.message || 'Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  const actionButtons = [
    {
      icon: MapPin,
      title: 'Venue Booking',
      description: 'Book venues for your events',
      path: '/venues',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      icon: Plus,
      title: 'Create Events',
      description: 'Create new events for your club',
      path: '/club/create-event',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: Edit,
      title: 'Manage Events',
      description: 'Edit and manage existing events',
      path: '/club/events/manage',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'View your notifications',
      path: '/club/notifications',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      icon: Mail,
      title: 'Contact',
      description: 'View faculty and staff contacts',
      path: '/contacts',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      icon: Calendar,
      title: 'Calendar',
      description: 'View Calendar of events',
      path: '/club/calendar',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'super': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'sub': return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
      case 'single': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
    }
  };

  const getEventTypeDisplay = (eventType) => {
    switch (eventType) {
      case 'super': return 'Main Event';
      case 'sub': return 'Sub Event';
      case 'single': return 'Single Event';
      default: return eventType;
    }
  };

  const getEventStatus = (eventDate) => {
    const currentDate = new Date();
    return new Date(eventDate) >= currentDate ? 'upcoming' : 'past';
  };

  const getStatusColor = (status) => {
    return status === 'upcoming' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      <div className="flex-1 lg:ml-0">
        <Navbar
          showBackButton={false}
          showSearch={false}
        />

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Club Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Welcome back, {user?.name}! Manage your club events and activities.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {/* Left Column - Club Info & Stats */}
            <div className="lg:col-span-1 space-y-8">
              {/* Club Info Card */}
              {clubInfo && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <div className="flex flex-col items-center text-center mb-4">
                    {clubInfo.logoUrl ? (
                      <div className="relative mb-4">
                        <img
                          src={clubInfo.logoUrl}
                          alt={clubInfo.name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-gray-200 mx-auto"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mx-auto mb-4">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                      {clubInfo.name}
                    </h2>
                    <p className="text-gray-600 mt-2 text-sm line-clamp-3">{clubInfo.description}</p>
                  </div>
                  
                  <button
                    onClick={() => navigate('/club/profile')}
                    className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-xl transition-all duration-200 mb-4"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>

                  {/* Contact Info */}
                  {clubInfo.contactInfo && clubInfo.contactInfo.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Contact Info</h4>
                      {clubInfo.contactInfo.slice(0, 2).map((contact, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="font-semibold text-gray-900 text-sm">{contact.name}</p>
                          <p className="text-blue-600 text-xs">{contact.role}</p>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Phone className="w-3 h-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Overview - Vertical */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Event Stats
                </h3>
                <div className="space-y-4">
                  {/* Total Events */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Total Events</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{stats.totalEvents}</span>
                  </div>

                  {/* Upcoming Events */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Upcoming</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{stats.upcomingEvents}</span>
                  </div>

                  {/* Past Events */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Past Events</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{stats.pastEvents}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Action Buttons & Recent Events */}
            <div className="lg:col-span-3 space-y-8">
              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actionButtons.map((btn, index) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.path}
                      onClick={() => navigate(btn.path)}
                      className={`${btn.color} text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left`}
                    >
                      <div className="flex items-start space-x-4">
                        <Icon className="w-10 h-10 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-bold mb-2 leading-tight">{btn.title}</h3>
                          <p className="text-sm opacity-90 leading-relaxed">{btn.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Recent Events Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Recent Events</h3>
                  </div>
                  <button
                    onClick={() => navigate('/club/events/manage')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer"
                        onClick={() => navigate('/club/events/manage')}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900 text-base">{event.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEventTypeColor(event.eventType)}`}>
                            {getEventTypeDisplay(event.eventType)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(event.date)} {event.time && `• ${formatTime(event.time)}`}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{event.venue}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(getEventStatus(event.date))}`}>
                              {getEventStatus(event.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h4>
                    <p className="text-gray-600 mb-4">Start by creating your first event</p>
                    <button
                      onClick={() => navigate('/club/create-event')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium"
                    >
                      Create First Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClubDashboard;