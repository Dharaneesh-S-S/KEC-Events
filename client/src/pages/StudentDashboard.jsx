import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Filter,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { eventsAPI } from '../services/api';

const StudentDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [carouselPlaying, setCarouselPlaying] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectedMode, setSelectedMode] = useState('');

  // Featured events for carousel
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== 'student')) {
      navigate('/login');
      return;
    }
  }, [user, isAuthenticated, loading, navigate]);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    // Auto-advance carousel
    if (carouselPlaying && featuredEvents.length > 0) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex((prev) => 
          prev === featuredEvents.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselPlaying, featuredEvents.length]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await eventsAPI.getAll();
      const allEvents = response || [];
      
      // Filter out past events and sort by date
      const currentDate = new Date();
      const upcomingEvents = allEvents
        .filter(event => new Date(event.eventDate) >= currentDate)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
      
      setEvents(upcomingEvents);
      setFilteredEvents(upcomingEvents);
      
      // Set featured events (first 5 upcoming events)
      setFeaturedEvents(upcomingEvents.slice(0, 5));
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filter
    if (selectedDateRange) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.eventDate);
        switch (selectedDateRange) {
          case 'today':
            return eventDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return eventDate.toDateString() === tomorrow.toDateString();
          case 'next-week':
            return eventDate >= today && eventDate <= nextWeek;
          case 'next-month':
            return eventDate >= today && eventDate <= nextMonth;
          default:
            return true;
        }
      });
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(event => 
        event.venueBooking?.department === selectedDepartment
      );
    }

    // Event type filter
    if (selectedEventType) {
      filtered = filtered.filter(event => 
        event.category === selectedEventType
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedDateRange, selectedDepartment, selectedEventType, selectedMode]);

  const handleEventClick = (event) => {
    navigate(`/events/register`, { state: { event } });
  };

  const nextCarousel = () => {
    setCurrentCarouselIndex((prev) => 
      prev === featuredEvents.length - 1 ? 0 : prev + 1
    );
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => 
      prev === 0 ? featuredEvents.length - 1 : prev - 1
    );
  };

  const toggleCarousel = () => {
    setCarouselPlaying(!carouselPlaying);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Go Back to Home"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Discover & Join College Events
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Explore workshops, hackathons, seminars, and more exciting events at KEC
            </p>
          </div>

          {/* Featured Events Carousel */}
          {featuredEvents.length > 0 && (
            <div className="relative max-w-5xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex transition-transform duration-500 ease-in-out"
                     style={{ transform: `translateX(-${currentCarouselIndex * 100}%)` }}>
                  {featuredEvents.map((event, index) => (
                    <div key={event._id} className="w-full flex-shrink-0 p-12">
                      <div className="text-center">
                        <h3 className="text-3xl font-bold mb-4 leading-tight">{event.title}</h3>
                        <p className="text-xl text-blue-100 mb-6 leading-relaxed max-w-2xl mx-auto">{event.description}</p>
                        <div className="flex items-center justify-center space-x-6 text-base">
                          <span className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            {event.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Carousel Controls */}
                <button
                  onClick={prevCarousel}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={nextCarousel}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
                
                {/* Carousel Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {featuredEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCarouselIndex(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-200 ${
                        index === currentCarouselIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Play/Pause Button */}
                <button
                  onClick={toggleCarousel}
                  className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 hover:scale-110"
                >
                  {carouselPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search events by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="next-week">Next Week</option>
                <option value="next-month">Next Month</option>
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[160px]"
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>

              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]"
              >
                <option value="">All Types</option>
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Seminar">Seminar</option>
                <option value="Competition">Competition</option>
                <option value="Training">Training</option>
              </select>

              <button className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 flex items-center font-medium hover:shadow-md">
                <Filter className="w-5 h-5 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Event Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {filteredEvents.length} Events Found
              </h2>
              {loadingEvents && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              )}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No events found</h3>
                <p className="text-gray-500 text-lg">Try adjusting your search criteria or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-gray-100"
                    onClick={() => handleEventClick(event)}
                  >
                    {/* Event Image */}
                    <div className="relative h-52 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-2xl overflow-hidden">
                      {event.posterLink ? (
                        <img
                          src={event.posterLink}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-20 h-20 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Event Type Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 shadow-sm">
                          {event.category}
                        </span>
                      </div>
                      
                      {/* Free/Paid Badge */}
                      {event.isFree && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 shadow-sm">
                            Free
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="p-7">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Event Meta */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                          {new Date(event.eventDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                          {event.venue}
                        </div>
                        
                        {event.teamSize && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="w-5 h-5 mr-3 text-gray-400" />
                            Team Size: {event.teamSize}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group-hover:bg-blue-700 hover:shadow-lg">
                        View Details
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h3>
              
              {events.slice(0, 5).map((event) => (
                <div
                  key={event._id}
                  className="border-b border-gray-100 last:border-b-0 py-4 cursor-pointer hover:bg-gray-50 rounded-xl px-3 -mx-3 transition-all duration-200"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                      <Calendar className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors leading-tight">
                        {event.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(event.eventDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
