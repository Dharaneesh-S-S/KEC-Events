// pages/EditEventPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  FileText,
  List,
  Save,
  Loader2,
  XCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get event ID from URL
  const { state } = useLocation(); // Get event data passed from ManageEventsPage
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    teamSize: '',
    eventDate: '',
    registrationDeadline: '',
    description: '',
    rules: '',
    category: 'Technical',
    isFree: true,
    expectedAttendees: '',
    requireProjector: false,
    requireMic: false,
    requireSpeakers: false,
    requireWhiteboard: false,
    requireAC: false,
    requireWiFi: false,
    additionalRequirements: '',
    formLink: '',
    bookedVenue: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true); // Set to true initially for fetching data
  const [posterFile, setPosterFile] = useState(null); // New state for poster file
  const [existingPoster, setExistingPoster] = useState(null); // To display existing poster

  const categories = [
    'Technical',
    'Cultural',
    'Sports',
    'Workshop',
    'Competition',
  ];

  useEffect(() => {
    if (state?.event) {
      // Pre-fill form with existing event data
      setFormData({
        title: state.event.title || '',
        teamSize: state.event.teamSize || '',
        eventDate: state.event.eventDate ? new Date(state.event.eventDate).toISOString().split('T')[0] : '',
        registrationDeadline: state.event.registrationDeadline ? new Date(state.event.registrationDeadline).toISOString().split('T')[0] : '',
        description: state.event.description || '',
        rules: state.event.rules || '',
        category: state.event.category || 'Technical',
        isFree: state.event.isFree !== undefined ? state.event.isFree : true,
        expectedAttendees: state.event.expectedAttendees || '',
        requireProjector: state.event.requireProjector || false,
        requireMic: state.event.requireMic || false,
        requireSpeakers: state.event.requireSpeakers || false,
        requireWhiteboard: state.event.requireWhiteboard || false,
        requireAC: state.event.requireAC || false,
        requireWiFi: state.event.requireWiFi || false,
        additionalRequirements: state.event.additionalRequirements || '',
        formLink: state.event.formLink || '',
        bookedVenue: state.event.bookedVenue || '',
      });
      setExistingPoster(state.event.poster); // Set existing poster URL
      setLoading(false);
    } else if (id) {
      // If event data is not passed via state, fetch it using the ID
      const fetchEvent = async () => {
        try {
          setLoading(true);
          const response = await apiRequest(`/events/${id}`);
          if (response) {
            setFormData({
              title: response.title || '',
              teamSize: response.teamSize || '',
              eventDate: response.eventDate ? new Date(response.eventDate).toISOString().split('T')[0] : '',
              registrationDeadline: response.registrationDeadline ? new Date(response.registrationDeadline).toISOString().split('T')[0] : '',
              description: response.description || '',
              rules: response.rules || '',
              category: response.category || 'Technical',
              isFree: response.isFree !== undefined ? response.isFree : true,
              expectedAttendees: response.expectedAttendees || '',
              requireProjector: response.requireProjector || false,
              requireMic: response.requireMic || false,
              requireSpeakers: response.requireSpeakers || false,
              requireWhiteboard: response.requireWhiteboard || false,
              requireAC: response.requireAC || false,
              requireWiFi: response.requireWiFi || false,
              additionalRequirements: response.additionalRequirements || '',
              formLink: response.formLink || '',
              bookedVenue: response.bookedVenue || '',
            });
            setExistingPoster(response.poster); // Set existing poster URL
          } else {
            console.error('Event not found');
            navigate('/club/manage-events'); // Redirect if event not found
          }
        } catch (err) {
          console.error('Error fetching event:', err);
          navigate('/club/manage-events'); // Redirect on error
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id, state, navigate]);

  /* ---------- Helpers ---------- */
  const validateForm = () => {
    const req = [
      'title',
      'teamSize',
      'eventDate',
      'registrationDeadline',
      'description',
      'rules',
      'formLink',
      'bookedVenue',
    ];
    const newErr = {};
    req.forEach((f) => {
      if (!String(formData[f]).trim()) newErr[f] = 'Required';
    });
    
    // Validate poster file presence only if no existing poster and no new file selected
    if (!existingPoster && !posterFile) {
      newErr.posterFile = 'Poster image is required';
    }

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

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      if (posterFile) {
        data.append('poster', posterFile); // Append new poster file
      }
      // Do not append existingPoster here, it's a URL not a file

      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT', // Use PUT for updating
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
      alert('Event updated successfully!');
      navigate('/club/manage-events');
      } else {
        const error = await response.json();
        setErrors({ submit: error.message });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setErrors({ submit: 'Failed to update event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">Edit Event</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Edit the details of your club event.
          </p>
        </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-lg text-gray-600 font-medium">Loading event details...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Details */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Event Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:focus:border-blue-500 text-base transition-all duration-200"
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

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Form Link
              </label>
              <input
                type="url"
                      value={formData.formLink}
                      onChange={(e) => setFormData({ ...formData, formLink: e.target.value })}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                      placeholder="https://example.com/registration-form"
                    />
                    {errors.formLink && <p className="text-red-600 text-sm mt-2 font-medium">{errors.formLink}</p>}
            </div>

            <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Booked Venue
              </label>
              <input
                type="text"
                      value={formData.bookedVenue}
                      onChange={(e) => setFormData({ ...formData, bookedVenue: e.target.value })}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                      placeholder="e.g., Main Auditorium"
                    />
                    {errors.bookedVenue && <p className="text-red-600 text-sm mt-2 font-medium">{errors.bookedVenue}</p>}
                  </div>
            </div>

                <div className="mt-6">
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Poster Image *
                    </label>
                  {existingPoster && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Current Poster:</p>
                      <img src={existingPoster} alt="Current Poster" className="max-w-xs h-auto rounded-lg shadow-md" />
            </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPosterFile(e.target.files[0])}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                  />
                  <p className="text-sm text-gray-500 mt-2">Leave blank to keep existing poster, or upload new one.</p>
                  {errors.posterFile && <p className="text-red-600 text-sm mt-2 font-medium">{errors.posterFile}</p>}
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
                  disabled={loading}
                  className={`px-8 py-4 rounded-xl text-white font-semibold text-base transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                <Save className="w-5 h-5" />
                <span>Update Event</span>
                    </div>
                  )}
              </button>
            </div>
          </form>
          )}
        </div>
        </div>
    </div>
  );
}

export default EditEventPage;
