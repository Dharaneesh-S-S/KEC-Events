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
                {/* Back Button */}
                <button
                  onClick={() => navigate('/')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 mr-2"
                  title="Go Back to Home"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>

                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <Menu className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">KEC</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Fests</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/calendar')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Calendar"
                >
                  <Bell className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigate('/contacts')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Contacts"
                >
                  <Mail className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-blue-600 font-semibold text-lg">
                      {user?.name?.[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                    {user?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-12 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Club Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
              Welcome back, {user?.name}! Manage your club events and activities.
            </p>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {actionButtons.slice(0, 5).map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.path}
                  onClick={() => navigate(btn.path)}
                  className={`${btn.color} text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left`}
                >
                  <div className="flex items-start space-x-5">
                    <Icon className="w-12 h-12 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold mb-3 leading-tight">{btn.title}</h3>
                      <p className="text-base opacity-90 leading-relaxed">{btn.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Active Events', value: 3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
              { label: 'Total Registrations', value: 247, color: 'text-green-600', bgColor: 'bg-green-50' },
              { label: 'Upcoming Deadlines', value: 2, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bgColor} p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {stat.label}
                </h3>
                <p className={`text-5xl font-bold ${stat.color} mb-3`}>{stat.value}</p>
                <p className="text-base text-gray-600 leading-relaxed">
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
