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
  const { isAuthenticated, user } = useAuth();
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

  const handleBack = () => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'club') {
        navigate('/dashboard/club');
      } else {
        navigate('/dashboard/student');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button for logged-in users */}
      {isAuthenticated && (
        <button
          onClick={handleBack}
          className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
          title="Go Back to Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      )}

      <Navbar onSearch={setSearchQuery} onSort={setSortBy} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24"> 
        {/* Hero Section */}
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Welcome to KEC Fests
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover and participate in exciting events at Kongu Engineering College
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredAndSortedEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onRegister={handleRegister}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>

        {/* No Results Message */}
        {!filteredAndSortedEvents.length && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">
                No events match your current search criteria. Try adjusting your search or filters.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
