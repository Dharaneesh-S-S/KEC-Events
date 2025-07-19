// pages/CCBookingFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Settings,
  LogOut,
  Globe,
  Menu,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { venues } from '../data/venues';

function CCBookingFormPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { venueId } = useParams();
  const { logout } = useAuth();

  const [venue, setVenue] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [formData, setFormData] = useState({
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    facultyInCharge: '',
    department: '',
    mobileNumber: '',
    participants: '',
    eventName: '',
    softwareRequirement: '',
    eventType: '',
  });

  const [errors, setErrors] = useState({});

  const softwareOptions = [
    'Visual Studio Code',
    'IntelliJ IDEA',
    'Eclipse',
    'PyCharm',
    'MATLAB',
    'AutoCAD',
    'Photoshop',
    'Other',
  ];

  const eventTypes = [
    'Workshop',
    'Seminar',
    'Competition',
    'Training',
    'Examination',
    'Project Work',
    'Other',
  ];

  useEffect(() => {
    if (venueId) {
      const foundVenue = venues.find((v) => v.id === venueId);
      if (foundVenue) {
        setVenue(foundVenue);
        setFormData((prev) => ({
          ...prev,
          department: foundVenue.department || '',
          facultyInCharge: foundVenue.facultyInCharge,
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

    const required = [
      'fromDate',
      'fromTime',
      'toDate',
      'toTime',
      'facultyInCharge',
      'mobileNumber',
      'participants',
      'eventName',
      'softwareRequirement',
      'eventType',
    ];

    required.forEach((field) => {
      if (!formData[field].trim()) newErrors[field] = 'This field is required';
    });

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
      console.log('CC booking submitted:', { formData, alternatives });
      alert('CC booked successfully!');
      navigate('/club/venue-booking/cc');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddAlternative = () => {
    navigate(`/club/venue-booking/cc/form/${venueId}/add-alternative`);
  };

  const removeAlternative = (id) => {
    setAlternatives((prev) => prev.filter((alt) => alt.id !== id));
  };

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-4">
            The venue you're trying to book could not be found.
          </p>
          <button
            onClick={() => navigate('/club/venue-booking/cc')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to CC Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
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

              <span className="text-lg font-medium text-gray-700">Book CC</span>

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

        {/* Form Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/club/venue-booking/cc')}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center space-x-2"
            >
              <span>← Back to CC Booking</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Book {venue.name} - {venue.department}
            </h1>
            <p className="text-lg text-gray-600">
              Fill in the details to book this computer center
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'From Date *', icon: Calendar, name: 'fromDate', type: 'date' },
                  { label: 'From Time *', icon: Clock, name: 'fromTime', type: 'time' },
                  { label: 'To Date *', icon: Calendar, name: 'toDate', type: 'date' },
                  { label: 'To Time *', icon: Clock, name: 'toTime', type: 'time' },
                ].map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Icon className="w-4 h-4 inline mr-2" />
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Faculty & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Faculty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Select Faculty In-Charge *
                  </label>
                  <input
                    type="text"
                    name="facultyInCharge"
                    value={formData.facultyInCharge}
                    onChange={handleInputChange}
                    placeholder="Enter faculty name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.facultyInCharge ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.facultyInCharge && (
                    <p className="text-red-500 text-sm mt-1">{errors.facultyInCharge}</p>
                  )}
                </div>

                {/* Department (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department (Auto-Filled)
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit mobile number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
                  )}
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. of Participants *
                  </label>
                  <input
                    type="number"
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                    placeholder="Enter number of participants"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.participants ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.participants && (
                    <p className="text-red-500 text-sm mt-1">{errors.participants}</p>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Event Name *
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    placeholder="Enter event name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.eventName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.eventName && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
                  )}
                </div>

                {/* Software Requirement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Software Requirement *
                  </label>
                  <select
                    name="softwareRequirement"
                    value={formData.softwareRequirement}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.softwareRequirement ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select software</option>
                    {softwareOptions.map((software) => (
                      <option key={software} value={software}>
                        {software}
                      </option>
                    ))}
                  </select>
                  {errors.softwareRequirement && (
                    <p className="text-red-500 text-sm mt-1">{errors.softwareRequirement}</p>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.eventType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select event type</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.eventType && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
                  )}
                </div>
              </div>

              {/* Alternatives */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Alternatives</h3>
                  <button
                    type="button"
                    onClick={handleAddAlternative}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Alternative</span>
                  </button>
                </div>

                {alternatives.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        {['Date', 'Session', 'Name of Session', 'Faculty In-Charge', 'Actions'].map(
                          (head) => (
                            <th
                              key={head}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {head}
                            </th>
                          ),
                        )}
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {alternatives.map((alternative) => (
                          <tr key={alternative.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(alternative.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {alternative.session}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {alternative.sessionName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {alternative.facultyInCharge}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button
                                type="button"
                                onClick={() => removeAlternative(alternative.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No alternatives added yet. Click "Add Alternative" to add one.
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Booking
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CCBookingFormPage;
