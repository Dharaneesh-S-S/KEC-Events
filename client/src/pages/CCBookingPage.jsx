// pages/CCBookingPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  Settings,
  LogOut,
  Globe,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { venues, departments } from '../data/venues';

function CCBookingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('IT PARK');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  const navigate = useNavigate();
  const { logout } = useAuth();

  /* ---------- Derived Data ---------- */
  const filteredDepartments = useMemo(
    () =>
      departments.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  const ccVenues = useMemo(
    () =>
      venues.filter(
        (v) => v.type === 'cc' && v.department === selectedDepartment,
      ),
    [selectedDepartment],
  );

  /* ---------- Handlers ---------- */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBookNow = (venueId) => {
    navigate(`/club/venue-booking/cc/form/${venueId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 lg:ml-0 flex">
        {/* Departments (lg+) */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 hidden lg:block">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="p-2">
            {filteredDepartments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.name)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                  selectedDepartment === dept.name
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <section className="flex-1">
          {/* Top Navbar */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* left */}
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
                    <span className="text-xl font-bold text-gray-900">Fests</span>
                  </div>
                </div>

                <span className="text-lg font-medium text-gray-700">CC Booking</span>

                {/* right */}
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-600 hover:text-blue-600">
                    <Settings className="w-6 h-6" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600">
                    <Globe className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="p-6">
            {/* header */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/club/venue-booking')}
                className="text-blue-600 hover:text-blue-700 mb-4 flex items-center space-x-2"
              >
                ← Back to Venue Booking
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                CC Booking — {selectedDepartment}
              </h1>
              <p className="text-gray-600">
                Select a computer center to book for your event
              </p>
            </div>

            {/* mobile dept selector */}
            <div className="lg:hidden mb-6">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ccVenues.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all relative"
                  onMouseEnter={() => setHoveredCard(v.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative">
                    <img src={v.image} alt={v.name} className="w-full h-48 object-cover" />

                    {hoveredCard === v.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <h4 className="text-lg font-semibold mb-2">
                            Capacity: {v.capacity}
                          </h4>
                          <p className="text-sm font-medium">Logistics Available:</p>
                          {v.logistics?.map((item) => (
                            <p key={item} className="text-xs">
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{v.name}</h3>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>
                          <span className="font-medium">Faculty In‑charge:</span>{' '}
                          {v.facultyInCharge}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {v.facultyContact}
                      </div>
                      {v.labAssistant && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>
                            <span className="font-medium">Lab Assistant:</span>{' '}
                            {v.labAssistant} — {v.labAssistantContact}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleBookNow(v.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      BOOK NOW
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!ccVenues.length && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No CCs Available</h3>
                <p className="text-gray-500">
                  No computer centers found for {selectedDepartment}
                </p>
              </div>
            )}
          </main>
        </section>
      </div>
    </div>
  );
}

export default CCBookingPage;
