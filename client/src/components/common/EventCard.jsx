import React, { useState } from "react";
import { Calendar, Users, Clock, User, MapPin } from "lucide-react"; // Using User as placeholder

// ImageWrapper: detects image orientation on load and enforces A4 aspect-ratio
function ImageWrapper({ posterUrl, title, isFree }) {
  const [isPortrait, setIsPortrait] = useState(false);

  const handleLoad = (e) => {
    const img = e.target;
    if (!img) return;
    const { naturalWidth: w, naturalHeight: h } = img;
    setIsPortrait(h > w);
  };

  // A4 ratios: landscape 297/210, portrait 210/297
  const aspect = isPortrait ? "210/297" : "297/210";

  return (
    <div className="relative w-full" style={{ aspectRatio: aspect }}>
      {posterUrl ? (
        <>
          <img
            src={posterUrl}
            alt={title}
            onLoad={handleLoad}
            className="w-full h-full object-cover"
          />

          {isFree && (
            <span className="absolute bottom-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
              Free
            </span>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-blue-200 flex items-center justify-center text-gray-400">No Image</div>
      )}
    </div>
  );
}

const EventCard = ({ event, onRegister, isAuthenticated = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      <div className="flex flex-col items-stretch">
        {/* Poster (top) */}
        <div className="w-full flex-shrink-0 bg-blue-100">
          {/* Enforce A4 orientations: landscape (297/210) or portrait (210/297) */}
          <ImageWrapper posterUrl={event.posters?.[0]?.url} title={event.title} isFree={event.isFree} />
        </div>

        {/* Details (below poster) */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 leading-tight flex-1 mr-3">
              {event.title}
            </h3>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2 mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-3 text-gray-500" />
              <span className="font-medium">{new Date(event.date || event.startDate).toLocaleDateString()}</span>
            </div>

            {event.venue && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                <span className="font-medium">{event.venue}</span>
              </div>
            )}

            {event.teamSize && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-3 text-gray-500" />
                <span className="font-medium">Team Size: {event.teamSize}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-medium">{event.category || "General"}</span>

            <button
              onClick={() => onRegister(event)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md transform hover:scale-105"
            >
              {isAuthenticated ? "Register Now" : "View Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
