// pages/ClubDashboard.jsx
import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Bell,
  Mail,
  MapPin,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar'; // Add this import

function ClubDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
      {/* Sidebar removed */}

      <div className="flex-1 lg:ml-0">
        <Navbar
          showBackButton={false}
          showSearch={false} // Set to false to hide the search bar
        /> {/* Use the shared Navbar component */}

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32"> {/* Add pt-24 for padding */}
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Club Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Welcome back, {user?.name}! Manage your club events and activities.
            </p>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 justify-center">
            {actionButtons.slice(0, 5).map((btn, index) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.path}
                  onClick={() => navigate(btn.path)}
                  className={`${btn.color} text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left ${
                    index >= 3 ? 'md:col-span-1' : '' // Center last two items if it's a 2-column layout
                  }`}
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

          {/* Event Stats Section (Removed as per user request) */}
          {/* The content of this section, including Active Events, Total Registrations, and Upcoming Deadlines cards, has been removed. */}

        </main>
      </div>
    </div>
  );
}

export default ClubDashboard;
