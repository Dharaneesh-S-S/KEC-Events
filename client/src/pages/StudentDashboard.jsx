// pages/StudentDashboard.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { events } from '../data/events';

function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const navigate = useNavigate();

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(
      (e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (sortBy) {
      filtered.sort((a, b) => {
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
    return filtered;
  }, [searchQuery, sortBy]);

  const handleRegister = (ev) => {
    navigate(`/events/register?selected=${ev.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearchQuery} onSort={setSortBy} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Explore and register for upcoming events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              isAuthenticated={true}
            />
          ))}
        </div>

        {filteredAndSortedEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No events found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
export default StudentDashboard;
