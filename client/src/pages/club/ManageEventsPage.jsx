import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  BarChart3,
  ExternalLink,
  X,
  Clock,
  Tag
} from 'lucide-react';
import axios from 'axios';

const ManageEventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [club, setClub] = useState(null);

  useEffect(() => {
    loadClubAndEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, statusFilter, typeFilter]);

  const loadClubAndEvents = async () => {
    setLoading(true);
    try {
      const token = user?.token;
      
      // First, get the user's club
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
      setClub(userClub);

      // Then, get events for this club
      const eventsRes = await axios.get(`http://localhost:5000/api/events/club/${userClub._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(eventsRes.data.events || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading club and events:', error);
      alert(error.response?.data?.message || 'Failed to load events. Please try again.');
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const currentDate = new Date();
      if (statusFilter === 'upcoming') {
        filtered = filtered.filter(event => new Date(event.date) >= currentDate);
      } else if (statusFilter === 'past') {
        filtered = filtered.filter(event => new Date(event.date) < currentDate);
      }
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === typeFilter);
    }

    setFilteredEvents(filtered);
  };
  
  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const token = user?.token;
        await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Remove from local state
        setEvents(prev => prev.filter(event => event._id !== eventId));
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(error.response?.data?.message || 'Failed to delete event. Please try again.');
      }
    }
  };

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

  // Generate sheet URL from formSheetId for preview
  const getSheetPreviewUrl = (formSheetId) => {
    if (!formSheetId) return null;
    
    // If it's already a full URL, use it directly
    if (formSheetId.startsWith('http')) {
      return formSheetId;
    }
    
    // If it's just a sheet ID, construct the URL
    return `https://docs.google.com/spreadsheets/d/${formSheetId}/edit?usp=sharing`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back Button */}
      <button
        onClick={() => navigate('/club/dashboard')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border border-gray-200"
        title="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Manage Events
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Manage events for <span className="font-semibold text-blue-600">{club?.name}</span>
              </p>
            </div>
            <button
              onClick={() => navigate('/club/create-event')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(event => getEventStatus(event.date) === 'upcoming').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(event => getEventStatus(event.date) === 'past').length}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px] bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px] bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Types</option>
                <option value="single">Single Event</option>
                <option value="super">Main Event</option>
                <option value="sub">Sub Event</option>
              </select>

              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 flex items-center font-medium border border-gray-300"
              >
                <Filter className="w-5 h-5 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="mb-8">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No events found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : "You haven't created any events yet"
                }
              </p>
              {events.length === 0 && (
                <button
                  onClick={() => navigate('/club/create-event')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium shadow-lg shadow-blue-500/25"
                >
                  Create Your First Event
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const sheetPreviewUrl = getSheetPreviewUrl(event.formSheetId);
                const isUpcoming = getEventStatus(event.date) === 'upcoming';
                
                return (
                  <div
                    key={event._id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      {event.posters && event.posters.length > 0 ? (
                        <img 
                          src={event.posters?.[0]?.url} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />

                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-blue-600" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(getEventStatus(event.date))}`}>
                          {getEventStatus(event.date)}
                        </span>
                      </div>
                      
                      {/* Event Type Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`inline-flex text-xs px-3 py-1 rounded-full font-medium ${getEventTypeColor(event.eventType)}`}>
                          {getEventTypeDisplay(event.eventType)}
                        </span>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      {/* Title and Description */}
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Date and Time */}
                      <div className="flex items-center text-sm text-gray-700 mb-3">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{formatDate(event.date)}</span>
                        {event.time && (
                          <span className="ml-2 text-gray-500">• {formatTime(event.time)}</span>
                        )}
                      </div>

                      {/* Venue */}
                      <div className="flex items-center text-sm text-gray-700 mb-4">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {event.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {event.tags.length > 3 && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              +{event.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/club/edit-event/${event._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {event.formLink && (
                            <a
                              href={event.formLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                              title="Open Form"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          
                          {sheetPreviewUrl && (
                            <button
                              onClick={() => setSelectedSheet(sheetPreviewUrl)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
                              title="View Sheet"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteEvent(event._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sheet Modal */}
      {selectedSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-5/6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Sheet Preview</h3>
              <button
                onClick={() => setSelectedSheet(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-6">
              <iframe
                src={selectedSheet}
                className="w-full h-full rounded-lg border border-gray-200"
                frameBorder="0"
                title="Sheet Preview"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEventsPage;