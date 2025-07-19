// ContactCard.jsx
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactCard = ({ contact }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
    <div className="flex items-center space-x-4 mb-4">
      <img
        src={contact.image}
        alt={contact.name}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div>
        <h3 className="text-lg font-bold text-gray-900">{contact.name}</h3>
        <p className="text-sm text-blue-600 font-medium">{contact.designation}</p>
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center text-sm text-gray-600">
        <Phone className="w-4 h-4 mr-2" />
        <span>{contact.phone}</span>
      </div>

      <div className="flex items-center text-sm text-gray-600">
        <Mail className="w-4 h-4 mr-2" />
        <span>{contact.email}</span>
      </div>

      <div className="flex items-center text-sm text-gray-600">
        <MapPin className="w-4 h-4 mr-2" />
        <span>{contact.cabin}</span>
      </div>
    </div>
  </div>
);

export default ContactCard;
