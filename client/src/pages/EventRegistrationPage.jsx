// pages/EventRegistrationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { events } from '../data/events';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ExternalLink,
} from 'lucide-react';

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
      <Navbar showSort={false} />

      <main
  className="
    max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
    lg:pl-[22rem]          /* push entire main column right on lg+ */
  "
>
        <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard/student')}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center space-x-2"
            >
              <span>← Back to Dashboard</span>
            </button>
          <h1 className="text-3xl font-bold mb-2">Event Registration</h1>
          <p className="text-lg text-gray-600">
            Select an event to view details and register
          </p>
        </div>

        <div className="lg:pr-8 flex flex-col gap-8">
          {/* Events List */}
          <aside
  className="
    hidden             /* hide on small screens (they’ll see stacked layout) */
    lg:block
    fixed              /* keep it pinned */
    top-[6.5rem]       /* pushes it below the navbar + page heading (~6.5 rem) */
    left-0
    w-[22rem]          /* fixed width; adjust as you like */
    h-[calc(100vh-6.5rem)]
 /* full viewport height minus navbar/header */
    overflow-y-auto
    px-4
">
  <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold">Available Events</h2>
    </div>

    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedEvent(ev);
                      setShowRegistrationForm(false);
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedEvent?.id === ev.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-semibold mb-2">{ev.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(ev.date).toLocaleDateString()}
                    </div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {ev.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Details */}
          <section className="lg:w-3/5">
            <div className="bg-white rounded-lg shadow-md">
              {selectedEvent ? (
                <>
                  <div className="relative">
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-64 object-cover"
                    />
                    {selectedEvent.isFree && (
                      <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Free
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">
                      {selectedEvent.title}
                    </h1>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        {
                          icon: Calendar,
                          label: 'Event Date',
                          val: new Date(
                            selectedEvent.date,
                          ).toLocaleDateString(),
                        },
                        {
                          icon: MapPin,
                          label: 'Venue',
                          val: selectedEvent.venue,
                        },
                        {
                          icon: Users,
                          label: 'Team Size',
                          val: selectedEvent.teamSize,
                        },
                        {
                          icon: Clock,
                          label: 'Registration Deadline',
                          val: new Date(
                            selectedEvent.deadline,
                          ).toLocaleDateString(),
                        },
                      ].map((row) => {
                        const Icon = row.icon;
                        return (
                          <div key={row.label} className="flex items-center">
                            <Icon className="w-5 h-5 mr-3 text-gray-600" />
                            <div>
                              <p className="text-sm text-gray-500">
                                {row.label}
                              </p>
                              <p className="font-medium">{row.val}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">
                        Rules & Guidelines
                      </h3>
                      <ul className="space-y-2">
                        {selectedEvent.rules.map((r, i) => (
                          <li key={i} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3" />
                            <span className="text-gray-600">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!showRegistrationForm ? (
                      <button
                        onClick={handleRegisterClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2"
                      >
                        Register Now
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">
                          Registration Form
                        </h3>
                        <p className="text-gray-600 mb-4">
                          The registration form will be loaded here as an
                          iframe.
                        </p>
                        <div className="bg-gray-100 rounded-lg p-6">
                          <p className="text-sm text-gray-500">
                            iframe src="https://registration.kecfests.edu/events/
                            {selectedEvent.id}"
                          </p>
                        </div>
                        <button
                          onClick={() => setShowRegistrationForm(false)}
                          className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
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
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select an Event</h3>
                    <p className="text-gray-500">
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
  );
}

export default EventRegistrationPage;
