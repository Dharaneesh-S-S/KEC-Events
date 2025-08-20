// Sidebar.jsx
import React from 'react';
import { X, Plus, Settings, Bell, Home, Mail, Edit } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Venue Booking', path: '/club/venue-booking' },
    { icon: Plus, label: 'Create Events', path: '/club/create-event' },
    { icon: Edit, label: 'Manage Events', path: '/club/manage-events' },
    { icon: Bell, label: 'Notifications', path: '/club/notifications' },
    { icon: Mail, label: 'Contact', path: '/contacts' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-lg lg:border-r lg:border-gray-200
        `}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">KEC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Fests</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-6">
          <div className="space-y-3">
            {menuItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => handleNavigation(path)}
                  className={`
                    w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-left transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-semibold text-base">{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
