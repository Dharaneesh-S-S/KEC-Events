
// pages/VenueBookingPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Settings, LogOut, Menu, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

function VenueBookingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
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
        </main>
      </div>
    </div>
  );
}
export default VenueBookingPage;