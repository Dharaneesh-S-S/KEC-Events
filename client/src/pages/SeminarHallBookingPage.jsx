// pages/SeminarHallBookingPage.jsx
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

function SeminarHallBookingPage() {
  /* ---------- Local state ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('CSE');
  const [searchQuery, setSearchQuery] = useState('');
  const [hovered, setHovered] = useState(null);

  const navigate = useNavigate();
  const { logout } = useAuth();

  /* ---------- Derived data ---------- */
  const deptOptions = useMemo(
    () =>
      departments.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  const halls = useMemo(
    () =>
      venues.filter(
        (v) => v.type === 'seminar' && v.department === selectedDepartment,
      ),
    [selectedDepartment],
  );

  /* ---------- Handlers ---------- */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBook = (id) => {
    navigate(`/club/venue-booking/seminar/form/${id}`);
  };

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex">
        {/* Department list (desktop) */}
        <aside className="w-64 bg-white border-r hidden lg:block">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Search departments…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="p-2">
            {deptOptions.map((d) => (
              <button
                key={d.id}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition ${
                  selectedDepartment === d.name
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDepartment(d.name)}
              >
                {d.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Navbar */}
          <nav className="bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-blue-600"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    KEC
                  </div>
                  <span className="text-xl font-bold">Fests</span>
                </div>
              </div>

              <span className="text-lg font-medium">Seminar Hall Booking</span>

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
          </nav>

          {/* Body */}
          <main className="p-6">
            <div className="mb-6">
              <button
                onClick={() => navigate('/club/venue-booking')}
                className="text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Back to Venue Booking
              </button>
              <h1 className="text-2xl font-bold mb-1">
                Seminar Hall Booking – {selectedDepartment}
              </h1>
              <p className="text-gray-600">
                Select a seminar hall to book for your event
              </p>
            </div>

            {/* Mobile dept selector */}
            <div className="lg:hidden mb-6">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {halls.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition relative"
                  onMouseEnter={() => setHovered(v.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="relative">
                    <img
                      src={v.image}
                      alt={v.name}
                      className="w-full h-48 object-cover"
                    />
                    {hovered === v.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white p-4 text-center">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Capacity: {v.capacity}
                          </h4>
                          {v.logistics?.length && (
                            <>
                              <p className="text-sm font-medium mb-1">
                                Logistics:
                              </p>
                              {v.logistics.map((l, i) => (
                                <p key={i} className="text-xs">
                                  {l}
                                </p>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold">{v.name}</h3>
                    <p className="text-sm text-green-600 font-medium mb-3">
                      {v.department}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {v.facultyInCharge}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {v.facultyContact}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBook(v.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                    >
                      BOOK NOW
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!halls.length && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Seminar Halls Available
                </h3>
                <p className="text-gray-500">
                  No seminar halls found for {selectedDepartment}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default SeminarHallBookingPage;
