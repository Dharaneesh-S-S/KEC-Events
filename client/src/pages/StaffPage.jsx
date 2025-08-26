import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/adminAPI';
import { useNavigate } from 'react-router-dom';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    contactNumber: '',
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStaff();
      setStaff(response || []);
    } catch (err) {
      setError('Failed to fetch staff details.');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleStaffInputChange = (e) => {
    const { name, value } = e.target;
    setStaffFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!staffFormData.name) newErrors.name = 'Name is required';
    if (!staffFormData.email) newErrors.email = 'Email is required';
    if (!staffFormData.role) newErrors.role = 'Role is required';

    if (Object.keys(newErrors).length > 0) {
      setError(Object.values(newErrors).join(', '));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      if (editingStaff) {
        response = await adminAPI.updateStaff(editingStaff._id, staffFormData);
      } else {
        response = await adminAPI.createStaff(staffFormData);
      }
      
      setSuccess(`Staff ${editingStaff ? 'updated' : 'created'} successfully!`);
      
      setStaffFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        contactNumber: '',
      });
      setEditingStaff(null);
      fetchStaff();
      
    } catch (err) {
      setError(err.message || 'Failed to create/update staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openStaffModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setStaffFormData({
        name: staffMember.name || '',
        email: staffMember.email || '',
        role: staffMember.role || '',
        department: staffMember.department || '',
        contactNumber: staffMember.contactNumber || '',
      });
      setShowStaffModal(true);
    } else {
      setEditingStaff(null);
      setStaffFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        contactNumber: '',
      });
      setShowStaffModal(true);
    }
  };

  const closeStaffModal = () => {
    setShowStaffModal(false);
    setEditingStaff(null);
    setStaffFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      contactNumber: '',
    });
  };

  const deleteStaff = async (id) => {
    try {
      setLoading(true);
      await adminAPI.deleteStaff(id);
      setSuccess('Staff deleted successfully');
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Failed to delete staff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Staff Details</h1>

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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Staff Details</h2>
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="staffName" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                id="staffName"
                name="name"
                value={staffFormData.name}
                onChange={handleStaffInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter staff name"
              />
            </div>
            <div>
              <label htmlFor="staffEmail" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                id="staffEmail"
                name="email"
                value={staffFormData.email}
                onChange={handleStaffInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter staff email"
              />
            </div>
            <div>
              <label htmlFor="staffRole" className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                id="staffRole"
                name="role"
                value={staffFormData.role}
                onChange={handleStaffInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label htmlFor="staffDepartment" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                id="staffDepartment"
                name="department"
                value={staffFormData.department}
                onChange={handleStaffInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department (Optional)</option>
                {/* You'll need to pass departments as props or fetch them here */}
                {/* For now, using static options for demonstration */}
                {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'].map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="staffContactNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                id="staffContactNumber"
                name="contactNumber"
                value={staffFormData.contactNumber}
                onChange={handleStaffInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact number"
              />
            </div>
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
                  Saving...
                </div>
              ) : (
                editingStaff ? 'Update Staff' : 'Add Staff'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Staff</h2>
        {staff.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No staff found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.department || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.contactNumber || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => openStaffModal(s)} className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onClick={() => deleteStaff(s._id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPage; 