// pages/SeminarHallBookingPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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

function SeminarHallBookingPage() {
  /* ---------- Local state ---------- */
  
  const [hovered, setHovered] = useState(null);
  
  const [venues, setVenues] = useState([
    {
      _id: 'sh1',
      name: 'Main Seminar Hall (Updated)',
      department: 'General',
      capacity: 200,
      facultyInCharge: 'Dr. R. Kumar',
      facultyContact: '9876543210',
      image: 'https://picsum.photos/seed/seminar1/600/300',
      availability: { isActive: true },
      features: ['Projector', 'Sound System', 'Microphones'],
    },
    {
      _id: 'sh2',
      name: 'Mini Seminar Hall - CSE',
      department: 'Computer Science',
      capacity: 80,
      facultyInCharge: 'Prof. S. Devi',
      facultyContact: '9123456789',
      image: 'https://picsum.photos/seed/seminar2/600/300',
      availability: { isActive: true },
      features: ['Projector', 'Whiteboard'],
    },
    {
      _id: 'sh3',
      name: 'Auditorium Annexe',
      department: 'Common',
      capacity: 150,
      facultyInCharge: 'Mr. A. Singh',
      facultyContact: '8765432109',
      image: 'https://picsum.photos/seed/seminar3/600/300',
      availability: { isActive: false },
      features: ['Projector', 'Podium', 'Air Conditioning'],
    },
    {
      _id: 'sh4',
      name: 'Conference Room A',
      department: 'General',
      capacity: 10,
      facultyInCharge: 'Ms. L. Patel',
      facultyContact: '9988776655',
      image: 'https://picsum.photos/seed/conference1/600/300',
      availability: { isActive: true },
      features: ['Projector', 'Whiteboard', 'Sound System'],
    },
    {
      _id: 'sh5',
      name: 'Small Meeting Room',
      department: 'General',
      capacity: 6,
      facultyInCharge: 'Dr. M. Singh',
      facultyContact: '9876543210',
      image: 'https://picsum.photos/seed/meeting1/600/300',
      availability: { isActive: true },
      features: ['Projector', 'Whiteboard'],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Fetch departments and venues from database
  /*
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [venuesData] = await Promise.all([
          
          apiRequest('/venues?venueType=seminar')
        ]);

        
        
        setVenues(venuesData.venues || []);
        
      } catch (err) {
        console.error('Error fetching seminar data:', err);
        setError('Failed to load seminar halls');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  */

  /* ---------- Derived data ---------- */
  
  const halls = useMemo(
    () =>
      venues.filter(
        (v) => v.venueType === 'seminar'
      ),
    [venues],
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
    <div className="min-h-screen bg-gray-50">
      <Navbar
        showBackButton={true}
        showSearch={false}
        
      />

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Departments (lg+) */}
        
        {/* Main content area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <main className="p-6">
              {/* Loading & Error */}
              {loading && (
                <div className="w-full flex items-center justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-4 border-green-200 border-t-green-600 rounded-full" />
                </div>
              )}
              {error && !loading && (
                <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="mb-6 text-center">
                
                <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  Seminar Hall Booking
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Select a seminar hall to book for your event
                </p>
              </div>

              {/* Mobile dept selector + view toggle */}
              
              {/* Cards - single dept view */}
              {
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {halls.map((v) => (
                    <div
                      key={v._id || v.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition relative"
                      onMouseEnter={() => setHovered(v._id || v.id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div className="relative">
                        <img
                          src={v.thumbnail || (Array.isArray(v.images) && v.images[0]) || v.image || 'https://picsum.photos/seed/seminar+hall+default/600/300'}
                          alt={v.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs rounded ${v.availability?.isActive ? 'bg-green-600' : 'bg-gray-500'} text-white`}>
                            {v.availability?.isActive ? 'Available' : 'Inactive'}
                          </span>
                        </div>
                        {hovered === (v._id || v.id) && (
                          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white p-4 text-center">
                            <div>
                              <h4 className="font-semibold mb-2">Capacity: {v.capacity}</h4>
                              {(Array.isArray(v.features) && v.features.length) ? (
                                <>
                                  <p className="text-sm font-medium mb-1">Logistics:</p>
                                  {v.features.map((l, i) => (
                                    <p key={i} className="text-xs">{l}</p>
                                  ))}
                                </>
                              ) : (
                                Object.entries(v.availableLogistics || {})
                                  .filter(([_, val]) => Boolean(val))
                                  .map(([k]) => (
                                    <p key={k} className="text-xs">
                                      {k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
                                    </p>
                                  ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold">{v.name}</h3>
                        <p className="text-sm text-green-600 font-medium mb-3">{v.department}</p>

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
                          onClick={() => handleBook(v._id || v.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                        >
                          BOOK NOW
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              }

              {/* Grouped view */}
              
              {!loading && !halls.length && (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Seminar Halls Available
                  </h3>
                  <p className="text-gray-500">
                    No seminar halls found.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeminarHallBookingPage;
