// src/components/common/DevModeIndicator.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DevModeIndicator = () => {
  const { user, switchRole } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">🔧 DEV MODE</span>
        <span className="capitalize">({user?.role})</span>
        <div className="flex gap-1">
          {['student', 'club', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`px-2 py-1 text-xs rounded ${
                user?.role === role
                  ? 'bg-white text-yellow-600'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevModeIndicator;