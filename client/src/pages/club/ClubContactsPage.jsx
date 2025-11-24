import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useClub } from '../../hooks/useClubs';
import { clubAPI } from '../../services/clubService';

const ClubContactsPage = () => {
  const { slug } = useParams();
  const { club, loading, error, refetch } = useClub(slug, true);
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: [''],
    phone: [''],
    position: ''
  });

  useEffect(() => {
    if (club) {
      setContacts(club.contactInfo || []);
    }
  }, [club]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await clubAPI.addContact(club._id, formData);
      await refetch();
      setShowAddForm(false);
      setFormData({
        name: '',
        role: '',
        email: [''],
        phone: [''],
        position: ''
      });
    } catch (error) {
      console.error('Failed to add contact:', error);
      alert('Failed to add contact: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      await clubAPI.updateContact(club._id, editingContact._id, formData);
      await refetch();
      setEditingContact(null);
      setFormData({
        name: '',
        role: '',
        email: [''],
        phone: [''],
        position: ''
      });
    } catch (error) {
      console.error('Failed to update contact:', error);
      alert('Failed to update contact: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await clubAPI.deleteContact(club._id, contactId);
        await refetch();
      } catch (error) {
        console.error('Failed to delete contact:', error);
        alert('Failed to delete contact: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const startEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      email: contact.email || [''],
      phone: contact.phone || [''],
      position: contact.position
    });
  };

  const cancelEdit = () => {
    setEditingContact(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      role: '',
      email: [''],
      phone: [''],
      position: ''
    });
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;
  if (!club) return <div className="text-center">Club not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {club.name} - Contacts
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Contact
        </button>
      </div>

      {/* Add/Edit Contact Form */}
      {(showAddForm || editingContact) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <form onSubmit={editingContact ? handleUpdateContact : handleAddContact}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email Fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Addresses
              </label>
              {formData.email.map((email, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleArrayInputChange('email', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                  {formData.email.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('email', index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('email')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Add Email
              </button>
            </div>

            {/* Phone Fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers
              </label>
              {formData.phone.map((phone, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handleArrayInputChange('phone', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                  {formData.phone.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('phone', index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('phone')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Add Phone
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <div key={contact._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{contact.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(contact)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteContact(contact._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {contact.position && (
              <p className="text-gray-600 mb-2">{contact.position}</p>
            )}
            {contact.role && (
              <p className="text-gray-500 text-sm mb-3">{contact.role}</p>
            )}

            <div className="space-y-2">
              {contact.email && contact.email.map((email, index) => (
                email && (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="mr-2">📧</span>
                    <a href={`mailto:${email}`} className="hover:text-blue-500">
                      {email}
                    </a>
                  </div>
                )
              ))}
              
              {contact.phone && contact.phone.map((phone, index) => (
                phone && (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="mr-2">📞</span>
                    <a href={`tel:${phone}`} className="hover:text-blue-500">
                      {phone}
                    </a>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      {contacts.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No contacts found for this club.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Add First Contact
          </button>
        </div>
      )}
    </div>
  );
};

export default ClubContactsPage;