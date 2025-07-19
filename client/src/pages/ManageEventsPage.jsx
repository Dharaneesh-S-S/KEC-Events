// pages/ManageEventsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import { events } from '../data/events';

function ManageEventsPage() {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  /* ---------- Mock filter: club's events ---------- */
  const clubEvents = events.filter(
    (e) => e.category === 'Technical' || e.category === 'Cultural',
  );

  const handleEdit = (ev) => {
    navigate(`/club/edit-event/${ev.id}`, { state: { event: ev } });
  };

  const handleDelete = (ev) => {
    setEventToDelete(ev);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      console.log('Deleting event:', eventToDelete.id);
      alert(`Event “${eventToDelete.title}” deleted successfully!`);
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSort={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/club')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Manage Events</h1>
          <p className="text-lg text-gray-600">Edit or delete your club events</p>
        </div>

        {!clubEvents.length ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Events Created</h3>
            <p className="text-gray-500 mb-6">
              You haven’t created any events yet.
            </p>
            <button
              onClick={() => navigate('/club/create-event')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="relative">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="w-full h-48 object-cover"
                  />
                  {ev.isFree && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Free
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{ev.title}</h3>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(ev.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {ev.venue}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {ev.teamSize}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {ev.category}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(ev)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ev)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete modal */}
        {showDeleteModal && eventToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Event</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete “{eventToDelete.title}”? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
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
