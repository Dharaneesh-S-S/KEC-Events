// pages/HomePage.jsx
import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { events } from '../data/events';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

      <main className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-8"> 
          <div className="mb-8 px-4"> {/* Added px-4 only to the heading section */}
    <h1 className="text-3xl font-bold mb-2">Welcome to KEC Fests</h1>
    <p className="text-lg text-gray-600">
      Discover and participate in exciting events at Kongu Engineering College
    </p>
  </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onRegister={handleRegister}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>

        {!filteredAndSortedEvents.length && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              No events found matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
