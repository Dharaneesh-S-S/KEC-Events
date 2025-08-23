import React from 'react';
import { CalendarDays } from 'lucide-react';

function LabInchargeCalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar showSearch={false} /> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">Lab Incharge Calendar</h1>
          <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg border border-gray-200 shadow-inner">
            <p className="text-lg">Calendar integration for Lab Incharges will go here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LabInchargeCalendarPage;
