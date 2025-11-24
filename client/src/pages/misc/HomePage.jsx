// src/pages/misc/HomePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import EventCard from "../../components/common/EventCard";
import { eventAPI } from "../../services/eventService";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEvents({});
      setEvents(response.data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Derived filtered + sorted list
  const filteredAndSortedEvents = useMemo(() => {
    let data = events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.category && ev.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (sortBy) {
      data.sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(a.date || a.startDate) - new Date(b.date || b.startDate);
          case "category":
            return (a.category || "").localeCompare(b.category || "");
          case "popularity":
            return (a.title || "").localeCompare(b.title || "");
          default:
            return 0;
        }
      });
    }

    return data;
  }, [events, searchQuery, sortBy]);

  const handleRegister = (event) => {
    if (isAuthenticated) navigate(`/student/event-registration/${event._id}`);
    else navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearchQuery} onSort={setSortBy} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Welcome to KEC Fests
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover and participate in exciting events at Kongu Engineering College
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event._id || event.id}
              event={{ ...event, _id: event._id || event.id }}
              onRegister={handleRegister}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>

        {/* No Results Message */}
        {!filteredAndSortedEvents.length && !loading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">
                No events match your current search criteria. Try adjusting your search or
                filters.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
