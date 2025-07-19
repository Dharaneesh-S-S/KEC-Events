// pages/ClubDashboard.jsx
import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Bell,
  Mail,
  MapPin,
  Menu,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

function ClubDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const actionButtons = [
    {
      icon: MapPin,
      title: 'Venue Booking',
      description: 'Book venues for your events',
      path: '/club/venue-booking',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      icon: Plus,
      title: 'Create Events',
      description: 'Create new events for your club',
      path: '/club/create-event',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: Edit,
      title: 'Manage Events',
      description: 'Edit and manage existing events',
      path: '/club/manage-events',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'View your notifications',
      path: '/club/notifications',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      icon: Mail,
      title: 'Contact',
      description: 'View faculty and staff contacts',
      path: '/contacts',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View event statistics',
      path: '/club/analytics',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-0">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-blue-600"
                >
                  <Menu className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">KEC</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Fests</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/calendar')}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Bell className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigate('/contacts')}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Mail className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user?.name?.[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Club Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back, {user?.name}! Manage your club events and activities.
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {actionButtons.slice(0, 5).map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.path}
                  onClick={() => navigate(btn.path)}
                  className={`${btn.color} text-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition`}
                >
                  <div className="flex items-center space-x-4">
                    <Icon className="w-8 h-8" />
                    <div>
                      <h3 className="text-lg font-semibold">{btn.title}</h3>
                      <p className="text-sm opacity-90">{btn.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Events', value: 3, color: 'text-blue-600' },
              { label: 'Total Registrations', value: 247, color: 'text-green-600' },
              { label: 'Upcoming Deadlines', value: 2, color: 'text-orange-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {stat.label}
                </h3>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-gray-500">
                  {stat.label === 'Active Events'
                    ? 'Currently running'
                    : stat.label === 'Total Registrations'
                    ? 'Across all events'
                    : 'This week'}
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClubDashboard;
