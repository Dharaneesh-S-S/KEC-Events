// pages/EditEventPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  List,
  Save,
} from 'lucide-react';
import Navbar from '../components/Navbar';

function EditEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams(); // still available if needed later
  const { state } = useLocation();
  const eventData = state?.event;

  /* ---------- Local State ---------- */
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
  });
  const [errors, setErrors] = useState({});

  /* ---------- Populate on mount ---------- */
  useEffect(() => {
    if (eventData) {
      setFormData({
        title: eventData.title,
        venue: eventData.venue,
        posterLink: eventData.image,
        teamSize: eventData.teamSize,
        eventDate: eventData.date,
        registrationDeadline: eventData.deadline,
        description: eventData.description,
        rules: eventData.rules.join('\n'),
        category: eventData.category,
        isFree: eventData.isFree,
      });
    }
  }, [eventData]);

  /* ---------- Constants ---------- */
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

  /* ---------- Validation ---------- */
  const validateForm = () => {
    const req = [
      'title',
      'venue',
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

    setErrors(newErr);
    return !Object.keys(newErr).length;
  };

  /* ---------- Handlers ---------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Event updated:', formData);
      alert('Event updated successfully!');
      navigate('/club/manage-events');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  /* ---------- Guard ---------- */
  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">
            The event you're trying to edit could not be found.
          </p>
          <button
            onClick={() => navigate('/club/manage-events')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Manage Events
          </button>
        </div>
      </div>
    );
  }

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSort={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/club/manage-events')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Manage Events
          </button>
          <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
          <p className="text-lg text-gray-600">
            Update the details for “{eventData.title}”
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Event Name *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Venue & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Venue *
                </label>
                <select
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.venue ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a venue</option>
                  {venues.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                {errors.venue && (
                  <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Poster */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Poster (Link)
              </label>
              <input
                type="url"
                name="posterLink"
                value={formData.posterLink}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Team Size *
              </label>
              <input
                type="text"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.teamSize ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.teamSize && (
                <p className="text-red-500 text-sm mt-1">{errors.teamSize}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { n: 'eventDate', l: 'Event Date', icon: Calendar },
                { n: 'registrationDeadline', l: 'Registration Deadline', icon: Clock },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.n}>
                    <label className="block text-sm font-medium mb-2">
                      <Icon className="w-4 h-4 inline mr-2" />
                      {f.l} *
                    </label>
                    <input
                      type="date"
                      name={f.n}
                      value={formData[f.n]}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[f.n] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[f.n] && (
                      <p className="text-red-500 text-sm mt-1">{errors[f.n]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <List className="w-4 h-4 inline mr-2" />
                Rules & Guidelines *
              </label>
              <textarea
                name="rules"
                rows={6}
                value={formData.rules}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.rules ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.rules && (
                <p className="text-red-500 text-sm mt-1">{errors.rules}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Enter each rule on a separate line
              </p>
            </div>

            {/* Free toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium">
                This is a free event
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/club/manage-events')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Update Event</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditEventPage;
