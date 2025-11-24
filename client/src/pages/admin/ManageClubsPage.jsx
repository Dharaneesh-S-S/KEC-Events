import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  Image,
  Save,
  X,
  Upload,
  Link,
  Images
} from 'lucide-react';
import slugify from 'slugify';

const ManageClubsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    gallery: [],
    contactInfo: [],
    ownerName: '',
    ownerEmail: ''
  });
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    position: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClubs();
    if (id) {
      setIsEditing(true);
      loadClubForEdit(id);
    }
  }, [id]);

  useEffect(() => {
  if (formData.name && !isEditing && !slugManuallyEdited) {
    const generatedSlug = slugify(formData.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    setFormData(prev => ({
      ...prev,
      slug: generatedSlug
    }));
  }
}, [formData.name, isEditing, slugManuallyEdited]);



  const API_BASE = 'http://localhost:5000/api';


  const loadClubs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/clubs`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs);
      } else {
        console.error('Failed to load clubs');
        // Fallback to empty array
        setClubs([]);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClubForEdit = async (clubId) => {
    try {
      const response = await fetch(`${API_BASE}/clubs/${clubId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const club = await response.json();
        setFormData({
          name: club.name || '',
          description: club.description || '',
          logoUrl: club.logoUrl || '',
          gallery: club.gallery || [],
          contactInfo: club.contactInfo || []
        });
      } else {
        console.error('Failed to load club for editing');
      }
    } catch (error) {
      console.error('Error loading club for edit:', error);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  
  try {
    const url = isEditing ? `${API_BASE}/clubs/${id}` : `${API_BASE}/clubs`;
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const savedClub = await response.json();
      console.log('Club saved successfully:', savedClub);
      await loadClubs(); // Reload the clubs list
      resetForm();
      
      if (isEditing) {
        navigate('/admin/clubs');
      } else {
        // For new clubs, show success message and stay on the page
        alert('Club created successfully!');
        setIsAdding(false);
      }
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to save club');
    }
  } catch (error) {
    console.error('Error saving club:', error);
    alert('Error saving club. Please try again.');
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (clubId) => {
    if (window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_BASE}/admin/clubs/${clubId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await loadClubs(); // Reload the clubs list
          alert('Club deleted successfully');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete club');
        }
      } catch (error) {
        console.error('Error deleting club:', error);
        alert('Error deleting club. Please try again.');
      }
    }
  };

  const addContact = () => {
    if (newContact.name && newContact.email && newContact.role) {
      setFormData({
        ...formData,
        contactInfo: [...formData.contactInfo, { ...newContact }]
      });
      setNewContact({ name: '', role: '', email: '', phone: '', position: '' });
    } else {
      alert('Please fill in name, email, and role for the contact');
    }
  };

  const removeContact = (index) => {
    const updatedContacts = [...formData.contactInfo];
    updatedContacts.splice(index, 1);
    setFormData({ ...formData, contactInfo: updatedContacts });
  };

  const addGalleryImage = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      setFormData({
        ...formData,
        gallery: [...formData.gallery, imageUrl]
      });
    }
  };

  const removeGalleryImage = (index) => {
    const updatedGallery = [...formData.gallery];
    updatedGallery.splice(index, 1);
    setFormData({ ...formData, gallery: updatedGallery });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logoUrl: '',
      gallery: [],
      contactInfo: []
    });
    setNewContact({ name: '', role: '', email: '', phone: '', position: '' });
    setIsEditing(false);
    setIsAdding(false);
    setSlugManuallyEdited(false);
  };

  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Club' : isAdding ? 'Add New Club' : 'Manage Clubs'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing || isAdding ? 'Update club information' : 'Create and manage student clubs'}
            </p>
          </div>
          
          {!isEditing && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg mt-4 sm:mt-0"
            >
              <Plus className="w-5 h-5" />
              <span>Add Club</span>
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {(isAdding || isEditing) && (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter club name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Link className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => {
                          setSlugManuallyEdited(true);  
                          setFormData({ ...formData, slug: e.target.value });
                        }}

                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="club-url-slug"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will be used in the URL: yoursite.com/clubs/{formData.slug || 'club-name'}
                    </p>
                  </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe the club's purpose and activities"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo URL
                        </label>
                        <input
                          type="url"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com/logo.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      {/* Add Contact Form */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Add Contact</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Name *"
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <select
                            value={newContact.role}
                            onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Select Role *</option>
                            <option value="advisor">Advisor</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="president">President</option>
                            <option value="faculty">Faculty</option>
                            <option value="staff">Staff</option>
                          </select>
                          <input
                            type="email"
                            placeholder="Email *"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Position/Title"
                          value={newContact.position}
                          onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                          className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={addContact}
                          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          Add Contact
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Owner Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.ownerName || ''}
                          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Owner full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Owner Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.ownerEmail || ''}
                          onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Owner email address"
                        />
                      </div>


                      {/* Contacts List */}
                      {formData.contactInfo.map((contact, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900">{contact.name}</h5>
                              <p className="text-sm text-gray-600">{contact.position}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeContact(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {contact.email}
                            </div>
                            {contact.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {contact.phone}
                              </div>
                            )}
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {contact.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gallery Management */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery Images</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <button
                          type="button"
                          onClick={addGalleryImage}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Gallery Image</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                  {/* Logo Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo Preview</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Club logo"
                          className="w-32 h-32 rounded-lg object-cover mx-auto"
                        />
                      ) : (
                        <div className="py-8">
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No logo uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gallery Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Gallery ({formData.gallery.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.gallery.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {formData.gallery.length === 0 && (
                        <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Images className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No gallery images</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'Update' : 'Create'} Club</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clubs List */}
        {!isAdding && !isEditing && (
          <>
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <div key={club._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={club.logoUrl || '/default-club-logo.png'}
                          alt={club.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                          onError={(e) => {
                            e.target.src = '/default-club-logo.png';
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{club.name}</h3>
                          <p className="text-sm text-gray-500">
                            by {club.owner?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {club.description || 'No description provided'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {club.contactInfo?.length || 0} contacts
                      </div>
                      <div className="flex items-center">
                        <Images className="w-4 h-4 mr-1" />
                        {club.gallery?.length || 0} photos
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/manage-clubs/edit/${club._id}`)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Edit Club
                      </button>
                      <button
                        onClick={() => handleDelete(club._id)}
                        className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No clubs found matching your search' : 'No clubs available'}
                </p>
                <p className="text-gray-400 mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first club'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create First Club
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageClubsPage;