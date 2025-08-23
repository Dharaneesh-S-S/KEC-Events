import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { events } from '../data/events';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, CalendarDays, Mail } from 'lucide-react';

function StudentDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    // In a real application, you would fetch registered events for the logged-in user
    // For this example, we'll filter from the dummy events based on a hypothetical user's registered event IDs
    if (user && isAuthenticated) {
      const dummyRegisteredEventIds = ['e101', 'e103']; // Example: replace with actual fetched data
      const userRegistered = events.filter(event => dummyRegisteredEventIds.includes(event.id));
      // Sort by date, latest first
      userRegistered.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRegisteredEvents(userRegistered);
    }
  }, [user, isAuthenticated]);

  /* ---------- Derived list ---------- */
  const filteredAndSortedEvents = useMemo(() => {
    let data = events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (sortBy) {
      data.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(a.date) - new Date(b.date);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'popularity':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
    }
    return data;
  }, [searchQuery, sortBy]);

  const handleRegister = (ev) => {
    if (isAuthenticated) navigate(`/events/register?selected=${ev.id}`);
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearchQuery} onSort={setSortBy} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {isAuthenticated && user && (
          <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user.name}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                <User className="w-7 h-7 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="text-lg font-semibold text-gray-900">{user.studentId || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                <Mail className="w-7 h-7 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                <CalendarDays className="w-7 h-7 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="text-lg font-semibold text-gray-900">{user.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Calendar Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Calendar</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Calendar integration coming soon!</p>
          </div>
        </section>

        {/* Registered Events Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Registered Events</h2>
          {!registeredEvents.length ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Registered Events</h3>
              <p className="text-gray-500">
                You haven't registered for any events yet. Explore events and register!
              </p>
              <button
                onClick={() => navigate('/events')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
                <EventCard key={event.id} event={event} onRegister={() => navigate(`/events/register?selected=${event.id}`)} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentDashboardPage;
