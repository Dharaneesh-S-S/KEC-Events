import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ExternalLink,
  Tag,
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";

export default function EventRegistrationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeEventId } = useParams(); // route: /student/event-registration/:id
  const { user } = useAuth();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [activePoster, setActivePoster] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states for sidebar
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getPosterUrl = (posterObj) => {
    if (!posterObj) return null;
    if (typeof posterObj === "string") return posterObj;
    return posterObj.url || null;
  };

  const fetchEventById = async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/events/${id}`);
      setSelectedEvent(data);
      setActivePoster(0);

      // increment views (fire-and-forget)
      axios.patch(`/api/events/${id}/views`).catch(() => {});

      setError(null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Failed to load event");
      setSelectedEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsList = async () => {
    try {
      const { data } = await axios.get(`/api/events?limit=1000&sortBy=date&sortOrder=asc`);
      if (data?.events) setEventsList(data.events);
      else if (Array.isArray(data)) setEventsList(data);
    } catch (err) {
      console.warn("Failed to fetch events list: ", err?.message || err);
    }
  };

  useEffect(() => {
    fetchEventsList();

    if (location.state?.event) {
      setSelectedEvent(location.state.event);
      setActivePoster(0);
      if (location.state.event._id) axios.patch(`/api/events/${location.state.event._id}/views`).catch(() => {});
      setLoading(false);
    } else if (routeEventId) {
      fetchEventById(routeEventId);
    } else {
      (async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`/api/events?limit=1&sortBy=date&sortOrder=asc`);
          const first = data?.events?.[0] || (Array.isArray(data) && data[0]);
          if (first) navigate(`/student/event-registration/${first._id}`, { replace: true });
          else setLoading(false);
        } catch (err) {
          setError("Failed to load events");
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeEventId]);

  // Sidebar: filtered events
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return eventsList;
    const q = searchQuery.trim().toLowerCase();
    return eventsList.filter((ev) => {
      return (
        (ev.title && ev.title.toLowerCase().includes(q)) ||
        (ev.description && ev.description.toLowerCase().includes(q)) ||
        (Array.isArray(ev.tags) && ev.tags.join(" ").toLowerCase().includes(q))
      );
    });
  }, [eventsList, searchQuery]);

  const goToEvent = (ev) => {
    // navigate to same route with id
    navigate(`/student/event-registration/${ev._id}`);
  };

  const goToAdjacentEvent = (direction) => {
    if (!eventsList || eventsList.length === 0 || !selectedEvent) return;
    const idx = eventsList.findIndex((e) => e._id === selectedEvent._id);
    if (idx === -1) return;
    const nextIdx = direction === "next" ? (idx + 1) % eventsList.length : (idx - 1 + eventsList.length) % eventsList.length;
    const nextEvent = eventsList[nextIdx];
    if (nextEvent) {
      navigate(`/student/event-registration/${nextEvent._id}`);
    }
  };

  const nextPoster = () => {
    if (!selectedEvent?.posters || selectedEvent.posters.length <= 1) return;
    setActivePoster((p) => (p + 1) % selectedEvent.posters.length);
  };

  const prevPoster = () => {
    if (!selectedEvent?.posters || selectedEvent.posters.length <= 1) return;
    setActivePoster((p) => (p - 1 + selectedEvent.posters.length) % selectedEvent.posters.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4 h-8 w-64 bg-gray-200 rounded-md mx-auto" />
          <p className="text-gray-500">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h2 className="text-2xl font-bold mb-2">Unable to load event</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const posterUrl = selectedEvent?.posters && selectedEvent.posters.length > 0 ? getPosterUrl(selectedEvent.posters[activePoster]) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/dashboard')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Event Navigation (top-right) */}
      {selectedEvent && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2">
            <span className="text-sm font-medium text-gray-700">
              Event {eventsList.findIndex(event => event._id === selectedEvent._id) + 1 || "-"} of {eventsList.length || "-"}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => goToAdjacentEvent('prev')}
              className="p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
              title="Previous Event"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => goToAdjacentEvent('next')}
              className="p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
              title="Next Event"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Available Events</h2>
                  <p className="text-sm text-gray-600 mt-1">Select an event to view details</p>
                </div>
                <button
                  onClick={() => setSidebarCollapsed((s) => !s)}
                  className="p-2 rounded-md hover:bg-gray-100"
                  title="Toggle sidebar"
                >
                  {/* small chevron */}
                  {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, tags, description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {!filteredEvents.length ? (
                <div className="text-center py-4 text-gray-500">No events found.</div>
              ) : (
                filteredEvents.map((ev) => (
                  <div
                    key={ev._id}
                    onClick={() => goToEvent(ev)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedEvent && selectedEvent._id === ev._id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 text-base leading-tight">{ev.title}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBA'}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-medium">{ev.eventType || 'event'}</span>
                      <span className="text-xs text-gray-500">👁 {ev.views || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Registration</h1>
              <p className="text-xl text-gray-600">Register for exciting college events</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Event Details */}
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Poster Gallery */}
                <div className="relative">
                  {posterUrl ? (
                    <>
                      <img src={posterUrl} alt={selectedEvent.title} className="w-full h-96 object-cover" />

                      {selectedEvent.posters && selectedEvent.posters.length > 1 && (
                        <>
                          <button onClick={prevPoster} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all duration-200">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button onClick={nextPoster} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all duration-200">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/80 px-3 py-2 rounded-full shadow-md">
                            {selectedEvent.posters.map((_, idx) => (
                              <button key={idx} onClick={() => setActivePoster(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === activePoster ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium capitalize">{selectedEvent.eventType} Event</span>
                        <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full font-medium">👁 {selectedEvent.views || 0} views</span>
                      </div>
                      <h1 className="text-4xl font-bold mb-4 text-gray-900 leading-tight">{selectedEvent.title}</h1>
                      <p className="text-lg text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {[
                      { icon: Calendar, label: "Event Date", val: selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA' },
                      { icon: Clock, label: "Time", val: selectedEvent.time || "To be announced" },
                      { icon: MapPin, label: "Venue", val: selectedEvent.venue || 'TBA' },
                      { icon: Users, label: "Participants", val: `${selectedEvent.participantsCount || 0} registered` },
                    ].map((row) => {
                      const Icon = row.icon;
                      return (
                        <div key={row.label} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="flex-shrink-0">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">{row.label}</p>
                            <p className="text-base font-semibold text-gray-900">{row.val}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tags */}
                  {selectedEvent.tags && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-blue-600" /> Event Tags
                      </h3>

                      {(() => {
                        let cleanTags = selectedEvent.tags;

                        // If value is already array → do nothing
                        if (Array.isArray(cleanTags)) {
                          return (
                            <div className="flex flex-wrap gap-2">
                              {cleanTags.map((tag, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          );
                        }

                        // 💥 If value is string but has escaped quotes → fix it
                        if (typeof cleanTags === "string") {
                          try {
                            // Convert escaped JSON string → usable array
                            cleanTags = JSON.parse(cleanTags.replace(/\\"/g, '"'));
                          } catch {
                            // fallback: remove brackets & split by comma
                            cleanTags = cleanTags.replace(/[\[\]\s"]/g, "").split(",");
                          }
                        }

                        return (
                          <div className="flex flex-wrap gap-2">
                            {cleanTags.map((tag, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}




                  {/* Parent Event */}
                  {selectedEvent.parentEvent && (
                    <div className="mb-6 p-4 border border-gray-100 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">Part of</p>
                      <p className="font-semibold text-gray-900">{selectedEvent.parentEvent.title}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Panel */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24 h-fit">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Now</h2>
                  <p className="text-gray-600">Secure your spot for this exciting event</p>
                </div>

                {selectedEvent.formEmbedCode ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 mb-2">Registration Form (embedded)</p>
                    </div>
                    <div className="w-full h-96 rounded-xl border-2 border-gray-200 overflow-auto p-2" dangerouslySetInnerHTML={{ __html: selectedEvent.formEmbedCode }} />
                    <div className="space-y-3">
                      {selectedEvent.formLink && (
                        <a href={selectedEvent.formLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg text-center">Open Form in New Tab</a>
                      )}
                      <button onClick={() => navigate('/student/dashboard')} className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-center">Back to Events</button>
                    </div>
                  </div>
                ) : selectedEvent.formLink ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 mb-2">Registration Form</p>
                      <p className="text-xs text-gray-500">Fill out the form to complete your registration</p>
                    </div>

                    <iframe src={selectedEvent.formLink} className="w-full h-96 rounded-xl border-2 border-gray-200" title="Registration Form"></iframe>

                    <div className="space-y-3">
                      <a href={selectedEvent.formLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg text-center">Open Form in New Tab</a>
                      <button onClick={() => navigate('/student/dashboard')} className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-center">Back to Events</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Coming Soon</h3>
                    <p className="text-gray-600 mb-4">The registration form will be available soon. Please check back later.</p>
                    <button onClick={() => navigate('/student/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200">Browse Other Events</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
