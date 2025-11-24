import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Link,
  Image as ImageIcon,
  X,
  Trash2,
  Eye
} from 'lucide-react';
import axios from 'axios';

const EditEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    eventType: 'single',
    tags: [],
    formLink: '',
    formSheetId: '', // Changed to match backend model
    posters: [],
    parentEvent: ''
  });
  const [newTag, setNewTag] = useState('');
  const [newPosters, setNewPosters] = useState([]);

  const eventTypes = [
    { value: 'single', label: 'Single Event' },
    { value: 'super', label: 'Main Event' },
    { value: 'sub', label: 'Sub Event' }
  ];

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const token = user?.token;
      const res = await axios.get(`http://localhost:5000/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const event = res.data;
      
      // Format date for input field (YYYY-MM-DD)
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      // Format time for input field (HH:MM)
      const formattedTime = event.time || '12:00';
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: formattedDate,
        time: formattedTime,
        venue: event.venue || '',
        eventType: event.eventType || 'single',
        tags: event.tags || [],
        formLink: event.formLink || '',
        formSheetId: event.formSheetId || '', // Using formSheetId from backend
        posters: event.posters || [],
        parentEvent: event.parentEvent || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading event:', error);
      alert(error.response?.data?.message || 'Failed to load event. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePosterUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewPosters(prev => [...prev, ...files]);
  };

  const handleRemovePoster = (posterToRemove) => {
    if (typeof posterToRemove === 'string') {
      // Remove existing poster URL
      setFormData(prev => ({
        ...prev,
        posters: prev.posters.filter(poster => poster !== posterToRemove)
      }));
    } else {
      // Remove new poster file
      setNewPosters(prev => prev.filter(poster => poster !== posterToRemove));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();

      // Append all text fields - matching backend Event model exactly
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags") {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === "date" && formData.time) {
          // Combine date and time for backend DateTime field
          const dateTime = new Date(`${formData.date}T${formData.time}`);
          formDataToSend.append('date', dateTime.toISOString());
        } else if (key === "time") {
          // Also send time separately for display
          formDataToSend.append('time', value);
        } else if (key !== "posters") {
          formDataToSend.append(key, value);
        }
      });

      // Append new poster files
      newPosters.forEach((file) => {
        formDataToSend.append("posters", file);
      });

      // For existing posters, we need to handle them differently
      // Since your backend updateEvent doesn't handle file uploads,
      // we'll send existing poster URLs as part of the form data
      formData.posters.forEach((posterUrl, index) => {
        if (typeof posterUrl === 'string') {
          formDataToSend.append(`posters[${index}]`, posterUrl);
        }
      });

      const token = user?.token;
      const res = await axios.put(
        `http://localhost:5000/api/events/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Event updated successfully!');
      setSaving(false);
      navigate("/club/manage-events");
    } catch (error) {
      console.error("Error updating event:", error);
      const errorMessage = error.response?.data?.message || 
                          'Failed to update event. Please try again.';
      alert(errorMessage);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const token = user?.token;
        await axios.delete(`http://localhost:5000/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Event deleted successfully!');
        navigate('/club/manage-events');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(error.response?.data?.message || 'Failed to delete event. Please try again.');
      }
    }
  };

  const isFormValid = () => {
    return formData.title.trim() && 
           formData.description.trim() && 
           formData.date && 
           formData.time && 
           formData.venue.trim();
  };

  // Generate sheet URL from formSheetId for preview
  const getSheetPreviewUrl = () => {
    if (!formData.formSheetId) return null;
    
    // If it's already a full URL, use it directly
    if (formData.formSheetId.startsWith('http')) {
      return formData.formSheetId;
    }
    
    // If it's just a sheet ID, construct the URL
    // This assumes Google Sheets - adjust based on your actual sheet service
    return `https://docs.google.com/spreadsheets/d/${formData.formSheetId}/edit?usp=sharing`;
  };

  const sheetPreviewUrl = getSheetPreviewUrl();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/club/manage-events')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Back to Events"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-xl text-gray-600 mt-2">Update your event details</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Event</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event Type *</label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Venue *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter event venue"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Describe your event in detail..."
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-blue-600" />
                Event Tags
              </h2>
              
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Add Tag
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Registration */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Link className="w-5 h-5 mr-2 text-blue-600" />
                Registration
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Google Form Link</label>
                    <input
                      type="url"
                      name="formLink"
                      value={formData.formLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://forms.gle/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Google Sheet ID/URL</label>
                    <input
                      type="text"
                      name="formSheetId"
                      value={formData.formSheetId}
                      onChange={handleInputChange}
                      placeholder="Sheet ID or full URL"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter Google Sheet ID (e.g., 1abc123def456) or full URL
                    </p>
                  </div>
                </div>

                {sheetPreviewUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Sheet Preview</label>
                      <button
                        type="button"
                        onClick={() => setSelectedSheet(sheetPreviewUrl)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Sheet</span>
                      </button>
                    </div>
                    <iframe
                      src={sheetPreviewUrl}
                      className="w-full h-96 rounded-lg border border-gray-200"
                      frameBorder="0"
                      title={`${formData.title} Sheet`}
                    ></iframe>
                  </div>
                )}
              </div>
            </div>

            {/* Posters */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                Event Posters
              </h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload additional posters</p>
                  <p className="text-sm text-gray-500 mb-4">Supports JPG, PNG, WEBP (Max 5MB each)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePosterUpload}
                    className="hidden"
                    id="poster-upload"
                  />
                  <label
                    htmlFor="poster-upload"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Add More Posters</span>
                  </label>
                </div>

                {(formData.posters.length > 0 || newPosters.length > 0) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.posters.map((poster, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={poster}
                          alt={`Poster ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePoster(poster)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {newPosters.map((poster, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img
                          src={URL.createObjectURL(poster)}
                          alt={`New Poster ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePoster(poster)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/club/manage-events')}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Sheet Modal */}
      {selectedSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Sheet Preview</h3>
              <button
                onClick={() => setSelectedSheet(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-6">
              <iframe
                src={selectedSheet}
                className="w-full h-full rounded-lg border border-gray-200"
                frameBorder="0"
                title="Sheet Preview"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEventPage;
