// pages/EventRegistrationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { events } from '../data/events';
import { Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react';

function EventRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  /* ---------- Init select ---------- */
  useEffect(() => {
    const id = searchParams.get('selected');
    if (id) {
      const e = events.find((ev) => ev.id === id);
      if (e) setSelectedEvent(e);
    }
  }, [searchParams]);

  const handleRegisterClick = () => setShowRegistrationForm(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/student')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Go Back to Dashboard"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <Navbar showSort={false} />

      <div className="flex pt-16">
        {/* Events Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Available Events</h2>
              <p className="text-sm text-gray-600 mt-1">Select an event to view details</p>
            </div>

            <div className="p-4 space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setShowRegistrationForm(false);
                  }}
                  className={`
                    p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                    ${
                      selectedEvent?.id === ev.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50'
                    }
                  `}
                >
                  <h3 className="font-semibold text-gray-900 mb-3 text-base leading-tight">{ev.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {new Date(ev.date).toLocaleDateString()}
                  </div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-medium">
                    {ev.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-3 text-gray-900">Event Registration</h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Select an event to view details and register
              </p>
            </div>

            {/* Event Details */}
            <section className="w-full">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {selectedEvent ? (
                  <>
                    {/* Banner */}
                    <div className="relative">
                      <img
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        className="w-full h-80 object-cover"
                      />
                      {selectedEvent.isFree && (
                        <span className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          Free
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
                        {selectedEvent.title}
                      </h1>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {[
                          { icon: Calendar, label: 'Event Date', val: new Date(selectedEvent.date).toLocaleDateString() },
                          { icon: MapPin, label: 'Venue', val: selectedEvent.venue },
                          { icon: Users, label: 'Team Size', val: selectedEvent.teamSize },
                          { icon: Clock, label: 'Registration Deadline', val: new Date(selectedEvent.deadline).toLocaleDateString() },
                        ].map((row) => {
                          const Icon = row.icon;
                          return (
                            <div key={row.label} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                              <div className="flex-shrink-0">
                                <Icon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">{row.label}</p>
                                <p className="text-lg font-semibold text-gray-900">{row.val}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Description */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">{selectedEvent.description}</p>
                      </div>

                      {/* Rules */}
                      <div className="mb-10">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Rules & Guidelines</h3>
                        <ul className="space-y-3">
                          {selectedEvent.rules.map((r, i) => (
                            <li key={i} className="flex items-start space-x-3">
                              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700 leading-relaxed text-base">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Register Button / Form */}
                      {!showRegistrationForm ? (
                        <button
                          onClick={handleRegisterClick}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl flex items-center justify-center space-x-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <span>Register Now</span>
                          <ExternalLink className="w-6 h-6" />
                        </button>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Registration Form</h3>
                          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                            The registration form will be loaded here as an iframe.
                          </p>
                          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                            <p className="text-sm text-gray-500 font-mono">
                              iframe src="https://registration.kecfests.edu/events/{selectedEvent.id}"
                            </p>
                          </div>
                          <button
                            onClick={() => setShowRegistrationForm(false)}
                            className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 font-semibold transition-all duration-200"
                          >
                            Back to Details
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Select an Event</h3>
                      <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                        Choose an event from the list to view details and register
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EventRegistrationPage;
