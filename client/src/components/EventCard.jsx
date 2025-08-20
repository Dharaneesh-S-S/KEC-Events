// EventCard.jsx
import React from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import clubLogo from './clubLogo.jpg'; // ✅ Imported logo

const EventCard = ({ event, onRegister, isAuthenticated = false }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
    {/* Banner */}
    <div className="relative">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-48 object-cover"
      />

      {/* Free Tag */}
      {event.isFree && (
        <span className="absolute bottom-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
          Free
        </span>
      )}
    </div>

    {/* Details */}
    <div className="p-6">
      {/* Title and Club Logo */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 leading-tight flex-1 mr-3">{event.title}</h3>
        <img
          src={clubLogo}
          alt="Club Logo"
          className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover shadow-sm flex-shrink-0"
        />
      </div>

      {/* Event Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-3 text-gray-500" />
          <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-3 text-gray-500" />
          <span className="font-medium">Team Size: {event.teamSize}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-3 text-gray-500" />
          <span className="font-medium">Deadline: {new Date(event.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-medium">
          {event.category}
        </span>

        <button
          onClick={() => onRegister(event)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md transform hover:scale-105"
        >
          {isAuthenticated ? 'Register Now' : 'View Details'}
        </button>
      </div>
    </div>
  </div>
);

export default EventCard;
