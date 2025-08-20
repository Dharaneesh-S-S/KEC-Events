// ContactCard.jsx
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactCard = ({ contact }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200">
    {/* Header with Image and Basic Info */}
    <div className="flex items-start space-x-4 mb-6">
      <img
        src={contact.image}
        alt={contact.name}
        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{contact.name}</h3>
        <p className="text-base text-blue-600 font-semibold">{contact.designation}</p>
      </div>
    </div>

    {/* Contact Details */}
    <div className="space-y-4">
      <div className="flex items-center text-sm text-gray-600 group hover:text-gray-900 transition-colors duration-200">
        <Phone className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
        <span className="font-medium">{contact.phone}</span>
      </div>

      <div className="flex items-center text-sm text-gray-600 group hover:text-gray-900 transition-colors duration-200">
        <Mail className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
        <span className="font-medium">{contact.email}</span>
      </div>

      <div className="flex items-center text-sm text-gray-600 group hover:text-gray-900 transition-colors duration-200">
        <MapPin className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
        <span className="font-medium">{contact.cabin}</span>
      </div>
    </div>
  </div>
);

export default ContactCard;
