
// pages/VenueBookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Settings, LogOut, Menu, Globe, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import Sidebar from '../components/Sidebar';

function VenueBookingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookings, setBookings] = useState([]);

  const venueTypes = [
    {
      id: 'cc',
      title: 'CC Booking',
      description: 'Book computer centers for technical events',
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/club/venue-booking/cc',
    },
    {
      id: 'seminar',
      title: 'Seminar Hall Booking',
      description: 'Book seminar halls for presentations',
      color: 'bg-green-600 hover:bg-green-700',
      path: '/club/venue-booking/seminar',
    },
    {
      id: 'maharaja',
      title: 'Maharaja Booking',
      description: 'Book Maharaja hall for large events',
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/club/venue-booking/maharaja',
    },
    {
      id: 'convention',
      title: 'Convention Center Booking',
      description: 'Book convention center for conferences',
      color: 'bg-orange-600 hover:bg-orange-700',
      path: '/club/venue-booking/convention',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const clubId = user?.id || user?._id;
        if (!clubId) return;
        const res = await bookingsAPI.getByClub(clubId, { limit: 5 });
        setBookings(res.bookings || res || []);
      } catch (e) {
        console.error('Failed to load recent bookings', e);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0">
        {/* Navbar */}
        <nav className="fixed top-0 inset-x-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-blue-600"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">KEC</span>
                  </div>
                  <span className="text-xl font-bold">Fests</span>
                </div>
              </div>
              <span className="text-lg font-medium text-gray-700">Venue Booking</span>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-blue-600">
                  <Settings className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600">
                  <Globe className="w-6 h-6" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        {/* Spacer to avoid content underlap */}
        <div className="h-16" />

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard/club')}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-2">Venue Booking Dashboard</h1>
            <p className="text-lg text-gray-600">
              Select a venue type to start booking for your events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venueTypes.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate(v.path)}
                className={`${v.color} text-white p-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition`}
              >
                <div className="flex items-center space-x-4">
                  <MapPin className="w-12 h-12" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{v.title}</h3>
                    <p className="text-sm opacity-90">{v.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* My Recent Bookings */}
          <div className="mt-10 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Recent Booked Venues</h2>
              <button
                onClick={() => navigate('/club/venue-bookings')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View All Bookings
              </button>
            </div>
            {loadingBookings ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading your recent bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No bookings yet. Start by selecting a venue type above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty In-Charge</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((b) => (
                      <tr key={b._id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.eventName || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.venue?.name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.fromDate ? new Date(b.fromDate).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.fromTime ? `${b.fromTime} - ${b.toTime || ''}` : '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.facultyInCharge || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.department || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{b.participants ?? '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {(b.status || 'pending').charAt(0).toUpperCase() + (b.status || 'pending').slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
export default VenueBookingPage;