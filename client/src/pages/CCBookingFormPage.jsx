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
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, bookingsAPI } from '../services/api';

function CCBookingFormPage() {
  const navigate = useNavigate();
  const { venueId } = useParams();
  const { logout, user } = useAuth();

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
  const [loading, setLoading] = useState(false);

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
    const loadVenue = async () => {
      if (!venueId) return;
      setLoading(true);
      try {
        const data = await apiRequest(`/venues/${encodeURIComponent(venueId)}`);
        // server returns a single venue object
        setVenue(data);
        setFormData((prev) => ({
          ...prev,
          department: data?.department || '',
          facultyInCharge: data?.facultyInCharge || '',
        }));
      } catch (err) {
        console.error('Failed to load venue:', err);
        setVenue(null);
      } finally {
        setLoading(false);
      }
    };

    loadVenue();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const bookingData = {
        venue: venueId,
        venueType: 'cc',
        fromDate: formData.fromDate,
        fromTime: formData.fromTime,
        toDate: formData.toDate,
        toTime: formData.toTime,
        facultyInCharge: formData.facultyInCharge,
        department: formData.department,
        mobileNumber: formData.mobileNumber,
        participants: parseInt(formData.participants, 10),
        eventName: formData.eventName,
        softwareRequirement: formData.softwareRequirement,
        eventType: formData.eventType,
        bookedBy: user?.email || user?.name || 'UNKNOWN_USER',
        status: 'pending'
      };

      // Safe log of outgoing payload
      console.debug('[CCBookingForm] Creating booking with payload:', bookingData);

      const result = await bookingsAPI.create(bookingData);
      console.debug('[CCBookingForm] Booking created OK:', result);
      alert('CC booked successfully!');
      navigate('/club/venue-booking/cc');
    } catch (error) {
      console.error('[CCBookingForm] Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue...</p>
        </div>
      </div>
    );
  }

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
      <div className="flex-1">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
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
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
                >
                  {loading ? 'Booking...' : 'Submit Booking'}
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
