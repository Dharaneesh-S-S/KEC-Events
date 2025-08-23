// pages/ManageEventsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
// import { apiRequest } from '../services/api'; // Removed apiRequest import

function ManageEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([
    {
      _id: '1',
      title: 'Annual Tech Fest',
      date: new Date(2024, 9, 20).toISOString(), // Oct 20, 2024
      venue: 'Main Auditorium',
      teamSize: '1-3 members',
      category: 'Technical',
      isFree: true,
      image: 'https://picsum.photos/seed/techfest/400/200',
    },
    {
      _id: '2',
      title: 'Cultural Extravaganza',
      date: new Date(2024, 10, 15).toISOString(), // Nov 15, 2024
      venue: 'Amphitheater',
      teamSize: 'Individual',
      category: 'Cultural',
      isFree: false,
      image: 'https://picsum.photos/seed/cultural/400/200',
    },
    {
      _id: '3',
      title: 'Sports Day Challenge',
      date: new Date(2024, 11, 5).toISOString(), // Dec 5, 2024
      venue: 'Sports Complex',
      teamSize: 'Teams of 5',
      category: 'Sports',
      isFree: true,
      image: 'https://picsum.photos/seed/sports/400/200',
    },
    {
      _id: '4',
      title: 'AI Workshop Series',
      date: new Date(2025, 0, 10).toISOString(), // Jan 10, 2025
      venue: 'CSE Block - Lab 3',
      teamSize: 'Individual',
      category: 'Workshop',
      isFree: false,
      image: 'https://picsum.photos/seed/aiworkshop/400/200',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Removed fetchEvents and useEffect for backend data fetching to display sample UI
  // This data is static and for UI demonstration only.
  // To re-enable backend fetching, uncomment the fetchEvents function and useEffect hook, and re-add the apiRequest import.

  const handleEdit = (ev) => {
    navigate(`/club/edit-event/${ev._id}`, { state: { event: ev } });
  };

  const handleDelete = (ev) => {
    setEventToDelete(ev);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      // await apiRequest(`/events/${eventToDelete._id}`, { method: 'DELETE' }); // Original line commented out
      alert(`Event “${eventToDelete.title}” deleted successfully!`);
      setEvents(events.filter((e) => e._id !== eventToDelete._id));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete event.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600 font-medium">Loading events...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Error Loading Events</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">{error}</p>
          <button
            onClick={() => {
              // Re-enable backend fetching if needed
              // fetchEvents();
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!events.length) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Events Created</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">You haven't created any events yet.</p>
          <button
            onClick={() => navigate('/club/create-event')}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Create Your First Event
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {events.map((ev) => (
          <div
            key={ev._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
          >
            <div className="relative">
              <img
                src={ev.image || 'https://via.placeholder.com/400x200'}
                alt={ev.title}
                className="w-full h-52 object-cover rounded-t-2xl"
              />
              {ev.isFree && (
                <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md">
                  Free
                </span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 leading-tight text-gray-900">{ev.title}</h3>
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">{new Date(ev.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">{ev.venue}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">{ev.teamSize}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-full font-medium">
                  {ev.category}
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEdit(ev)}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                    title="Edit Event"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ev)}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                    title="Delete Event"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSort={false} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 leading-tight text-gray-900">Manage Events</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">Edit or delete your club events</p>
        </div>

        {renderContent()}

        {/* Delete Modal */}
        {showDeleteModal && eventToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Event</h3>
                <p className="text-gray-600 leading-relaxed">
                  Are you sure you want to delete "<strong>{eventToDelete.title}</strong>"? This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageEventsPage;
