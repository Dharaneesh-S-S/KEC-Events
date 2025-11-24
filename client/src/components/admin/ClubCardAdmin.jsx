import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Image,
  Mail,
  Phone,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const ClubCardAdmin = ({ club = {}, onEdit, onDelete, showActions = true }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(club);
    } else {
      navigate(`/admin/manage-clubs/edit/${club._id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(club._id);
    } else if (window.confirm(`Are you sure you want to delete ${club.name}?`)) {
      // Default delete behavior
      console.log('Delete club:', club._id);
    }
  };

  const handleView = () => {
    navigate(`/clubs/${club.slug}`);
  };

  const defaultClub = {
    name: 'Unnamed Club',
    description: 'No description available',
    logoUrl: '/default-club-logo.png',
    gallery: [],
    contactInfo: [],
    owner: { name: 'Unknown Owner' },
    createdAt: new Date(),
    eventsCount: 0,
    membersCount: 0
  };

  const clubData = { ...defaultClub, ...club };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Club Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={clubData.logoUrl}
              alt={clubData.name}
              className="w-12 h-12 rounded-lg object-cover bg-gray-200"
              onError={(e) => {
                e.target.src = '/default-club-logo.png';
              }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{clubData.name}</h3>
              <p className="text-sm text-gray-500 truncate">
                by {clubData.owner?.name || 'Unknown'}
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="relative">
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {clubData.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{clubData.membersCount || 0} members</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{clubData.eventsCount || 0} events</span>
            </div>
            <div className="flex items-center">
              <Image className="w-4 h-4 mr-1" />
              <span>{clubData.gallery?.length || 0} photos</span>
            </div>
          </div>
        </div>

        {/* Contact Info Preview */}
        {clubData.contactInfo && clubData.contactInfo.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Primary Contact</h4>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="w-3 h-3 mr-2" />
                <span className="truncate">{clubData.contactInfo[0].email}</span>
              </div>
              {clubData.contactInfo[0].phone && (
                <div className="flex items-center text-xs text-gray-600">
                  <Phone className="w-3 h-3 mr-2" />
                  <span>{clubData.contactInfo[0].phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-gray-400 mb-4">
          Created {clubData.createdAt ? new Date(clubData.createdAt).toLocaleDateString() : 'Unknown'}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={handleView}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete Club"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Gallery Preview */}
      {clubData.gallery && clubData.gallery.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Gallery Preview</h4>
            <div className="grid grid-cols-3 gap-2">
              {clubData.gallery.slice(0, 3).map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
              {clubData.gallery.length > 3 && (
                <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                  +{clubData.gallery.length - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubCardAdmin;