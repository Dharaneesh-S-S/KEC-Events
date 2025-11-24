import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Calendar,
  MapPin,
  Users,
  Filter,
  Search,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCheck
} from 'lucide-react';
import { studentAPI } from '../../services/api';

const StudentNotificationsPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'event'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== 'student')) {
      navigate('/login');
      return;
    }
  }, [user, isAuthenticated, loading, navigate]);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeFilter, searchQuery]);

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      // Mock data - replace with actual API call when backend is ready
      const mockNotifications = [
        {
          _id: '1',
          title: 'Registration Confirmed',
          message: 'Your registration for Tech Symposium 2024 has been confirmed',
          type: 'event',
          relatedEvent: {
            _id: '1',
            title: 'Tech Symposium 2024',
            date: '2024-02-15T10:00:00.000Z',
            venue: 'Main Auditorium'
          },
          isRead: false,
          createdAt: '2024-02-10T09:30:00.000Z',
          priority: 'high'
        },
        {
          _id: '2',
          title: 'Event Reminder',
          message: 'Web Development Workshop starts in 2 days',
          type: 'reminder',
          relatedEvent: {
            _id: '2',
            title: 'Web Development Workshop',
            date: '2024-02-20T14:00:00.000Z',
            venue: 'Computer Lab 101'
          },
          isRead: true,
          createdAt: '2024-02-18T08:00:00.000Z',
          priority: 'medium'
        },
        {
          _id: '3',
          title: 'New Event Announcement',
          message: 'AI Hackathon registration is now open! Limited seats available.',
          type: 'announcement',
          relatedEvent: {
            _id: '3',
            title: 'AI Hackathon',
            date: '2024-02-25T09:00:00.000Z',
            venue: 'Innovation Center'
          },
          isRead: false,
          createdAt: '2024-02-12T14:20:00.000Z',
          priority: 'high'
        },
        {
          _id: '4',
          title: 'Event Update',
          message: 'Venue changed for Coding Competition',
          type: 'update',
          relatedEvent: {
            _id: '4',
            title: 'Coding Competition',
            date: '2024-02-22T10:00:00.000Z',
            venue: 'Lab Complex A-101'
          },
          isRead: false,
          createdAt: '2024-02-19T16:45:00.000Z',
          priority: 'medium'
        },
        {
          _id: '5',
          title: 'Registration Deadline',
          message: 'Last day to register for Robotics Workshop',
          type: 'deadline',
          relatedEvent: {
            _id: '5',
            title: 'Robotics Workshop',
            date: '2024-02-28T11:00:00.000Z',
            venue: 'Electronics Lab'
          },
          isRead: true,
          createdAt: '2024-02-17T10:15:00.000Z',
          priority: 'high'
        }
      ];

      // Uncomment when backend is ready:
      // const response = await studentAPI.getNotifications();
      // setNotifications(response.data || []);
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Apply type filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'unread') {
        filtered = filtered.filter(notification => !notification.isRead);
      } else {
        filtered = filtered.filter(notification => notification.type === activeFilter);
      }
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notification.relatedEvent && 
         notification.relatedEvent.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      // Uncomment when backend is ready:
      // await studentAPI.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        // Uncomment when backend is ready:
        // await studentAPI.markNotificationAsRead(notification._id);
      }
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Uncomment when backend is ready:
      // await studentAPI.deleteNotification(notificationId);
      
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'announcement':
        return <Bell className="w-5 h-5 text-purple-600" />;
      case 'update':
        return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'deadline':
        return <Clock className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'event':
        return 'bg-green-100 text-green-800';
      case 'reminder':
        return 'bg-blue-100 text-blue-800';
      case 'announcement':
        return 'bg-purple-100 text-purple-800';
      case 'update':
        return 'bg-orange-100 text-orange-800';
      case 'deadline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.relatedEvent) {
      navigate('/student/events/register', { 
        state: { event: notification.relatedEvent } 
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/dashboard')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-xl text-gray-600">
                Stay updated with your event registrations and announcements
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  <CheckCheck className="w-5 h-5" />
                  <span>Mark all as read</span>
                </button>
              )}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                <div className="text-sm text-gray-500">Total notifications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'all', label: 'All', count: notifications.length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'event', label: 'Events', count: notifications.filter(n => n.type === 'event').length },
                { id: 'reminder', label: 'Reminders', count: notifications.filter(n => n.type === 'reminder').length },
                { id: 'announcement', label: 'Announcements', count: notifications.filter(n => n.type === 'announcement').length },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loadingNotifications ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No notifications found</h3>
              <p className="text-gray-600 text-lg">
                {searchQuery || activeFilter !== 'all' 
                  ? 'Try adjusting your search criteria' 
                  : "You're all caught up! No new notifications."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`
                    p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer border-l-4
                    ${getPriorityColor(notification.priority)}
                    ${!notification.isRead ? 'bg-blue-50 border-l-blue-500' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        {/* Event Details */}
                        {notification.relatedEvent && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              {notification.relatedEvent.title}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {new Date(notification.relatedEvent.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                {notification.relatedEvent.venue}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Mark as read"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete notification"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty State for No Notifications */}
        {!loadingNotifications && notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No notifications yet</h3>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              When you register for events or there are important updates, you'll see them here.
            </p>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotificationsPage;