// pages/AnalyticsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Calendar, Award, Target } from 'lucide-react';
import Navbar from '../components/Navbar';

function AnalyticsPage() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: Calendar,
      title: 'Active Events',
      value: '3',
      description: 'Currently running',
      color: 'bg-blue-600',
      change: '+2 from last month',
    },
    {
      icon: Users,
      title: 'Total Registrations',
      value: '247',
      description: 'Across all events',
      color: 'bg-green-600',
      change: '+15% from last week',
    },
    {
      icon: Target,
      title: 'Upcoming Deadlines',
      value: '2',
      description: 'This week',
      color: 'bg-orange-600',
      change: "CODEUP'25 & HACKATHON",
    },
    {
      icon: Award,
      title: 'Completed Events',
      value: '8',
      description: 'This semester',
      color: 'bg-purple-600',
      change: '+3 from last semester',
    },
  ];

  const recentEvents = [
    { name: "CODEUP'25", registrations: 89, deadline: '2025-02-10', status: 'Active' },
    { name: 'ROBO WARS 2025', registrations: 45, deadline: '2025-02-15', status: 'Active' },
    { name: 'HACKATHON 2025', registrations: 67, deadline: '2025-02-20', status: 'Active' },
    { name: 'CULTURAL FEST 2025', registrations: 156, deadline: '2025-02-25', status: 'Planning' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSort={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/club')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center space-x-2"
          >
            <span>← Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-lg text-gray-600">Track your event performance and engagement metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <p className="text-xs text-gray-500 mb-2">{stat.description}</p>
                <p className="text-xs text-green-600 font-medium">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Event Performance Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Event Performance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Event Name', 'Registrations', 'Deadline', 'Status', 'Progress'].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEvents.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.registrations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((event.registrations / 100) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.registrations}/100 target
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Calendar,
              title: 'Create New Event',
              text: 'Start planning your next event',
              link: '/club/create-event',
              color: 'bg-blue-600',
              hover: 'bg-blue-700',
            },
            {
              icon: Users,
              title: 'Manage Events',
              text: 'Edit existing events',
              link: '/club/manage-events',
              color: 'bg-green-600',
              hover: 'bg-green-700',
            },
            {
              icon: BarChart3,
              title: 'Book Venue',
              text: 'Reserve venues for events',
              link: '/club/venue-booking',
              color: 'bg-purple-600',
              hover: 'bg-purple-700',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-lg shadow-md p-6 text-center">
                <Icon className={`w-12 h-12 text-${card.color.split('-')[1]}-600 mx-auto mb-4`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 mb-4">{card.text}</p>
                <button
                  onClick={() => navigate(card.link)}
                  className={`px-4 py-2 ${card.color} text-white rounded-lg hover:${card.hover} transition-colors`}
                >
                  {card.title.split(' ')[0]}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPage;
