import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Clock,
  Plus,
  Eye,
  Edit,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useClubEvents, useMyClub, useUpcomingEvents } from "../../hooks/useEvents";
import { eventAPI } from "../../services/eventService";

const ClubCalendarPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State hooks
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Data hooks
  const { club, loading: clubLoading, error: clubError } = useMyClub();
  const clubEventParams = useMemo(() => ({
    eventType: eventTypeFilter !== 'all' ? eventTypeFilter : '',
    sortBy: 'date',
    sortOrder: 'asc'
  }), [eventTypeFilter]);

  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useClubEvents(club?._id, clubEventParams);
  const { events: upcomingEvents } = useUpcomingEvents(5);

  // Computed values
  const filteredEvents = useMemo(() => {
    return (events || []).filter(event => {
      const eventDate = new Date(event.date);
      if (eventTypeFilter !== 'all' && event.eventType !== eventTypeFilter) return false;
      if (dateRange.start && dateRange.end) {
        return eventDate >= dateRange.start && eventDate <= dateRange.end;
      }
      return true;
    });
  }, [events, eventTypeFilter, dateRange]);

  const displayUpcomingEvents = useMemo(() => {
    if ((upcomingEvents || []).length > 0) return upcomingEvents;
    return (events || []).filter(e => new Date(e.date) >= new Date())
                          .sort((a,b) => new Date(a.date) - new Date(b.date))
                          .slice(0,5);
  }, [upcomingEvents, events]);

  // Calendar helpers
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Add current month's days
    const daysInMonth = lastDay.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ 
        date: day, 
        isCurrentMonth: true,
        isToday: day.toDateString() === new Date().toDateString()
      });
    }

    // Add next month's days
    const totalCells = 42; // 6 weeks
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }

    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'super': return 'bg-purple-500';
      case 'sub': return 'bg-orange-500';
      case 'single': return 'bg-blue-500';
      default: return 'bg-gray-500';
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

  // Event handlers
  const navigateDate = (direction) => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + (direction * 7))));
    }
  };

  const handleRefresh = () => {
    refetchEvents();
  };

  const handleCreateEvent = () => {
    navigate('/club/create-event');
  };

  const handleEventClick = (eventId) => {
    navigate(`/club/events/${eventId}`);
  };

  const handleEditEvent = (eventId, e) => {
    e.stopPropagation();
    navigate(`/club/events/edit/${eventId}`);
  };

  // Effects
  useEffect(() => {
    if (view === 'month') {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      setDateRange({ start, end });
    } else {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setDateRange({ start, end });
    }
  }, [currentDate, view]);

  // Loading and Error Components
  const LoadingComponent = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading calendar...</p>
      </div>
    </div>
  );

  const ErrorComponent = ({ message }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-600 text-xl mb-4">Error loading calendar</div>
        <p className="text-gray-600">{message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Now JSX can be conditional safely
  if (clubLoading || eventsLoading) return <LoadingComponent />;
  if (clubError) return <ErrorComponent message={clubError} />;
  if (eventsError) return <ErrorComponent message={eventsError} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => navigate('/club/dashboard')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Event Calendar</h1>
            <p className="text-xl text-gray-600 mt-2">{club ? `${club.name} - Track your event timeline and schedule` : 'Loading...'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleRefresh} className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg">
              <RefreshCw className="w-5 h-5" /> <span>Refresh</span>
            </button>
            <button onClick={handleCreateEvent} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg">
              <Plus className="w-5 h-5" /> <span>New Event</span>
            </button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
            <div className="flex space-x-1">
              <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Today</button>
              <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select value={eventTypeFilter} onChange={e => setEventTypeFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Event Types</option>
              <option value="single">Single Events</option>
              <option value="super">Main Events</option>
              <option value="sub">Sub Events</option>
            </select>
            <div className="flex space-x-2">
              {['month', 'week'].map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="grid grid-cols-7 gap-1 mb-4">{weekdays.map(day => <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">{day}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const dayEvents = getEventsForDate(day.date);
                  return (
                    <div key={idx} onClick={() => setSelectedDate(day.date)} className={`min-h-32 p-2 border rounded-lg cursor-pointer transition-all duration-200
                      ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50 border-gray-200' : 'bg-gray-50 text-gray-400 border-gray-100'}
                      ${day.isToday ? 'border-blue-500 border-2' : ''}
                      ${selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${day.isToday ? 'bg-blue-600 text-white px-2 py-1 rounded-full' : ''}`}>{day.date.getDate()}</span>
                        {dayEvents.length > 0 && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">{dayEvents.length}</span>}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <div key={event._id} className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity text-white ${getEventTypeColor(event.eventType)}`} onClick={e => { e.stopPropagation(); handleEventClick(event._id); }}>
                            <span className="truncate">{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && <div className="text-xs text-gray-500 text-center">+{dayEvents.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric'
                }) : 'Select a Date'}
              </h3>

              {selectedDate ? (
                <div className="space-y-4">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No events scheduled</p>
                  ) : (
                    getEventsForDate(selectedDate).map(event => (
                      <div
                        key={event._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleEventClick(event._id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${getEventTypeColor(event.eventType)}`}>
                            {getEventTypeDisplay(event.eventType)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            {event.time}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.venue}
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              {event.participantsCount} participants
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {event.views}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => handleEditEvent(event._id, e)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          {event.formLink && (
                            <a
                              href={event.formLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center text-sm text-green-600 hover:text-green-700"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Form
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Click on a date to view events</p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {displayUpcomingEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming events</p>
                ) : (
                  displayUpcomingEvents.map(event => (
                    <div
                      key={event._id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEventClick(event._id)}
                    >
                      <div className={`w-3 h-12 rounded-full ${getEventTypeColor(event.eventType)}`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Event Type Legend */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Event Types</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">Main Events (Super)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">Single Events</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">Sub Events</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Calendar Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Events</span>
                  <span className="font-semibold text-gray-900">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming Events</span>
                  <span className="font-semibold text-green-600">
                    {events.filter(e => new Date(e.date) >= new Date()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-blue-600">
                    {filteredEvents.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubCalendarPage;