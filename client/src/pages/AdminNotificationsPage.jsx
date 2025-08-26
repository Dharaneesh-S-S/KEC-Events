import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/adminAPI';
import { useNavigate } from 'react-router-dom';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingNotification, setEditingNotification] = useState(null);
  const [notificationFormData, setNotificationFormData] = useState({
    title: '',
    message: '',
    recipientRole: '',
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Assuming an adminAPI.getNotifications() exists or will be created
      const response = await adminAPI.getNotifications();
      setNotifications(response || []);
    } catch (err) {
      setError('Failed to fetch notifications.');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!notificationFormData.title) newErrors.title = 'Title is required';
    if (!notificationFormData.message) newErrors.message = 'Message is required';
    if (!notificationFormData.recipientRole) newErrors.recipientRole = 'Recipient Role is required';

    if (Object.keys(newErrors).length > 0) {
      setError(Object.values(newErrors).join(', '));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingNotification) {
        // Assuming adminAPI.updateNotification(id, data) exists
        await adminAPI.updateNotification(editingNotification._id, notificationFormData);
      } else {
        // Assuming adminAPI.createNotification(data) exists
        await adminAPI.createNotification(notificationFormData);
      }
      
      setSuccess(`Notification ${editingNotification ? 'updated' : 'created'} successfully!`);
      
      setNotificationFormData({
        title: '',
        message: '',
        recipientRole: '',
      });
      setEditingNotification(null);
      fetchNotifications();
      
    } catch (err) {
      setError(err.message || `Failed to ${editingNotification ? 'update' : 'create'} notification. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setNotificationFormData({
      title: notification.title || '',
      message: notification.message || '',
      recipientRole: notification.recipientRole || '',
    });
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        // Assuming adminAPI.deleteNotification(id) exists
        await adminAPI.deleteNotification(id);
        setSuccess('Notification deleted successfully!');
        fetchNotifications();
    } catch (err) {
        setError(err.message || 'Failed to delete notification. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Notification Management</h1>

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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{editingNotification ? 'Edit Notification' : 'Create New Notification'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={notificationFormData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter notification title"
              />
            </div>
            <div>
              <label htmlFor="recipientRole" className="block text-sm font-medium text-gray-700 mb-1">Recipient Role *</label>
              <select
                id="recipientRole"
                name="recipientRole"
                value={notificationFormData.recipientRole}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Role</option>
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="club">Club</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              id="message"
              name="message"
              value={notificationFormData.message}
              onChange={handleInputChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter notification message"
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
                  {editingNotification ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingNotification ? 'Update Notification' : 'Create Notification'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Notifications</h2>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No notifications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{notification.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{notification.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {notification.recipientRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditNotification(notification)} className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onClick={() => handleDeleteNotification(notification._id)} className="text-red-600 hover:text-red-900">Delete</button>
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

export default AdminNotificationsPage;
