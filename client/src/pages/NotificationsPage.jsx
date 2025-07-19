// pages/NotificationsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Clock, MapPin, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import { notifications } from '../data/notifications';

function NotificationsPage() {
  const navigate = useNavigate();

  const iconFor = (type) => {
    switch (type) {
      case 'venue_booked':
        return <MapPin className="w-5 h-5 text-green-600" />;
      case 'event_registered':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'deadline_reminder':
        return <Clock className="w-5 h-5 text-orange-600" />;
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
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSort={false} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/club')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-lg text-gray-600">
            View your recent notifications and updates
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Notifications
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {!notifications.length ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                <p className="text-gray-500">
                  You don’t have any notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
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

export default NotificationsPage;
