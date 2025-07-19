import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, User, Phone, FileText, Settings, LogOut, Globe, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { venues } from '../data/venues';

function SeminarHallFormPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { venueId } = useParams();
  const { logout } = useAuth();

  const [venue, setVenue] = useState(null);
  const [formData, setFormData] = useState({
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    facultyInCharge: '',
    department: '',
    mobileNumber: '',
    functionName: '',
    functionDate: '',
    chiefGuest: '',
    totalAudience: '',
    airConditioning: 'No',
    electricalLighting: 'No',
    stageLightings: 'No',
    houseKeeping: 'No',
    audioWork: 'No'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (venueId) {
      const foundVenue = venues.find(v => v.id === venueId);
      if (foundVenue) {
        setVenue(foundVenue);
        setFormData(prev => ({
          ...prev,
          department: foundVenue.department || '',
          facultyInCharge: foundVenue.facultyInCharge
        }));
      }
    }
  }, [venueId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromDate) newErrors.fromDate = 'From date is required';
    if (!formData.fromTime) newErrors.fromTime = 'From time is required';
    if (!formData.toDate) newErrors.toDate = 'To date is required';
    if (!formData.toTime) newErrors.toTime = 'To time is required';
    if (!formData.facultyInCharge.trim()) newErrors.facultyInCharge = 'Faculty in-charge is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.functionName.trim()) newErrors.functionName = 'Function name is required';
    if (!formData.functionDate) newErrors.functionDate = 'Function date is required';
    if (!formData.chiefGuest.trim()) newErrors.chiefGuest = 'Chief/Main guest is required';
    if (!formData.totalAudience.trim()) newErrors.totalAudience = 'Total audience is required';

    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    if (formData.fromDate && formData.toDate) {
      if (new Date(formData.fromDate) > new Date(formData.toDate)) {
        newErrors.toDate = 'To date must be after from date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Seminar Hall booking submitted:', formData);
      alert('Seminar Hall booked successfully!');
      navigate('/club/venue-booking/seminar');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-4">The venue you're trying to book could not be found.</p>
          <button
            onClick={() => navigate('/club/venue-booking/seminar')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Seminar Halls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0">
        {/* Top Navbar */}
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
                  <span className="text-xl font-bold text-gray-900">Fests</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium text-gray-700">Book Seminar Hall</span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Settings className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Globe className="w-6 h-6" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Continue with form layout... */}
      </div>
    </div>
  );
}

export default SeminarHallFormPage;
