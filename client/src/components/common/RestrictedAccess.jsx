// src/components/common/RestrictedAccess.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const RestrictedAccess = () => {
  const { user, devMode, switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page. This area is restricted to specific user roles.
        </p>
        
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            Current role: <span className="font-semibold capitalize">{user?.role}</span>
          </p>
          {devMode && (
            <p className="text-xs text-blue-600 mt-1">
              🔧 Development Mode: You can switch roles to test access
            </p>
          )}
        </div>

        {devMode && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Switch Role (Dev Mode):</p>
            <div className="flex gap-2 justify-center">
              {['student', 'club', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`px-3 py-2 text-xs font-medium rounded-md capitalize ${
                    user?.role === role
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestrictedAccess;