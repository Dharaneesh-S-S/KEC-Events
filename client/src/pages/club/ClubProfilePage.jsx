import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Building,
  Mail,
  Phone,
  User,
  Users,
  Plus,
  X,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const ClubProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [club, setClub] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    gallery: [],
    contactInfo: []
  });
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    position: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [newLogo, setNewLogo] = useState(null);
  const [newGallery, setNewGallery] = useState([]);

  useEffect(() => {
    loadClubProfile();
  }, []);

  const loadClubProfile = async () => {
    setLoading(true);
    try {
      const token = user?.token;
      
      // Get user's clubs - your backend endpoint
      const res = await axios.get('http://localhost:5000/api/clubs/my/clubs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.length === 0) {
        alert('You need to create a club first!');
        navigate('/club/create-club');
        return;
      }

      const userClub = res.data[0];
      setClub(userClub);
      
      setFormData({
        name: userClub.name || '',
        description: userClub.description || '',
        logoUrl: userClub.logoUrl || '',
        gallery: userClub.gallery || [],
        contactInfo: userClub.contactInfo || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading club profile:', error);
      alert(error.response?.data?.message || 'Failed to load club profile. Please try again.');
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

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLogo(file);
      const logoUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        logoUrl
      }));
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewGallery(prev => [...prev, ...files]);
    
    const newGalleryUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...newGalleryUrls]
    }));
  };

  const handleRemoveGalleryImage = (imageToRemove, index) => {
    // Remove from new gallery files if it's a blob URL
    if (typeof imageToRemove === 'string' && imageToRemove.startsWith('blob:')) {
      const blobIndex = formData.gallery.findIndex(img => img === imageToRemove);
      if (blobIndex !== -1) {
        setNewGallery(prev => prev.filter((_, i) => i !== blobIndex));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter(image => image !== imageToRemove)
    }));
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.role && newContact.email) {
      setFormData(prev => ({
        ...prev,
        contactInfo: [...prev.contactInfo, { ...newContact }]
      }));
      setNewContact({
        name: '',
        role: '',
        email: '',
        phone: '',
        position: ''
      });
      setShowContactForm(false);
    }
  };

  const handleRemoveContact = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: prev.contactInfo.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      
      // Append contact info as JSON
      formDataToSend.append('contactInfo', JSON.stringify(formData.contactInfo));
      
      // Append gallery as JSON (existing images)
      formDataToSend.append('gallery', JSON.stringify(formData.gallery.filter(img => !img.startsWith('blob:'))));

      // Handle logo upload
      if (newLogo) {
        formDataToSend.append('logo', newLogo);
      } else if (formData.logoUrl && !formData.logoUrl.startsWith('blob:')) {
        // Keep existing logo if not changed
        formDataToSend.append('logoUrl', formData.logoUrl);
      }

      // Handle new gallery images
      newGallery.forEach((file) => {
        formDataToSend.append('galleryImages', file);
      });

      const token = user?.token;
      
      // Update club using the correct endpoint - PUT /api/clubs/:id
      await axios.put(
        `http://localhost:5000/api/clubs/${club._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Club profile updated successfully!');
      setSaving(false);
      loadClubProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating club profile:', error);
      alert(error.response?.data?.message || 'Failed to update club profile. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club profile...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Club Found</h2>
          <p className="text-gray-600 mb-6">You need to create a club first.</p>
          <button
            onClick={() => navigate('/club/create-club')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Create Club
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/club/dashboard')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Club Profile</h1>
          <p className="text-xl text-gray-600 mt-2">Manage your club information and contacts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Building className="w-6 h-6 mr-2 text-blue-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Club Logo</label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img
                        src={formData.logoUrl || '/default-club-logo.png'}
                        alt="Club Logo"
                        className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = '/default-club-logo.png';
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Upload a square logo</p>
                      <p className="text-xs text-gray-500">Recommended: 256x256px</p>
                    </div>
                  </div>
                </div>

                {/* Club Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Club Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter club name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Describe your club's mission and activities..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ImageIcon className="w-6 h-6 mr-2 text-blue-600" />
                Gallery
              </h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload club gallery images</p>
                  <p className="text-sm text-gray-500 mb-4">Showcase your club activities and events</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Add Gallery Images</span>
                  </label>
                </div>

                {formData.gallery.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.gallery.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/default-image.png';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(image, index)}
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

            {/* Contact Information */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Contact Information
                </h2>
                <button
                  type="button"
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>

              {/* Add Contact Form */}
              {showContactForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Add New Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={newContact.name}
                      onChange={handleContactChange}
                      placeholder="Full Name *"
                      className="px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      name="role"
                      value={newContact.role}
                      onChange={handleContactChange}
                      placeholder="Role *"
                      className="px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={newContact.email}
                      onChange={handleContactChange}
                      placeholder="Email *"
                      className="px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={newContact.phone}
                      onChange={handleContactChange}
                      placeholder="Phone"
                      className="px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      name="position"
                      value={newContact.position}
                      onChange={handleContactChange}
                      placeholder="Position/Department"
                      className="px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:col-span-2"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Contact
                    </button>
                  </div>
                </div>
              )}

              {/* Contacts List */}
              <div className="space-y-4">
                {formData.contactInfo.map((contact, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                            {contact.role}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.position && (
                            <div className="md:col-span-2 flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{contact.position}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Contact"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {formData.contactInfo.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No contacts added yet</p>
                    <p className="text-sm text-gray-500 mt-1">Add faculty advisors and club members</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/club/dashboard')}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
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
    </div>
  );
};

export default ClubProfilePage;