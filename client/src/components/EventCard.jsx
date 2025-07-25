// EventCard.jsx
import React from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import clubLogo from './clubLogo.jpg'; // ✅ Imported logo

const EventCard = ({ event, onRegister, isAuthenticated = false }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    {/* Banner */}
    <div className="relative">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-48 object-cover"
      />

      {/* Free Tag */}
      {event.isFree && (
        <span className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          Free
        </span>
      )}
    </div>

    {/* Details */}
    <div className="p-4">
      {/* Title and Club Logo in one line */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
        <img
          src={clubLogo}
          alt="Club Logo"
          className="w-8 h-8 rounded-full border border-gray-300 object-cover"
        />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>{event.teamSize}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>Deadline: {new Date(event.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {event.category}
        </span>

        <button
          onClick={() => onRegister(event)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          {isAuthenticated ? 'Register Now' : 'View Details'}
        </button>
      </div>
    </div>
  </div>
);

export default EventCard;
