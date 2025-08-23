// pages/StudentNotificationsPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Bell, CheckCircle, Clock, MapPin, Users, XCircle, Info, CalendarClock, RefreshCcw } from 'lucide-react';
import { notifications } from '../data/notifications'; // Import notifications data

function StudentNotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered notifications based on search query (and potentially student-specific types)
  const filteredNotifications = notifications.filter(notification =>
    (notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const iconFor = (type) => {
    switch (type) {
      case 'venue_booked':
        return <MapPin className="w-5 h-5 text-green-600" />;
      case 'event_registered':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'deadline_reminder':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'event_cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'system_update':
        return <Info className="w-5 h-5 text-purple-600" />;
      case 'meeting_reminder':
        return <CalendarClock className="w-5 h-5 text-indigo-600" />;
      case 'event_update':
        return <RefreshCcw className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const colorFor = (type) => {
    switch (type) {
      case 'venue_booked':
        return 'border-l-green-500 bg-green-50';
      case 'event_registered':
        return 'border-l-blue-500 bg-blue-50';
      case 'deadline_reminder':
        return 'border-l-orange-500 bg-orange-50';
      case 'event_cancelled':
        return 'border-l-red-500 bg-red-50';
      case 'system_update':
        return 'border-l-purple-500 bg-purple-50';
      case 'meeting_reminder':
        return 'border-l-indigo-500 bg-indigo-50';
      case 'event_update':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSort={false} onSearch={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">Student Notifications</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            View notifications related to your registered events and deadlines
          </p>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Notifications
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {/* Conditionally render content */}
            {!filteredNotifications.length ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                <p className="text-gray-500">
                  You don't have any student-related notifications yet.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-6 border-l-4 ${colorFor(n.type)} ${
                    !n.read ? 'bg-opacity-100' : 'bg-opacity-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {iconFor(n.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`text-lg font-semibold ${
                            !n.read ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {n.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!n.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(n.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-sm ${
                          !n.read ? 'text-gray-700' : 'text-gray-600'
                        }`}
                      >
                        {n.message}
                      </p>

                      <div className="mt-3 flex items-center space-x-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            n.type === 'venue_booked'
                              ? 'bg-green-100 text-green-800'
                              : n.type === 'event_registered'
                              ? 'bg-blue-100 text-blue-800'
                              : n.type === 'deadline_reminder'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {n.type.replace('_', ' ').toUpperCase()}
                        </span>

                        {!n.read && (
                          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentNotificationsPage;
