import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  Users,
  Building2,
  Bell,
  Clock,
  Trash2,
  Eye,
  Target
} from 'lucide-react';

const AdminNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all', // all, students, clubs
    priority: 'normal' // low, normal, high
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setNotifications([
          {
            _id: '1',
            title: 'System Maintenance',
            message: 'The club management system will be undergoing maintenance this weekend. Please save your work.',
            target: 'all',
            priority: 'high',
            sentBy: user.name,
            sentAt: new Date('2024-03-10T14:30:00Z'),
            readCount: 45
          },
          {
            _id: '2',
            title: 'New Feature Available',
            message: 'We have added new event management features. Check out the updated dashboard!',
            target: 'clubs',
            priority: 'normal',
            sentBy: user.name,
            sentAt: new Date('2024-03-08T09:15:00Z'),
            readCount: 23
          },
          {
            _id: '3',
            title: 'Welcome New Students',
            message: 'Welcome to the new academic year! Explore clubs and events to get involved.',
            target: 'students',
            priority: 'normal',
            sentBy: user.name,
            sentAt: new Date('2024-03-05T16:45:00Z'),
            readCount: 189
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const newNotification = {
          _id: Date.now().toString(),
          ...formData,
          sentBy: user.name,
          sentAt: new Date(),
          readCount: 0
        };
        setNotifications([newNotification, ...notifications]);
        setFormData({ title: '', message: '', target: 'all', priority: 'normal' });
        setSending(false);
        
        // Show success message
        alert('Notification sent successfully!');
      }, 1500);
    } catch (error) {
      console.error('Error sending notification:', error);
      setSending(false);
      alert('Error sending notification. Please try again.');
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(n => n._id !== notificationId));
    }
  };

  const getTargetDisplay = (target) => {
    switch (target) {
      case 'all': return 'Everyone';
      case 'students': return 'Students Only';
      case 'clubs': return 'Clubs Only';
      default: return target;
    }
  };

  const getTargetIcon = (target) => {
    switch (target) {
      case 'all': return <Users className="w-4 h-4" />;
      case 'students': return <Users className="w-4 h-4" />;
      case 'clubs': return <Building2 className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Notifications</h1>
          <p className="text-gray-600 mt-2">Send announcements and updates to students and clubs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Send Notification Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Send className="w-5 h-5 mr-2 text-blue-600" />
                Send Notification
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter notification title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Everyone (Students & Clubs)</option>
                    <option value="students">Students Only</option>
                    <option value="clubs">Clubs Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Notifications History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
                  Sent Notifications
                </h2>
                <p className="text-gray-600 mt-1">{notifications.length} notifications sent</p>
              </div>

              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div key={notification._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {getTargetIcon(notification.target)}
                          <span className="ml-1">{getTargetDisplay(notification.target)}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>{notification.readCount} reads</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{new Date(notification.sentAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        by {notification.sentBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No notifications sent yet</p>
                  <p className="text-gray-400 mt-1">Send your first notification using the form</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;