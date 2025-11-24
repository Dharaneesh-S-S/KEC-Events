import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { eventsAPI, studentAPI } from '../../services/api';

const StudentCalendarPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // 'month' or 'week'

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== 'student')) {
      navigate('/login');
      return;
    }
  }, [user, isAuthenticated, loading, navigate]);

  useEffect(() => {
    loadEvents();
    loadRegisteredEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // Mock data - replace with actual API call
      const mockEvents = [
        {
          _id: '1',
          title: 'Tech Symposium 2024',
          date: '2024-02-15T10:00:00.000Z',
          time: '10:00 AM',
          venue: 'Main Auditorium',
          eventType: 'super'
        },
        {
          _id: '2',
          title: 'Web Development Workshop',
          date: '2024-02-20T14:00:00.000Z',
          time: '2:00 PM',
          venue: 'Computer Lab 101',
          eventType: 'single'
        },
        {
          _id: '3',
          title: 'AI Hackathon',
          date: '2024-02-25T09:00:00.000Z',
          time: '9:00 AM',
          venue: 'Innovation Center',
          eventType: 'super'
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadRegisteredEvents = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRegisteredEvents = ['1', '2'];
      setRegisteredEvents(mockRegisteredEvents);
    } catch (error) {
      console.error('Error loading registered events:', error);
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: dayDate.toDateString() === today.toDateString()
      });
    }

    // Next month days
    const totalCells = 42; // 6 weeks
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const isEventRegistered = (eventId) => {
    return registeredEvents.includes(eventId);
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/dashboard')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Calendar</h1>
          <p className="text-xl text-gray-600">View and manage all your events in one place</p>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
              <div className="flex space-x-1">
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateDate(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'month' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'week' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekdays.map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayEvents = getEventsForDate(day.date);
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`
                      min-h-24 p-2 border rounded-lg cursor-pointer transition-all duration-200
                      ${day.isCurrentMonth 
                        ? 'bg-white hover:bg-gray-50 border-gray-200' 
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                      }
                      ${day.isToday ? 'border-blue-500 border-2' : ''}
                      ${selectedDate?.toDateString() === day.date.toDateString() 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : ''
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`
                        text-sm font-medium
                        ${day.isToday ? 'bg-blue-600 text-white px-2 py-1 rounded-full' : ''}
                      `}>
                        {day.date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Events for the day */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event._id}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity
                            ${isEventRegistered(event._id)
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/student/events/register', { state: { event } });
                          }}
                        >
                          <div className="flex items-center">
                            {isEventRegistered(event._id) && (
                              <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                            )}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Selected Date Events */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Select a Date'}
              </h3>

              {selectedDate ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No events scheduled</p>
                  ) : (
                    getEventsForDate(selectedDate).map(event => (
                      <div
                        key={event._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate('/student/events/register', { state: { event } })}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          {isEventRegistered(event._id) && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.venue}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Click on a date to view events</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Calendar Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Events:</span>
                  <span className="font-bold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Registered:</span>
                  <span className="font-bold">{registeredEvents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>This Month:</span>
                  <span className="font-bold">
                    {events.filter(event => {
                      const eventDate = new Date(event.date);
                      return eventDate.getMonth() === currentDate.getMonth() &&
                             eventDate.getFullYear() === currentDate.getFullYear();
                    }).length}
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

export default StudentCalendarPage;