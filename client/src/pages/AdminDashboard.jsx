import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/adminAPI';
import { apiRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('clubs');
  
  // Club management state
  const [clubs, setClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [newClubName, setNewClubName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    description: ''
  });

  // Venue management state
  const [venues, setVenues] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    venueType: 'cc',
    location: '',
    department: '',
    capacity: '',
    facultyInCharge: '',
    facultyContact: '',
    labAssistant: '',
    labAssistantContact: '',
    features: '',
    description: '',
    specialInstructions: '',
    availableLogistics: {
      projector: false,
      mic: false,
      speakers: false,
      whiteboard: false,
      ac: false,
      stage: false,
      soundSystem: false,
      stageLighting: false,
      wifi: false
    }
  });

  // Venue types for dropdown
  const venueTypes = [
    { value: 'cc', label: 'Computer Center' },
    { value: 'seminar', label: 'Seminar Hall' },
    { value: 'maharaja', label: 'Maharaja Hall' },
    { value: 'convention', label: 'Convention Center' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch departments and clubs on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setFetching(true);
        const [departmentsData, clubsData] = await Promise.all([
          adminAPI.getDepartments(),
          adminAPI.getClubs()
        ]);
        
        setDepartments(departmentsData || []);
        setClubs(clubsData || []);
      } catch (err) {
        setError('Failed to fetch initial data. Please refresh the page.');
        console.error('Error fetching initial data:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch venues when department is selected
  useEffect(() => {
    if (selectedDepartment && activeTab === 'venues') {
      fetchVenues();
    } else {
      setVenues([]);
    }
  }, [selectedDepartment, activeTab]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await adminAPI.createClub(formData);
      
      // Show success message
      setSuccess('Club created successfully!');
      
      // Store generated password and club name for modal
      setGeneratedPassword(response.generatedPassword);
      setNewClubName(formData.name);
      setShowPasswordModal(true);
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        department: '',
        description: ''
      });
      
      // Refresh clubs list
      const updatedClubs = await adminAPI.getClubs();
      setClubs(updatedClubs || []);
      
    } catch (err) {
      setError(err.message || 'Failed to create club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Venue API functions
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const dept = (selectedDepartment || '').trim();
      const params = new URLSearchParams();
      if (dept) params.append('department', dept);
      const endpoint = `/venues${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('[AdminDashboard] Fetching venues with:', endpoint);
      const response = await apiRequest(endpoint);
      console.log('[AdminDashboard] Venues fetched:', response?.venues?.length || 0);
      setVenues(response.venues || []);
    } catch (err) {
      setError('Failed to fetch venues');
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const createVenue = async (venueData) => {
    try {
      setLoading(true);
      await apiRequest('/venues', {
        method: 'POST',
        body: JSON.stringify(venueData)
      });
      setSuccess('Venue created successfully');
      fetchVenues();
      closeVenueModal();
    } catch (err) {
      setError(err.message || 'Failed to create venue');
    } finally {
      setLoading(false);
    }
  };

  const updateVenue = async (id, venueData) => {
    try {
      setLoading(true);
      await apiRequest(`/venues/${id}`, {
        method: 'PUT',
        body: JSON.stringify(venueData)
      });
      setSuccess('Venue updated successfully');
      fetchVenues();
      closeVenueModal();
    } catch (err) {
      setError(err.message || 'Failed to update venue');
    } finally {
      setLoading(false);
    }
  };

  const deleteVenue = async (id) => {
    try {
      setLoading(true);
      await apiRequest(`/venues/${id}`, {
        method: 'DELETE'
      });
      setSuccess('Venue deleted successfully');
      fetchVenues();
      setShowDeleteConfirm(false);
      setVenueToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete venue');
    } finally {
      setLoading(false);
    }
  };

  const clearNonPersistedVenues = async () => {
    try {
      setLoading(true);
      await apiRequest('/venues/clear-non-persisted', {
        method: 'DELETE'
      });
      setSuccess('Non-persisted venues cleared successfully');
      fetchVenues();
    } catch (err) {
      setError(err.message || 'Failed to clear non-persisted venues');
    } finally {
      setLoading(false);
    }
  };

  // Venue form handlers
  const handleVenueInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('logistics.')) {
      const logisticsField = name.split('.')[1];
      setVenueFormData(prev => ({
        ...prev,
        availableLogistics: {
          ...prev.availableLogistics,
          [logisticsField]: checked
        }
      }));
    } else {
      setVenueFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...venueFormData,
      capacity: parseInt(venueFormData.capacity),
      features: venueFormData.features.split(',').map(f => f.trim()).filter(f => f),
      department: venueFormData.department || selectedDepartment
    };

    if (editingVenue) {
      await updateVenue(editingVenue._id, submitData);
    } else {
      await createVenue(submitData);
    }
  };

  const openVenueModal = (venue = null) => {
    if (venue) {
      setEditingVenue(venue);
      setVenueFormData({
        name: venue.name || '',
        venueType: venue.venueType || 'cc',
        location: venue.location || '',
        department: venue.department || '',
        capacity: venue.capacity?.toString() || '',
        facultyInCharge: venue.facultyInCharge || '',
        facultyContact: venue.facultyContact || '',
        labAssistant: venue.labAssistant || '',
        labAssistantContact: venue.labAssistantContact || '',
        features: venue.features?.join(', ') || '',
        description: venue.description || '',
        specialInstructions: venue.specialInstructions || '',
        availableLogistics: venue.availableLogistics || {
          projector: false,
          mic: false,
          speakers: false,
          whiteboard: false,
          ac: false,
          stage: false,
          soundSystem: false,
          stageLighting: false,
          wifi: false
        }
      });
    } else {
      setEditingVenue(null);
      setVenueFormData({
        name: '',
        venueType: 'cc',
        location: '',
        department: selectedDepartment,
        capacity: '',
        facultyInCharge: '',
        facultyContact: '',
        labAssistant: '',
        labAssistantContact: '',
        features: '',
        description: '',
        specialInstructions: '',
        availableLogistics: {
          projector: false,
          mic: false,
          speakers: false,
          whiteboard: false,
          ac: false,
          stage: false,
          soundSystem: false,
          stageLighting: false,
          wifi: false
        }
      });
    }
    setShowVenueModal(true);
  };

  const closeVenueModal = () => {
    setShowVenueModal(false);
    setEditingVenue(null);
  };

  const handleDeleteClick = (venue) => {
    setVenueToDelete(venue);
    setShowDeleteConfirm(true);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Go Back to Home"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage clubs and venues across departments</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('clubs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clubs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Club Management
              </button>
              <button
                onClick={() => setActiveTab('venues')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'venues'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Venue Management
              </button>
            </nav>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Club Management Content */}
        {activeTab === 'clubs' && (
          <>
            {/* Create Club Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Club</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Club Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter club name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter club email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))
                ) : (
                  // Fallback to static departments if API doesn't return any
                  ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'].map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter club description (optional)"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md font-medium text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Club'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* All Clubs Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">All Clubs</h2>
          
          {clubs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No clubs found. Create your first club above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Club Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clubs.map((club) => (
                    <tr key={club._id || club.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {club.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {club.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {club.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {club.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}

        {/* Venue Management Content */}
        {activeTab === 'venues' && (
          <>
            {/* Department Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Venue Management</h2>
                  <p className="text-gray-600 mt-1">Select a department to manage its venues</p>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <button
                    onClick={() => clearNonPersistedVenues()}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    disabled={loading}
                  >
                    Clear Non-Persisted
                  </button>
                  <button
                    onClick={() => openVenueModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!selectedDepartment || loading}
                  >
                    Add Venue
                  </button>
                </div>
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value.trim())}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Choose a department...</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Venues Table */}
            {selectedDepartment && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Venues in {selectedDepartment}
                  </h3>
                </div>
                
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading venues...</p>
                  </div>
                ) : venues.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No venues found for this department.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty In Charge</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {venues.map((venue) => (
                          <tr key={venue._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{venue.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {venueTypes.find(t => t.value === venue.venueType)?.label || venue.venueType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venue.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venue.capacity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venue.facultyInCharge}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venue.facultyContact}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="max-w-xs truncate">{venue.features?.join(', ') || 'None'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                venue.availability?.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {venue.availability?.maintenanceMode ? 'Maintenance' : venue.availability?.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button onClick={() => openVenueModal(venue)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                <button onClick={() => handleDeleteClick(venue)} className="text-red-600 hover:text-red-900">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Venue Modal */}
      {showVenueModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingVenue ? 'Edit Venue' : 'Add New Venue'}
                </h3>
                <button onClick={closeVenueModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleVenueSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={venueFormData.name}
                      onChange={handleVenueInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue Type *</label>
                    <select
                      name="venueType"
                      value={venueFormData.venueType}
                      onChange={handleVenueInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {venueTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={venueFormData.location}
                      onChange={handleVenueInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={venueFormData.capacity}
                      onChange={handleVenueInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      name="department"
                      value={venueFormData.department}
                      onChange={handleVenueInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty In Charge *</label>
                    <input
                      type="text"
                      name="facultyInCharge"
                      value={venueFormData.facultyInCharge}
                      onChange={handleVenueInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Contact *</label>
                    <input
                      type="tel"
                      name="facultyContact"
                      value={venueFormData.facultyContact}
                      onChange={handleVenueInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lab Assistant</label>
                    <input
                      type="text"
                      name="labAssistant"
                      value={venueFormData.labAssistant}
                      onChange={handleVenueInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lab Assistant Contact</label>
                    <input
                      type="tel"
                      name="labAssistantContact"
                      value={venueFormData.labAssistantContact}
                      onChange={handleVenueInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
                  <input
                    type="text"
                    name="features"
                    value={venueFormData.features}
                    onChange={handleVenueInputChange}
                    placeholder="e.g., Projector, Whiteboard, AC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Available Logistics</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(venueFormData.availableLogistics).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`logistics.${key}`}
                          checked={value}
                          onChange={handleVenueInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={venueFormData.description}
                    onChange={handleVenueInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    name="specialInstructions"
                    value={venueFormData.specialInstructions}
                    onChange={handleVenueInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeVenueModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingVenue ? 'Update Venue' : 'Create Venue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && venueToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Venue</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{venueToDelete.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setVenueToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteVenue(venueToDelete._id)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Club Created Successfully!</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  The club <strong>{newClubName}</strong> has been created with the following credentials:
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">Generated Password:</p>
                  <div className="flex items-center justify-between bg-white p-3 border rounded-md">
                    <code className="text-lg font-mono text-gray-800">{generatedPassword}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                        // You could add a toast here to confirm copy
                      }}
                      className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  ⚠️ Save this password securely. It won't be shown again.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
