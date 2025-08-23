import React from 'react';
import Navbar from '../components/Navbar';
import { CalendarDays, Users, CheckCircle, Clock } from 'lucide-react';

function ClubDetailsPage() {
  // Mock data for demonstration
  const clubDetails = {
    name: 'KEC Computer Science Club',
    description: 'The official club for Computer Science enthusiasts at KEC. We organize workshops, coding competitions, and tech talks.',
    established: '2005',
    members: 150,
    contactEmail: 'csclub@kec.edu',
    facultyAdvisor: 'Dr. Jane Doe',
  };

  const eventStats = {
    totalEventsConducted: 45,
    furtherEvents: 5,
    eventsOngoing: 2,
  };

  // Mock Calendar Data (simple representation for UI)
  const mockCalendarEvents = [
    { date: '2024-03-10', title: 'Annual Coding Challenge' },
    { date: '2024-03-15', title: 'AI/ML Workshop' },
    { date: '2024-03-22', title: 'Guest Lecture: Cloud Computing' },
    { date: '2024-04-05', title: 'Inter-college Hackathon' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{clubDetails.name}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {clubDetails.description}
            </p>
          </div>

          {/* Club Details */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Club Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-base">
              <p><strong>Established:</strong> {clubDetails.established}</p>
              <p><strong>Members:</strong> {clubDetails.members}</p>
              <p><strong>Faculty Advisor:</strong> {clubDetails.facultyAdvisor}</p>
              <p><strong>Contact Email:</strong> {clubDetails.contactEmail}</p>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CalendarDays className="w-6 h-6 mr-3 text-blue-600" />
              Upcoming Events Calendar (Mock)
            </h3>
            <div className="space-y-4 h-64 flex items-center justify-center text-gray-500 bg-white rounded-lg border border-gray-200 shadow-inner">
              <p className="text-lg">Calendar will be integrated here</p>
            </div>
          </div>

          {/* Event Statistics */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-green-600" />
              Event Statistics (Mock)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-4xl font-bold text-green-700">{eventStats.totalEventsConducted}</p>
                <p className="text-base text-green-800">Total Events Conducted</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg">
                <p className="text-4xl font-bold text-blue-700">{eventStats.furtherEvents}</p>
                <p className="text-base text-blue-800">Further Events Planned</p>
              </div>
              <div className="p-4 bg-yellow-100 rounded-lg">
                <p className="text-4xl font-bold text-yellow-700">{eventStats.eventsOngoing}</p>
                <p className="text-base text-yellow-800">Events Ongoing</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">Visual representation (charts) would go here if a charting library were integrated.</p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ClubDetailsPage;
