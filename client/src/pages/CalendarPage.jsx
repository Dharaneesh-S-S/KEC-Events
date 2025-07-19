// pages/CalendarPage.jsx
import React from 'react';
import Navbar from '../components/Navbar';

function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSort={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Calendar</h1>
          <p className="text-lg text-gray-600">
            View event schedules, deadlines, and important dates
          </p>
        </div>

        {/* Placeholder Calendar */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Upcoming Events &amp; Deadlines
            </h2>
          </div>

          <div className="h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Google Calendar Integration
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Calendar integration will display event schedules, registration deadlines, and
                important reminders. Connect your Google Calendar to sync with KEC Fests events.
              </p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Connect Calendar
              </button>
            </div>
          </div>

          {/* Demo Event List */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            {[
              {
                label: "CODEUP'25 Registration Deadline",
                date: 'February 10, 2025',
                days: '5 days left',
                color: 'blue',
              },
              {
                label: "CODEUP'25 Event",
                date: 'February 15, 2025',
                days: '10 days away',
                color: 'green',
              },
              {
                label: 'Design Thinking Workshop',
                date: 'February 18, 2025',
                days: '13 days away',
                color: 'yellow',
              },
            ].map((ev) => (
              <div
                key={ev.label}
                className={`flex items-center justify-between p-3 bg-${ev.color}-50 rounded-lg mb-3`}
              >
                <div>
                  <h4 className="font-medium text-gray-900">{ev.label}</h4>
                  <p className="text-sm text-gray-600">{ev.date}</p>
                </div>
                <span className={`text-sm font-medium text-${ev.color}-600`}>{ev.days}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CalendarPage;
