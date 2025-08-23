// pages/CCBookingPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
import Navbar from '../components/Navbar'; // Import Navbar component
import { apiRequest } from '../services/api';

function CCBookingPage() {
  const { departmentSlug } = useParams();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupedView, setGroupedView] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // Fetch venues for the department slug (authenticated, read-only)
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const slug = (departmentSlug || '').toLowerCase();
        // Use existing GET /venues with query params
        const params = new URLSearchParams();
        params.append('venueType', 'cc');
        // If a departmentSlug is provided, use it to filter department. Otherwise fetch all CC venues
        if (slug) params.append('department', slug);
        // fetch a generous page to avoid pagination UX here
        params.append('page', '1');
        params.append('limit', '1000');

        const res = await apiRequest(`/venues?${params.toString()}`);
        const list = Array.isArray(res)
          ? res
          : (res?.venues || []);

        // derive departments from venues returned
        const unique = Array.from(new Set(list.map(v => v.department || 'Unknown')));
        const formattedDepartments = unique.map((name, idx) => ({ id: idx + 1, name, code: name }));

        setVenues(list);
        setDepartments(formattedDepartments);
        if (formattedDepartments.length > 0) setSelectedDepartment(formattedDepartments[0].name);
      } catch (err) {
        setError('Failed to fetch venues');
        console.error('Error fetching venues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentSlug]);

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
        (v) => v.venueType === 'cc' && v.department === selectedDepartment,
      ),
    [venues, selectedDepartment],
  );

  const groupedByDept = useMemo(() => {
    const map = new Map();
    (venues || [])
      .filter((v) => v.venueType === 'cc')
      .forEach((v) => {
        const key = v.department || 'Unknown';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(v);
      });
    return map;
  }, [venues]);

  /* ---------- Handlers ---------- */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBookNow = (venueId) => {
    navigate(`/club/venue-booking/cc/form/${venueId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBackButton={true} showSearch={true} searchPlaceholder="Search Departments..." />

      {/* Main */}
      <div className="flex pt-16">
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
        <section className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
            {/* Main Content */}
            <main className="p-6">
              {/* Loading & Error */}
              {loading && (
                <div className="w-full flex items-center justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                </div>
              )}
              {error && !loading && (
                <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              {/* header */}
              <div className="mb-6 text-center">
                
                <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  CC Booking
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Select a computer center to book for your event
                </p>
              </div>

            {/* mobile dept selector + view toggle */}
            <div className="lg:hidden mb-6 flex items-center gap-3">
              <div className="flex-1">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={groupedView}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setGroupedView((g) => !g)}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                {groupedView ? 'Single Dept View' : 'Group by Dept'}
              </button>
            </div>

            {/* cards - single dept view */}
            {!groupedView && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ccVenues.map((v) => (
                  <div
                    key={v._id || v.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all relative"
                    onMouseEnter={() => setHoveredCard(v._id || v.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="relative">
                      <img
                        src={v.thumbnail || (Array.isArray(v.images) && v.images[0]) || v.image || 'https://via.placeholder.com/600x300?text=Default+CC+Image'}
                        alt={v.name}
                        className="w-full h-48 object-cover"
                      />

                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs rounded ${v.availability?.isActive ? 'bg-green-600' : 'bg-gray-500'} text-white`}>
                          {v.availability?.isActive ? 'Available' : 'Inactive'}
                        </span>
                      </div>

                      {hoveredCard === (v._id || v.id) && (
                        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                          <div className="text-white text-center p-4">
                            <h4 className="text-lg font-semibold mb-2">
                              Capacity: {v.capacity}
                            </h4>
                            <p className="text-sm font-medium">Logistics Available:</p>
                            {(
                              (Array.isArray(v.features) && v.features.length
                                ? v.features
                                : Object.entries(v.availableLogistics || {})
                                    .filter(([_, val]) => Boolean(val))
                                    .map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()))
                              ) || []
                            ).map((item) => (
                              <p key={item} className="text-xs">{item}</p>
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
                        onClick={() => handleBookNow(v._id || v.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                      >
                        BOOK NOW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* grouped view */}
            {groupedView && (
              <div className="space-y-8">
                {Array.from(groupedByDept.entries()).map(([dept, list]) => (
                  <div key={dept}>
                    <div className="flex items-baseline justify-between mb-3">
                      <h2 className="text-xl font-semibold">{dept}</h2>
                      <span className="text-sm text-gray-500">{list.length} venue(s)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((v) => (
                        <div
                          key={v._id || v.id}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="relative">
                            <img
                              src={v.thumbnail || (Array.isArray(v.images) && v.images[0]) || v.image || 'https://via.placeholder.com/600x300?text=Default+CC+Image'}
                              alt={v.name}
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <span className={`px-2 py-1 text-xs rounded ${v.availability?.isActive ? 'bg-green-600' : 'bg-gray-500'} text-white`}>
                                {v.availability?.isActive ? 'Available' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-base font-semibold mb-2">{v.name}</h3>
                            <p className="text-xs text-gray-600 mb-3">Capacity: {v.capacity}</p>
                            <button
                              onClick={() => handleBookNow(v._id || v.id)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
                            >
                              BOOK NOW
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !groupedView && !ccVenues.length && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No CCs Available</h3>
                <p className="text-gray-500">
                  No computer centers found for {selectedDepartment}
                </p>
              </div>
            )}
          </main>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CCBookingPage;
