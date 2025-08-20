// pages/CreateEventPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  List,
  Save,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    posterLink: '',
    teamSize: '',
    eventDate: '',
    registrationDeadline: '',
    description: '',
    rules: '',
    category: 'Technical',
    isFree: true,
    venueBookingId: '',
    expectedAttendees: '',
    requireProjector: false,
    requireMic: false,
    requireSpeakers: false,
    requireWhiteboard: false,
    requireAC: false,
    requireWiFi: false,
    additionalRequirements: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [venueBookings, setVenueBookings] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  const venues = [
    'CSE Block - Lab 1',
    'CSE Block - Lab 2',
    'ECE Block - Lab 1',
    'Mechanical Workshop',
    'Main Auditorium',
    'IT Block - Innovation Lab',
    'Sports Complex',
    'MBA Block - Seminar Hall',
  ];
  const categories = [
    'Technical',
    'Cultural',
    'Sports',
    'Workshop',
    'Competition',
  ];

  // Fetch user's approved venue bookings
  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        // Handle case where token is not available
        console.error('No authentication token found');
        // Optionally, redirect to login or show an error message
        return;
      }

      const response = await fetch('/api/bookings/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter only approved bookings
        const approvedBookings = data.filter(booking => booking.status === 'approved');
        setVenueBookings(approvedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Validate venue booking before event creation
  const validateVenueBooking = async () => {
    if (!formData.venueBookingId || !formData.eventDate) {
      setErrors({ venueBookingId: 'Please select a venue booking and event date first' });
      return false;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        // Handle case where token is not available
        console.error('No authentication token found');
        // Optionally, redirect to login or show an error message
        return;
      }

      const response = await fetch('/api/events/validate-venue-booking', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venueBookingId: formData.venueBookingId,
          eventDate: formData.eventDate,
          expectedAttendees: formData.expectedAttendees || 0,
          requireProjector: formData.requireProjector,
          requireMic: formData.requireMic,
          requireSpeakers: formData.requireSpeakers,
          requireWhiteboard: formData.requireWhiteboard,
          requireAC: formData.requireAC,
          requireWiFi: formData.requireWiFi,
          additionalRequirements: formData.additionalRequirements
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setValidationResult(result);
        setShowValidation(true);
        return result.canProceed;
      } else {
        setErrors({ venueBookingId: result.message });
        return false;
      }
    } catch (error) {
      console.error('Validation error:', error);
      setErrors({ venueBookingId: 'Failed to validate venue booking' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Helpers ---------- */
  const validateForm = () => {
    const req = [
      'title',
      'venueBookingId',
      'teamSize',
      'eventDate',
      'registrationDeadline',
      'description',
      'rules',
    ];
    const newErr = {};
    req.forEach((f) => {
      if (!String(formData[f]).trim()) newErr[f] = 'Required';
    });
    
    if (
      formData.registrationDeadline &&
      formData.eventDate &&
      new Date(formData.registrationDeadline) >= new Date(formData.eventDate)
    ) {
      newErr.registrationDeadline = 'Deadline must be before event date';
    }

    if (formData.expectedAttendees && formData.expectedAttendees <= 0) {
      newErr.expectedAttendees = 'Expected attendees must be greater than 0';
    }

    setErrors(newErr);
    return !Object.keys(newErr).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Validate venue booking first
    const isValid = await validateVenueBooking();
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        // Handle case where token is not available
        console.error('No authentication token found');
        // Optionally, redirect to login or show an error message
        return;
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Event created successfully!');
        navigate('/club/manage-events');
      } else {
        const error = await response.json();
        setErrors({ submit: error.message });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setErrors({ submit: 'Failed to create event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVenueBookingChange = (bookingId) => {
    setFormData(prev => ({ ...prev, venueBookingId: bookingId }));
    setValidationResult(null);
    setShowValidation(false);
    
    // Auto-fill venue name from selected booking
    const selectedBooking = venueBookings.find(booking => booking._id === bookingId);
    if (selectedBooking) {
      setFormData(prev => ({ 
        ...prev, 
        venue: selectedBooking.venue?.name || selectedBooking.venue,
        expectedAttendees: selectedBooking.participants || '',
        requireProjector: false,
        requireMic: false,
        requireSpeakers: false,
        requireWhiteboard: false,
        requireAC: false,
        requireWiFi: false,
        additionalRequirements: ''
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/club')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Go Back to Dashboard"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">Create New Event</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Create a new event for your club. You must have an approved venue booking before creating an event.
            </p>
          </div>

          {/* Venue Booking Requirement Notice */}
          <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start space-x-4">
              <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Venue Booking Required</h3>
                <p className="text-base text-blue-700 mb-4 leading-relaxed">
                  An event can only be created if a valid venue booking exists. Please ensure:
                </p>
                <ul className="text-base text-blue-700 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Venue Selection</strong> – You must select an available venue before event creation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Date & Time Validation</strong> – Booking date/time must match event date</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Capacity Check</strong> – Venue capacity must accommodate expected attendees</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Department Eligibility</strong> – Venue must be accessible to your department</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Logistics Confirmation</strong> – Required facilities must be available</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Venue Booking Selection */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Step 1: Select Venue Booking</h3>
              
              {venueBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">No approved venue bookings found</h4>
                  <p className="text-base text-gray-600 mb-6 leading-relaxed">
                    You need to book and get approval for a venue before creating an event
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/club/venue-booking')}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Book a Venue
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Select Approved Venue Booking *
                  </label>
                  <select
                    value={formData.venueBookingId}
                    onChange={(e) => handleVenueBookingChange(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                    required
                  >
                    <option value="">Choose a venue booking...</option>
                    {venueBookings.map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {booking.venue?.name || booking.venue} - {new Date(booking.fromDate).toLocaleDateString()} ({booking.fromTime}-{booking.toTime})
                      </option>
                    ))}
                  </select>
                  
                  {formData.venueBookingId && (
                    <div className="mt-4 p-5 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center space-x-3 text-base text-green-800 mb-4">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Venue booking selected successfully</span>
                      </div>
                      
                      {/* Selected Venue Details */}
                      {(() => {
                        const selectedBooking = venueBookings.find(booking => booking._id === formData.venueBookingId);
                        if (selectedBooking && selectedBooking.venue) {
                          return (
                            <div className="text-base text-green-700 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>Venue:</strong> {selectedBooking.venue.name}</div>
                                <div><strong>Capacity:</strong> {selectedBooking.venue.capacity} people</div>
                                <div><strong>Department:</strong> {selectedBooking.venue.department}</div>
                                <div><strong>Type:</strong> {selectedBooking.venue.venueType}</div>
                              </div>
                              
                              {/* Available Logistics */}
                              {selectedBooking.venue.availableLogistics && (
                                <div className="mt-4">
                                  <strong className="block mb-2">Available Facilities:</strong>
                                  <div className="flex flex-wrap gap-3">
                                    {Object.entries(selectedBooking.venue.availableLogistics).map(([facility, available]) => (
                                      available && (
                                        <span key={facility} className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          {facility}
                                        </span>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Venue Features */}
                              {selectedBooking.venue.features && selectedBooking.venue.features.length > 0 && (
                                <div className="mt-4">
                                  <strong className="block mb-2">Features:</strong>
                                  <div className="flex flex-wrap gap-3">
                                    {selectedBooking.venue.features.map((feature, index) => (
                                      <span key={index} className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logistics Requirements */}
            {formData.venueBookingId && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1.5: Logistics Requirements</h3>
                <p className="text-base text-gray-600 mb-6 leading-relaxed">
                  Select the facilities and equipment you need for your event. This will be validated against venue availability.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireProjector}
                      onChange={(e) => setFormData({ ...formData, requireProjector: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-base font-medium text-gray-700">Projector</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireMic}
                      onChange={(e) => setFormData({ ...formData, requireMic: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-base font-medium text-gray-700">Microphone</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireSpeakers}
                      onChange={(e) => setFormData({ ...formData, requireSpeakers: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-base font-medium text-gray-700">Sound System</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireWhiteboard}
                      onChange={(e) => setFormData({ ...formData, requireWhiteboard: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-base font-medium text-gray-700">Whiteboard</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireAC}
                      onChange={(e) => setFormData({ ...formData, requireAC: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-base font-medium text-gray-700">Air Conditioning</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireWiFi}
                      onChange={(e) => setFormData({ ...formData, requireWiFi: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-base font-medium text-gray-700">WiFi Access</span>
                  </label>
                </div>
                
                <div className="mt-6">
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Additional Requirements
                  </label>
                  <textarea
                    value={formData.additionalRequirements || ''}
                    onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                    placeholder="Any other specific requirements or special arrangements needed..."
                  />
                </div>
              </div>
            )}

            {/* Validation Results */}
            {showValidation && validationResult && (
              <div className={`p-6 rounded-xl border-2 ${
                validationResult.canProceed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-4 ${
                  validationResult.canProceed ? 'text-green-900' : 'text-red-900'
                }`}>
                  Venue Booking Validation Results
                </h4>
                
                {/* Validation Summary */}
                <div className={`p-4 rounded-xl mb-6 ${
                  validationResult.canProceed 
                    ? 'bg-green-100 border-2 border-green-300' 
                    : 'bg-red-100 border-2 border-red-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {validationResult.canProceed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <span className={`text-lg font-bold ${
                        validationResult.canProceed ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {validationResult.canProceed ? 'Validation Passed' : 'Validation Failed'}
                      </span>
                    </div>
                    <div className="text-base font-medium text-gray-600">
                      {Object.values(validationResult.validation).filter(Boolean).length} / {Object.keys(validationResult.validation).length} checks passed
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-base">
                  <div className="flex items-center space-x-3">
                    {validationResult.validation.dateValid ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="font-medium">Event date is in the future</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {validationResult.validation.dateMatches ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="font-medium">Event date matches booking date</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {validationResult.validation.capacitySufficient ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="font-medium">Venue capacity sufficient ({validationResult.details.venueCapacity} ≥ {validationResult.details.expectedAttendees})</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {validationResult.validation.logisticsAvailable ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="font-medium">Required logistics available</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {validationResult.validation.venueActive ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="font-medium">Venue is active and available</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {validationResult.validation.noMaintenance ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="font-medium">Venue is not under maintenance</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {validationResult.validation.operatingHoursValid ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="font-medium">Event time within operating hours</span>
                  </div>
                </div>

                {validationResult.details.recommendations.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <h5 className="font-semibold text-yellow-900 mb-3">Recommendations:</h5>
                    <ul className="text-base text-yellow-800 space-y-2">
                      {validationResult.details.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* User Logistics Requirements Summary */}
                {validationResult.details.userRequirements && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <h5 className="font-semibold text-blue-900 mb-3">Your Logistics Requirements:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-base">
                      {Object.entries(validationResult.details.userRequirements).map(([requirement, required]) => {
                        if (requirement === 'additional') return null;
                        if (!required) return null;
                        
                        const isAvailable = validationResult.details.availableLogistics.includes(requirement);
                        const isMissing = validationResult.details.missingLogistics.includes(requirement);
                        
                        return (
                          <div key={requirement} className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-blue-200">
                            {isAvailable ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : isMissing ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <Info className="w-5 h-5 text-blue-600" />
                            )}
                            <span className={`capitalize font-medium ${
                              isAvailable ? 'text-green-800' : 
                              isMissing ? 'text-red-800' : 'text-blue-800'
                            }`}>
                              {requirement}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {validationResult.details.userRequirements.additional && (
                      <div className="mt-4 pt-4 border-t-2 border-blue-200">
                        <strong className="text-blue-900 text-base">Additional Requirements:</strong>
                        <p className="text-base text-blue-800 mt-2 leading-relaxed">
                          {validationResult.details.userRequirements.additional}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {validationResult.canProceed && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center space-x-3 text-base text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">All validation checks passed! You can proceed with event creation.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Validation Button */}
            {formData.venueBookingId && formData.eventDate && !showValidation && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={validateVenueBooking}
                  disabled={loading}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Validate Venue Booking
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Event Details */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Step 2: Event Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                    placeholder="Enter event title"
                    required
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-2 font-medium">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    value={formData.expectedAttendees}
                    onChange={(e) => setFormData({ ...formData, expectedAttendees: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                    placeholder="Number of expected attendees"
                    min="1"
                  />
                  {errors.expectedAttendees && <p className="text-red-600 text-sm mt-2 font-medium">{errors.expectedAttendees}</p>}
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                    required
                  />
                  {errors.eventDate && <p className="text-red-600 text-sm mt-2 font-medium">{errors.eventDate}</p>}
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Registration Deadline *
                  </label>
                  <input
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                    required
                  />
                  {errors.registrationDeadline && <p className="text-red-600 text-sm mt-2 font-medium">{errors.registrationDeadline}</p>}
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Team Size
                  </label>
                  <input
                    type="text"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                    placeholder="e.g., Individual, 2-4 members"
                  />
                  {errors.teamSize && <p className="text-red-600 text-sm mt-2 font-medium">{errors.teamSize}</p>}
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                  placeholder="Describe your event in detail..."
                  required
                />
                {errors.description && <p className="text-red-600 text-sm mt-2 font-medium">{errors.description}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Rules & Guidelines *
                </label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  rows="4"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                  placeholder="List the rules and guidelines for participants..."
                  required
                />
                {errors.rules && <p className="text-red-600 text-sm mt-2 font-medium">{errors.rules}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Poster Link
                </label>
                <input
                  type="url"
                  value={formData.posterLink}
                  onChange={(e) => setFormData({ ...formData, posterLink: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-base font-semibold text-gray-700">This is a free event</span>
                </label>
              </div>
            </div>

            {errors.submit && (
              <div className="p-5 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{errors.submit}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/club/manage-events')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.venueBookingId}
                className={`px-8 py-4 rounded-xl text-white font-semibold text-base transition-all duration-200 ${
                  loading || !formData.venueBookingId
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>Create Event</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEventPage;
